package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// design: go-book-manifests  implements: req-book-manifests, req-book-orphans
// The manifest node type (adr-book-two-stage lineage; one mechanism, settled at design): a manifest
// is trace CONTENT whose body lists UNITS separated by `---` lines. A unit is either a node
// reference (a plain markdown link to a node id, optional `depth:N`) or inline markdown (ledes,
// glue - provenance-marked like all prose). `Note:` lines carry speaker notes (deck mode). The
// book-orphan lint arms once the FIRST manifest exists (fail-safe, the forward-only pattern):
// every book-content node (need, usecase, requirement, adr) must be referenced by SOME manifest -
// an exclude-mode manifest is the explicit exclusion record, referenced-but-not-rendered.
type ManifestUnit struct {
	Ref   string // the referenced node id ("" for an inline unit)
	Depth int    // declared depth 1..4; 0 = the mode's default
	Body  string // inline markdown ("" for a ref unit)
	Notes string // speaker notes, `Note:` lines stripped from Body
}

var unitRefRe = regexp.MustCompile(`^\[([A-Za-z0-9_-]+)\]\([^)]*\)(?:\s+depth:([1-4]))?\s*$`)

// manifestBody returns the content after the frontmatter fence of a manifest file.
func manifestBody(path string) string {
	raw, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	lines := strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n")
	fences := 0
	for i, l := range lines {
		if strings.TrimSpace(l) == "---" {
			fences++
			if fences == 2 {
				return strings.Join(lines[i+1:], "\n")
			}
		}
	}
	return ""
}

// parseManifestUnits splits a manifest body into units on `---` lines and classifies each.
func parseManifestUnits(body string) []ManifestUnit {
	var units []ManifestUnit
	for _, chunk := range regexp.MustCompile(`(?m)^---\s*$`).Split(body, -1) {
		chunk = strings.TrimSpace(chunk)
		if chunk == "" {
			continue
		}
		var notes, content []string
		for _, l := range strings.Split(chunk, "\n") {
			if strings.HasPrefix(strings.TrimSpace(l), "Note:") {
				notes = append(notes, strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(l), "Note:")))
				continue
			}
			content = append(content, l)
		}
		u := ManifestUnit{Notes: strings.Join(notes, "\n")}
		text := strings.TrimSpace(strings.Join(content, "\n"))
		if m := unitRefRe.FindStringSubmatch(text); m != nil {
			u.Ref = m[1]
			if m[2] != "" {
				u.Depth = int(m[2][0] - '0')
			}
		} else {
			u.Body = text
		}
		units = append(units, u)
	}
	return units
}

// bookContent: the node types a reader-facing chapter can carry; each must reach a manifest.
// Tests and designs render through the DERIVED chapters (V&V, realization map) - auto-reachable.
var bookContent = map[string]bool{"need": true, "usecase": true, "requirement": true, "adr": true}

// bookOrphanFindings flags book-content nodes no manifest references. Disarmed with zero manifests.
func bookOrphanFindings(nodes map[string]Node) []string {
	referenced := map[string]bool{}
	manifests := 0
	for _, n := range nodes {
		if n.Type != "manifest" {
			continue
		}
		manifests++
		for _, u := range parseManifestUnits(manifestBody(n.Path)) {
			if u.Ref != "" {
				referenced[u.Ref] = true
			}
		}
	}
	if manifests == 0 {
		return nil // fail-safe: the lint arms with the first manifest, never as a surprise retrofit
	}
	var out []string
	for id, n := range nodes {
		if bookContent[n.Type] && !referenced[id] {
			out = append(out, "node "+id+" reaches no manifest (reference it, or record the exclusion in an exclude-mode manifest)")
		}
	}
	sortStrings(out)
	return out
}

func sortStrings(s []string) {
	for i := 1; i < len(s); i++ {
		for j := i; j > 0 && s[j] < s[j-1]; j-- {
			s[j], s[j-1] = s[j-1], s[j]
		}
	}
}

// enddesign

// design: go-book-emitter  implements: req-book-single-file, req-book-depth, req-book-dom-static, req-chapter-tldr, req-book-identity, req-llm-digestible
// The deterministic emitter core. Truth (nodes + manifests) renders to ONE self-contained HTML:
// every layer is real text in a semantic DOM at emit time (script never creates content); depth
// derives from node anatomy (1 statement, 2 +rationale, 3 +children, 4 +evidence) - never an
// authored tag (the strict allowlist refuses a `depth:` key on nodes); every chapter OPENS with
// its lede (a missing lede is a finding); every unit carries a STABLE ANCHOR (<node>-u<idx>, the
// future comment system's hook); the artifact stamps its source state (merkle root, iteration,
// engine version); each node renders a visible meta line (id, type, ledger state) so trust
// metadata survives plain-text extraction. No timestamps anywhere - same state, same bytes.
func mdLite(md string) string {
	var out strings.Builder
	for _, para := range strings.Split(strings.ReplaceAll(md, "\r\n", "\n"), "\n\n") {
		p := strings.TrimSpace(para)
		if p == "" {
			continue
		}
		ai := -1
		var kept []string
		for _, l := range strings.Split(p, "\n") {
			if v := parseAIMark(l); v >= 0 {
				ai = v
				continue
			}
			kept = append(kept, l)
		}
		p = strings.Join(kept, "\n")
		if p == "" {
			continue
		}
		attr, marks := "", ""
		if ai >= 0 {
			attr = ` data-ai="` + string(rune('0'+ai)) + `" class="marked"`
			marks = aiMarkColumn(ai)
		}
		switch {
		case strings.HasPrefix(p, "<svg"):
			out.WriteString(p + "\n")
		case strings.HasPrefix(p, "# "):
			out.WriteString("<h2" + attr + ">" + marks + htmlEscape(strings.TrimPrefix(p, "# ")) + "</h2>\n")
		case strings.HasPrefix(p, "## "):
			out.WriteString("<h3" + attr + ">" + marks + htmlEscape(strings.TrimPrefix(p, "## ")) + "</h3>\n")
		case strings.HasPrefix(p, "- "):
			if marks != "" {
				out.WriteString("<div" + attr + ">" + marks)
			}
			out.WriteString("<ul>\n")
			for _, li := range strings.Split(p, "\n") {
				out.WriteString("<li>" + mdInline(strings.TrimPrefix(strings.TrimSpace(li), "- ")) + "</li>\n")
			}
			out.WriteString("</ul>\n")
			if marks != "" {
				out.WriteString("</div>\n")
			}
		default:
			out.WriteString("<p" + attr + ">" + marks + mdInline(p) + "</p>\n")
		}
	}
	return out.String()
}

var mdLinkRe = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`)

func mdInline(s string) string {
	s = htmlEscape(s)
	return mdLinkRe.ReplaceAllString(s, `<a href="#$2">$1</a>`)
}

func htmlEscape(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;")
	return r.Replace(s)
}

// nodeBodyProse returns the node file's content after the frontmatter (the rationale layer).
func nodeBodyProse(path string) string {
	return strings.TrimSpace(manifestBody(path))
}

// renderNodeAtDepth emits one transcluded node: statement (1), +rationale (2), +children (3), +evidence (4).
func renderNodeAtDepth(id string, depth int, nodes map[string]Node, sm map[string]string, bl map[string]Event, anchor string) string {
	n, ok := nodes[id]
	if !ok {
		return "<p class=\"missing\">missing node: " + htmlEscape(id) + "</p>\n"
	}
	if depth < 1 {
		depth = 1
	}
	state := strings.ToLower(sm[id])
	if state == "" || state == "content" {
		state = "content"
	}
	var b strings.Builder
	b.WriteString(`<section id="` + anchor + `" data-node="` + htmlEscape(id) + `" data-type="` + htmlEscape(n.Type) + `" data-state="` + state + `" data-layer="normative">` + "\n")
	b.WriteString("<p class=\"stmt\"><strong>" + htmlEscape(n.Statement) + "</strong></p>\n")
	b.WriteString("<p class=\"meta state-" + state + "\">" + htmlEscape(id) + " · " + htmlEscape(n.Type) + " · " + stateTag(state) + "</p>\n")
	disc := func(dl int, label, inner string) string {
		// the M5-proven disclosure: collapsed by default, auto-opened by find-in-page (until-found),
		// EXPAND ALL toggles every <details> - script and CSS only ever toggle, never create.
		return `<details class="disc" data-dl="` + itoa(dl) + `"><summary>` + label + `</summary><div hidden="until-found">` + "\n" + inner + "</div></details>\n"
	}
	if depth >= 2 {
		if prose := nodeBodyProse(n.Path); prose != "" {
			b.WriteString(disc(2, "rationale", `<div data-layer="informative">`+"\n"+mdLite(prose)+"</div>"))
		}
	}
	if depth >= 3 {
		var kids []string
		for cid, c := range nodes {
			for _, p := range parents(c) {
				if p == id {
					kids = append(kids, cid)
				}
			}
		}
		sortStrings(kids)
		if len(kids) > 0 {
			var ul strings.Builder
			ul.WriteString(`<ul data-layer="children">` + "\n")
			for _, k := range kids {
				ul.WriteString("<li><a href=\"#" + htmlEscape(k) + "\">" + htmlEscape(k) + "</a></li>\n")
			}
			ul.WriteString("</ul>")
			b.WriteString(disc(3, "children", ul.String()))
		}
	}
	if depth >= 4 {
		if e, ok := bl[id]; ok {
			h := e.Hash
			if len(h) > 8 {
				h = h[:8]
			}
			b.WriteString(disc(4, "evidence", `<p data-layer="evidence">blessed · `+htmlEscape(normActor(e.Actor))+" · "+htmlEscape(h)+"</p>"))
		}
	}
	b.WriteString("</section>\n")
	return b.String()
}

// renderBookHTML emits the whole book. findings are curation ERRORS (missing lede, unknown term);
// advisories are soft signals (unlinked term usages) that never fail a render.
func renderBookHTML(nodes map[string]Node) (string, []string, []string) {
	sm := StatusMap(nodes)
	bl := latestBless()
	cfg := readProjectConfig()
	root := MerkleRoot(nodes)
	gloss := readGlossary()
	used := map[string][]string{}
	var findings, advisories []string
	var chapters []Node
	for _, n := range nodes {
		if n.Type == "manifest" && (n.Mode == "chapter" || n.Mode == "agent" || n.Mode == "guidance") {
			chapters = append(chapters, n) // the agent guide renders as a chapter, quarantine-exempt
		}
	}
	for i := 1; i < len(chapters); i++ {
		for j := i; j > 0 && chapters[j].ID < chapters[j-1].ID; j-- {
			chapters[j], chapters[j-1] = chapters[j-1], chapters[j]
		}
	}
	// presets (mode preset): each lists chapter refs; articles get static per-preset classes so
	// the view switch is pure CSS/class toggling over the complete DOM.
	presetOf := map[string][]string{} // chapterID -> preset ids
	var presetIDs []string
	for _, n := range nodes {
		if n.Type == "manifest" && n.Mode == "preset" {
			presetIDs = append(presetIDs, n.ID)
			for _, u := range parseManifestUnits(manifestBody(n.Path)) {
				if u.Ref != "" {
					presetOf[u.Ref] = append(presetOf[u.Ref], n.ID)
				}
			}
		}
	}
	sortStrings(presetIDs)
	// auto-link pass (go-auto-link): the alias index builds once; a collision is a finding.
	aliasIdx, aliasErrs := AliasIndex()
	for _, e := range aliasErrs {
		findings = append(findings, "auto-link: "+e)
	}
	// facet validation (go-facet-board): a value outside the vocabulary is loud.
	findings = append(findings, facetFindings(nodes)...)
	var body strings.Builder
	for _, ch := range chapters {
		raw := manifestBody(ch.Path)
		units := parseManifestUnits(raw)
		if len(units) == 0 || units[0].Ref != "" {
			findings = append(findings, "chapter "+ch.ID+" does not open with its lede (req-chapter-tldr)")
		}
		classes := ""
		for _, p := range presetOf[ch.ID] {
			classes += " in-" + p
		}
		var chb strings.Builder
		chb.WriteString(`<article id="` + htmlEscape(ch.ID) + `" class="ch` + htmlEscape(classes) + `">` + "\n<h1>" + htmlEscape(ch.Statement) + "</h1>\n")
		for idx, u := range units {
			anchor := ch.ID + "-u" + itoa(idx+1)
			if u.Ref != "" {
				chb.WriteString(renderNodeAtDepth(u.Ref, u.Depth, nodes, sm, bl, anchor))
			} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
				if retiredFigKinds[m[1]] {
					findings = append(findings, "fig kind '"+m[1]+"' retired (req-fig-tables) - embed its canned base query from method/templates/documents/spec/queries")
				} else {
					chb.WriteString(`<figure id="` + anchor + `" data-layer="figure">` + "\n" + renderFigure(m[1], nodes) + "\n</figure>\n")
				}
			} else {
				layer := "informative"
				if idx == 0 {
					layer = "lede"
				}
				if !proseUnitsMarked(u.Body) {
					findings = append(findings, "chapter "+ch.ID+" unit "+itoa(idx+1)+" carries unmarked prose - no unmarked path into the book (req-ai-drafting)")
				}
				chb.WriteString(`<div id="` + anchor + `" data-layer="` + layer + `">` + "\n" + renderUnitBody(u.Body, nodes, aliasIdx, &findings) + "</div>\n")
			}
		}
		chb.WriteString("</article>\n")
		body.WriteString(expandTermLinks(ch.ID, chb.String(), gloss, used, &findings))
		advisories = append(advisories, unlinkedTermAdvisories(ch.ID, raw, gloss)...)
	}
	chaptersHTML := body.String() // usage referent for the derived lists (go-ch2-derived)
	body.WriteString(renderGlossaryChapter(gloss, used))
	body.WriteString(renderNotationList(gloss, used))
	body.WriteString(renderReferencesList(chaptersHTML))
	body.WriteString(renderFundamentals(chaptersHTML))
	// design: go-deck-mode  implements: req-deck-mode
	// Deck manifests render in the SAME file: one unit per slide; `Note:` lines become the
	// presenter's aside (hidden on screen outside present mode, printed in the handout); the
	// present button flips paged fullscreen driven by arrow keys - CSS and class toggles only.
	var decks []Node
	for _, n := range nodes {
		if n.Type == "manifest" && n.Mode == "deck" {
			decks = append(decks, n)
		}
	}
	for i := 1; i < len(decks); i++ {
		for j := i; j > 0 && decks[j].ID < decks[j-1].ID; j-- {
			decks[j], decks[j-1] = decks[j-1], decks[j]
		}
	}
	for _, dk := range decks {
		body.WriteString(`<article class="deck" id="` + htmlEscape(dk.ID) + `"><h1>` + htmlEscape(dk.Statement) + `</h1><button class="present" data-deck="` + htmlEscape(dk.ID) + `">present</button>` + "\n")
		for idx, u := range parseManifestUnits(manifestBody(dk.Path)) {
			body.WriteString(`<section class="slide" id="` + htmlEscape(dk.ID) + `-s` + itoa(idx+1) + `">` + "\n")
			if u.Ref != "" {
				body.WriteString(renderNodeAtDepth(u.Ref, 1, nodes, sm, bl, dk.ID+"-s"+itoa(idx+1)+"-n"))
			} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
				if retiredFigKinds[m[1]] {
					findings = append(findings, "fig kind '"+m[1]+"' retired (req-fig-tables) - embed its canned base query from method/templates/documents/spec/queries")
				} else {
					body.WriteString(renderFigure(m[1], nodes))
				}
			} else {
				if !proseUnitsMarked(u.Body) {
					findings = append(findings, "deck "+dk.ID+" slide "+itoa(idx+1)+" carries unmarked prose (req-ai-drafting)")
				}
				body.WriteString(renderUnitBody(u.Body, nodes, aliasIdx, &findings))
			}
			if u.Notes != "" {
				body.WriteString(`<aside class="notes">` + htmlEscape(u.Notes) + "</aside>\n")
			}
			body.WriteString("</section>\n")
		}
		body.WriteString("</article>\n")
	}
	// enddesign
	var doc strings.Builder
	doc.WriteString("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n")
	doc.WriteString("<title>" + htmlEscape(brand()) + " — the spec book</title>\n")
	doc.WriteString("<style>body{font-family:system-ui;max-width:760px;margin:2rem auto 2rem 4rem;line-height:1.5;color:" + bookColors["text"] + ";background:" + bookColors["bg"] + "}.meta{font-size:.8rem;color:" + bookColors["meta"] + "}.stmt{margin-bottom:.2rem}.missing{color:#b00}.marked{position:relative}.ai-marks{position:absolute;left:-1.6rem;top:.15rem;display:flex;flex-direction:column;gap:2px}.state-suspect{color:" + bookColors["suspect"] + "}#presets button{margin-right:.4rem}aside.notes{display:none;border-left:3px solid #ccc;padding-left:.6rem;font-size:.85rem}body[data-present] .slide{display:none}body[data-present] .slide.current{display:block;position:fixed;inset:0;background:" + bookColors["bg"] + ";padding:8vh 10vw;overflow:auto;z-index:9}@media print{aside.notes{display:block}.slide{page-break-after:always}}" + facetFilterCSS() + "</style>\n")
	doc.WriteString("</head><body>\n")
	doc.WriteString(`<header data-root="` + root + `"><p class="meta">rendered from spec state ` + root + " · iteration " + htmlEscape(cfg.Version) + " · engine " + htmlEscape(version) + "</p>\n")
	doc.WriteString("<p class=\"meta\">reader's contract: normative statements are binding; informative layers explain; a suspect state means unverified since its last change; depth is a summarization level, never missing content.</p>\n")
	if len(presetIDs) > 0 {
		doc.WriteString(`<nav id="presets" aria-label="views"><button data-view="">all</button>`)
		for _, p := range presetIDs {
			doc.WriteString(`<button data-view="` + htmlEscape(p) + `">` + htmlEscape(strings.TrimPrefix(p, "man-preset-")) + `</button>`)
		}
		doc.WriteString(`<button id="expand-all">expand all</button><input id="filter" type="search" placeholder="filter sections"></nav>` + "\n")
	}
	doc.WriteString("</header>\n<main>\n")
	doc.WriteString(body.String())
	doc.WriteString(`</main>
<script>/* filters and toggles only - this script never creates content */
(function(){
 var b=document.body;
 function apply(){var h=new URLSearchParams(location.hash.slice(1));var v=h.get('view')||'';b.setAttribute('data-view',v);
  document.querySelectorAll('article.ch').forEach(function(a){a.hidden=(v!=='')&&!a.classList.contains('in-'+v);});}
 document.querySelectorAll('#presets button[data-view]').forEach(function(btn){btn.addEventListener('click',function(){location.hash='view='+btn.getAttribute('data-view');});});
 var xa=document.getElementById('expand-all');
 if(xa){xa.addEventListener('click',function(){var open=b.getAttribute('data-expanded')!=='1';b.setAttribute('data-expanded',open?'1':'0');
  document.querySelectorAll('details.disc').forEach(function(d){d.open=open;});});}
 var f=document.getElementById('filter');
 if(f){f.addEventListener('input',function(){var q=f.value.toLowerCase();
  document.querySelectorAll('main section').forEach(function(s){s.hidden=q!==''&&s.textContent.toLowerCase().indexOf(q)<0;});});}
 document.querySelectorAll('button.facet-count').forEach(function(btn){btn.addEventListener('click',function(){
  var t=btn.getAttribute('data-target');b.getAttribute('data-facet')===t?b.removeAttribute('data-facet'):b.setAttribute('data-facet',t);});});
 var cur=-1,slides=[];
 function show(i){if(!slides.length)return;cur=(i+slides.length)%slides.length;
  slides.forEach(function(s,j){s.classList.toggle('current',j===cur);});}
 document.querySelectorAll('button.present').forEach(function(btn){btn.addEventListener('click',function(){
  var d=document.getElementById(btn.getAttribute('data-deck'));
  slides=Array.prototype.slice.call(d.querySelectorAll('.slide'));
  b.setAttribute('data-present',btn.getAttribute('data-deck'));show(0);});});
 document.addEventListener('keydown',function(e){if(!b.hasAttribute('data-present'))return;
  if(e.key==='ArrowRight'||e.key==='PageDown')show(cur+1);
  if(e.key==='ArrowLeft'||e.key==='PageUp')show(cur-1);
  if(e.key==='Escape'){b.removeAttribute('data-present');slides.forEach(function(s){s.classList.remove('current');});slides=[];cur=-1;}});
 window.addEventListener('hashchange',apply);apply();
})();
</script>
</body></html>
`)
	return doc.String(), findings, advisories
}

// design: go-agents-emit  implements: req-agents-emit
// One source, two projections (DRY, the design note's 7.4 rule): the agent-guide manifest
// (mode `agent`) renders as the book's agent chapter AND emits the repo-root AGENTS.md - the
// units' raw markdown joined, provenance marks stripped for the entry surface. The i9 entry-chain
// invariants keep holding by CONTENT (the manifest carries the ritual and the contract pointer,
// never the contract body) - guarded live by selftest:contract-render over the emitted file.
func buildAgentsMD(nodes map[string]Node) (string, bool) {
	for _, n := range nodes {
		if n.Type == "manifest" && n.Mode == "agent" {
			var b strings.Builder
			units := parseManifestUnits(manifestBody(n.Path))
			for i, u := range units {
				if u.Body == "" {
					continue
				}
				if i == 0 && len(units) > 1 {
					continue // the chapter lede belongs to the BOOK; the emitted file starts at the hub
				}
				for _, line := range strings.Split(u.Body, "\n") {
					if parseAIMark(line) >= 0 {
						continue // the entry surface stays mark-free; the book keeps the marks
					}
					b.WriteString(line + "\n")
				}
				b.WriteString("\n")
			}
			return strings.TrimRight(b.String(), "\n") + "\n", true
		}
	}
	return "", false
}

// enddesign

// design: go-book-a11y  implements: req-book-a11y
// WCAG 2 AA over every surface the views added (the prior-art check's miss, owner-added at M2):
// landmarks (header, labeled nav, main), a real heading hierarchy, native focusable controls only
// (button, input, summary, a - never a click-only div), and CONTRAST COMPUTED, not eyeballed: the
// theme colors live in ONE map, the stylesheet renders from it, and the selftest recomputes the
// WCAG ratio against the page background - text at 4.5:1, graphics at 3:1.
var bookColors = map[string]string{
	"text":    "#1a1a1a", // body text on white
	"meta":    "#55606a", // the meta lines (was opacity - opacity hides contrast from review)
	"suspect": "#a15c00", // the suspect warning text
	"robot":   "#5b7fa6", // the mark icons (graphic, 3:1 bound)
	"bg":      "#ffffff",
}

func hexChannel(h string, i int) float64 {
	v := 0
	for _, c := range h[i : i+2] {
		v *= 16
		switch {
		case c >= '0' && c <= '9':
			v += int(c - '0')
		case c >= 'a' && c <= 'f':
			v += int(c-'a') + 10
		}
	}
	s := float64(v) / 255.0
	if s <= 0.03928 {
		return s / 12.92
	}
	// ((s+0.055)/1.055)^2.4 via exp/ln-free approximation: x^2.4 = x^2 * x^0.4; x^0.4 by sqrt chains
	x := (s + 0.055) / 1.055
	return x * x * sqrt2x(x)
}

// sqrt2x approximates x^0.4 as sqrt(sqrt(x))*sqrt(sqrt(sqrt(x)))... precise enough: 0.25+0.125=0.375~0.4
func sqrt2x(x float64) float64 { return sqrtF(sqrtF(x)) * sqrtF(sqrtF(sqrtF(x))) }

func sqrtF(x float64) float64 { // Newton, deterministic
	if x <= 0 {
		return 0
	}
	g := x
	for i := 0; i < 40; i++ {
		g = (g + x/g) / 2
	}
	return g
}

func luminance(hex string) float64 {
	h := strings.TrimPrefix(hex, "#")
	return 0.2126*hexChannel(h, 0) + 0.7152*hexChannel(h, 2) + 0.0722*hexChannel(h, 4)
}

func contrastRatio(fg, bg string) float64 {
	l1, l2 := luminance(fg), luminance(bg)
	if l2 > l1 {
		l1, l2 = l2, l1
	}
	return (l1 + 0.05) / (l2 + 0.05)
}

// enddesign

// design: go-book-drift  implements: req-book-drift
// The committed book (spec/book.html, written at ship) must equal a fresh render - the emitter is
// deterministic by construction (no timestamps; identity = the merkle root), so same state means
// same bytes, and a drifted committed book is a lint finding. No committed book = disarmed
// (day-to-day renders live in the data home).
func committedBookPath() string { return filepath.Join(SPEC, "book.html") }

func bookDriftFindingAt(path string, nodes map[string]Node) []string {
	committed, err := os.ReadFile(path)
	if err != nil {
		return nil // not committed: disarmed
	}
	fresh, _, _ := renderBookHTML(nodes)
	if string(committed) == fresh {
		return nil
	}
	return []string{"the committed book differs from a fresh render - regenerate it at ship (req-book-drift)"}
}

// enddesign

func cmdBook(args []string) {
	out := flagVal(args, "--out")
	if out == "" {
		out = filepath.Join(dataDirFor("out"), "book.html")
	}
	html, findings, advisories := renderBookHTML(LoadAll())
	advisories = append(advisories, registerAdvisories()...)
	for _, a := range advisories {
		fmt.Fprintln(os.Stderr, "book (advisory): "+a)
	}
	for _, f := range findings {
		fmt.Fprintln(os.Stderr, "book: "+f)
	}
	os.MkdirAll(filepath.Dir(out), 0o755)
	if err := os.WriteFile(out, []byte(html), 0o644); err != nil {
		fmt.Fprintln(os.Stderr, "book:", err)
		quackExit(1)
	}
	fmt.Println("book ->", filepath.ToSlash(out))
	if md, ok := buildAgentsMD(LoadAll()); ok {
		os.WriteFile(filepath.Join(ROOT, "AGENTS.md"), []byte(md), 0o644)
		fmt.Println("AGENTS.md emitted from the agent-guide manifest")
	}
	if len(findings) > 0 {
		quackExit(1)
	}
}

// enddesign

// design: go-book-figures  implements: req-book-figures
// The derived figure set (adr-figures-derived-set), spike-proven at M5: four diagram kinds whose
// layout is trivial arithmetic render as inline SVG with REAL text - context star, building-block
// tree, timeline, stakeholder matrix - each fed from live graph data, sorted for determinism.
// A manifest unit references one with a single `fig: <kind>` line; authored inline SVG passes
// through mdLite as ordinary (provenance-marked) content - the generous release valve.
var figRefRe = regexp.MustCompile(`^fig:\s*([a-z-]+)\s*$`)

func svgBox(x, y, w, h int, label string) string {
	cx := x + w/2
	return fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#f6f8fa" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text>`, x, y, w, h, cx, y+h/2+5, htmlEscape(label))
}

func svgContextStar(center string, actors []string) string {
	var b strings.Builder
	b.WriteString(`<svg viewBox="0 0 640 420" font-family="system-ui" font-size="13" role="img" aria-label="context diagram">`)
	b.WriteString(fmt.Sprintf(`<rect x="250" y="180" width="140" height="60" rx="8" fill="#e8f0fe" stroke="#4a6fa5"/><text x="320" y="215" text-anchor="middle">%s</text>`, htmlEscape(center)))
	n := len(actors)
	if n > 8 {
		actors, n = actors[:8], 8
	}
	for i, a := range actors {
		ang := 2*3.141592653589793*float64(i)/float64(n) - 3.141592653589793/2
		x := 320 + int(210*cosApprox(ang))
		y := 210 + int(150*sinApprox(ang))
		b.WriteString(fmt.Sprintf(`<line x1="320" y1="210" x2="%d" y2="%d" stroke="#999"/>`, x, y))
		b.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="110" height="30" rx="15" fill="#fff" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text>`, x-55, y-15, x, y+5, htmlEscape(a)))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

// cosApprox/sinApprox: math without importing math - an 11-term Taylor pair is exact far beyond
// pixel resolution and keeps the arithmetic identical on every platform (determinism by construction).
func cosApprox(x float64) float64 {
	term, sum := 1.0, 1.0
	for k := 1; k <= 11; k++ {
		term *= -x * x / float64((2*k-1)*(2*k))
		sum += term
	}
	return sum
}

func sinApprox(x float64) float64 {
	term, sum := x, x
	for k := 1; k <= 11; k++ {
		term *= -x * x / float64((2*k)*(2*k+1))
		sum += term
	}
	return sum
}

func svgBlockTree(title string, blocks []string) string {
	var b strings.Builder
	rows := (len(blocks) + 2) / 3
	h := 90 + rows*100
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 640 %d" font-family="system-ui" font-size="13" role="img" aria-label="building blocks">`, h))
	b.WriteString(fmt.Sprintf(`<rect x="10" y="10" width="620" height="%d" rx="8" fill="none" stroke="#4a6fa5" stroke-width="2"/><text x="24" y="36">%s</text>`, h-20, htmlEscape(title)))
	for i, bl := range blocks {
		x := 34 + (i%3)*200
		y := 56 + (i/3)*100
		b.WriteString(svgBox(x, y, 180, 70, bl))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

func svgTimeline(items []string) string {
	var b strings.Builder
	w := 80 + len(items)*130
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 %d 120" font-family="system-ui" font-size="12" role="img" aria-label="timeline">`, w))
	b.WriteString(fmt.Sprintf(`<line x1="40" y1="60" x2="%d" y2="60" stroke="#4a6fa5" stroke-width="2"/>`, w-40))
	for i, it := range items {
		x := 80 + i*130
		b.WriteString(fmt.Sprintf(`<circle cx="%d" cy="60" r="6" fill="#4a6fa5"/><text x="%d" y="92" text-anchor="middle">%s</text>`, x, x, htmlEscape(it)))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

func svgMatrix(rows []string, cells map[string][]string) string {
	var b strings.Builder
	h := 60 + len(rows)*44
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 640 %d" font-family="system-ui" font-size="12" role="img" aria-label="stakeholder matrix">`, h))
	b.WriteString(`<text x="20" y="30" font-weight="bold">type</text><text x="220" y="30" font-weight="bold">classes served</text>`)
	for i, r := range rows {
		y := 60 + i*44
		joined := strings.Join(cells[r], ", ")
		if len(joined) > 60 {
			joined = joined[:57] + "..."
		}
		b.WriteString(fmt.Sprintf(`<text x="20" y="%d">%s</text><text x="220" y="%d">%s</text>`, y, htmlEscape(r), y, htmlEscape(joined)))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

// renderFigure derives the named figure from live graph data, sorted for determinism.
// design: go-fig-tables  implements: req-fig-tables
// Tables are tables, figures are figures (owner ruling 2026-07-05): the tabular fig kinds
// (vv-table, stakeholder-matrix) retire in favor of canned base queries the manifests embed
// as ```base blocks - they gain live Obsidian preview. fig: keeps only spatial graphics
// whose selection is topological (context star, block tree, timeline). A retired kind is a
// FINDING with the pointer to its canned query; a base block in any unit body evaluates
// through the pinned evaluator (go-base-eval) into a semantic table.
var retiredFigKinds = map[string]bool{"vv-table": true, "stakeholder-matrix": true}

// renderUnitBody renders a unit's markdown, evaluating embedded base blocks to tables.
func renderUnitBody(body string, nodes map[string]Node, aliasIdx map[string]string, findings *[]string) string {
	blocks := baseBlockRe.FindAllStringSubmatchIndex(body, -1)
	if len(blocks) == 0 {
		return mdLite(AutoLink(body, aliasIdx))
	}
	var out strings.Builder
	last := 0
	for _, m := range blocks {
		if seg := body[last:m[0]]; strings.TrimSpace(seg) != "" {
			out.WriteString(mdLite(AutoLink(seg, aliasIdx)))
		}
		out.WriteString(renderBaseHTML(body[m[2]:m[3]], nodes, findings))
		last = m[1]
	}
	if seg := body[last:]; strings.TrimSpace(seg) != "" {
		out.WriteString(mdLite(AutoLink(seg, aliasIdx)))
	}
	return out.String()
}

// renderBaseHTML evaluates one base block over the workspace's node files.
func renderBaseHTML(text string, nodes map[string]Node, findings *[]string) string {
	seen := map[string]bool{}
	var paths []string
	for _, n := range nodes {
		if n.Path != "" && strings.HasSuffix(n.Path, ".md") && !seen[n.Path] {
			seen[n.Path] = true
			paths = append(paths, n.Path)
		}
	}
	results, err := EvalBase(text, paths, nodes)
	if err != nil {
		*findings = append(*findings, "base: "+err.Error())
		return `<p class="missing">base query error (see findings)</p>` + "\n"
	}
	return baseResultHTML(results)
}

// baseResultHTML renders evaluation results as semantic tables (WCAG: real th headers).
func baseResultHTML(rs []BaseResult) string {
	var b strings.Builder
	for _, r := range rs {
		b.WriteString(`<table data-layer="derived">` + "\n")
		if r.Name != "" {
			b.WriteString(`<caption>` + htmlEscape(r.Name) + `</caption>` + "\n")
		}
		b.WriteString("<tr>")
		for _, c := range r.Columns {
			b.WriteString(`<th scope="col">` + htmlEscape(c) + `</th>`)
		}
		b.WriteString("</tr>\n")
		empty := true
		for _, g := range r.Groups {
			if g.Key != "" {
				b.WriteString(`<tr class="group"><th scope="colgroup" colspan="` + itoa(len(r.Columns)) + `">` + htmlEscape(g.Key) + ` (` + itoa(g.Count) + `)</th></tr>` + "\n")
			}
			for _, row := range g.Rows {
				empty = false
				cls := "rowf"
				for _, fc := range row.Facets {
					cls += " " + fc
				}
				b.WriteString(`<tr class="` + htmlEscape(cls) + `">`)
				for _, cell := range row.Cells {
					b.WriteString("<td>" + htmlEscape(cell) + "</td>")
				}
				b.WriteString("</tr>\n")
			}
		}
		b.WriteString("</table>\n")
		if empty {
			b.WriteString(`<p class="meta">no rows yet — the query renders as items arrive</p>` + "\n")
		}
	}
	return b.String()
}

// enddesign

func renderFigure(kind string, nodes map[string]Node) string {
	switch kind {
	case "context-star":
		var actors []string
		for c := range projectClasses() {
			actors = append(actors, c)
		}
		sortStrings(actors)
		return svgContextStar(brand(), actors)
	case "timeline":
		return svgTimeline(versions())
	case "block-tree":
		var chapters []string
		for id, n := range nodes {
			if n.Type == "manifest" && n.Mode == "chapter" {
				chapters = append(chapters, id)
			}
		}
		sortStrings(chapters)
		return svgBlockTree(brand()+" — the book", chapters)
	case "coverage-board":
		return renderCoverageBoard(nodes)
	case "candidates-matrix":
		// go-items: candidates against criteria, grouped by axis - the derived matrix that
		// replaces hand-written Pugh tables. Columns are DYNAMIC (the union of rating
		// criteria), which exceeds the pinned base subset - so this stays a derived kind.
		// Status derives from the deciding links: chosen/rejected by which decision, else open.
		var cands []Node
		critSet := map[string]bool{}
		for _, n := range nodes {
			if n.Type == "candidate" {
				cands = append(cands, n)
				for c := range n.Maps["ratings"] {
					critSet[c] = true
				}
			}
		}
		if len(cands) == 0 {
			return `<p class="meta">no candidates yet</p>`
		}
		for i := 1; i < len(cands); i++ {
			for j := i; j > 0 && (cands[j].Axis < cands[j-1].Axis || (cands[j].Axis == cands[j-1].Axis && cands[j].ID < cands[j-1].ID)); j-- {
				cands[j], cands[j-1] = cands[j-1], cands[j]
			}
		}
		var crits []string
		for c := range critSet {
			crits = append(crits, c)
		}
		sortStrings(crits)
		verdict := func(id string) string {
			for _, n := range nodes {
				if n.Type != "adr" {
					continue
				}
				for _, c := range n.Chosen {
					if c == id {
						return "chosen by " + n.ID
					}
				}
				for _, c := range n.Rejected {
					if c == id {
						return "rejected by " + n.ID
					}
				}
			}
			return "open"
		}
		var b strings.Builder
		b.WriteString(`<table data-layer="derived"><tr><th scope="col">axis</th><th scope="col">candidate</th>`)
		for _, c := range crits {
			b.WriteString(`<th scope="col">` + htmlEscape(c) + `</th>`)
		}
		b.WriteString(`<th scope="col">decision</th></tr>` + "\n")
		for _, cd := range cands {
			b.WriteString("<tr><td>" + htmlEscape(cd.Axis) + "</td><td>" + htmlEscape(cd.ID) + "</td>")
			for _, c := range crits {
				b.WriteString("<td>" + htmlEscape(cd.Maps["ratings"][c]) + "</td>")
			}
			b.WriteString("<td>" + htmlEscape(verdict(cd.ID)) + "</td></tr>\n")
		}
		b.WriteString("</table>")
		return b.String()
	case "project-table":
		// the derived project view: every iteration with its gate tally - the ledger's own diary.
		sm := StatusMap(nodes)
		var b strings.Builder
		b.WriteString(`<table data-layer="derived"><tr><th>iteration</th><th>gates done</th><th>gates total</th></tr>` + "\n")
		for _, v := range versions() {
			done, total := 0, 0
			for id, n := range nodes {
				if !isGate(n) || iterOf(n.Path) != v {
					continue
				}
				total++
				if sm[id] == "DONE" {
					done++
				}
			}
			b.WriteString("<tr><td>" + htmlEscape(v) + "</td><td>" + itoa(done) + "</td><td>" + itoa(total) + "</td></tr>\n")
		}
		b.WriteString("</table>")
		return b.String()
	}
	return `<p class="missing">unknown figure kind: ` + htmlEscape(kind) + `</p>`
}

// enddesign

// design: go-book-glossary  implements: req-glossary-shared, req-meta-quarantine
// The LaTeX glossaries discipline (adr-glossary-discipline) over one shared source: per-term notes
// in method/glossary (frontmatter: term, long, class). A USAGE is a marked link `[label](term:slug)`
// - never trusted plain text. The emitter renders the used-terms-only glossary chapter with
// back-references and expands the FIRST linked use per chapter to the long form; a link to a
// missing term is an error finding; a plain-text occurrence of a defined term outside a link is an
// ADVISORY. The meta-quarantine lint reads the SAME class field: a meta-classified term appearing
// in a reader chapter's authored content is flagged (the agent guide - mode `agent` - is exempt;
// per-vehicle classification keeps the dogfood edge honest: harness terms ARE domain here).
type GlossTerm struct {
	Slug, Term, Long, Class, Def string
	Aliases                      []string // Obsidian-native aliases (go-spec-content); the auto-link pass shares them
	Unit                         string   // notation symbols carry units
}

var glossaryDirOverride string // test seam

// glossaryDir: the glossary is PROJECT content under the workspace spec (req-spec-content-roots,
// owner ruling 2026-07-05) - spec/glossary for every project, quackitect included.
func glossaryDir() string {
	if glossaryDirOverride != "" {
		return glossaryDirOverride
	}
	return filepath.Join(SPEC, "glossary")
}

var fmKeyRe = regexp.MustCompile(`(?m)^(term|long|class|aliases|unit):\s*(.+)$`)

func readGlossary() map[string]GlossTerm {
	out := map[string]GlossTerm{}
	ents, err := os.ReadDir(glossaryDir())
	if err != nil {
		return out
	}
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || e.Name() == "README.md" {
			continue
		}
		p := filepath.Join(glossaryDir(), e.Name())
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		t := GlossTerm{Slug: strings.TrimSuffix(e.Name(), ".md"), Def: nodeBodyProse(p)}
		for _, m := range fmKeyRe.FindAllStringSubmatch(string(raw), -1) {
			switch m[1] {
			case "term":
				t.Term = strings.TrimSpace(m[2])
			case "long":
				t.Long = strings.TrimSpace(m[2])
			case "class":
				t.Class = strings.TrimSpace(m[2])
			case "aliases":
				t.Aliases = splitIDs(strings.TrimSpace(m[2]))
			case "unit":
				t.Unit = strings.TrimSpace(m[2])
			}
		}
		out[t.Slug] = t
	}
	return out
}

var termLinkRe = regexp.MustCompile(`<a href="#term:([a-z0-9-]+)">([^<]*)</a>`)

// expandTermLinks rewrites term anchors, expands the first use per chapter, and collects usage.
func expandTermLinks(chapterID, html string, gloss map[string]GlossTerm, used map[string][]string, findings *[]string) string {
	seen := map[string]bool{}
	return termLinkRe.ReplaceAllStringFunc(html, func(match string) string {
		m := termLinkRe.FindStringSubmatch(match)
		slug, label := m[1], m[2]
		t, ok := gloss[slug]
		if !ok {
			*findings = append(*findings, "chapter "+chapterID+" links unknown glossary term '"+slug+"'")
			return label
		}
		if len(used[slug]) == 0 || used[slug][len(used[slug])-1] != chapterID {
			used[slug] = append(used[slug], chapterID)
		}
		inner := label
		if !seen[slug] && t.Long != "" {
			inner = htmlEscape(t.Long) + " (" + label + ")" // first use per chapter expands
		}
		seen[slug] = true
		return `<a class="term" href="#term-` + slug + `">` + inner + `</a>`
	})
}

// renderGlossaryChapter emits the used-terms-only glossary with back-references.
func renderGlossaryChapter(gloss map[string]GlossTerm, used map[string][]string) string {
	var slugs []string
	for s := range used {
		slugs = append(slugs, s)
	}
	sortStrings(slugs)
	if len(slugs) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString(`<article id="glossary"><h1>Glossary</h1>` + "\n")
	for _, s := range slugs {
		t := gloss[s]
		if t.Class == "notation" {
			continue // notation renders in its own derived list (go-ch2-derived)
		}
		b.WriteString(`<section id="term-` + s + `" data-layer="glossary"><p class="stmt"><strong>` + htmlEscape(t.Term) + `</strong> — ` + htmlEscape(t.Long) + "</p>\n")
		b.WriteString(mdLite(t.Def))
		b.WriteString(`<p class="meta">used in: `)
		for i, ch := range used[s] {
			if i > 0 {
				b.WriteString(", ")
			}
			b.WriteString(`<a href="#` + htmlEscape(ch) + `">` + htmlEscape(ch) + `</a>`)
		}
		b.WriteString("</p></section>\n")
	}
	b.WriteString("</article>\n")
	return b.String()
}

// design: go-ch2-derived  implements: req-ch2-derived
// The pull law of the fundamentals chapter (owner ruling 2026-07-05): everything renders
// from USAGE alone - references (normative apart from informative, ISO clause-2 style),
// notation (used notation-class terms with their units), fundamentals (slug + one-liner;
// the FULL bodies render one link away for the guidance chapter to reference). An entry
// nothing links does not render. Usage = a link in the rendered chapters - authored or
// auto-linked (go-auto-link); references are the ONLY legal home of an external URL
// (req-external-links), so the URL prints here and nowhere else.

// renderNotationList emits the used notation-class terms with units.
func renderNotationList(gloss map[string]GlossTerm, used map[string][]string) string {
	var slugs []string
	for s := range used {
		if gloss[s].Class == "notation" {
			slugs = append(slugs, s)
		}
	}
	sortStrings(slugs)
	if len(slugs) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString(`<article id="notation"><h1>Notation</h1>` + "\n")
	for _, s := range slugs {
		t := gloss[s]
		unit := ""
		if t.Unit != "" {
			unit = ` <span class="meta">[` + htmlEscape(t.Unit) + `]</span>`
		}
		b.WriteString(`<section id="term-` + s + `" data-layer="glossary"><p class="stmt"><strong>` + htmlEscape(t.Term) + `</strong>` + unit + ` — ` + htmlEscape(t.Long) + "</p>\n" + mdLite(t.Def) + "</section>\n")
	}
	b.WriteString("</article>\n")
	return b.String()
}

// usedContentSlugs filters a kind's notes to those the chapters actually link.
func usedContentSlugs(kind, chaptersHTML string) []ContentNote {
	notes := ReadContentNotes(kind)
	var out []ContentNote
	var slugs []string
	for s := range notes {
		slugs = append(slugs, s)
	}
	sortStrings(slugs)
	for _, s := range slugs {
		if strings.Contains(chaptersHTML, `href="#`+s+`"`) {
			out = append(out, notes[s])
		}
	}
	return out
}

// renderReferencesList emits the used references, normative apart from informative.
func renderReferencesList(chaptersHTML string) string {
	refs := usedContentSlugs("references", chaptersHTML)
	if len(refs) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString(`<article id="references"><h1>References</h1>` + "\n")
	for _, group := range []string{"normative", "informative"} {
		var members []ContentNote
		for _, r := range refs {
			k := r.RefKind
			if k == "" {
				k = "informative"
			}
			if k == group {
				members = append(members, r)
			}
		}
		if len(members) == 0 {
			continue
		}
		b.WriteString(`<section data-layer="informative"><h2>` + strings.ToUpper(group[:1]) + group[1:] + `</h2>` + "\n")
		for _, r := range members {
			pin := ""
			if r.Version != "" {
				pin = ", " + htmlEscape(r.Version)
			}
			b.WriteString(`<p class="stmt" id="` + r.Slug + `"><strong>` + htmlEscape(r.Title) + `</strong>` + pin + ` — <a href="` + htmlEscape(r.URL) + `">` + htmlEscape(r.URL) + `</a></p>` + "\n")
			if r.Body != "" {
				b.WriteString(mdLite(r.Body))
			}
		}
		b.WriteString("</section>\n")
	}
	b.WriteString("</article>\n")
	return b.String()
}

// renderFundamentals emits the used fundamentals: the ch2 list (one-liner) plus the
// full bodies as the sections the list and the auto-link pass anchor to.
func renderFundamentals(chaptersHTML string) string {
	funds := usedContentSlugs("fundamentals", chaptersHTML)
	if len(funds) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString(`<article id="fundamentals"><h1>Fundamentals</h1>` + "\n<ul>\n")
	for _, f := range funds {
		b.WriteString(`<li><a href="#` + f.Slug + `">` + htmlEscape(f.Statement) + `</a></li>` + "\n")
	}
	b.WriteString("</ul>\n")
	for _, f := range funds {
		b.WriteString(`<section id="` + f.Slug + `" data-layer="informative"><p class="stmt">` + htmlEscape(f.Statement) + "</p>\n" + mdLite(f.Body) + "</section>\n")
	}
	b.WriteString("</article>\n")
	return b.String()
}

// enddesign

// unlinkedTermAdvisories: defined terms appearing as plain text in a chapter body (advisory only).
func unlinkedTermAdvisories(chapterID, body string, gloss map[string]GlossTerm) []string {
	var out []string
	low := strings.ToLower(regexp.MustCompile(`\[[^\]]*\]\([^)]*\)`).ReplaceAllString(body, ""))
	for slug, t := range gloss {
		if t.Term == "" {
			continue
		}
		if regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(strings.ToLower(t.Term)) + `\b`).MatchString(low) {
			out = append(out, "chapter "+chapterID+" uses term '"+t.Term+"' without a link (term:"+slug+")")
		}
	}
	sortStrings(out)
	return out
}

// metaQuarantineFindings: a meta-classified term in a reader chapter's authored content is flagged.
func metaQuarantineFindings(nodes map[string]Node, gloss map[string]GlossTerm) []string {
	// design: go-quarantine-scope  implements: req-quarantine-scope
	// The boundary since the nine-chapter walk (supersedes the chapters-1-6 wording): EVERY
	// chapter speaks only about the system - rationales included; the guidance chapter
	// (mode `guidance`, renders as a chapter) and the agent guide (mode `agent`) are the
	// only self-referential surfaces.
	// enddesign
	var out []string
	for id, n := range nodes {
		if n.Type != "manifest" || n.Mode != "chapter" {
			continue // guidance (mode `guidance`), the agent guide (mode `agent`), and non-chapters are exempt
		}
		body := strings.ToLower(manifestBody(n.Path))
		for slug, t := range gloss {
			if t.Class != "meta" || t.Term == "" {
				continue
			}
			if strings.Contains(body, "term:"+slug) || regexp.MustCompile(`(?i)\b`+regexp.QuoteMeta(strings.ToLower(t.Term))+`\b`).MatchString(body) {
				out = append(out, "chapter "+id+" carries meta term '"+t.Term+"' — meta vocabulary belongs in the agent guide")
			}
		}
	}
	sortStrings(out)
	return out
}

// enddesign

// design: go-book-honesty  implements: req-book-honesty, req-provenance-icons
// The book never claims more than the gates (req-book-honesty): every transcluded node renders its
// LIVE ledger state as visible text and a data attribute; a SUSPECT or unverified state carries the
// warning tag in the reading flow, never only styling. The provenance marks render as the owner's
// drawn SVG robot column - small icons set vertically in the text margin (M5 spike, owner-decided:
// no font dependency, machine-readable label "AI involvement: N of 3"). The count comes ONLY from
// the stored mark (write-time truth, adr-provenance-involvement); rendering can never show more
// marks than recorded, and ai:0 renders none.
const svgRobot = `<svg width="14" height="14" viewBox="0 0 18 18" role="img" aria-label="AI mark"><rect x="3" y="6" width="12" height="9" rx="2" fill="#5b7fa6"/><circle cx="7" cy="10.5" r="1.6" fill="#fff"/><circle cx="11" cy="10.5" r="1.6" fill="#fff"/><line x1="9" y1="3" x2="9" y2="6" stroke="#5b7fa6" stroke-width="1.5"/><circle cx="9" cy="2.5" r="1.2" fill="#5b7fa6"/></svg>`

func aiMarkColumn(n int) string {
	if n <= 0 {
		return ""
	}
	if n > 3 {
		n = 3
	}
	var b strings.Builder
	b.WriteString(`<span class="ai-marks" role="img" aria-label="AI involvement: ` + itoa(n) + ` of 3">`)
	for i := 0; i < n; i++ {
		b.WriteString(svgRobot)
	}
	b.WriteString("</span>")
	return b.String()
}

// stateTag renders the honest state text a reader (and an extractor) sees beside a node.
func stateTag(state string) string {
	switch state {
	case "done":
		return "verified"
	case "suspect":
		return "⚠ suspect — changed since its last verification"
	case "open":
		return "unverified"
	}
	return state
}

// enddesign

// test-book-manifests -> selftest:book-manifests
func selftestBookManifests() bool {
	dir, err := os.MkdirTemp("", "qbm")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "man-probe.md")
	body := "---\nid: man-probe\ntype: manifest\nmode: chapter\nstatement: Probe chapter.\n---\n<!-- ai:3 -->\nAn inline lede unit.\n---\n[req-book-honesty](req-book-honesty.md) depth:2\nNote: speak slowly here\n---\n[uc-book-read](uc-book-read.md)\n"
	if os.WriteFile(p, []byte(body), 0o644) != nil {
		return false
	}
	n := ParseNode(p)
	if n.Type != "manifest" || n.Mode != "chapter" {
		return false
	}
	units := parseManifestUnits(manifestBody(p))
	if len(units) != 3 {
		return false
	}
	if units[0].Ref != "" || !strings.Contains(units[0].Body, "inline lede") {
		return false // inline markdown passes through
	}
	if units[1].Ref != "req-book-honesty" || units[1].Depth != 2 || units[1].Notes != "speak slowly here" {
		return false // a ref unit carries id, declared depth, and its speaker notes
	}
	if units[2].Ref != "uc-book-read" || units[2].Depth != 0 {
		return false // depth omitted -> the mode default
	}
	// a preset manifest selects chapters; the render carries static classes + the view controls.
	fdir, err := os.MkdirTemp("", "qbp")
	if err != nil {
		return false
	}
	defer os.RemoveAll(fdir)
	fx := bookFixture(fdir, 2, true)
	pp := filepath.Join(fdir, "man-preset-exec.md")
	os.WriteFile(pp, []byte("---\nid: man-preset-exec\ntype: manifest\nmode: preset\nstatement: Executive view.\n---\n[man-fix](man-fix.md)\n"), 0o644)
	fx["man-preset-exec"] = Node{ID: "man-preset-exec", Type: "manifest", Mode: "preset", Statement: "Executive view.", Path: pp}
	html, _, _ := renderBookHTML(fx)
	if !strings.Contains(html, "in-man-preset-exec") || !strings.Contains(html, `data-view="man-preset-exec"`) {
		return false // the preset reaches the article classes and the nav
	}
	if !strings.Contains(html, `hidden="until-found"`) || !strings.Contains(html, "expand-all") {
		return false // the disclosure mechanism (depth 2 renders it) and its expand-all escape hatch
	}
	return true
}

// test-book-orphans -> selftest:book-orphan-lint
func selftestBookOrphans() bool {
	dir, err := os.MkdirTemp("", "qbo")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	man := filepath.Join(dir, "man-ch1.md")
	os.WriteFile(man, []byte("---\nid: man-ch1\ntype: manifest\nmode: chapter\nstatement: Ch1.\n---\n[req-a](req-a.md)\n"), 0o644)
	exc := filepath.Join(dir, "man-out.md")
	os.WriteFile(exc, []byte("---\nid: man-out\ntype: manifest\nmode: exclude\nstatement: Deliberately out.\n---\n[req-c](req-c.md)\n"), 0o644)
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "t.md")
	syn := map[string]Node{
		"req-a":   {ID: "req-a", Type: "requirement", Path: iterPath},
		"req-b":   {ID: "req-b", Type: "requirement", Path: iterPath},
		"req-c":   {ID: "req-c", Type: "requirement", Path: iterPath},
		"man-ch1": {ID: "man-ch1", Type: "manifest", Mode: "chapter", Path: man},
		"man-out": {ID: "man-out", Type: "manifest", Mode: "exclude", Path: exc},
	}
	found := bookOrphanFindings(syn)
	if len(found) != 1 || !strings.Contains(found[0], "req-b") {
		return false // the unreferenced node is flagged; the excluded one is covered
	}
	noman := map[string]Node{"req-x": {ID: "req-x", Type: "requirement", Path: iterPath}}
	return bookOrphanFindings(noman) == nil // zero manifests -> disarmed
}
