package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"time"
)

// design: go-coverage-ids  implements: req-behavior-parity, req-unique-ids, req-coverage
// The derived coverage rules over the typed trace, the executed-check runner with its
// cache, and the id-integrity guard (mint_id + duplicate_ids). Coverage is cumulative
// through a version (no grandfathering); ids are namespaced so a reuse can never shadow.
// renderingTests names battery members that RENDER a report. A render recomputes states, which
// runs this battery again — so inside a render (renderBusy) these are skipped, bounding the
// recursion the selftestReport comment documents. Top-level evaluation stays exact and complete.
var renderingTests = map[string]bool{"selftest:report-live": true}

// coverageMemo: one CLI invocation is one process over one immutable graph load — a computed
// (rule, scope) answer stays valid for the whole run. The tests-pass battery in particular is
// expensive (it runs every selftest); seven iterations asking the same scoped question must not
// pay seven batteries (responsiveness guide: visible feedback within a second).
var coverageMemo = map[string]bool{}

func coverageRule(nodes map[string]Node, rule, scope string) bool {
	key := rule + "|" + scope
	if v, ok := coverageMemo[key]; ok {
		return v
	}
	v := coverageRuleUncached(nodes, rule, scope)
	coverageMemo[key] = v
	return v
}

// deferredReqs: the requirements a defer/veto decision scrap-addresses — they owe
// NOTHING to the coverage rules until their ready_when (the parked list carries them;
// found live at i15 b8). The rule, the delta lister, and the hole lister all use THIS.
func deferredReqs(nodes map[string]Node) map[string]bool {
	deferred := map[string]bool{}
	for _, n := range nodes {
		if n.Type != "adr" {
			continue
		}
		hasScrap := false
		for _, a := range n.Addresses {
			if a == scrapSink {
				hasScrap = true
			}
		}
		if !hasScrap {
			continue
		}
		for _, a := range n.Addresses {
			if a != scrapSink {
				deferred[a] = true
			}
		}
	}
	return deferred
}

func coverageRuleUncached(nodes map[string]Node, rule, scope string) bool {
	inscope := func(n Node) bool { return scope == "" || iterOf(n.Path) <= scope }
	impl := map[string][]Node{}
	veri := map[string][]Node{}
	for _, n := range nodes {
		for _, p := range n.Implements {
			impl[p] = append(impl[p], n)
		}
		for _, p := range n.Verifies {
			veri[p] = append(veri[p], n)
		}
	}
	deferred := deferredReqs(nodes)
	var reqs, adrs, ucs []Node
	for _, n := range nodes {
		if !inscope(n) || deferred[n.ID] {
			continue
		}
		switch n.Type {
		case "requirement":
			reqs = append(reqs, n)
		case "adr":
			adrs = append(adrs, n)
		case "usecase":
			ucs = append(ucs, n)
		}
	}
	up := func(n Node, want string) bool {
		for _, p := range n.Refines {
			if nodes[p].Type == want {
				return true
			}
		}
		return false
	}
	switch rule {
	case "req-traced":
		for _, r := range reqs {
			if !up(r, "usecase") {
				return false
			}
		}
		for _, u := range ucs {
			if !up(u, "need") {
				return false
			}
		}
		return true
	case "req-has-test":
		for _, r := range reqs {
			if len(veri[r.ID]) == 0 {
				return false
			}
		}
		return true
	case "req-has-design":
		for _, r := range reqs {
			if len(impl[r.ID]) == 0 {
				return false
			}
		}
		return true
	case "adr-traced":
		for _, a := range adrs {
			if len(a.Addresses) == 0 {
				return false
			}
			for _, p := range a.Addresses {
				if p == scrapSink {
					continue // a veto/defer is traced TO THE SINK by design (go-decisions)
				}
				if nodes[p].Type != "requirement" {
					return false
				}
			}
		}
		return true
	case "designs-realized":
		for _, r := range reqs {
			ds := impl[r.ID]
			if len(ds) == 0 {
				return false
			}
			for _, d := range ds {
				if d.RegionBody == "" {
					return false
				}
			}
		}
		return true
	case "tests-red":
		// Test-first: every NEW test must carry a red-observed attestation at its CURRENT hash
		// (a run-once record; an edited test's hash changes and must be re-observed). Per the M5 spike.
		// SCOPED to the check's own iteration (i10 defect fix, per the subtask statement "every NEW
		// test"): a later iteration's unbuilt tests must not hold an earlier iteration's gate red.
		// Tests authored before observe-red existed can never have been honestly observed red —
		// recording one today would FABRICATE an attestation, which observe-red REFUSES (it runs the
		// test; a pass records nothing). Each such test carries an explicit `tests_red: exempt`
		// marker citing its ADR (req-testsred-exempt) — the i0008 date constant is dead.
		ro := redObserved()
		memo := map[string]string{}
		active := readProjectConfig().Version
		defrd := deferredReqs(nodes)
		seen := false
		for _, n := range nodes {
			if n.Type == "test" && n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") {
				it := iterOf(n.Path)
				if testsRedExempt(n) {
					continue // pre-mechanism test; its exemption is a recorded marker, never retro-attested
				}
				if testDeferred(n, defrd) {
					continue // deferral carries through the TEST side too (i16): no red owed until ready_when
				}
				if scope != "" && it != scope {
					continue // another iteration's test owes ITS OWN gate a red, not this one
				}
				seen = true
				if it != "" && it != active {
					// Shipped-test-edit rule (i10, owner-ruled): a SHIPPED iteration keeps its BIRTH
					// evidence — the red it was honestly observed at when the test was new. Only the
					// ACTIVE iteration's tests owe a red at their CURRENT hash (the building discipline).
					if _, ok := ro[n.ID]; !ok {
						return false
					}
					continue
				}
				if ro[n.ID] != fullHash(n.ID, nodes, memo) {
					return false
				}
			}
		}
		return seen || scope != "" // scoped + no new tests = vacuously satisfied
	// design: go-tests-pass-eval  implements: req-tests-pass-unify
	// tests-pass evaluates selftest: tests in-process (runSelftest) — the SAME evaluator the gate state
	// machine uses — not a divergent shell path; selftest:tests-pass-eval guards the unification.
	// enddesign
	case "tests-pass":
		// Verification is backward-cumulative (go-vv-time-scope): it runs every test up to and
		// including the CHECK'S OWN iteration. The latest iteration still re-runs the whole suite
		// (regressions in old work are caught where the causing change lives), but a test added in a
		// LATER iteration can never reopen an earlier iteration's verification.
		var ts []Node
		defrdP := deferredReqs(nodes)
		for _, n := range nodes {
			if n.Class == "executed" && !strings.HasPrefix(n.Verify, "coverage:") && inscope(n) {
				if n.Suite == "standalone" {
					continue // not a suite member: watches workspace state, not iteration correctness (adr-standalone-suite)
				}
				if testDeferred(n, defrdP) {
					continue // a test verifying only DEFERRED requirements owes no pass until ready_when (i16)
				}
				if renderBusy && renderingTests[n.Verify] {
					continue // bounded: a render never re-runs the test that triggered it
				}
				ts = append(ts, n)
			}
		}
		if len(ts) == 0 {
			return false
		}
		memo := map[string]string{}
		for _, t := range ts {
			if strings.HasPrefix(t.Verify, "selftest:") { // in-process, like gateState — cached by verdict (go-verdict-cache)
				if !runSelftestCached(t.ID, strings.TrimSpace(t.Verify[len("selftest:"):]), fullHash(t.ID, nodes, memo)) {
					return false
				}
			} else if runExecuted(t, fullHash(t.ID, nodes, memo)) != "pass" {
				return false
			}
		}
		return true
	}
	return false
}

// design: go-testsred-marker  implements: req-testsred-exempt
// A test that predates the red-observation mechanism carries its exemption as an EXPLICIT
// frontmatter marker on the node — `tests_red: exempt - <reason citing its ADR>`
// (adr-grandfathers-historical) — never a source-code date constant. A bare exempt without a
// reason is not honored: the test owes its red like any other.
// testDeferred: a test whose EVERY verified requirement is scrap-deferred owes
// nothing until ready_when - the i15 deferral law extended to the test side (i16).
func testDeferred(n Node, deferred map[string]bool) bool {
	if n.Type != "test" || len(n.Verifies) == 0 {
		return false
	}
	for _, r := range n.Verifies {
		if !deferred[r] {
			return false
		}
	}
	return true
}

func testsRedExempt(n Node) bool {
	e := strings.TrimSpace(n.TestsRed)
	return strings.HasPrefix(e, "exempt") && len(strings.TrimLeft(strings.TrimPrefix(e, "exempt"), " -–—:")) > 0
}

// enddesign

// design: go-evidence-honesty  implements: req-evidence-honesty
// Evidence honesty (#8): a check's cached pass/fail is keyed by the FULL input hash
// (evidence/<id>/<h>.json), so any change to a hashed input yields a new key and a cache MISS ->
// re-run, never a stale pass. Selftest and coverage checks bypass this cache entirely (evaluated
// live in gateState/coverageRule), and an unknown selftest returns false -> OPEN, so a live-red or
// unbuilt check is never masked as DONE.
// runExecuted runs a check's verify command (shell), caching the pass/fail by hash.
func runExecuted(n Node, h string) string {
	cdir := filepath.Join(dataDirFor("evidence"), n.ID)
	cf := filepath.Join(cdir, h+".json")
	if raw, err := os.ReadFile(cf); err == nil {
		var m map[string]interface{}
		if json.Unmarshal(raw, &m) == nil {
			if r, ok := m["result"].(string); ok {
				return r
			}
		}
	}
	os.MkdirAll(cdir, 0o755)
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/c", n.Verify)
	} else {
		cmd = exec.Command("sh", "-c", n.Verify)
	}
	cmd.Dir = ROOT
	result := "pass"
	if err := cmd.Run(); err != nil {
		result = "fail"
	}
	out, _ := json.MarshalIndent(map[string]interface{}{"result": result, "cmd": n.Verify, "ran": time.Now().Format(time.RFC3339)}, "", "  ")
	os.WriteFile(cf, out, 0o644)
	pruneEvidenceCache(cdir)
	return result
}

// enddesign

// design: go-evidence-cache-cap  implements: req-evidence-cache-cap
// A check's verdict cache is bounded: every write keeps the newest evidenceCacheCap
// .json files in evidence/<id>/ and deletes the rest, oldest first (mtime, then name
// for a deterministic tie-break). Each changed input hash adds a file, so without the
// cap a long-lived check grows its evidence dir forever.
const evidenceCacheCap = 8

// pruneEvidenceCache deletes the oldest verdict files beyond evidenceCacheCap in cdir.
func pruneEvidenceCache(cdir string) {
	ents, err := os.ReadDir(cdir)
	if err != nil {
		return
	}
	type vf struct {
		name string
		mod  time.Time
	}
	var files []vf
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		fi, err := e.Info()
		if err != nil {
			continue
		}
		files = append(files, vf{e.Name(), fi.ModTime()})
	}
	if len(files) <= evidenceCacheCap {
		return
	}
	sort.Slice(files, func(i, j int) bool {
		if !files[i].mod.Equal(files[j].mod) {
			return files[i].mod.Before(files[j].mod)
		}
		return files[i].name < files[j].name
	})
	for _, f := range files[:len(files)-evidenceCacheCap] {
		os.Remove(filepath.Join(cdir, f.name))
	}
}

// enddesign

// --- id integrity (req-unique-ids) ---

func scanIDs() map[string][]string {
	seen := map[string][]string{}
	filepath.Walk(SPEC, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		if isSpecContent(SPEC, path) {
			return nil // project-content notes (go-spec-content) are not graph nodes
		}
		if raw, e := os.ReadFile(path); e != nil || !nodeFence(raw) {
			return nil // same recognition rule as LoadAll/strictGuard (nodeFence)
		}
		n := ParseNode(path)
		if n.Statement != "" && !strings.HasPrefix(n.ID, "TASK-") && !strings.HasPrefix(n.ID, "MARK-") {
			rel, _ := filepath.Rel(ROOT, path)
			seen[n.ID] = append(seen[n.ID], filepath.ToSlash(rel))
		}
		return nil
	})
	return seen
}

// DuplicateIDs returns ids declared in more than one file (a silent-shadow collision).
func DuplicateIDs() map[string][]string {
	dups := map[string][]string{}
	for id, ps := range scanIDs() {
		if len(ps) > 1 {
			dups[id] = ps
		}
	}
	return dups
}

var itagRe = regexp.MustCompile(`^i0*([0-9]+)`)

func itag(version string) string {
	if m := itagRe.FindStringSubmatch(version); m != nil {
		return "i" + m[1]
	}
	if version == "" {
		return "ix"
	}
	return version
}

// MintID creates a globally-unique id from a local name, namespaced by the iteration tag.
func MintID(local, version string) string {
	tag := itag(version)
	base := local
	if !strings.HasPrefix(local, tag+"-") {
		base = tag + "-" + local
	}
	existing := scanIDs()
	cand, k := base, 2
	for {
		if _, ok := existing[cand]; !ok {
			return cand
		}
		cand = base + "-" + itoa(k)
		k++
	}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var b []byte
	for n > 0 {
		b = append([]byte{byte('0' + n%10)}, b...)
		n /= 10
	}
	if neg {
		b = append([]byte{'-'}, b...)
	}
	return string(b)
}

// CoverageHoles reports n>=1 trace holes (missing children + orphans), cumulative through scope.
func CoverageHoles(nodes map[string]Node, scope string) []string {
	inscope := func(n Node) bool { return scope == "" || iterOf(n.Path) <= scope }
	refiners, impl, veri := map[string][]string{}, map[string][]string{}, map[string][]string{}
	for _, n := range nodes {
		for _, p := range n.Refines {
			refiners[p] = append(refiners[p], n.ID)
		}
		for _, p := range n.Implements {
			impl[p] = append(impl[p], n.ID)
		}
		for _, p := range n.Verifies {
			veri[p] = append(veri[p], n.ID)
		}
	}
	holes := []string{}
	ptypeOK := func(n Node, field []string, ptype string) bool {
		if len(field) == 0 {
			return false
		}
		for _, p := range field {
			if nodes[p].Type != ptype {
				return false
			}
		}
		return true
	}
	deferred := deferredReqs(nodes)
	for _, n := range nodes {
		if !inscope(n) || deferred[n.ID] {
			continue
		}
		switch n.Type {
		case "need":
			if len(refiners[n.ID]) == 0 {
				holes = append(holes, "need '"+n.ID+"' has no use-case")
			}
		case "usecase":
			if len(refiners[n.ID]) == 0 {
				holes = append(holes, "use-case '"+n.ID+"' has no requirement")
			}
			if !ptypeOK(n, n.Refines, "need") {
				holes = append(holes, "use-case '"+n.ID+"' orphan (no need)")
			}
		case "requirement":
			if len(impl[n.ID]) == 0 {
				holes = append(holes, "requirement '"+n.ID+"' has no design")
			}
			if len(veri[n.ID]) == 0 {
				holes = append(holes, "requirement '"+n.ID+"' has no test")
			}
			if !ptypeOK(n, n.Refines, "usecase") {
				holes = append(holes, "requirement '"+n.ID+"' orphan (no use-case)")
			}
		case "design":
			if !ptypeOK(n, n.Implements, "requirement") {
				holes = append(holes, "design '"+n.ID+"' orphan (implements no requirement)")
			}
		case "test":
			if !ptypeOK(n, n.Verifies, "requirement") {
				holes = append(holes, "test '"+n.ID+"' orphan (verifies no requirement)")
			}
		case "adr":
			scrapOnly := len(n.Addresses) > 0
			for _, a := range n.Addresses {
				if a != scrapSink {
					scrapOnly = false
				}
			}
			if scrapOnly {
				break // a veto/defer addressing only the sink is traced by construction (go-decisions)
			}
			var real []string
			for _, a := range n.Addresses {
				if a != scrapSink {
					real = append(real, a)
				}
			}
			if !ptypeOK(n, real, "requirement") {
				holes = append(holes, "adr '"+n.ID+"' orphan (addresses no requirement)")
			}
		}
	}
	sort.Strings(holes)
	return holes
}

// enddesign

// design: go-vv-time-scope  implements: req-vv-time-scope
// Derived V&V looks backward only: a check computes over trace nodes from its own iteration and
// earlier (iteration ids are ordered; non-iteration nodes count as baseline, always in scope).
// tests-pass filters its suite by inscope above, and the validates-needs digest folds needsDigestAsOf
// — so mere ADDITION in a later iteration never reopens an earlier verdict, while a genuinely failing
// old test still flips its own iteration red (an honest regression signal, kept).
func iterationOf(id string, nodes map[string]Node) string {
	n, ok := nodes[id]
	if !ok {
		return ""
	}
	return iterOf(n.Path)
}

func nodesAsOf(iter string, nodes map[string]Node) map[string]Node {
	out := map[string]Node{}
	for id, n := range nodes {
		if iterOf(n.Path) <= iter {
			out[id] = n
		}
	}
	return out
}

func needsDigestAsOf(iter string, nodes map[string]Node) string {
	return needsDigest(nodesAsOf(iter, nodes))
}

// enddesign
