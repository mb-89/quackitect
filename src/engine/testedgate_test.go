package main

import (
	"strings"
	"testing"
)

// A CLOSE ASKS WHAT THE ENGINE RAN, NOT WHAT THE AGENT WROTE.
//
// The standard process has a row saying se test on this token answered ok, and
// an agent writes that row itself. checkEvidence asks only that every row is
// ticked or carries a sentence. So done meant an agent said so.
//
// WHAT THIS STOPS is the case that happens: a run went red, or had not
// finished, and the row saying it passed was written anyway.
//
// A TOKEN NOTHING HAS RUN IS NOT REFUSED. Every token open today predates the
// store, so refusing an absent record would refuse the whole queue at once.
func TestACloseAsksWhatTheEngineRan(t *testing.T) {
	t.Parallel()

	for _, c := range []struct {
		name     string
		run      *TheLastRun
		refuses  bool
		mentions string
	}{
		{"nothing has run", nil, false, ""},
		{"the run passed", &TheLastRun{OK: true}, false, ""},
		{"the run failed", &TheLastRun{OK: false, Said: "TestSomething"}, true, "did not pass"},
		{"the run is not finished", &TheLastRun{Pending: true}, true, "had not finished"},
	} {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			r := aTreeWithTheProcesses(t)
			tok := mintStandard(t, r, "work with a run")
			if c.run != nil {
				RecordTheRun(r, tok.ID, Tested{OK: c.run.OK,
					Ran: []ran{{ID: c.run.Said, Kind: "go", OK: c.run.OK, Pending: c.run.Pending}}})
			}
			why := TestsRefuseTheClose(r, tok)
			if refused := why != ""; refused != c.refuses {
				t.Fatalf("the tests refused %v and %s wants %v: %s", refused, c.name, c.refuses, why)
			}
			if c.mentions != "" && !strings.Contains(why, c.mentions) {
				t.Errorf("the refusal does not say why: %s", why)
			}
		})
	}
}

// AND THE SUBMISSION ASKS IT, which is the half that matters. A gate nothing
// calls is a gate that gates nothing, which is the defect this replaces.
func TestASubmissionIsRefusedWhenTheRunWasRed(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	tok := mintStandard(t, r, "work whose tests failed")
	if got := Pull(r, "worker-here", RoleWorker, Payload{}); got.Pull != AnswerWork {
		t.Fatalf("this test proves nothing: nothing was handed out: %s", got.Notice)
	}
	RecordTheRun(r, tok.ID, Tested{OK: false,
		Ran: []ran{{ID: "TestSomething", Kind: "go", OK: false}}})

	got := Pull(r, "worker-here", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull != AnswerRefused {
		t.Fatalf("a submission on a token whose run went red answered %s", got.Pull)
	}
	var named bool
	for _, f := range got.Findings {
		if strings.Contains(f.Wrong, "did not pass") {
			named = true
		}
	}
	if !named {
		t.Errorf("the refusal does not name the run: %+v", got.Findings)
	}
}
