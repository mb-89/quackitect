package main

import (
	"testing"
)

// NOBODY IS NOT AN ACTOR, AND NOBODY HOLDS NOTHING.
//
// MEASURED ON THE LIVE TREE, AND IT OPENED THE WHOLE GATE. An unheld token
// carries an empty holder, so InWorkFor("") matched every unheld token in the
// store: 192 of them. The gate reads a non-empty hand as "this caller has said
// which work it is on", so every write by a caller with no name went through.
// NO TOKEN, NO WRITING was off for anyone who did not say who they were.
func TestAnActorWithNoNameHoldsNothing(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "gated", false)

	// Three tokens nobody holds, which is the shape of a backlog.
	for _, title := range []string{"the first note", "the second note", "the third one"} {
		if _, err := Mint(r, Token{Process: "gated", Title: title, Status: "first"}); err != nil {
			t.Fatal(err)
		}
	}
	if n := len(Tokens(r)); n != 3 {
		t.Fatalf("the fixture wrote %d tokens", n)
	}

	for _, nobody := range []string{"", " ", "\t"} {
		if held := InWorkFor(r, nobody); len(held) != 0 {
			t.Errorf("an actor named %q holds %d token(s)", nobody, len(held))
		}
	}

	// AND A REAL ACTOR TAKING ONE UP HOLDS EXACTLY THAT ONE, so the fix answers
	// nothing for nobody rather than nothing for everybody.
	all := Tokens(r)
	if _, err := TakeUp(r, all[0].ID, "main"); err != nil {
		t.Fatal(err)
	}
	held := InWorkFor(r, "main")
	if len(held) != 1 || held[0].ID != all[0].ID {
		t.Fatalf("main holds %d token(s) where it took up one", len(held))
	}
	// AND STILL NOBODY HOLDS NOTHING, with a token in somebody's hands. This is
	// the case that was broken: the unheld ones went on matching the empty name.
	if n := len(InWorkFor(r, "")); n != 0 {
		t.Errorf("an actor with no name holds %d of the remaining tokens", n)
	}
}
