package main

import (
	"encoding/json"
	"os"
	"regexp"
	"strings"
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
	said, pending, mine := "", false, false
	for _, x := range out.Ran {
		if x.Pending {
			pending = true
			continue
		}
		if x.OK || !thisTokensFailure(x, out.Delta) {
			continue
		}
		mine = true
		if said == "" {
			said = x.ID
		}
	}
	// A RUN IS THIS TOKEN'S PASS WHERE NOTHING THAT FAILED WAS ITS DOING.
	//
	// A run that named nothing keeps whatever it answered, because an empty list
	// says nothing about whose failure it was.
	ok := out.OK || (!mine && len(out.Ran) > 0)
	all.Runs[id] = TheLastRun{OK: ok, Pending: pending,
		At: time.Now().UTC().Format(time.RFC3339), Said: said}
	if b, err := json.MarshalIndent(all, "", "  "); err == nil {
		_ = writeAtomic(lastRunsPath(r), b, 0o644) // a run it cannot write is a run nothing gates on
	}
}

// aPathItPrinted finds the files a check named in what it printed. A path here
// is a word carrying a dot with something after it, which is how every check in
// util/checks names a file.
var aPathItPrinted = regexp.MustCompile(`[A-Za-z0-9_./-]+\.[A-Za-z0-9]+`)

// thisTokensFailure answers whether a failing run is this token's to answer.
//
// A CHECK READS WHAT IT DECLARES, AND SOME OF THEM READ A WHOLE FOLDER. So one
// hand's defective note is chosen by every token whose delta touches that
// folder, and every one of those runs answers not ok. MEASURED: twelve older
// tokens with no approach section refused three submissions that touched none
// of them.
//
// SO A CHECK NAMING ONLY FILES OUTSIDE THE DELTA IS THE PROJECT'S RED. It is
// still run, still printed and still red. It stops standing in the way of a
// token that did not cause it.
//
// A GO TEST IS NEVER EXCUSED, because its output names no changed path in the
// ordinary case, and excusing it would wave through the reds this gate exists
// for. Neither is a build, nor a check that names no file at all: where nothing
// says whose red it is, the safe reading is that it is this one's.
func thisTokensFailure(x ran, delta []change) bool {
	if x.Kind != "check" {
		return true
	}
	named := aPathItPrinted.FindAllString(x.Said, -1)
	if len(named) == 0 {
		return true
	}
	for _, p := range named {
		for _, d := range delta {
			if p == d.Path || strings.HasSuffix(d.Path, "/"+p) || strings.HasSuffix(p, "/"+d.Path) {
				return true
			}
		}
	}
	return false
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
// wk-be226f6ab8 carries making an absent record a refusal, once every process
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
