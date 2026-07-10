package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// i11Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i11Tests = []namedTest{
	{"parity-standalone", selftestParityStandalone},
	{"pager-scope", selftestPagerScope},
	{"suspect-root", selftestSuspectRoot},
	{"evidence-cache-cap", selftestEvidenceCacheCap},
	{"evidence-hashed", selftestEvidenceHashed},
	{"grandfathers-decided", selftestGrandfathersDecided},
	{"legacy-lanes-retired", selftestLegacyLanesRetired},
	{"stamp-user", selftestStampUser},
	{"testsred-exempt", selftestTestsredExempt},
}

// design: go-standalone-suite  implements: req-parity-standalone
// A test node carrying `suite: standalone` is not a member of any verification suite: tests-pass
// skips it, and the board carries it as its own entry with a live verdict (adr-standalone-suite).
// The parity tamper check moves to this suite, so legitimate authoring no longer reddens history —
// a moved golden root reddens exactly one row, and that row says what it means.

// test-parity-standalone -> selftest:parity-standalone
func selftestParityStandalone() bool {
	dir, err := os.MkdirTemp("", "qps")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldPath, oldMemo, oldCov := verdictPathOverride, verdictsMemo, coverageMemo
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	coverageMemo = map[string]bool{}
	defer func() { verdictPathOverride, verdictsMemo, coverageMemo = oldPath, oldMemo, oldCov }()

	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "t.md")
	syn := map[string]Node{
		"test-reg":  {ID: "test-reg", Type: "test", Class: "executed", Verify: "selftest:ids", Path: iterPath},
		"test-solo": {ID: "test-solo", Type: "test", Class: "executed", Verify: "selftest:no-such-check", Suite: "standalone", Path: iterPath},
	}
	if !coverageRule(syn, "tests-pass", "") {
		return false // the FAILING standalone member must not redden the suite
	}
	coverageMemo = map[string]bool{}
	syn["test-solo"] = Node{ID: "test-solo", Type: "test", Class: "executed", Verify: "selftest:no-such-check", Path: iterPath}
	if coverageRule(syn, "tests-pass", "") {
		return false // the same failure as a SUITE member must redden it
	}
	if len(standaloneChecks(syn)) != 0 {
		return false // demoted node is no longer a standalone check
	}
	nodes := LoadAll()
	if nodes["test-parity-golden"].Suite != "standalone" {
		return false // the tamper check rides the standalone suite for real
	}
	solo := standaloneChecks(nodes)
	return len(solo) >= 1 && solo[0].ID == "test-parity-golden"
}

// enddesign

// test-suspect-root -> selftest:suspect-root
func selftestSuspectRoot() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "tasks", "x.md")
	nodes := map[string]Node{
		"a-exec": {ID: "a-exec", Class: "executed", Verify: "selftest:none", Path: iterPath},
		"b-mid":  {ID: "b-mid", Class: "review", Path: iterPath, DependsOn: []string{"a-exec"}},
		"c-top":  {ID: "c-top", Class: "review", Path: iterPath, DependsOn: []string{"b-mid"}},
	}
	raw := map[string]string{"a-exec": "OPEN", "b-mid": "DONE", "c-top": "DONE"}
	roots := SuspectRoots("c-top", nodes, raw)
	if len(roots) != 1 || roots[0] != "a-exec" {
		return false // the cone names its ONE root through a clean middle link
	}
	if !strings.Contains(suspectSuffix("c-top", nodes, raw), "a-exec") {
		return false // the board row carries the root
	}
	raw2 := map[string]string{"a-exec": "DONE", "b-mid": "SUSPECT", "c-top": "DONE"}
	roots = SuspectRoots("c-top", nodes, raw2)
	if len(roots) != 1 || roots[0] != "b-mid" {
		return false // a directly-suspect upstream IS the root (its own upstreams are clean)
	}
	if suspectSuffix("b-mid", nodes, raw2) != "" {
		return false // a direct suspect stays direct — no propagation tail
	}
	return true
}

// test-pager-scope -> selftest:pager-scope
func selftestPagerScope() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "tasks", "x.md")
	nodes := map[string]Node{
		"i1-m2-done-a": {ID: "i1-m2-done-a", Milestone: 2, Class: "review", Path: iterPath},
		"i1-m2-killer": {ID: "i1-m2-killer", Milestone: 2, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m2-done-a"}},
		"i1-m2-open-b": {ID: "i1-m2-open-b", Milestone: 2, Class: "review", Path: iterPath},
		"i1-m2-gate":   {ID: "i1-m2-gate", Milestone: 2, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"i1-m2-done-a", "i1-m2-killer", "i1-m2-open-b"}},
	}
	sm := map[string]string{"i1-m2-done-a": "DONE", "i1-m2-killer": "OPEN", "i1-m2-open-b": "OPEN", "i1-m2-gate": "OPEN"}
	out := HandoverPager("i1-m2-killer", "i0001_syn", nodes, sm, Config{}, false)
	if strings.Contains(out, "subtasks 0/") || !strings.Contains(out, "check-scoped") {
		return false // the killer answers for itself, never for the milestone
	}
	if !strings.Contains(out, "upstreams 1/1") {
		return false // its one upstream is DONE — that is the readiness that counts
	}
	gout := HandoverPager("i1-m2-gate", "i0001_syn", nodes, sm, Config{}, false)
	return strings.Contains(gout, "subtasks") // gate pagers keep the milestone scope
}

// test-testsred-exempt -> selftest:testsred-exempt
func selftestTestsredExempt() bool {
	if !testsRedExempt(Node{TestsRed: "exempt - predates the mechanism (adr-grandfathers-historical)"}) {
		return false // a reasoned marker is honored
	}
	if testsRedExempt(Node{TestsRed: "exempt"}) || testsRedExempt(Node{}) {
		return false // a bare exempt (or none) owes its red like any other test
	}
	// era-free enforcement over the REAL graph: every selftest-wired executed test either carries
	// a red observation or a marker whose reason cites a resolvable ADR.
	nodes := LoadAll()
	ro := redObserved()
	active := readProjectConfig().Version
	defrd := deferredReqs(nodes)
	adrRe := regexp.MustCompile(`adr-[a-z0-9-]+`)
	marked := 0
	for id, n := range nodes {
		if n.Type != "test" || n.Class != "executed" || !strings.HasPrefix(n.Verify, "selftest:") {
			continue
		}
		if it := iterOf(n.Path); active != "" && it >= active {
			continue // a not-yet-shipped iteration's tests owe their red to ITS OWN tests-red gate, never this sweep
		}
		if testDeferred(n, defrd) {
			continue // deferral carries through EVERY red lister (the i16 law, third site)
		}
		if testsRedExempt(n) {
			if cited := adrRe.FindString(n.TestsRed); cited == "" || nodes[cited].Type != "adr" {
				return false // an exemption without its recorded decision
			}
			marked++
			continue
		}
		if _, ok := ro[id]; !ok {
			return false // no marker and no birth evidence
		}
	}
	if marked == 0 {
		return false // the pre-mechanism grandfathers exist and carry their markers
	}
	// the date constant is gone from the engine source (needle split so THIS file never matches).
	needle := "testsRed" + "Since"
	dead := true
	filepath.Walk(EngineSrc(), func(p string, fi os.FileInfo, err error) error {
		if err == nil && !fi.IsDir() && strings.HasSuffix(p, ".go") {
			if b, e := os.ReadFile(p); e == nil && strings.Contains(string(b), needle) {
				dead = false
			}
		}
		return nil
	})
	return dead
}

// test-stamp-user -> selftest:stamp-user
// Fixture-proven BEFORE the real ledger is touched (the L3 spike, adr-actor-user-migration).
func selftestStampUser() bool {
	if resolveActor(nil, true) != "user" || resolveActor(nil, false) != "agent" {
		return false // new console records write user; the agent channel stays agent
	}
	if resolveActor([]string{"--by", "human"}, false) != "user" {
		return false // a delegated --by human writes the current vocabulary
	}
	if normActor("human") != "user" || normActor("") != "user" || normActor("agent") != "agent" {
		return false // readers treat human and user as one value forever
	}
	h := "aaaa1111bbbb"
	fx := []Event{
		{Check: "k1", Action: "bless", Actor: "human", FilledBy: "agent", Hash: h},
		{Check: "k2", Action: "bless", Actor: "agent", Hash: h},
		{Check: "t1", Action: "red-observed", Actor: "tester", Hash: h},
	}
	out, n := migrateActorsFrom(fx, "2026-07-05T00:00:00Z")
	if n != 1 || len(out) != 4 {
		return false // exactly one event touched, ONE audit record appended
	}
	if out[0].Actor != "user" || out[1].Actor != "agent" || out[2].Actor != "tester" {
		return false // only human moves
	}
	if out[0].Hash != h || out[3].Action != "migrate-actors" || out[3].Count != 1 {
		return false // hashes untouched; the audit event carries the count
	}
	out2, n2 := migrateActorsFrom(out, "2026-07-05T00:00:01Z")
	if n2 != 0 || len(out2) != len(out) {
		return false // one-shot: the second pass is a no-op with no new audit event
	}
	// era equivalence: human-era and user-era stamps normalize to the same actor
	return normActor("human") == normActor("user") && normActor("agent") != normActor("user")
}

// design: go-legacy-lanes-retired  implements: req-legacy-decided.3
// The legacy .quack lanes are dead (adr-retire-legacy-lanes): the resolver walks data-home
// overlay -> tools/vendor -> dogfood product only, and the stub launcher resolves the global
// binary then QUACK_ENGINE — no engine.local pointer, no internal .quack engine. This check
// probes a fake engine root carrying ONLY legacy lanes and demands they stay invisible.

// test-legacy-lanes-retired -> selftest:legacy-lanes-retired
func selftestLegacyLanesRetired() bool {
	dir, err := os.MkdirTemp("", "qll")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	for _, p := range []string{
		filepath.Join(dir, ".quack", "vendor", "quackitect", "method"),
		filepath.Join(dir, ".quack", "vendor", "engine-go"),
		filepath.Join(dir, ".quack", "overlay", "method", "prompts"),
		filepath.Join(dir, "product", "quackitect", "method"),
		filepath.Join(dir, "product", "engine-go"),
	} {
		if os.MkdirAll(p, 0o755) != nil {
			return false
		}
	}
	os.WriteFile(filepath.Join(dir, ".quack", "overlay", "method", "prompts", "qll-probe.md"), []byte("legacy"), 0o644)
	oldEngine := ENGINE
	ENGINE = dir
	defer func() { ENGINE = oldEngine }()
	if EngineDir() != filepath.Join(dir, "product", "quackitect") {
		return false // the .quack/vendor lane must lose to the dogfood product tree
	}
	if EngineSrc() != filepath.Join(dir, "product", "engine-go") {
		return false // same for the engine source
	}
	if Resolve("method/prompts/qll-probe.md") != "" {
		return false // a .quack overlay tree is ignored by the resolver
	}
	launcher := insideStubFiles("probe")["probe.cmd"]
	if strings.Contains(launcher, "engine.local") || strings.Contains(launcher, `.quack`) {
		return false // the stub launcher carries no legacy branch
	}
	iGlobal := strings.Index(launcher, `%LOCALAPPDATA%\quackitect\bin\quack.exe`)
	iEnv := strings.Index(launcher, "QUACK_ENGINE")
	return iGlobal >= 0 && iEnv >= 0 && iGlobal < iEnv
}

// enddesign

// design: go-grandfathers-decided  implements: req-legacy-decided.1
// No grandfather without a recorded decision (adr-grandfathers-historical). The anonymous
// EARS baseline file is dead; every `ears: exempt` marker must cite a resolvable ADR; a
// pre-i4 requirement without a realized design region must be addressed by an ADR. Enforced
// live over the real graph by selftest:grandfathers-decided — an exemption without its
// decision fails the check.

// test-grandfathers-decided -> selftest:grandfathers-decided
func selftestGrandfathersDecided() bool {
	if _, err := os.Stat(filepath.Join(ledgerDir(), "ears-baseline.json")); err == nil {
		return false // the anonymous baseline file must be dead
	}
	nodes := LoadAll()
	realized := map[string]bool{}
	for _, n := range nodes {
		if n.RegionBody == "" {
			continue
		}
		for _, p := range n.Implements {
			realized[p] = true
		}
	}
	addressed := map[string]bool{}
	for _, n := range nodes {
		if n.Type == "adr" {
			for _, p := range n.Addresses {
				addressed[p] = true
			}
		}
	}
	adrRe := regexp.MustCompile(`adr-[a-z0-9-]+`)
	for id, n := range nodes {
		if n.Type != "requirement" {
			continue
		}
		if e := strings.TrimSpace(n.Ears); strings.HasPrefix(e, "exempt") {
			if cited := adrRe.FindString(e); cited == "" || nodes[cited].Type != "adr" {
				return false // an exemption must cite a resolvable retire-or-retrofit ADR
			}
		}
		if iterOf(n.Path) < "i0004" && !realized[id] && !addressed[id] {
			return false // a pre-i4 unrealized design hole needs its recorded decision
		}
	}
	return true
}

// enddesign

// test-evidence-hashed -> selftest:evidence-hashed
func selftestEvidenceHashed() bool {
	dir, err := os.MkdirTemp("", "qev")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldBase := evidenceBaseOverride
	evidenceBaseOverride = dir
	defer func() { evidenceBaseOverride = oldBase }()
	iter := "i0001_syn"
	if os.MkdirAll(filepath.Join(dir, iter), 0o755) != nil {
		return false
	}
	doc := filepath.Join(dir, iter, "M2-probe.md")
	os.WriteFile(doc, []byte("# evidence v1\n"), 0o644)
	gatePath := filepath.Join(SPEC, "iterations", iter, "tasks", "x.md")
	nodes := map[string]Node{"i1-m2-gate": {ID: "i1-m2-gate", Class: "review", Milestone: 2, Path: gatePath}}
	a := map[string]attestState{"i1-m2-gate": {Hash: fullHash("i1-m2-gate", nodes, map[string]string{})}}
	if gateState("i1-m2-gate", nodes, a, map[string]string{}) != "DONE" {
		return false // blessed at the with-doc hash -> DONE
	}
	os.WriteFile(doc, []byte("# evidence v2 EDITED\n"), 0o644)
	if gateState("i1-m2-gate", nodes, a, map[string]string{}) != "SUSPECT" {
		return false // editing blessed evidence flips the gate
	}
	os.WriteFile(doc, []byte("#   evidence   v1\n"), 0o644)
	if gateState("i1-m2-gate", nodes, a, map[string]string{}) != "DONE" {
		return false // same content through normWS -> untouched, flips nothing
	}
	os.WriteFile(filepath.Join(dir, iter, "M3-other.md"), []byte("later milestone\n"), 0o644)
	if gateState("i1-m2-gate", nodes, a, map[string]string{}) != "DONE" {
		return false // another milestone's doc never reaches this gate
	}
	sub := map[string]Node{"i1-m2-task": {ID: "i1-m2-task", Class: "review", Milestone: 2, Path: gatePath}}
	before := fullHash("i1-m2-task", sub, map[string]string{})
	os.WriteFile(doc, []byte("# evidence v3\n"), 0o644)
	if fullHash("i1-m2-task", sub, map[string]string{}) != before {
		return false // subtasks never fold docs (adr-evidence-hash: gate-only)
	}
	return true
}

// test-evidence-cache-cap -> selftest:evidence-cache-cap
func selftestEvidenceCacheCap() bool {
	base := filepath.Join(dataDirFor("evidence"), "__cachecap_probe__")
	os.RemoveAll(base)
	defer os.RemoveAll(base)
	if os.MkdirAll(base, 0o755) != nil {
		return false
	}
	old := time.Now().Add(-time.Hour)
	seeds := evidenceCacheCap + 3
	for i := 0; i < seeds; i++ {
		p := filepath.Join(base, fmt.Sprintf("seed%02d.json", i))
		if os.WriteFile(p, []byte(`{"result":"pass"}`), 0o644) != nil {
			return false
		}
		t := old.Add(time.Duration(i) * time.Minute)
		os.Chtimes(p, t, t)
	}
	probe := Node{ID: "__cachecap_probe__", Verify: "exit 0"}
	if runExecuted(probe, "hfresh") != "pass" {
		return false
	}
	ents, err := os.ReadDir(base)
	if err != nil || len(ents) != evidenceCacheCap {
		return false // the write leaves exactly the bound
	}
	evicted := seeds + 1 - evidenceCacheCap
	if _, err := os.Stat(filepath.Join(base, fmt.Sprintf("seed%02d.json", evicted-1))); err == nil {
		return false // the oldest beyond the bound are gone
	}
	if _, err := os.Stat(filepath.Join(base, fmt.Sprintf("seed%02d.json", evicted))); err != nil {
		return false // the newest survivors stay
	}
	if _, err := os.Stat(filepath.Join(base, "hfresh.json")); err != nil {
		return false // the fresh verdict itself is never evicted
	}
	return true
}
