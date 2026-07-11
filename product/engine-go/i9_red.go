package main

// i9_red.go — the i0009 selftest probes. Stateful attest probes point attestStateOverride
// at a temp dir so they stay hermetic.

import (
	"os"
	"path/filepath"
	"strings"
	"unicode"
)

// i9Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i9Tests = []namedTest{
	{"attest-block", selftestAttestBlock},
	{"attest-console", selftestAttestConsole},
	{"attest-challenge", selftestAttestChallenge},
	{"attest-grant", selftestAttestGrant},
	{"attest-renewal", selftestAttestRenewal},
	{"attest-keys", selftestAttestKeys},
	{"attest-expiry", selftestAttestExpiry},
	{"contract-render", selftestContractRender},
	{"render-drift", selftestRenderDrift},
	{"logs-canonical", selftestLogsCanonical},
	{"data-dir-caches", selftestDataDirCaches},
	{"truth-in-spec", selftestTruthInSpec},
	{"root-marker", selftestRootMarker},
	{"clean-status", selftestCleanStatus},
	{"global-config", selftestGlobalConfig},
	{"global-binary", selftestGlobalBinary},
	{"engine-ratchet", selftestEngineRatchet},
	{"notes-out", selftestNotesOut},
	{"decisions-folder", selftestDecisionsFolder},
	{"decision-classes", selftestDecisionClasses},
	{"parked-list", selftestParkedList},
	{"decision-realized", selftestDecisionRealized},
	{"mint", selftestMint},
	{"report-why", selftestReportWhy},
	{"report-filter-ux", selftestReportFilterUX},
	{"vv-time-scope", selftestVVTimeScope},
}

var attestStateOverride string // selftests point this at a temp dir; empty = real home

// ---------------------------------------------------------------------------
// the probes — one per i9 executed test node
// ---------------------------------------------------------------------------

func i9TempState(tag string) func() {
	d := filepath.Join(os.TempDir(), "quack-i9-selftest-"+tag)
	os.RemoveAll(d)
	os.MkdirAll(d, 0o755)
	attestStateOverride = d
	return func() { attestStateOverride = ""; os.RemoveAll(d) }
}

// test-attest-block -> selftest:attest-block
func selftestAttestBlock() bool {
	for _, cmd := range []string{"bless", "next", "start", "ship", "observe-red"} {
		if !attestRequired(cmd, false) {
			return false
		}
	}
	for _, cmd := range []string{"status", "report", "progress", "why", "lint", "selftest", "version", "gather"} {
		if attestRequired(cmd, false) {
			return false
		}
	}
	p := attestContractPath()
	return p != "" && strings.Contains(p, "contract.md")
}

// test-console-exempt -> selftest:attest-console
func selftestAttestConsole() bool {
	for _, cmd := range []string{"bless", "next", "start", "ship"} {
		if attestRequired(cmd, true) {
			return false
		}
	}
	return attestRequired("bless", false) // guards a vacuous always-false pass
}

// test-attest-challenge -> selftest:attest-challenge
func selftestAttestChallenge() bool {
	defer i9TempState("challenge")()
	c, err := attestChallenge("nonce-1")
	if err != nil || c == "" {
		return false
	}
	ans, err := attestCorrectAnswer(c)
	if err != nil || ans == "" {
		return false
	}
	if !attestAnswerOK(c, ans) || attestAnswerOK(c, ans+"x") {
		return false
	}
	hasLetter := false // only letter-bearing words are askable
	for _, r := range ans {
		if unicode.IsLetter(r) {
			hasLetter = true
		}
	}
	c2, err := attestChallenge("nonce-2")
	return hasLetter && err == nil && c2 != c // nonce varies the challenge
}

// test-attest-grant -> selftest:attest-grant
func selftestAttestGrant() bool {
	defer i9TempState("grant")()
	code, err := attestMintGrant()
	if err != nil || code == "" {
		return false
	}
	c, _ := attestChallenge(code) // the challenge binds to the code being redeemed
	ans, _ := attestCorrectAnswer(c)
	if _, err := attestRedeem(code, ans+"x"); err == nil {
		return false // a wrong answer never redeems
	}
	key, err := attestRedeem(code, ans)
	if err != nil || key == "" {
		return false
	}
	if _, err := attestRedeem(code, ans); err == nil {
		return false // a grant code is single-use
	}
	return attestKeyValid(key)
}

// test-attest-renewal -> selftest:attest-renewal
func selftestAttestRenewal() bool {
	defer i9TempState("renew")()
	code, err := attestMintGrant()
	if err != nil {
		return false
	}
	c, _ := attestChallenge(code)
	ans, _ := attestCorrectAnswer(c)
	k1, err := attestRedeem(code, ans)
	if err != nil {
		return false
	}
	c2, _ := attestChallenge(k1) // renewal answers the challenge bound to the renewing key
	ans2, _ := attestCorrectAnswer(c2)
	k2, err := attestRenew(k1, ans2)
	if err != nil || k2 == "" || k2 == k1 {
		return false
	}
	if _, err := attestRenew(k1, ans2); err == nil {
		return false // a superseded key cannot renew again
	}
	return attestKeyValid(k2) && !attestKeyValid(k1)
}

// test-attest-key-hygiene -> selftest:attest-keys
func selftestAttestKeys() bool {
	defer i9TempState("keys")()
	code, err := attestMintGrant()
	if err != nil {
		return false
	}
	c, _ := attestChallenge(code)
	ans, _ := attestCorrectAnswer(c)
	key, err := attestRedeem(code, ans)
	if err != nil || key == "" {
		return false
	}
	sf := attestStateFile()
	if sf == "" {
		return false
	}
	raw, err := os.ReadFile(sf)
	return err == nil && !strings.Contains(string(raw), key) // plaintext never at rest
}

// test-attest-expiry -> selftest:attest-expiry
func selftestAttestExpiry() bool {
	defer i9TempState("expiry")()
	code, err := attestMintGrant()
	if err != nil {
		return false
	}
	c, _ := attestChallenge(code)
	ans, _ := attestCorrectAnswer(c)
	key, err := attestRedeem(code, ans)
	if err != nil {
		return false
	}
	for i := 0; i < 10000 && attestKeyValid(key); i++ {
		if attestConsume(key) != nil {
			break
		}
	}
	return !attestKeyValid(key) // the budget exhausts the key
}

// design: go-entry-chain  implements: req-contract-chain.1, req-contract-chain.2
// The contract has ONE copy: method/prompts/contract.md. Harness pointer files (CLAUDE.md,
// .github/copilot-instructions.md) command following AGENTS.md without exception; AGENTS.md commands
// the enumerated read -> understand -> recite -> honor ritual on the contract. These selftests keep
// that chain deterministic: a broken link, a lost ritual, or a re-embedded contract body is a red
// selftest, never a silent fork.

// test-contract-render -> selftest:contract-render
func selftestContractRender() bool {
	contract, err := os.ReadFile(attestContractPath())
	if err != nil || len(contract) == 0 {
		return false
	}
	agents, err := os.ReadFile(filepath.Join(ROOT, "AGENTS.md"))
	if err != nil {
		return false
	}
	a := strings.ReplaceAll(string(agents), "\r\n", "\n")
	// AGENTS.md names the contract's single copy and commands the full ritual on it...
	if !strings.Contains(a, "product/quackitect/method/prompts/contract.md") {
		return false
	}
	for _, word := range []string{"READ", "UNDERSTAND", "RECITE", "HONOR"} {
		if !strings.Contains(a, word) {
			return false
		}
	}
	// ...and never carries the body itself (rule 1's heading = proxy for an embedded copy).
	return !strings.Contains(a, "## 1. engage is the only door")
}

// test-render-drift -> selftest:render-drift
func selftestRenderDrift() bool {
	for _, f := range []string{"CLAUDE.md", filepath.Join(".github", "copilot-instructions.md")} {
		b, err := os.ReadFile(filepath.Join(ROOT, f))
		if err != nil || !strings.Contains(string(b), "AGENTS.md") {
			return false
		}
	}
	return true
}

// enddesign

// test-logs-canonical -> selftest:logs-canonical
func selftestLogsCanonical() bool {
	a := canonicalWorkspacePath(`C:\Users\X\proj`)
	b := canonicalWorkspacePath(`c:\users\x\PROJ`)
	c := canonicalWorkspacePath(`C:/Users/X/proj`)
	return a != "" && a == b && a == c
}

// test-no-quack-state -> selftest:data-dir-caches
func selftestDataDirCaches() bool {
	if dataHome() == "" {
		return false
	}
	root := filepath.Clean(ROOT)
	for _, k := range []string{"evidence", "gather", "overlay", "out", "golden", "spikes", "logs", "notes"} {
		d := dataDirFor(k)
		if d == "" || strings.HasPrefix(filepath.Clean(d), root) {
			return false
		}
	}
	return true
}

// test-truth-in-spec -> selftest:truth-in-spec
func selftestTruthInSpec() bool {
	d := ledgerDir()
	return d != "" && strings.HasPrefix(filepath.Clean(d), filepath.Clean(SPEC))
}

// test-root-marker -> selftest:root-marker
func selftestRootMarker() bool {
	tmp, err := os.MkdirTemp("", "qroot")
	if err != nil {
		return false
	}
	defer os.RemoveAll(tmp)
	os.MkdirAll(filepath.Join(tmp, "spec"), 0o755)
	os.WriteFile(filepath.Join(tmp, "spec", "project.toml"), []byte("[iteration]\n"), 0o644)
	sub := filepath.Join(tmp, "a", "b")
	os.MkdirAll(sub, 0o755)
	r, err := findWorkspaceRoot(sub)
	if err != nil || filepath.Clean(r) != filepath.Clean(tmp) {
		return false
	}
	lone, _ := os.MkdirTemp("", "qlone")
	defer os.RemoveAll(lone)
	_, err = findWorkspaceRoot(lone)
	return err != nil // no marker -> a loud error, not a silent cwd fallback
}

// test-clean-status -> selftest:clean-status
func selftestCleanStatus() bool {
	root := filepath.Clean(ROOT)
	for _, k := range []string{"evidence", "gather", "overlay", "out"} {
		d := dataDirFor(k)
		if d == "" || strings.HasPrefix(filepath.Clean(d), root) {
			return false
		}
	}
	_, err := os.Stat(filepath.Join(ROOT, ".quack"))
	return os.IsNotExist(err) // the cache pocket is gone from the repo
}

// test-global-config -> selftest:global-config
func selftestGlobalConfig() bool {
	p := globalConfigPath()
	return p != "" && !strings.HasPrefix(filepath.Clean(p), filepath.Clean(ROOT))
}

// test-global-binary -> selftest:global-binary
func selftestGlobalBinary() bool {
	p := globalBinPath()
	if p == "" || strings.HasPrefix(filepath.Clean(p), filepath.Clean(ROOT)) {
		return false
	}
	raw, err := os.ReadFile(filepath.Join(ROOT, "quack.cmd"))
	return err == nil && strings.Contains(strings.ToLower(string(raw)), `quackitect\bin`)
}

// test-engine-ratchet -> selftest:engine-ratchet
func selftestEngineRatchet() bool {
	if !ratchetNeeded(1, 2) || ratchetNeeded(2, 1) || ratchetNeeded(2, 2) {
		return false // rebuild only when the source is NEWER (forward ratchet)
	}
	tmp, err := os.MkdirTemp("", "qdance")
	if err != nil {
		return false
	}
	defer os.RemoveAll(tmp)
	target := filepath.Join(tmp, "quack.exe")
	staged := filepath.Join(tmp, "staged.exe")
	os.WriteFile(target, []byte("OLD"), 0o755)
	os.WriteFile(staged, []byte("NEW"), 0o755)
	if replaceExe(target, staged) != nil {
		return false
	}
	got, err := os.ReadFile(target)
	if err != nil || string(got) != "NEW" {
		return false
	}
	return sweepOldBinaries(tmp) >= 0 // parked .old leftovers are sweepable
}

// test-notes-out -> selftest:notes-out
func selftestNotesOut() bool {
	d := notesHome()
	return d != "" && !strings.HasPrefix(filepath.Clean(d), filepath.Clean(ROOT))
}

// test-decisions-folder -> selftest:decisions-folder
func selftestDecisionsFolder() bool {
	if !lintDecisionPlacementRaw(`spec/iterations/i0010_x/adr-foo.md`, "i0010", "i0009") {
		return false // post-baseline decision outside spec/decisions/ -> flagged
	}
	if lintDecisionPlacementRaw(`spec/decisions/adr-foo.md`, "i0010", "i0009") {
		return false // right home -> clean
	}
	return !lintDecisionPlacementRaw(`spec/iterations/i0008_x/adr-old.md`, "i0008", "i0009") // grandfathered
}

// test-decision-classes -> selftest:decision-classes
func selftestDecisionClasses() bool {
	return decisionClassRaw(true, "", false) == "veto" &&
		decisionClassRaw(true, "vehicles exist", false) == "defer" &&
		decisionClassRaw(false, "", true) == "superseded" &&
		decisionClassRaw(false, "", false) == "adoption"
}

// test-parked-list -> selftest:parked-list
func selftestParkedList() bool {
	got := parkedFrom(map[string]bool{"a": true, "b": true}, map[string]bool{"b": true})
	if len(got) != 1 || got[0] != "a" {
		return false
	}
	return len(parkedFrom(map[string]bool{}, map[string]bool{})) == 0
}

// test-decision-realized -> selftest:decision-realized
func selftestDecisionRealized() bool {
	return lintDecisionRealizedRaw("adoption", false) && // unrealized adoption -> flagged
		!lintDecisionRealizedRaw("adoption", true) &&
		!lintDecisionRealizedRaw("veto", false) && // vetoes and defers are skipped
		!lintDecisionRealizedRaw("defer", false)
}

// test-mint -> selftest:mint
func selftestMint() bool {
	tmp, err := os.MkdirTemp("", "qmint")
	if err != nil {
		return false
	}
	defer os.RemoveAll(tmp)
	seen := map[string]bool{}
	for _, kind := range []string{"need", "usecase", "requirement", "test", "adr"} {
		p, err := mintNodeAt(tmp, kind, "")
		if err != nil || p == "" {
			return false
		}
		n := ParseNode(p)
		if n.ID == "" || n.Type != kind || seen[n.ID] {
			return false // engine-stamped, typed, unique
		}
		seen[n.ID] = true
	}
	return true
}

// test-report-why -> selftest:report-why
func selftestReportWhy() bool {
	a := suspectCauseText([]string{"req-x", "uc-y"}, "")
	if a == "" || !strings.Contains(a, "req-x") {
		return false // a hash-change cause names the changed inputs
	}
	b := suspectCauseText(nil, "tests-pass")
	return b != "" && strings.Contains(b, "tests-pass") // a coverage flip names the rule
}

// test-filter-ux -> selftest:report-filter-ux
// Inspects the compiled report constants (they are emitted verbatim into every render) instead of
// rendering: rendering evaluates executed checks and this check is one of them — the recursion trap
// selftestReport documents; the tests-pass latch bounds it, this probe avoids it entirely.
func selftestReportFilterUX() bool {
	for _, marker := range []string{"filter-clear", "descendants:", "dbltap", "descSet", "successors"} {
		if !strings.Contains(reportJS, marker) {
			return false
		}
	}
	if !strings.Contains(reportJS, "descendants:&lt;id&gt;") {
		return false // the on-focus help must explain the new forms
	}
	return strings.Contains(reportCSS, "#filter-clear")
}

// test-vv-time-scope -> selftest:vv-time-scope
func selftestVVTimeScope() bool {
	nodes := LoadAll()
	// the probe rides a surviving i0008 test (test-strict-frontmatter merged into
	// test-structural-strictness)
	if iterationOf("test-structural-strictness", nodes) != "i0008_trust_hardening" {
		return false
	}
	sub := nodesAsOf("i0003_engine_vehicle_go", nodes)
	if sub == nil {
		return false
	}
	if _, hasLater := sub["test-structural-strictness"]; hasLater {
		return false // an i0008 test must not enter an i0003 computation
	}
	if _, hasBase := sub["fill-adjudicate"]; !hasBase {
		return false // baseline (pre-iteration) nodes always count
	}
	full := nodesAsOf("i0009_contract_attestation", nodes)
	_, hasOwn := full["test-vv-time-scope"]
	return hasOwn // the latest iteration still sees everything up to itself
}
