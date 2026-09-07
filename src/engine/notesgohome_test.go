package main

import (
	"encoding/json"
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
	// THE HOLD IS ON THE PULL, which is the tool heldDuringShortfall names. It
	// was se_apply here, from before that list was narrowed to one verb, so this
	// drove a door the guard does not hold and could not redden.
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", ""); refuse {
		t.Fatalf("%d notes were refused, and the ceiling is %d:\n%s", len(notes), TheNoteCeiling, why)
	}

	// THE TWENTIETH HOLDS THE WORK, AND THE REFUSAL HANDS THE NOTES OVER.
	last := mintNote(t, r, "the note filling it")
	notes = append(notes, last)
	why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", "")
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
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", ""); refuse {
		t.Errorf("a note that became a token is still counted, so turning them in never clears the hold")
	}
}

// THE THREE ANSWERS LAND THROUGH THE DOORS THE HOLD LEAVES OPEN.
//
// A refusal that names an action nobody can take through the tools it leaves
// open is a deadlock with instructions. The lane's se_work carried no
// needs_human, and the shell form of the flag was behind the same hold, so the
// one answer the owner's words single out, the undecidable note that must still
// reach a person, was the one answer a held agent could not give. So each
// answer TooManyNotes names is taken here the way a held agent takes it, with
// the hold standing: the tool passes the guard, and the verb behind it lands.
func TestTheThreeAnswersLandThroughTheOpenDoors(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	var notes []Token
	for i := 0; i < TheNoteCeiling; i++ {
		notes = append(notes, mintNote(t, r, "a note nobody decided"))
	}
	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	if _, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", ""); !refuse {
		t.Fatal("this proves nothing: the hold is not standing")
	}

	// DROPPED. The abort is the drop that carries why, and it ends the note.
	theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--abort", notes[0].ID,
		"--why", "a passing thought, and nothing rests on it", "--by", "main"})
	dropped, err := LoadToken(r, notes[0].ID)
	if err != nil {
		t.Fatal(err)
	}
	if !dropped.Ended() || dropped.Disposition != Dropped {
		t.Errorf("the note reads %s %q after the drop, and it should have ended as dropped", dropped.Status, dropped.Disposition)
	}

	// A TRACKED TOKEN, born where git carries it.
	minted := theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--title", "token from a note",
		"--process", "trivial", "--tracked", "true", "--done-when", "the note is a token", "--by", "main"})
	if _, err := os.Stat(filepath.Join(r.Work, "doc", "work", minted.ID+".md")); err != nil {
		t.Errorf("the tracked token is not in doc/work: %v", err)
	}
	if minted.NeedsHuman {
		t.Errorf("a token nobody flagged reads needs_human")
	}

	// AND ONE A PERSON HAS TO READ, flagged at the mint, through the lane's own
	// argument and the shell flag it sends.
	flagged := theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--title", "one a person reads",
		"--process", "trivial", "--tracked", "true", "--done-when", "a person has read it", "--needs-human", "--by", "main"})
	if !flagged.NeedsHuman {
		t.Errorf("the token minted with --needs-human does not read needs_human")
	}
	if again, err := LoadToken(r, flagged.ID); err != nil || !again.NeedsHuman {
		t.Errorf("needs_human did not reach the disk: %v", err)
	}
}

// theNotesDoor takes one action the way a held agent takes it: the tool has
// to pass the hold, at the lane and at a shell, and then the verb behind it
// runs. It answers the token the verb wrote.
func theNotesDoor(t *testing.T, r Roots, tool string, argv []string) Token {
	t.Helper()
	shell := "./RUNME.sh " + strings.Join(argv, " ")
	if why, refuse := TooManyNotes(r, "main", tool, ""); refuse {
		t.Fatalf("%s is refused while the notes are held, and it is the way out:\n%s", tool, why)
	}
	if why, refuse := TooManyNotes(r, "main", "Bash", shell); refuse {
		t.Fatalf("the same call at a shell is refused: %s\n%s", shell, why)
	}
	a := runVerbInside(t.Context(), r, verbAsk{Verb: argv[0], Args: argv[1:]})
	if a.Code != 0 {
		t.Fatalf("%s did not land: %s%s", shell, a.Out, a.Err)
	}
	var tok Token
	if err := json.Unmarshal([]byte(a.Out), &tok); err != nil {
		t.Fatalf("%s answered something that is not a token: %v\n%s", shell, err, a.Out)
	}
	return tok
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
	if why, refuse := TooManyNotes(r, "main", "mcp__quackitect__se_pull", ""); refuse {
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
