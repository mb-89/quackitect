package main

import (
	"strings"
	"testing"
)

// The marks git writes, built here so this file carries none of its own. [[spec/design_output/work#no-commit-carries-a-marker]]
var (
	gitOpens = strings.Repeat("<", 7) + " HEAD"
	gitParts = strings.Repeat("=", 7)
	gitShuts = strings.Repeat(">", 7) + " origin/main"
)

// [[spec/design_output/work#no-commit-carries-a-marker]]
func TestAFileCarryingConflictMarkersDrawsTheFindingAtTheOpener(t *testing.T) {
	text := strings.Join([]string{"---", "state: open", gitOpens, "record: []", gitParts, "cloud: true", gitShuts, "---", ""}, "\n")
	one := onlyOne(t, noConflictMarkers(fakeTree(map[string]string{"spec/tickets/a-group.md": text})), conflictMarkers)
	if one.File != "spec/tickets/a-group.md" || one.Line != 3 {
		t.Errorf("the finding names %s:%d", one.File, one.Line)
	}
	if !strings.Contains(one.Message, "3 conflict marker") {
		t.Errorf("the message counts no marks: %s", one.Message)
	}
}

// A setext underline and a file outside the watched folders pass. [[spec/design_output/work#no-commit-carries-a-marker]]
func TestASetextUnderlineAndAFileOutsideTheFoldersPass(t *testing.T) {
	marked := strings.Join([]string{gitOpens, gitParts, gitShuts}, "\n")
	tree := fakeTree(map[string]string{
		"spec/design_output/a-note.md": "A heading\n" + gitParts + "\n\nText.\n",
		"prototype/old.md":             marked,
	})
	if found := noConflictMarkers(tree); len(found) != 0 {
		t.Fatalf("the rule answers %v", found)
	}
}
