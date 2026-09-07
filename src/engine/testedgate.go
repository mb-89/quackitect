package main

import (
	"encoding/json"
	"fmt"
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
	// Failed names every test this run left red. The refusal tells the agent to
	// read the whole page, and the page is gone by then: a lane call cut at
	// sixty seconds takes the answer with it, and the next run is refused for
	// not having answered a page nobody could read. So the page is kept here.
	Failed []string `json:"failed,omitempty"`
	// Reds is how many of that run's failures were this token's to answer. A
	// package that did not compile counts one, whatever it listed, because the
	// compiler stopped at the first wall and every test behind it is unrun.
	Reds int `json:"reds,omitempty"`
	// Causes is how many distinct things those reds were waiting on, which is
	// what a change has to be as wide as. It is Reds wherever the engine cannot
	// tell, so a record written before this field existed reads as no opinion
	// and the count falls back to Reds.
	Causes int `json:"causes,omitempty"`
	// Delta is the delta as it stood at that run, so the next one can say how
	// many places moved since. The engine keeps no snapshot per run, and this
	// is the shape it already had.
	Delta []change `json:"delta,omitempty"`
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
	var failed []string
	for _, x := range out.Ran {
		if x.Pending {
			pending = true
			continue
		}
		if x.OK || !thisTokensFailure(x, out.Delta) {
			continue
		}
		mine = true
		failed = append(failed, x.ID)
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
		At: time.Now().UTC().Format(time.RFC3339), Said: said, Failed: failed,
		Reds: theRedsToAnswer(out), Causes: theCausesToAnswer(out), Delta: out.Delta}
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

// theRedsToAnswer counts what this run left for the agent to answer.
//
// A BUILD FAILURE COUNTS ONE, whatever it listed. The compiler stops at the
// first wall, so every test behind it is unrun and the page is one error rather
// than a page. Answering it with one edit is the right size.
func theRedsToAnswer(out Tested) int {
	build, reds := false, 0
	for _, x := range out.Ran {
		if x.OK || x.Pending || !thisTokensFailure(x, out.Delta) {
			continue
		}
		if x.Kind == "build" {
			build = true
			continue
		}
		reds++
	}
	if build && reds == 0 {
		return 1
	}
	return reds
}

// aWordInARed is a word long enough to be a name, taken out of what a failing
// test printed.
var aWordInARed = regexp.MustCompile(`[A-Za-z_][A-Za-z0-9_]{3,}`)

// mixedCase answers whether a word carries both cases, which is what a Go name
// looks like and what a shouted heading does not.
func mixedCase(w string) bool {
	upper, lower := false, false
	for _, c := range w {
		switch {
		case c >= 'A' && c <= 'Z':
			upper = true
		case c >= 'a' && c <= 'z':
			lower = true
		}
	}
	return upper && lower
}

// theNamesInARed answers the names one failure printed, which is the engine's
// only handle on what a page of reds has in common.
//
// ALL CAPS IS NOT A NAME. FAIL sits in every Go failure, and the engine's own
// headings are shouted, so counting those as a shared cause would collapse
// every page to one and take the gate off altogether.
//
// A TEST'S OWN NAME IS NOT A CAUSE EITHER. Every red names itself, and that is
// what tells them apart rather than what they share.
func theNamesInARed(x ran) map[string]bool {
	out := map[string]bool{}
	mine := x.ID
	if i := strings.LastIndex(mine, "/"); i >= 0 {
		mine = mine[i+1:]
	}
	for _, w := range aWordInARed.FindAllString(x.Said, -1) {
		if !mixedCase(w) || w == mine {
			continue
		}
		out[w] = true
	}
	return out
}

// theCausesToAnswer counts the distinct things a run left to fix.
//
// A PAGE OF FAILURES WITH ONE CAUSE IS ONE THING TO FIX. Three tests waiting on
// one function that answers nothing are one edit, the way a package that did
// not compile is one edit whatever it listed.
//
// MEASURED, September 2026. Four tests were written against one function and a
// stub was added so they would redden on their assertions. Three went red, all
// saying the same thing, and the gate demanded three edits. Two more were made
// to reach the count, both real and neither what the reds asked for, which is
// the gate teaching padding.
//
// WHERE THE ENGINE CANNOT TELL, IT KEEPS COUNTING REDS. One red that printed
// nothing, or a page with no name running through all of it, leaves the count
// where it was. The rule only loosens where the answer is on the page.
func theCausesToAnswer(out Tested) int {
	reds := theRedsToAnswer(out)
	if reds < 2 {
		return reds
	}
	var shared map[string]bool
	for _, x := range out.Ran {
		if x.OK || x.Pending || x.Kind == "build" || !thisTokensFailure(x, out.Delta) {
			continue
		}
		named := theNamesInARed(x)
		if len(named) == 0 {
			return reds // it printed no name, so nothing says it shares a cause
		}
		if shared == nil {
			shared = named
			continue
		}
		for name := range shared {
			if !named[name] {
				delete(shared, name)
			}
		}
		if len(shared) == 0 {
			return reds
		}
	}
	if len(shared) == 0 {
		return reds
	}
	return 1
}

// ARunThatAnswersTooLittle answers why this run is refused, and nothing where
// it goes through.
//
// A PAGE OF REDS ANSWERED BY ONE EDIT IS A GUESS WITH A TEST RUN ATTACHED.
//
// THE OWNER'S WORDS, September 2026: we need the engine to reject tests if the
// number of changes is not as big as the number of errors.
//
// MEASURED that month. A run came back with six reds. The agent read one,
// changed one thing, and ran the whole set again. Two of four runs in that
// sequence taught it nothing, and each rebuilds the engine.
//
// IT IS NOT A BOUND ON EFFORT. It is a bound on running the suite as a way of
// thinking. A change touching as many places as there were reds goes through,
// whatever it did in them.
//
// A FIRST RUN IS NEVER REFUSED, because nothing was left unanswered, and
// neither is a run after a single red, because one edit is its right size.
func ARunThatAnswersTooLittle(r Roots, id string, now []change) string {
	if id == "" {
		return ""
	}
	least := LoadConfig(r).RedsBeforeAChangeIsNeeded
	if least <= 0 {
		return "" // the person turned the rule off
	}
	was, ok := LastRunOn(r, id)
	if !ok || was.Reds < least {
		return ""
	}
	moved := 0
	for _, c := range now {
		if !amongTheChanges(was.Delta, c) {
			moved++
		}
	}
	// WHAT THE CHANGE HAS TO BE AS WIDE AS IS THE CAUSES. A record written
	// before that was counted carries none, and then the reds are the reading.
	need := was.Reds
	if was.Causes > 0 && was.Causes < need {
		need = was.Causes
	}
	if moved >= need {
		return ""
	}
	// THE PAGE IS IN THE REFUSAL, because by now it is nowhere else. A lane call
	// is cut at sixty seconds and the answer goes with it, so an agent was told
	// to read a page it had never been shown, and asking again was refused for
	// the same reason.
	page := ""
	if len(was.Failed) > 0 {
		page = "\n\nWHAT WENT RED:\n  " + strings.Join(was.Failed, "\n  ")
	}
	return fmt.Sprintf("THE LAST RUN LEFT %d RED AND THE TREE HAS MOVED IN %d PLACE(S) SINCE.%s\n\n"+
		"A page of failures answered by one edit is a guess with a test run attached, and the "+
		"run costs a rebuild. Read the whole page first: every one of the %d says what it wanted "+
		"and what it got.\n\n"+
		"Fix what you can see, all of it, then ask again. A change touching as many places as "+
		"there were reds goes through, whatever it did in them.", was.Reds, moved, page, was.Reds)
}

// amongTheChanges answers whether this place was already in that delta.
func amongTheChanges(was []change, c change) bool {
	for _, x := range was {
		if x.Path == c.Path && x.Start == c.Start && x.Finish == c.Finish && x.Whole == c.Whole {
			return true
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
