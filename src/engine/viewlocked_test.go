package main

import (
	"strings"
	"testing"
)

// THE PANE ANSWER SAYS WHICH CELLS ARE NOT AN EDIT, AND WHY, from the one place
// that rules on an edit. The editor drew this from a list of its own naming
// eight properties, so a property renamed in the engine left the editor
// offering an edit the engine refused.
func TestARefusedColumnIsLockedOnTheAnswer(t *testing.T) {
	t.Parallel()
	b := Base{Display: map[string]string{}, Opens: map[string]bool{"title": true}}
	v := View{Name: "work", Order: []string{"title", "status", "blocked", "file.name"}}
	got, err := Render(b, v, nil)
	if err != nil {
		t.Fatal(err)
	}
	if _, locked := got.Locked["title"]; locked {
		t.Fatalf("title is a person's to type and the answer locked it: %q", got.Locked["title"])
	}
	if !strings.Contains(got.Locked["status"], "moved by a pull") {
		t.Fatalf("status is locked with %q", got.Locked["status"])
	}
	if !strings.Contains(got.Locked["blocked"], "does not write") {
		t.Fatalf("a column nothing writes is locked with %q", got.Locked["blocked"])
	}
	if !strings.Contains(got.Locked["file.name"], "a move") {
		t.Fatalf("a file column is locked with %q", got.Locked["file.name"])
	}
	// THE ANSWER AND THE WRITE AGREE, because they are one ruling.
	var tok Token
	err = WriteFieldBy(&tok, "status", "done", "person")
	if err == nil || err.Error() != got.Locked["status"] {
		t.Fatalf("the write refuses with %v and the answer says %q", err, got.Locked["status"])
	}
}

// AND THE REASON IS WRITTEN FOR THE PERSON HOVERING THE CELL.
//
// refusedByHand ends in a default addressed to whoever calls WriteFieldBy:
// this program does not write "subs". Three columns a person can put in a view
// fell through to it, so the tooltip on a locked cell was the compiler's
// sentence. The editor's own list, deleted when this ruling moved into the
// engine, said the engine decides this for seq and type, and a list is edited
// in the note for subs.
//
// blocked still falls through, and should: it is a column nothing knows, and
// the default is the true answer for one of those. What is asked here is that
// a field the engine does know is answered in words.
func TestALockedColumnSaysWhyToAPerson(t *testing.T) {
	t.Parallel()
	for _, field := range []string{"seq", "type", "subs"} {
		why := refusedByHand(field, "person")
		if why == "" {
			t.Fatalf("%s is not locked, so the page offers an edit the engine refuses", field)
		}
		if strings.Contains(why, "this program does not write") {
			t.Fatalf("%s falls through to the default, and a person hovering it reads %q", field, why)
		}
	}
	// AND EACH SAYS THE THING THAT IS TRUE OF IT, rather than all three sharing
	// one sentence that fits none of them.
	for field, want := range map[string]string{
		"seq":  "the engine's",
		"type": "the engine's",
		"subs": "edited in the note",
	} {
		if why := refusedByHand(field, "person"); !strings.Contains(why, want) {
			t.Fatalf("%s is locked with %q, which does not say %q", field, why, want)
		}
	}
}
