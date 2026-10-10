// A staged diff reads as the added lines, each by its file and line.
// [[spec/tickets/staged-adds-drop-the-tab]]
package git_test

import (
	"testing"

	"quackitect/src/modules/git"
)

// Git ends a +++ path holding a space with a tab, and the added line names the file without it. [[spec/tickets/staged-adds-drop-the-tab]]
func TestAStagedPathWithASpaceReadsWithoutItsTab(t *testing.T) {
	got := git.AddsIn("diff --git a/a b.txt b/a b.txt\n+++ b/a b.txt\t\n@@ -0,0 +3 @@\n+<<<<<<< HEAD\n")
	if len(got) != 1 || got[0].File != "a b.txt" || got[0].Line != 3 {
		t.Fatalf("the adds read %+v", got)
	}
}
