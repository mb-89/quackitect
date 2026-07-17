package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// i12Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices). book-manifests and
// book-orphan-lint are implemented in book.go; the battery order keeps
// their slots here.
var i12Tests = []namedTest{
	{"authoring-cheap", selftestAuthoringCheap},
	{"ai-drafting", selftestAiDrafting},
	{"guidance-split", selftestGuidanceSplit},
	{"method-map", selftestMethodMap},
	{"template-system", selftestTemplateSystem},
	{"evidence-templates", selftestEvidenceTemplates},
	{"mint-skeleton", selftestMintSkeleton},
	{"type-stakeholders", selftestTypeStakeholders},
	{"book-manifests", selftestBookManifests},
	{"book-orphan-lint", selftestBookOrphans},
	{"book-single-file", selftestBookSingleFile},
	{"book-depth", selftestBookDepth},
	{"book-dom-static", selftestBookDomStatic},
	{"chapter-tldr", selftestChapterTldr},
	{"book-identity", selftestBookIdentity},
	{"llm-digestible", selftestLlmDigestible},
	{"book-figures", selftestBookFigures},
	{"glossary-shared", selftestGlossaryShared},
	{"meta-quarantine", selftestMetaQuarantine},
	{"book-honesty", selftestBookHonesty},
	{"provenance-icons", selftestProvenanceIcons},
	{"agents-emit", selftestAgentsEmit},
	{"book-drift", selftestBookDrift},
	{"register-advisory", selftestRegisterAdvisory},
	{"book-a11y", selftestBookA11y},
	{"deck-mode", selftestDeckMode},
}

// i0012 spec-book test hooks.

// design: go-ai-marks  implements: req-ai-provenance.1, req-lint-classification.1
// This is the mechanical half of the drafting rule: the mark syntax (`<!-- ai:N -->`, N 0..3, own line above the paragraph) and the refusal predicate. A prose unit without a mark has NO path into the book. ai:0 is explicit pure-human, so "unmarked" never means anything.
var aiMarkRe = regexp.MustCompile(`^\s*<!--\s*ai:([0-3])\s*-->\s*$`)

// parseAIMark returns the involvement value of a mark line, or -1 when the line is no mark.
func parseAIMark(line string) int {
	m := aiMarkRe.FindStringSubmatch(line)
	if m == nil {
		return -1
	}
	return int(m[1][0] - '0')
}

// fillCommentRe matches one whole HTML comment span, across lines.
var fillCommentRe = regexp.MustCompile(`(?s)<!--.*?-->`)

// stripFillComments removes every comment that is not an AI mark — the templates' PERMANENT
// fill guidance ('the comment stays in the source and never renders'). Marks stay: they are
// the involvement record, consumed line-wise by the predicate and the renderer.
func stripFillComments(s string) string {
	return fillCommentRe.ReplaceAllStringFunc(s, func(m string) string {
		if aiMarkRe.MatchString(m) {
			return m
		}
		return ""
	})
}

// proseUnitsMarked verifies every prose paragraph in a markdown body carries a mark line.
// A paragraph is a blank-line-delimited block that is not itself a mark, heading, or fence.
// Fill comments are canon, never prose: the predicate reads the comment-stripped body — the
// SAME referent the renderer emits, so 'accepted' and 'rendered' can never diverge.
func proseUnitsMarked(body string) bool {
	body = stripFillComments(body)
	marked := false
	inFence := false
	for _, line := range strings.Split(strings.ReplaceAll(body, "\r\n", "\n"), "\n") {
		t := strings.TrimSpace(line)
		if strings.HasPrefix(t, "```") {
			inFence = !inFence
			continue
		}
		if inFence {
			continue // fenced content (code, base queries) is never prose
		}
		if t == "" {
			marked = false
			continue
		}
		if parseAIMark(line) >= 0 {
			marked = true
			continue
		}
		if strings.HasPrefix(t, "#") || strings.HasPrefix(t, "<") {
			continue // headings and markup are not prose units
		}
		if baseEmbedRe.MatchString(t) && strings.TrimSpace(baseEmbedRe.ReplaceAllString(t, "")) == "" {
			continue // a pooled-query embed renders as a derived table, never prose
		}
		if t == "|||" || figRefRe.MatchString(t) {
			continue // deck column markers and figure references render derived content, never prose
		}
		if !marked {
			return false // a prose paragraph with no mark above it
		}
	}
	return true
}

// enddesign

// test-ai-drafting -> selftest:ai-drafting
func selftestAiDrafting() bool {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "prompts", "draft.md"))
	if err != nil {
		return false
	}
	p := strings.ToLower(string(raw))
	for _, want := range []string{"context", "glossary", "audience", "voice", "ai:3", "ai:0", "surface", "core", "lean higher", "refused"} {
		if !strings.Contains(p, want) {
			return false // the prompt must mandate the injection rules and the mark law
		}
	}
	if parseAIMark("<!-- ai:3 -->") != 3 || parseAIMark("<!-- ai:0 -->") != 0 || parseAIMark("plain text") != -1 || parseAIMark("<!-- ai:4 -->") != -1 {
		return false
	}
	if !proseUnitsMarked("<!-- ai:3 -->\nA drafted paragraph.\n\n<!-- ai:0 -->\nA human one.\n") {
		return false
	}
	if proseUnitsMarked("An unmarked paragraph sneaking in.\n") {
		return false // no unmarked path
	}
	// the template's PERMANENT fill comment (multi-line) is canon, never prose: the predicate
	// accepts it and the renderer drops it ('the comment stays in the source and never renders').
	fill := "## A heading\n<!-- fill [mandatory]\nContents: guidance the template keeps in the source.\nForm: FILLPROBE never renders.\n-->\n<!-- ai:3 -->\nA filled paragraph.\n"
	if !proseUnitsMarked(fill) {
		return false // a fill comment interior is not unmarked prose
	}
	rendered := mdLite(fill)
	if strings.Contains(rendered, "FILLPROBE") || !strings.Contains(rendered, "A filled paragraph.") {
		return false // the comment never renders; the marked prose does
	}
	if proseUnitsMarked("<!-- fill [mandatory]\nGuidance.\n-->\nAn unmarked paragraph after a fill.\n") {
		return false // stripping the comment must not launder genuinely unmarked prose
	}
	return true
}

// design: go-guidance-split  implements: req-reader-structure.2
// Audience prose stays apart from internals. Internals live as guidance docs (method/guidance/<slug>.md). A content node points at its internals through the `guidance:` frontmatter tag. The tag must RESOLVE, since a dangling guidance pointer is a failure. The book renders guidance only in the agent-guide chapter, the emitter's quarantine, guarded by meta-quarantine.
func guidanceDocPath(slug string) string {
	return filepath.Join(EngineDir(), "method", "guidance", slug+".md")
}

// enddesign

// design: go-type-stakeholders  implements: req-derived-boards.4
// Stakeholder classes are one-note-per-class (project_types/classes/). Each project TYPE links the classes it adds, markdown links, the lower bound. The project's class set derives as default's set plus the union over its ITERATIONS' types. It is never a stored flag, so a doc-only iteration cannot flip the project. cyber_physical links both parent sets: union by links, no duplication.
var classLinkRe = regexp.MustCompile(`\]\(([^)]*classes/([a-z0-9-]+)\.md)\)`)

func typeFilePath(t string) string {
	base := filepath.Join(EngineDir(), "project_types")
	found := ""
	filepath.Walk(base, func(p string, fi os.FileInfo, err error) error {
		if err == nil && fi.IsDir() && filepath.Base(p) == t {
			if _, e := os.Stat(filepath.Join(p, "type.md")); e == nil {
				found = filepath.Join(p, "type.md")
			}
		}
		return nil
	})
	return found
}

// typeClassSlugs returns the class slugs a type's file links; a link that does not resolve is dropped.
func typeClassSlugs(t string) []string {
	tf := typeFilePath(t)
	if tf == "" {
		return nil
	}
	raw, err := os.ReadFile(tf)
	if err != nil {
		return nil
	}
	var out []string
	for _, m := range classLinkRe.FindAllStringSubmatch(string(raw), -1) {
		if _, err := os.Stat(filepath.Join(EngineDir(), "project_types", "classes", m[2]+".md")); err == nil {
			out = append(out, m[2])
		}
	}
	return out
}

// deriveClassSet unions default's classes with every named type's linked classes.
func deriveClassSet(types []string) map[string]bool {
	set := map[string]bool{}
	for _, t := range append([]string{"default"}, types...) {
		for _, c := range typeClassSlugs(t) {
			set[c] = true
		}
	}
	return set
}

// projectClasses derives the whole project's class set: the union over its iterations' types.
func projectClasses() map[string]bool {
	var types []string
	typeRe := regexp.MustCompile(`(?m)^type:\s*(\S+)`)
	iters, _ := os.ReadDir(filepath.Join(SPEC, "iterations"))
	for _, it := range iters {
		raw, err := os.ReadFile(filepath.Join(SPEC, "iterations", it.Name(), "iteration.md"))
		if err != nil {
			continue
		}
		if m := typeRe.FindStringSubmatch(string(raw)); m != nil {
			types = append(types, m[1])
		}
	}
	return deriveClassSet(types)
}

// enddesign

// bookFixture builds a temp chapter manifest + one referenced requirement for the emitter tests.
// depth is the declared transclusion depth of the ref unit; lede toggles the opening inline unit.
func bookFixture(dir string, depth int, lede bool) map[string]Node {
	reqBody := "---\nid: req-fix\ntype: requirement\nstatement: The fixture shall be rendered.\n---\n## Rationale (not load-bearing)\nRATIONALEPROBE lives in the informative layer.\n"
	reqPath := filepath.Join(dir, "req-fix.md")
	os.WriteFile(reqPath, []byte(reqBody), 0o644)
	man := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n"
	if lede {
		man += "<!-- ai:3 -->\nThe lede: what this chapter says and why.\n---\n"
	}
	man += "[req-fix](req-fix.md)"
	if depth > 0 {
		man += " depth:" + string(rune('0'+depth))
	}
	man += "\n"
	manPath := filepath.Join(dir, "man-fix.md")
	os.WriteFile(manPath, []byte(man), 0o644)
	return map[string]Node{
		"req-fix":  {ID: "req-fix", Type: "requirement", Statement: "The fixture shall be rendered.", Class: "review", Path: reqPath},
		"test-fix": {ID: "test-fix", Type: "test", Class: "review", Verifies: []string{"req-fix"}, Path: reqPath},
		"man-fix":  {ID: "man-fix", Type: "manifest", Mode: "chapter", Statement: "Fixture chapter.", Path: manPath},
	}
}

// test-book-single-file -> selftest:book-single-file
func selftestBookSingleFile() bool {
	dir, err := os.MkdirTemp("", "qb1")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	html, findings, _ := renderBookHTML(bookFixture(dir, 2, true))
	if len(findings) != 0 {
		return false
	}
	for _, external := range []string{"http://", "https://", "src=", "@import"} {
		if strings.Contains(html, external) {
			return false // one self-contained file, no external requests
		}
	}
	return strings.Contains(html, "<!doctype html>")
}

// test-book-depth -> selftest:book-depth
func selftestBookDepth() bool {
	dir, err := os.MkdirTemp("", "qb2")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	h1, _, _ := renderBookHTML(bookFixture(dir, 1, true))
	if strings.Contains(h1, "RATIONALEPROBE") {
		return false // depth 1 = statements only
	}
	// children link as the termref affordance (data-goto), never bare anchors
	h3, _, _ := renderBookHTML(bookFixture(dir, 3, true))
	if !strings.Contains(h3, "RATIONALEPROBE") || !strings.Contains(h3, `data-goto="test-fix"`) {
		return false // depth 3 adds rationale and children
	}
	return !nodeKeysAllow["depth"] // an authored depth tag stays structurally refused
}

// test-book-dom-static -> selftest:book-dom-static
func selftestBookDomStatic() bool {
	dir, err := os.MkdirTemp("", "qb3")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	html, _, _ := renderBookHTML(bookFixture(dir, 4, true))
	if !strings.Contains(html, "The fixture shall be rendered.") || !strings.Contains(html, "RATIONALEPROBE") {
		return false // every layer is real text in the source
	}
	si := strings.Index(html, "<script>")
	se := strings.Index(html, "</script>")
	if si < 0 || se < si {
		return false
	}
	script := html[si:se]
	// the one innerHTML exemption is the details-pane CHROME fill (window.bookDetail;
	// the pane is chrome, not book content - req-details-context.1).
	return !strings.Contains(script, "createElement") &&
		strings.Count(script, "innerHTML") == 1 && strings.Contains(script, "c.innerHTML")
}

// test-chapter-tldr -> selftest:chapter-tldr
func selftestChapterTldr() bool {
	dir, err := os.MkdirTemp("", "qb4")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	_, bad, _ := renderBookHTML(bookFixture(dir, 1, false))
	if len(bad) == 0 || !strings.Contains(bad[0], "man-fix") {
		return false // a chapter without its lede is flagged by name
	}
	html, good, _ := renderBookHTML(bookFixture(dir, 1, true))
	if len(good) != 0 {
		return false
	}
	ledeAt := strings.Index(html, `data-layer="lede"`)
	sectAt := strings.Index(html, "data-node=")
	return ledeAt > 0 && sectAt > ledeAt // the lede opens the chapter, before any section
}

// test-book-identity -> selftest:book-identity
func selftestBookIdentity() bool {
	dir, err := os.MkdirTemp("", "qb5")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	html, _, _ := renderBookHTML(fx)
	cfg := readProjectConfig()
	// the identity stamp is the WORKSPACE root since i24 (go-root-content): the node
	// merkle plus the content pairs - the same root parity and golden enforce
	return strings.Contains(html, workspaceRoot(fx)) && strings.Contains(html, cfg.Version) && strings.Contains(html, version)
}

// test-llm-digestible -> selftest:llm-digestible
func selftestLlmDigestible() bool {
	dir, err := os.MkdirTemp("", "qb6")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	html, _, _ := renderBookHTML(bookFixture(dir, 2, true))
	html = regexp.MustCompile(`(?s)<script>.*?</script>`).ReplaceAllString(html, "")
	text := regexp.MustCompile(`<[^>]+>`).ReplaceAllString(html, " ")
	// no reader's-contract line: the book has no page header
	for _, want := range []string{"The fixture shall be rendered.", "req-fix", "requirement", "RATIONALEPROBE"} {
		if !strings.Contains(text, want) {
			return false // statements, trust metadata, and layer labels survive extraction
		}
	}
	return true
}

// test-book-figures -> selftest:book-figures
func selftestBookFigures() bool {
	dir, err := os.MkdirTemp("", "qbf")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	man := "---\nid: man-fig\ntype: manifest\nmode: chapter\nstatement: Figures.\n---\n<!-- ai:3 -->\nThe lede for the figure chapter.\n---\nfig: timeline\n---\nfig: context-star\n"
	mp := filepath.Join(dir, "man-fig.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-fig"] = Node{ID: "man-fig", Type: "manifest", Mode: "chapter", Statement: "Figures.", Path: mp}
	// the star derives from neighbour notes (req-interactive-figures.3) - seed one
	np := filepath.Join(dir, "nbr-probe.md")
	os.WriteFile(np, []byte("---\nid: nbr-probe\ntype: neighbour\nstatement: the probe neighbour.\nclass: review\nkiller: false\n---\n"), 0o644)
	fx["nbr-probe"] = Node{ID: "nbr-probe", Type: "neighbour", Statement: "the probe neighbour.", Class: "review", Path: np}
	html, findings, _ := renderBookHTML(fx)
	if len(findings) != 0 {
		return false
	}
	if !strings.Contains(html, `aria-label="timeline"`) || !strings.Contains(html, `aria-label="context diagram"`) {
		return false // derived figures render inline
	}
	if strings.Contains(html, "src=") {
		return false // no external asset request
	}
	text := regexp.MustCompile(`<[^>]+>`).ReplaceAllString(html, " ")
	if !strings.Contains(text, "i0012_spec_book") {
		return false // the figure's text content survives plain-text extraction
	}
	// stakeholder-matrix and vv-table retired to canned base queries (req-derived-boards.2, selftest:fig-tables)
	return strings.Contains(renderFigure("no-such-kind", fx), "unknown figure kind")
}

// glossFixture writes a temp glossary (one meta, one domain term) and points the reader at it.
func glossFixture(dir string) func() {
	g := filepath.Join(dir, "glossary")
	os.MkdirAll(g, 0o755)
	os.WriteFile(filepath.Join(g, "widget.md"), []byte("---\nterm: widget\nlong: the fixture widget\nclass: domain\n---\n<!-- ai:3 -->\nA thing the fixture system handles.\n"), 0o644)
	os.WriteFile(filepath.Join(g, "tokenprobe.md"), []byte("---\nterm: tokenprobe\nlong: the probe token\nclass: meta\n---\n<!-- ai:3 -->\nA process concept that belongs in the agent guide.\n"), 0o644)
	old := glossaryDirOverride
	glossaryDirOverride = g
	return func() { glossaryDirOverride = old }
}

// test-glossary-shared -> selftest:glossary-shared
func selftestGlossaryShared() bool {
	dir, err := os.MkdirTemp("", "qgs")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	restore := glossFixture(dir)
	defer restore()
	fx := bookFixture(dir, 1, true)
	man := "---\nid: man-terms\ntype: manifest\nmode: chapter\nstatement: Terms.\n---\n<!-- ai:3 -->\nThe lede about a [widget](term:widget). Then a second [widget](term:widget) mention.\n"
	mp := filepath.Join(dir, "man-terms.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-terms"] = Node{ID: "man-terms", Type: "manifest", Mode: "chapter", Statement: "Terms.", Path: mp}
	html, findings, _ := renderBookHTML(fx)
	if len(findings) != 0 {
		return false
	}
	// the term affordance: a linked use renders as a termref button carrying the
	// definition for the details pane (never a first-use long-form expansion)
	if !strings.Contains(html, `class="termref"`) || !strings.Contains(html, `data-help="the fixture widget"`) {
		return false
	}
	if !strings.Contains(html, `id="term-widget"`) || strings.Contains(html, `id="term-tokenprobe"`) {
		return false // the glossary section carries USED terms only
	}
	if !strings.Contains(html, `href="#man-terms"`) {
		return false // back-references to the using chapter
	}
	// the LINT reads the same source: reclassify widget to meta -> the same chapter now flags.
	g := filepath.Join(dir, "glossary", "widget.md")
	raw, _ := os.ReadFile(g)
	os.WriteFile(g, []byte(strings.Replace(string(raw), "class: domain", "class: meta", 1)), 0o644)
	if len(metaQuarantineFindings(fx, readGlossary())) == 0 {
		return false // one classification change moves lint and book alike
	}
	// a link to a missing term is an ERROR finding.
	os.WriteFile(mp, []byte("---\nid: man-terms\ntype: manifest\nmode: chapter\nstatement: Terms.\n---\n<!-- ai:3 -->\nLede with a [ghost](term:no-such-term).\n"), 0o644)
	_, bad, _ := renderBookHTML(fx)
	return len(bad) == 1 && strings.Contains(bad[0], "no-such-term")
}

// test-meta-quarantine -> selftest:meta-quarantine
func selftestMetaQuarantine() bool {
	dir, err := os.MkdirTemp("", "qmq")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	restore := glossFixture(dir)
	defer restore()
	ch := filepath.Join(dir, "man-ch2.md")
	os.WriteFile(ch, []byte("---\nid: man-ch2\ntype: manifest\nmode: chapter\nstatement: Ch2.\n---\n<!-- ai:3 -->\nThis chapter speaks about a tokenprobe - meta vocabulary in reader content.\n"), 0o644)
	ag := filepath.Join(dir, "man-agent.md")
	os.WriteFile(ag, []byte("---\nid: man-agent\ntype: manifest\nmode: agent\nstatement: Agent guide.\n---\n<!-- ai:3 -->\nThe tokenprobe belongs here, in the agent guide.\n"), 0o644)
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "t.md")
	syn := map[string]Node{
		"man-ch2":   {ID: "man-ch2", Type: "manifest", Mode: "chapter", Path: ch},
		"man-agent": {ID: "man-agent", Type: "manifest", Mode: "agent", Path: ag},
		"req-x":     {ID: "req-x", Type: "requirement", Path: iterPath},
	}
	found := metaQuarantineFindings(syn, readGlossary())
	if len(found) != 1 || !strings.Contains(found[0], "man-ch2") {
		return false // flagged in the reader chapter, exempt in the agent guide
	}
	return true
}

// test-book-honesty -> selftest:book-honesty
func selftestBookHonesty() bool {
	dir, err := os.MkdirTemp("", "qbh")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	smDone := map[string]string{"req-fix": "DONE"}
	smSus := map[string]string{"req-fix": "SUSPECT"}
	bl := map[string]Event{"req-fix": {Check: "req-fix", Action: "bless", Actor: "user", Hash: "abcdef123456"}}
	done := renderNodeAtDepth("req-fix", 4, fx, smDone, bl, "a1")
	if !strings.Contains(done, "verified") || strings.Contains(done, "suspect") {
		return false // a DONE node renders unmarked, with its verdict metadata
	}
	if !strings.Contains(done, "blessed · user · abcdef12") {
		return false // depth 4 carries the evidence layer
	}
	sus := renderNodeAtDepth("req-fix", 1, fx, smSus, bl, "a2")
	if !strings.Contains(sus, "suspect — changed since its last verification") || !strings.Contains(sus, `data-state="suspect"`) {
		return false // a SUSPECT node is visibly marked, in text a reader and an extractor both see
	}
	return true
}

// test-provenance-icons -> selftest:provenance-icons
func selftestProvenanceIcons() bool {
	// no per-paragraph icon columns: the paragraph keeps its
	// data-ai RECORD; the visible column renders once per unit via unitAIColumn.
	three := mdLite("<!-- ai:3 -->\nA fully drafted paragraph.\n")
	if strings.Contains(three, "ai-marks") || !strings.Contains(three, `data-ai="3"`) {
		return false // the record stays, the inline column is gone
	}
	col := unitAIColumn(three)
	if strings.Count(col, `aria-label="AI mark"`) != 3 || !strings.Contains(col, "AI involvement: 3 of 3") {
		return false // the unit column carries the max with its machine-readable label
	}
	one := mdLite("<!-- ai:1 -->\nA reduced paragraph.\n")
	if strings.Count(unitAIColumn(one), `aria-label="AI mark"`) != 1 {
		return false // a user-reduced value renders reduced
	}
	zero := mdLite("<!-- ai:0 -->\nThe user's own words.\n")
	if unitAIColumn(zero) != "" || !strings.Contains(zero, `data-ai="0"`) {
		return false // explicit pure-human renders no marks and keeps the record
	}
	if strings.Count(aiMarkColumn(7), `aria-label="AI mark"`) > 3 {
		return false // never more marks than the ladder allows
	}
	return true
}

// test-agents-emit -> selftest:agents-emit
// The book renders its agent-guide chapter FROM a manifest source. The repo-root AGENTS.md is
// HAND-AUTHORED and embedded verbatim, never generated (adr-agents-hand-authored) - so this
// verifies the render path, not a file emission.
func selftestAgentsEmit() bool {
	dir, err := os.MkdirTemp("", "qae")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	man := "---\nid: man-agent-guide\ntype: manifest\nmode: agent\nstatement: The agent guide.\n---\n<!-- ai:0 -->\nAGENTPROBE. The ritual: READ the contract, RECITE it, HONOR it.\n"
	mp := filepath.Join(dir, "man-agent-guide.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-agent-guide"] = Node{ID: "man-agent-guide", Type: "manifest", Mode: "agent", Statement: "The agent guide.", Path: mp}
	html, _, _ := renderBookHTML(fx)
	if !strings.Contains(html, `id="man-agent-guide"`) || !strings.Contains(html, "AGENTPROBE") {
		return false // the agent-guide chapter renders from its manifest source
	}
	return true
}

// test-book-drift -> selftest:book-drift
func selftestBookDrift() bool {
	dir, err := os.MkdirTemp("", "qbd")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 2, true)
	// TWO presets over one chapter: unsorted preset classes flip order between renders
	// (map iteration); determinism must not depend
	// on how many presets reference a chapter.
	for _, p := range []string{"man-preset-pa", "man-preset-pb"} {
		pp := filepath.Join(dir, p+".md")
		os.WriteFile(pp, []byte("---\nid: "+p+"\ntype: manifest\nmode: preset\nstatement: P.\n---\n[man-fix](man-fix.md)\n"), 0o644)
		fx[p] = Node{ID: p, Type: "manifest", Mode: "preset", Statement: "P.", Path: pp}
	}
	h1, _, _ := renderBookHTML(fx)
	for i := 0; i < 8; i++ { // map order varies per run - eight renders make a flip loud
		h2, _, _ := renderBookHTML(fx)
		if h1 != h2 {
			return false // regeneration over an unchanged spec is a byte-identical no-op
		}
	}
	p := filepath.Join(dir, "book.html")
	os.WriteFile(p, []byte(h1), 0o644)
	if bookDriftFindingAt(p, fx) != nil {
		return false // a matching committed book is clean
	}
	os.WriteFile(p, []byte(h1+"<!-- tampered -->"), 0o644)
	if len(bookDriftFindingAt(p, fx)) != 1 {
		return false // a drifted committed book is flagged
	}
	return bookDriftFindingAt(filepath.Join(dir, "no-such.html"), fx) == nil // absent = disarmed
}

// test-register-advisory -> selftest:register-advisory
func selftestRegisterAdvisory() bool {
	// the parse layer names the offending unit per finding, deterministically sorted.
	canned := "guidance/hashing.md:5:10:Vale.Spelling:Did you really mean 'merkle'?\nglossary/gate.md:3:1:Vale.Terms:Use 'user'.\n"
	adv := parseValeLines(canned)
	if len(adv) != 2 {
		return false
	}
	if !strings.Contains(adv[0], "glossary/gate.md:3") || !strings.Contains(adv[1], "guidance/hashing.md:5") {
		return false // each advisory names file and position
	}
	// advisory by construction: parse output feeds the advisory channel only - nothing here can
	// reach a fatal exit set (cmdBook exits on findings, never on advisories; cmdLint never calls it).
	if parseValeLines("") != nil {
		return false
	}
	// the pull is pinned and per-OS; the config is deterministic.
	if !strings.Contains(valeURL(), valeVersion) {
		return false
	}
	cfg := valeConfig()
	raw, err := os.ReadFile(cfg)
	if err != nil || !strings.Contains(string(raw), "MinAlertLevel = suggestion") {
		return false
	}
	return true
}

// test-book-a11y -> selftest:book-a11y
func selftestBookA11y() bool {
	dir, err := os.MkdirTemp("", "qba")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 2, true)
	pp := filepath.Join(dir, "man-preset-x.md")
	os.WriteFile(pp, []byte("---\nid: man-preset-x\ntype: manifest\nmode: preset\nstatement: X.\n---\n[man-fix](man-fix.md)\n"), 0o644)
	fx["man-preset-x"] = Node{ID: "man-preset-x", Type: "manifest", Mode: "preset", Statement: "X.", Path: pp}
	html, _, _ := renderBookHTML(fx)
	// no header landmark (the book has no page header); nav+main carry the structure
	for _, want := range []string{"<main", `aria-label="views"`, "<h1>", "<summary>"} {
		if !strings.Contains(html, want) {
			return false // landmarks and heading structure
		}
	}
	if regexp.MustCompile(`<div[^>]*onclick`).MatchString(html) {
		return false // never a click-only div
	}
	if !strings.Contains(html, "<button") || !strings.Contains(html, "<input") {
		return false // controls are native focusable elements
	}
	// contrast recomputed from the single color source: text at 4.5, graphics at 3.
	for _, txt := range []string{"text", "meta", "suspect"} {
		if contrastRatio(bookColors[txt], bookColors["bg"]) < 4.5 {
			return false
		}
	}
	return contrastRatio(bookColors["robot"], bookColors["bg"]) >= 3.0
}

// test-deck-mode -> selftest:deck-mode
func selftestDeckMode() bool {
	dir, err := os.MkdirTemp("", "qdk")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	man := "---\nid: man-deck-fix\ntype: manifest\nmode: deck\nstatement: Fixture deck.\n---\n<!-- ai:3 -->\n# Title slide\nNote: opening words\n---\n[req-fix](req-fix.md)\nNote: the requirement slide\n---\nfig: timeline\n"
	mp := filepath.Join(dir, "man-deck-fix.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-deck-fix"] = Node{ID: "man-deck-fix", Type: "manifest", Mode: "deck", Statement: "Fixture deck.", Path: mp}
	html, findings, _ := renderBookHTML(fx)
	if len(findings) != 0 {
		return false
	}
	if strings.Count(html, `class="slide"`) != 3 {
		return false // one unit, one slide
	}
	// the deck-list present buttons are NOT in the details pane
	// (q-views-placement open) - the present-mode machinery itself stays baked in.
	if !strings.Contains(html, "data-present") || !strings.Contains(html, "ArrowRight") {
		return false // the present mode lives in the SAME html, keyboard-driven
	}
	if !strings.Contains(html, `id="slide-pos"`) {
		return false // the visible slide number (current/total) rides present mode
	}
	if !strings.Contains(html, `<aside class="notes">opening words</aside>`) {
		return false // speaker notes carry the informative layer
	}
	if !strings.Contains(html, "@media print") || !strings.Contains(html, "page-break-after") {
		return false // the print handout path
	}
	return true
}

// test-type-stakeholders -> selftest:type-stakeholders
func selftestTypeStakeholders() bool {
	cl := filepath.Join(EngineDir(), "project_types", "classes")
	ents, err := os.ReadDir(cl)
	if err != nil || len(ents) < 15 {
		return false // one note per class, the full population
	}
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || e.Name() == "README.md" {
			continue // README documents the dir (role classes, not a project type - i0020)
		}
		raw, err := os.ReadFile(filepath.Join(cl, e.Name()))
		if err != nil || !strings.Contains(string(raw), "class:") {
			return false
		}
	}
	for _, t := range []string{"default", "software", "manufactured_good", "cyber_physical"} {
		if len(typeClassSlugs(t)) == 0 {
			return false // every type file links only existing class notes
		}
	}
	sw := deriveClassSet([]string{"software"})
	if !sw["integrator"] || !sw["acquirer"] || sw["supplier"] {
		return false // software adds its classes over default and nothing manufactured
	}
	unionAB := deriveClassSet([]string{"software", "manufactured_good"})
	cp := deriveClassSet([]string{"cyber_physical"})
	if len(unionAB) != len(cp) {
		return false // cyber_physical IS the union of both parents, by links
	}
	for c := range unionAB {
		if !cp[c] {
			return false
		}
	}
	return projectClasses()["integrator"] // the dogfood project derives software from its iterations
}

// test-mint-skeleton -> selftest:mint-skeleton
func selftestMintSkeleton() bool {
	dir, err := os.MkdirTemp("", "qms")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p, err := mintEvidence("M3", dir)
	if err != nil {
		return false
	}
	raw, err := os.ReadFile(p)
	if err != nil {
		return false
	}
	s := string(raw)
	if strings.HasPrefix(s, "---") {
		return false // evidence docs are prose - the template frontmatter is stripped
	}
	cfg := readProjectConfig()
	if !strings.Contains(s, cfg.Version) || !strings.Contains(s, iterTag(cfg.Version)+"-m3") {
		return false // placeholders substituted with the active iteration
	}
	if _, err := mintEvidence("M3", dir); err == nil {
		return false // an existing doc is never overwritten
	}
	if _, err := mintEvidence("M9", dir); err == nil {
		return false // only real milestones stamp
	}
	if iterTag("i0012_spec_book") != "i12" || iterTag("i0003_engine_vehicle_go") != "i3" {
		return false
	}
	return true
}

// test-template-system -> selftest:template-system
func selftestTemplateSystem() bool {
	dir := filepath.Join(EngineDir(), "method", "templates")
	ents, err := os.ReadDir(dir)
	if err != nil {
		return false // the ONE templates home exists
	}
	slugs := map[string]bool{}
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || e.Name() == "README.md" {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			return false
		}
		s := string(raw)
		if !strings.Contains(s, "applies_rigor:") || !strings.Contains(s, "applies_type:") {
			return false // metadata is the lower bound - every template carries it
		}
		for _, r := range []string{"systematic", "lean", "vibe"} {
			if strings.Contains(s, r) {
				if _, err := os.Stat(filepath.Join(EngineDir(), "method", "rigor", r)); err != nil {
					return false // a named rigor must exist
				}
			}
		}
		slugs[strings.TrimSuffix(e.Name(), ".md")] = true
	}
	for _, m := range []string{"M1-frame", "M2-inputs", "M3-candidates", "M4-decision", "M5-spike-findings", "M6-build-plan", "M7-validation", "M8-handover"} {
		if !slugs[m] {
			return false // the eight milestone evidence templates are the first population
		}
	}
	return true
}

// test-evidence-templates -> selftest:evidence-templates
func selftestEvidenceTemplates() bool {
	dir := filepath.Join(EngineDir(), "method", "templates")
	for _, m := range []string{"M1-frame", "M2-inputs", "M3-candidates", "M4-decision", "M5-spike-findings", "M6-build-plan", "M7-validation", "M8-handover"} {
		raw, err := os.ReadFile(filepath.Join(dir, m+".md"))
		if err != nil {
			return false
		}
		s := string(raw)
		if !strings.Contains(s, "TL;DR") || !strings.Contains(s, "-> <itag>") {
			return false // fixed section order: the lede first, check-id pointers per section
		}
	}
	m3, _ := os.ReadFile(filepath.Join(dir, "M3-candidates.md"))
	m4, _ := os.ReadFile(filepath.Join(dir, "M4-decision.md"))
	if !strings.Contains(string(m3), "Preferred:") || !strings.Contains(string(m3), "Pro:") {
		return false // the field-tested M3 candidate card
	}
	if !strings.Contains(string(m4), "Because:") || !strings.Contains(string(m4), "Rejected:") || !strings.Contains(string(m4), "Reverse argumentation") {
		return false // the field-tested M4 decision card, reverse run included
	}
	return true
}

// test-method-map -> selftest:method-map
func selftestMethodMap() bool {
	dir := filepath.Join(EngineDir(), "method", "map")
	ents, err := os.ReadDir(dir)
	if err != nil {
		return false
	}
	entries := 0
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || e.Name() == "README.md" {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			return false
		}
		s := string(raw)
		if !strings.Contains(s, "method:") || !strings.Contains(s, "source:") || !strings.Contains(s, "When to use:") {
			return false // every entry carries name, source pointer, and when-to-use
		}
		entries++
	}
	return entries >= 10 // a real catalog, not a stub
}

// test-guidance-split -> selftest:guidance-split
func selftestGuidanceSplit() bool {
	home := filepath.Join(EngineDir(), "method", "guidance")
	ents, err := os.ReadDir(home)
	if err != nil || len(ents) == 0 {
		return false // the guidance home exists and is populated
	}
	nodes := LoadAll()
	tagged := 0
	for _, n := range nodes {
		if n.Guidance == "" {
			continue
		}
		tagged++
		if _, err := os.Stat(guidanceDocPath(n.Guidance)); err != nil {
			return false // a guidance tag must resolve to a real doc
		}
	}
	if tagged == 0 {
		return false // the living example exists - the mechanism is used, not just possible
	}
	if _, err := os.Stat(guidanceDocPath("no-such-guidance")); err == nil {
		return false
	}
	return true
}

// test-authoring-cheap -> selftest:authoring-cheap
func selftestAuthoringCheap() bool {
	dir, err := os.MkdirTemp("", "qac")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldPath, oldMemo := verdictPathOverride, verdictsMemo
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	defer func() { verdictPathOverride, verdictsMemo = oldPath, oldMemo }()
	verdictRecord("__wedge_probe__", "h1", false, 0) // a stale FAIL on disk - the wedge shape
	exe, err := os.Executable()
	if err != nil {
		return false
	}
	root1 := buildRebaseline(exe)
	if len(root1) < 12 {
		return false // the fresh-exe path must yield a real root
	}
	// the re-baseline is surgical (req-build-cheap.2): the store file survives
	// with the green verdicts; the stale FAIL still dies - the wedge stays dead either way.
	if raw0, err := os.ReadFile(verdictPathOverride); err == nil && strings.Contains(string(raw0), "__wedge_probe__") {
		return false // the stale FAIL must die with the re-baseline
	}
	raw, err := os.ReadFile(goldenRootPath())
	if err != nil || strings.TrimSpace(string(raw)) != root1 {
		return false // the golden carries the fresh root
	}
	if buildRebaseline(exe) != root1 {
		return false // idempotent: a second pass changes nothing (no second build needed)
	}
	// the why-delta agrees with the rule: a standalone member never shows as unverified.
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "t.md")
	syn := map[string]Node{"t-solo": {ID: "t-solo", Type: "test", Class: "executed", Verify: "selftest:parity", Suite: "never-cached", Path: iterPath}}
	for _, d := range coverageDelta(syn, "tests-pass", "") {
		if strings.Contains(d, "t-solo") {
			return false
		}
	}
	// verify-green rides the content-free determinism check; the tamper check stays standalone-only.
	nodes := LoadAll()
	return nodes["verify-green"].Verify == "selftest:determinism"
}
