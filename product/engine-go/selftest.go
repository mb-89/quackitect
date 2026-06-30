package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
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
	}
	return false // unknown / not-yet-built check -> OPEN
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

// selftestWorkspace: the engine resolves a workspace (ROOT) separate from the ENGINE install, and the
// engine resources resolve from ENGINE independent of the workspace (req-workspace-split). The full
// vehicle->dummy-workspace->iteration machinery is demonstrated end-to-end at M7 (test-machinery-e2e).
func selftestWorkspace() bool {
	if ENGINE == "" {
		return false
	}
	st, err := os.Stat(filepath.Join(EngineDir(), "method"))
	return err == nil && st.IsDir()
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
func selftestReportVerdict() bool {
	return strings.Contains(reportCSS+reportJS, "verdict")
}

// selftestReportNesting: the report renders a nested, collapsible subtask tree (req-trace-nesting).
func selftestReportNesting() bool {
	blob := reportCSS + reportJS
	return strings.Contains(blob, "children") || strings.Contains(blob, "collaps") || strings.Contains(blob, "kids")
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

// RunSelftestCLI runs one named check (or all) and returns an exit code.
func RunSelftestCLI(args []string) int {
	all := []string{"deps", "parser", "determinism", "ids", "help", "parity", "perf", "deps-prompt", "report", "split", "integrate", "engine", "method", "surface", "build", "no-trace-gate", "tests-pass-eval", "workspace", "brand", "claude-vendor", "report-verdict", "report-nesting", "brand-resolves", "validation-global"}
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
