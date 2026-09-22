package main

import (
	"strings"
	"testing"
)

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func TestAPointerAtAHeadingTheNoteLacksDrawsWithItsLineAndAnchor(t *testing.T) {
	t.Parallel()
	tree := fixture(t, map[string]string{
		"spec/design_output/note.md": "# Scope\n\nThe note.\n\n# The door holds\n\nA chapter.\n",
		"src/one.js": strings.Join([]string{
			"// [[spec/design_output/note#the-door-holds]]",
			"// [[spec/design_output/note#the-door-opens]]",
			"// [[spec/design_output/gone#the-door-holds]]",
			"",
		}, "\n"),
	})

	found := anchorFaults(tree, "src/one.js")
	if len(found) != 1 {
		t.Fatalf("the check draws %d finding(s), and one pointer reaches nothing: %+v", len(found), found)
	}
	one := found[0]
	if one.Rule != DeadAnchor || one.File != "src/one.js" || one.Line != 2 {
		t.Fatalf("the finding names %s at %s:%d, and the dead pointer stands on line two", one.Rule, one.File, one.Line)
	}
	if !strings.Contains(one.Message, "the-door-opens") {
		t.Fatalf("the message names no anchor: %s", one.Message)
	}
}

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func TestTheSweepDrawsADeadAnchorInANoteAndInCode(t *testing.T) {
	t.Parallel()
	tree := fixture(t, map[string]string{
		"spec/design_output/note.md":  "# The door holds\n\nA chapter.\n",
		"spec/design_output/other.md": "# Scope\n\nSee [[spec/design_output/note#the-door-holds]] and [[spec/design_output/note#nothing]].\n",
		"src/one.go":                  "// [[spec/design_output/note#nothing]]\npackage main\n",
	})
	found := anchorSweep(tree)
	if names(found, DeadAnchor) != 2 {
		t.Fatalf("the sweep draws %d, and two pointers reach nothing: %+v", names(found, DeadAnchor), found)
	}
}

// The check reads the raw row, so a pointer inside a code span draws the same as one in prose. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func TestAPointerInsideACodeSpanDrawsTheSame(t *testing.T) {
	t.Parallel()
	tree := fixture(t, map[string]string{
		"spec/design_output/note.md": "# The door holds\n\nA chapter.\n",
		"spec/other.md":              "Write `[[spec/design_output/note#nothing]]` and the check reads it.\n",
	})
	if names(anchorFaults(tree, "spec/other.md"), DeadAnchor) != 1 {
		t.Fatal("the pointer inside the span draws nothing, and the check reads the raw row")
	}
}
