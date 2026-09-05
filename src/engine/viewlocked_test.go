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
