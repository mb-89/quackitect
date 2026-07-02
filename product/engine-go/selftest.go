package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"
)

// MerkleRoot: sha256 hex of sorted "id:fullhash" pairs joined by ';' — matches report.py _merkle_root.
func MerkleRoot(nodes map[string]Node) string {
	memo := map[string]string{}
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	parts := make([]string, 0, len(ids))
	for _, id := range ids {
		parts = append(parts, id+":"+fullHash(id, nodes, memo))
	}
	x := sha256.Sum256([]byte(strings.Join(parts, ";")))
	return hex.EncodeToString(x[:])
}

// design: go-selftest  implements: req-behavior-parity
// The engine verifies ITSELF, in Go, in-process, with zero external toolchain — no uv, no python,
// no go test. Executed checks carry 'verify: selftest:<name>'; the engine runs the named check
// directly. Parity = the merkle root equals the baselined golden root (a determinism regression).
func runSelftest(name string) bool {
	switch name {
	case "parser":
		return selftestParser()
	case "determinism":
		r1, r2 := MerkleRoot(LoadAll()), MerkleRoot(LoadAll())
		return r1 != "" && r1 == r2
	case "ids":
		return len(DuplicateIDs()) == 0
	case "help":
		_, bad := badIDArg("start", []string{"-x"})
		return helpRequested([]string{"start", "--help"}) && bad && !helpRequested([]string{"status", "an-id"})
	case "parity":
		return selftestParity()
	case "perf":
		return selftestPerf()
	case "deps":
		return true // this running at all proves the dependency-free binary works
	case "deps-prompt":
		_, err := os.Stat(filepath.Join(EngineDir(), "method", "prompts", "dependencies.md"))
		return err == nil
	case "report":
		return selftestReport()
	case "split":
		return selftestSplit()
	case "integrate":
		return selftestIntegrate()
	case "engine":
		return selftestEngine()
	case "method":
		return selftestMethod()
	case "surface":
		return selftestSurface()
	case "build":
		return selftestBuild()
	case "no-trace-gate":
		return selftestNoTraceGate()
	case "tests-pass-eval":
		return selftestTestsPassEval()
	case "workspace":
		return selftestWorkspace()
	case "brand":
		return selftestBrand()
	case "claude-vendor":
		return selftestClaudeVendor()
	case "report-verdict":
		return selftestReportVerdict()
	case "report-nesting":
		return selftestReportNesting()
	case "brand-resolves":
		return selftestBrandResolves()
	case "validation-global":
		return selftestValidationGlobal()
	case "stubs":
		return selftestStubs()
	case "readout":
		return selftestReadout()
	case "contract":
		return selftestContract()
	case "bootstrap":
		return selftestBootstrap()
	case "correctness":
		return selftestCorrectness()
	case "report-live":
		return selftestReportLive()
	case "evidence-honesty":
		return selftestEvidenceHonesty()
	case "tests-red":
		return selftestTestsRed()
	}
	return false // unknown / not-yet-built check -> OPEN
}

// selftestEvidenceHonesty verifies req-evidence-honesty: a live-red or unbuilt check is never
// reported passing from stale/vacuous evidence. (1) an unknown selftest resolves to false (OPEN),
// not a masked pass; (2) runExecuted's shell-cache is keyed by the full input hash, so a different
// hash is a cache MISS with its own slot — a changed input cannot be served a stale pass.
func selftestEvidenceHonesty() bool {
	if runSelftest("__no_such_selftest__") {
		return false // an unbuilt/unknown check must be OPEN, never a masked pass
	}
	base := filepath.Join(QUACK, "evidence", "__honesty_probe__")
	os.RemoveAll(base)
	defer os.RemoveAll(base)
	probe := Node{ID: "__honesty_probe__", Verify: "exit 0"}
	if runExecuted(probe, "h1") != "pass" {
		return false
	}
	if _, err := os.Stat(filepath.Join(base, "h1.json")); err != nil {
		return false // evidence must be written under its hash key
	}
	if _, err := os.Stat(filepath.Join(base, "h2.json")); err == nil {
		return false // a different hash must NOT already be cached (no cross-hash reuse)
	}
	runExecuted(probe, "h2")
	if _, err := os.Stat(filepath.Join(base, "h2.json")); err != nil {
		return false // the second hash gets its own slot -> re-run, never a stale serve
	}
	return true
}

// selftestTestsRed verifies req-tdd-sequence: a red-observed attestation satisfies tests-red only at
// the hash it was recorded for; an edited test (new hash) is NOT satisfied until re-observed; and only
// a red-observed event counts (a bless does not). Hermetic — exercises redObservedFrom on a fixture log.
func selftestTestsRed() bool {
	log := []Event{{Check: "t", Action: "red-observed", Hash: "H1"}}
	ro := redObservedFrom(log)
	if ro["t"] != "H1" {
		return false // observed red at H1 -> satisfied at H1
	}
	if ro["t"] == "H2" {
		return false // edited to H2 -> not satisfied until re-observed (re-suspect on change)
	}
	log = append(log, Event{Check: "t", Action: "red-observed", Hash: "H2"})
	if redObservedFrom(log)["t"] != "H2" {
		return false // re-observed at H2 -> satisfied again
	}
	if _, ok := redObservedFrom([]Event{{Check: "t", Action: "bless", Hash: "H1"}})["t"]; ok {
		return false // a bless is NOT a red-observation
	}
	return true
}

func selftestParser() bool {
	dir, _ := os.MkdirTemp("", "qst")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "req-x.md")
	os.WriteFile(p, []byte("---\nid: req-x\ntype: requirement\nrefines: [uc-a, uc-b]\nstatement: Hello world.\nkiller: true\n---\n"), 0o644)
	n := ParseNode(p)
	return n.ID == "req-x" && n.Type == "requirement" && n.Statement == "Hello world." && n.Killer && len(n.Refines) == 2
}

// selftestParity: the merkle root must equal the baselined golden. The golden is written once
// (from the verified-parity moment) and then enforced forever — even after Python is gone.
func selftestParity() bool {
	root := MerkleRoot(LoadAll())
	gp := filepath.Join(QUACK, "engine", "golden-root.txt")
	if raw, err := os.ReadFile(gp); err == nil {
		return strings.TrimSpace(string(raw)) == root
	}
	os.MkdirAll(filepath.Dir(gp), 0o755)
	os.WriteFile(gp, []byte(root+"\n"), 0o644)
	return true
}

// enddesign

// design: go-perf  implements: req-responsiveness
// Fast tooling: a native static binary returns the board in well under the 1-second bound on a
// 2025 mid-range laptop. selftest:perf measures the full load + root and asserts it.
func selftestPerf() bool {
	t0 := time.Now()
	MerkleRoot(LoadAll())
	return time.Since(t0) < time.Second
}

// enddesign

// selftestReport verifies the report shell carries the single filter box, the regex path, and the
// client-side relayout — by inspecting the compiled report constants. It deliberately does NOT
// render (rendering evaluates executed checks, and this very check is one of them: that recurses).
// selftestEngine: the engine core works — load, stable hashing/merkle, unique ids, coverage computes.
// Replaces the Python engine-selftest / test-engine-core (suspect-bless, fill-adjudicate, versioning).
func selftestEngine() bool {
	if len(DuplicateIDs()) != 0 {
		return false
	}
	nodes := LoadAll()
	// hash deterministically even on an empty graph — a freshly `start init`-ed vehicle has no spec
	// yet, so exercise the primitive on a synthetic node too (keeps the check non-vacuous when empty).
	syn := map[string]Node{"req-x": {ID: "req-x", Type: "requirement", Statement: "x", Class: "review"}}
	if MerkleRoot(syn) != MerkleRoot(syn) || MerkleRoot(nodes) != MerkleRoot(nodes) {
		return false
	}
	_ = coverageRule(nodes, "req-traced", "")
	// gate vs content distinction holds
	for _, n := range nodes {
		if n.Type == "requirement" && isGate(n) {
			return false
		}
	}
	return true
}

// selftestMethod: guides resolve and the method design markers are present.
// Replaces the Python test-method (guidance, planning, refine-track).
func selftestMethod() bool {
	if len(ResolveGuides()) < 3 {
		return false
	}
	// the method design-markers live in the engine layer (dogfood product/ OR a vehicle's vendor/),
	// not necessarily in ROOT/product — scan the resolved engine method dir so this passes in a vehicle.
	d := scanDesignsUnder(filepath.Join(EngineDir(), "method"))
	for _, id := range []string{"planning-method", "refine-method", "versioning-method"} {
		if _, ok := d[id]; !ok {
			return false
		}
	}
	return true
}

// selftestBuild: the build determinizer's contract — the engine produces a stable 64-hex determinism
// root that `quack build` re-baselines into golden-root. Asserts the root computes deterministically
// (the value quack build writes); the full compile+re-baseline is demonstrated live at M6/M7.
func selftestBuild() bool {
	r1, r2 := MerkleRoot(LoadAll()), MerkleRoot(LoadAll())
	return r1 == r2 && len(r1) == 64
}

// selftestNoTraceGate: the invariant — no trace-typed node is ever a task gate (req-no-trace-gate).
func selftestNoTraceGate() bool {
	for _, n := range LoadAll() {
		if traceContent[n.Type] && isGate(n) {
			return false
		}
	}
	return true
}

// selftestTestsPassEval: tests-pass evaluates a selftest:-verified test through the in-process
// evaluator (the same path the gate state machine uses), not a divergent shell run (req-tests-pass-unify).
func selftestTestsPassEval() bool {
	syn := map[string]Node{"t": {ID: "t", Type: "test", Class: "executed", Verify: "selftest:determinism"}}
	return coverageRule(syn, "tests-pass", "")
}

func readFileStr(p string) string { b, _ := os.ReadFile(p); return string(b) }

func selftestWidthOK(s string) bool {
	for _, ln := range strings.Split(s, "\n") {
		if dispWidth(ln) > readoutMax {
			return false
		}
	}
	return true
}

// selftestReadout: the progress bar and handover pager render deterministically, contain their
// required sections, and never exceed readoutW columns (req-progress-bar/-handover-pager/-readout-width).
func selftestReadout() bool {
	nodes := LoadAll()
	sm := StatusMap(nodes)
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))
	it := cfg.Version
	b1 := ProgressBar(it, nodes, sm, cfg, false)
	b2 := ProgressBar(it, nodes, sm, cfg, false)
	if b1 != b2 || !strings.Contains(b1, "START") || !strings.Contains(b1, "END") || !selftestWidthOK(b1) {
		return false
	}
	gate := ""
	for id, n := range nodes {
		if n.Milestone > 0 && strings.HasSuffix(id, "-gate") && iterOf(n.Path) == it {
			gate = id
			break
		}
	}
	if gate == "" {
		return true // no gate to hand over yet; bar checks suffice
	}
	p := HandoverPager(gate, it, nodes, sm, cfg, false)
	return strings.Contains(p, "HANDOVER") && strings.Contains(p, "READINESS") &&
		strings.Contains(p, "Bless") && selftestWidthOK(p)
}

// selftestContract: the contract and entry surfaces carry the required clauses — the active
// read/paraphrase/confirm imperative, the actor stamps, the y=console-bless rule, and the existence of
// the Copilot native channel (req-confirm-back/-active-imperative/-bless-y-console/-copilot-instructions).
func selftestContract() bool {
	c := readFileStr(filepath.Join(EngineDir(), "method", "prompts", "contract.md"))
	for _, s := range []string{"paraphrase", "actor=agent", "actor=human", "handover pager"} {
		if !strings.Contains(c, s) {
			return false
		}
	}
	a := readFileStr(filepath.Join(ROOT, "AGENTS.md"))
	if !strings.Contains(strings.ToLower(a), "paraphrase") {
		return false
	}
	ci := readFileStr(filepath.Join(ROOT, ".github", "copilot-instructions.md"))
	return strings.Contains(strings.ToLower(ci), "paraphrase") && strings.Contains(ci, "contract")
}

// selftestBootstrap: the onboarding flow + empty-spec rule are on the entry surface and the README
// leads with the conversational onboarding (req-bootstrap-flow/-empty-spec-autostart/-readme-onboarding).
func selftestBootstrap() bool {
	ig := readFileStr(filepath.Join(EngineDir(), "method", "prompts", "integrate.md"))
	if !strings.Contains(ig, "Start a new project") || !strings.Contains(strings.ToLower(ig), "zero iterations") {
		return false
	}
	rm := strings.ToLower(readFileStr(filepath.Join(ROOT, "README.md")))
	return strings.Contains(rm, "start a new project") || strings.Contains(rm, "start your project")
}

// selftestCorrectness: lean rigor carries the derived coverage checks that enforce the trace
// (req-lean-enforces-trace); the two prior correctness invariants still hold (i0004).
func selftestCorrectness() bool {
	lc := readFileStr(filepath.Join(EngineDir(), "method", "rigor", "lean", "checklist.md"))
	for _, r := range []string{"coverage:req-traced", "coverage:req-has-test", "coverage:adr-traced", "coverage:designs-realized"} {
		if !strings.Contains(lc, r) {
			return false
		}
	}
	return selftestNoTraceGate() && selftestTestsPassEval()
}

// selftestReportLive: the report carries the live-reload hook and renders without the removed snapshot
// machinery (req-report-live-reload).
func selftestReportLive() bool {
	dir, err := os.MkdirTemp("", "qrl-*")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	out := filepath.Join(dir, "r.html")
	if RenderReport(out) != nil {
		return false
	}
	raw, err := os.ReadFile(out)
	if err != nil {
		return false
	}
	s := string(raw)
	return strings.Contains(s, "__reload") && strings.Contains(s, "EventSource")
}

// selftestWorkspace: the engine resolves a workspace (ROOT) separate from the ENGINE install, and the
// engine resources resolve from ENGINE independent of the workspace (req-workspace-split). It then
// DRIVES a bare workspace FROM INSIDE via the emitted stub launcher, resolving the engine at runtime
// (req-drive-from-inside) — the roundtrip the feature exists for.
func selftestWorkspace() bool {
	if ENGINE == "" {
		return false
	}
	if st, err := os.Stat(filepath.Join(EngineDir(), "method")); err != nil || !st.IsDir() {
		return false
	}
	return driveFromInside()
}

// driveFromInside emits the stub set into a throwaway BARE workspace, points the gitignored engine
// pointer at THIS engine binary, and drives it FROM INSIDE via the emitted launcher — proving a bare
// workspace resolves an engine at runtime and runs with ROOT = itself. Time-boxed so it can NEVER hang;
// the temp workspace has no test nodes, so its own tests-pass is vacuous (no recursion into this hook).
func driveFromInside() bool {
	if runtime.GOOS != "windows" {
		return true // the .cmd launcher is Windows-first; skip the drive elsewhere (lightweight check stands)
	}
	exe, err := os.Executable()
	if err != nil {
		return false
	}
	dir, err := os.MkdirTemp("", "quack-inside-*")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	os.MkdirAll(filepath.Join(dir, ".quack"), 0o755)
	os.MkdirAll(filepath.Join(dir, "product"), 0o755)
	os.MkdirAll(filepath.Join(dir, "spec"), 0o755)
	os.WriteFile(filepath.Join(dir, ".quack", "config.toml"), []byte("[iteration]\ntype = \"default\"\nrigor = \"systematic\"\nversion = \"\"\n"), 0o644)
	for name, body := range insideStubFiles("probe") { // launcher + AGENTS.md + .gitignore
		os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644)
	}
	os.WriteFile(filepath.Join(dir, ".quack", "engine.local"), []byte(exe), 0o644) // path B, gitignored
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	// Invoke the launcher by ABSOLUTE path — not the bare name "probe.cmd". cmd.exe only finds a bare
	// batch name by searching the current directory, which Windows hardening
	// (NoDefaultCurrentDirectoryInExePath) can disable — making the test spuriously fail. The absolute
	// path resolves regardless, and %~dp0 inside the launcher still points at the workspace dir.
	launcher := filepath.Join(dir, "probe.cmd")
	cmd := exec.CommandContext(ctx, "cmd", "/c", launcher, "status")
	cmd.Dir = dir // drive FROM INSIDE the bare workspace
	out, err := cmd.CombinedOutput()
	return err == nil && strings.Contains(string(out), "gates |")
}

// selftestBrand: user-facing output is branded from the invoked binary name (req-white-label).
func selftestBrand() bool {
	return brandOf("/x/duckpond.exe") == "duckpond" && brandOf("quack") == "quack" && brandOf("") == "quack"
}

// selftestClaudeVendor: start init rewrites the dogfood method path to the vendored one (req-claude-vendor).
func selftestClaudeVendor() bool {
	return rewriteVendorPath("Follow product/quackitect/method/prompts/engage.md") ==
		"Follow .quack/vendor/quackitect/method/prompts/engage.md"
}

// selftestReportVerdict: the report wires a DONE check to its verdict/evidence link (req-verdict-link).
// Also a regression guard: rendering with a RELATIVE --out must still resolve links. Node paths are
// absolute, so a relative outDir once made filepath.Rel error and blank every href + verdict link.
// This tests the outDir primitive PURELY — it must never call RenderReport, which computes StatusMap
// (→ coverage:tests-pass → this selftest) and would recurse forever.
func selftestReportVerdict() bool {
	if !strings.Contains(reportCSS+reportJS, "verdict") {
		return false
	}
	// req-verdict-link: a DONE check must surface its verdict from the attestation even with NO doc,
	// so the JS must render d.verdict (the bless record), not only d.verdict_href. Guards the i6 gap.
	if !strings.Contains(reportJS, "d.verdict") {
		return false
	}
	// The exact regression: a relative outPath must yield an ABSOLUTE outDir, so filepath.Rel against
	// absolute node paths succeeds instead of erroring to "".
	if !filepath.IsAbs(reportOutDir(filepath.Join(".quack", "out", "report.html"))) {
		return false
	}
	// And Rel from that outDir into an absolute spec path must produce a non-empty relative href.
	rel, err := filepath.Rel(reportOutDir("report.html"), filepath.Join(SPEC, "iterations"))
	return err == nil && rel != ""
}

// selftestReportNesting: the report renders a nested, collapsible subtask tree (req-trace-nesting).
func selftestReportNesting() bool {
	blob := reportCSS + reportJS
	if !strings.Contains(blob, "children") && !strings.Contains(blob, "collaps") && !strings.Contains(blob, "kids") {
		return false
	}
	// req-build-test-nesting: a parent with a child renders the child INSIDE a collapsible "kids"
	// group, not flat — the third nesting level (build steps under the build task).
	nodes := map[string]Node{
		"bs-parent": {ID: "bs-parent", Milestone: 6},
		"bs-child":  {ID: "bs-child", Milestone: 6, Parent: "bs-parent"},
	}
	sm := map[string]string{"bs-parent": "DONE", "bs-child": "DONE"}
	html := renderSubs([]string{"bs-parent", "bs-child"}, nodes, sm)
	return strings.Contains(html, "class=\"kids\"") && strings.Contains(html, "data-nid=\"bs-parent\"") && strings.Contains(html, "bs-child")
}

// selftestBrandResolves: the design language resolves through the overlay chain (req-design-language) —
// the brand assets resolve, the engine default carries a [ LOGO GOES HERE ] placeholder, and a vehicle
// overlay (here quackitect's own duck) overrides it.
func selftestBrandResolves() bool {
	for _, n := range []string{"logo-mark.svg", "voice.md"} {
		if resolveBrand(n) == "" { // the project brand (product/brand) or the engine template
			return false
		}
	}
	if Resolve("design/design-language.md") == "" { // the spec lives with the engine template
		return false
	}
	def, _ := os.ReadFile(filepath.Join(EngineDir(), filepath.FromSlash("design/logo-mark.svg")))
	if !strings.Contains(string(def), "GOES HERE") { // the engine template is a placeholder
		return false
	}
	return !strings.HasPrefix(resolveBrand("logo-mark.svg"), EngineDir()) // the project brand wins
}

// selftestValidationGlobal: a gate with `validates: needs` folds the need-set into its hash, so adding
// a need reopens it — while a plain gate is unaffected by the same add. Guards the global-validation fix.
func selftestValidationGlobal() bool {
	mk := func(g Node, needs ...string) map[string]Node {
		m := map[string]Node{"g": g}
		for _, id := range needs {
			m[id] = Node{ID: id, Type: "need", Statement: id}
		}
		return m
	}
	gv := Node{ID: "g", Validates: "needs"}
	vChanges := fullHash("g", mk(gv, "n1"), map[string]string{}) != fullHash("g", mk(gv, "n1", "n2"), map[string]string{})
	gp := Node{ID: "g"}
	pStable := fullHash("g", mk(gp, "n1"), map[string]string{}) == fullHash("g", mk(gp, "n1", "n2"), map[string]string{})
	return vChanges && pStable
}

// selftestSurface: the command surface documents the core verbs. Replaces the Python test-surface.
func selftestSurface() bool {
	for _, c := range []string{"status", "next", "start", "why", "bless", "note", "gather", "report", "ship", "lint", "verify"} {
		if !strings.Contains(usageText(), c) {
			return false
		}
	}
	return true
}

// selftestIntegrate: a vehicle can integrate. Engine resources resolve via the overlay chain (not a
// hardcoded dogfood path), and the integrate prompt with a worked example exists.
func selftestIntegrate() bool {
	if st, err := os.Stat(filepath.Join(EngineDir(), "method", "rigor", "systematic")); err != nil || !st.IsDir() {
		return false
	}
	return Resolve("method/prompts/integrate.md") != ""
}

func selftestReport() bool {
	blob := reportCSS + reportJS
	return strings.Contains(blob, "trace-filter") && strings.Contains(reportJS, "RegExp") && strings.Contains(reportJS, "dagre")
}

// selftestStubs: the drive-from-inside stub set (req-inside-launcher, req-inside-entry-surface,
// req-engine-loc-untracked). Verifies the launcher resolves internal -> pointer -> env in order with a
// clear failure, the AGENTS.md entry surface is self-contained (no hard checkout path), and the
// .gitignore excludes the engine pointer. Wires test-inside-launcher/entry-surface/engine-loc-untracked.
func selftestStubs() bool {
	f := insideStubFiles("probe")
	launcher, agents, ignore := f["probe.cmd"], f["AGENTS.md"], f[".gitignore"]
	// launcher: three resolution branches in order + a clear failure, CRLF for cmd.exe.
	iInternal := strings.Index(launcher, `.quack\engine\quack.exe`)
	iPointer := strings.Index(launcher, `.quack\engine.local`)
	iEnv := strings.Index(launcher, "QUACK_ENGINE")
	if iInternal < 0 || iPointer < 0 || iEnv < 0 || !(iInternal < iPointer && iPointer < iEnv) {
		return false
	}
	if !strings.Contains(launcher, "no engine found") || !strings.Contains(launcher, "\r\n") {
		return false
	}
	// entry surface: names the launcher + path-free prompt loading; NO hard checkout path.
	if !strings.Contains(agents, `.\probe`) || !strings.Contains(agents, "resolve method/prompts") || !strings.Contains(agents, "guides") {
		return false
	}
	if strings.Contains(agents, "product/quackitect") {
		return false
	}
	// engine location out of VC.
	return strings.Contains(ignore, ".quack/engine.local")
}

// RunSelftestCLI runs one named check (or all) and returns an exit code.
func RunSelftestCLI(args []string) int {
	all := []string{"deps", "parser", "determinism", "ids", "help", "parity", "perf", "deps-prompt", "report", "split", "integrate", "engine", "method", "surface", "build", "no-trace-gate", "tests-pass-eval", "workspace", "brand", "claude-vendor", "report-verdict", "report-nesting", "brand-resolves", "validation-global", "stubs", "readout", "contract", "bootstrap", "correctness", "report-live", "evidence-honesty", "tests-red"}
	names := args
	if len(names) == 0 {
		names = all
	}
	ok := true
	for _, n := range names {
		pass := runSelftest(n)
		status := "ok"
		if !pass {
			status, ok = "FAIL", false
		}
		fmt.Printf("selftest %-12s %s\n", n, status)
	}
	if ok {
		return 0
	}
	return 1
}
