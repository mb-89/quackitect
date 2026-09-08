package main

import (
	"bytes"
	"context"
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

// AND THE VERB WRITES WHAT THE GATE READS, which is the seam the rest rests on.
//
// Both tests here call RecordTheRun in the same process, so they pass whether or
// not the verb ever writes anything. A report said se test left no store at all:
// a dozen runs through the lane and three at a prompt, and .se/tested.json was
// not on the box. Under that, the gate is right and every close goes through it
// untouched, which is a gate that gates nothing.
//
// So this drives the verb and reads the store back, which is the one thing
// neither test above can do.
func TestTheTestVerbWritesTheRunItRan(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "work the verb runs")
	if _, found := LastRunOn(r, tok.ID); found {
		t.Fatal("the store already holds a run for a token nothing has tested")
	}

	// THE TOKEN HAS TO HAVE WRITTEN SOMETHING, and this is not decoration.
	// Nothing in the record says what a token just minted wrote, so the delta is
	// the whole diff, and a whole diff starts the battery outside this engine
	// whatever is proposed. That run is recorded pending, which is neither a
	// pass nor a failure, and the gate refuses a close on it. So an apply on the
	// token gives the delta something to be, and a proposal that reaches nothing
	// keeps the run empty and green.
	if _, err := Apply(r, []Edit{{File: "one.txt", Op: "create", New: "one\n"}},
		false, tok.ID, "worker-here"); err != nil {
		t.Fatalf("the token could not write anything: %v", err)
	}

	var out, said bytes.Buffer
	code := runTest(&call{ctx: context.Background(), roots: r,
		args: []string{"--on", tok.ID, "--by", "worker-here", "--propose", "TestNothingInThisTreeIsCalledThis"},
		in:   strings.NewReader(""), out: &out, err: &said})
	if code != 0 {
		t.Fatalf("the test verb answered %d. It said %q, and its reason stream said %q",
			code, out.String(), said.String())
	}

	run, found := LastRunOn(r, tok.ID)
	if !found {
		t.Fatalf("the verb ran and wrote no record, so the gate reads nothing. It answered: %s", out.String())
	}
	if !run.OK || run.Pending {
		t.Fatalf("the record does not say the run passed: %+v", run)
	}

	// AND THE SUBMISSION TAKES IT. The gate reads this same record, so a token
	// whose recorded run passed is not held on the run. Anything else the
	// submission wants is that process's business and not this seam's.
	if got := Pull(r, "worker-here", RoleWorker, Payload{}); got.Pull != AnswerWork {
		t.Fatalf("this test proves nothing: nothing was handed out: %s", got.Notice)
	}
	if why := TestsRefuseTheClose(r, tok); why != "" {
		t.Fatalf("the tests hold a token whose recorded run passed: %s", why)
	}
	got := Pull(r, "worker-here", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if held := theRefusalFromTheTests(got.Findings); held != nil {
		t.Fatalf("the gate held a token whose recorded run passed: %+v", *held)
	}
}

// theRefusalFromTheTests answers the refusal this gate wrote, and nothing where
// it wrote none.
//
// IT ASKS FOR THE CLAUSE, NOT FOR THE SENTENCE. Both tests here read the gate's
// prose, and either wording is one edit from matching nothing: the loop would
// then find no refusal, both tests would stay green, and neither criterion
// would be checked by anything again. The clause is an identifier the gate and
// this file both read, so a reword cannot reach it.
func theRefusalFromTheTests(findings []Rejection) *Rejection {
	for _, f := range findings {
		if f.Clause == theTestsClause {
			return &f
		}
	}
	return nil
}

// AND THE SUBMISSION ASKS IT, which is the half that matters. A gate nothing
// calls is a gate that gates nothing, which is the defect this replaces.
//
// IT ASKS FOR THE REFUSAL BY ITS CLAUSE, and then that the refusal carries the
// gate's own words. Both halves are read at run time, so neither can be
// disarmed by an edit to the sentence.
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
	held := theRefusalFromTheTests(got.Findings)
	if held == nil {
		t.Fatalf("the tests did not hold a token whose run went red: %+v", got.Findings)
	}
	if why := TestsRefuseTheClose(r, tok); held.Wrong != why {
		t.Errorf("the refusal reads %q and the gate answers %q", held.Wrong, why)
	}
}
