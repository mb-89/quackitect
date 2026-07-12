package main

// i18_red2.go — the i0018_mcp_apply mechanical requirements, in battery order.
// The five checks here close the coverage holes and gate the behaviour changes
// req-apply-default-lane, req-await-console-exit, req-informed-by-edges,
// req-lint-exit-honest, and req-report-debounce. Each arrives RED at M6 (an
// unbuilt selftest resolves to false) and is filled beside its design region.

import (
	"os"
	"path/filepath"
	"strings"
	"time"
)

var i18bTests = []namedTest{
	{"apply-default-lane", selftestApplyDefaultLane},
	{"await-console-exit", selftestAwaitConsoleExit},
	{"informed-by-edges", selftestInformedByEdges},
	{"lint-exit-honest", selftestLintExitHonest},
	{"report-debounce", selftestReportDebounce},
}

// selftest:apply-default-lane — a doc-test over the SHIPPED method prose (test-apply-default-lane,
// req-apply-default-lane), same family as selftest:contract. It asserts the shared implementation
// fragment names quack apply the DEFAULT lane for a mechanical bulk edit, keeps editor tooling for a
// single edit, and records the byte-safe scripted lane as the exception.
func selftestApplyDefaultLane() bool {
	s := readFileStr(filepath.Join(EngineDir(), "method", "rigor", "_shared", "implementation.md"))
	low := strings.ToLower(s)
	if !strings.Contains(s, "quack apply") {
		return false
	}
	for _, sub := range []string{"default lane", "mechanical bulk edit", "editor tooling", "single edit", "exception"} {
		if !strings.Contains(low, sub) {
			return false
		}
	}
	return true
}

// selftest:await-console-exit — the away-mode exit rule (test-await-console-exit,
// req-await-console-exit) on a HERMETIC call log. It stands up a temp call-log file behind the
// selftest seam and asserts: an empty/unchanged log is NOT a foreign call; a line appended by
// another process (the awaiter writes its own line only at exit) DOES end the await; and the
// handback message names the drain-mode return.
func selftestAwaitConsoleExit() bool {
	dir, err := os.MkdirTemp("", "q18await")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	save := callLogPathOverride
	callLogPathOverride = filepath.Join(dir, "calls.jsonl")
	defer func() { callLogPathOverride = save }()

	base := callLogLineCount() // no log yet
	if base != 0 || awaitForeignCall(base) {
		return false // nothing logged: the await must keep waiting
	}
	// another process logs an engine call on this workspace
	if err := os.WriteFile(callLogPathOverride, []byte(`{"cmd":"status","channel":"user"}`+"\n"), 0o644); err != nil {
		return false
	}
	if !awaitForeignCall(base) {
		return false // the foreign call must end the await
	}
	// re-baselining after the handback sees no further foreign call
	if awaitForeignCall(callLogLineCount()) {
		return false
	}
	return strings.Contains(strings.ToLower(awaitHandbackMsg()), "drain")
}

// selftest:informed-by-edges — the first-class decision→model-element link (test-informed-by-edges,
// req-informed-by-edges) on a HERMETIC fixture graph. It asserts all three numbered statements:
//  1. a model node and a declared model element are first-class addresses targets;
//  2. the rendered informed-by list LEADS with the decision holding a first-class edge, and keeps
//     the name-derived citation only for the decision without one;
//  3. an addresses edge to a design region no model declares is a dangling model target the lint flags.
func selftestInformedByEdges() bool {
	dir, err := os.MkdirTemp("", "q18ibe")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	modelPath := filepath.Join(dir, "model-x.md")
	modelSrc := "---\nid: model-x\ntype: model\nkind: layers-flow\nstatement: fixture\n---\n" +
		"```mermaid\nflowchart TD\n  el-one[\"first\"]\n  el-two[\"second\"]\n```\n"
	if err := os.WriteFile(modelPath, []byte(modelSrc), 0o644); err != nil {
		return false
	}
	nodes := map[string]Node{
		"model-x":    {ID: "model-x", Type: "model", Kind: "layers-flow", Path: modelPath},
		"adr-fc":     {ID: "adr-fc", Type: "adr", Kind: "architecture", Statement: "the transport shall stand.", Addresses: []string{"el-one"}},
		"adr-name":   {ID: "adr-name", Type: "adr", Kind: "architecture", Statement: "the el-two element shall hold."},
		"adr-dangle": {ID: "adr-dangle", Type: "adr", Kind: "architecture", Statement: "an orphan.", Addresses: []string{"go-orphan"}},
		"go-orphan":  {ID: "go-orphan", Type: "design", Implements: []string{"req-x"}},
	}
	// 1. a model node and a declared element are first-class; a design region no model declares is not
	elems := modelDeclaredElements(nodes)
	if !elems["el-one"] || !elems["el-two"] {
		return false
	}
	if !addressFirstClass("model-x", nodes, elems) || !addressFirstClass("el-one", nodes, elems) {
		return false
	}
	if addressFirstClass("go-orphan", nodes, elems) {
		return false
	}
	// the first-class informing set is exactly the edge-holder
	fc := firstClassInformedBy("model-x", []string{"el-one", "el-two"}, nodes)
	if len(fc) != 1 || fc[0] != "adr-fc" {
		return false
	}
	// 2. the render leads with the first-class edge, then the name-derived citation
	html := renderModelInformed("model-x", modelSrc, nodes)
	iFC, iName := strings.Index(html, "adr-fc"), strings.Index(html, "adr-name")
	if iFC < 0 || iName < 0 || iFC > iName {
		return false
	}
	// 3. an addresses edge to a design region no model declares is a dangling model target
	hit := false
	for _, f := range informedByDanglingFindings(nodes) {
		if strings.Contains(f, "adr-dangle") && strings.Contains(f, "go-orphan") {
			hit = true
		}
	}
	return hit
}

// selftest:lint-exit-honest — the three-code exit contract (test-lint-exit-honest,
// req-lint-exit-honest), bound statement by statement:
//  1. advisories and no findings -> 0;
//  2. one or more findings -> 1;
//  3. a graph refused at load -> 2 (the refusal dominates any finding count).
func selftestLintExitHonest() bool {
	return lintExitCode(false, 0) == 0 && // clean OR advisory-only
		lintExitCode(false, 1) == 1 && // a finding
		lintExitCode(false, 9) == 1 && // many findings
		lintExitCode(true, 0) == 2 && // refused graph
		lintExitCode(true, 5) == 2 // refused dominates
}

// selftest:report-debounce — the bless-render debounce (test-report-debounce, req-report-debounce).
// It asserts the pure rule and the stamp-backed wave-collapse on a HERMETIC stamp file: a refresh
// inside the interval of the last render is SKIPPED, one outside it renders and re-arms the stamp.
func selftestReportDebounce() bool {
	iv := reportDebounceInterval
	t0 := time.Now()
	if reportRenderDue(t0, t0.Add(iv-time.Second)) { // inside the interval -> not due
		return false
	}
	if !reportRenderDue(t0, t0.Add(iv+time.Second)) { // outside the interval -> due
		return false
	}
	dir, err := os.MkdirTemp("", "q18deb")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	save := reportDebounceStampOverride
	reportDebounceStampOverride = filepath.Join(dir, "last-render")
	defer func() { reportDebounceStampOverride = save }()

	now := time.Now()
	if !blessReportRefreshDue(now) { // first render (no stamp) is due, arms the stamp
		return false
	}
	if blessReportRefreshDue(now) { // a second bless in the wave, inside the interval -> skipped
		return false
	}
	return blessReportRefreshDue(now.Add(iv + time.Second)) // outside the interval -> renders again
}
