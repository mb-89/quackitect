package main

// The i0012 spec-template extension selftest battery (owner-directed 2026-07-05).
// Authored BEFORE the build (test-first): each case was observed RED against the
// unbuilt machinery and recorded via `quack observe-red` on its trace test node.

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// selftestRatingsMap — test-ratings-map: a node with a one-level frontmatter map
// parses and its entries are readable; a two-level map refuses; unknown top-level
// keys still refuse; an indented entry outside a map key refuses.
func selftestRatingsMap() bool {
	dir, _ := os.MkdirTemp("", "qst-ratings")
	defer os.RemoveAll(dir)
	mk := func(name, body string) string {
		p := filepath.Join(dir, name)
		os.WriteFile(p, []byte(body), 0o644)
		return p
	}
	// (1) one-level map parses; entries readable
	good := mk("cand-a.md", "---\nid: cand-a\nstatement: option a\nclass: review\nratings:\n  crit-speed: 0.8\n  crit-cost: 0.3\n---\n")
	n := ParseNode(good)
	if n.Maps == nil || n.Maps["ratings"] == nil {
		return false
	}
	if n.Maps["ratings"]["crit-speed"] != "0.8" || n.Maps["ratings"]["crit-cost"] != "0.3" {
		return false
	}
	// strict: the same corpus is clean
	if got := StrictIssues(dir); len(got) != 0 {
		return false
	}
	// (2) a two-level map refuses
	os.Remove(good)
	mk("cand-b.md", "---\nid: cand-b\nstatement: s\nratings:\n  inner:\n    deep: 1\n---\n")
	if !issueWith(StrictIssues(dir), "cand-b", "ratings.inner") {
		return false
	}
	// (3) unknown top-level keys still refuse
	os.Remove(filepath.Join(dir, "cand-b.md"))
	mk("cand-c.md", "---\nid: cand-c\nstatement: s\nbogus_key: x\n---\n")
	if !issueWith(StrictIssues(dir), "cand-c", "bogus_key") {
		return false
	}
	// (4) an indented entry outside a map key refuses
	os.Remove(filepath.Join(dir, "cand-c.md"))
	mk("cand-d.md", "---\nid: cand-d\nstatement: s\n  stray: 1\n---\n")
	return issueWith(StrictIssues(dir), "cand-d", "stray")
}

// selftestBaseViews — test-base-views: a fixture base block filters, sorts, limits,
// and groups with counts deterministically (two evaluations byte-identical); a volatile
// function and an out-of-subset construct each refuse with an error.
func selftestBaseViews() bool {
	dir, _ := os.MkdirTemp("", "qst-base")
	defer os.RemoveAll(dir)
	mk := func(name, body string) string {
		p := filepath.Join(dir, name)
		os.WriteFile(p, []byte(body), 0o644)
		return p
	}
	paths := []string{
		mk("req-a.md", "---\nid: req-a\ntype: requirement\nstatement: alpha\nweight: 0.9\nphase: [operation, maintenance]\n---\n"),
		mk("req-b.md", "---\nid: req-b\ntype: requirement\nstatement: beta\nweight: 0.4\nphase: [operation]\n---\n"),
		mk("req-c.md", "---\nid: req-c\ntype: requirement\nstatement: gamma\nweight: 0.7\nphase: [disposal]\n---\n"),
		mk("uc-x.md", "---\nid: uc-x\ntype: usecase\nstatement: not a requirement\n---\n"),
	}
	block := "filters:\n" +
		"  and:\n" +
		"    - 'type == \"requirement\"'\n" +
		"    - 'weight >= 0.5'\n" +
		"views:\n" +
		"  - type: table\n" +
		"    name: Register\n" +
		"    order: [file.name, statement, weight]\n" +
		"    sort:\n" +
		"      - property: weight\n" +
		"        direction: DESC\n" +
		"    groupBy: phase\n"
	r1, err := EvalBase(block, paths, nil)
	if err != nil {
		return false
	}
	r2, _ := EvalBase(block, paths, nil)
	t1, t2 := BaseResultText(r1), BaseResultText(r2)
	if t1 != t2 || t1 == "" {
		return false
	}
	// req-a (0.9) passes and fans out into two phase groups; req-b (0.4) is filtered out;
	// uc-x fails the type filter; groups sort by key.
	if !strings.Contains(t1, "group disposal (1)") || !strings.Contains(t1, "group maintenance (1)") ||
		!strings.Contains(t1, "group operation (1)") || strings.Contains(t1, "req-b") || strings.Contains(t1, "uc-x") {
		return false
	}
	// volatile refuses
	vol := "filters: 'now() > 1'\nviews:\n  - type: table\n"
	if _, err := EvalBase(vol, paths, nil); err == nil || !strings.Contains(err.Error(), "volatile") {
		return false
	}
	// out-of-subset view type refuses
	oos := "views:\n  - type: cards\n"
	if _, err := EvalBase(oos, paths, nil); err == nil || !strings.Contains(err.Error(), "out-of-subset") {
		return false
	}
	// out-of-subset top-level key refuses
	oos2 := "formulas:\n  x: '1'\nviews:\n  - type: table\n"
	if _, err := EvalBase(oos2, paths, nil); err == nil || !strings.Contains(err.Error(), "out-of-subset") {
		return false
	}
	// out-of-subset function refuses
	oos3 := "filters: 'mystery(1)'\nviews:\n  - type: table\n"
	_, err = EvalBase(oos3, paths, nil)
	return err != nil && strings.Contains(err.Error(), "out-of-subset")
}

// selftestSpecContentRoots — test-spec-content-roots: terms, references, fundamentals,
// and methods load from the workspace spec with aliases readable; quackitect's own
// glossary resolves from spec; the retired method-layer glossary path no longer exists.
func selftestSpecContentRoots() bool {
	root, _ := os.MkdirTemp("", "qst-content")
	defer os.RemoveAll(root)
	for _, d := range []string{"glossary", "references", "fundamentals", "methods"} {
		os.MkdirAll(filepath.Join(root, d), 0o755)
	}
	os.WriteFile(filepath.Join(root, "glossary", "gate.md"),
		[]byte("---\nterm: gate\nlong: user-adjudicated gate\nclass: domain\naliases: [gates, quality gate]\n---\nA check a person approves.\n"), 0o644)
	os.WriteFile(filepath.Join(root, "glossary", "ohm.md"),
		[]byte("---\nterm: resistance\nclass: notation\nunit: ohm\naliases: [R]\n---\nElectrical resistance.\n"), 0o644)
	os.WriteFile(filepath.Join(root, "references", "ref-iso-25010.md"),
		[]byte("---\ntitle: ISO/IEC 25010\nurl: https://www.iso.org/standard/35733.html\nkind: normative\nversion: 2011\naccessed: 2026-07-05\naliases: [25010]\n---\nThe product quality model.\n"), 0o644)
	os.WriteFile(filepath.Join(root, "fundamentals", "fund-suspect.md"),
		[]byte("---\nstatement: Why checks reopen when inputs change.\naliases: [suspect mechanism]\n---\nThe long explanation.\n"), 0o644)
	os.WriteFile(filepath.Join(root, "methods", "method-nine-window.md"),
		[]byte("---\nstatement: Context analysis across system levels and time.\naliases: [nine windows, system operator]\nsource: ref-triz\n---\nSituation, effect, procedure, tools.\n"), 0o644)
	old := contentRootOverride
	contentRootOverride = root
	defer func() { contentRootOverride = old }()
	terms := ReadContentNotes("glossary")
	refs := ReadContentNotes("references")
	funds := ReadContentNotes("fundamentals")
	methods := ReadContentNotes("methods")
	if terms["gate"].Long != "user-adjudicated gate" || len(terms["gate"].Aliases) != 2 {
		return false
	}
	if terms["ohm"].Unit != "ohm" || terms["ohm"].Class != "notation" {
		return false
	}
	if refs["ref-iso-25010"].RefKind != "normative" || refs["ref-iso-25010"].Version != "2011" ||
		refs["ref-iso-25010"].URL == "" {
		return false
	}
	if funds["fund-suspect"].Statement == "" || funds["fund-suspect"].Body == "" {
		return false
	}
	if methods["method-nine-window"].Source != "ref-triz" || len(methods["method-nine-window"].Aliases) != 2 {
		return false
	}
	// the alias index resolves and a duplicate alias is a hard error
	idx, errs := AliasIndex()
	if len(errs) != 0 || idx["gates"] == "" || idx["r"] == "" {
		return false
	}
	os.WriteFile(filepath.Join(root, "glossary", "gate2.md"),
		[]byte("---\nterm: gate2\nclass: domain\naliases: [gates]\n---\nx\n"), 0o644)
	if _, errs := AliasIndex(); len(errs) == 0 {
		return false
	}
	// content notes are NOT graph nodes: the strict guard skips the content dirs
	os.WriteFile(filepath.Join(root, "req-x.md"), []byte("---\nid: req-x\nstatement: s\n---\n"), 0o644)
	if got := StrictIssues(root); len(got) != 0 {
		return false
	}
	// the real workspace: quackitect's glossary lives in spec; the method-layer path is retired
	if ents, err := os.ReadDir(filepath.Join(SPEC, "glossary")); err != nil || len(ents) == 0 {
		return false
	}
	if _, err := os.Stat(filepath.Join(EngineDir(), "method", "glossary")); err == nil {
		return false
	}
	return true
}

// selftestAutoLink — test-auto-link: an alias mention links; an authored link stays
// untouched; the longer name wins over its substring; code blocks and headings stay
// untouched; two notes claiming one alias refuse with an error.
func selftestAutoLink() bool {
	idx := map[string]string{
		"gate":         "glossary:gate",
		"gates":        "glossary:gate",
		"quality gate": "glossary:gate",
		"suspect mechanism": "fundamentals:fund-suspect",
	}
	out := AutoLink("The gates open now.", idx)
	if !strings.Contains(out, "[gates](term:gate)") {
		return false
	}
	// authored link wins - untouched
	authored := "An authored [gate](term:gate) stays."
	if AutoLink(authored, idx) != authored {
		return false
	}
	// longest name wins: "quality gate" links whole, no nested [gate] link inside
	out = AutoLink("Run a quality gate early.", idx)
	if !strings.Contains(out, "[quality gate](term:gate)") || strings.Contains(out, "[quality [gate]") {
		return false
	}
	// non-glossary kinds link their anchor (id-only; mdInline prepends the #)
	out = AutoLink("The suspect mechanism reopens checks.", idx)
	if !strings.Contains(out, "[suspect mechanism](fund-suspect)") {
		return false
	}
	// code fences, inline code, and headings stay untouched
	exempt := "# the gate heading\n```\ngate in code\n```\nuse `gate` inline."
	if AutoLink(exempt, idx) != exempt {
		return false
	}
	// collision refuses at index build (the book surfaces it as a finding)
	root, _ := os.MkdirTemp("", "qst-alias")
	defer os.RemoveAll(root)
	os.MkdirAll(filepath.Join(root, "glossary"), 0o755)
	os.WriteFile(filepath.Join(root, "glossary", "a.md"), []byte("---\nterm: a\nclass: domain\naliases: [shared]\n---\nx\n"), 0o644)
	os.WriteFile(filepath.Join(root, "glossary", "b.md"), []byte("---\nterm: b\nclass: domain\naliases: [shared]\n---\nx\n"), 0o644)
	old := contentRootOverride
	contentRootOverride = root
	defer func() { contentRootOverride = old }()
	_, errs := AliasIndex()
	return len(errs) == 1 && strings.Contains(errs[0], "shared")
}

// selftestCh2Derived — test-ch2-derived: the pull law as pooled queries. Used references
// and fundamentals render through the `referenced` predicate (deferred until the link
// graph is complete): normative apart from (and before) informative, the one-liner list
// in the ch2 view, the full bodies in the ch8 view. Unused entries do not render, and
// `referenced` outside the emitter refuses loudly.
func selftestCh2Derived() bool {
	tmp, _ := os.MkdirTemp("", "qst-ch2")
	defer os.RemoveAll(tmp)
	root := filepath.Join(tmp, "spec") // paths must sit under spec/ for the shipped inFolder filters
	os.MkdirAll(filepath.Join(root, "references"), 0o755)
	os.MkdirAll(filepath.Join(root, "fundamentals"), 0o755)
	os.WriteFile(filepath.Join(root, "references", "ref-a.md"),
		[]byte("---\ntitle: Norm A\nurl: https://example.org/a\nkind: normative\nversion: 2011\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "references", "ref-b.md"),
		[]byte("---\ntitle: Paper B\nurl: https://example.org/b\nkind: informative\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "references", "ref-c.md"),
		[]byte("---\ntitle: Unused C\nurl: https://example.org/c\nkind: normative\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "fundamentals", "fund-x.md"),
		[]byte("---\nstatement: The one-liner of X.\n---\nThe full body of X explains at length.\n"), 0o644)
	os.WriteFile(filepath.Join(root, "fundamentals", "fund-y.md"),
		[]byte("---\nstatement: Unused Y.\n---\nNever linked.\n"), 0o644)
	oldRoot := contentRootOverride
	contentRootOverride = root
	defer func() { contentRootOverride = oldRoot }()
	// the SHIPPED queries pool into the fixture's spec/queries
	qsrc := filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "queries")
	pool := filepath.Join(root, "queries")
	os.MkdirAll(pool, 0o755)
	var refsQuery string
	for _, q := range []string{"fundamentals.base", "references.base"} {
		raw, err := os.ReadFile(filepath.Join(qsrc, q))
		if err != nil {
			return false
		}
		if q == "references.base" {
			refsQuery = string(raw)
		}
		os.WriteFile(filepath.Join(pool, q), raw, 0o644)
	}
	oldPool := queriesDirOverride
	queriesDirOverride = pool
	defer func() { queriesDirOverride = oldPool }()
	// a chapter whose prose LINKS ref-a, ref-b, and fund-x (authored links = usage),
	// embedding the ch2 views; a second chapter embeds the ch8 full-body view.
	dir, _ := os.MkdirTemp("", "qst-ch2b")
	defer os.RemoveAll(dir)
	nodes := bookFixture(dir, 1, true)
	man := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede: bound by [Norm A](ref-a) and [Paper B](ref-b), see [X](fund-x).\n---\n" +
		"![[fundamentals.base#Fundamentals]]\n---\n![[references.base]]\n---\n[req-fix](req-fix.md)\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man), 0o644)
	man2 := "---\nid: man-fix2\ntype: manifest\nmode: chapter\nstatement: Guidance fixture.\n---\n" +
		"<!-- ai:3 -->\nThe guidance lede.\n---\n![[fundamentals.base#Fundamentals in full]]\n"
	mp2 := filepath.Join(dir, "man-fix2.md")
	os.WriteFile(mp2, []byte(man2), 0o644)
	nodes["man-fix2"] = Node{ID: "man-fix2", Type: "manifest", Mode: "chapter", Statement: "Guidance fixture.", Path: mp2}
	html, findings, _ := renderBookHTML(nodes)
	if len(findings) != 0 {
		return false
	}
	// used entries render; normative renders apart from AND before informative
	ni, ii := strings.Index(html, "<h2>Normative</h2>"), strings.Index(html, "<h2>Informative</h2>")
	if !strings.Contains(html, "Norm A") || !strings.Contains(html, "Paper B") || ni < 0 || ii < ni {
		return false
	}
	// the reference prints its pin and its only-legal URL as a live link
	if !strings.Contains(html, `href="https://example.org/a"`) || !strings.Contains(html, ", 2011") {
		return false
	}
	// the pull law holds: unused entries are absent
	if strings.Contains(html, "Unused C") || strings.Contains(html, "Unused Y") {
		return false
	}
	// the ch2 view carries the one-liner; the ch8 view renders the full body at its anchor
	if !strings.Contains(html, "The one-liner of X.") || !strings.Contains(html, "The full body of X explains at length.") ||
		!strings.Contains(html, `<section id="fund-x"`) {
		return false
	}
	// `referenced` outside the emitter refuses loudly - never a silent superset
	_, err := EvalBase(refsQuery, []string{filepath.Join(root, "references", "ref-a.md")}, nil)
	return err != nil && strings.Contains(err.Error(), "referenced")
}

// selftestFigTables — test-fig-tables: the verification matrix and the stakeholder matrix
// render from the shipped base queries; the retired figure kinds refuse with a pointer.
func selftestFigTables() bool {
	dir, _ := os.MkdirTemp("", "qst-figt")
	defer os.RemoveAll(dir)
	nodes := bookFixture(dir, 1, true)
	// a test node file so the canned verification query has a row
	tp := filepath.Join(dir, "test-fix.md")
	os.WriteFile(tp, []byte("---\nid: test-fix\ntype: test\nstatement: verifies the fixture.\nverifies: [req-fix]\nverify: selftest:x\n---\n"), 0o644)
	n := nodes["test-fix"]
	n.Path = tp
	n.Statement = "verifies the fixture."
	nodes["test-fix"] = n
	// a stakeholder note file for the stakeholder query
	sp := filepath.Join(dir, "stk-user.md")
	os.WriteFile(sp, []byte("---\nid: stk-user\ntype: stakeholder\nstatement: the user role.\nrole: user\ninterest: 0.8\ninfluence: 0.5\nweight: 0.7\n---\n"), 0o644)
	nodes["stk-user"] = Node{ID: "stk-user", Type: "stakeholder", Statement: "the user role.", Class: "review", Path: sp}
	// the shipped queries exist and pool into a fixture spec/queries (owner ruling: central pool)
	qdir := filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "queries")
	vv, err1 := os.ReadFile(filepath.Join(qdir, "vv-matrix.base"))
	stk, err2 := os.ReadFile(filepath.Join(qdir, "stakeholder-matrix.base"))
	if err1 != nil || err2 != nil {
		return false
	}
	pool := filepath.Join(dir, "queries")
	os.MkdirAll(pool, 0o755)
	os.WriteFile(filepath.Join(pool, "vv-matrix.base"), vv, 0o644)
	oldPool := queriesDirOverride
	queriesDirOverride = pool
	defer func() { queriesDirOverride = oldPool }()
	// the chapter references one pooled query (![[..]]) and authors one inline block
	man := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede of the fixture chapter.\n---\n![[vv-matrix.base]]\n---\n```base\n" + string(stk) + "```\n---\n[req-fix](req-fix.md)\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man), 0o644)
	html, findings, _ := renderBookHTML(nodes)
	if len(findings) != 0 {
		return false
	}
	// the verification matrix groups by requirement and carries the test row
	// (reader NAME since i14, req-reader-columns: ids render humanized)
	if !strings.Contains(html, "Verification matrix") || !strings.Contains(html, "req-fix (1)") || !strings.Contains(html, "<td>fix</td>") {
		return false
	}
	// the stakeholder matrix renders the item row
	if !strings.Contains(html, "Stakeholders") || !strings.Contains(html, "<td>user</td>") {
		return false
	}
	// a missing pooled query is a render-failing finding, never a silent skip
	manMiss := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede of the fixture chapter.\n---\n![[no-such.base]]\n---\n[req-fix](req-fix.md)\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(manMiss), 0o644)
	_, findingsMiss, _ := renderBookHTML(nodes)
	missFound := false
	for _, f := range findingsMiss {
		if strings.Contains(f, "no-such.base") {
			missFound = true
		}
	}
	if !missFound {
		return false
	}
	// a retired fig kind refuses with the pointer
	man2 := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede of the fixture chapter.\n---\nfig: vv-table\n---\n[req-fix](req-fix.md)\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man2), 0o644)
	_, findings2, _ := renderBookHTML(nodes)
	found := false
	for _, f := range findings2 {
		if strings.Contains(f, "retired") && strings.Contains(f, "vv-table") {
			found = true
		}
	}
	return found
}

// selftestDecisionKinds — test-decision-kinds: decisions of the three kinds each render
// in their owning chapter's view; an unknown kind refuses at strict load.
func selftestDecisionKinds() bool {
	dir, _ := os.MkdirTemp("", "qst-dk")
	defer os.RemoveAll(dir)
	nodes := bookFixture(dir, 1, true)
	mkAdr := func(id, kind string) {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: adr\nkind: "+kind+"\naddresses: [req-fix]\nadjudicated_by: human\nstatement: the "+kind+" decision.\nclass: review\n---\n"), 0o644)
		nodes[id] = Node{ID: id, Type: "adr", Kind: kind, Addresses: []string{"req-fix"}, Statement: "the " + kind + " decision.", Class: "review", Path: p}
	}
	mkAdr("adr-arch", "architecture")
	mkAdr("dec-tailor", "project")
	mkAdr("wvr-dev", "waiver")
	view := func(kind string) string {
		return "```base\nfilters:\n  and:\n    - 'type == \"adr\"'\n    - 'kind == \"" + kind + "\"'\nviews:\n  - type: table\n    name: " + kind + " decisions\n    order: [file.name, statement]\n```"
	}
	man := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede of the fixture chapter.\n---\n" + view("architecture") + "\n---\n" + view("project") + "\n---\n" + view("waiver") + "\n---\n[req-fix](req-fix.md)\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man), 0o644)
	html, findings, _ := renderBookHTML(nodes)
	if len(findings) != 0 {
		return false
	}
	// each kind's view carries exactly its own decision
	archPos := strings.Index(html, "architecture decisions")
	projPos := strings.Index(html, "project decisions")
	wvrPos := strings.Index(html, "waiver decisions")
	if archPos < 0 || projPos < 0 || wvrPos < 0 {
		return false
	}
	arch, proj := html[archPos:projPos], html[projPos:wvrPos]
	wvr := html[wvrPos:]
	if !strings.Contains(arch, "adr-arch") || strings.Contains(arch, "dec-tailor") ||
		!strings.Contains(proj, "dec-tailor") || strings.Contains(proj, "wvr-dev") ||
		!strings.Contains(wvr, "wvr-dev") {
		return false
	}
	// an unknown kind refuses at strict load
	os.WriteFile(filepath.Join(dir, "adr-bad.md"), []byte("---\nid: adr-bad\ntype: adr\nkind: whim\nstatement: s\n---\n"), 0o644)
	return issueWith(StrictIssues(dir), "adr-bad", "whim")
}

// selftestCandidates — test-candidates: candidates with ratings render the matrix;
// chosen/rejected links derive the status; a rating outside 0..1 refuses.
func selftestCandidates() bool {
	dir, _ := os.MkdirTemp("", "qst-cand")
	defer os.RemoveAll(dir)
	mkCand := func(id, axis string, speed, cost string) Node {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: candidate\naxis: "+axis+"\nstatement: option "+id+".\nratings:\n  crit-speed: "+speed+"\n  crit-cost: "+cost+"\n---\npros and cons.\n"), 0o644)
		return ParseNode(p)
	}
	nodes := map[string]Node{}
	nodes["cand-a"] = mkCand("cand-a", "storage", "0.8", "0.3")
	nodes["cand-b"] = mkCand("cand-b", "storage", "0.4", "0.9")
	nodes["adr-pick"] = Node{ID: "adr-pick", Type: "adr", Kind: "architecture",
		Chosen: []string{"cand-a"}, Rejected: []string{"cand-b"}, Statement: "picks a.", Class: "review"}
	html := renderFigure("candidates-matrix", nodes)
	// dynamic criteria columns, axis grouping, and the derived statuses
	if !strings.Contains(html, "crit-speed") || !strings.Contains(html, "crit-cost") ||
		!strings.Contains(html, "storage") {
		return false
	}
	if !strings.Contains(html, "chosen by adr-pick") || !strings.Contains(html, "rejected by adr-pick") {
		return false
	}
	// the ratings parse through the one-level map
	if nodes["cand-a"].Maps["ratings"]["crit-speed"] != "0.8" {
		return false
	}
	// a rating outside 0..1 refuses at strict load
	os.WriteFile(filepath.Join(dir, "cand-c.md"), []byte("---\nid: cand-c\ntype: candidate\naxis: storage\nstatement: s\nratings:\n  crit-speed: 1.5\n---\n"), 0o644)
	return issueWith(StrictIssues(dir), "cand-c", "ratings.crit-speed")
}

// selftestFacetBoard — test-facet-board: the board counts per vocabulary value with a
// zero-count hole visible; a value outside the vocabulary refuses; the counts carry the
// register filter hooks (buttons target row classes).
func selftestFacetBoard() bool {
	dir, _ := os.MkdirTemp("", "qst-board")
	defer os.RemoveAll(dir)
	mkReq := func(id, facets string) Node {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: requirement\nstatement: The system shall "+id+".\n"+facets+"\n---\n"), 0o644)
		return ParseNode(p)
	}
	nodes := map[string]Node{}
	nodes["req-op"] = mkReq("req-op", "phase: [operation, maintenance]\ndiscipline: [software]\nquality: [safety]")
	nodes["req-two"] = mkReq("req-two", "phase: [operation]\nquality: [usability]")
	html := renderCoverageBoard(nodes)
	// counts per value; multi-valued facets count in every carried cell
	if !strings.Contains(html, ">operation (2)<") || !strings.Contains(html, ">maintenance (1)<") ||
		!strings.Contains(html, ">safety (1)<") {
		return false
	}
	// a zero-count vocabulary value renders as a visible hole (muted since i14, field c30)
	if !strings.Contains(html, `class="facet-count fb-zero" data-target="f-phase-misuse">misuse (0)<`) {
		return false
	}
	// the buttons carry the filter hooks the register rows answer to
	if !strings.Contains(html, `data-target="f-phase-operation"`) {
		return false
	}
	block := "filters: 'type == \"requirement\"'\nviews:\n  - type: table\n    order: [file.name]\n"
	rs, err := EvalBase(block, []string{filepath.Join(dir, "req-op.md")}, nil)
	if err != nil || len(rs) == 0 || len(rs[0].Groups) == 0 || len(rs[0].Groups[0].Rows) == 0 {
		return false
	}
	hooked := false
	for _, fc := range rs[0].Groups[0].Rows[0].Facets {
		if fc == "f-phase-operation" {
			hooked = true
		}
	}
	if !hooked {
		return false
	}
	// a facet value outside the vocabulary refuses
	nodes["req-bad"] = mkReq("req-bad", "phase: [teleportation]")
	bad := facetFindings(nodes)
	if len(bad) != 1 || !strings.Contains(bad[0], "teleportation") {
		return false
	}
	delete(nodes, "req-bad")
	return len(facetFindings(nodes)) == 0
}

// selftestExternalLinks — test-external-links: an http link in a spec note flags;
// the same link inside a reference note passes.
func selftestExternalLinks() bool {
	root, _ := os.MkdirTemp("", "qst-ext")
	defer os.RemoveAll(root)
	os.MkdirAll(filepath.Join(root, "references"), 0o755)
	os.WriteFile(filepath.Join(root, "references", "ref-ok.md"),
		[]byte("---\ntitle: OK\nurl: https://example.org/ok\nkind: informative\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "req-linky.md"),
		[]byte("---\nid: req-linky\ntype: requirement\nstatement: s\n---\nSee https://example.org/raw for details.\n"), 0o644)
	ext, _, _ := specLintFindingsAt(root, nil)
	if len(ext) != 1 || !strings.Contains(ext[0], "req-linky") {
		return false
	}
	// evidence docs (no node fence) stay exempt
	os.WriteFile(filepath.Join(root, "M6-evidence.md"),
		[]byte("# evidence\n\nhistory cites https://example.org/old freely.\n"), 0o644)
	ext2, _, _ := specLintFindingsAt(root, nil)
	return len(ext2) == 1
}

// selftestResidueLint — test-residue-lint: an unfilled slot placeholder flags;
// a fill comment alone does not.
func selftestResidueLint() bool {
	root, _ := os.MkdirTemp("", "qst-res")
	defer os.RemoveAll(root)
	os.WriteFile(filepath.Join(root, "man-draft.md"),
		[]byte("---\nid: man-draft\ntype: manifest\nmode: chapter\nstatement: s\n---\n<!-- fill [mandatory]\nContents: the goal.\n-->\n<!-- ai:3 -->\n{{where-we-want-to-be}}\n"), 0o644)
	_, res, _ := specLintFindingsAt(root, nil)
	if len(res) != 1 || !strings.Contains(res[0], "{{where-we-want-to-be}}") {
		return false
	}
	// the slot filled, the fill comment STAYS - no residue
	os.WriteFile(filepath.Join(root, "man-draft.md"),
		[]byte("---\nid: man-draft\ntype: manifest\nmode: chapter\nstatement: s\n---\n<!-- fill [mandatory]\nContents: the goal.\n-->\n<!-- ai:3 -->\nThe drafted prose.\n"), 0o644)
	_, res2, _ := specLintFindingsAt(root, nil)
	return len(res2) == 0
}

// selftestAnchorRefers — test-anchor-refers: a refer to an existing heading anchor
// passes; the same refer after the heading is renamed flags a dangling referent.
func selftestAnchorRefers() bool {
	root, _ := os.MkdirTemp("", "qst-anch")
	defer os.RemoveAll(root)
	manPath := filepath.Join(root, "man-ch1.md")
	os.WriteFile(manPath,
		[]byte("---\nid: man-ch1\ntype: manifest\nmode: chapter\nstatement: s\n---\n## Where we want to be\n<!-- ai:3 -->\nprose.\n"), 0o644)
	whyPath := filepath.Join(root, "why-goal.md")
	os.WriteFile(whyPath,
		[]byte("---\nid: why-goal\ntype: rationale\nrefers: [man-ch1#where-we-want-to-be]\nstatement: why the goal leads.\n---\nThe deep why.\n"), 0o644)
	nodes := map[string]Node{
		"man-ch1":  ParseNode(manPath),
		"why-goal": ParseNode(whyPath),
	}
	if _, _, anchors := specLintFindingsAt(root, nodes); len(anchors) != 0 {
		return false
	}
	// rename the heading - the refer dangles
	os.WriteFile(manPath,
		[]byte("---\nid: man-ch1\ntype: manifest\nmode: chapter\nstatement: s\n---\n## Where we are\n<!-- ai:3 -->\nprose.\n"), 0o644)
	_, _, anchors := specLintFindingsAt(root, nodes)
	if len(anchors) != 1 || !strings.Contains(anchors[0], "where-we-want-to-be") {
		return false
	}
	// a refer to a missing node also flags
	nodes["why-lost"] = Node{ID: "why-lost", Type: "rationale", Refers: []string{"man-gone#x"}}
	_, _, anchors2 := specLintFindingsAt(root, nodes)
	return len(anchors2) == 2
}

// selftestQuarantineScope — test-quarantine-scope: a meta-class term in the rationales
// chapter flags; the same term in the guidance chapter and the agent guide passes.
func selftestQuarantineScope() bool {
	dir, _ := os.MkdirTemp("", "qst-quar")
	defer os.RemoveAll(dir)
	gloss := map[string]GlossTerm{
		"harness": {Slug: "harness", Term: "harness", Class: "meta"},
	}
	mk := func(id, mode string) Node {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: manifest\nmode: "+mode+"\nstatement: s\n---\n<!-- ai:3 -->\nThe harness drives the loop.\n"), 0o644)
		return Node{ID: id, Type: "manifest", Mode: mode, Statement: "s", Path: p}
	}
	nodes := map[string]Node{
		"man-ch7-rationales": mk("man-ch7-rationales", "chapter"),
		"man-ch8-guidance":   mk("man-ch8-guidance", "guidance"),
		"man-agent-guide":    mk("man-agent-guide", "agent"),
	}
	got := metaQuarantineFindings(nodes, gloss)
	if len(got) != 1 || !strings.Contains(got[0], "man-ch7-rationales") {
		return false
	}
	// a guidance-mode manifest still renders as a chapter
	dir2, _ := os.MkdirTemp("", "qst-quar2")
	defer os.RemoveAll(dir2)
	fx := bookFixture(dir2, 1, true)
	gp := filepath.Join(dir2, "man-guide.md")
	os.WriteFile(gp, []byte("---\nid: man-guide\ntype: manifest\nmode: guidance\nstatement: Guidance.\n---\n<!-- ai:3 -->\nHow this document is made.\n"), 0o644)
	fx["man-guide"] = Node{ID: "man-guide", Type: "manifest", Mode: "guidance", Statement: "Guidance.", Path: gp}
	html, findings, _ := renderBookHTML(fx)
	return len(findings) == 0 && strings.Contains(html, `<article id="man-guide"`)
}

// selftestItemTemplates — test-item-templates: all thirteen item templates exist in the
// templates home and each declares its fields with name, semantics, and value range.
func selftestItemTemplates() bool {
	kinds := []string{"term", "reference", "fundamental", "method", "stakeholder", "requirement",
		"usecase", "candidate", "decision", "test-case", "verification-record", "raid", "rationale"}
	dir := filepath.Join(EngineDir(), "method", "templates", "items")
	fieldRe := regexp.MustCompile("(?m)^- `[a-z_]+` \\(.+\\):")
	for _, k := range kinds {
		raw, err := os.ReadFile(filepath.Join(dir, k+".md"))
		if err != nil {
			return false
		}
		txt := string(raw)
		if !strings.Contains(txt, "## Fields") {
			return false // the Attributierungsschema duty: fields declared
		}
		if len(fieldRe.FindAllString(txt, -1)) < 1 {
			return false // each field: name (value range): semantics
		}
	}
	// the 0..1 scale is declared where scores exist
	for _, k := range []string{"stakeholder", "candidate", "raid"} {
		raw, _ := os.ReadFile(filepath.Join(dir, k+".md"))
		if !strings.Contains(string(raw), "0..1") {
			return false
		}
	}
	return true
}

// selftestSpecTemplateSet — test-spec-template-set: README plus nine chapter manifests
// exist; every authored unit opens with a heading and carries a fill comment, a gating
// tag, a provenance mark, and a slot placeholder.
func selftestSpecTemplateSet() bool {
	dir := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	if _, err := os.Stat(filepath.Join(dir, "README.md")); err != nil {
		return false
	}
	chapters := []string{"man-ch0-orientation", "man-ch1-motivation", "man-ch2-fundamentals",
		"man-ch3-design-input", "man-ch4-design-output", "man-ch5-verification-validation",
		"man-ch6-project", "man-ch7-rationales", "man-ch8-guidance"}
	gateRe := regexp.MustCompile(`\[(mandatory|judgment|type: [^\]]+)\]`)
	for _, ch := range chapters {
		raw, err := os.ReadFile(filepath.Join(dir, ch+".md"))
		if err != nil {
			return false
		}
		body := string(raw)
		if i := strings.Index(body[3:], "---"); i >= 0 {
			body = body[3+i+3:] // past the frontmatter fence
		}
		for _, unit := range regexp.MustCompile(`(?m)^---\s*$`).Split(body, -1) {
			if !strings.Contains(unit, "<!-- fill") {
				continue // ref slots, figs, and query embeds carry no fill comment
			}
			if !strings.Contains(unit, "## ") || !gateRe.MatchString(unit) ||
				!strings.Contains(unit, "<!-- ai:3 -->") || !strings.Contains(unit, "{{") {
				return false
			}
		}
	}
	// the canned queries ship beside the skeletons (pooled centrally - no inline blocks)
	for _, q := range []string{"stakeholder-matrix", "vv-matrix", "needs", "requirements",
		"decisions-architecture", "decisions-project", "decisions-waiver",
		"assumptions", "asr", "raid", "rationales"} {
		if _, err := os.Stat(filepath.Join(dir, "queries", q+".base")); err != nil {
			return false
		}
	}
	// the skeletons reference pooled queries; an authored inline block is the smell the ruling bans
	for _, ch := range chapters {
		raw, _ := os.ReadFile(filepath.Join(dir, ch+".md"))
		if strings.Contains(string(raw), "```base") {
			return false
		}
	}
	// the method-source reference notes ship beside the skeletons
	if _, err := os.Stat(filepath.Join(dir, "references", "ref-tech-dok-grundlagen.md")); err != nil {
		return false
	}
	return true
}

// selftestStubSpec — test-stub-spec: start stubs into a bare workspace emits the nine
// chapter skeletons, the README, and the canned queries; a second run refuses to overwrite.
func selftestStubSpec() bool {
	dir, _ := os.MkdirTemp("", "qst-stub")
	defer os.RemoveAll(dir)
	cmdStartStubs([]string{dir})
	// the spec MIRRORS the template (owner ruling 2026-07-07): top-level files land at
	// the spec ROOT, exactly where the template keeps them; subfolders mirror 1:1.
	for _, f := range []string{
		filepath.Join(dir, "spec", "SPEC-README.md"),
		filepath.Join(dir, "spec", "man-ch0-orientation.md"),
		filepath.Join(dir, "spec", "man-ch8-guidance.md"),
		filepath.Join(dir, "spec", "queries", "vv-matrix.base"),
		filepath.Join(dir, "spec", "references", "ref-tech-dok-grundlagen.md"),
		filepath.Join(dir, "spec", "fundamentals", "README.md"),
	} {
		if _, err := os.Stat(f); err != nil {
			return false
		}
	}
	// a second run keeps existing content - never overwrites
	marker := filepath.Join(dir, "spec", "man-ch1-motivation.md")
	os.WriteFile(marker, []byte("EDITED BY THE PROJECT"), 0o644)
	cmdStartStubs([]string{dir})
	raw, _ := os.ReadFile(marker)
	return string(raw) == "EDITED BY THE PROJECT"
}
