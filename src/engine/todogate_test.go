package main

import (
	"strings"
	"testing"
)

// A TODO IS A SUB-TOKEN, AND THE RECORD IS WHERE THE PLAN LIVES.
//
// The harness carries a todo list of its own, and a plan written there is a
// plan nobody else can read: it goes when the agent goes, and the queue on the
// person's screen never learns what the work was broken into. A sub-token says
// the same thing where everybody reads it, and its parent cannot close while it
// is open, so the breakdown is enforced rather than remembered.
func TestATodoIsASubToken(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "gated", false)
	tok, err := Mint(r, Token{Process: "gated", Title: "the token in hand", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	// BOTH HALVES OF THE LIST ARE REFUSED. Reading one is how an agent finds
	// the list it is about to write, so refusing only the write moves the plan
	// out of the record just as well.
	for _, tool := range []string{"TodoWrite", "TodoRead"} {
		t.Run(tool, func(t *testing.T) {
			why, refuse := TodoIsASubToken(r, "main", tool)
			if !refuse {
				t.Fatalf("%s was allowed, so the plan can live outside the record", tool)
			}
			if !strings.Contains(why, "se work") {
				t.Errorf("the refusal does not name the verb: %s", firstLine(why))
			}
			// IT NAMES THE TOKEN IN HAND, so the agent has the parent to mint
			// under and not only the shape of the call.
			if !strings.Contains(why, "--parent") || !strings.Contains(why, tok.ID) {
				t.Errorf("the refusal names no sub-token under %s: %s", tok.ID, why)
			}
		})
	}

	// A TOOL THAT IS NOT THE HARNESS'S LIST IS NOT GATED HERE. A guard that
	// reaches past what it is about is one somebody turns off.
	for _, tool := range []string{"Read", "Write", "Bash", "Glob"} {
		if _, refuse := TodoIsASubToken(r, "main", tool); refuse {
			t.Errorf("%s was refused by the todo guard", tool)
		}
	}
}

// WITH NOTHING IN HAND THERE IS NO PARENT TO NAME. The refusal says how to get
// a token rather than offering a --parent with nothing after it.
func TestATodoWithNothingInHandSaysHowToGetOne(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	why, refuse := TodoIsASubToken(r, "nobody", "TodoWrite")
	if !refuse {
		t.Fatal("TodoWrite was allowed to an actor holding nothing")
	}
	if strings.Contains(why, "--parent") {
		t.Errorf("the refusal offers a parent that is not there: %s", why)
	}
	if !strings.Contains(why, "se pull") {
		t.Errorf("the refusal does not say how to get a token: %s", firstLine(why))
	}
}
