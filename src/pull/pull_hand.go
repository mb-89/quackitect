// Which tickets stand, which of them a hand takes, and who takes which leaf:
// the offer, the hold, and the rules a hand meets on its way to one, off
// src/scripts/pull-hand.js and writesHere in lib/ticket.js.
// [[spec/design_output/pull#the-hand-out]]
package pull

import (
	"fmt"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/modules/check"
	"quackitect/src/modules/queue"
	"quackitect/src/yaml"
)

// The trunk a desk works on, and the process a draft opens itself on. [[spec/design_output/work#a-desk-works-on-trunk]]
const (
	floatBits = 64
	decimal   = 10
	Trunk     = "main"
	trivial   = "trivial"
	helper    = "helper"
	spawn     = "spawn"
)

// The schemas a pull reads the ticket's shape off. [[spec/design_output/pull#the-checks]]
type Schemas func() *check.Kinds

var (
	personStep = regexp.MustCompile(`^person(-\d+)?$`)
	bareAsks   = regexp.MustCompile(`^\s+asks: [^"'].*: `)
)

// Who a pull speaks for: the hand, the hand without the owner's word, the branch, the group, the hold, whether one step alone, and the ticket a name asks for. [[spec/design_output/pull#the-hand-out]]
type Who struct {
	Hand, PlainHand, Branch, Group string
	Held                           *Hold
	OneStep                        bool
	Wanted                         string
	// PastDue hands one leaf past the due mark, after a handover the pull refuses. [[spec/tickets/the-clear-hands-back-the-leaf]]
	PastDue bool
}

// What an offer answers: the leaf a hand takes, why it takes none, and a leaf another hand takes. [[spec/design_output/pull#what-a-hand-out-reads]]
type offered struct {
	leaf, other *Leaf
	why         string
}

// The todo a front carries: nothing, first where it stands as a bare tag, or the name of the row it stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
func todoOf(front *yaml.Doc) string {
	said := front.Get("todo")
	if said == nil || said == false || yaml.AsString(said) == "false" {
		return ""
	}
	if said == true || strings.TrimSpace(yaml.AsString(said)) == "true" {
		return "first"
	}
	return strings.TrimSpace(yaml.AsString(said))
}

// The tickets one waits for, a list or one line. [[spec/design_output/work#the-mark-and-what-waits]]
func dependsOn(front *yaml.Doc) []string {
	out := []string{}
	for _, one := range yaml.Flat(front.Get("depends_on")) {
		for _, part := range strings.Split(yaml.AsString(one), ",") {
			part = strings.TrimSpace(part)
			part = strings.TrimSuffix(strings.TrimPrefix(part, "["), "]")
			part = strings.Trim(part, `"'`)
			if part = strings.TrimSpace(part); part != "" {
				out = append(out, part)
			}
		}
	}
	return out
}

// A trivial draft opens at the pull, since it waits on no person. [[spec/design_output/pull#a-draft-opens]]
func agentOpens(text string) bool {
	process := FieldOf(text, "process")
	return text != "" && FieldOf(text, "state") == Draft && process[strings.LastIndex(process, "/")+1:] == trivial
}

// The hand a step asks of, and what the asking hand is. [[spec/tickets/the-one-answer-takes-shape]]
type handRule struct{ helper, agent, ownerSays, cloud, atRetro bool }

// Whether a hand works a leaf, answered once so the pull and the write door agree. [[spec/tickets/the-one-answer-takes-shape]]
func writesHere(leaf *Leaf, hand handRule) (bool, string, bool) {
	switch {
	case leaf.By == Person && hand.agent && !hand.ownerSays && !hand.cloud:
		return false, "waits for a person at " + leaf.Path, true
	case leaf.By == "agent" && !hand.agent:
		return false, "waits for an agent at " + leaf.Path, false
	case leaf.By == helper && !hand.helper:
		return false, "waits for a hand the engine spawns at " + leaf.Path, false
	case leaf.By == "children":
		return false, "waits for its own children at " + leaf.Path, false
	case leaf.By == "retro" && !hand.atRetro:
		return false, "waits for a hand at a retro step, at " + leaf.Path, false
	}
	return true, "", false
}

// The hand the one answer reads: who this is, and what the group stands at. [[spec/tickets/the-one-answer-takes-shape]]
func (it *It) handRule(front *yaml.Doc, all []*Held, group string, helping bool) handRule {
	return handRule{helper: helping, agent: it.Agent, ownerSays: it.OwnerSays, cloud: it.Cloud, atRetro: todoOf(front) != "" || atRetro(all, group)}
}

func atRetro(all []*Held, group string) bool {
	for _, one := range all {
		if !one.Private && one.Name == group {
			return strings.HasPrefix(yaml.AsString(one.Front.Get("step")), "retro")
		}
	}
	return false
}

// The tickets as pointers, so a walk that writes one shows the next read the change. [[spec/design_output/pull#what-a-hand-out-reads]]
func (it *It) ticketsHere() []*Held {
	out := []*Held{}
	for _, one := range TicketsHere(it.Disk) {
		held := one
		out = append(out, &held)
	}
	return out
}

// The tickets a tag parks for the next pull. On a group's branch a ticket naming another group stays out, so a gate's points in one group jump no other group's queue. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
func taggedIn(list []*Held, group string) []*Held {
	out := []*Held{}
	for _, one := range list {
		named := FieldOf(one.Text, GroupField)
		if todoOf(one.Front) != "" && (group == "" || named == "" || named == group) {
			out = append(out, one)
		}
	}
	return out
}

// The tagged tickets a work branch takes: its group's children and the private notes, so a tagged ticket of another group waits for its own branch. [[spec/tickets/cloud-question-check-leaves-readstext]]
func taggedHere(tagged, children []*Held) []*Held {
	out := []*Held{}
	for _, one := range tagged {
		if one.Private || slices.Contains(children, one) {
			out = append(out, one)
		}
	}
	return out
}

// The score orders the queue, off the queue module's one decider. [[spec/design_output/pull#the-queue-is-a-score]]
func (it *It) sorted(list, all []*Held) []*Held {
	rows := func(from []*Held) []queue.Row {
		out := make([]queue.Row, 0, len(from))
		for _, one := range from {
			fails := 0
			for _, entry := range entriesOf(one.Front) {
				if number, _ := strconv.ParseFloat(yaml.AsString(entry.Get("returns")), floatBits); number > 0 {
					fails++
				}
			}
			out = append(out, queue.Row{Name: one.Name, Path: one.Path, Urgent: FieldOf(one.Text, "urgent") == "true", DependsOn: dependsOn(one.Front), Fails: fails})
		}
		return out
	}
	at := queue.At{Weights: map[string]float64{"block": it.Weights.Block, "day": it.Weights.Day, "fail": it.Weights.Fail}, Stood: it.stoodHere()}
	if it.Now != nil {
		at.Now = it.Now().UnixMilli()
	}
	byPath := map[string]*Held{}
	for _, one := range list {
		byPath[one.Path] = one
	}
	out := []*Held{}
	for _, row := range queue.Queued(rows(list), rows(all), at) {
		out = append(out, byPath[row.Path])
	}
	return out
}

// When each ticket came in, off one git log over the folder holding them. [[spec/design_output/pull#the-queue-is-a-score]]
func (it *It) stoodHere() map[string]int64 {
	out := map[string]int64{}
	said := it.Git.Run("log", "--diff-filter=A", "--format=%ct", "--name-only", "--", Tickets)
	if !said.OK {
		return out
	}
	var when int64
	for _, row := range strings.Split(said.Out, "\n") {
		line := strings.TrimSpace(row)
		if line == "" {
			continue
		}
		if number, err := strconv.ParseInt(line, decimal, floatBits); err == nil {
			when = number
			continue
		}
		if _, ok := out[line]; !ok {
			out[line] = when
		}
	}
	return out
}

// The children stand before their group, the group's own ticket after them, and the notes last. [[spec/design_output/pull#what-a-hand-out-reads]]
func (it *It) handOut(who *Who) int {
	it.repairPersonSteps(who)
	all := it.ticketsHere()
	// A session due takes the clear's tickets once the ticket in hand stands done, and a helper takes none. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
	if who.Wanted == "" && !who.OneStep && !who.PastDue && it.Disk.Exists(due) {
		return it.dueHandOut(who, all)
	}
	var groupTicket *Held
	for _, one := range all {
		if !one.Private && one.Name == who.Group {
			groupTicket = one
			break
		}
	}
	tagged := taggedIn(all, who.Group)
	isTagged := map[*Held]bool{}
	for _, one := range tagged {
		isTagged[one] = true
	}
	privates := []*Held{}
	for _, one := range all {
		if one.Private && !isTagged[one] {
			privates = append(privates, one)
		}
	}
	own := []*Held{}
	if groupTicket != nil {
		own = []*Held{groupTicket}
	}
	notes := it.sorted(privates, all)
	late := [][]*Held{own, notes}
	if atRetro(all, who.Group) {
		late = [][]*Held{notes, own}
	}
	var pools [][]*Held
	if who.Group != "" {
		children := heldChildren(all, who.Group)
		pools = append([][]*Held{taggedHere(tagged, children), it.sorted(children, all)}, late...)
	} else {
		pools = [][]*Held{tagged, it.sorted(freeIn(all), all), notes}
		it.cutForGroups(all)
	}
	if who.Wanted != "" {
		for i, pool := range pools {
			kept := []*Held{}
			for _, one := range pool {
				if one.Name == who.Wanted {
					kept = append(kept, one)
				}
			}
			pools[i] = kept
		}
	}
	why := []string{}
	var other *offered
	var otherOne *Held
	for _, pool := range pools {
		for _, found := range pool {
			one := found
			if agentOpens(found.Text) {
				opened, refusal := it.openedHere(found, all)
				if refusal != "" {
					why = append(why, found.Name+" "+refusal)
					continue
				}
				one = opened
			}
			said := it.offer(who, one, all)
			if said.leaf != nil {
				return it.handed(who, one, said.leaf)
			}
			if said.why != "" {
				why = append(why, one.Name+" "+said.why)
			}
			if said.other != nil && other == nil {
				other, otherOne = &said, one
			}
		}
		if other != nil && !who.OneStep {
			return it.spawnAnswer(otherOne, other.other, other.why)
		}
	}
	// A person's step waits under its reason, and an empty queue hands the cleanup. [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
	if who.Wanted == "" && len(why) == 0 {
		if rows := it.cleanupOf(); rows != nil {
			it.Say(cleanup, rows...)
			return 0
		}
	}
	if len(why) == 0 {
		if who.Wanted == "" {
			why = []string{"no ticket of this group stands open"}
		} else {
			why = []string{who.Wanted + " stands nowhere here, or it stands closed"}
		}
	}
	it.Say(Wait, why...)
	return 0
}

// The public tickets under the group, as pointers. [[spec/design_output/pull#children-before-their-group]]
func heldChildren(all []*Held, group string) []*Held {
	plain := make([]Held, 0, len(all))
	for _, one := range all {
		plain = append(plain, *one)
	}
	names := map[string]bool{}
	for _, one := range ChildrenOf(plain, group) {
		names[one.Path] = true
	}
	out := []*Held{}
	for _, one := range all {
		if names[one.Path] {
			out = append(out, one)
		}
	}
	return out
}

// A trivial draft the pull meets opens through the verb's road, and stands in the reading as open from there. [[spec/design_output/pull#a-draft-opens]]
func (it *It) openedHere(one *Held, all []*Held) (*Held, string) {
	step, refusal := it.OpensDraft(one.Path)
	if refusal != "" {
		return nil, "stands a trivial draft the pull cannot open: " + refusal
	}
	it.Println(fmt.Sprintf("%s opens at %s, because a trivial draft waits on no person.", one.Path, step))
	text, _ := it.Disk.Read(one.Path)
	one.Text, one.Front = text, FrontOf(text)
	return one, ""
}

// Whether a hand takes a leaf of the ticket now. [[spec/design_output/pull#done-leaves-no-takeable-step]]
func (it *It) takeable(one *Held, all []*Held, group string) bool {
	front := FrontOf(one.Text)
	if yaml.AsString(front.Get("state")) != Open && !agentOpens(one.Text) {
		return false
	}
	for _, dep := range dependsOn(front) {
		if !it.closedHere(all, dep) {
			return false
		}
	}
	leaf := LeafOf(front, StepPathOf(front))
	if leaf == nil || (leaf.Final && acceptWaits(one, all) != "") || blessWait(one, leaf) != "" {
		return false
	}
	if writes, _, _ := writesHere(leaf, it.handRule(front, all, group, it.Agent)); !writes {
		return false
	}
	for _, need := range leaf.Needs {
		if !holdsVerb(need) {
			return false
		}
	}
	return true
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
func (it *It) offer(who *Who, one *Held, all []*Held) offered {
	state := FieldOf(one.Text, "state")
	if state == Closed {
		return offered{}
	}
	if state != Open {
		if state == "" {
			return offered{why: "stands with no state"}
		}
		return offered{why: "stands " + state}
	}
	if one.Name != who.Group {
		open := []string{}
		for _, dep := range dependsOn(one.Front) {
			if !it.closedHere(all, dep) {
				open = append(open, dep)
			}
		}
		if len(open) > 0 {
			return offered{why: "waits for " + strings.Join(open, ", ")}
		}
	}
	leaf, why := it.advanced(it.readAgain(one), all)
	if why != "" {
		return offered{why: why}
	}
	if leaf == nil {
		return offered{}
	}
	if leaf.Final {
		if why := acceptWaits(one, all); why != "" {
			return offered{why: why}
		}
	}
	if why := blessWait(one, leaf); why != "" {
		return offered{why: why}
	}
	return it.admits(who, one, leaf, all)
}

// [[spec/design_output/pull#children-before-their-group]]
func (it *It) closedHere(all []*Held, dep string) bool {
	for _, one := range all {
		if one.Name == dep {
			return FieldOf(one.Text, "state") == Closed
		}
	}
	said := it.Git.Run("show", "origin/"+Trunk+":"+Tickets+"/"+dep+".md")
	return !said.OK || FieldOf(said.Out, "state") == Closed
}

// The walk past every leaf a condition skips, a kept red leaf, or a children step whose children all stand closed, to the leaf a hand takes. [[spec/design_output/pull#a-condition-skips-a-leaf]]
func (it *It) advanced(one *Held, all []*Held) (*Leaf, string) {
	text, front := one.Text, one.Front
	path := StepPathOf(front)
	moved := false
	changes := []string{}
	for guard := 0; guard < mostMoves; guard++ {
		leaf := LeafOf(front, path)
		if leaf == nil {
			if path == "" {
				path = "no step"
			}
			return nil, "stands at " + path + ", which its route lacks"
		}
		holds, why := it.holdsHere(leaf.When, text)
		var kept entryPairs
		if holds {
			kept = it.keptRed(text, leaf, one.Name)
		}
		switch {
		case !holds:
			text = withEntry(text, pair("step", leaf.Path), pair("skipped", true), pair("why", why))
			changes = append(changes, "skips "+leaf.Path)
		case kept != nil:
			text = withEntry(text, kept...)
			changes = append(changes, "keeps "+leaf.Path)
		case leaf.By == "children":
			said := childrenSay(all, one.Name)
			if len(said.dropped) > 0 {
				back := target(leaf, leaf.OnFail)
				text = withEntry(text, pair("step", leaf.Path), pair("hand", Engine), pair("returns", returnsOf(front, leaf.Path)+1), pair("why", strings.Join(said.dropped, ", ")+" closed dropped"))
				changes = append(changes, leaf.Path+" fails back to "+back)
				moved, front, path = true, FrontOf(text), back
				continue
			}
			if len(said.open) > 0 {
				busy := []string{}
				for _, name := range said.open {
					for _, child := range all {
						if !child.Private && child.Name == name && it.takeable(child, all, "") {
							busy = append(busy, name)
							break
						}
					}
				}
				if len(busy) > 0 {
					return nil, "waits for " + strings.Join(busy, ", ") + ", which a hand can take"
				}
				return nil, "waits for " + strings.Join(said.open, ", ")
			}
			tip := it.tipOf()
			text = withEntry(text, pair("step", leaf.Path), pair("hand", Engine), pair("hash_before", tip), pair("hash_after", tip))
			changes = append(changes, "passes "+leaf.Path)
		default:
			if moved {
				one.Text = withField(text, "step", path)
				one.Front = FrontOf(one.Text)
				it.landedAlone(one, changes)
			}
			return leaf, ""
		}
		moved, front = true, FrontOf(text)
		if leaf.At+1 >= len(leaf.Leaves) {
			one.Text = shut(text, front, Done)
			one.Front = FrontOf(one.Text)
			it.landedAlone(one, append(changes, "closes "+Done))
			return nil, ""
		}
		path = leaf.Leaves[leaf.At+1].Path
	}
	return nil, "loops in its route"
}

// [[spec/design_output/pull#the-hand-rule]]
func (it *It) admits(who *Who, one *Held, leaf *Leaf, all []*Held) offered {
	if writes, why, _ := writesHere(leaf, it.handRule(one.Front, all, who.Group, who.OneStep)); !writes {
		// A box carrying a harness spawns the hand a helper leaf waits for. [[spec/tickets/the-spawn-answers-a-helper]]
		if leaf.By == helper && it.Agent {
			return offered{why: why, other: leaf}
		}
		return offered{why: why}
	}
	lacking := []string{}
	for _, need := range leaf.Needs {
		if !holdsVerb(need) {
			lacking = append(lacking, need)
		}
	}
	if len(lacking) > 0 {
		return offered{why: "needs " + strings.Join(lacking, ", ") + ", which this box lacks"}
	}
	if other := excludes(one.Front, leaf, who.Hand); other != "" {
		return offered{why: other, other: leaf}
	}
	return offered{leaf: leaf}
}

// The round a reject names a copy by, which a not keyword reads past. [[spec/design_output/pull#the-hand-rule]]
var round = regexp.MustCompile(`-\d+$`)

// Why the leaf waits for a hand other than this one, where its not names a step this hand wrote. [[spec/design_output/pull#the-hand-rule]]
func excludes(front *yaml.Doc, leaf *Leaf, hand string) string {
	if leaf.Not == "" {
		return ""
	}
	holder := leaf.Entry
	named, ok := EntryNamed(leaf.Walk, leaf.Not, &holder)
	if !ok {
		return ""
	}
	paths := map[string]bool{}
	for _, one := range leaf.Walk {
		if one.Path == named.Path || strings.HasPrefix(one.Path, named.Path+"/") {
			paths[one.Path] = true
		}
	}
	wrote := false
	for _, entry := range entriesOf(front) {
		if paths[round.ReplaceAllString(yaml.AsString(entry.Get("step")), "")] && !truthy(yaml.AsString(entry.Get("skipped"))) {
			wrote = true
			if yaml.AsString(entry.Get("hand")) == RoleOf(hand) {
				return fmt.Sprintf("waits for a hand other than %s, which wrote %s", hand, named.Path)
			}
		}
	}
	_ = wrote
	return ""
}

// The hand takes the leaf: the hold, the notes it reads, and the answer. [[spec/design_output/pull#the-work-answer]]
func (it *It) handed(who *Who, one *Held, leaf *Leaf) int {
	hash := ""
	if !one.Private {
		hash = it.tipOf()
	}
	reads := it.readsOf(it.notesOf(one.Text, leaf))
	it.noteRows(leaf.Path, reads)
	hold := Hold{Ticket: one.Name, Path: one.Path, Step: leaf.Path, By: leaf.By, Group: who.Group, Hand: who.Hand, Hash: hash, Taken: it.Stamp(), Reads: reads}
	return it.printPart(hold, it.workAnswer(one, leaf))
}
