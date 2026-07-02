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
func coverageRule(nodes map[string]Node, rule, scope string) bool {
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
	var reqs, adrs, ucs []Node
	for _, n := range nodes {
		if !inscope(n) {
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
		// Test-first: every executed test must carry a red-observed attestation at its CURRENT hash
		// (a run-once record; an edited test's hash changes and must be re-observed). Per the M5 spike.
		ro := redObserved()
		memo := map[string]string{}
		seen := false
		for _, n := range nodes {
			if n.Type == "test" && n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") {
				seen = true
				if ro[n.ID] != fullHash(n.ID, nodes, memo) {
					return false
				}
			}
		}
		return seen
	// design: go-tests-pass-eval  implements: req-tests-pass-unify
	// tests-pass evaluates selftest: tests in-process (runSelftest) — the SAME evaluator the gate state
	// machine uses — not a divergent shell path; selftest:tests-pass-eval guards the unification.
	// enddesign
	case "tests-pass":
		// Verification runs EVERY test, across all iterations — not scope-limited — so a change
		// anywhere is checked against the whole suite and regressions in old work are caught.
		var ts []Node
		for _, n := range nodes {
			if n.Class == "executed" && !strings.HasPrefix(n.Verify, "coverage:") {
				ts = append(ts, n)
			}
		}
		if len(ts) == 0 {
			return false
		}
		memo := map[string]string{}
		for _, t := range ts {
			if strings.HasPrefix(t.Verify, "selftest:") { // in-process, like gateState — not a shell run
				if !runSelftest(strings.TrimSpace(t.Verify[len("selftest:"):])) {
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

// design: go-evidence-honesty  implements: req-evidence-honesty
// Evidence honesty (#8): a check's cached pass/fail is keyed by the FULL input hash
// (evidence/<id>/<h>.json), so any change to a hashed input yields a new key and a cache MISS ->
// re-run, never a stale pass. Selftest and coverage checks bypass this cache entirely (evaluated
// live in gateState/coverageRule), and an unknown selftest returns false -> OPEN, so a live-red or
// unbuilt check is never masked as DONE.
// runExecuted runs a check's verify command (shell), caching the pass/fail by hash.
func runExecuted(n Node, h string) string {
	cdir := filepath.Join(QUACK, "evidence", n.ID)
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
	return result
}

// enddesign

// --- id integrity (req-unique-ids) ---

func scanIDs() map[string][]string {
	seen := map[string][]string{}
	filepath.Walk(SPEC, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
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
	for _, n := range nodes {
		if !inscope(n) {
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
			if !ptypeOK(n, n.Addresses, "requirement") {
				holes = append(holes, "adr '"+n.ID+"' orphan (addresses no requirement)")
			}
		}
	}
	sort.Strings(holes)
	return holes
}

// enddesign
