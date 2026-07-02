package main

// The i0008 trust-hardening selftest batteries. Authored BEFORE the build
// (test-first): each was observed RED against the trust.go stubs and recorded
// via `quack observe-red` on its trace test node.

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func issueWith(issues []ParseIssue, pathPart, keyPart string) bool {
	for _, is := range issues {
		if strings.Contains(is.Path, pathPart) && strings.Contains(is.Key, keyPart) {
			return true
		}
	}
	return false
}

// selftestParserStrict — test-strict-frontmatter: malformed frontmatter or an
// unknown key is rejected naming file+key; the FULL allowlist (incl. the i7
// additions) parses clean; a duplicate id is rejected; evidence-style docs
// (no first-line fence) and breadcrumb iteration.md files are handled.
func selftestParserStrict() bool {
	mk := func(files map[string]string) string {
		dir, _ := os.MkdirTemp("", "qst-strict")
		for name, body := range files {
			os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644)
		}
		return dir
	}
	// (1) clean corpus: full allowlist + evidence doc + breadcrumb iteration.md → zero issues
	clean := mk(map[string]string{
		"t-par.md": "---\nid: t-par\nstatement: p\nclass: review\nkiller: false\n---\n",
		"t-good.md": "---\nid: t-good\ntype: test\nstatement: s\nclass: executed\nverify: selftest:x\n" +
			"killer: false\nmilestone: M6\nparent: t-par\ndepends_on: [t-par]\nrefines: []\nimplements: []\n" +
			"verifies: []\naddresses: []\nvalidates: needs\nears: exempt - fixture reason\nadjudicated_by: human\n---\n",
		"M6-evidence.md": "# Evidence doc\n\nprose with a rule\n\n---\n\nkey-looking: line inside prose\n\n---\nmore\n",
		"iteration.md":   "---\niteration: ix\nstatus: active\ntype: default\nrigor: systematic\n---\n\nmotivation\n",
	})
	defer os.RemoveAll(clean)
	if got := StrictIssues(clean); len(got) != 0 {
		return false
	}
	// (2) the depends-on typo → rejected, naming file and key
	typo := mk(map[string]string{"t-typo.md": "---\nid: t-typo\nstatement: s\ndepends-on: [t-x]\n---\n"})
	defer os.RemoveAll(typo)
	if !issueWith(StrictIssues(typo), "t-typo", "depends-on") {
		return false
	}
	// (3) unterminated fence → rejected
	unterm := mk(map[string]string{"t-open.md": "---\nid: t-open\nstatement: s\n"})
	defer os.RemoveAll(unterm)
	if len(StrictIssues(unterm)) == 0 {
		return false
	}
	// (4) duplicate id across files → rejected
	dup := mk(map[string]string{
		"a.md": "---\nid: t-dup\nstatement: a\n---\n",
		"b.md": "---\nid: t-dup\nstatement: b\n---\n",
	})
	defer os.RemoveAll(dup)
	if len(StrictIssues(dup)) == 0 {
		return false
	}
	// (5) a node key inside iteration.md is NOT breadcrumb-legal → rejected
	badIter := mk(map[string]string{"iteration.md": "---\niteration: ix\nstatus: active\ndepends_on: [x]\n---\n"})
	defer os.RemoveAll(badIter)
	if !issueWith(StrictIssues(badIter), "iteration.md", "depends_on") {
		return false
	}
	// (6) a UTF-8 BOM must not smuggle a node past recognition (guard and loader share ONE rule)
	bom := mk(map[string]string{"t-bom.md": "\ufeff---\nid: t-bom\nstatement: s\ndepends-on: [x]\n---\n"})
	defer os.RemoveAll(bom)
	if !issueWith(StrictIssues(bom), "t-bom", "depends-on") {
		return false
	}
	// and the loader must never load what recognition rejects (no unchecked side door)
	return !nodeFence([]byte("# prose evidence doc\n---\nx: y\n---\n")) &&
		nodeFence([]byte("---\nid: x\n---\n")) && nodeFence([]byte("\ufeff---\nid: x\n---\n"))
}

// selftestRefIntegrity — test-ref-integrity: a reference through any edge field
// to a missing id fails loudly, naming the dangling ref; a resolving pair is clean.
func selftestRefIntegrity() bool {
	dir, _ := os.MkdirTemp("", "qst-refs")
	defer os.RemoveAll(dir)
	os.WriteFile(filepath.Join(dir, "req-a.md"), []byte("---\nid: req-a\ntype: requirement\nstatement: a\nrefines: [uc-b]\n---\n"), 0o644)
	os.WriteFile(filepath.Join(dir, "uc-b.md"), []byte("---\nid: uc-b\ntype: usecase\nstatement: b\n---\n"), 0o644)
	if len(StrictIssues(dir)) != 0 {
		return false
	}
	os.WriteFile(filepath.Join(dir, "t-dangle.md"), []byte("---\nid: t-dangle\ntype: test\nstatement: d\nverifies: [req-missing]\n---\n"), 0o644)
	issues := StrictIssues(dir)
	for _, is := range issues {
		if strings.Contains(is.Path, "t-dangle") && strings.Contains(is.Msg, "req-missing") {
			return true
		}
	}
	return false
}

// selftestActorChannels — test-actor-channels: channel defaults (interactive →
// human, else agent), --by overrides both, QUACK_ACTOR is retired (ignored).
func selftestActorChannels() bool {
	old := os.Getenv("QUACK_ACTOR")
	os.Setenv("QUACK_ACTOR", "human") // must have NO effect anymore
	defer os.Setenv("QUACK_ACTOR", old)
	return resolveActor(nil, false) == "agent" &&
		resolveActor(nil, true) == "human" &&
		resolveActor([]string{"--by", "human"}, false) == "human" &&
		resolveActor([]string{"--by", "agent"}, true) == "agent"
}

// selftestDesignHashNorm — test-design-hash-norm: whitespace-only reformatting
// of a design region leaves the folded hash unchanged; content (incl. comment)
// edits change it; case is PRESERVED (a case rename is content).
func selftestDesignHashNorm() bool {
	if normWS("a  b\tc") != "a b c" || normWS("  x  ") != "x" {
		return false
	}
	if normWS("Foo") == normWS("foo") {
		return false
	}
	h := func(body string) string {
		return fullHash("d", map[string]Node{"d": {ID: "d", Statement: "s", RegionBody: body}}, map[string]string{})
	}
	if h("x := 1\n\ty := 2 // invariant") != h("x := 1   \n y := 2 // invariant") {
		return false // pure reformat must not reopen
	}
	return h("x := 1\ny := 2 // invariant") != h("x := 1\ny := 2 // changed comment")
}

// selftestKernelVectors — test-kernel-vectors: golden digests of the hash
// primitives from baked inputs (guards refactors and the parity claim).
func selftestKernelVectors() bool {
	if norm("  Hello   World  ") != "hello world" {
		return false
	}
	if h12("") != "e3b0c44298fc" { // sha256("") first 12 hex — known constant
		return false
	}
	if len(kernelVectors) < 4 {
		return false // baked vector table missing
	}
	for _, v := range kernelVectors {
		if h12(v.In) != v.H12 {
			return false
		}
	}
	// stmtHash is norm-then-h12 by definition
	return stmtHash(Node{Statement: "  Hello   World  "}) == h12("hello world")
}

// coneFix builds an all-blessed review-gate fixture from edges (child -> parents).
func coneFix(edges map[string][]string) (map[string]Node, map[string]attestState) {
	nodes := map[string]Node{}
	for id, deps := range edges {
		nodes[id] = Node{ID: id, Statement: "s-" + id, Class: "review", DependsOn: deps}
	}
	memo := map[string]string{}
	blessed := map[string]attestState{}
	for id := range nodes {
		deps := map[string]string{}
		for _, d := range parents(nodes[id]) {
			deps[d] = fullHash(d, nodes, memo)
		}
		blessed[id] = attestState{fullHash(id, nodes, memo), stmtHash(nodes[id]), deps}
	}
	return nodes, blessed
}

func sameSet(got []string, want ...string) bool {
	sort.Strings(got)
	sort.Strings(want)
	return strings.Join(got, ",") == strings.Join(want, ",")
}

// selftestKernelCone — test-kernel-cone: EXACT reopened sets on linear, diamond,
// and shared-subtree DAGs, plus fixed-seed property DAGs asserting
// reopened == changed + blessed descendants. No unseeded randomness.
func selftestKernelCone() bool {
	change := func(nodes map[string]Node, id string) map[string]Node {
		out := map[string]Node{}
		for k, v := range nodes {
			out[k] = v
		}
		n := out[id]
		n.Statement = n.Statement + " CHANGED"
		out[id] = n
		return out
	}
	// linear a <- b <- c
	lin, lb := coneFix(map[string][]string{"a": {}, "b": {"a"}, "c": {"b"}})
	if !sameSet(reopenedSet(change(lin, "a"), lb), "a", "b", "c") {
		return false
	}
	if !sameSet(reopenedSet(change(lin, "b"), lb), "b", "c") {
		return false
	}
	// diamond: d <- {b,c} <- a
	dia, db := coneFix(map[string][]string{"a": {}, "b": {"a"}, "c": {"a"}, "d": {"b", "c"}})
	if !sameSet(reopenedSet(change(dia, "a"), db), "a", "b", "c", "d") {
		return false
	}
	if !sameSet(reopenedSet(change(dia, "b"), db), "b", "d") {
		return false // c must stay DONE — exactness, not membership
	}
	// shared subtree: e <- {c,d}; c <- a; d <- {a,b}
	sh, sb := coneFix(map[string][]string{"a": {}, "b": {}, "c": {"a"}, "d": {"a", "b"}, "e": {"c", "d"}})
	if !sameSet(reopenedSet(change(sh, "b"), sb), "b", "d", "e") {
		return false
	}
	// property battery: fixed-seed random DAGs; reopened == changed ∪ descendants
	rng := xorshift(0x9E3779B97F4A7C15)
	if rng == nil {
		return false
	}
	for round := 0; round < 8; round++ {
		n := 5 + int(rng()%4)
		edges := map[string][]string{}
		names := make([]string, n)
		for i := 0; i < n; i++ {
			names[i] = "n" + string(rune('a'+i))
			edges[names[i]] = nil
		}
		for i := 1; i < n; i++ { // each node depends on ≥1 earlier node → connected DAG
			edges[names[i]] = append(edges[names[i]], names[int(rng()%uint64(i))])
			if rng()%2 == 0 && i > 1 {
				p := names[int(rng()%uint64(i))]
				if p != edges[names[i]][0] {
					edges[names[i]] = append(edges[names[i]], p)
				}
			}
		}
		nodes, blessed := coneFix(edges)
		pick := names[int(rng()%uint64(n))]
		// independent test-side closure: descendants of pick via reverse edges
		want := map[string]bool{pick: true}
		for grew := true; grew; {
			grew = false
			for id, deps := range edges {
				if want[id] {
					continue
				}
				for _, d := range deps {
					if want[d] {
						want[id], grew = true, true
						break
					}
				}
			}
		}
		wantList := []string{}
		for id := range want {
			wantList = append(wantList, id)
		}
		if !sameSet(reopenedSet(change(nodes, pick), blessed), wantList...) {
			return false
		}
	}
	return true
}

// selftestKernelGatewalk — test-kernel-gatewalk: open → bless → done →
// dep-change → suspect → re-bless on a fixture; the event log written along the
// walk verifies as a chain; executed checks recompute live.
func selftestKernelGatewalk() bool {
	nodes := map[string]Node{
		"up": {ID: "up", Statement: "u", Class: "review"},
		"g":  {ID: "g", Statement: "g", Class: "review", DependsOn: []string{"up"}},
	}
	memo := func() map[string]string { return map[string]string{} }
	blessed := map[string]attestState{}
	var events []Event
	if gateState("g", nodes, blessed, memo()) != "OPEN" {
		return false
	}
	blessAll := func(prevOf map[string]*string) {
		for _, id := range []string{"up", "g"} {
			deps := map[string]string{}
			for _, d := range parents(nodes[id]) {
				deps[d] = fullHash(d, nodes, memo())
			}
			h := fullHash(id, nodes, memo())
			blessed[id] = attestState{h, stmtHash(nodes[id]), deps}
			events = append(events, Event{Check: id, Action: "bless", Actor: "human", Hash: h,
				StatementHash: stmtHash(nodes[id]), Deps: deps, PrevHash: prevOf[id]})
		}
	}
	blessAll(map[string]*string{})
	if gateState("g", nodes, blessed, memo()) != "DONE" {
		return false
	}
	prev := map[string]*string{}
	for id, s := range blessed {
		h := s.Hash
		prev[id] = &h
	}
	up := nodes["up"]
	up.Statement = "u CHANGED"
	nodes["up"] = up
	if gateState("g", nodes, blessed, memo()) != "SUSPECT" {
		return false
	}
	if StatusMap(map[string]Node{})["nothing"] != "" { // StatusMap stays total on empty graphs
		return false
	}
	blessAll(prev)
	if gateState("g", nodes, blessed, memo()) != "DONE" {
		return false
	}
	// an executed check recomputes live — no stored state
	exec := map[string]Node{"x": {ID: "x", Class: "executed", Statement: "x", Verify: "selftest:__none__"}}
	if gateState("x", exec, map[string]attestState{}, map[string]string{}) != "OPEN" {
		return false
	}
	return verifyAttestChain(events)
}

// selftestKernelAttest — test-kernel-attest: the prev_hash chain verifies from
// the migrated-null anchor; a tampered middle event is detected; the REAL log verifies.
func selftestKernelAttest() bool {
	p := func(s string) *string { return &s }
	good := []Event{
		{Check: "g", Action: "bless", Hash: "H1", PrevHash: nil}, // migrated/null anchor
		{Check: "g", Action: "bless", Hash: "H2", PrevHash: p("H1")},
		{Check: "g", Action: "bless", Hash: "H3", PrevHash: p("H2")},
		{Check: "k", Action: "red-observed", Hash: "R1"}, // non-bless events pass through
		{Check: "k", Action: "bless", Hash: "K1", PrevHash: nil},
	}
	if !verifyAttestChain(good) {
		return false
	}
	tampered := make([]Event, len(good))
	copy(tampered, good)
	tampered[1].Hash = "HX" // middle event rewritten → next link must break
	if verifyAttestChain(tampered) {
		return false
	}
	forged := make([]Event, len(good))
	copy(forged, good)
	forged[2].PrevHash = p("HZ") // broken back-pointer
	if verifyAttestChain(forged) {
		return false
	}
	return verifyAttestChain(attestEvents()) // the real log verifies end-to-end
}

// selftestLogsDir — test-logs-out: the resolved log dir is user-scoped and
// OUTSIDE the workspace, carries the product name + slug, and the config
// override wins verbatim.
func selftestLogsDir() bool {
	d := logsDir(Config{})
	if d == "" || strings.HasPrefix(d, ROOT) {
		return false
	}
	if !strings.Contains(d, "quackitect") || !strings.Contains(d, "logs") {
		return false
	}
	if !strings.Contains(d, filepath.Base(ROOT)) {
		return false // slug carries the workspace name
	}
	override := filepath.Join(string(filepath.Separator)+"custom", "loghome")
	return logsDir(Config{LogsDir: override}) == override
}

// selftestEarsLint — test-ears-lint: the five shapes + shall pass, weasel words
// and shapeless prose are flagged; a baselined (pre-existing blessed) statement
// is NEVER flagged; ears:exempt with a reason is counted, not flagged; exempt
// without a reason IS flagged.
func selftestEarsLint() bool {
	for _, ok := range []string{
		"The engine shall exit nonzero on a malformed node.",
		"When a node file is parsed, the engine shall reject unknown keys.",
		"While a version is active, the engine shall compute coverage live.",
		"If the fence is unterminated, then the engine shall name the file.",
		"Where a config override exists, the engine shall honor it.",
	} {
		if !earsShapeOK(ok) {
			return false
		}
	}
	for _, bad := range []string{
		"Parse errors are handled gracefully.",     // no shall, no shape
		"the engine handles bad input",             // no shall
		"Shall we begin?",                          // shall, but no EARS shape
	} {
		if earsShapeOK(bad) {
			return false
		}
	}
	if len(earsWeasels("The engine shall respond quickly and be user-friendly.")) < 2 {
		return false
	}
	if len(earsWeasels("The engine shall exit nonzero.")) != 0 {
		return false
	}
	mkReq := func(id, stmt, ears string) Node {
		return Node{ID: id, Type: "requirement", Statement: stmt, Ears: ears,
			Path: filepath.Join(SPEC, "iterations", "ix", id+".md")}
	}
	oldBad := mkReq("req-old", "Old prose statement without shape.", "")
	newBad := mkReq("req-new", "New prose statement without shape.", "")
	newGood := mkReq("req-good", "The engine shall be verified.", "")
	exemptOK := mkReq("req-ex", "Free-form by design.", "exempt - narrative requirement, reason recorded")
	exemptBare := mkReq("req-exbare", "Free-form without reason.", "exempt")
	nodes := map[string]Node{"req-old": oldBad, "req-new": newBad, "req-good": newGood,
		"req-ex": exemptOK, "req-exbare": exemptBare}
	baseline := map[string]bool{stmtHash(oldBad): true} // pre-existing blessed → grandfathered
	findings, exempt := earsFindings(nodes, baseline)
	if exempt != 1 {
		return false
	}
	hit := func(id string) bool {
		for _, f := range findings {
			if strings.HasPrefix(f, id+":") {
				return true
			}
		}
		return false
	}
	return !hit("req-old") && hit("req-new") && !hit("req-good") && !hit("req-ex") && hit("req-exbare")
}

// selftestEarsMethod — test-ears-method: compose-reference.md carries the five
// EARS shapes and the authoring instruction, with the i7 tests-red and roles
// content intact (mechanized doc-test).
func selftestEarsMethod() bool {
	cr := strings.ToLower(readFileStr(filepath.Join(EngineDir(), "method", "prompts", "compose-reference.md")))
	for _, want := range []string{"ubiquitous", "event-driven", "state-driven", "unwanted", "optional", "shall", "weasel"} {
		if !strings.Contains(cr, want) {
			return false
		}
	}
	// the i7 content the block must integrate with, not clobber
	return strings.Contains(cr, "tests-red") && strings.Contains(cr, "roles")
}

// selftestMonotonicLint — test-monotonic-lint: a milestone subtask whose
// dependency chain skips the prior milestone's gate is flagged; a correctly
// wired iteration passes.
func selftestMonotonicLint() bool {
	mk := func(iter, id string, ms int, deps ...string) Node {
		return Node{ID: id, Statement: "s", Class: "review", Milestone: ms, DependsOn: deps,
			Path: filepath.Join(SPEC, "iterations", iter, "tasks", id+".md")}
	}
	good := map[string]Node{
		"x-m1-a":    mk("ix", "x-m1-a", 1),
		"x-m1-gate": mk("ix", "x-m1-gate", 1, "x-m1-a"),
		"x-m2-a":    mk("ix", "x-m2-a", 2, "x-m1-gate"),
		"x-m2-gate": mk("ix", "x-m2-gate", 2, "x-m2-a"),
		"x-m3-a":    mk("ix", "x-m3-a", 3, "x-m2-gate"),
		"x-m3-b":    mk("ix", "x-m3-b", 3, "x-m3-a"), // transitively reaches m2-gate
		"x-m3-gate": mk("ix", "x-m3-gate", 3, "x-m3-a", "x-m3-b"),
	}
	if got := monotonicFindings(good); len(got) != 0 {
		return false
	}
	bad := map[string]Node{
		"y-m1-gate": mk("iy", "y-m1-gate", 1),
		"y-m2-gate": mk("iy", "y-m2-gate", 2, "y-m1-gate"),
		"y-m3-c":    mk("iy", "y-m3-c", 3, "y-m1-gate"), // skips the M2 gate
		"y-m3-gate": mk("iy", "y-m3-gate", 3, "y-m3-c", "y-m2-gate"),
	}
	findings := monotonicFindings(bad)
	for _, f := range findings {
		if strings.Contains(f, "y-m3-c") {
			return true
		}
	}
	return false
}
