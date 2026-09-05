package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A CLOUD BOX EMPTIES ITS NOTES INTO GIT BEFORE IT DIES.
//
// THE OWNER'S WORDS: every note you write is not tracked and will not survive.
// When that variable is on and there are twenty notes or more, the engine gives
// you these notes. You judge them and either make work tokens out of them, or
// drop them if they are useless. Where you cannot decide one, make your best
// attempt, make a tracked token, and flag it needs_human.
//
// A note lives in the private folder, which nothing pushes, so on a box that is
// reclaimed when the session ends every note written there is lost. A desk
// keeps its notes on its own disk and is left alone.
func TestACloudBoxTurnsItsNotesIn(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)

	notes := make([]Token, 0, TheNoteCeiling)
	for i := 0; i < TheNoteCeiling-1; i++ {
		notes = append(notes, mintNote(t, r, "a note nobody decided"))
	}

	// NINETEEN NOTES ON A CLOUD BOX REFUSE NOTHING.
	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply"); refuse {
		t.Fatalf("%d notes were refused, and the ceiling is %d:\n%s", len(notes), TheNoteCeiling, why)
	}

	// THE TWENTIETH HOLDS THE WORK, AND THE REFUSAL HANDS THE NOTES OVER.
	last := mintNote(t, r, "the note filling it")
	notes = append(notes, last)
	why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply")
	if !refuse {
		t.Fatalf("%d notes on a cloud box were not refused", len(notes))
	}
	for _, one := range notes {
		if !strings.Contains(why, one.ID) {
			t.Errorf("the refusal does not name %s, so that note is not handed over", one.ID)
		}
	}
	if !strings.Contains(why, last.Title) {
		t.Errorf("the refusal names ids without titles, so nothing says what a note is about:\n%s", why)
	}
	if !strings.Contains(why, "needs_human") {
		t.Errorf("the refusal does not say what to do with a note it cannot decide:\n%s", why)
	}

	// AND A CALL THAT IS NOT WORK GOES THROUGH, so the agent can mint the
	// tokens the refusal asks for.
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_work"); refuse {
		t.Errorf("the minting that answers this refusal is itself refused")
	}

	// A NOTE THAT BECAME A TOKEN NO LONGER COUNTS.
	turnedIn, err := LoadToken(r, last.ID)
	if err != nil {
		t.Fatal(err)
	}
	turnedIn.Status, turnedIn.Disposition = "closed", Became
	turnedIn.Successors = []string{"wk-0000000001"}
	if err := SaveToken(r, turnedIn); err != nil {
		t.Fatal(err)
	}
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply"); refuse {
		t.Errorf("a note that became a token is still counted, so turning them in never clears the hold")
	}
}

// AND A DESK IS LEFT ALONE. Its notes are on a disk that survives the session,
// and telling a person their own notes are in the way is the engine arguing
// with them.
func TestADeskKeepsItsNotes(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	for i := 0; i < TheNoteCeiling+2; i++ {
		mintNote(t, r, "a desk note")
	}
	for _, v := range []string{"CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "SE_CLOUD"} {
		t.Setenv(v, "")
	}
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply"); refuse {
		t.Fatalf("a desk was held over its own notes:\n%s", why)
	}
}

// aHostTable puts the shipped table of cloud variables in the tree, so the
// test reads the same file the product does.
func aHostTable(t *testing.T, r Roots) {
	t.Helper()
	dir := filepath.Join(r.Method, "util", "cage")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join("..", "..", "util", "cage", "hosts.json"))
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "hosts.json"), b, 0o644); err != nil {
		t.Fatal(err)
	}
}

func mintNote(t *testing.T, r Roots, title string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Process: PrivateProcess, Title: title, Status: "noted",
		Detail: "something seen in passing, and nobody has decided about it"})
	if err != nil {
		t.Fatalf("minting a note: %v", err)
	}
	return tok
}
