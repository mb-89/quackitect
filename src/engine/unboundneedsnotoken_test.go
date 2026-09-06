package main

import (
	"strings"
	"testing"
)

// UNBOUND MEANS NO TOKEN ON A WRITE AND NONE ON A COMMAND.
//
// That is what the button says it means, in the words on its own tooltip: take
// the queue off, no token on a write, no token on a command, nobody made to
// spawn. The engine went on asking for one at both doors, so a person who took
// the queue off still had to name work they were no longer being handed.
//
// THE OWNER ASKED FOR IT TWICE in September 2026, in god mode, and was refused
// both times.

// saidBy runs one verb inside the engine and answers what it wrote.
func saidBy(t *testing.T, r Roots, args ...string) (out, errs string) {
	t.Helper()
	var o, e strings.Builder
	c := &call{roots: r, args: args[1:], out: &o, err: &e}
	run[args[0]](c)
	return o.String(), e.String()
}

func TestBoundAsksForATokenAndUnboundDoesNot(t *testing.T) {
	r := guidanceTree(t)
	Project(r)

	// BOUND, IT ASKS. Both doors, so neither is fixed on its own.
	for _, verb := range [][]string{
		{"run", "--command", "echo hello"},
		{"apply", "--edits", `[{"file":"notes.md","op":"create","new":"hello"}]`},
	} {
		if out, _ := saidBy(t, r, verb...); !strings.Contains(out, "say which token") {
			t.Fatalf("bound, %s answered %q rather than asking for a token", verb[0], out)
		}
	}

	// UNBOUND, IT DOES NOT.
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !Unleashed(r) {
		t.Fatal("the rung did not take, so this test asks nothing")
	}
	for _, verb := range [][]string{
		{"run", "--command", "echo hello"},
		{"apply", "--edits", `[{"file":"notes.md","op":"create","new":"hello"}]`},
	} {
		out, errs := saidBy(t, r, verb...)
		if strings.Contains(out, "say which token") {
			t.Errorf("unbound, %s still asks for a token: %s %s", verb[0], out, errs)
		}
	}
}
