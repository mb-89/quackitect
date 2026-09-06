package main

import (
	"strings"
	"testing"
	"time"
)

// THE ENGINE COUNTS THE RESULTS IT RETURNS, AND HOW MANY OF THEM WERE WRONG.
//
// The engine returned errors to the agent and kept no count of them, so how
// much a session erred could be read only off the harness's transcripts, which
// the engine does not own and which do not always keep what a reading needs.
// The engine sees every result on its way back through runVerbInside, so it
// counts there, and the count is its own.

func TestTheEngineCountsTheResultsItReturns(t *testing.T) {
	t.Parallel()
	r := countingTree(t)

	// A VERB THAT ANSWERS raises the total alone.
	if a := runVerbInside(t.Context(), r, verbAsk{Verb: "config"}); a.Code != 0 {
		t.Fatalf("config did not answer: %s%s", a.Out, a.Err)
	}
	if got := ResultsSoFar(r); got.Returned != 1 || got.Wrong != 0 {
		t.Fatalf("after one good answer the count reads %+v", got)
	}
	// A VERB THAT ERRS raises both. A flag nothing has is an error by its code.
	if a := runVerbInside(t.Context(), r, verbAsk{Verb: "config", Args: []string{"--a-flag-nothing-has"}}); a.Code == 0 {
		t.Fatalf("a flag nothing has was answered as though it ran: %s", a.Out)
	}
	if got := ResultsSoFar(r); got.Returned != 2 || got.Wrong != 1 {
		t.Fatalf("after one good and one erring answer the count reads %+v", got)
	}
	// A PULL THAT REFUSES raises both too. It answers its refusal as JSON with
	// exit 0, so the code alone would miss it, and the verb marks the call.
	a := runVerbInside(t.Context(), r, verbAsk{Verb: "pull", Args: []string{"--actor", "main"},
		Stdin: `{"id":"wk-0000000000","disposition":"done"}`})
	if !strings.Contains(a.Out, `"refused"`) {
		t.Fatalf("a submission on a token nobody minted was not refused: %s%s", a.Out, a.Err)
	}
	got := ResultsSoFar(r)
	if got.Returned != 3 || got.Wrong != 2 {
		t.Fatalf("after a refused pull the count reads %+v", got)
	}
	// AND THE COUNT IS THIS SESSION'S, keyed by the name the log carries.
	if got.Session != currentSession(r) {
		t.Fatalf("the count is filed under %q and the session is %q", got.Session, currentSession(r))
	}

	// AND THE STATE OF PLAY CARRIES BOTH, which is where se_status reads it.
	play := TheStateOfPlay(r, time.Now())
	if play.Results != got {
		t.Fatalf("the state of play carries %+v, the store %+v", play.Results, got)
	}
	if screen := play.Screen(); !strings.Contains(screen, "results 3, 2 wrong") {
		t.Fatalf("the screen does not say results 3, 2 wrong:\n%s", screen)
	}
}

// A COMPACTION FORGETS WHAT THE AGENT READ AND NOTHING ELSE. The count is not
// read evidence, so an error before the compaction and one after are two.
func TestTheCountSurvivesACompaction(t *testing.T) {
	t.Parallel()
	r := countingTree(t)
	CountResult(r, true)
	ForgetReads(r, "compaction")
	CountResult(r, true)
	if got := ResultsSoFar(r); got.Returned != 2 || got.Wrong != 2 {
		t.Fatalf("the compaction touched the count: %+v", got)
	}
}
