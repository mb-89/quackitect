package main

import (
	"strings"
	"testing"
)

// A REPORT THAT KEEPS THE OKS AND DROPS THE FAILURES IS NOT A REPORT.
//
// The engine kept the tail of a failing run. A check prints one line per
// assertion and its failures come first, so the tail is the part that says
// everything passed. Three runs of drive-editor answered 1 failed and none of
// them said which line.

// aLongRun is what a check prints: a failure early, and far more oks after it
// than the cap will hold.
func aLongRun() string {
	var b strings.Builder
	b.WriteString("  ok   the first thing\n")
	b.WriteString("  FAIL the one that matters\n")
	b.WriteString("       it said nothing, and it should have said something\n")
	for i := 0; i < 400; i++ {
		b.WriteString("  ok   another thing that held, number one hundred and one\n")
	}
	b.WriteString("\n1 failed.\n")
	return b.String()
}

func TestWhatFailedSurvivesTheCap(t *testing.T) {
	run := aLongRun()
	const cap = 2000
	if len(run) <= cap {
		t.Fatal("the run is shorter than the cap, so this proves nothing")
	}
	kept := whatFailedIn(run, cap)
	if !strings.Contains(kept, "FAIL the one that matters") {
		t.Error("the failing line was cut, so a reader is told a check failed and not which part")
	}
	if !strings.Contains(kept, "it said nothing, and it should have said something") {
		t.Error("the reason under the failure was cut, and a failure with no reason is half a report")
	}
	if len(kept) > cap {
		t.Errorf("it kept %d characters against a cap of %d", len(kept), cap)
	}
}

// AND A RUN THAT FITS IS ANSWERED WHOLE, so nothing is cut that did not have
// to be.
func TestAShortRunIsAnsweredWhole(t *testing.T) {
	run := "  ok   one\n  ok   two\n"
	if kept := whatFailedIn(run, 2000); kept != run {
		t.Errorf("a run inside the cap came back as %q", kept)
	}
}

// AND A RUN WITH NO FAILURE KEEPS ITS TAIL, which is where a Go test prints
// what went wrong when it did not print the word.
func TestARunWithNoFailureKeepsItsTail(t *testing.T) {
	var b strings.Builder
	for i := 0; i < 400; i++ {
		b.WriteString("  ok   a thing that held, and held at some length indeed\n")
	}
	b.WriteString("the last line nobody wants cut\n")
	kept := whatFailedIn(b.String(), 2000)
	if !strings.Contains(kept, "the last line nobody wants cut") {
		t.Error("the tail went missing on a run that named no failure")
	}
}
