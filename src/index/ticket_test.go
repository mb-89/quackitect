// The tickets, over a tree a case writes. A group's standing comes off its
// record, a child reads its group's, and a loose ticket carries none.
// [[spec/guidance/code/testing]]
package main

import (
	"testing"
)

const heldGroup = `---
kind: [[ticket]]
state: open
urgent: true
process: [[spec/processes/group]]
step: children
steps:
  - name: sync
    does: takes trunk into the branch
  - name: children
    by: children
record:
  - step: sync
    hand: box one
    hash_before: aaa
    hash_after: bbb
  - step: children
    hand: box one
    hash_before: bbb
---

# Ask

<!-- goal, as text: what these tickets add up to -->
Two tickets that land as one.

# children

# Discussion
`

const doneGroup = `---
kind: [[ticket]]
state: closed
process: [[group]]
record:
  - step: children
    hash_before: ccc
    hash_after: ddd
---

# Ask

A group already landed.

# Discussion
`

func child(group, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\ngroup: " + group +
		"\nprocess: [[spec/processes/trivial]]\nstep: do\ntodo: true\nsteps:\n  - name: do\n---\n\n# Ask\n\nOne piece of it.\n\n# do\n\n# Discussion\n"
}

func ticketTree(t *testing.T) string {
	t.Helper()
	root := tree(t)
	write(t, root, "spec/tickets/one-group.md", heldGroup)
	write(t, root, "spec/tickets/a-child.md", child("one-group", "open"))
	write(t, root, "spec/tickets/old-group.md", doneGroup)
	write(t, root, "spec/tickets/an-old-child.md", child("old-group", "closed"))
	write(t, root, "spec/tickets/a-loose-one.md", "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\n---\n\n# Ask\n\nA ticket in no group.\n\n# Discussion\n")
	return root
}

func byName(said []Ticket) map[string]Ticket {
	out := map[string]Ticket{}
	for _, one := range said {
		out[one.Name] = one
	}
	return out
}

// [[spec/design_output/index#the-index-answers-the-tickets]]
func TestTheIndexAnswersEveryTicketWithItsFields(t *testing.T) {
	db := opened(t, ticketTree(t))
	said, err := Tickets(db)
	if err != nil {
		t.Fatal(err)
	}
	if len(said) != 5 {
		t.Fatalf("five tickets stand, and the index answers %d", len(said))
	}
	rows := byName(said)
	group := rows["one-group"]
	if group.Route != "group" || group.Step != "children" || !group.Urgent || group.State != "open" {
		t.Fatalf("the group answers its fields, and reads %+v", group)
	}
	if group.Says != "Two tickets that land as one." {
		t.Fatalf("the ask's first line stands past the mint's comment, and reads %q", group.Says)
	}
	held := rows["a-child"]
	if held.Group != "one-group" || held.Route != "trivial" || !held.Todo || held.Path != "spec/tickets/a-child.md" {
		t.Fatalf("a child answers its fields, and reads %+v", held)
	}
	if rows["a-loose-one"].Step != "" || rows["a-loose-one"].Route != "" {
		t.Fatalf("a ticket naming no step and no route answers neither, and reads %+v", rows["a-loose-one"])
	}
}

// [[spec/design_output/index#the-index-answers-the-tickets]]
func TestATicketCarriesTheTimeItsFileLastChanged(t *testing.T) {
	db := opened(t, ticketTree(t))
	said, err := Tickets(db)
	if err != nil {
		t.Fatal(err)
	}
	held := byName(said)["a-child"]
	if held.Changed == 0 {
		t.Fatal("a ticket carries the time its file last changed, and this one carries none")
	}
	var stored int64
	if err := db.QueryRow(`SELECT mtime FROM file WHERE path = ?`, held.Path).Scan(&stored); err != nil {
		t.Fatal(err)
	}
	if held.Changed != stored {
		t.Fatalf("the ticket carries the mtime the file table stores, %d, and reads %d", stored, held.Changed)
	}
}

// [[spec/design_output/work#held-derives-from-the-record]]
func TestAStandingReadsOffTheGroupsRecordThroughTheTicket(t *testing.T) {
	db := opened(t, ticketTree(t))
	said, err := Tickets(db)
	if err != nil {
		t.Fatal(err)
	}
	rows := byName(said)
	if rows["one-group"].Standing != standingHeld {
		t.Fatalf("a record entry carrying hash_before and no hash_after holds the group, and it stands at %q", rows["one-group"].Standing)
	}
	if rows["a-child"].Standing != standingHeld {
		t.Fatalf("a child stands where its group's branch stands, and it stands at %q", rows["a-child"].Standing)
	}
	if rows["old-group"].Standing != standingDone || rows["an-old-child"].Standing != standingDone {
		t.Fatal("a closed group stands done, and its child with it")
	}
	if rows["a-loose-one"].Standing != "" {
		t.Fatalf("a ticket in no group carries no standing, and reads %q", rows["a-loose-one"].Standing)
	}
}

// [[spec/design_output/work#held-derives-from-the-record]]
// A todo names the row the ticket stands before, or reads true, and either lights the flag. [[spec/design_output/pull#the-queue-is-an-outline]]
func TestATodoNamingARowLightsTheFlag(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]bool{"true": true, "a-loose-one": true, `"a-loose-one"`: true, "false": false, "": false} {
		if todoIn(said) != want {
			t.Fatalf("todo %q reads %v", said, want)
		}
	}
}

func TestAGroupNobodyHoldsStandsAtTodo(t *testing.T) {
	if heldIn("state: open\nrecord:\n  - step: sync\n    hash_before: aaa\n    hash_after: bbb\n") {
		t.Fatal("an entry with both hashes holds nothing")
	}
	if heldIn("state: open\nsteps:\n  - name: do\n") {
		t.Fatal("a ticket with no record holds nothing")
	}
	if !heldIn("record:\n  - step: sync\n    hash_before: aaa\nurgent: true\n") {
		t.Fatal("an open entry holds the group, whatever key follows the record")
	}
	if groupStanding("open", "steps:\n  - name: do\n") != standingTodo {
		t.Fatal("a group nobody holds stands at todo")
	}
}
