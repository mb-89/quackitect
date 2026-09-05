package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// ONE BINARY, ONE AGE, AND THE WALK RUNS ONCE A SUITE.
//
// The note a check carries said the same thing twice. suiteEngine's sentence
// already names why the resident was passed over, and the stale clause named it
// again off a second reading of the clock, so one answer gave .bin/se two ages
// seconds apart. The reader cannot tell which is the age of the binary.
//
// AND THE READING COST A WALK PER CHECK. Deciding it beside suiteEngine, which
// is guarded to run once, is one walk over src/engine for a battery of
// thirty-seven checks rather than thirty-seven.
//
// SO THE NOTE IS HANDED WHAT IT SAYS. A function with no roots cannot stat the
// tree, which is the half that keeps the walk where it was put.
func TestACheckSaysOneAgeForOneEngine(t *testing.T) {
	t.Parallel()
	resident := filepath.Join("m", ".bin", "se")
	why := "a.go is newer than " + resident + ", built 1h0m0s ago"
	handed := "fresh, built now from the tree: " + why

	note := checkEngineNote(handed, why)
	if n := strings.Count(note, resident); n != 1 {
		t.Errorf("the note names %s %d times, so one binary is given more than one age: %s", resident, n, note)
	}
	for _, want := range []string{"reads the old build", TheBuildDoor} {
		if !strings.Contains(note, want) {
			t.Errorf("the note drops %q, so a reader is not told what to do: %s", want, note)
		}
	}

	// A REASON THE HANDED SENTENCE DOES NOT CARRY IS STILL SAID.
	said := checkEngineNote("the resident, built 2s ago", why)
	if !strings.Contains(said, why) {
		t.Errorf("a note whose engine sentence never named the reason drops it: %s", said)
	}

	// AND A TREE THAT HANDS NOTHING SAYS SO, rather than ending at "handed ".
	bare := checkEngineNote("", "")
	if len(strings.Fields(bare)) < 3 {
		t.Errorf("a tree with no engine to hand answers %q, which names nothing", bare)
	}
}

// AND EVERY CHECK IN ONE RUN READS THE SAME SENTENCE.
func TestTwoChecksReadOneEngineSentence(t *testing.T) {
	t.Parallel()
	r, _ := aTreeWithAnEchoingCheck(t)
	aFedToolchain(t, "quackitect/x", nil)
	resident := filepath.Join(r.Method, ".bin", exeName("se"))
	if err := os.MkdirAll(filepath.Dir(resident), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(resident, []byte("an engine built before the source moved"), 0o755); err != nil {
		t.Fatal(err)
	}
	anHourAgo := time.Now().Add(-time.Hour)
	if err := os.Chtimes(resident, anHourAgo, anHourAgo); err != nil {
		t.Fatal(err)
	}
	tests, picks := echoingCheck()

	runs, _ := runChosen(r, nil, tests, append(picks, picks[0]))
	if len(runs) != 2 {
		t.Fatalf("two picks ran as %d", len(runs))
	}
	if runs[0].Engine != runs[1].Engine {
		t.Errorf("two checks in one run read two sentences:\n%s\n%s", runs[0].Engine, runs[1].Engine)
	}
	if n := strings.Count(runs[0].Engine, resident); n != 1 {
		t.Errorf("the note names %s %d times, so one binary is given more than one age: %s",
			resident, n, runs[0].Engine)
	}
}
