// The fixtures the ported done, fix and held cases share: the group of
// test/level0/work-doors.js, its children, and a tree with the group pushed
// on its own work branch.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"fmt"
	"strings"

	"quackitect/src/front"
)

// The group of work-doors.js: a sync step, then its children. [[spec/tickets/work-verbs-port-to-go]]
const pcGroupNote = `---
kind: [[ticket]]
state: open
urgent: true
process: [[group]]
steps:
  - name: sync
    does: takes trunk into the branch
  - name: children
    by: children
---

# Ask

Two tickets that land as one.

# sync

# children

# Discussion

Nothing yet.
`

// The group name every ported case works, and the box id the hand carries. [[spec/tickets/work-verbs-port-to-go]]
const (
	pcGroup = "one-group"
	pcBoxID = "d462e994b4cef"
)

// A ticket at an agent step, in the group and state named, as CHILD in work-doors.js writes it. [[spec/tickets/work-verbs-port-to-go]]
func pcChild(group, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\ngroup: " + group + "\nsteps:\n  - name: do\n    does: makes the change the ask names\n---\n\n# Ask\n\nOne piece of it.\n\n# do\n\n# Discussion\n\nNothing yet.\n"
}

// An open agent ticket in no group. [[spec/tickets/work-verbs-port-to-go]]
func pcLoose() string { return strings.Replace(pcChild("", "open"), "group: \n", "", 1) }

// A ticket on the person route, in the group named or in none. [[spec/tickets/work-verbs-port-to-go]]
func pcPersonChild(group string) string {
	text := pcChild(group, "open")
	if group == "" {
		text = strings.Replace(text, "group: \n", "", 1)
	}
	text = strings.Replace(text, "steps:\n", "process: [[spec/processes/person]]\nsteps:\n", 1)
	return strings.Replace(text, "    does: makes", "    by: person\n    does: makes", 1)
}

// A loose question at a person step, off the person route. [[spec/tickets/work-verbs-port-to-go]]
const pcLoosePerson = `---
kind: [[ticket]]
state: open
step: ask
steps:
  - name: ask
    does: asks the owner a question
    by: person
---

# Ask

A question for the owner.

# ask

# Discussion

Nothing yet.
`

// A take row on the sync step: the hand and the hash before, with no hash_after. [[spec/tickets/work-verbs-port-to-go]]
func pcTake(text, hand, before string) string {
	return withEntry(text, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: hand}, {Key: "hash_before", Value: before}})
}

// The group held by box 3f9a and standing at its children. [[spec/tickets/work-verbs-port-to-go]]
func pcAtChildren() string {
	return withField(pcTake(pcGroupNote, "box 3f9a", "a1b2c3"), "step", "children")
}

// The group with the retro on its route, held, and standing at its children. [[spec/tickets/work-verbs-port-to-go]]
func pcRetroGroup() string {
	retro := strings.Join([]string{
		"  - name: children",
		"    by: children",
		"  - name: retro",
		"    steps:",
		"      - name: notes",
		"        does: decides every private note on the box",
		"      - name: write",
		"        does: writes the retro over the box's own window",
		"      - name: cloud",
		"        does: names what the box lacked, met and leaves for a person",
		"        when: cloud",
		"",
	}, "\n")
	text := strings.Replace(pcGroupNote, "  - name: children\n    by: children\n", retro, 1)
	return withField(pcTake(text, "box 3f9a", "a1b2c3"), "step", "children")
}

// The text with each retro leaf named written in the record. [[spec/tickets/work-verbs-port-to-go]]
func pcWritten(text string, leaves ...string) string {
	for _, leaf := range leaves {
		text = withEntry(text, front.Ordered{{Key: "step", Value: "retro/" + leaf}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "c4d5e6"}, {Key: "hash_after", Value: "c4d5e6"}})
	}
	return text
}

// A tree with main carrying the main files, work/one-group pushed with the branch files, and the box on that branch. [[spec/tickets/work-verbs-port-to-go]]
func pcOnGroup(one *tree, files map[string]string) *tree {
	one.t.Helper()
	one.branch(pcGroup, files)
	one.git("switch", "-q", "-c", workBranch+pcGroup, "origin/"+workBranch+pcGroup)
	return one
}

// Writes the check stamp green on HEAD. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcGreen() {
	one.t.Helper()
	one.write(map[string]string{checkStamp: fmt.Sprintf(`{"sha":"%s","ok":true,"clean":true,"warnings":0}`, one.git("rev-parse", "HEAD"))})
}

// What a verb printed on both streams. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcSaid() string { return one.out.String() + one.errs.String() }

// A ticket's text on the disk of the clone. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcTicket(name string) string { return one.read(ticketAt(name)) }

// A ref's commit, or nothing where none stands. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcTip(ref string) string { return one.d.quiet("rev-parse", "--verify", "-q", ref).Out }

// Writes the box id this clone carries, and answers the role its hand holds. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcHand() string {
	one.write(map[string]string{boxFile: `{"id":"` + pcBoxID + `"}`})
	return roleOf(one.d.handOf())
}

// Fails where the text holds the line. [[spec/tickets/work-verbs-port-to-go]]
func pcLacks(one *tree, text, line string) {
	one.t.Helper()
	if strings.Contains(text, line) {
		one.t.Fatalf("%q holds %q", text, line)
	}
}

// Fails where the ticket's field reads other than the value. [[spec/tickets/work-verbs-port-to-go]]
func pcField(one *tree, name, key, want string) {
	one.t.Helper()
	if said := fieldOf(one.pcTicket(name), key); said != want {
		one.t.Fatalf("%s reads %s %q, and the case wants %q", name, key, said, want)
	}
}
