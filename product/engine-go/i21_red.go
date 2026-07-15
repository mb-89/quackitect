package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// i21_red.go — this iteration's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices EXPLICITLY; this file owns i21Tests).

var i21Tests = []namedTest{
	{"graph-suffix-rooted", selftestGraphSuffixRooted},
	{"ears-baseline", selftestEarsBaseline},
	{"deck-goto", selftestDeckGoto},
	{"drivers-derived", selftestDriversDerived},
	{"terms-readme", selftestTermsReadme},
	{"jargon-advisory", selftestJargonAdvisory},
	{"battery-tiers", selftestBatteryTiers},
	{"field-tier", selftestFieldTier},
	{"provenance-block", selftestProvenanceBlock},
	{"mint-prefill", selftestMintPrefill},
	{"register-colors", selftestRegisterColors},
	{"register-render", selftestRegisterRender},
	{"register-ask", selftestRegisterAsk},
	{"register-killer-guard", selftestRegisterKillerGuard},
	{"seed-skeleton", selftestSeedSkeleton},
	{"apply-general", selftestApplyGeneral},
	{"rigor-fit", selftestRigorFit},
	{"unknown-type-refused", selftestUnknownTypeRefused},
	{"lazy-verdicts", selftestLazyVerdicts},
	{"handoff-lifecycle", selftestHandoffLifecycle},
	{"handoff-milestone-title", selftestHandoffMilestoneTitle},
}

// selftest:lazy-verdicts — proves the walk's cache law (test-lazy-verdicts;
// req-lazy-verdicts). A lazy miss answers not-verified WITHOUT running (the run
// counter stays flat); an eager miss runs and records; the recorded verdict then
// answers from cache in both modes. Probes ride a fixture id that matches no node.
func selftestLazyVerdicts() bool {
	old := verdictLazyMode
	defer func() { verdictLazyMode = old }()
	verdictLazyMode = true
	before := selftestCacheRuns
	if runSelftestCached("t-lazy-fixture", "no-such-selftest-name", "probe-a") {
		return false // a lazy miss is not a pass
	}
	if selftestCacheRuns != before {
		return false // and nothing ran
	}
	verdictLazyMode = false
	runSelftestCached("t-lazy-fixture", "no-such-selftest-name", "probe-b")
	if selftestCacheRuns != before+1 {
		return false // the eager miss actually ran (and recorded its false verdict)
	}
	verdictLazyMode = true
	if runSelftestCached("t-lazy-fixture", "no-such-selftest-name", "probe-b") {
		return false // the cached false answers identically in lazy mode
	}
	return selftestCacheRuns == before+1 // ...from the cache, not a re-run
}

// selftest:handoff-lifecycle — proves the one-shot server (test-handoff-lifecycle;
// req-handoff-lifecycle). Tiny bounds, an injected bless recorder, real HTTP:
// no page -> "unopened"; a page that stops heartbeating -> "closed" with the bless
// never fired; an answered page -> "y" with the bless fired exactly once.
func selftestHandoffLifecycle() bool {
	blessed := 0
	rec := func(g, v string) error { blessed++; return nil }
	render := func() string { return "<html>fixture hand-off</html>" }
	out, _ := serveHandoffOnce("g-fixture", render, 250*time.Millisecond, 300*time.Millisecond, 5*time.Second, rec, nil)
	if out != "unopened" || blessed != 0 {
		return false
	}
	started := make(chan string, 1)
	done := make(chan string, 1)
	go func() {
		o, _ := serveHandoffOnce("g-fixture", render, 3*time.Second, 400*time.Millisecond, 10*time.Second, rec, started)
		done <- o
	}()
	base := <-started
	if _, err := http.Get(base + "/handoff/g-fixture"); err != nil {
		return false // the page connects
	}
	http.Post(base+"/hb", "text/plain", nil)
	time.Sleep(900 * time.Millisecond) // the heartbeats stop
	if o := <-done; o != "closed" || blessed != 0 {
		return false // silence kills the server; the gate stays open
	}
	go func() {
		o, _ := serveHandoffOnce("g-fixture", render, 3*time.Second, 2*time.Second, 10*time.Second, rec, started)
		done <- o
	}()
	base = <-started
	http.Get(base + "/handoff/g-fixture")
	http.Post(base+"/handoff-answer", "application/x-www-form-urlencoded", strings.NewReader("gate=g-fixture&verdict=y"))
	if o := <-done; o != "y" || blessed != 1 {
		return false // the answer ends the server and fires the bless once
	}
	return true
}

func selftestHandoffMilestoneTitle() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "tasks", "x.md")
	nodes := map[string]Node{
		"i1-m7-sign": {ID: "i1-m7-sign", Milestone: 7, Class: "review", Killer: true, Path: iterPath, Statement: "acceptance obtained — sign-off evidence recorded"},
		"i1-m7-gate": {ID: "i1-m7-gate", Milestone: 7, Class: "review", Killer: true, Path: iterPath, Statement: "M7 Validate & accept reviewed and adjudicated.", DependsOn: []string{"i1-m7-sign"}},
	}
	sm := map[string]string{"i1-m7-sign": "OPEN", "i1-m7-gate": "OPEN"}
	if milestoneDisplayTitle("i0001_syn", 7, nodes) != "M7 Validate & accept" {
		return false
	}
	html := renderHandoffHTML("i1-m7-sign", nodes, sm)
	if !strings.Contains(html, "<h1>M7 Validate &amp; accept</h1>") {
		return false
	}
	if strings.Contains(html, "Action:") || strings.Contains(html, "Check:") || strings.Contains(html, "This page records") {
		return false
	}
	if !strings.Contains(html, `data-nid="i1-m7-sign"`) {
		return false
	}
	return strings.Contains(html, "👍 bless") && strings.Contains(html, "this page")
}

// selftest:unknown-type-refused — guards the silent-gate class (test-unknown-type;
// req-structural-strictness). A node whose type is outside the known set (a stray
// type:note, a typo) is REFUSED by the strict referee — it never becomes a blessable
// gate by default; every known type still loads clean.
func selftestUnknownTypeRefused() bool {
	dir, err := os.MkdirTemp("", "q21typ")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	it := filepath.Join(sp, "iterations", "i0001_x")
	os.MkdirAll(it, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\nversion = \"i0001_x\"\n"), 0o644)
	os.WriteFile(filepath.Join(it, "stray.md"),
		[]byte("---\nid: stray\ntype: note\nstatement: a lost note\nclass: review\nkiller: false\n---\n"), 0o644)
	found := false
	for _, is := range StrictIssues(sp) {
		if strings.Contains(is.Msg+is.Key, "type") && strings.Contains(is.Msg+is.Key, "note") {
			found = true
		}
	}
	if !found {
		return false // the stray type draws a strict refusal naming it
	}
	os.WriteFile(filepath.Join(it, "stray.md"),
		[]byte("---\nid: stray\ntype: question\nstate: open\nstatement: a real unknown\nclass: review\nkiller: false\n---\n"), 0o644)
	for _, is := range StrictIssues(sp) {
		if strings.Contains(is.Msg, "unknown type") {
			return false // a known type loads clean
		}
	}
	return true
}

// selftest:rigor-fit — proves the fit advisory (test-rigor-fit; req-rigor-fit).
// A trace far below the band draws one advisory naming count and band; a fitting
// trace draws none; the band reads from the rigor definition; the class is advisory
// (the lint's blocking count never includes it — pinned where the lanes sum).
func selftestRigorFit() bool {
	if fs := rigorFitAdvisory(3, "systematic", 10, 0); len(fs) != 1 ||
		!strings.Contains(fs[0], "3 trace nodes") || !strings.Contains(fs[0], "10") {
		return false
	}
	if len(rigorFitAdvisory(40, "systematic", 10, 0)) != 0 {
		return false
	}
	if fs := rigorFitAdvisory(90, "lean", 3, 60); len(fs) != 1 || !strings.Contains(fs[0], "step up") {
		return false
	}
	lo, _ := rigorFitBand("systematic")
	return lo >= 5 // the band lives with the rigor definition
}

// selftest:apply-general — proves the generalized apply lane (test-apply-general;
// req-apply-general). A manifest mixing create, whole-file write, and byte-exact
// replace dry-runs first and lands all-or-nothing; one failing operation (creating an
// existing file) refuses the WHOLE manifest and nothing is written.
func selftestApplyGeneral() bool {
	dir, err := os.MkdirTemp("", "q21apply")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	c := filepath.Join(dir, "c.txt")
	bf := filepath.Join(dir, "b.txt")
	os.WriteFile(c, []byte("alpha beta gamma"), 0o644)
	os.WriteFile(bf, []byte("old body"), 0o644)
	man := filepath.Join(dir, "m.json")
	esc := func(p string) string { return strings.ReplaceAll(p, `\`, `\\`) }
	good := `[
 {"op":"create","file":"` + esc(filepath.Join(dir, "a.txt")) + `","new":"born\n"},
 {"op":"write","file":"` + esc(bf) + `","new":"whole new body\n"},
 {"file":"` + esc(c) + `","old":"beta","new":"BETA"}
]`
	os.WriteFile(man, []byte(good), 0o644)
	if _, err := applyManifest(man, true); err != nil {
		return false // the mixed manifest validates on the dry run
	}
	if raw, _ := os.ReadFile(bf); string(raw) != "old body" {
		return false // a dry run writes nothing
	}
	if _, err := applyManifest(man, false); err != nil {
		return false
	}
	a, _ := os.ReadFile(filepath.Join(dir, "a.txt"))
	b2, _ := os.ReadFile(bf)
	c2, _ := os.ReadFile(c)
	if string(a) != "born\n" || string(b2) != "whole new body\n" || string(c2) != "alpha BETA gamma" {
		return false // create, write, and replace all landed
	}
	bad := `[
 {"file":"` + esc(c) + `","old":"BETA","new":"beta2"},
 {"op":"create","file":"` + esc(bf) + `","new":"clobber"}
]`
	os.WriteFile(man, []byte(bad), 0o644)
	if _, err := applyManifest(man, false); err == nil {
		return false // creating an existing file refuses the manifest
	}
	c3, _ := os.ReadFile(c)
	return string(c3) == "alpha BETA gamma" // all-or-nothing: the valid edit did not land alone
}

// selftest:seed-skeleton — proves the start-time seeder (test-seed-skeleton;
// req-seed-skeleton). Seeding a fixture version from the REAL systematic source (it
// carries non-ASCII em-dashes — the M5 encoding finding stays guarded) emits every
// milestone gate and its subtasks: namespaced ids, milestone-monotonic wiring,
// template wording as pre-fill, killer and derived marks honored; a second seed
// never clobbers.
func selftestSeedSkeleton() bool {
	dir, err := os.MkdirTemp("", "q21seed")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	n, err := seedSkeleton("i0042_fixture", "systematic", dir)
	if err != nil || n < 40 {
		return false // 8 gates + ~39 subtasks emit
	}
	tasks := dir + string(filepath.Separator) + "tasks"
	read := func(name string) Node {
		p := filepath.Join(tasks, name+".md")
		raw, e := os.ReadFile(p)
		if e != nil {
			return Node{}
		}
		return ParseNodeBytes(p, raw)
	}
	g1 := read("i42-m1-gate")
	if !g1.Killer || g1.Milestone != 1 || len(g1.DependsOn) < 3 {
		return false // the gate is killer and depends on its subtasks
	}
	g2 := read("i42-m2-gate")
	found := false
	for _, d := range g2.DependsOn {
		if d == "i42-m1-gate" {
			found = true
		}
	}
	if !found {
		return false // milestone-monotonic: the gate chains to the prior gate
	}
	ents, _ := os.ReadDir(tasks)
	killer, derived, monotonic := false, false, false
	for _, e := range ents {
		nn := read(strings.TrimSuffix(e.Name(), ".md"))
		if nn.ID == "" || !strings.HasPrefix(nn.ID, "i42-m") {
			return false // every id namespaced
		}
		if nn.Killer && !strings.HasSuffix(nn.ID, "-gate") {
			killer = true
		}
		if nn.Class == "executed" && strings.HasPrefix(nn.Verify, "coverage:") {
			derived = true
		}
		if nn.Milestone == 2 && !strings.HasSuffix(nn.ID, "-gate") {
			for _, d := range nn.DependsOn {
				if d == "i42-m1-gate" {
					monotonic = true
				}
			}
		}
		if nn.Statement == "" {
			return false // the template wording is the pre-fill; no blank statements
		}
	}
	if !killer || !derived || !monotonic {
		return false
	}
	n2, err := seedSkeleton("i0042_fixture", "systematic", dir)
	return err == nil && n2 == 0 // never clobber
}

// selftest:register-ask — proves the answer lane (test-register-ask; req-register-ask).
// A ruling rewrites the field AND its provenance under one file, records a resolved
// decision ask carrying the channel, and the recomputed color improves; an answer
// breaking the field's schema is refused.
func selftestRegisterAsk() bool {
	dir, err := os.MkdirTemp("", "q21ans")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "raid-x.md")
	body := "---\nid: raid-x\ntype: raid\nstatement: the risk\nkind: risk\nmitigation: TBD - propose or veto\nstatus: open\nkiller: false\nprovenance:\n  kind: schema-default (risk)\n  mitigation: tbd - no default\n---\n## Rationale (not load-bearing)\nr\n"
	os.WriteFile(p, []byte(body), 0o644)
	n := ParseNodeBytes(p, []byte(body))
	nodes := map[string]Node{"raid-x": n}
	store := &AskStore{}
	if registerAnswerApply(nodes, "raid-x", "status", "not-an-option", "register", store) == nil {
		return false // a schema-breaking answer is refused (answer-validated)
	}
	if err := registerAnswerApply(nodes, "raid-x", "mitigation", "bounded by the spike evidence", "register", store); err != nil {
		return false
	}
	raw, _ := os.ReadFile(p)
	txt := string(raw)
	if !strings.Contains(txt, "mitigation: bounded by the spike evidence") ||
		!strings.Contains(txt, "  mitigation: user-ruling via register") {
		return false // value and provenance rewrote together
	}
	if !strings.Contains(txt, "## Rationale") {
		return false // the body survives the rewrite untouched
	}
	if len(store.Asks) != 1 || store.Asks[0].Kind != "decision" || store.Asks[0].State != "resolved" {
		return false // the ruling records on the ask store
	}
	n2 := ParseNodeBytes(p, raw)
	sc := mergedSchema(loadFieldSchemas(schemaConfigDir()), "raid")
	c := nodeRegisterColor(sc, frontmatterMap(p), n2.Maps["provenance"])
	return c != "red" // the red cleared from recorded provenance
}

// selftest:register-killer-guard — proves the structural guard
// (test-register-killer-guard; req-register-killer-guard). A killer row refuses the
// lane, names the pager, and the file stays byte-identical; a non-killer resolves.
func selftestRegisterKillerGuard() bool {
	dir, err := os.MkdirTemp("", "q21kg")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "raid-k.md")
	body := "---\nid: raid-k\ntype: raid\nstatement: the killer\nkind: risk\nmitigation: TBD - propose or veto\nkiller: true\n---\n"
	os.WriteFile(p, []byte(body), 0o644)
	n := ParseNodeBytes(p, []byte(body))
	err = registerAnswerApply(map[string]Node{"raid-k": n}, "raid-k", "mitigation", "waved through", "register", &AskStore{})
	if err == nil || !strings.Contains(err.Error(), "--pager") {
		return false // refused, and the refusal routes to the pager
	}
	raw, _ := os.ReadFile(p)
	return string(raw) == body // byte-identical: the guard never touched the file
}

// selftest:register-render — proves the hand-off page (test-register-render;
// req-register-render; adr-handoff-html). A gate's hand-off renders ONE page: its cone
// as collapsed color-coded rows, core fields on the first disclosure level and every
// field with provenance on the second, distinct marks for the two greens, y/n bless
// actions on the page (dead buttons on a stale file are fine - the owner's ruling),
// and the REPORT carries no standing register section.
func selftestRegisterRender() bool {
	dir, err := os.MkdirTemp("", "q21hoff")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	write := func(name, body string) Node {
		p := filepath.Join(dir, name)
		os.WriteFile(p, []byte(body), 0o644)
		return ParseNodeBytes(p, []byte(body))
	}
	gate := write("g1-gate.md", "---\nid: g1-gate\nstatement: M1 reviewed and adjudicated.\nmilestone: M1\nclass: review\nkiller: true\ndepends_on: [raid-open, raid-ruled]\n---\n")
	red := write("raid-open.md", "---\nid: raid-open\ntype: raid\nstatement: the open risk\nkind: risk\nmitigation: TBD - propose or veto\nstatus: open\nkiller: false\nprovenance:\n  kind: schema-default (risk)\n  mitigation: tbd - no default\n  status: schema-default (open)\n---\n")
	ruled := write("raid-ruled.md", "---\nid: raid-ruled\ntype: raid\nstatement: the ruled risk\nkind: risk\nprobability: 0.2\nimpact: 0.9\nmitigation: bounded by the spike\nowner: the maintainer\nstatus: open\nkiller: false\nprovenance:\n  kind: user-ruling via console\n  probability: user-ruling via console\n  impact: user-ruling via console\n  mitigation: user-ruling via console\n  owner: user-ruling via console\n  status: user-ruling via console\n---\n")
	nodes := map[string]Node{"g1-gate": gate, "raid-open": red, "raid-ruled": ruled}
	html := renderHandoffHTML("g1-gate", nodes, map[string]string{"g1-gate": "OPEN", "raid-open": "OPEN", "raid-ruled": "DONE"})
	if !strings.Contains(html, "<h1>M1</h1>") || strings.Contains(html, "Action:") || strings.Contains(html, "Check:") {
		return false // the page opens with the milestone title and no redundant labels
	}
	if !strings.Contains(html, "the open risk") || !strings.Contains(html, "reg-red") {
		return false // cone rows: statement + computed color
	}
	if !strings.Contains(html, "reg-green-user") {
		return false // the adjudicated green wears its own mark
	}
	if !strings.Contains(html, `data-tier="core"`) || !strings.Contains(html, "reg-all") {
		return false // core fields first, everything on the second level
	}
	if !strings.Contains(html, `data-bless="g1-gate"`) || !strings.Contains(html, `data-verdict="y"`) || !strings.Contains(html, `data-verdict="n"`) {
		return false // the bless action lives ON the page
	}
	if !strings.Contains(html, `name="viewport"`) {
		return false // the page is phone-first (the owner reads it on the phone)
	}
	// the report carries NO standing register
	out := filepath.Join(dir, "rep.html")
	if RenderReport(out) != nil {
		return false
	}
	rep, err := os.ReadFile(out)
	if err != nil {
		return false
	}
	return !strings.Contains(string(rep), "regsec")
}

// selftest:register-colors — proves the color derivation (test-register-colors;
// req-register-colors). Green for user-ruled and mechanically derived values, yellow
// for deferrable defaults, red for unadjudicated core fields; a self-reported
// confidence source changes nothing; the row rolls to the worst field, and the green
// flavor distinguishes adjudication from agent confidence.
func selftestRegisterColors() bool {
	ts := &typeSchema{nodeType: "x", fields: map[string]*fieldRule{
		"kind":       {tier: "core"},
		"mitigation": {tier: "core"},
		"status":     {tier: "deferrable", def: "open", defSet: true},
	}}
	core := &fieldRule{tier: "core"}
	defC := &fieldRule{tier: "deferrable", def: "open", defSet: true}
	if fieldColor(core, "risk", "user-ruling via register") != "green-user" {
		return false
	}
	if fieldColor(core, "risk", "schema-default (risk)") != "green-agent" {
		return false
	}
	if fieldColor(defC, "open", "schema-default (open)") != "yellow" ||
		fieldColor(defC, "TBD - later", "tbd - no default") != "yellow" {
		return false
	}
	if fieldColor(defC, "open", "") != "yellow" {
		return false // an unstamped default-equal value stays mechanically explainable
	}
	if fieldColor(&fieldRule{tier: "core", def: "review", defSet: true}, "review", "") != "green-agent" {
		return false // pre-register history: default-equal core reads agent-green, never red noise
	}
	if fieldColor(core, "bounded", "agent-proposal: drafted from the seed") != "red" {
		return false
	}
	if fieldColor(core, "bounded", "confidence: 0.99") != "red" {
		return false // self-reported confidence is a mood, not provenance
	}
	fm := map[string]string{"kind": "risk", "mitigation": "bounded", "status": "open"}
	prov := map[string]string{"kind": "user-ruling via console", "mitigation": "agent-proposal: from the seed", "status": "schema-default (open)"}
	if nodeRegisterColor(ts, fm, prov) != "red" {
		return false // the worst field owns the row
	}
	prov["mitigation"] = "user-ruling via register"
	if c := nodeRegisterColor(ts, fm, prov); c != "yellow" {
		return false // reds cleared: the deferrable default shows
	}
	prov["status"] = "user-ruling via register"
	if nodeRegisterColor(ts, fm, prov) != "green-user" {
		return false // everything ruled: the adjudicated green
	}
	prov["kind"] = "schema-default (risk)"
	return nodeRegisterColor(ts, fm, prov) == "green-agent" // derived core: the confident green, never laundered
}

// selftest:mint-prefill — proves the mint prefill (test-mint-prefill; req-mint-prefill).
// A minted raid node reaches the user with every schema field carrying a value —
// defaults where the schema has them, an explicit TBD proposal marker where it does
// not — and a provenance block naming each value's source. No TODO survives on a
// schema-covered field.
func selftestMintPrefill() bool {
	body := mintBody("raid", "raid-fixture", map[string]string{"statement": "s"}, true)
	fm := strings.SplitN(body, "---", 3)
	if len(fm) < 3 {
		return false
	}
	front := fm[1]
	if !strings.Contains(front, "mitigation: TBD") {
		return false // the core no-default field carries the explicit TBD proposal marker
	}
	if strings.Contains(front, ": TODO") {
		return false // no schema-covered field ships the old blank marker
	}
	if !strings.Contains(front, "provenance:") ||
		!strings.Contains(front, "  mitigation: tbd") ||
		!strings.Contains(front, "  status: schema-default") {
		return false // every value names its source
	}
	// zero blanks: every schema field of the kind has a line
	sc := mergedSchema(loadFieldSchemas(schemaConfigDir()), "raid")
	for name := range sc.fields {
		if !strings.Contains(front, "\n"+name+":") && !strings.Contains(front, "\n"+name+" :") {
			return false
		}
	}
	return true
}

// selftest:provenance-block — proves per-field provenance is parsed and IDENTITY
// (test-register-colors' substrate; adr-provenance-in-node; req-mint-prefill.2).
// A provenance block parses from node frontmatter into the field map, and changing
// one provenance line moves the node's full hash (a veto edit and its provenance
// travel under one identity).
func selftestProvenanceBlock() bool {
	src := "---\nid: p1\ntype: requirement\nstatement: the s\nprovenance:\n  kind: schema-default\n  statement: agent-proposal - drafted from the seed\n---\n"
	n := ParseNodeBytes("p1.md", []byte(src))
	if n.Maps["provenance"]["kind"] != "schema-default" {
		return false // the block parses into the field map
	}
	n2 := ParseNodeBytes("p1.md", []byte(strings.Replace(src, "schema-default", "user-ruling via register", 1)))
	a := fullHash("p1", map[string]Node{"p1": n}, map[string]string{})
	b := fullHash("p1", map[string]Node{"p1": n2}, map[string]string{})
	return a != b // provenance is identity: the hash moves with it
}

// selftest:field-tier — proves the tier rollup (test-field-tier; req-field-tier).
// A core field missing or TBD counts the node undecided; deferrable fields riding
// defaults or TBD count it complete-with-deferrals; everything filled is complete.
func selftestFieldTier() bool {
	ts := &typeSchema{nodeType: "raid", fields: map[string]*fieldRule{
		"mitigation": {valType: "string", tier: "core"},
		"status":     {valType: "enum", enum: []string{"open", "closed"}, tier: "deferrable", def: "open", defSet: true},
	}}
	st := nodeTierState(ts, map[string]string{"id": "x"})
	if st.state != "undecided" || len(st.coreOpen) != 1 || st.coreOpen[0] != "mitigation" {
		return false // a missing core field is undecided
	}
	st = nodeTierState(ts, map[string]string{"id": "x", "mitigation": "TBD - later"})
	if st.state != "undecided" {
		return false // a TBD core field is undecided
	}
	st = nodeTierState(ts, map[string]string{"id": "x", "mitigation": "bounded by the M3 step"})
	if st.state != "complete-with-deferrals" || len(st.deferrals) != 1 || st.deferrals[0] != "status" {
		return false // only deferrable defaults left
	}
	st = nodeTierState(ts, map[string]string{"id": "x", "mitigation": "bounded", "status": "open"})
	return st.state == "complete" && len(st.coreOpen) == 0 && len(st.deferrals) == 0
}

// selftest:battery-tiers — proves the selftest tiers (test-battery-tiers;
// req-selftest-tiers). The fast tier is a small, valid subset of the registry carrying
// the build invariants (parity, determinism, parser); the argless battery still walks
// the FULL registry; every fast-tier case passes right now.
func selftestBatteryTiers() bool {
	tier := buildFastTier()
	if len(tier) < 3 || len(tier)*10 > len(selftestRegistry) {
		return false // small and real, or it is no tier
	}
	names := map[string]bool{}
	for _, t := range selftestRegistry {
		names[t.name] = true
	}
	must := map[string]bool{"parity": false, "determinism": false, "parser": false}
	for _, n := range tier {
		if !names[n] {
			return false // a tier member must exist in the registry
		}
		if _, ok := must[n]; ok {
			must[n] = true
		}
	}
	for _, seen := range must {
		if !seen {
			return false // the build invariants ride the tier
		}
	}
	return true
}

// selftest:terms-readme — proves the README joins the terms lint's reading order
// (test-terms-readme; req-terms-readme-scope). A BARE glossary-term use in a fixture
// README is a finding; a LINKED use (definition one click away) passes; the shipped
// README yields no findings.
func selftestTermsReadme() bool {
	gloss := map[string]GlossTerm{"gate": {Term: "gate"}}
	dir, err := os.MkdirTemp("", "q21readme")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	bare := filepath.Join(dir, "README.md")
	os.WriteFile(bare, []byte("# tool\n\nEvery gate needs review.\n"), 0o644)
	if len(readmeTermFindings(bare, gloss)) != 1 {
		return false // a bare use is a finding
	}
	linked := filepath.Join(dir, "README2.md")
	os.WriteFile(linked, []byte("# tool\n\nEvery [gate](spec/book.html#term-gate) needs review.\n"), 0o644)
	if len(readmeTermFindings(linked, gloss)) != 0 {
		return false // a linked use is one click from its definition
	}
	// the shipped README holds the owner's law today
	return len(readmeTermFindings(filepath.Join(filepath.Dir(SPEC), "README.md"), readGlossary())) == 0
}

// selftest:jargon-advisory — proves the jargon heuristic (test-jargon-advisory;
// req-jargon-advisory). An all-caps acronym outside the glossary draws one advisory;
// glossary terms and sentence-capitalized words draw none.
func selftestJargonAdvisory() bool {
	gloss := map[string]GlossTerm{"ears": {Term: "EARS"}}
	body := "The QZXF budget rides here. This NEVER breaks. Every statement is EARS-shaped. It never fails.\n"
	vocab := jargonVocab([]string{body})
	finds := jargonFindings(body, "fixture-ch-u1", gloss, vocab)
	if len(finds) != 1 || !strings.Contains(finds[0], "QZXF") {
		return false // the acronym flags; the glossary term and the emphasized word (never) do not
	}
	return len(jargonFindings("plain prose only.\n", "fixture-ch-u1", gloss, vocab)) == 0
}

// selftest:drivers-derived — proves the drivers union (test-drivers-derived;
// req-drivers-derived). A requirement joins the drivers table when a kind:architecture
// ADR addresses it OR it carries the hand tag; each derived row names its deciding
// ADR(s); a requirement with neither stays absent.
func selftestDriversDerived() bool {
	fix := map[string]Node{
		"r-arch":  {ID: "r-arch", Type: "requirement", Statement: "the shaped one"},
		"r-plain": {ID: "r-plain", Type: "requirement", Statement: "the unshaped one"},
		"a-arch":  {ID: "a-arch", Type: "adr", Kind: "architecture", Statement: "the shaping decision", Addresses: []string{"r-arch"}},
		"a-proj":  {ID: "a-proj", Type: "adr", Kind: "project", Statement: "a project decision", Addresses: []string{"r-plain"}},
	}
	u := driversUnion(fix)
	if len(u["r-arch"]) != 1 || u["r-arch"][0] != "a-arch" {
		return false // architecture-addressed requirement joins, naming its ADR
	}
	if _, ok := u["r-plain"]; ok {
		return false // a non-architecture ADR confers nothing
	}
	html := renderAsrList(fix)
	return strings.Contains(html, "r-arch") && !strings.Contains(html, "r-plain") &&
		strings.Contains(html, "a-arch")
}

// selftest:deck-goto — guards the goto-into-deck class (test-deck-goto; req-deck-links).
// Static on the emitted book JS: bookGoto delegates a deck target through __deckJump
// BEFORE any scroll, and __deckJump enters present mode via bookSlideTo. The bug class
// (a goto scrolling an off-screen deck copy) cannot return while both hold in order.
func selftestDeckGoto() bool {
	html, ok := bookOnceHTML()
	if !ok {
		return true // nested probe: the outer run decides
	}
	if html == "" {
		return false
	}
	// every emitted bookGoto copy delegates to __deckJump before it scrolls
	rest := html
	seen := 0
	for {
		gi := strings.Index(rest, "window.bookGoto=function")
		if gi < 0 {
			break
		}
		seen++
		body := rest[gi:]
		if end := strings.Index(body, "popstate"); end > 0 {
			body = body[:end]
		}
		dj := strings.Index(body, "__deckJump")
		sc := strings.Index(body, "scrollIntoView")
		if dj < 0 || sc < 0 || dj > sc {
			return false // the delegation must run before the scroll
		}
		rest = rest[gi+1:]
	}
	return seen > 0 && strings.Contains(html, "window.__deckJump=function") && strings.Contains(html, "bookSlideTo")
}

// selftest:ears-baseline — proves the EARS grandfather sweep (test-ears-baseline;
// req-ears-authoring). The live tree carries ZERO non-exempt EARS findings, and every
// exemption is well-formed: "exempt - <reason>" with a real reason, so no exemption
// survives without its recorded decision.
func selftestEarsBaseline() bool {
	nodes := LoadAll()
	findings, _ := earsFindings(nodes)
	if len(findings) != 0 {
		return false
	}
	for _, n := range nodes {
		if n.Ears == "" {
			continue
		}
		reason := strings.TrimPrefix(n.Ears, "exempt - ")
		if reason == n.Ears || strings.TrimSpace(reason) == "" {
			return false
		}
	}
	return true
}

// selftest:graph-suffix-rooted — proves the trace graph resolves numbered-statement
// targets and carries no age dimension (test-graph-suffix-rooted; req-trace-clustered,
// adr-trace-graph-no-age). Three claims:
//  1. unit: a design implementing req-x.2 and a test verifying req-x.1 root under
//     their need's tab, and no (unrooted) tab appears.
//  2. unit: no age-fold box and no phantom i0000_baseline group renders — iteration
//     grouping is a sidebar concept, never a trace-graph fold.
//  3. end-to-end: the engine's own workspace renders fully rooted and age-free.
func selftestGraphSuffixRooted() bool {
	fix := map[string]Node{
		"n1": {ID: "n1", Type: "need", Statement: "s", Path: filepath.Join(SPEC, "trace", "n1.md")},
		"u1": {ID: "u1", Type: "usecase", Refines: []string{"n1"}, Path: filepath.Join(SPEC, "usecases", "u1.md")},
		"r1": {ID: "r1", Type: "requirement", Refines: []string{"u1"}, Path: filepath.Join(SPEC, "iterations", "i0001_x", "r1.md")},
		"d1": {ID: "d1", Type: "design", Implements: []string{"r1.2", "r1.3"}, Path: filepath.Join("product", "x.go")},
		"t1": {ID: "t1", Type: "test", Verifies: []string{"r1.1"}, Path: filepath.Join(SPEC, "iterations", "i0001_x", "t1.md")},
	}
	rooted := map[string]bool{}
	for _, tb := range traceTabs(fix, map[string]string{}, false) {
		if tb.Label == "(unrooted)" {
			return false
		}
		for _, el := range tb.Elements {
			id := el.Data["id"]
			if strings.Contains(id, "fold::age::") || strings.Contains(id, "i0000_baseline") {
				return false // age never boxes; the phantom group never renders
			}
			if tb.Label == "n1" {
				rooted[id] = true
			}
		}
	}
	if !rooted["d1"] || !rooted["t1"] {
		return false
	}
	// 3. the engine's own workspace stays fully rooted and age-free.
	for _, tb := range graphTabs(LoadAll(), map[string]string{}) {
		if tb.Label == "(unrooted)" {
			return false
		}
		for _, el := range tb.Elements {
			if strings.Contains(el.Data["id"], "fold::age::") {
				return false
			}
		}
	}
	return true
}
