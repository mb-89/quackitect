package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE COMMANDS IN A REFUSAL ARE READ BY NOTHING, SO THEY ROT.
//
// The one runnable line the notes refusal printed was se work --close <id>
// --as dropped --why "...", and neither flag has ever existed. The whole guard
// is a handing-over: it holds the work and tells the agent the way out. Its one
// copyable line was a parse error, so the agent it held spent a turn on a
// command that cannot run and then went to read the flag set itself.
//
// SO EVERY se work LINE THE REFUSAL PRINTS IS PARSED AGAINST THE SET runWork
// DECLARES. A flag renamed next month breaks this test rather than the agent
// standing in front of the guard. A command that parses and then fails on a
// token id out of the text is fine: what is asserted is that the verb read it.
func TestTheNotesRefusalNamesFlagsSeWorkHas(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	for i := 0; i < TheNoteCeiling; i++ {
		mintNote(t, r, "a note nobody decided")
	}
	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", "")
	if !refuse {
		t.Fatal("the ceiling held nothing, so there is no refusal to read")
	}

	said := theSeWorkCommandsIn(why)
	if len(said) == 0 {
		t.Fatal("the refusal names no se work command, so the agent it holds is told nothing it can run")
	}
	for _, args := range said {
		var out, errs bytes.Buffer
		code := run["work"](&call{roots: r, args: args,
			in: strings.NewReader(""), out: &out, err: &errs})
		if code == Unread || strings.Contains(errs.String(), "not defined") {
			t.Errorf("the refusal prints se work %s, which se work will not read: %s",
				strings.Join(args, " "), strings.TrimSpace(errs.String()))
		}
	}
}

// theSeWorkCommandsIn answers the arguments of every se work command in a
// refusal, so the verb itself can say whether it would read them. A command
// runs to the end of its line, which is where a copyable one belongs.
func theSeWorkCommandsIn(text string) [][]string {
	var out [][]string
	for _, line := range strings.Split(text, "\n") {
		at := strings.Index(line, "se work ")
		if at < 0 {
			continue
		}
		if args := theWordsIn(line[at+len("se work "):]); len(args) > 0 {
			out = append(out, args)
		}
	}
	return out
}

// theWordsIn splits a command line the way a shell would, keeping a quoted
// value whole, because a --why carries a sentence.
func theWordsIn(s string) []string {
	var out []string
	var word strings.Builder
	quoted := false
	end := func() {
		if word.Len() > 0 {
			out = append(out, word.String())
			word.Reset()
		}
	}
	for _, ch := range s {
		switch {
		case ch == '"':
			quoted = !quoted
		case ch == ' ' && !quoted:
			end()
		default:
			word.WriteRune(ch)
		}
	}
	end()
	return out
}

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
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", ""); refuse {
		t.Fatalf("%d notes were refused, and the ceiling is %d:\n%s", len(notes), TheNoteCeiling, why)
	}

	// THE TWENTIETH HOLDS THE WORK, AND THE REFUSAL HANDS THE NOTES OVER.
	last := mintNote(t, r, "the note filling it")
	notes = append(notes, last)
	why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", "")
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
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_work", ""); refuse {
		t.Errorf("the minting that answers this refusal is itself refused")
	}

	// AND SO DOES THE SAME CALL AT A SHELL. A cloud box is where a lane may be
	// absent, and every refusal here tells such an agent to use the shell. A
	// guard that holds Bash while asking for work verbs leaves no legal move.
	for _, command := range []string{
		"./RUNME.sh work --title \"a token from a note\" --tracked",
		"./RUNME.sh work --abort wk-1111111111 --why \"nothing rests on it\"",
		"./RUNME.sh work --set wk-1111111111 --field needs_human --to true",
	} {
		if _, refuse := TooManyNotes(r, "main", "Bash", command); refuse {
			t.Errorf("the way out is refused at a shell: %s", command)
		}
	}
	// THE WORK ITSELF IS STILL HELD, whichever door it comes through.
	if _, refuse := TooManyNotes(r, "main", "Bash", "./RUNME.sh apply --on wk-x --by main --edits '[]'"); !refuse {
		t.Errorf("an apply at a shell walked round the hold")
	}

	// A NOTE THAT BECAME A TOKEN NO LONGER COUNTS.
	turnedIn, err := LoadToken(r, last.ID)
	if err != nil {
		t.Fatal(err)
	}
	turnedIn.Status, turnedIn.Disposition = "closed", Became
	turnedIn.Successors = []string{"wk-1111111111"}
	if err := SaveToken(r, turnedIn); err != nil {
		t.Fatal(err)
	}
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", ""); refuse {
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
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_apply", ""); refuse {
		t.Fatalf("a desk was held over its own notes:\n%s", why)
	}
}

// AND THE LAST THING A CLOUD BOX DOES IS TURN IN WHAT IS LEFT.
//
// THE OWNER'S WORDS: when you have nothing else to do, claim all the notes that
// are still there and work them in, then you can stop. A stop is the box saying
// it has nothing else to do, so it is where the last note is caught.
func TestACloudBoxTurnsThemInBeforeItStops(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	note := mintNote(t, r, "the last note here")
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	err := ClaimStop(r, "main", "asked", "the person said to stop")
	if err == nil {
		t.Fatal("a cloud box stopped with a note in hand, and the note dies with it")
	}
	if !strings.Contains(err.Error(), note.ID) || !strings.Contains(err.Error(), note.Title) {
		t.Errorf("the refusal does not name the note that is about to be lost: %v", err)
	}

	// TURNED IN, AND THE STOP IS GRANTED.
	turnedIn, err := LoadToken(r, note.ID)
	if err != nil {
		t.Fatal(err)
	}
	turnedIn.Status, turnedIn.Disposition = "closed", Dropped
	turnedIn.Reason = "it was a passing thought and nothing rests on it"
	if err := SaveToken(r, turnedIn); err != nil {
		t.Fatal(err)
	}
	if err := ClaimStop(r, "main", "asked", "the person said to stop"); err != nil {
		t.Fatalf("the notes are in and the stop was still refused: %v", err)
	}
}

// AND A DESK STOPS WHENEVER IT LIKES. Its notes are on a disk that outlives the
// session, so holding a person at their own notes is the engine arguing.
func TestADeskStopsWithNotesInHand(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	mintNote(t, r, "a desk note")
	for _, v := range []string{"CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "SE_CLOUD"} {
		t.Setenv(v, "")
	}
	if err := ClaimStop(r, "main", "asked", "the person said to stop"); err != nil {
		t.Fatalf("a desk was held at its own notes: %v", err)
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
