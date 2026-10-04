// The final acceptance: a gate carrying final waits on the work under it,
// reads the diff since its last verdict, and closes onto a question past its
// cap, off src/scripts/pull-accept.js.
// [[spec/design_output/pull#the-final-acceptance]]
package pull

import (
	"fmt"
	"strings"

	"quackitect/src/yaml"
)

// The routes a final gate reads: a group's, and the question's a capped one closes onto. [[spec/design_output/pull#the-final-acceptance]]
const (
	groupRoute    = "group"
	questionRoute = "question"
	redWord       = "assertion"
	greenWord     = "green"
)

// The open tickets naming this one as parent or group, as a reason to wait, or nothing where none stands open. [[spec/design_output/pull#the-final-acceptance]]
func acceptWaits(one *Held, all []*Held) string {
	open := []string{}
	for _, held := range all {
		if held.Name == one.Name || FieldOf(held.Text, "state") == Closed {
			continue
		}
		if FieldOf(held.Text, "parent") == one.Name || FieldOf(held.Text, GroupField) == one.Name {
			open = append(open, held.Name)
		}
	}
	if len(open) == 0 {
		return ""
	}
	return "waits for " + strings.Join(open, ", ") + ", which the acceptance reads"
}

// The commit the diff starts at: the last verdict's tip, else a group's merge base with trunk, else the first take. [[spec/design_output/pull#the-final-acceptance]]
func (it *It) acceptBase(one *Held, leaf *Leaf) string {
	entries := recordIn(one.Text)
	last := ""
	for _, entry := range entries {
		if yaml.AsString(entry.Get("step")) == leaf.Path && strings.TrimSpace(yaml.AsString(entry.Get("hash_after"))) != "" {
			last = strings.TrimSpace(yaml.AsString(entry.Get("hash_after")))
		}
	}
	if last != "" {
		return last
	}
	if strings.Contains(FieldOf(one.Text, "process"), groupRoute) {
		if said := it.Git.Run("merge-base", "origin/"+Trunk, "HEAD"); said.OK {
			return strings.TrimSpace(said.Out)
		}
	}
	for _, entry := range entries {
		if before := strings.TrimSpace(yaml.AsString(entry.Get("hash_before"))); before != "" {
			return before
		}
	}
	return ""
}

// The rows the hand-out carries at a final gate. [[spec/design_output/pull#the-final-acceptance]]
func (it *It) acceptRows(one *Held, leaf *Leaf) []string {
	diff := "the whole diff of the ticket"
	if base := it.acceptBase(one, leaf); base != "" {
		diff = fmt.Sprintf("the diff since %s, merges and all: git diff %s..HEAD", base, base)
	}
	return []string{"", fmt.Sprintf("Read %s. The hand-back runs every command field of the leaves before this gate.", diff)}
}

// Whether this verdict short of accept passes the cap the fail reads. [[spec/design_output/pull#the-final-acceptance]]
func (it *It) acceptCapped(one *Held, leaf *Leaf) bool {
	return it.Fails > 0 && returnsOf(FrontOf(one.Text), leaf.Path)+1 > it.Fails
}

// Past the cap a question ticket carries the verdict to a person, and the process closes became onto it. [[spec/design_output/pull#the-final-acceptance]]
func (it *It) acceptAsks(who *Who, one *Held, leaf *Leaf, held Hold, reason string, answered []Answered) int {
	route, why := ProcessAt(it.methodDisk(), questionRoute)
	if why != "" {
		return it.unminted(one, leaf, why)
	}
	name := one.Name + "-question"
	path := Tickets + "/" + name + ".md"
	round := returnsOf(FrontOf(one.Text), leaf.Path) + 1
	text, why := it.RoutedTicket(path, route, FromHold(route.Route, one.Name, leaf.Path),
		fmt.Sprintf("%s of %s falls short of accept %d times: %s", leaf.Path, one.Name, round, reason), map[string]any{"state": Open, "parent": one.Name})
	if why != "" {
		return it.unminted(one, leaf, name+" mints nothing: "+why)
	}
	_ = it.Disk.Write(path, text)
	return it.became(who, one, leaf, held, name, answered, more{changes: []string{"mints " + name}, wrote: []string{path}})
}

// Every command field the leaves before the gate hold a line under, run as the leaf's own run does. A red pass reruns expecting its cases green. [[spec/design_output/pull#the-final-acceptance]]
func (it *It) routeRun(one *Held, leaf *Leaf, faults *[]string) []Answered {
	at := len(leaf.Leaves)
	for i, other := range leaf.Leaves {
		if other.Path == leaf.Path {
			at = i
			break
		}
	}
	out := []Answered{}
	for _, other := range leaf.Leaves[:at] {
		chapter := ChapterOf(one.Text, other.Path)
		evidence := []*yaml.Doc{}
		for _, item := range yaml.Flat(other.Said.Get("evidence")) {
			field := yaml.AsDoc(item)
			if field == nil || fieldWord(field, "form") != "command" {
				continue
			}
			if rows := chapter.Fields[fieldWord(field, "name")]; len(rows) == 0 || strings.TrimSpace(rows[0]) == "" {
				continue
			}
			if fieldWord(field, "expects") == redWord {
				field = cloneValue(field).(*yaml.Doc)
				field.Set("expects", greenWord)
			}
			evidence = append(evidence, field)
		}
		if len(evidence) == 0 {
			continue
		}
		for _, ran := range it.commandsRun(other.Path, evidence, chapter, faults) {
			ran.Name = other.Path + "/" + ran.Name
			out = append(out, ran)
		}
	}
	return out
}
