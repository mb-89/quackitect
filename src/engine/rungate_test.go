package main

import (
	"strings"
	"testing"
)

// EVERY TOOL THAT COULD WRITE IS REFUSED, AND THE REFUSAL NAMES THE VERB.
//
// A shell is in this list for the harder reason: the engine cannot read a
// command and know whether it writes, so it does not ask. Holding a token was
// the old answer, and it meant one name bought a session of writes with nothing
// saying which of them belonged to what.
func TestEveryWritingToolIsRefusedAndNamesItsVerb(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeProcess(t, root, "gated")
	tok, err := Mint(r, Token{Tracked: local(), Process: "gated", Title: "a token in hand", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	// The actor holds one, which used to be enough for a shell.
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	for _, c := range []struct{ tool, verb string }{
		{"Write", "se apply"},
		{"Edit", "se apply"},
		{"MultiEdit", "se apply"},
		{"NotebookEdit", "se apply"},
		{"Bash", "se run"},
		{"PowerShell", "se run"},
	} {
		t.Run(c.tool, func(t *testing.T) {
			why, refuse := WriteNeedsAToken(r, "main", c.tool, "src/x.go", "")
			if !refuse {
				t.Fatalf("%s was allowed while holding a token", c.tool)
			}
			if !strings.Contains(why, c.verb) {
				t.Errorf("the refusal does not name %s: %s", c.verb, firstLine(why))
			}
		})
	}

	// A TOOL THAT CANNOT WRITE IS NOT GATED. A guard that refuses a read is one
	// somebody turns off.
	for _, tool := range []string{"Read", "Grep", "Glob", "WebFetch"} {
		if _, refuse := WriteNeedsAToken(r, "main", tool, "src/x.go", ""); refuse {
			t.Errorf("%s was refused, and it cannot write", tool)
		}
	}
}

// THE SCRATCHPAD STAYS OPEN, because thinking is not a change. A shell call
// names no file, so it is gated wherever it would have run.
func TestTheScratchpadIsStillOpenToAWrite(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	pad := r.Private("scratchpad") + "/thinking.md"
	if _, refuse := WriteNeedsAToken(r, "main", "Write", pad, ""); refuse {
		t.Error("a write into the scratchpad was refused")
	}
	if _, refuse := WriteNeedsAToken(r, "main", "Bash", "", ""); !refuse {
		t.Error("a shell command was allowed because it names no file")
	}
}
