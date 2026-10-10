// A gate's reject: the phase before the gate goes in again as copies, each
// named for its round, so every round keeps its own evidence. From the second
// reject on, a person step goes in before the copies, off pull-gate.js.
// [[spec/design_output/pull#the-gate]]
package pull

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/yaml"
)

// The reject count past which a person step goes in. [[spec/design_output/pull#the-gate]]
const rejectsBeforePerson = 2

// A copy an earlier round inserts, or a person step, which a reject copies nothing of. [[spec/design_output/pull#the-gate]]
var copied = regexp.MustCompile(`(-\d+$)|(^person$)`)

// [[spec/design_output/pull#the-gate]]
func (it *It) rejected(who *Who, one *Held, leaf *Leaf, held Hold, reason string, findings []Finding, answered []Answered) int {
	if leaf.Final && it.acceptCapped(one, leaf) {
		return it.acceptAsks(who, one, leaf, held, reason, answered)
	}
	if children := childrenStepOf(one.Front); children != "" {
		return it.rejectedToChildren(who, one, leaf, held, reason, findings, answered, children)
	}
	round := returnsOf(one.Front, leaf.Path) + 1
	after := ""
	if !one.Private {
		after = it.tipOf()
	}
	one.Text = withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", after),
		pair("returns", round), pair("why", reason), pair("answered", answeredRows(answered)))
	first, names := it.reworked(one, leaf.Path, round)
	if first == "" {
		it.Refuse(failure.Raise(it.Failures, "pull-reject-no-phase", leaf.Path+" stands after no phase, so a reject puts nothing in again."))
		return 1
	}
	changes := []string{"rejects at " + leaf.Path, "inserts " + strings.Join(names, ", ")}
	if round >= rejectsBeforePerson {
		if person := it.withPersonStep(one, first, fmt.Sprintf("%s rejects %d times: %s", leaf.Path, round, reason), nil); person != "" {
			changes = append(changes, "asks "+person)
		}
	}
	if finding := it.landed(one, changes, nil); finding != "" {
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, why := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(why)
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s %s.", one.Name, strings.Join(changes, ", "))}, why...))
}

// The step a group waits on its children at, or nothing on a route holding none. [[spec/tickets/gate-findings-reach-the-queue]]
func childrenStepOf(front *yaml.Doc) string {
	for _, step := range WalkOf(front) {
		if yaml.AsString(step.Said.Get("by")) == "children" {
			return step.Path
		}
	}
	return ""
}

// A group's reject mints a child a finding row and goes back to its children step, copying nothing, so every reject takes the same road. A row naming no child refuses the reject, and the hold stands. [[spec/tickets/gate-findings-reach-the-queue]]
func (it *It) rejectedToChildren(who *Who, one *Held, leaf *Leaf, held Hold, reason string, findings []Finding, answered []Answered, children string) int {
	if faults := it.findingFaults(Verdict{Findings: findings}, leaf.Path); len(faults) > 0 {
		return it.refused(who, one, leaf, held, faults)
	}
	built, names, why := it.childrenOf(one, leaf, findings, map[string]any{"state": Open})
	if why != "" {
		return it.unminted(one, leaf, why)
	}
	after := ""
	if !one.Private {
		after = it.tipOf()
	}
	text := withEntry(one.Text, pair("step", leaf.Path), pair("hand", RoleOf(who.Hand)), pair("hash_before", held.Hash), pair("hash_after", after),
		pair("returns", returnsOf(one.Front, leaf.Path)+1), pair("why", reason), pair("answered", answeredRows(answered)))
	one.Text = withField(withField(text, "step", children), "state", Open)
	wrote := it.wroteChildren(built)
	changes := []string{"rejects at " + leaf.Path, "mints " + strings.Join(names, ", "), "returns to " + children}
	if finding := it.landed(one, changes, wrote); finding != "" {
		for _, at := range wrote {
			it.remove(at)
		}
		return it.unlanded(one, leaf, finding)
	}
	it.dropHold(who.Hand)
	ok, said := it.sentOut(one, who.Branch)
	if !ok {
		return it.refusedPush(said)
	}
	return it.onward(who, append([]string{fmt.Sprintf("%s %s.", one.Name, strings.Join(changes, ", "))}, said...))
}

// The phase a gate closes is the step before it. Its leaves go in again at its end, each named for the next round, and a leaf a condition holds, a person step or an earlier copy stays out. [[spec/design_output/pull#the-gate]]
func (it *It) reworked(one *Held, gatePath string, round int) (string, []string) {
	steps := cloneList(yaml.Flat(FrontOf(one.Text).Get("steps")))
	parts := strings.Split(gatePath, "/")
	var holder *yaml.Doc
	list := steps
	for _, part := range parts[:len(parts)-1] {
		var phase *yaml.Doc
		for _, held := range list {
			if each := yaml.AsDoc(held); each != nil && yaml.AsString(each.Get("name")) == part {
				phase = each
				break
			}
		}
		if phase == nil {
			return "", nil
		}
		holder, list = phase, yaml.Flat(phase.Get("steps"))
		phase.Set("steps", list)
	}
	at := -1
	for i, held := range list {
		if each := yaml.AsDoc(held); each != nil && yaml.AsString(each.Get("name")) == parts[len(parts)-1] {
			at = i
			break
		}
	}
	if at <= 0 {
		return "", nil
	}
	before := yaml.AsDoc(list[at-1])
	if before == nil {
		return "", nil
	}
	_, nested := before.Get("steps").([]any)
	prefix := append([]string{}, parts[:len(parts)-1]...)
	pool := []any{before}
	if nested {
		prefix = append(prefix, yaml.AsString(before.Get("name")))
		pool = yaml.Flat(before.Get("steps"))
	}
	originals := []*yaml.Doc{}
	for _, held := range pool {
		each := yaml.AsDoc(held)
		if each == nil || each.Get("steps") != nil || each.Get("when") != nil || copied.MatchString(yaml.AsString(each.Get("name"))) {
			continue
		}
		originals = append(originals, each)
	}
	if len(originals) == 0 {
		return "", nil
	}
	copies := []*yaml.Doc{}
	named, pathed := map[string]string{}, map[string]string{}
	for _, held := range originals {
		copy := cloneValue(held).(*yaml.Doc)
		copy.Set("name", fmt.Sprintf("%s-%d", yaml.AsString(held.Get("name")), round+1))
		copies = append(copies, copy)
		from, to := yaml.AsString(held.Get("name")), yaml.AsString(copy.Get("name"))
		named[from] = to
		pathed[strings.Join(append(append([]string{}, prefix...), from), "/")] = strings.Join(append(append([]string{}, prefix...), to), "/")
	}
	for _, copy := range copies {
		if copy.Has("input") {
			copy.Set("input", rewired(copy.Get("input"), named, pathed))
		}
	}
	insert := make([]any, 0, len(copies))
	isCopy := map[*yaml.Doc]bool{}
	for _, copy := range copies {
		insert = append(insert, copy)
		isCopy[copy] = true
	}
	if nested {
		before.Set("steps", append(yaml.Flat(before.Get("steps")), insert...))
	} else {
		list = append(list[:at], append(insert, list[at:]...)...)
		if holder == nil {
			steps = list
		} else {
			holder.Set("steps", list)
		}
	}
	readsBoth(steps, isCopy, pathed)
	text := one.Text
	if put := it.reRouted(one.Text, steps, ""); put != "" {
		text = put
	}
	first := strings.Join(append(append([]string{}, prefix...), yaml.AsString(copies[0].Get("name"))), "/")
	one.Text = withField(withField(text, "step", first), "state", Open)
	names := []string{}
	for _, copy := range copies {
		names = append(names, yaml.AsString(copy.Get("name")))
	}
	return first, names
}

// A copy reads the copies of its own round, in place of the leaves they copy. [[spec/design_output/pull#the-gate]]
func rewired(input any, named, pathed map[string]string) any {
	list, isList := input.([]any)
	if !isList {
		list = []any{input}
	}
	out := make([]any, 0, len(list))
	for _, one := range list {
		said := yaml.AsString(one)
		if to, ok := named[said]; ok {
			out = append(out, to)
		} else if to, ok := pathed[said]; ok {
			out = append(out, to)
		} else {
			out = append(out, one)
		}
	}
	if isList {
		return out
	}
	return out[0]
}

// A step reading a copied leaf by path reads its copy beside it, so every round keeps a reader. [[spec/design_output/pull#the-gate]]
func readsBoth(list []any, copies map[*yaml.Doc]bool, pathed map[string]string) {
	for _, one := range list {
		held := yaml.AsDoc(one)
		if held == nil {
			continue
		}
		if !copies[held] && held.Has("input") && held.Get("input") != nil {
			reads := yaml.StringsOf(held.Get("input"))
			more := []string{}
			for _, read := range reads {
				if to, ok := pathed[read]; ok && !contains(reads, to) {
					more = append(more, to)
				}
			}
			if len(more) > 0 {
				held.Set("input", stringsAny(append(reads, more...)))
			}
		}
		if steps, ok := held.Get("steps").([]any); ok {
			readsBoth(steps, copies, pathed)
		}
	}
}
