package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

// THE ENGINE OWNS THE TESTS.
//
// THE OWNER'S WORDS: I want every access to the tests blocked. You pass your
// delta and you pass what you would like to test. And then the engine will
// decide and will either test what it itself figures out or what you propose,
// whatever is less. Single tests can always be executed. The battery the
// agent can't force.
//
// So a test run is a question to the engine. The delta is what the engine
// already holds: the tree as it stands against the snapshot it took when the
// token was taken up. The engine reads which lines changed, asks the index
// which tests reach those lines, and runs those. A proposal narrows that set,
// except that a test named outright is run whether or not the delta reaches
// it, because a test an agent asks for by name is a test it has a reason to
// want. The whole battery runs on the engine's rules and on nobody's say-so:
// a change to the checks, the schemas or the toolchain, a package with no
// map yet, or a selection so wide the battery is cheaper.

// A change is a run of lines of one file that differs from the snapshot.
type change struct {
	Path   string `json:"path"`
	Start  int    `json:"start,omitempty"`
	Finish int    `json:"finish,omitempty"`
	Whole  bool   `json:"whole,omitempty"` // new, deleted, or untracked: every line
}

// A chosen test and why.
type chosen struct {
	ID   string `json:"id"`
	Kind string `json:"kind"`
	Why  string `json:"why"`
}

// whyNamed is the one reason that asks the map nothing: a person or an agent
// named this test, so the selection was already made.
const whyNamed = "named outright"

// A ran test and how it went.
type ran struct {
	ID      string  `json:"id"`
	Kind    string  `json:"kind"`
	OK      bool    `json:"ok"`
	// Pending is a run that has neither passed nor failed because it has not
	// finished. A battery replaces the engine that started it, so it cannot be
	// awaited, and calling a run that has not happened a pass is the defect
	// this exists to end. Pending is never ok, and it is not a failure either.
	Pending bool    `json:"pending,omitempty"`
	Seconds float64 `json:"seconds"`
	Said    string  `json:"said,omitempty"` // the tail of what a failing test printed
	// Engine is, for a check, the engine it was handed and whether the one
	// over the tree is older than its source, so a stale engine reads as a
	// stale engine and never as a defect in the change.
	Engine string `json:"engine,omitempty"`
}

// Tested is the whole answer.
type Tested struct {
	Since      string   `json:"since"` // the snapshot the delta is read against, or HEAD
	Delta      []change `json:"delta"`
	Chosen     []chosen `json:"chosen"`
	Whole      bool     `json:"whole"`
	WhyWhole   string   `json:"why_whole,omitempty"`
	Proposed   []string `json:"proposed,omitempty"`
	Unreached  []string `json:"unreached,omitempty"`  // proposed patterns the delta does not reach
	Uncovered  []string `json:"uncovered,omitempty"`  // changed files no test reaches
	LeftOut    []string `json:"left_out,omitempty"`   // changed files the record does not put on this token, so the delta is without them
	Undeclared []string `json:"undeclared,omitempty"` // checks that declare nothing, so run only whole
	Ran        []ran    `json:"ran"`
	Engine     string   `json:"engine,omitempty"` // the engine subprocess tests drove, and how old it is
	Lands      string   `json:"lands,omitempty"`  // where a run still going writes its answer when it ends
	OK         bool     `json:"ok"`
	Seconds    float64  `json:"seconds"`
}

// wholeTriggers name what a change to makes the whole battery the only
// honest answer: the checks themselves, the schemas everything is read by,
// the toolchain, and the files the projections come from.
var wholeTriggers = []string{"util/checks/**", "src/schemas/**", "**/go.mod", "**/go.sum", "util/tools.json",
	"util/setup/**", "util/cage/**", "util/projections.json", "util/parameters.json"}

// wholeAbove is the share of the suite past which the battery is cheaper
// than the selection, and wholeAtLeast how many tests a suite has before
// that arithmetic means anything: one of two tests is half the suite and
// still one test.
const (
	wholeAbove   = 0.4
	wholeAtLeast = 20
)

// theTestBudget is how long the test verb waits for its run before it answers
// where the result will land. The harness cuts a tool call at sixty seconds,
// and a run cut there read as a dead engine with its answer lost. A variable,
// so a test can make the wait short.
var theTestBudget = 45 * time.Second

func runTest(c *call) int {
	fs := flag.NewFlagSet("test", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se test - hand the engine your delta and what you would like tested. Prints what ran as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se test --on wk-1234567890                       the tests the delta reaches")
		fmt.Fprintln(c.err, "  se test --on wk-1234567890 --propose TestTheGate  one test, by name: it runs")
		fmt.Fprintln(c.err, "  se test --on wk-1234567890 --propose 'TestThe*'   a pattern: it narrows")
		fmt.Fprintln(c.err, "  se test --plan --on wk-1234567890                what would run, without running it")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  The delta is the tree against the snapshot taken when the token was taken")
		fmt.Fprintln(c.err, "  up, or against HEAD with no token. The whole battery runs on the engine's")
		fmt.Fprintln(c.err, "  rules, and the answer says why when it does.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token whose delta this is, by id")
	by := fs.String("by", "", "who is asking")
	plan := fs.Bool("plan", false, "say what would run and run nothing")
	var proposed stringList
	fs.Var(&proposed, "propose", "a test to run by name, or a pattern that narrows. Repeat for more")
	if code, stop := c.parse(fs, "test"); stop {
		return code
	}
	db, err := openIndex(c.roots)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	defer db.Close()
	got, err := TestTheDelta(c.ctx, c.roots, db, *on, proposed, !*plan, *by)
	if !*plan && err == nil {
		// THE RUN IS WRITTEN DOWN AGAINST THE TOKEN, so the submission that ends
		// the work can ask what ran rather than read what the agent typed. A plan
		// is not a run and records nothing.
		RecordTheRun(c.roots, *on, got)
	}
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(got)
	if !got.OK && !*plan {
		return 1
	}
	return 0
}

type stringList []string

func (s *stringList) String() string     { return strings.Join(*s, ",") }
func (s *stringList) Set(v string) error { *s = append(*s, v); return nil }

// TestTheDelta decides what the delta calls for and, unless told only to
// plan, runs it.
func TestTheDelta(ctx context.Context, r Roots, db *sql.DB, on string, proposed []string, run bool, actor string) (Tested, error) {
	out := Tested{Chosen: []chosen{}, Ran: []ran{}, Proposed: proposed}
	since := "HEAD"
	if on != "" {
		t, err := LoadToken(r, on)
		if err != nil {
			return out, err
		}
		since = theSnapshotToDiff(r, t.Began)
	}
	out.Since = since
	delta, err := deltaSince(r, db, since)
	if err != nil {
		return out, err
	}
	out.Delta = delta
	// AND THE DELTA IS THIS TOKEN'S OWN WRITES, where the record can say which
	// they are. On a tree several hands share, the diff against the snapshot is
	// everybody's uncommitted work, and a whole ruling read off that is a
	// sentence about somebody else's change. See tokenwrote.go.
	if on != "" {
		if wrote, proven := WhatThisTokenWrote(r, on); proven {
			out.Delta, out.LeftOut = onlyWhatItWrote(delta, wrote), leftOut(delta, wrote)
		} else {
			out.Whole, out.WhyWhole = true, nothingOnRecord(on)
		}
	}
	// A PAGE OF REDS ANSWERED BY ONE EDIT IS REFUSED. See testedgate.go. A plan
	// runs nothing, so it costs nothing and is never refused.
	if run {
		if why := ARunThatAnswersTooLittle(r, on, out.Delta); why != "" {
			return out, fmt.Errorf("%s", why)
		}
	}
	tests, err := discoverTests(r, db)
	if err != nil {
		return out, err
	}
	if err := choose(db, tests, &out); err != nil {
		return out, err
	}
	if !run {
		out.OK = true
		return out, nil
	}
	start := time.Now()
	if out.Whole {
		// THE BATTERY IS STARTED, NOT AWAITED. It builds the engine and puts a
		// new one over this tree, so waiting for it here is waiting inside the
		// process it replaces. See battery.go.
		out.Ran = append(out.Ran, startBattery(ctx, r, actor, on))
	} else if err := runOrLand(r, tests, &out, start); err != nil {
		return out, err
	}
	out.Seconds = time.Since(start).Seconds()
	out.OK = okOf(out.Ran)
	askToMap()
	return out, nil
}

// okOf is whether every run went well.
func okOf(runs []ran) bool {
	for _, x := range runs {
		if !x.OK {
			return false
		}
	}
	return true
}

// runOrLand runs the chosen tests and waits theTestBudget for them. A run
// still going then is answered as a landing: where its answer is written
// when it ends, and a ran entry saying so, the way the battery answers.
//
// THE RUN KEEPS AN INDEX HANDLE OF ITS OWN. The caller's closes with the
// call, and a run that outlives the call would write its map into a closed
// database.
func runOrLand(r Roots, tests []aTest, out *Tested, start time.Time) error {
	bg, err := openIndex(r)
	if err != nil {
		return err
	}
	done := make(chan struct{})
	var runs []ran
	var engine string
	go func() {
		defer close(done)
		runs, engine = runChosen(r, bg, tests, out.Chosen)
	}()
	select {
	case <-done:
		bg.Close()
		out.Ran, out.Engine = runs, engine
		return nil
	case <-time.After(theTestBudget):
	}
	lands := filepath.Join(r.Private("tests"), "test-"+time.Now().UTC().Format("20060102-150405.000")+".json")
	out.Lands = lands
	out.Ran = append(out.Ran, ran{ID: "the run", Kind: "landing", OK: true,
		Said: fmt.Sprintf("still running after %s, which is as long as the lane waits. Its answer lands in %s", theTestBudget, lands)})
	// WHAT LANDS IS THE ANSWER THIS CALL WOULD HAVE GIVEN, whole, taken as it
	// stands before the caller moves on with its own copy.
	final := *out
	go func() {
		<-done
		bg.Close()
		final.Ran, final.Engine, final.Lands = runs, engine, ""
		final.Seconds = time.Since(start).Seconds()
		final.OK = okOf(final.Ran)
		if b, err := json.MarshalIndent(final, "", "  "); err == nil {
			_ = writeAtomic(lands, b, 0o644) // an answer it cannot write is a run the caller reads as still going
		}
	}()
	return nil
}

// choose fills Chosen, Whole and the rest of the answer from the delta, the
// tests and the proposal.
func choose(db *sql.DB, tests []aTest, out *Tested) error {
	byID := map[string]aTest{}
	for _, t := range tests {
		byID[t.ID] = t
	}
	pick := map[string]string{} // id -> why
	changedPaths := map[string]bool{}
	for _, ch := range out.Delta {
		changedPaths[ch.Path] = true
	}

	// THE WHOLE BATTERY, BY THE ENGINE'S RULES.
	for _, ch := range out.Delta {
		for _, g := range wholeTriggers {
			// THE FIRST REASON STANDS. A ruling made before the triggers were read,
			// because the record cannot say what this token wrote, is the answer to
			// a different question and is not overwritten by a path.
			if out.Whole {
				continue
			}
			if re, _ := globRegexp(g); re != nil && re.MatchString(ch.Path) {
				out.Whole, out.WhyWhole = true, ch.Path+" changed, and it is "+g
			}
		}
	}
	mappedIn := map[string]int{}
	for _, t := range tests {
		if t.Kind == "go" && t.Mapped != "" {
			mappedIn[filepath.ToSlash(filepath.Dir(t.Path))]++
		}
	}
	for _, ch := range out.Delta {
		if !strings.HasSuffix(ch.Path, ".go") {
			continue
		}
		dir := filepath.ToSlash(filepath.Dir(ch.Path))
		if hasGoTests(tests, dir) && mappedIn[dir] == 0 && !out.Whole {
			out.Whole, out.WhyWhole = true, "no map yet for "+dir
		}
	}

	// A TEST WHOSE OWN FILE CHANGED, AND A TEST WHOSE REGIONS THE DELTA REACHES.
	for _, t := range tests {
		if changedPaths[t.Path] {
			pick[t.ID] = "its own file changed"
		}
	}
	for _, ch := range out.Delta {
		q := "SELECT DISTINCT test FROM test_region WHERE path = ?"
		args := []any{ch.Path}
		if !ch.Whole {
			q += " AND start <= ? AND finish >= ?"
			args = append(args, ch.Finish, ch.Start)
		}
		rows, err := db.Query(q, args...)
		if err != nil {
			return err
		}
		reached := false
		for rows.Next() {
			var id string
			if err := rows.Scan(&id); err != nil {
				rows.Close()
				return err
			}
			reached = true
			if _, had := pick[id]; !had {
				pick[id] = "reaches " + ch.Path + ":" + spanOf(ch)
			}
		}
		rows.Close()
		if !reached && !isTestFile(ch.Path) && !reachedByACheck(tests, ch.Path) {
			out.Uncovered = appendOnce(out.Uncovered, ch.Path)
		}
	}
	// A CHECK THAT DECLARES WHAT IT READS IS SELECTED BY IT.
	for _, t := range tests {
		if t.Kind != "check" {
			continue
		}
		if t.Reads == "" {
			out.Undeclared = append(out.Undeclared, t.ID)
			continue
		}
		for _, g := range strings.Split(t.Reads, ",") {
			re, err := globRegexp(strings.TrimSpace(g))
			if err != nil {
				continue
			}
			for p := range changedPaths {
				if re.MatchString(p) {
					if _, had := pick[t.ID]; !had {
						pick[t.ID] = "reads " + strings.TrimSpace(g) + ", and " + p + " changed"
					}
				}
			}
		}
	}

	// THE PROPOSAL: A NAME RUNS, A PATTERN NARROWS.
	if len(out.Proposed) > 0 {
		narrowed := map[string]string{}
		for _, p := range out.Proposed {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if !strings.ContainsAny(p, "*?[") {
				hit := false
				for id, t := range byID {
					if t.Name == p || id == p {
						narrowed[id] = whyNamed
						hit = true
					}
				}
				if !hit {
					out.Unreached = append(out.Unreached, p)
				}
				continue
			}
			re, err := regexp.Compile("^" + strings.NewReplacer("*", ".*", "?", ".").Replace(regexp.QuoteMeta(p)) + "$")
			if err != nil {
				out.Unreached = append(out.Unreached, p)
				continue
			}
			// QuoteMeta escaped the stars; put the meaning back.
			re = regexp.MustCompile(strings.NewReplacer(`\.\*`, ".*", `\.`, ".").Replace(re.String()))
			hit := false
			for id, why := range pick {
				t := byID[id]
				if re.MatchString(t.Name) || re.MatchString(id) {
					narrowed[id] = why + ", within " + p
					hit = true
				}
			}
			if !hit {
				out.Unreached = append(out.Unreached, p)
			}
		}
		// A PROPOSAL THAT NARROWS TO NOTHING IS A WRONG PROPOSAL, not a
		// green run: the engine's own selection stands and the answer says
		// what the proposal missed.
		if len(narrowed) > 0 {
			pick = narrowed
			// A NAME RUNS, EVEN UNDER A WHOLE RULING. The caller asked for a
			// slice, and the battery that ran instead stopped the engine that
			// was answering. The ruling stays in the answer as owed rather
			// than being executed over the proposal.
			if out.Whole {
				out.Whole = false
				out.WhyWhole += "; the battery stays owed, the proposal ran instead"
			}
		}
	}

	if !out.Whole && len(tests) >= wholeAtLeast && float64(len(pick)) > wholeAbove*float64(len(tests)) {
		out.Whole, out.WhyWhole = true, fmt.Sprintf("%d of %d tests selected, and the battery is cheaper", len(pick), len(tests))
	}
	for id, why := range pick {
		out.Chosen = append(out.Chosen, chosen{ID: id, Kind: byID[id].Kind, Why: why})
	}
	sort.Slice(out.Chosen, func(i, j int) bool { return out.Chosen[i].ID < out.Chosen[j].ID })
	sort.Strings(out.Undeclared)
	return nil
}

func hasGoTests(tests []aTest, dir string) bool {
	for _, t := range tests {
		if t.Kind == "go" && filepath.ToSlash(filepath.Dir(t.Path)) == dir {
			return true
		}
	}
	return false
}

func isTestFile(p string) bool {
	return strings.HasSuffix(p, "_test.go") || strings.HasPrefix(p, checksDir+"/")
}

func reachedByACheck(tests []aTest, p string) bool {
	for _, t := range tests {
		if t.Kind != "check" || t.Reads == "" {
			continue
		}
		for _, g := range strings.Split(t.Reads, ",") {
			if re, _ := globRegexp(strings.TrimSpace(g)); re != nil && re.MatchString(p) {
				return true
			}
		}
	}
	return false
}

func appendOnce(list []string, s string) []string {
	for _, x := range list {
		if x == s {
			return list
		}
	}
	return append(list, s)
}

func spanOf(ch change) string {
	if ch.Whole {
		return "all"
	}
	if ch.Start == ch.Finish {
		return strconv.Itoa(ch.Start)
	}
	return strconv.Itoa(ch.Start) + "-" + strconv.Itoa(ch.Finish)
}

// deltaSince reads which lines of which files differ from the snapshot:
// the hunks of a diff against it, and every untracked file whole. The
// private folder is left out, because nothing tests the record.
//
// A TREE WITHOUT HISTORY HAS NO DIFF, AND IT STILL HAS A DELTA: everything.
// A repository with no commit yet has every file untracked, which the
// second list answers; a folder that is not a repository at all is read off
// the index, every file whole.
// theSnapshotToDiff answers the newest take-up this clone can diff against.
//
// A began hash is a commit under refs/se/steps, and no push carries those, so
// a token taken up on one box and worked on another names a snapshot this
// clone never had. The newest one it does hold is read instead, and HEAD is
// the floor. What it answers is what Tested.Since carries, because a reader
// who is not told which snapshot was used cannot tell a narrow delta from a
// stale one.
func theSnapshotToDiff(r Roots, began []string) string {
	for i := len(began) - 1; i >= 0; i-- {
		if anObjectHere(r, began[i]) {
			return began[i]
		}
	}
	return "HEAD"
}

// anObjectHere says whether this clone holds that commit.
func anObjectHere(r Roots, hash string) bool {
	if hash == "" {
		return false
	}
	cmd := quiet.Quietly(exec.Command("git", "cat-file", "-e", hash+"^{commit}"))
	cmd.Dir = r.Work
	return cmd.Run() == nil
}

func deltaSince(r Roots, db *sql.DB, since string) ([]change, error) {
	git := func(args ...string) (string, error) {
		cmd := quiet.Quietly(exec.Command("git", args...))
		cmd.Dir = r.Work
		out, err := cmd.Output()
		if err != nil {
			if ee, ok := err.(*exec.ExitError); ok {
				return "", fmt.Errorf("git %s: %s", args[0], strings.TrimSpace(string(ee.Stderr)))
			}
			return "", fmt.Errorf("git %s: %w", args[0], err)
		}
		return string(out), nil
	}
	// OUTSIDE A REPOSITORY git diff answers as --no-index and says so in
	// words that change, so the question is asked first and plainly.
	if _, err := git("rev-parse", "--is-inside-work-tree"); err != nil {
		return everyFileWhole(db)
	}
	diff, err := git("diff", "-U0", "--no-color", "--no-ext-diff", since, "--", ".")
	if err != nil {
		said := err.Error()
		// A HASH THIS CLONE NEVER HAD IS THE SAME ANSWER IN A FIFTH WORDING. A
		// began snapshot lives under refs/se/steps, which no push carries, so a
		// token taken up on one box and worked on another names a commit that
		// git here calls a bad object.
		if strings.Contains(said, "Could not access") || strings.Contains(said, "bad revision") ||
			strings.Contains(said, "unknown revision") || strings.Contains(said, "ambiguous argument") ||
			strings.Contains(said, "bad object") {
			diff = "" // no history to diff against, and the untracked list below is the tree
		} else {
			return nil, err
		}
	}
	var out []change
	path := ""
	for _, line := range strings.Split(diff, "\n") {
		switch {
		case strings.HasPrefix(line, "--- a/"):
			path = strings.TrimPrefix(line, "--- a/")
		case strings.HasPrefix(line, "+++ b/"):
			path = strings.TrimPrefix(line, "+++ b/")
		case strings.HasPrefix(line, "+++ /dev/null"):
			if path != "" && !isPrivateMaterial(path) {
				out = append(out, change{Path: path, Whole: true})
			}
			path = ""
		case strings.HasPrefix(line, "@@ "):
			if path == "" || isPrivateMaterial(path) {
				continue
			}
			// @@ -a,b +c,d @@ : the new file's lines c..c+d-1, and a d of
			// zero is a deletion at c.
			fields := strings.Fields(line)
			if len(fields) < 3 {
				continue
			}
			plus := strings.TrimPrefix(fields[2], "+")
			start, count := 1, 1
			if a, b, ok := strings.Cut(plus, ","); ok {
				start, _ = strconv.Atoi(a)
				count, _ = strconv.Atoi(b)
			} else {
				start, _ = strconv.Atoi(plus)
			}
			finish := start + count - 1
			if count == 0 {
				finish = start
			}
			out = append(out, change{Path: path, Start: start, Finish: finish})
		}
	}
	untracked, err := git("ls-files", "--others", "--exclude-standard")
	if err != nil {
		return nil, err
	}
	for _, p := range strings.Split(strings.TrimSpace(untracked), "\n") {
		p = strings.TrimSpace(p)
		if p == "" || isPrivateMaterial(p) {
			continue
		}
		out = append(out, change{Path: p, Whole: true})
	}
	return out, nil
}

// everyFileWhole is the delta of a tree with no history: every file the
// index knows, whole, the private folder aside.
func everyFileWhole(db *sql.DB) ([]change, error) {
	rows, err := db.Query("SELECT path FROM file ORDER BY path")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []change
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, err
		}
		if !isPrivateMaterial(p) {
			out = append(out, change{Path: p, Whole: true})
		}
	}
	return out, rows.Err()
}

// runChosen runs the chosen tests: a Go test off its package's cover
// binary, which refreshes its map as a side effect, and a check as the
// process it is. It answers what ran, and which engine the Go tests were
// handed, in a sentence with its age, so a stale one reads as stale.
func runChosen(r Roots, db *sql.DB, tests []aTest, picks []chosen) ([]ran, string) {
	// DOES THIS RUN ASK THE MAP ANYTHING? The owner's rule: build it when the
	// answer depends on it. Every pick named outright was selected by whoever
	// asked, so nothing here consults the map and nothing writes one.
	wantMap := false
	for _, p := range picks {
		if p.Why != whyNamed {
			wantMap = true
			break
		}
	}
	byID := map[string]aTest{}
	for _, t := range tests {
		byID[t.ID] = t
	}
	var out []ran
	bins := map[string]string{}
	// WHAT THE BUILD SAID, KEPT BESIDE THE BINARY IT COULD NOT MAKE. The build
	// runs once a folder, and the second test chosen there was answered from an
	// empty binary and nothing else. So it named no file and no hand, and which
	// answer carried the break depended on which test came first.
	broke := map[string]string{}
	engine, engineSaid, engineStale, engineKnown := "", "", "", false
	for _, p := range picks {
		t := byID[p.ID]
		switch t.Kind {
		case "go":
			dir := filepath.ToSlash(filepath.Dir(t.Path))
			bin, seen := bins[dir]
			if !seen {
				b, err := coverBinary(r, db, dir)
				if err != nil {
					// A PACKAGE THAT WILL NOT COMPILE IS NO RED. See nored.go.
					broke[dir] = err.Error()
					out = append(out, aBuildFailure(r, t.ID, dir, broke[dir]))
					bins[dir] = ""
					continue
				}
				bin, bins[dir] = b, b
			}
			if bin == "" {
				out = append(out, aBuildFailure(r, t.ID, dir, broke[dir]))
				continue
			}
			if !engineKnown {
				engine, engineSaid = suiteEngine(r)
				engineKnown = true
			}
			ok, said, took, regions, err := runOneGoTest(r, bin, engine, t, wantMap)
			x := ran{ID: t.ID, Kind: t.Kind, OK: ok, Seconds: took.Seconds()}
			if !ok {
				x.Said = tailOf(said, 2000)
			}
			if wantMap && err == nil && ok {
				_ = writeRegions(db, t, regions, took) // a map it cannot write is written on the next run
			}
			out = append(out, x)
		case "check":
			// A CHECK IS HANDED THE ENGINE THE GO LANE WOULD RUN. A check asks for
			// its data through .bin/se, and that reaches whatever engine is up, so
			// a check read the engine that was started and not the source it was
			// built from: a field added to the engine went red as locked because
			// the running engine was four minutes older than the tree. The same
			// choice the Go tests get rides in SE_ENGINE, and lib/engine.mjs starts
			// it for a check that raises an engine of its own.
			if !engineKnown {
				engine, engineSaid = suiteEngine(r)
				engineStale = residentStale(r)
				engineKnown = true
			}
			cmd := quiet.Quietly(exec.Command(nodeTool(), filepath.Join(r.Work, filepath.FromSlash(t.Path)), r.Method))
			cmd.Dir = r.Work
			// THE VARIABLE IS SET WHETHER OR NOT ONE WAS NAMED. Set only where
			// one was, a tree with no engine to hand left the environment alone,
			// and the child inherited the parent's whole one, SE_ENGINE included.
			// So a check drove whatever binary an outer run or a person's shell
			// had left there, while its run said nothing was handed. Cleared, it
			// drives .bin/se, which is what engine.mjs promises a check with
			// nothing handed.
			cmd.Env = append(os.Environ(), "SE_ENGINE="+engine)
			start := time.Now()
			said, err := cmd.CombinedOutput()
			x := ran{ID: t.ID, Kind: t.Kind, OK: err == nil, Seconds: time.Since(start).Seconds(),
				Engine: checkEngineNote(engineSaid, engineStale)}
			if err != nil {
				x.Said = tailOf(string(said), 2000)
			}
			out = append(out, x)
		}
	}
	return out, engineSaid
}

// WHERE THE BATTERY'S SHELL IS, AND EVERY PLACE THAT WAS LOOKED FOR IT.
//
// The battery is a shell script and this machine is Windows, where sh is not on
// PATH and is not meant to be. It is on the machine all the same, because the
// installer fetches Git and a Git install ships one.
//
// SO IT IS ASKED FOR THE WAY EVERY OTHER TOOL IS. The probe already found git
// and wrote down where it lives, and Git keeps its shell beside its git, so the
// shell is derived from what the probe knows rather than hoped for on PATH.
// LookPath alone answered no on a machine carrying two copies of it, and the
// whole battery was owed on every token that touched util/checks.
//
// IT ANSWERS THE PLACES IT TRIED. "no sh on this machine" was true of PATH and
// false of the machine, and a lookup that names where it looked is the
// difference between a tool that is missing and a lookup that is not reaching.
func batteryShell(r Roots) (string, []string) {
	return theShellAmong(exec.LookPath, shellsBesideGit(r), func(p string) bool {
		info, err := os.Stat(p)
		return err == nil && !info.IsDir()
	})
}

// theShellAmong is that answer with both lookups handed in, so a check can put
// this machine's shells wherever it needs them and drive the walk over a box
// this one is not.
//
// A WINDOWS LAUNCHER NAMED bash IS NOT A SHELL. It starts a WSL distribution
// rather than running a command, and where none is installed it exits 1 before
// the command runs and prints WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED in UTF-16,
// which no caller here reads as a shell that is missing. LookPath answers it
// ahead of the sh Git brought, because Git leaves that one off PATH, so the
// walk below never ran and every command on such a machine died at the shell.
func theShellAmong(look func(string) (string, error), beside []string, isFile func(string) bool) (string, []string) {
	// THE NAMES ARE A LIST, so a machine with bash and no sh is not called
	// shell-less, and so the one lookup is not spelled out twice in the tree.
	looked := []string{"sh or bash on PATH"}
	for _, name := range []string{"sh", "bash"} {
		sh, err := look(name)
		if err != nil {
			continue
		}
		if theWindowsLauncher(sh) {
			// IT SAYS WHAT IT PASSED OVER. A lookup that skips a hit and
			// then answers nothing is a lookup nobody can argue with.
			looked = append(looked, sh+", passed over: the WSL launcher is not a shell")
			continue
		}
		return sh, looked
	}
	for _, maybe := range beside {
		looked = append(looked, maybe)
		if isFile(maybe) {
			return maybe, looked
		}
	}
	return "", looked
}

// theWindowsLauncher answers whether a path is a stub Windows ships under the
// name of a shell, rather than a shell.
//
// TWO FOLDERS HOLD THEM, and the folder is what tells them apart, because no
// POSIX shell is ever installed in either. system32 holds bash.exe, which
// starts a WSL distribution. WindowsApps holds the app execution aliases,
// which are zero-length reparse points that start a store app, and that is the
// one LookPath answered on the machine this was found on. The first guess here
// named system32 alone and the probe said WindowsApps, so both are named.
//
// IT READS THE PATH AND ASKS THIS MACHINE NOTHING, so the answer is the same on
// a box that has no such folder and a check for it runs everywhere. Both
// separators are read, because the path under test is a Windows one wherever
// the check runs.
func theWindowsLauncher(p string) bool {
	parts := strings.Split(strings.ToLower(strings.ReplaceAll(p, `\`, "/")), "/")
	if len(parts) < 2 {
		return false
	}
	switch parts[len(parts)-2] {
	case "system32", "sysnative", "windowsapps":
		return true
	}
	return false
}

// shellsBesideGit answers where a Git install keeps its shell, worked out from
// the git the probe found.
//
// THE ROOT IS NOT A FIXED NUMBER OF STEPS UP. Git ships git.exe in cmd, again
// in bin, and again in mingw64/bin, while its shell is in bin and usr/bin off
// the install root. One step up is right for Git\cmd\git.exe and wrong for
// Git\mingw64\bin\git.exe, which is the copy a Git Bash PATH puts first: the
// lookup then named Git\mingw64\usr\bin, which no install has, and answered
// that this machine had no shell while sh sat in Git\usr\bin.
//
// SO IT WALKS UP AND TRIES EACH ANCESTOR. A few Stat calls once per battery
// costs nothing, and it holds for a layout nobody here has seen yet.
func shellsBesideGit(r Roots) []string {
	p, ok := LoadProbe(r)
	if !ok {
		return nil
	}
	var out []string
	for _, t := range p.Found {
		if t.Name != "git" || t.Path == "" {
			continue
		}
		at := filepath.Dir(t.Path)
		for up := 0; up < 4; up++ {
			parent := filepath.Dir(at)
			if parent == at {
				break // the volume root, and there is nowhere further to go
			}
			at = parent
			for _, where := range [][]string{
				{"bin", "sh.exe"}, {"usr", "bin", "sh.exe"},
				{"bin", "sh"}, {"usr", "bin", "sh"},
			} {
				out = append(out, filepath.Join(append([]string{at}, where...)...))
			}
		}
	}
	return out
}

// checkEngineNote is what a check's run says about its engine: the one it was
// handed, and, when the engine over the tree is older than its source, that a
// check asking the tree read the old build.
//
// A CHECK OVER THE TREE ITSELF ASKS THE RESIDENT ENGINE, whatever it was
// handed, because the client reaches the engine that is up and nothing else
// can answer over that folder. So the age is said rather than hidden, and a
// failure reads as the engine's age first and the change's second.
//
// THE SWAP IT NAMES HAS TO BUILD. It named se --swap --built, and --built is
// the one flag that cannot cure what the sentence has just diagnosed: it hands
// over to the program already in .bin, which is the build being called stale.
// A reader following it either swapped to the same old binary, or was refused
// for handing over to the build already running, and either way was told the
// cure had been applied. A plain swap builds from the tree first.
//
// THE AGE IS DECIDED ONCE A SUITE AND SAID ONCE. The reason is handed in rather
// than read here. Read here, it walked src/engine once per check, and it took a
// reading of the clock of its own: the sentence gave .bin/se two ages, stamped
// seconds apart, and a reader could not tell which one was the binary's. A
// function with no roots cannot do either again.
func checkEngineNote(handed, stale string) string {
	if strings.TrimSpace(handed) == "" {
		handed = "no engine: this tree carries none to hand"
	}
	note := "handed " + handed
	if stale == "" {
		return note
	}
	// THE REASON IS SAID ONCE, WHEREVER IT IS SAID. suiteEngine's own sentence
	// carries it where it passed the resident over, and the advice below is what
	// this clause is for.
	if !strings.Contains(note, stale) {
		note += ". The engine over this tree is older than its source: " + stale
	}
	return note + ". A check that asks it reads the old build, so a failure here may be " +
		"its age and not the change's. Swap first: " + TheBuildDoor
}

func nodeTool() string {
	if p, err := exec.LookPath("node"); err == nil {
		return p
	}
	return "node"
}

func tailOf(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return "..." + s[len(s)-n:]
}

// remap is how a run asks the background mapper to fill what is missing.
var remap = make(chan struct{}, 1)

func askToMap() {
	select {
	case remap <- struct{}{}:
	default:
	}
}

// interprets says whether this program runs a file it is handed, so a check
// among its arguments is a check about to run.
func interprets(name string) bool {
	switch name {
	case "node", "npx", "deno", "bun", "sh", "bash", "zsh", "dash", "ksh",
		"python", "python3", "py", "powershell", "pwsh":
		return true
	}
	return false
}

// namesAFile says whether this word is a path under the checks folder, which
// is a check being run as the program.
func namesAFile(word string) bool {
	return strings.Contains(filepath.ToSlash(strings.Trim(word, "'\"")), checksDir+"/")
}

// ATestRunByHand answers whether this command runs the tests itself, inside
// the tree, and says where to run them instead.
func ATestRunByHand(command, work string) (string, bool) {
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		if len(words) == 0 {
			continue
		}
		head := strings.ToLower(strings.TrimSuffix(filepath.Base(words[0]), ".exe"))
		// WHERE THE TESTS ARE decides it. go test runs where -C says or where
		// it stands; a check script and a test binary are where their path
		// says; and outside this tree all of them are the agent's own.
		where := ""
		runs := false
		switch {
		case head == "go" && len(words) > 1 && words[1] == "test":
			runs = true
			where = "."
			for i, w := range words {
				if w == "-C" && i+1 < len(words) {
					where = words[i+1]
				}
				if strings.HasPrefix(w, "-C=") {
					where = strings.TrimPrefix(w, "-C=")
				}
			}
		case strings.HasSuffix(head, ".test"):
			runs = true
			where = words[0]
		case isTheEngine(firstWord(part)):
			// THE ENGINE RUNS NO TEST BY HAND. A check named in its arguments
			// is prose: a mint whose done-when says which check decides it,
			// which is the spelling the work-token guidance asks for. This
			// fell through to the scan below and the mint was refused as a
			// test run, twice, and a session with no tool lane had no other
			// way to mint. runsTheEngine anchors the write gate on the same
			// first word.
		case namesAFile(words[0]):
			// THE CHECK RUN AS THE PROGRAM, which is how a shell script is run.
			runs = true
			where = strings.Trim(words[0], "'\"")
		case interprets(head):
			// AN INTERPRETER RUNS WHAT IT IS HANDED, so a check among its
			// arguments is a check about to run.
			for _, w := range words[1:] {
				w = strings.Trim(w, "'\"")
				if strings.Contains(filepath.ToSlash(w), checksDir+"/") {
					runs = true
					where = w
				}
			}
			// AND EVERY OTHER PROGRAM RUNS NOTHING, whatever it is handed.
			//
			// MEASURED. This arm read every word of the line, so a path was a test
			// run wherever it appeared. git commit of a change to a check was
			// refused, and so were git add, git diff, cat and cp. The one change
			// nobody could land was a change to the checks, which is how the
			// battery went a day without the lane this token adds.
			//
			// A PROGRAM IS WHERE A COMMAND STARTS, the same rule the search guard
			// and the removal guard already keep. What decides is the first word,
			// not a path somewhere after it.
		}
		if !runs || !anyInside([]string{where}, work) {
			continue
		}
		return "THE ENGINE OWNS THE TESTS, AND IT DECIDES WHAT RUNS. Hand it your delta and what you would " +
			"like tested, and it runs the tests that reach what you changed:\n\n" +
			"se_test, or se test at a prompt. propose a test by name and it runs; propose a pattern and it " +
			"narrows. The whole battery runs when the engine's rules say so, and the answer says why.\n\n" +
			"What was run: " + strings.TrimSpace(part) + "\n\n" +
			theShellDoor("test --on <token>") + "\n\n" +
			"OUTSIDE THIS TREE the tests are yours to run.", true
	}
	return "", false
}
