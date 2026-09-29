// The module answers every ticket under its local port all, over the files a
// case seeds through the fake index. A group's standing comes off its record,
// a child reads its group's, and a loose ticket carries none.
// [[spec/tickets/tickets-becomes-a-module]]
package tickets

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const routedGroup = `---
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

// The time a seeded file last changed, which a ticket carries. [[spec/tickets/tickets-becomes-a-module]]
const seededAt = int64(1700000000000000000)

func child(group, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\ngroup: " + group +
		"\nprocess: [[spec/processes/trivial]]\nstep: do\ntodo: true\nsteps:\n  - name: do\n---\n\n# Ask\n\nOne piece of it.\n\n# do\n\n# Discussion\n"
}

func file(text string) q.Content {
	return q.Content{Hash: "h", Text: text, Changed: seededAt}
}

// The five tickets, a note of another kind, and two ticket-kind notes outside the two folders. [[spec/tickets/tickets-becomes-a-module]]
func ticketTree() map[string]any {
	return map[string]any{
		"files/spec/tickets/one-group.md":              file(routedGroup),
		"files/spec/tickets/a-child.md":                file(child("one-group", "open")),
		"files/spec/tickets/old-group.md":              file(doneGroup),
		"files/.se/tickets/an-old-child.md":            file(child("old-group", "closed")),
		"files/spec/tickets/a-loose-one.md":            file("---\nkind: ticket\nstate: open\nsteps:\n  - name: do\n---\n\n# Ask\n\nA ticket in no group.\n\n# Discussion\n"),
		"files/spec/tickets/a-note.md":                 file("---\nkind: [[note]]\n---\n\nNo ticket.\n"),
		"files/spec/tickets/nested/deeper.md":          file(child("one-group", "open")),
		"files/.se/wt/drawing/spec/tickets/a-child.md": file(child("one-group", "open")),
		"files/spec/tickets/gone.md":                   q.Content{},
	}
}

func allSeeded(t *testing.T) map[string]Ticket {
	t.Helper()
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(ticketTree())
	said, ok := index.Run(AllPort).([]Ticket)
	if !ok {
		t.Fatalf("%s reads %#v", AllPort, index.Read(AllPort))
	}
	out := map[string]Ticket{}
	for _, one := range said {
		out[one.Name] = one
	}
	return out
}

func TestAllStandsUnderItsLocalPort(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if got, ok := index.Run(AllPort).([]Ticket); !ok || len(got) != 0 {
		t.Fatalf("%s reads %#v with no file", AllPort, index.Read(AllPort))
	}
}

// A ticket-kind note stands only directly under spec/tickets or .se/tickets, and a note of another kind is no ticket. [[spec/design_output/index#the-index-answers-the-tickets]]
func TestAllAnswersEveryTicketWithItsFields(t *testing.T) {
	rows := allSeeded(t)
	if len(rows) != 5 {
		t.Fatalf("five tickets stand, and all answers %d: %v", len(rows), rows)
	}
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
	if rows["a-loose-one"].Step != "do" || rows["a-loose-one"].Route != "" {
		t.Fatalf("a ticket naming no step reads its first leaf, and one naming no route answers none, and reads %+v", rows["a-loose-one"])
	}
}

// The work tab draws the progress off this row. [[spec/design_output/index#the-index-answers-the-tickets]]
func TestATicketRowCarriesTheProgressOfItsRoute(t *testing.T) {
	rows := allSeeded(t)
	if rows["one-group"].Progress != "1/2" {
		t.Fatalf("a group past sync and holding children reads 1/2, and reads %q", rows["one-group"].Progress)
	}
	if rows["a-child"].Progress != "0/1" {
		t.Fatalf("a child with no record reads 0/1, and reads %q", rows["a-child"].Progress)
	}
}

// [[spec/design_output/index#the-index-answers-the-tickets]]
func TestATicketCarriesTheTimeItsFileLastChanged(t *testing.T) {
	if got := allSeeded(t)["a-child"].Changed; got != seededAt {
		t.Fatalf("the ticket carries the time its file changed, %d, and reads %d", seededAt, got)
	}
}

// [[spec/design_output/work#held-derives-from-the-record]]
func TestAStandingReadsOffTheGroupsRecordThroughTheTicket(t *testing.T) {
	rows := allSeeded(t)
	if rows["one-group"].Standing != StandingHeld {
		t.Fatalf("a record entry carrying hash_before and no hash_after holds the group, and it stands at %q", rows["one-group"].Standing)
	}
	if rows["a-child"].Standing != StandingHeld {
		t.Fatalf("a child stands where its group's branch stands, and it stands at %q", rows["a-child"].Standing)
	}
	if rows["old-group"].Standing != StandingDone || rows["an-old-child"].Standing != StandingDone {
		t.Fatal("a closed group stands done, and its child with it")
	}
	if rows["a-loose-one"].Standing != "" {
		t.Fatalf("a ticket in no group carries no standing, and reads %q", rows["a-loose-one"].Standing)
	}
}

// The codec writes a note back byte for byte, a front with line endings of two bytes among them. [[spec/tickets/tickets-becomes-a-module]]
func TestTheMarkdownCodecRoundTripsANote(t *testing.T) {
	for _, text := range []string{routedGroup, "no front\n", "---\nkind: ticket\n", "---\r\nkind: ticket\r\n---\r\n\r\n# Ask\r\n"} {
		note, err := Markdown.Parse([]byte(text))
		if err != nil {
			t.Fatal(err)
		}
		back, _ := Markdown.Serialize(note)
		if string(back) != text {
			t.Fatalf("%q writes back as %q", text, back)
		}
	}
	if note, _ := Markdown.Parse([]byte("---\r\nkind: ticket\r\n---\r\nbody")); word(note.Front().Get("kind")) != ticketKind || note.Body != "body" {
		t.Fatalf("the note reads %+v", note)
	}
}
