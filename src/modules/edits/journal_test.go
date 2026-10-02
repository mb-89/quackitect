// The journal names its entries by time, and an undo walks past another name.
// [[spec/tickets/edit-tools-answer-in-go]]
package edits

import "testing"

// [[spec/tickets/edit-tools-answer-in-go]]
func TestNewestOnWalksPastAnotherName(t *testing.T) {
	files := []EntryFile{{File: "a.txt"}}
	entries := map[string]Entry{
		"1.json": {On: "mine", Files: files},
		"2.json": {On: "yours", Files: files},
	}
	if name, _, ok := NewestOn([]string{"2.json", "1.json"}, entries, "mine"); !ok || name != "1.json" {
		t.Errorf("the newest of mine reads %s, %v", name, ok)
	}
	if name, _, ok := NewestOn([]string{"1.json", "2.json"}, entries, ""); !ok || name != "2.json" {
		t.Errorf("the newest of any name reads %s, %v", name, ok)
	}
	if got := NameOf("2026-09-30T22:21:45.734Z"); got != "20260930222145734000.json" {
		t.Errorf("the entry's name reads %s", got)
	}
}
