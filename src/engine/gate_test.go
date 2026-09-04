package main

import (
	"strings"
	"testing"
)

// NO TOKEN, NO WRITING. And naming one is what puts it in work, so the agent
// never opens a token as a separate act.
//
// THE OWNER'S WORDS: whenever you do something that writes or can write, you
// have to say which token it is about, and that flips the token to in work. It
// flips any other token per agent to not in work. So one agent never holds more
// than one token, and there are never more tokens open than there are agents
// working.

// THE EXCEPTION IS THE ENGINE BEING THE PROGRAM, NOT THE WORD APPEARING.
//
// It split the command into fields and answered true if ANY field was se after
// quote and path stripping. So the write gate was skipped for any command that
// merely mentioned the engine, and for the whole of a compound whose first half
// ran it: .bin/se pull && python -c "open(...).write(...)" ran the engine and
// then wrote, and the gate saw one string and let it through.
//
// AND NOTHING COULD SEE IT. Every case of the exception in this suite is a case
// that must be ALLOWED, so a test suite full of them cannot notice the exception
// being too wide. These are the negative side.
// THE MENU KNOWS EVERY NAME THE CALLER ANSWERS TO. The gate looked up open
// tokens over the raw harness name, and no token is held under one, so a
// subagent was told nothing is open while its own token stood open. And the
// suggested command printed the harness name in --by, so an agent obeying it
// held the token under the wrong name.
func TestTheMenuKnowsTheNameItPullsWith(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "held work", "")
	tok.Holder = "rev-6"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	NoteTheNameItPullsWith(r, "general-purpose-28", ".bin/se pull --actor rev-6")

	why, refused := WriteNeedsAToken(r, "general-purpose-28", "Edit", "doc/x.md", "")
	if !refused {
		t.Fatal("an Edit was not refused")
	}
	if !strings.Contains(why, tok.ID) {
		t.Fatalf("the refusal does not name the token the caller's own name holds: %s", why)
	}
	if !strings.Contains(why, "--by rev-6") {
		t.Fatalf("the suggested command does not spell --by with the pulled-with name: %s", why)
	}
	if !strings.Contains(why, "general-purpose-28") || !strings.Contains(why, "rev-6") {
		t.Fatalf("the refusal does not say which name is which: %s", why)
	}
}

func TestTheEngineExceptionIsAnchoredToTheProgram(t *testing.T) {
	t.Parallel()
	allowed := []string{
		".bin/se work --on wk-1111111111 --by main",
		"se pull --actor main",
		`"C:\Users\x\.bin\se.exe" --answer "a sentence; with punctuation"`,
		`./.bin/se --answer "one thing && another"`,
	}
	for _, c := range allowed {
		if !runsTheEngine(c) {
			t.Errorf("this runs the engine and nothing else, and was taken out of the exception: %s", c)
		}
	}
	refused := []string{
		"echo se",
		"echo se && rm -rf src/engine",
		".bin/se pull --actor main && python -c print(1)",
		".bin/se pull --actor main; touch notes.md",
		".bin/se pull --actor main | tee notes.md",
		"python -c print(1) && .bin/se pull --actor main",
		"echo $(.bin/se pull --actor main) > notes.md",
		// A REDIRECTION IS A WRITE AND IT NEEDS NO SECOND PROGRAM. This was in
		// the exception, so se --version > src/engine/gate.go was an ungated
		// write of the gate's own source. A reviewer found it on the shipped
		// binary: the redirection was allowed while a plain rg was refused.
		"se --version > src/engine/gate.go",
		".bin/se pull --actor main >> notes.md",
		"se query > q.json 2>&1",
	}
	for _, c := range refused {
		if runsTheEngine(c) {
			t.Errorf("this does not run the engine alone and the write gate was skipped for it: %s", c)
		}
	}
}

// A REFUSAL SAYS WHAT DISQUALIFIED THE COMMAND, WHERE IT WAS NEARLY ALLOWED.
//
// A command that is the engine and something else is refused for the something
// else. The refusal talked about naming a token, so a cloud agent read it as the
// engine itself being refused and spent several calls on that reading.
func TestARefusalSaysWhatTookTheCommandOutOfTheException(t *testing.T) {
	t.Parallel()
	for _, c := range []struct{ command, says string }{
		{"./RUNME.sh pull --help | head -40", "a pipe"},
		{".bin/se lint > findings.json", "a redirection"},
		{"se query --list; touch notes.md", "a second command"},
		{"se work --title x && rm -rf src", "a second command"},
		{`se work --detail "$(cat notes.md)"`, "a substitution"},
	} {
		got := whatDisqualified(c.command)
		if !strings.Contains(got, c.says) {
			t.Errorf("%q was disqualified by %s and the refusal says %q", c.command, c.says, got)
		}
	}
	// A COMMAND THAT IS NOT THE ENGINE AT ALL GETS NO SUCH LINE. It did not
	// nearly qualify, so telling it what disqualified it would be noise.
	for _, c := range []string{"rm -rf src", "python -c print(1) | tee out"} {
		if got := whatDisqualified(c); got != "" {
			t.Errorf("%q does not run the engine and was told %q", c, got)
		}
	}
	// NOR DOES ONE THAT QUALIFIES.
	if got := whatDisqualified(`se --answer "a sentence; with punctuation"`); got != "" {
		t.Errorf("a command inside the exception was told %q", got)
	}
}

// RUNME IS THE ENGINE ON A BOX THAT HAS NOT BUILT ONE.
//
// A cloud session cloned this tree, had no .bin and no tool lane, and reached
// for the one door a clone carries. The exception knew se and se.exe, so
// ./RUNME.sh --answer was refused by the guard that demands an answer, and
// ./RUNME.sh stop by the guard that demands a claim. Each guard's only door was
// held shut by the other, and the session had no legal move at all.
func TestRunmeIsTheEngineForAGuardsException(t *testing.T) {
	t.Parallel()
	for _, c := range []string{
		`./RUNME.sh --answer "the whole answer"`,
		"./RUNME.sh stop --because asked --why \"they said so\"",
		"RUNME.sh pull --actor main",
		`"C:\Users\x\RUNME.sh" --said "what they typed"`,
	} {
		if !runsTheEngine(c) {
			t.Errorf("this is the engine through the door a clone carries, and it is outside the exception: %s", c)
		}
	}
	// AND THE ANSWER GUARD READS IT AS AN ANSWER, which is the refusal that
	// cannot otherwise be satisfied.
	if !runsTheEngineWith(`./RUNME.sh --answer "a sentence"`, "--answer") {
		t.Error("the guard that demands an answer refuses the command that gives one")
	}
	// THE ANCHORING STILL HOLDS. RUNME is the engine, and a second program after
	// it is still a second program.
	for _, c := range []string{
		"echo RUNME.sh",
		"./RUNME.sh pull --actor main && rm -rf src/engine",
		"./RUNME.sh pull --help > notes.md",
	} {
		if runsTheEngine(c) {
			t.Errorf("this does not run the engine alone and the gate was skipped for it: %s", c)
		}
	}
}
