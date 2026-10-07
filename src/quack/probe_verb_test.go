// The probe verb over fake doors: the compaction probe's reading and its run,
// the dry road handed to its JavaScript entry, and the usage.
// [[spec/tickets/box-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// A row of the session log, as rowOf in the level0 lib writes one. [[spec/tickets/box-verbs-port-to-go]]
func probeRowOf(level, kind, said string, more map[string]any) probeRow {
	row := probeRow{"at": "2026-09-12T08:00:00.000Z", "level": level, "kind": kind, "said": said}
	for key, value := range more {
		row[key] = value
	}
	return row
}

// The rows as the log's text, one JSON line a row. [[spec/tickets/box-verbs-port-to-go]]
func logText(rows ...probeRow) string {
	var said strings.Builder
	for _, one := range rows {
		line, _ := json.Marshal(one)
		said.Write(append(line, '\n'))
	}
	return said.String()
}

// Writes the text as the session log under the root. [[spec/tickets/box-verbs-port-to-go]]
func writeLog(t *testing.T, root, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(sessionLog))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

// Hands the client's runs to the answer, the runner recording each run first. [[spec/tickets/box-verbs-port-to-go]]
func clientAnswers(d *boxDoors, answer func(argv []string, o runOpts) ranResult) {
	inner := d.run
	d.run = func(argv []string, o runOpts) ranResult {
		said := inner(argv, o)
		if filepath.Base(argv[0]) == "claude" {
			return answer(argv, o)
		}
		return said
	}
}

func compactContext(reason string) probeRow {
	return probeRowOf("info", "context", "5 block(s) reach the session", map[string]any{"detail": "level0-canary", "reason": reason})
}

func compactRun() probeRow {
	return probeRowOf("info", "compact", "a compaction runs", map[string]any{"trigger": "manual", "messages": 3})
}

func compactHeard(said string) probeRow {
	level := "warn"
	if said == heardSame {
		level = "info"
	}
	return probeRowOf(level, "level0", said, map[string]any{"detail": ""})
}

func TestTheCompactionReadsEveryRoad(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name   string
		rows   []probeRow
		answer string
		reads  int
		why    string
	}{
		{"two reads and a whole canary survive", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame)}, probeSurvives, 2, heardSame},
		{"other numbers after the compaction drop", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardOther)}, probeDrops, 2, heardOther},
		{"the first read's canary counts for no second read", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun()}, probeDrops, 1, "second time"},
		{"a re-read carrying no canary drops", []probeRow{compactContext("first"), compactRun(), compactContext("re-read")}, probeDrops, 2, "carries a canary"},
		{"no compaction leaves the road unproven", []probeRow{compactContext("first"), compactHeard(heardSame)}, probeUnproven, 1, "unproven"},
		{"a refused compaction at warn leaves the road unproven", []probeRow{compactContext("first"), probeRowOf("warn", "compact", "the command road refuses a compaction", map[string]any{"detail": "no such command"})}, probeUnproven, 1, "unproven"},
		{"an empty log names no read", nil, probeUnproven, 0, "unproven"},
		// The repeat saying lands only once the line stands paid, so the first saying after a compaction still decides. [[spec/tickets/callers-name-both-readers]]
		{"a repeat after the paying line still survives", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame), compactHeard(heardAgain)}, probeSurvives, 2, heardSame},
	}
	for _, one := range cases {
		read := readsCompaction(one.rows)
		if read.answer != one.answer || read.reads != one.reads || !strings.Contains(read.why, one.why) {
			t.Errorf("%s: reads %+v", one.name, read)
		}
	}
}

func TestTheCompactProbeRunsTheClientAndPrintsTheRowsItReads(t *testing.T) {
	t.Parallel()
	d, runner, out, errs := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.root, logText(compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame)))
		return ranResult{code: 3}
	})
	if code := probeVerb(d, []string{"compact"}); code != 0 {
		t.Fatalf("the probe answers %d\n%s%s", code, out, errs)
	}
	argv, o := runner.ran[0], runner.opts[0]
	if !slices.Equal(argv, []string{"claude", "-p", compactOpens, "--plugin-dir", filepath.Join(d.root, ".claude", "skills", "level0")}) {
		t.Errorf("the client runs as %v", argv)
	}
	if o.cwd != d.root || o.env[compactVariable] != "1" || o.timeout != probeWait {
		t.Errorf("the client runs under %+v", o)
	}
	want := "  context  first 5 block(s) reach the session\n  compact  manual a compaction runs\n  context  re-read 5 block(s) reach the session\n\nsurvives: " + heardSame + "\nThe layer reaches the session 2 time(s).\n"
	if out.String() != want {
		t.Errorf("the probe prints\n%s", out)
	}
	if errs.String() != "The client answers 3.\n" {
		t.Errorf("the probe says %q", errs)
	}
}

func TestTheCompactProbeAnswersOneWhereTheLayerDropsOrNoClientStands(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.root, logText(compactContext("first"), compactRun()))
		return ranResult{}
	})
	if code := probeVerb(d, []string{"compact"}); code != 1 {
		t.Errorf("a dropped layer answers %d", code)
	}
	gone, _, _, errs := fakeBoxDoors(t)
	clientAnswers(&gone, func([]string, runOpts) ranResult { return ranResult{code: 1, missing: true} })
	if code := probeVerb(gone, []string{"compact"}); code != 1 || !strings.Contains(errs.String(), "claude stands nowhere") {
		t.Errorf("a missing client answers %d: %s", code, errs)
	}
}

// The client stands where the survey finds it. [[spec/design_output/tools#where-a-caller-looks]]
func TestTheProbeRunsTheClientTheSurveyNames(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t, "claude")
	at := filepath.Join(d.env("PATH"), "claude")
	survey := filepath.Join(d.root, filepath.FromSlash(toolsFile))
	_ = os.MkdirAll(filepath.Dir(survey), 0o755)
	_ = os.WriteFile(survey, []byte(`{"claude":{"path":`+jsonString(at)+`}}`), 0o644)
	probeVerb(d, []string{"compact"})
	if runner.ran[0][0] != at {
		t.Errorf("the probe runs %s", runner.ran[0][0])
	}
}

// The dry road starts its JavaScript entry with the words as they stand. [[spec/tickets/probe-dry-leaves-node]]
func TestTheDryProbeHandsItsRoadToTheEntry(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	runner.answers["node"] = ranResult{code: 4}
	if code := probeVerb(d, []string{"dry", "--working"}); code != 4 {
		t.Errorf("the dry road answers %d", code)
	}
	want := []string{"node", filepath.Join(d.root, "src", "scripts", "probe-dry.js"), "dry", "--working"}
	if len(runner.ran) != 1 || !slices.Equal(runner.ran[0], want) {
		t.Errorf("the dry road runs %v", runner.ran)
	}
	if o := runner.opts[0]; o.cwd != d.root || !o.inherit {
		t.Errorf("the dry road runs under %+v", o)
	}
	gone, _, _, errs := fakeBoxDoors(t)
	gone.run = func([]string, runOpts) ranResult { return ranResult{code: 1, missing: true} }
	if code := probeVerb(gone, []string{"dry"}); code != 1 || !strings.Contains(errs.String(), "node stands nowhere") {
		t.Errorf("a missing node answers %d: %s", code, errs)
	}
}

// The dry road at a revision resolves it to a commit, and hands the entry that commit. [[spec/tickets/probe-at-revision-guards-merges]]
func TestTheDryProbeRunsAtARevision(t *testing.T) {
	t.Parallel()
	d, runner, _, errs := fakeBoxDoors(t)
	runner.answers["git rev-parse"] = ranResult{stdout: "abc123\n"}
	runner.answers["node"] = ranResult{}
	if code := probeVerb(d, []string{"dry", "--at", "HEAD~1"}); code != 0 {
		t.Fatalf("the dry road at a revision answers %d: %s", code, errs)
	}
	if len(runner.ran) != 2 || !slices.Equal(runner.ran[0][1:], []string{"rev-parse", "--verify", "--quiet", "HEAD~1^{commit}"}) {
		t.Fatalf("the dry road runs %v", runner.ran)
	}
	want := []string{"node", filepath.Join(d.root, "src", "scripts", "probe-dry.js"), "dry", "--at", "abc123"}
	if !slices.Equal(runner.ran[1], want) {
		t.Errorf("the entry runs %v", runner.ran[1])
	}
}

// A revision git cannot resolve stops the road before node starts. [[spec/tickets/probe-at-revision-guards-merges]]
func TestTheDryProbeRefusesARevisionGitCannotResolve(t *testing.T) {
	t.Parallel()
	d, runner, _, errs := fakeBoxDoors(t)
	runner.answers["git rev-parse"] = ranResult{code: 1}
	if code := probeVerb(d, []string{"dry", "--at", "nowhere"}); code != exitFailed || len(runner.ran) != 1 || !strings.Contains(errs.String(), "nowhere") {
		t.Errorf("an unknown revision answers %d, runs %v, says %q", code, runner.ran, errs)
	}
}

// The smoke stands on the tree as it is, so it takes no revision, and neither does the working change. [[spec/tickets/probe-at-stays-dry]]
func TestTheSmokeRefusesARevision(t *testing.T) {
	t.Parallel()
	d, runner, _, errs := fakeBoxDoors(t)
	if code := probeVerb(d, []string{"smoke", "--at", "HEAD~1"}); code != exitUsage || len(runner.ran) != 0 || !strings.Contains(errs.String(), "dry road alone") {
		t.Errorf("the smoke at a revision answers %d, runs %v, says %q", code, runner.ran, errs)
	}
}

// [[spec/tickets/probe-at-stays-dry]]
func TestTheDryProbeRefusesARevisionBesideTheWorkingChange(t *testing.T) {
	t.Parallel()
	d, runner, _, errs := fakeBoxDoors(t)
	if code := probeVerb(d, []string{"dry", "--working", "--at", "HEAD~1"}); code != exitUsage || len(runner.ran) != 0 || !strings.Contains(errs.String(), "--working") {
		t.Errorf("a revision beside the working change answers %d, runs %v, says %q", code, runner.ran, errs)
	}
}

// The smoke road starts the same entry with its words, as the dry road does. [[spec/tickets/level0-smoke-runs-in-seconds]]
func TestTheSmokeProbeHandsItsRoadToTheEntry(t *testing.T) {
	t.Parallel()
	d, runner, _, errs := fakeBoxDoors(t)
	runner.answers["node"] = ranResult{code: 0}
	if code := probeVerb(d, []string{"smoke", "--working"}); code != 0 {
		t.Errorf("the smoke road answers %d: %s", code, errs)
	}
	want := []string{"node", filepath.Join(d.root, "src", "scripts", "probe-dry.js"), "smoke", "--working"}
	if len(runner.ran) != 1 || !slices.Equal(runner.ran[0], want) {
		t.Errorf("the smoke road runs %v", runner.ran)
	}
}

func TestAnUnknownWordPrintsTheUsage(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{nil, {"nothing"}} {
		d, runner, out, errs := fakeBoxDoors(t)
		if code := probeVerb(d, argv); code != exitUsage {
			t.Errorf("%v answers %d", argv, code)
		}
		if errs.String() != probeUsage+"\n" || out.Len() != 0 || len(runner.ran) != 0 {
			t.Errorf("%v says %q and runs %v", argv, errs, runner.ran)
		}
	}
}

// Two writers appending at once tear one line, and a probe reads the rest. [[spec/design_output/log#every-writer-appends]]
func TestATornLineDropsAloneAndAMissingLogReadsAsNoRow(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	writeLog(t, root, logText(probeRowOf("info", "context", "read", nil))+"{\"at\":\"2026\n"+logText(probeRowOf("info", "compact", "ran", nil)))
	rows := probeRows(filepath.Join(root, filepath.FromSlash(sessionLog)))
	if len(rows) != 2 || rows[0].text("kind") != "context" || rows[1].text("kind") != "compact" {
		t.Errorf("the rows read %v", rows)
	}
	if got := probeRows(filepath.Join(root, "gone")); len(got) != 0 {
		t.Errorf("a missing log reads %v", got)
	}
}
