package main

import (
	"encoding/json"
	"os"
	"time"
)

// WHAT THE ENGINE RAN, PER TOKEN, SO A CLOSE CAN ASK IT.
//
// The standard process carries a row saying se test on this token answered ok.
// An agent writes that row. checkEvidence asks only that every row is ticked or
// carries a sentence, and never asks the engine what actually ran. So done
// means an agent said so.
//
// MEASURED, ON 2026-09-06. Every green reported in one session, including the
// engine's own work, rested on the agent's word rather than on a check.
//
// THE ENGINE ALREADY KNOWS. se test builds a Tested and answers it, and then
// forgets it. This writes it down against the token, so the submission that
// ends the work can read what the run said.

// TheLastRun is what se test last said about one token.
type TheLastRun struct {
	OK      bool   `json:"ok"`
	Pending bool   `json:"pending,omitempty"` // a battery that had not finished when this was written
	At      string `json:"at"`
	Said    string `json:"said,omitempty"` // the first failing test, so a refusal can name it
}

// theLastRuns is the whole store, by token id.
type theLastRuns struct {
	Runs map[string]TheLastRun `json:"runs"`
}

func lastRunsPath(r Roots) string { return r.Private("tested.json") }

func loadLastRuns(r Roots) theLastRuns {
	out := theLastRuns{Runs: map[string]TheLastRun{}}
	b, err := os.ReadFile(lastRunsPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out) // a store that will not read is nothing having run
	if out.Runs == nil {
		out.Runs = map[string]TheLastRun{}
	}
	return out
}

// LastRunOn answers what the engine last ran for a token, and whether it ran at
// all.
func LastRunOn(r Roots, id string) (TheLastRun, bool) {
	got, ok := loadLastRuns(r).Runs[id]
	return got, ok
}

// RecordTheRun writes down what a run said about a token.
//
// A RUN THAT NAMED NO TOKEN IS NOT RECORDED, because there is nothing to record
// it against. A plan is not a run and does not reach here.
func RecordTheRun(r Roots, id string, out Tested) {
	if id == "" {
		return
	}
	all := loadLastRuns(r)
	said, pending := "", false
	for _, x := range out.Ran {
		if x.Pending {
			pending = true
		}
		if !x.OK && !x.Pending && said == "" {
			said = x.ID
		}
	}
	all.Runs[id] = TheLastRun{OK: out.OK, Pending: pending,
		At: time.Now().UTC().Format(time.RFC3339), Said: said}
	if b, err := json.MarshalIndent(all, "", "  "); err == nil {
		_ = writeAtomic(lastRunsPath(r), b, 0o644) // a run it cannot write is a run nothing gates on
	}
}

// TestsRefuseTheClose answers why the tests will not let this token move on,
// and nothing where they will.
//
// A TOKEN NOTHING HAS RUN IS NOT REFUSED, AND THAT IS ON PURPOSE FOR NOW.
// Every token open today was minted before anything recorded a run, so
// refusing an absent record would refuse the whole queue at once. What this
// stops is the case that actually happens: a run went red or had not finished,
// and the row saying it passed was written anyway.
//
// wk-5c682f1a25 carries making an absent record a refusal, once every process
// has run once under this.
func TestsRefuseTheClose(r Roots, t Token) string {
	got, ok := LastRunOn(r, t.ID)
	if !ok {
		return ""
	}
	if got.Pending {
		return "the last run on " + t.ID + " had not finished at " + got.At +
			". A battery that is still going is neither a pass nor a failure, " +
			"so ask again once it has finished"
	}
	if !got.OK {
		which := ""
		if got.Said != "" {
			which = ", and " + got.Said + " was the first to fail"
		}
		return "the last run on " + t.ID + " did not pass, at " + got.At + which
	}
	return ""
}
