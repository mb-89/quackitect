package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// THE SCRATCHPAD STAYS ALLOWED, BECAUSE THINKING IS NOT A CHANGE.
//
// The detail says so and nothing in the gate knew it, so an agent with nothing
// in hand could not write the note it was reasoning in. That is the one place
// where the gate costs something and buys nothing: a file under .se/scratchpad
// is not the product, and no reviewer ever reads it as one.
func TestTheScratchpadIsWrittenWithNoTokenInHand(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "the open one", Status: ImpOpen})

	pad := filepath.Join(r.Private("scratchpad"), "a-note.md")
	if why, refuse := WriteNeedsAToken(r, "main", "Write", pad); refuse {
		t.Errorf("a write inside the scratchpad was refused with nothing in hand: %s", why)
	}
}

// AND EVERYTHING OUTSIDE IT IS STILL GATED, which is the half that stops the
// carve-out being a hole. A path that merely mentions the folder name, or one
// that climbs back out of it, is not inside it.
func TestOnlyTheScratchpadItselfIsCarvedOut(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "the open one", Status: ImpOpen})

	out := map[string]string{
		"a source file":              filepath.Join(r.Work, "src", "engine", "gate.go"),
		"a path climbing back out":   filepath.Join(r.Private("scratchpad"), "..", "..", "src", "engine", "gate.go"),
		"a sibling named after it":   filepath.Join(r.Work, "scratchpad-notes.md"),
		"the record beside it":       filepath.Join(r.Private("log"), "current.jsonl"),
		"no path at all, as Bash is": "",
	}
	for what, path := range out {
		if _, refuse := WriteNeedsAToken(r, "main", "Write", path); !refuse {
			t.Errorf("%s was allowed with nothing in hand: %s", what, path)
		}
	}
}

// AND THE REFUSAL STILL SAYS WHAT IT ALWAYS SAID, so adding a path did not turn
// the menu into a bare no.
func TestTheRefusalStillNamesWhatIsOpen(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the open one", Status: ImpOpen})

	why, refuse := WriteNeedsAToken(r, "main", "Write", filepath.Join(r.Work, "src", "engine", "gate.go"))
	if !refuse {
		t.Fatal("a write to source with nothing in hand was allowed")
	}
	if !strings.Contains(why, one.ID) {
		t.Errorf("the refusal does not name what is open for this agent: %s", why)
	}
}
