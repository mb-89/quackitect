package main

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// i10Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i10Tests = []namedTest{
	{"verify-cache", selftestVerifyCache},
	{"verify-feedback", selftestVerifyFeedback},
	{"status-fast", selftestStatusFast},
	{"why-derived", selftestWhyDerived},
	{"notes-list", selftestNotesList},
	{"call-log", selftestCallLog},
	{"mint-dedupe", selftestMintDedupe},
	{"mint-rationale", selftestMintRationale},
	{"ratchet-semantic", selftestRatchetSemantic},
	{"scaffold-modern", selftestScaffoldModern},
	{"pager-merge", selftestPagerMerge},
	{"user-wording", selftestUserWording},
}

// test-verify-cache -> selftest:verify-cache
func selftestVerifyCache() bool {
	dir, err := os.MkdirTemp("", "qvc")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldPath, oldMemo := verdictPathOverride, verdictsMemo
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	defer func() { verdictPathOverride, verdictsMemo = oldPath, oldMemo }()

	verdictRecord("t1", "h1", true, time.Millisecond)
	if pass, ok := verdictLookup("t1", "h1"); !ok || !pass {
		return false // unchanged inputs + unchanged build -> HIT
	}
	if _, ok := verdictLookup("t1", "h2"); ok {
		return false // edited input hash -> MISS
	}
	saved := buildID()
	buildIDMemo = saved + "-next-build"
	_, hitAfterRebuild := verdictLookup("t1", "h1")
	buildIDMemo = saved
	if hitAfterRebuild {
		return false // new build identity -> MISS
	}
	verdictsMemo = nil // drop the in-process memo: the record must survive on disk
	if pass, ok := verdictLookup("t1", "h1"); !ok || !pass {
		return false
	}
	verdictRecord("t2", "hx", false, time.Millisecond)
	if pass, ok := verdictLookup("t2", "hx"); !ok || pass {
		return false // a red verdict is as cacheable as a green one
	}
	return true
}

// test-verify-feedback -> selftest:verify-feedback
func selftestVerifyFeedback() bool {
	dir, err := os.MkdirTemp("", "qvf")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldPath, oldMemo, oldW, oldAnn := verdictPathOverride, verdictsMemo, feedbackW, rerunAnnounced
	var buf bytes.Buffer
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	feedbackW = &buf
	rerunAnnounced = false
	defer func() {
		verdictPathOverride, verdictsMemo, feedbackW, rerunAnnounced = oldPath, oldMemo, oldW, oldAnn
	}()

	runSelftestCached("test-probe", "ids", "h1") // miss -> must announce BEFORE running
	if !strings.Contains(buf.String(), "re-running") {
		return false
	}
	mark := buf.Len()
	runSelftestCached("test-probe", "ids", "h1") // hit -> fully cached, must stay silent
	if buf.Len() != mark {
		return false
	}
	announceSlow("test-slow", 2*time.Second) // a >1s test is named
	if !strings.Contains(buf.String(), "test-slow") {
		return false
	}
	rerunAnnounced = false
	buf.Reset()
	announceSlow("test-fast", 200*time.Millisecond) // a fast test is not
	return buf.Len() == 0
}

// test-why-derived -> selftest:why-derived
func selftestWhyDerived() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "x.md")
	syn := map[string]Node{
		"need-n": {ID: "need-n", Type: "need", Path: iterPath},
		"uc-a":   {ID: "uc-a", Type: "usecase", Refines: []string{"need-n"}, Path: iterPath},
		"req-a":  {ID: "req-a", Type: "requirement", Refines: []string{"uc-a"}, Path: iterPath},
	}
	savedMemo := coverageMemo
	defer func() { coverageMemo = savedMemo }()
	coverageMemo = map[string]bool{} // the memo assumes ONE immutable graph per process; isolate it
	lines := strings.Join(whyCoverage(syn, "req-has-test", ""), "\n")
	if !strings.Contains(lines, "req-has-test") || !strings.Contains(lines, "FALSE") {
		return false // the rule and its answer are named
	}
	if !strings.Contains(lines, "req-a") || !strings.Contains(lines, "has no test") {
		return false // the delta names the offender
	}
	if strings.Contains(lines, "fresh") {
		return false // the fresh-nothing-changed answer is dead for this class
	}
	syn["test-a"] = Node{ID: "test-a", Type: "test", Verifies: []string{"req-a"}, Path: iterPath}
	coverageMemo = map[string]bool{}
	lines = strings.Join(whyCoverage(syn, "req-has-test", ""), "\n")
	return strings.Contains(lines, "TRUE") && strings.Contains(lines, "delta: none")
}

// test-notes-list -> selftest:notes-list
func selftestNotesList() bool {
	dir, err := os.MkdirTemp("", "qnl")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	old := notesHomeOverride
	notesHomeOverride = dir
	defer func() { notesHomeOverride = old }()
	note := "---\nid: NOTE-X\ncreated: " + time.Now().Add(-3*time.Hour).Format(time.RFC3339) + "\norigin: t\nstatus: inbox\n---\n\nfirst line of the body\nsecond line\n"
	os.MkdirAll(filepath.Join(dir, "inbox"), 0o755)
	os.MkdirAll(filepath.Join(dir, "backlog"), 0o755)
	os.WriteFile(filepath.Join(dir, "inbox", "NOTE-X.md"), []byte(note), 0o644)
	os.WriteFile(filepath.Join(dir, "backlog", "NOTE-B.md"), []byte(strings.Replace(note, "NOTE-X", "NOTE-B", 1)), 0o644)
	inbox := strings.Join(notesList(false), "\n")
	if !strings.Contains(inbox, "notes home:") || !strings.Contains(inbox, "NOTE-X") {
		return false // location + id
	}
	if !strings.Contains(inbox, "[3h]") || !strings.Contains(inbox, "first line of the body") {
		return false // age + first body line
	}
	if strings.Contains(inbox, "NOTE-B") {
		return false // backlog stays out without --all
	}
	all := strings.Join(notesList(true), "\n")
	return strings.Contains(all, "NOTE-B") && strings.Contains(all, "backlog")
}

// test-call-log -> selftest:call-log
func selftestCallLog() bool {
	dir, err := os.MkdirTemp("", "qcl")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldPath, oldCmd, oldLogged, oldArgs, oldT0 := callLogPathOverride, callCmd, callLogged, callArgs, callT0
	callLogPathOverride = filepath.Join(dir, "calls.jsonl")
	defer func() {
		callLogPathOverride, callCmd, callLogged, callArgs, callT0 = oldPath, oldCmd, oldLogged, oldArgs, oldT0
	}()

	callLogStart("bless", []string{"i10-x", "--key", "qk-SECRET-VALUE", "--by", "human"})
	callLogWrite(0)
	raw, err := os.ReadFile(callLogPathOverride)
	if err != nil {
		return false
	}
	s := string(raw)
	if !strings.Contains(s, `"cmd":"bless"`) || strings.Contains(s, "qk-SECRET-VALUE") || !strings.Contains(s, "REDACTED") {
		return false // command recorded, secret value never at rest
	}
	if !strings.Contains(s, `"exit":0`) || !strings.Contains(s, `"channel"`) || !strings.Contains(s, `"ms"`) {
		return false
	}
	callLogWrite(1) // a second write for the same dispatch is suppressed
	if raw2, _ := os.ReadFile(callLogPathOverride); len(raw2) != len(raw) {
		return false
	}
	callLogStart("attest", []string{"GRANT-ABC123"})
	callLogWrite(3)
	raw3, _ := os.ReadFile(callLogPathOverride)
	s3 := string(raw3)
	return strings.Count(s3, "\n") == 2 && !strings.Contains(s3, "GRANT-ABC123") && strings.Contains(s3, `"exit":3`)
}

// test-mint-dedupe -> selftest:mint-dedupe
func selftestMintDedupe() bool {
	if sugarAddresses(scrapSink) != scrapSink || sugarAddresses("") != scrapSink {
		return false // the sink lands exactly once, even when it is the target
	}
	if sugarAddresses("req-x") != "req-x, "+scrapSink {
		return false
	}
	body := mintBody("adr", "adr-t", map[string]string{"addresses": sugarAddresses(scrapSink)}, false)
	return strings.Count(body, scrapSink) == 1
}

// test-mint-rationale -> selftest:mint-rationale
func selftestMintRationale() bool {
	with := mintBody("adr", "adr-t", map[string]string{"addresses": "req-x", "rationale": "because the spike proved it"}, false)
	if !strings.Contains(with, "## Rationale (not load-bearing)\nbecause the spike proved it") {
		return false
	}
	without := mintBody("adr", "adr-t", map[string]string{"addresses": "req-x"}, false)
	return strings.Contains(without, "## Rationale (not load-bearing)\nTODO")
}

// test-ratchet-semantic -> selftest:ratchet-semantic
func selftestRatchetSemantic() bool {
	dir, err := os.MkdirTemp("", "qrs")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	src := filepath.Join(dir, "vendored")
	os.MkdirAll(src, 0o755)
	exe := filepath.Join(dir, "quack.exe")
	os.WriteFile(exe, []byte("bin"), 0o755)

	// fresh clone of OLD source: stamp CONTENT is old, file mtime is now — must NOT rebuild backward
	os.WriteFile(stampFile(src), []byte("2026-07-01T10:00:00Z\n"), 0o644)
	os.WriteFile(exe+".stamp", []byte("2026-07-03T09:00:00Z\n"), 0o644)
	if ratchetDecision(src, exe) {
		return false
	}
	// genuinely newer vendored source -> ratchets forward
	os.WriteFile(stampFile(src), []byte("2026-07-05T12:00:00Z\n"), 0o644)
	if !ratchetDecision(src, exe) {
		return false
	}
	// unstamped binary defers to a stamped source (one hop onto the stamp regime)
	os.Remove(exe + ".stamp")
	if !ratchetDecision(src, exe) {
		return false
	}
	// pre-stamp source is never newer, whatever the mtimes say
	os.Remove(stampFile(src))
	return !ratchetDecision(src, exe)
}

// test-scaffold-modern -> selftest:scaffold-modern
func selftestScaffoldModern() bool {
	dir, err := os.MkdirTemp("", "qsm")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	target := filepath.Join(dir, "duckpond")
	if initVehicleFiles(target) != nil {
		return false
	}
	for _, p := range []string{
		filepath.Join(target, "spec", "project.toml"),
		filepath.Join(target, "tools", "vendor", "engine-go", "engine-stamp.txt"),
		filepath.Join(target, "tools", "vendor", "quackitect", "method", "prompts", "contract.md"),
	} {
		if _, err := os.Stat(p); err != nil {
			return false // root marker, stamped vendored source, and the contract must all ride
		}
	}
	if dirExists(filepath.Join(target, ".quack")) {
		return false // the no-.quack world, emitted as such
	}
	agents, _ := os.ReadFile(filepath.Join(target, "AGENTS.md"))
	if !strings.Contains(string(agents), "tools/vendor/quackitect/method/prompts/contract.md") ||
		!strings.Contains(string(agents), "RECITE") {
		return false // the hub commands the ritual on the vendored contract
	}
	claude, _ := os.ReadFile(filepath.Join(target, "CLAUDE.md"))
	copilot, _ := os.ReadFile(filepath.Join(target, ".github", "copilot-instructions.md"))
	if !strings.Contains(string(claude), "AGENTS.md") || !strings.Contains(string(copilot), "AGENTS.md") {
		return false // pointer chain unbroken
	}
	launcher, _ := os.ReadFile(filepath.Join(target, "duckpond.cmd"))
	l := string(launcher)
	if !strings.Contains(l, `quackitect\bin\duckpond.exe`) || !strings.Contains(l, `tools\vendor\engine-go`) {
		return false // global-bin launcher, bootstrapping from the vendored source
	}
	if runtime.GOOS != "windows" {
		return true // the .cmd drive is Windows-first; the shape assertions above stand
	}
	exe, err := os.Executable()
	if err != nil {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "cmd", "/c", filepath.Join(target, "duckpond.cmd"), "status")
	cmd.Dir = target // drive FROM INSIDE via the QUACK_ENGINE seam (stands in for the global binary)
	cmd.Env = append(os.Environ(), "QUACK_ENGINE="+exe, "QUACK_RATCHETED=1")
	out, err := cmd.CombinedOutput()
	return err == nil && strings.Contains(string(out), "gates |")
}

// test-pager-merge -> selftest:pager-merge
func selftestPagerMerge() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "tasks", "x.md")
	nodes := map[string]Node{
		"i1-m6-done-a": {ID: "i1-m6-done-a", Milestone: 6, Class: "review", Path: iterPath},
		"i1-m6-killer": {ID: "i1-m6-killer", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m6-done-a"}},
		"i1-m6-gate":   {ID: "i1-m6-gate", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m6-done-a", "i1-m6-killer"}},
	}
	sm := map[string]string{"i1-m6-done-a": "DONE", "i1-m6-killer": "OPEN", "i1-m6-gate": "OPEN"}
	ks, g := pagerGroup("i1-m6-gate", nodes, sm)
	if len(ks) != 1 || ks[0] != "i1-m6-killer" || g != "i1-m6-gate" {
		return false // asking from the gate side finds the ready group
	}
	ks, g = pagerGroup("i1-m6-killer", nodes, sm)
	if len(ks) != 1 || ks[0] != "i1-m6-killer" || g != "i1-m6-gate" {
		return false // asking from the subtask side finds the same group
	}
	sm["i1-m6-done-a"] = "OPEN" // agent-blessable work still open -> no merge yet
	if ks, _ := pagerGroup("i1-m6-gate", nodes, sm); len(ks) != 0 {
		return false
	}
	sm["i1-m6-done-a"] = "DONE"
	// TWO ready killers + the gate merge as one group (order is not dependency: flat wiring).
	nodes["i1-m6-killer2"] = Node{ID: "i1-m6-killer2", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m6-done-a"}}
	nodes["i1-m6-gate"] = Node{ID: "i1-m6-gate", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m6-done-a", "i1-m6-killer", "i1-m6-killer2"}}
	sm["i1-m6-killer2"] = "OPEN"
	ks, g = pagerGroup("i1-m6-gate", nodes, sm)
	if len(ks) != 2 || g != "i1-m6-gate" {
		return false
	}
	delete(nodes, "i1-m6-killer2")
	delete(sm, "i1-m6-killer2")
	nodes["i1-m6-gate"] = Node{ID: "i1-m6-gate", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m6-done-a", "i1-m6-killer"}}
	out := HandoverPager("i1-m6-killer", "i0001_syn", nodes, sm, Config{}, false)
	return strings.Contains(out, "i1-m6-killer + i1-m6-gate") && strings.Contains(out, "y = all")
}

// design: go-user-wording  implements: req-user-wording
// The sweep's enforcement: every prose/prompt/entry surface is scanned line by line; the word
// "human" survives only inside the frozen recorded vocabulary (adr-stamp-vocabulary) or voice.md's
// mention of the banned phrase. The two retired CLI display strings are asserted dead.
// test-user-wording -> selftest:user-wording
func selftestUserWording() bool {
	// The allowlist is exactly the recorded vocabulary (adr-stamp-vocabulary) plus voice.md's
	// mention-not-use of the banned phrase.
	allowed := []string{"actor=human", "--by human", "adjudicated_by: human", "human|agent", `"human vs agent"`}
	lineOK := func(ln string) bool {
		if !strings.Contains(strings.ToLower(ln), "human") {
			return true
		}
		stripped := ln
		for _, a := range allowed {
			stripped = strings.ReplaceAll(stripped, a, "")
		}
		return !strings.Contains(strings.ToLower(stripped), "human")
	}
	var files []string
	for _, root := range []string{filepath.Join(EngineDir(), "method"), filepath.Join(EngineDir(), "project_types"), filepath.Join(ROOT, "product", "brand")} {
		filepath.Walk(root, func(p string, fi os.FileInfo, err error) error {
			if err == nil && !fi.IsDir() && strings.HasSuffix(p, ".md") {
				files = append(files, p)
			}
			return nil
		})
	}
	files = append(files, filepath.Join(ROOT, "AGENTS.md"), filepath.Join(ROOT, "CLAUDE.md"),
		filepath.Join(ROOT, "README.md"), filepath.Join(ROOT, ".github", "copilot-instructions.md"))
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		for _, ln := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
			if !lineOK(ln) {
				return false
			}
		}
	}
	// CLI display strings: the two known offenders stay dead (needles split so THIS file never matches).
	var goBlob strings.Builder
	filepath.Walk(EngineSrc(), func(p string, fi os.FileInfo, err error) error {
		if err == nil && !fi.IsDir() && strings.HasSuffix(p, ".go") {
			if b, e := os.ReadFile(p); e == nil {
				goBlob.Write(b)
			}
		}
		return nil
	})
	s := goBlob.String()
	return !strings.Contains(s, "(human-"+"adjudicated)") && !strings.Contains(s, "ask the "+"human")
}

// enddesign

// test-status-fast -> selftest:status-fast
// Runs INSIDE the battery it measures — statusFastBusy bounds the recursion (report-live pattern).
var statusFastBusy bool

func selftestStatusFast() bool {
	if statusFastBusy {
		return true
	}
	statusFastBusy = true
	defer func() { statusFastBusy = false }()
	nodes := LoadAll()
	// The property: with a WARM verdict cache, status completes within the one-second
	// bound. The warm cache is built BY CONSTRUCTION into a temp store — every executed
	// selftest check present at its current input hash and build — never by re-running
	// the battery: a warm-up call would re-run every cache-missed sibling and pay ~14s
	// inside this one check. The timed run still walks the honest warm path
	// of a fresh process: load the verdicts from disk, hash every check, compute every
	// gate state and coverage rule. Verdict VALUES are irrelevant to the timing; the
	// fabricated greens live only in the throwaway override store.
	memo := map[string]string{}
	warm := map[string]verdictRec{}
	for id, n := range nodes {
		if n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") {
			warm[id] = verdictRec{Input: fullHash(id, nodes, memo), Build: buildID(), Result: true}
		}
	}
	dir, err := os.MkdirTemp("", "qsf")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	b, err := json.MarshalIndent(warm, "", " ")
	if err != nil {
		return false
	}
	vp := filepath.Join(dir, "verdicts.json")
	if os.WriteFile(vp, b, 0o644) != nil {
		return false
	}
	oldPath, oldMemo, oldCov := verdictPathOverride, verdictsMemo, coverageMemo
	verdictPathOverride, verdictsMemo, coverageMemo = vp, nil, map[string]bool{}
	defer func() { verdictPathOverride, verdictsMemo, coverageMemo = oldPath, oldMemo, oldCov }()
	t0 := time.Now()
	StatusMap(nodes)
	return time.Since(t0) < time.Second
}
