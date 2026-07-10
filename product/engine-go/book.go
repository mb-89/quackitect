package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// design: go-book-manifests  implements: req-book-manifests, req-book-orphans, req-orphan-render-refs
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

// bookOrphanFindings flags book-content nodes no manifest reaches. Disarmed with zero manifests.
// A node is reached by a DIRECT unit ref, or by a LIVE VIEW that matches it (owner ruling
// 2026-07-07): the book shows a view's rows, so the lint counts them. Pull-law queries
// (`referenced`) follow references and can never create one - they are skipped. A broken
// query counts nothing here; the render channel already reports it as a finding.
func bookOrphanFindings(nodes map[string]Node) []string {
	referenced := map[string]bool{}
	manifests := 0
	var evalPaths []string // built once, on the first live view
	for _, n := range nodes {
		if n.Type != "manifest" {
			continue
		}
		manifests++
		body := manifestBody(n.Path)
		for _, u := range parseManifestUnits(body) {
			if u.Ref != "" {
				referenced[u.Ref] = true
			}
		}
		// the ucfn board (i14, field c25) renders every need and use case - a manifest
		// embedding it reaches them all
		if strings.Contains(body, "fig: ucfn-board") {
			for id, bn := range nodes {
				if bn.Type == "need" || bn.Type == "usecase" {
					referenced[id] = true
				}
			}
		}
		for _, m := range baseUseRe.FindAllStringSubmatch(body, -1) {
			text, viewName := m[1], ""
			if text == "" { // pooled-query embed
				raw, err := os.ReadFile(filepath.Join(queriesDir(), filepath.Base(strings.TrimSpace(m[2]))))
				if err != nil {
					continue
				}
				text, viewName = string(raw), strings.TrimSpace(m[3])
			}
			if baseRefdRe.MatchString(text) {
				continue
			}
			if evalPaths == nil {
				evalPaths = baseEvalPaths(nodes)
			}
			results, err := EvalBase(text, evalPaths, nodes)
			if err != nil {
				continue
			}
			for _, r := range results {
				if viewName != "" && r.Name != viewName {
					continue
				}
				for _, g := range r.Groups {
					for _, row := range g.Rows {
						referenced[row.ID] = true
					}
				}
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

// design: go-book-emitter  implements: req-book-single-file, req-book-depth, req-book-dom-static, req-chapter-tldr, req-book-identity, req-llm-digestible, req-readme-chapter
// The deterministic emitter core. Truth (nodes + manifests) renders to ONE self-contained HTML:
// the project README opens the book as its own first chapter — the reader's starting point —
// through the zero-dep renderReadme projection (headings, tables, lists, inline images);
// every layer is real text in a semantic DOM at emit time (script never creates content); depth
// derives from node anatomy (1 statement, 2 +rationale, 3 +children, 4 +evidence) - never an
// authored tag (the strict allowlist refuses a `depth:` key on nodes); every chapter OPENS with
// its lede (a missing lede is a finding); every unit carries a STABLE ANCHOR (<node>-u<idx>, the
// future comment system's hook); the artifact stamps its source state (merkle root, iteration,
// engine version); each node renders a visible meta line (id, type, ledger state) so trust
// metadata survives plain-text extraction. No timestamps anywhere - same state, same bytes.
func mdLite(md string) string {
	md = stripFillComments(md) // template fill guidance stays in the source, never in the book
	// fenced code blocks (```lang ... ```) are pulled out before the paragraph split so a
	// multi-line block (e.g. a command list) renders as one HTML-escaped <pre><code>, keeping
	// its lines intact and deterministic; everything else flows through mdLiteBlocks unchanged.
	lines := strings.Split(strings.ReplaceAll(md, "\r\n", "\n"), "\n")
	var fout strings.Builder
	var buf []string
	flush := func() {
		if len(buf) > 0 {
			fout.WriteString(mdLiteBlocks(strings.Join(buf, "\n")))
			buf = nil
		}
	}
	for i := 0; i < len(lines); i++ {
		if strings.HasPrefix(strings.TrimSpace(lines[i]), "```") {
			flush()
			var code []string
			for i++; i < len(lines) && strings.TrimSpace(lines[i]) != "```"; i++ {
				code = append(code, lines[i])
			}
			fout.WriteString("<pre><code>" + htmlEscape(strings.Join(code, "\n")) + "</code></pre>\n")
			continue
		}
		buf = append(buf, lines[i])
	}
	flush()
	return fout.String()
}

// mdLiteBlocks renders already-normalized markdown (fences already extracted) paragraph by
// paragraph: headings, lists, marked SVG, and prose.
func mdLiteBlocks(md string) string {
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
		// the per-paragraph data-ai RECORD stays; the visible icon column moved to the
		// unit level (i14, field c14, req-icon-density) - see unitAIColumn.
		attr := ""
		if ai >= 0 {
			attr = ` data-ai="` + string(rune('0'+ai)) + `"`
		}
		switch {
		case strings.HasPrefix(p, "<svg"):
			out.WriteString(p + "\n")
		case strings.HasPrefix(p, "# "):
			out.WriteString("<h2" + attr + ">" + htmlEscape(strings.TrimPrefix(p, "# ")) + "</h2>\n")
		case strings.HasPrefix(p, "## "):
			out.WriteString("<h3" + attr + ">" + htmlEscape(strings.TrimPrefix(p, "## ")) + "</h3>\n")
		case strings.HasPrefix(p, "- "):
			if attr != "" {
				out.WriteString("<div" + attr + ">")
			}
			out.WriteString("<ul>\n")
			for _, li := range strings.Split(p, "\n") {
				out.WriteString("<li>" + mdInline(strings.TrimPrefix(strings.TrimSpace(li), "- ")) + "</li>\n")
			}
			out.WriteString("</ul>\n")
			if attr != "" {
				out.WriteString("</div>\n")
			}
		default:
			out.WriteString("<p" + attr + ">" + mdInline(p) + "</p>\n")
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

// --- README home-chapter renderer ---------------------------------------
// renderReadme projects the project README.md into the book as the home chapter.
// Unlike mdLite (which serves template prose) it handles the full GitHub-flavoured
// surface the README actually uses: headings, tables, blockquotes, raw HTML lines,
// and - critically - it INLINES every referenced image (SVG raw, raster base64) so
// the book stays a single self-contained file. Deterministic: no Date/random.
var (
	reReadmeImg      = regexp.MustCompile(`!\[([^\]]*)\]\(([^)]+)\)`)
	reReadmeLink     = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`)
	reReadmeBold     = regexp.MustCompile(`\*\*([^*]+)\*\*`)
	reReadmeItalicS  = regexp.MustCompile(`\*([^*]+)\*`)
	reReadmeItalicU  = regexp.MustCompile(`_([^_]+)_`)
	reReadmeCode     = regexp.MustCompile("`([^`]+)`")
	reReadmeImgTag   = regexp.MustCompile(`(?i)<img\b[^>]*>`)
	reReadmeSrcAttr  = regexp.MustCompile(`(?i)\bsrc\s*=\s*"([^"]*)"`)
	reReadmeWidthAtt = regexp.MustCompile(`(?i)\bwidth\s*=\s*"([^"]*)"`)
	reReadmeAltAttr  = regexp.MustCompile(`(?i)\balt\s*=\s*"([^"]*)"`)
)

// inlineReadmeImage resolves PATH relative to ROOT and returns self-contained markup:
// SVGs are emitted raw; rasters are base64 data URIs. A missing/unreadable file yields
// a small meta note instead of crashing.
func inlineReadmeImage(path, width, alt string) string {
	if path == "" {
		return ""
	}
	data, err := os.ReadFile(filepath.Join(ROOT, filepath.FromSlash(path)))
	if err != nil {
		return `<span class="meta">image not found: ` + htmlEscape(path) + `</span>`
	}
	ext := strings.ToLower(filepath.Ext(path))
	if ext == ".svg" {
		return string(data) // inline the raw SVG markup directly
	}
	mime := "application/octet-stream"
	switch ext {
	case ".png":
		mime = "image/png"
	case ".jpg", ".jpeg":
		mime = "image/jpeg"
	case ".gif":
		mime = "image/gif"
	case ".webp":
		mime = "image/webp"
	}
	attrs := ""
	if width != "" {
		attrs += ` width="` + htmlEscape(width) + `"`
	}
	if alt != "" {
		attrs += ` alt="` + htmlEscape(alt) + `"`
	}
	return `<img src="data:` + mime + `;base64,` + base64.StdEncoding.EncodeToString(data) + `"` + attrs + ">"
}

func reReadmeGroup(re *regexp.Regexp, s string) string {
	if m := re.FindStringSubmatch(s); len(m) == 2 {
		return m[1]
	}
	return ""
}

// readmeInline processes inline markdown on a text run: escape FIRST, then splice the
// generated tags in (so author text can't inject HTML, but our tags survive).
func readmeInline(s string) string {
	s = htmlEscape(s)
	s = reReadmeImg.ReplaceAllStringFunc(s, func(m string) string {
		g := reReadmeImg.FindStringSubmatch(m)
		return inlineReadmeImage(g[2], "", g[1])
	})
	s = reReadmeCode.ReplaceAllString(s, "<code>$1</code>")
	s = reReadmeLink.ReplaceAllStringFunc(s, func(m string) string {
		g := reReadmeLink.FindStringSubmatch(m)
		label, url := g[1], g[2]
		if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
			return `<a href="` + url + `" target="_blank" rel="noopener">` + label + `</a>`
		}
		return `<a href="` + url + `">` + label + `</a>`
	})
	s = reReadmeBold.ReplaceAllString(s, "<strong>$1</strong>")
	s = reReadmeItalicS.ReplaceAllString(s, "<em>$1</em>")
	s = reReadmeItalicU.ReplaceAllString(s, "<em>$1</em>")
	return s
}

// readmeHTMLLine passes an intentional raw-HTML line through unchanged, EXCEPT it
// replaces every <img> with its inlined (SVG/base64) form, preserving any wrapper.
func readmeHTMLLine(raw string) string {
	return reReadmeImgTag.ReplaceAllStringFunc(strings.TrimSpace(raw), func(tag string) string {
		return inlineReadmeImage(reReadmeGroup(reReadmeSrcAttr, tag), reReadmeGroup(reReadmeWidthAtt, tag), reReadmeGroup(reReadmeAltAttr, tag))
	})
}

func readmeTableRow(t string) bool { return strings.HasPrefix(t, "|") }

func readmeTableSep(t string) bool {
	if !strings.HasPrefix(t, "|") || !strings.Contains(t, "-") {
		return false
	}
	for _, c := range t {
		if c != '|' && c != '-' && c != ':' && c != ' ' {
			return false
		}
	}
	return true
}

func readmeSplitRow(t string) []string {
	t = strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(t), "|"), "|")
	cells := strings.Split(t, "|")
	for i := range cells {
		cells[i] = strings.TrimSpace(cells[i])
	}
	return cells
}

func renderReadme(md string) string {
	lines := strings.Split(strings.ReplaceAll(md, "\r\n", "\n"), "\n")
	var out strings.Builder
	out.WriteString(`<div class="readme" data-layer="informative">` + "\n")
	var para []string
	flush := func() {
		if len(para) == 0 {
			return
		}
		text := strings.TrimSpace(strings.Join(para, " "))
		para = nil
		if text != "" {
			out.WriteString("<p>" + readmeInline(text) + "</p>\n")
		}
	}
	for i := 0; i < len(lines); i++ {
		raw := lines[i]
		t := strings.TrimSpace(raw)
		switch {
		case t == "":
			flush()
		case t == "---" || t == "***" || t == "___":
			flush()
			out.WriteString("<hr>\n")
		case strings.HasPrefix(t, "#"):
			lvl := 0
			for lvl < len(t) && t[lvl] == '#' {
				lvl++
			}
			if lvl >= 1 && lvl <= 6 && lvl < len(t) && t[lvl] == ' ' {
				flush()
				out.WriteString(fmt.Sprintf("<h%d>%s</h%d>\n", lvl, readmeInline(strings.TrimSpace(t[lvl:])), lvl))
			} else {
				para = append(para, raw)
			}
		case strings.HasPrefix(t, ">"):
			flush()
			var q []string
			for i < len(lines) && strings.HasPrefix(strings.TrimSpace(lines[i]), ">") {
				q = append(q, strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(lines[i]), ">")))
				i++
			}
			i--
			out.WriteString("<blockquote>" + readmeInline(strings.TrimSpace(strings.Join(q, " "))) + "</blockquote>\n")
		case strings.HasPrefix(t, "- ") || strings.HasPrefix(t, "* "):
			flush()
			out.WriteString("<ul>\n")
			for i < len(lines) {
				lt := strings.TrimSpace(lines[i])
				if !strings.HasPrefix(lt, "- ") && !strings.HasPrefix(lt, "* ") {
					break
				}
				out.WriteString("<li>" + readmeInline(strings.TrimSpace(lt[2:])) + "</li>\n")
				i++
			}
			i--
			out.WriteString("</ul>\n")
		case readmeTableRow(t) && i+1 < len(lines) && readmeTableSep(strings.TrimSpace(lines[i+1])):
			flush()
			header := readmeSplitRow(t)
			i += 2 // consume header + separator
			out.WriteString(`<table class="q-table"><thead><tr>`)
			for _, h := range header {
				out.WriteString("<th>" + readmeInline(h) + "</th>")
			}
			out.WriteString("</tr></thead><tbody>\n")
			for i < len(lines) && readmeTableRow(strings.TrimSpace(lines[i])) {
				out.WriteString("<tr>")
				for _, c := range readmeSplitRow(strings.TrimSpace(lines[i])) {
					out.WriteString("<td>" + readmeInline(c) + "</td>")
				}
				out.WriteString("</tr>\n")
				i++
			}
			i--
			out.WriteString("</tbody></table>\n")
		case strings.HasPrefix(t, "<"):
			flush()
			out.WriteString(readmeHTMLLine(raw) + "\n")
		default:
			para = append(para, raw)
		}
	}
	flush()
	out.WriteString("</div>\n")
	return out.String()
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
	figSeq = 0 // figure ids restart per render: regeneration stays byte-identical (go-fig-elem-ids)
	sm := StatusMap(nodes)
	bl := latestBless()
	cfg := readProjectConfig()
	root := MerkleRoot(nodes)
	gloss := readGlossary()
	used := map[string][]string{}
	var findings, advisories []string
	// design: go-guide-ch8  implements: req-agent-guide-ch8, req-ch8-audience-subchapters
	// The agent guide is no reader chapter (field c4/c5/c6): agent-mode manifests render
	// INSIDE the guidance chapter, hosted by the agent audience subchapter. Guidance
	// renders ONE subchapter per audience class of the project type, empty ones with an
	// honest no-guide-yet line (the pull law: a guide lands when demand appears).
	var chapters, agentGuides []Node
	guidesByAud := map[string][]Node{} // guide notes route to their audience subchapter (req-example-content)
	for _, n := range nodes {
		if n.Type == "manifest" && (n.Mode == "chapter" || n.Mode == "guidance") {
			chapters = append(chapters, n)
		}
		if n.Type == "manifest" && n.Mode == "agent" {
			agentGuides = append(agentGuides, n)
		}
		if n.Type == "guide" {
			aud := basePropsOf(n.Path).scalars["audience"]
			guidesByAud[aud] = append(guidesByAud[aud], n)
		}
	}
	for aud := range guidesByAud {
		gs := guidesByAud[aud]
		for i := 1; i < len(gs); i++ {
			for j := i; j > 0 && gs[j].ID < gs[j-1].ID; j-- {
				gs[j], gs[j-1] = gs[j-1], gs[j]
			}
		}
	}
	for i := 1; i < len(agentGuides); i++ {
		for j := i; j > 0 && agentGuides[j].ID < agentGuides[j-1].ID; j-- {
			agentGuides[j], agentGuides[j-1] = agentGuides[j-1], agentGuides[j]
		}
	}
	hasGuidance := false
	for _, ch := range chapters {
		if ch.Mode == "guidance" {
			hasGuidance = true
		}
	}
	if !hasGuidance {
		// no guidance chapter to host it: the agent guide stays a chapter rather than
		// silently vanishing (fail-safe)
		chapters = append(chapters, agentGuides...)
		agentGuides = nil
	}
	guideClasses := typeClassSlugs(readProjectConfig().Type)
	if len(guideClasses) == 0 {
		guideClasses = typeClassSlugs("default")
	}
	// enddesign
	// chapters sort by explicit Order, then id (req-system-overview): the trace chapter
	// (man-sys-overview) declares an order slot BEFORE design input; a manifest with no
	// order keeps the old id sort by falling to the tie-break.
	for i := 1; i < len(chapters); i++ {
		for j := i; j > 0 && (chapters[j].Order < chapters[j-1].Order || (chapters[j].Order == chapters[j-1].Order && chapters[j].ID < chapters[j-1].ID)); j-- {
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
	var deferredQ []baseDeferred // referenced-queries await the complete link graph
	// the shell's TOC data: one entry per chapter, one link per unit heading (req-book-shell)
	type tocSec struct{ anchor, title string }
	type tocEntry struct {
		id, title string
		num       int // chapter number (req-sidebar-order): 0 = back-matter, unnumbered
		secs      []tocSec
	}
	var toc []tocEntry
	var body strings.Builder
	renderChapterUnit := func(chb *strings.Builder, chID string, idx int, u ManifestUnit) {
		anchor := chID + "-u" + itoa(idx+1)
		if u.Ref != "" {
			chb.WriteString(renderNodeAtDepth(u.Ref, u.Depth, nodes, sm, bl, anchor))
		} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
			// design: go-fig-fullscreen  implements: req-fig-fullscreen
			// Every chapter figure wraps with the ⛶ button (owner ruling 2026-07-09): a click
			// flips the fig-full class on THIS existing element (a fixed-inset modal), Escape
			// closes, and the embedded graphs refit on toggle - the script creates nothing.
			if msg, retired := retiredFigKinds[m[1]]; retired {
				findings = append(findings, "fig kind '"+m[1]+"' retired "+msg)
			} else {
				chb.WriteString(`<figure id="` + anchor + `" data-layer="figure">` + "\n" +
					`<button type="button" class="fig-fs" data-figfs title="fullscreen (Esc closes)">⛶</button>` + "\n" +
					renderFigure(m[1], nodes) + "\n</figure>\n")
			}
			// enddesign
		} else {
			layer := "informative"
			if idx == 0 {
				layer = "lede"
			}
			if !proseUnitsMarked(u.Body) {
				findings = append(findings, "chapter "+chID+" unit "+itoa(idx+1)+" carries unmarked prose - no unmarked path into the book (req-ai-drafting)")
			}
			ub := renderUnitBody(u.Body, nodes, aliasIdx, &findings, &deferredQ, sm, bl, anchor)
			chb.WriteString(`<div id="` + anchor + `" data-layer="` + layer + `" class="unit marked` + shortUnitClass(ub) + `">` + "\n" + unitAIColumn(ub) + ub + "</div>\n")
		}
	}
	chNum := 0
	for _, ch := range chapters {
		raw := manifestBody(ch.Path)
		units := parseManifestUnits(raw)
		chNum++
		ent := tocEntry{id: ch.ID, title: ch.Statement, num: chNum}
		for idx, u := range units {
			if u.Body == "" {
				continue
			}
			for _, ln := range strings.Split(stripFillComments(u.Body), "\n") {
				t := strings.TrimSpace(ln)
				if strings.HasPrefix(t, "## ") {
					ent.secs = append(ent.secs, tocSec{anchor: ch.ID + "-u" + itoa(idx+1), title: strings.TrimPrefix(t, "## ")})
					break
				}
				if t != "" && !strings.HasPrefix(t, "<") {
					break // the unit opens with prose, not a heading
				}
			}
		}
		if ch.Mode == "guidance" {
			for _, cl := range guideClasses {
				ent.secs = append(ent.secs, tocSec{anchor: "man-ch8-aud-" + cl, title: "Guide — " + cl})
			}
		}
		toc = append(toc, ent)
		if len(units) == 0 || units[0].Ref != "" {
			findings = append(findings, "chapter "+ch.ID+" does not open with its lede (req-chapter-tldr)")
		}
		// sorted: presetOf accumulates in map order - unsorted, a chapter in TWO presets
		// flips its class order between renders and breaks same-state-same-bytes
		pcs := append([]string{}, presetOf[ch.ID]...)
		sortStrings(pcs)
		classes := ""
		for _, p := range pcs {
			classes += " in-" + p
		}
		var chb strings.Builder
		chb.WriteString(`<article id="` + htmlEscape(ch.ID) + `" class="ch` + htmlEscape(classes) + `">` + "\n<h1>" + itoa(chNum) + ". " + htmlEscape(ch.Statement) + "</h1>\n")
		for idx, u := range units {
			renderChapterUnit(&chb, ch.ID, idx, u)
		}
		if ch.Mode == "guidance" {
			// the audience subchapters (req-ch8-audience-subchapters), agent class
			// hosting the relocated agent guide (req-agent-guide-ch8)
			for _, cl := range guideClasses {
				chb.WriteString(`<section id="man-ch8-aud-` + htmlEscape(cl) + `" class="unit" data-layer="informative"><h2>Guide — ` + htmlEscape(cl) + `</h2>` + "\n")
				if cl == "agent" && len(agentGuides) > 0 {
					for _, ag := range agentGuides {
						chb.WriteString(`<div id="` + htmlEscape(ag.ID) + `"><h3>` + htmlEscape(ag.Statement) + "</h3>\n")
						for aidx, au := range parseManifestUnits(manifestBody(ag.Path)) {
							renderChapterUnit(&chb, ag.ID, aidx, au)
						}
						chb.WriteString("</div>\n")
					}
				} else if gs := guidesByAud[cl]; len(gs) > 0 {
					// guide notes for this audience render here (req-example-content): a marked
					// example ships per empty view so the author sees the shape and deletes it.
					for _, g := range gs {
						chb.WriteString(`<div id="` + htmlEscape(g.ID) + `"><p class="stmt"><strong>` + htmlEscape(g.Statement) + `</strong></p>` + "\n")
						if body := nodeBodyProse(g.Path); body != "" {
							chb.WriteString(`<div data-layer="informative">` + mdLite(body) + "</div>\n")
						}
						chb.WriteString("</div>\n")
					}
				} else {
					chb.WriteString(`<p class="meta">no guide yet — one lands the day this audience asks.</p>` + "\n")
				}
				chb.WriteString("</section>\n")
			}
		}
		chb.WriteString("</article>\n")
		body.WriteString(refTooltips(expandTermLinks(ch.ID, chb.String(), gloss, used, &findings), nodes, gloss))
		advisories = append(advisories, unlinkedTermAdvisories(ch.ID, raw, gloss)...)
	}
	chaptersHTML := body.String() // usage referent for the pull law (go-ch2-derived)
	if g := renderGlossaryChapter(gloss, used); g != "" {
		// splice the glossary in at the END of ch3 (design input), not as its own
		// back-matter chapter, and drop the standalone toc entry (owner review c13). The
		// splice happens now - after the chapter loop - so `used` is complete across the book.
		full := body.String()
		if i := strings.Index(full, `id="man-ch3-design-input"`); i >= 0 {
			if e := strings.Index(full[i:], "</article>\n"); e >= 0 {
				at := i + e // just before ch3's closing </article>
				body.Reset()
				body.WriteString(full[:at])
				body.WriteString(g)
				body.WriteString(full[at:])
			} else {
				body.WriteString(g)
			}
		} else {
			body.WriteString(g)
		}
	}
	body.WriteString(renderNotationList(gloss, used))
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
		// the deck stays OUT of the reading flow (owner c7/c12): no inline title or present button
		// here - it is reachable only from the views' present button. The article sits off-screen
		// (CSS), and present mode lifts the current slide to fullscreen via position:fixed.
		body.WriteString(`<article class="deck" id="` + htmlEscape(dk.ID) + `" aria-hidden="true">` + "\n")
		for idx, u := range parseManifestUnits(manifestBody(dk.Path)) {
			body.WriteString(`<section class="slide" id="` + htmlEscape(dk.ID) + `-s` + itoa(idx+1) + `">` + "\n")
			if u.Ref != "" {
				body.WriteString(renderNodeAtDepth(u.Ref, 1, nodes, sm, bl, dk.ID+"-s"+itoa(idx+1)+"-n"))
			} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
				if msg, retired := retiredFigKinds[m[1]]; retired {
					findings = append(findings, "fig kind '"+m[1]+"' retired "+msg)
				} else {
					body.WriteString(renderFigure(m[1], nodes))
				}
			} else {
				if !proseUnitsMarked(u.Body) {
					findings = append(findings, "deck "+dk.ID+" slide "+itoa(idx+1)+" carries unmarked prose (req-ai-drafting)")
				}
				body.WriteString(renderUnitBody(u.Body, nodes, aliasIdx, &findings, &deferredQ, sm, bl, dk.ID+"-s"+itoa(idx+1)))
			}
			if u.Notes != "" {
				body.WriteString(`<aside class="notes">` + htmlEscape(u.Notes) + "</aside>\n")
			}
			body.WriteString("</section>\n")
		}
		body.WriteString("</article>\n")
		// NO toc entry (owner 2026-07-09): the deck is out of the reading flow entirely -
		// the details pane's deck list is its one entry point
	}
	// enddesign
	// design: go-book-shell  implements: req-book-shell, req-sidebar-order, req-section-paging, req-search-hitlist, req-deck-views-section, req-details-pane
	// The mdbook-style shell (owner ruling 2026-07-07): one fixed sidebar carries the whole
	// apparatus - the chapter TOC (collected above, static DOM), the GLOBAL search, the view
	// presets, the facet counts, ONE hand-editable filter expression every control compiles
	// into, and the DETAILS PANE - an always-visible bar at the sidebar bottom that expands
	// UPWARD over the sidebar as the one context-help surface (window.bookDetail fills it for
	// a clicked term, link, filter, search, or graph node), hosts the views and the baseline
	// hash, and collapses back to a bar. The content column stays
	// clean. The report's visual language carries over (#fafafa chrome, white panels, the
	// uppercase small labels, the ▸/▾ disclosure trees). The script stays toggle-only.
	var doc strings.Builder
	doc.WriteString("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n")
	doc.WriteString("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n")
	doc.WriteString("<title>" + htmlEscape(brand()) + " — the spec book</title>\n")
	doc.WriteString("<style>*{box-sizing:border-box}body{font-family:system-ui,Segoe UI,sans-serif;margin:0;line-height:1.5;color:" + bookColors["text"] + ";background:" + bookColors["bg"] + ";display:flex}" +
		"#sidebar{width:300px;flex:none;height:100vh;position:sticky;top:0;overflow:auto;background:#fafafa;border-right:1px solid #e3e3e3;padding:14px 16px;display:flex;flex-direction:column;gap:10px}" +
		".sb-brand{font-weight:600;font-size:15px;margin:0;cursor:pointer;background:none;border:0;padding:0;text-align:left;font-family:inherit;color:inherit}" +
		"#book-info dl{margin:4px 0;display:grid;grid-template-columns:64px 1fr;gap:2px 8px;font-size:11px}#book-info dt{color:#999}#book-info dd{margin:0;font-family:ui-monospace,Consolas,monospace;word-break:break-all}" +
		".sb-h{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#7d7d7d;margin:8px 0 2px}" +
		"#sidebar input{width:100%;padding:5px 8px;border:1px solid #ddd;border-radius:5px;font:inherit;font-size:13px;background:" + bookColors["bg"] + "}" +
		"#toc{font-size:13px}#toc details{margin:1px 0}#toc summary{list-style:none;cursor:pointer;padding:3px 6px;border-radius:4px;display:flex;gap:6px;align-items:baseline}" +
		"#toc summary::-webkit-details-marker{display:none}#toc summary:before{content:\"▸\";font-size:10px;color:#bcc6d6;flex:none}#toc details[open]>summary:before{content:\"▾\"}" +
		"#toc summary:hover,#toc a:hover{background:#f0f0f0}#toc a{display:block;color:#333;text-decoration:none;padding:2px 6px;border-radius:4px}" +
		"#toc .toc-sec{padding-left:22px;font-size:12px;color:#555}#toc .off{color:#bbb}" +
		"#toc .toc-num{display:inline-block;min-width:1.1em;color:#8a93a3;font-variant-numeric:tabular-nums}" +
		"#views>summary{cursor:pointer;list-style:none}#views>summary::-webkit-details-marker{display:none}#views>summary:before{content:\"▸ \";font-size:10px;color:#bcc6d6}#views[open]>summary:before{content:\"▾ \"}" +
		"#filters button{font:inherit;font-size:12px;margin:0 4px 4px 0;padding:3px 9px;border:1px solid #ddd;border-radius:12px;background:" + bookColors["bg"] + ";cursor:pointer}" +
		"#filters button:hover{background:#f0f0f0}" +
		// context-help pane: an always-visible bottom overlay inside the (sticky) sidebar.
		// sidebar is already position:sticky, which is a valid containing block for the
		// absolute pane AND keeps it pinned to the viewport bottom (the point of the pane).
		"#details.dpane{position:absolute;left:0;right:0;bottom:0;z-index:6;background:#fafafa;border-top:1px solid #d8d8d8;box-shadow:0 -4px 10px rgba(0,0,0,.06)}" +
		"#dpane-bar{width:100%;text-align:left;font:inherit;font-size:12px;font-weight:600;color:#555;background:#f0f0f0;border:0;border-top:1px solid #ddd;padding:5px 12px;cursor:pointer}" +
		"#dpane-body{max-height:60vh;overflow:auto;padding:6px 12px}" +
		"#details.collapsed #dpane-body{display:none}" +
		"#dpane-caret{float:right;transition:transform .1s}#details.collapsed #dpane-caret{transform:rotate(180deg)}" +
		".dh{font-weight:600;margin-bottom:3px}" +
		"#toc{padding-bottom:2.2rem}" +
		"#page{flex:1;min-width:0}#page>header{padding:10px 20px;background:#fafafa;border-bottom:1px solid #e3e3e3}" +
		"main{max-width:1040px;margin:0 auto;padding:1rem 2rem 3rem 4rem}" +
		".ref-tip{display:inline-block;font-size:.7em;vertical-align:super;background:#e8eef7;color:#365f8a;border-radius:50%;width:1.4em;height:1.4em;line-height:1.4em;text-align:center;text-decoration:none;margin-left:2px}.ref-tip:hover{background:#d5e2f3}" +
		".termref{border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;border-bottom:1px dashed #9aa4b2;cursor:help}.termref:hover{border-bottom-color:#2762c4;color:#2762c4}" +
		".q-table{border-collapse:collapse;margin:.6rem 0;font-size:.85rem;width:100%}.q-table caption{text-align:left;font-weight:600;padding:2px 0}" +
		".q-table thead th{background:#f4f4f4;text-align:left;padding:5px 8px;border:1px solid #e3e3e3}" +
		".q-table td{padding:5px 8px;border:1px solid #ececec;vertical-align:top}.q-table tr.group th{background:#fafafa;text-align:left;padding:5px 8px;border:1px solid #e3e3e3}" +
		"tr.qt-exp>td:first-child{cursor:pointer}tr.qt-detail>td{background:#fbfbfe;border-top:0}" +
		/* unified reader table */
		".utable{margin:.7rem 0}.utable-cap{font-weight:600;margin:.2rem 0}" +
		".upills{display:flex;flex-wrap:wrap;gap:5px;margin:.3rem 0}" +
		".upill{font:inherit;font-size:.75rem;padding:2px 10px;border:1px solid #d5d5d5;border-radius:13px;background:#fff;cursor:pointer;color:#555}.upill.on{background:#2762c4;border-color:#2762c4;color:#fff}.upill.on .meta{color:#dbe6fa}" +
		".pilllbl{font-size:.72rem;color:#999;margin-right:2px;align-self:center}" +
		".u-table{width:100%;border-collapse:collapse}.u-table thead th{background:#fafafa;font-size:.75rem;font-weight:600;color:#888;text-align:left;padding:4px 8px;border:0;border-bottom:2px solid #e3e3e3}" +
		".u-table tr.urow>td{padding:5px 8px 5px 6px;border:0;border-bottom:1px solid #eee;cursor:pointer;vertical-align:top}.u-table tr.urow:hover>td{background:#f6f8fb}.u-table td.ubrief{color:#555;font-size:.85rem}" +
		".utri{display:inline-block;width:.8em;color:#9aa4b2;transition:transform .1s}.utri:before{content:\"\\25B8\"}tr.urow.open .utri{transform:rotate(90deg)}" +
		".u-table tr.udetail>td{padding:2px 8px 10px 24px;border:0;border-bottom:1px solid #eee;background:#fbfbfe}.u-table .ufield{margin:.15rem 0;font-size:.85rem}.ufl{color:#8a93a3}" +
		".ucontrols{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;align-items:center;margin:.3rem 0;font-size:.8rem}" +
		".ucontrols button{font:inherit;font-size:.75rem;padding:2px 8px;border:1px solid #ddd;border-radius:5px;background:#fff;cursor:pointer}.ucontrols button:hover{background:#f0f0f0}" +
		".ucontrols input,.ucontrols select{font:inherit;font-size:.78rem;padding:2px 6px;border:1px solid #ddd;border-radius:5px}.qt-pos{color:#555;min-width:8ch;text-align:center;display:inline-block}" +
		".onion .oview[hidden]{display:none}.onion [data-onion-go]{cursor:pointer}.onion-flow{overflow-x:auto;max-width:100%}.onion-flow svg{display:block}.onion svg{cursor:grab;touch-action:none;max-width:100%}.onion a[data-node-link]{cursor:pointer}" +
		".ograph{height:640px;border:1px solid #e3e3e3;border-radius:6px;background:#fff}figure.fig-full .ograph{height:calc(100vh - 150px)}.ograph .og-fallback{padding:1rem}" +
		"figure[data-layer=\"figure\"]{position:relative;margin:1rem 0}.fig-fs{position:absolute;top:4px;right:4px;z-index:2;font:inherit;font-size:13px;padding:2px 8px;border:1px solid #d5d5d5;border-radius:6px;background:#fff;cursor:pointer;opacity:.55}.fig-fs:hover{opacity:1}" +
		"figure.fig-full{position:fixed;inset:0;z-index:50;background:#fff;overflow:auto;margin:0;padding:26px;box-shadow:0 0 0 100vmax rgba(0,0,0,.35)}figure.fig-full svg{max-height:92vh}" +
		".onion-infra{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:.3rem 0;font-size:.78rem}.onion-infra .il{color:#888;margin-right:4px}.onion-infra button{font:inherit;font-size:.75rem;padding:2px 9px;border:1px solid #d5d5d5;border-radius:12px;background:#fff;cursor:pointer}" +
		".tgraph #graph{height:675px;border:1px solid #e3e3e3;border-radius:6px;background:#fff}" +
		".tgraph .tabbar{display:flex;flex-wrap:wrap;gap:4px;margin:.4rem 0}.tgraph .tab{font:inherit;font-size:.78rem;padding:3px 9px;border:1px solid #ddd;border-radius:12px;background:#fff;cursor:pointer}.tgraph .tab.active{background:#eaf0fb;border-color:#9db6e0}" +
		".tgraph .legendrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:.3rem 0;font-size:.8rem}.tgraph .legend{display:flex;flex-wrap:wrap;gap:8px}.tgraph .lg{display:flex;align-items:center;gap:3px;cursor:pointer}" +
		".tgraph .sw{width:11px;height:11px;border-radius:3px;display:inline-block}.tgraph .sw.need{background:#ffe0b2}.tgraph .sw.usecase{background:#fff3b0}.tgraph .sw.requirement{background:#cfe3fb}.tgraph .sw.design{background:#cdeccd}.tgraph .sw.test{background:#e9d5f3}.tgraph .sw.adr{background:#d7ccc8}" +
		".tgraph #trace-filter{flex:1;min-width:120px;padding:3px 8px;border:1px solid #ddd;border-radius:5px;font:inherit;font-size:.8rem}.tgraph #filter-clear{border:1px solid #ddd;border-radius:5px;background:#fff;cursor:pointer}.tgraph #detail{display:none}" +
		".crumbs{font-size:.85rem;margin:.3rem 0;color:#555}.crumbs button{background:none;border:none;color:#2762c4;cursor:pointer;padding:0;font:inherit;text-decoration:underline}" +
		"article.ch.pg-hide{display:none}" +
		"@media print{article.ch.pg-hide{display:block}}" +
		".meta{font-size:.8rem;color:" + bookColors["meta"] + "}.stmt{margin-bottom:.2rem}.missing{color:#b00}" +
		".marked{position:relative}.ai-marks{position:absolute;left:-1.6rem;top:.15rem;display:flex;flex-direction:column;gap:2px}" +
		".qpad-short{padding-bottom:2.2rem}" +
		".ucfn-cols{display:flex;gap:2rem;padding:.4rem 0 .4rem 1rem}.ucfn-cols h4{margin:.2rem 0;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:#7d7d7d}.ucfn-cols ul{margin:.2rem 0;padding-left:1.1rem}" +
		".state-suspect{color:" + bookColors["suspect"] + "}.state-ok{color:#1c7c33}" +
		"aside.notes{display:none;border-left:3px solid #ccc;padding-left:.6rem;font-size:.85rem}" +
		"article.deck{position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden}" +
		"body[data-present] .slide{display:none}body[data-present] .slide.current{display:block;position:fixed;inset:0;background:" + bookColors["bg"] + ";padding:8vh 10vw;overflow:auto;z-index:9}" +
		"@media(max-width:900px){body{flex-direction:column}#sidebar{position:static;width:auto;height:auto}}" +
		"@media print{aside.notes{display:block}.slide{page-break-after:always}#sidebar{display:none}}" +
		"::highlight(quack-comments){background:#ffdf80}" +
		"::highlight(book-hits){background:#ffff00}" +
		"#search-nav{white-space:nowrap}#hits-pos{font-size:.8rem;color:#555;margin:0 4px}" +
		"#search-nav button{font:inherit;font-size:11px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;padding:1px 7px}" +
		"#quack-sb{position:fixed;right:0;top:0;height:100vh;width:280px;background:#fffdf6;border-left:1px solid #e4dcc6;overflow:auto;padding:10px;font-size:13px;z-index:8;box-sizing:border-box}" +
		"body[data-qc=\"min\"] #quack-sb{display:none}#quack-sb .qc-head{display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-bottom:6px}" +
		".qc-card{border:1px solid #e8e2d0;border-radius:6px;padding:6px;margin:6px 0;background:#fff}.qc-closed{opacity:.55}" +
		".qc-quote{font-style:italic;color:#555;cursor:pointer;margin-bottom:4px}.qc-msg{margin:2px 0}.qc-suggest{color:#365f8a;margin:2px 0}" +
		".qc-mark{display:inline-block;width:1em;margin-right:4px}.qc-mark.agree{color:#2a8a4a}.qc-mark.reject{color:#b33}" +
		".qc-row{display:flex;gap:4px;margin-top:4px}.qc-inp{flex:1;min-width:0}" +
		"#quack-fab{position:absolute;z-index:9}#quack-sb-toggle{position:fixed;right:12px;bottom:12px;z-index:9;border-radius:14px;padding:4px 10px}" +
		"#qc-name{width:100%;box-sizing:border-box;margin-bottom:6px;font:inherit;font-size:12px;padding:3px 6px}" +
		"textarea.qc-inp{width:100%;box-sizing:border-box;font:inherit;font-size:12px;margin-top:4px}" +
		"#qc-toast{position:fixed;left:12px;bottom:12px;z-index:10;background:#2d3a2f;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;max-width:60ch}" +
		"@media print{#quack-sb,#quack-sb-toggle,#quack-fab{display:none}}" +
		".readme img,.readme svg{max-width:100%;height:auto;display:block;margin:.6rem auto}.readme blockquote{border-left:3px solid #dcdcdc;margin:.6rem 0;padding:.2rem .9rem;color:#555}.readme h1{margin-top:.2rem}.readme table{margin:.8rem 0}" + facetFilterCSS() + "</style>\n")
	doc.WriteString("</head><body data-paged=\"1\">\n")
	doc.WriteString(`<nav id="sidebar" aria-label="views">` + "\n")
	doc.WriteString(`<button class="sb-brand" id="book-title" title="click for book info">` + htmlEscape(brand()) + ` — the spec book</button>` + "\n")
	doc.WriteString(bookTitleCardHTML(root, cfg.Version, version))
	// sidebar order (field c3, req-sidebar-order): search, filter expression,
	// collapsible views, then the toc.
	doc.WriteString(`<input id="search" type="search" placeholder="search the whole book">` + "\n")
	// inline match nav (owner c5, req-search-hitlist): prev / counter / next on one line,
	// the script steps a single highlighted match - no hit list, never created content.
	doc.WriteString(`<span id="search-nav" hidden><button id="hits-prev" aria-label="previous match">&lsaquo;</button><span id="hits-pos"></span><button id="hits-next" aria-label="next match">&rsaquo;</button></span>` + "\n")
	// filter is one line; help opens in the details pane on focus/click (owner c6)
	doc.WriteString(`<input id="filter-expr" type="text" placeholder="filter: preset:… phase:… text" title="tokens: preset:<name> phase:<v> discipline:<v> quality:<v> state:<suspect|verified> - anything else filters as text">` + "\n")
	doc.WriteString(`<p class="sb-h">contents</p><div id="toc">` + "\n")
	for _, e := range toc {
		// the chapter number leads its toc entry (req-sidebar-order); back-matter (num 0) stays bare
		numPfx := ""
		if e.num > 0 {
			numPfx = `<span class="toc-num">` + itoa(e.num) + `</span> `
		}
		if len(e.secs) == 0 {
			doc.WriteString(`<a href="#` + htmlEscape(e.id) + `" data-ch="` + htmlEscape(e.id) + `">` + numPfx + htmlEscape(e.title) + `</a>` + "\n")
			continue
		}
		doc.WriteString(`<details><summary><a href="#` + htmlEscape(e.id) + `" data-ch="` + htmlEscape(e.id) + `">` + numPfx + htmlEscape(e.title) + `</a></summary>` + "\n")
		for _, s := range e.secs {
			doc.WriteString(`<a class="toc-sec" href="#` + htmlEscape(s.anchor) + `">` + htmlEscape(s.title) + `</a>` + "\n")
		}
		doc.WriteString("</details>\n")
	}
	doc.WriteString("</div>\n")
	// context-help pane (field: always-visible bottom overlay): the views block now lives
	// here, keeping the SAME #filters/#expand-all/#deck-list/.present ids the script wires.
	// window.bookDetail fills #dpane-content on demand; the baseline hash anchors the bottom.
	doc.WriteString(`<div id="details" class="dpane collapsed"><button id="dpane-bar" type="button">Details <span id="dpane-caret">▴</span></button><div id="dpane-body"><div id="dpane-content"><p class="meta">Click a term, link, filter, or a graph node to see details here.</p></div><div id="dpane-views"><p class="sb-h">views</p>`)
	doc.WriteString(`<div id="filters"><button data-view="">all</button>`)
	for _, p := range presetIDs {
		doc.WriteString(`<button data-view="` + htmlEscape(p) + `">` + htmlEscape(strings.TrimPrefix(p, "man-preset-")) + `</button>`)
	}
	doc.WriteString(`<button id="expand-all">expand all</button></div>`)
	// slide decks are a TYPE of view (field c44, req-deck-views-section): the views
	// section lists them; the shared present buttons drive the existing deck mode.
	if len(decks) > 0 {
		doc.WriteString(`<p class="sb-h">slide-decks</p><div id="deck-list">`)
		for _, dk := range decks {
			doc.WriteString(`<button class="present" data-deck="` + htmlEscape(dk.ID) + `">` + htmlEscape(strings.TrimPrefix(dk.ID, "man-deck-")) + `</button>`)
		}
		doc.WriteString(`</div>`)
	}
	doc.WriteString(`</div><p class="sb-h">baseline</p><p class="meta dpane-hash">&#9741; ` + htmlEscape(root[:12]) + `</p></div></div>` + "\n")
	doc.WriteString("</nav>\n")
	doc.WriteString(`<div id="page">` + "\n")
	// one page per top-level section (field c7, req-section-paging, adr-section-paging):
	// the top header bar is gone (owner c1); paging flows through the toc, hash and arrow keys.
	doc.WriteString("<main>\n")
	// enddesign
	bodyHTML := body.String()
	if len(deferredQ) > 0 {
		// the pull law as data: the link graph over the RENDERED chapters feeds the
		// deferred referenced-queries (same referent the derived lists always used).
		usedSet := map[string]bool{}
		for s := range used {
			usedSet[s] = true
		}
		for _, kind := range []string{"references", "fundamentals", "methods"} {
			for _, c := range usedContentSlugs(kind, chaptersHTML) {
				usedSet[c.Slug] = true
			}
		}
		for _, d := range deferredQ {
			bodyHTML = strings.Replace(bodyHTML, d.token, renderBaseHTML(d.text, d.view, nodes, &findings, usedSet, sm, bl, d.anchor), 1)
		}
	}
	doc.WriteString(bodyHTML)
	doc.WriteString(`</main>
</div>
<script>/* filters and toggles only - this script never creates content (go-book-shell) */
(function(){
 var b=document.body,fe=document.getElementById('filter-expr'),se=document.getElementById('search');
 function setTok(key,val,toggle){var t=(fe.value||'').split(/\s+/).filter(function(x){return x&&x.indexOf(key+':')!==0;});
  var had=(fe.value||'').split(/\s+/).indexOf(key+':'+val)>=0;
  if(val&&!(toggle&&had))t.push(key+':'+val);fe.value=t.join(' ');apply();}
 function apply(){
  var toks=(fe.value||'').trim().split(/\s+/).filter(Boolean),preset='',state='',facets=[],words=[];
  toks.forEach(function(t){var i=t.indexOf(':'),k=i<0?'':t.slice(0,i),v=t.slice(i+1);
   if(k==='preset')preset=v;else if(k==='state')state=v;
   else if(k==='phase'||k==='discipline'||k==='quality')facets.push('f-'+k+'-'+v);
   else words.push(t.toLowerCase());});
  document.querySelectorAll('article.ch').forEach(function(a){
   var hid=(preset!=='')&&!a.classList.contains('in-man-preset-'+preset);
   if(!hid&&words.length){var txt=a.textContent.toLowerCase();
    words.forEach(function(w){if(txt.indexOf(w)<0)hid=true;});}
   a.hidden=hid;});
  document.querySelectorAll('main section[data-node]').forEach(function(s){
   var hid=false;
   if(state&&s.getAttribute('data-state')!==state)hid=true;
   if(!hid&&words.length){var txt=s.textContent.toLowerCase();
    words.forEach(function(w){if(txt.indexOf(w)<0)hid=true;});}
   s.hidden=hid;});
  document.querySelectorAll('tr.rowf').forEach(function(r){
   var ok=facets.every(function(f){return r.classList.contains(f);});
   r.hidden=facets.length>0&&!ok;});
  document.querySelectorAll('#toc a[data-ch]').forEach(function(l){
   var a=document.getElementById(l.getAttribute('data-ch'));
   l.classList.toggle('off',!!(a&&a.hidden));});}
 if(fe)fe.addEventListener('input',apply);
 /* filter help opens in the details pane (owner c6): chrome, not book content */
 if(fe){var fhelp=function(){window.bookDetail('Filter','<div class=meta>Filter the book as you type.</div><div class=meta><b>preset:</b>&lt;name&gt; · <b>phase:</b>&lt;v&gt; · <b>discipline:</b>&lt;v&gt; · <b>quality:</b>&lt;v&gt; · <b>state:</b>suspect|verified</div><div class=meta>Anything else filters as text. Combine with spaces.</div>');};
  fe.addEventListener('focus',fhelp);fe.addEventListener('click',fhelp);}
 /* search -> inline match nav (owner c5, req-search-hitlist): step one match at a time,
    ALL occurrences paint full yellow via the Highlight API */
 var hits=[],hcur=0,
     snav=document.getElementById('search-nav'),hpos=document.getElementById('hits-pos');
 function collectHits(q){hits=[];if(!q)return;
  var m=document.querySelector('main');if(!m)return;
  var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT),n,lq=q.toLowerCase();
  while((n=w.nextNode())){var lt=n.textContent.toLowerCase(),i=0;
   while((i=lt.indexOf(lq,i))>=0){hits.push({node:n,start:i,len:q.length});i+=q.length;
    if(hits.length>=2000)return;}}}
 function paintHits(){if(!('highlights' in CSS))return;
  var h=new Highlight();
  hits.forEach(function(x){var r=document.createRange();
   try{r.setStart(x.node,x.start);r.setEnd(x.node,x.start+x.len);h.add(r);}catch(e){}});
  CSS.highlights.set('book-hits',h);}
 function updateNav(){if(snav)snav.hidden=hits.length===0;
  if(hpos)hpos.textContent=hits.length?(hcur+1)+'/'+hits.length:'';}
 function goHit(i){var x=hits[i];if(!x)return;
  var host=x.node.parentElement;if(window.bookPageTo)window.bookPageTo(host);
  var r=document.createRange();
  try{r.setStart(x.node,x.start);r.setEnd(x.node,x.start+x.len);
   var rect=r.getBoundingClientRect();
   window.scrollTo({top:rect.top+window.scrollY-window.innerHeight/3});}catch(e){host.scrollIntoView();}}
 function stepHit(d){if(!hits.length)return;hcur=(hcur+d+hits.length)%hits.length;updateNav();goHit(hcur);}
 var hprev=document.getElementById('hits-prev'),hnext=document.getElementById('hits-next');
 if(hprev)hprev.addEventListener('click',function(){stepHit(-1);});
 if(hnext)hnext.addEventListener('click',function(){stepHit(1);});
 if(se)se.addEventListener('input',function(){collectHits((se.value||'').trim());paintHits();hcur=0;updateNav();if(hits.length)goHit(0);});
 document.querySelectorAll('#filters button[data-view]').forEach(function(btn){btn.addEventListener('click',function(){
  setTok('preset',btn.getAttribute('data-view').replace(/^man-preset-/,''),true);});});
 document.querySelectorAll('button.facet-count').forEach(function(btn){btn.addEventListener('click',function(){
  var t=btn.getAttribute('data-target')||'',m=t.match(/^f-([a-z]+)-(.+)$/);
  if(m)setTok(m[1],m[2],true);});});
 /* a disclosure's until-found content unhides on open (field c24: expand rendered nothing) */
 document.querySelectorAll('details.disc').forEach(function(d){d.addEventListener('toggle',function(){
  if(d.open)Array.prototype.forEach.call(d.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');});});});
 var xa=document.getElementById('expand-all');
 if(xa){xa.addEventListener('click',function(){var open=b.getAttribute('data-expanded')!=='1';b.setAttribute('data-expanded',open?'1':'0');
  document.querySelectorAll('details.disc').forEach(function(d){d.open=open;});});}
 /* the ONE entry point that shows context help. This pane is chrome, not book content,
    so filling it with markup is acceptable (as the old card was) - escaping is the caller's job. */
 window.bookDetail=function(title,html){var c=document.getElementById('dpane-content');if(!c)return;c.innerHTML='<div class="dh">'+(title||'')+'</div>'+(html||'');document.getElementById('details').classList.remove('collapsed');};
 var dbar=document.getElementById('dpane-bar');
 if(dbar)dbar.addEventListener('click',function(){var dp=document.getElementById('details');if(dp)dp.classList.toggle('collapsed');});
 var dmain=document.querySelector('main');
 if(dmain)dmain.addEventListener('click',function(e){
  var s=e.target.closest('section[data-node]');if(!s)return;
  var st=s.querySelector('.stmt');
  window.bookDetail(s.getAttribute('data-node')||'','<div class=meta>'+(s.getAttribute('data-type')||'')+' · '+(s.getAttribute('data-state')||'')+'</div>'+(st?('<p>'+st.textContent+'</p>'):''));});
 document.addEventListener('click',function(e){var t=e.target.closest?e.target.closest('.termref'):null;if(!t)return;e.preventDefault();var goto=t.getAttribute('data-goto'),help=t.getAttribute('data-help')||'';var link=goto?('<a href="#'+goto+'">open the full entry &#8599;</a>'):'';window.bookDetail(t.getAttribute('data-title')||t.textContent,'<p>'+help+'</p>'+link);});
 var bt=document.getElementById('book-title'),bi=document.getElementById('book-info');
 if(bt&&bi)bt.addEventListener('click',function(){bi.hidden=!bi.hidden;});
 /* unified reader table (owner review 2026-07-08): each .upills row is a filter facet (AND
    across facets, OR within one), the controls below the table filter and paginate the visible
    set, a row toggles its detail. The script only ever toggles visibility - never creates content. */
 document.querySelectorAll('.utable').forEach(function(ut){
  var tb=ut.querySelector('table.u-table'),body=tb?tb.tBodies[0]:null;if(!body)return;
  var facets={},page=0;
  Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){var fn=fe.getAttribute('data-facet');if(fn)facets[fn]={};});
  function size(){var s=ut.querySelector('.qt-size');return s?+s.value:20;}
  function rows(){return Array.prototype.slice.call(body.querySelectorAll('tr.urow'));}
  function detailOf(r){var n=r.nextElementSibling;return (n&&n.classList.contains('udetail'))?n:null;}
  function matches(r){
   var qi=ut.querySelector('.qt-search'),q=(qi&&qi.value?qi.value:'').toLowerCase();
   if(q&&(r.getAttribute('data-text')||'').indexOf(q)<0)return false;
   for(var fn in facets){var act=facets[fn],any=false,k;
    for(k in act){if(act[k]){any=true;break;}}
    if(any&&!act[r.getAttribute('data-'+fn)||''])return false;}
   return true;}
  function apply(){
   var vis=rows().filter(matches),sz=size(),pages=sz>0?Math.max(1,Math.ceil(vis.length/sz)):1;
   if(page>=pages)page=pages-1;if(page<0)page=0;
   rows().forEach(function(r){r.hidden=true;var d=detailOf(r);if(d)d.hidden=true;});
   vis.forEach(function(r,i){var on=sz===0||(i>=page*sz&&i<(page+1)*sz);r.hidden=!on;
    var d=detailOf(r);if(d)d.hidden=!on||d.getAttribute('data-open')!=='1';});
   var pos=ut.querySelector('.qt-pos');
   if(pos)pos.textContent=vis.length?((sz===0?1:page+1)+' / '+(sz===0?1:pages)+' · '+vis.length+' rows'):'no rows';}
  Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){var fn=fe.getAttribute('data-facet');if(!fn)return;
   Array.prototype.forEach.call(fe.querySelectorAll('.upill'),function(pl){pl.addEventListener('click',function(){
    var fv=pl.getAttribute('data-fv');
    if(fv==='*'){facets[fn]={};Array.prototype.forEach.call(fe.querySelectorAll('.upill'),function(x){x.classList.toggle('on',x.getAttribute('data-fv')==='*');});}
    else{facets[fn][fv]=!facets[fn][fv];pl.classList.toggle('on',!!facets[fn][fv]);
     var any=false;for(var k in facets[fn]){if(facets[fn][k]){any=true;break;}}
     var all=fe.querySelector('.upill[data-fv="*"]');if(all)all.classList.toggle('on',!any);}
    page=0;apply();});});});
  body.addEventListener('click',function(e){var r=e.target.closest('tr.urow');if(!r||!r.classList.contains('qt-exp'))return;
   if(e.target.closest('a,button,input,select'))return;
   var d=detailOf(r);if(!d)return;var open=d.getAttribute('data-open')==='1';
   d.setAttribute('data-open',open?'0':'1');r.classList.toggle('open',!open);apply();});
  var xa=ut.querySelector('.qt-xall'),ca=ut.querySelector('.qt-call');
  if(xa)xa.addEventListener('click',function(){rows().forEach(function(r){var d=detailOf(r);if(d){d.setAttribute('data-open','1');r.classList.add('open');}});apply();});
  if(ca)ca.addEventListener('click',function(){rows().forEach(function(r){var d=detailOf(r);if(d){d.setAttribute('data-open','0');r.classList.remove('open');}});apply();});
  var pv=ut.querySelector('.qt-prev'),nx=ut.querySelector('.qt-next');
  if(pv)pv.addEventListener('click',function(){page--;apply();});
  if(nx)nx.addEventListener('click',function(){page++;apply();});
  var qi=ut.querySelector('.qt-search');if(qi)qi.addEventListener('input',function(){page=0;apply();});
  var sz=ut.querySelector('.qt-size');if(sz)sz.addEventListener('change',function(){page=0;apply();});
  ut.revealRow=function(id){var r=body.querySelector('tr.urow[data-node="'+id+'"]');if(!r)return null;
   for(var fn in facets)facets[fn]={};
   Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){Array.prototype.forEach.call(fe.querySelectorAll('.upill'),function(x){x.classList.toggle('on',x.getAttribute('data-fv')==='*');});});
   var qs=ut.querySelector('.qt-search');if(qs)qs.value='';
   var vis=rows().filter(matches),idx=vis.indexOf(r),sz2=size();page=sz2>0?Math.floor(idx/sz2):0;
   var d=detailOf(r);if(d){d.setAttribute('data-open','1');r.classList.add('open');}
   apply();return r;};
  apply();
 });
 /* onion drill-down (req-figure-drilldown): every level is pre-rendered; clicks only
    switch which view is visible. Each drill pushes a history entry so the browser BACK
    button returns to the previous onion view; a shared nav marker keeps the trace-graph
    and onion popstate handlers from fighting. */
 window.__quackNav=window.__quackNav||[];
 var __onionStack=[];
 function __onionShow(host,t){Array.prototype.forEach.call(host.querySelectorAll('.oview'),function(v){v.hidden=true;});t.hidden=false;
  if(window.__ogRefit)window.__ogRefit(t);}
 document.querySelectorAll('.onion [data-onion-go]').forEach(function(el){el.addEventListener('click',function(ev){
  ev.preventDefault();
  var t=document.getElementById(el.getAttribute('data-onion-go'));
  var host=el.closest('.onion');if(!t||!host)return;
  var cur=host.querySelector('.oview:not([hidden])');
  if(cur&&cur!==t){
   __onionStack.push({host:host,id:cur.id});
   window.__quackNav.push('onion');
   try{history.pushState({nav:'onion'},'');}catch(_){}
  }
  __onionShow(host,t);});});
 window.addEventListener('popstate',function(){
  var nv=window.__quackNav||[];
  if(nv.length===0||nv[nv.length-1]!=='onion')return;
  nv.pop();
  var e=__onionStack.pop();if(!e)return;
  var t=document.getElementById(e.id);if(!t)return;
  __onionShow(e.host,t);});
 /* pan+zoom the onion svgs (owner: zoomable like the trace graph) - wheel zooms toward the
    cursor, drag pans, double-click resets; clicks on drill targets still pass through */
 document.querySelectorAll('.onion svg').forEach(function(svg){
  var vb=(svg.getAttribute('viewBox')||'0 0 380 360').split(/\s+/).map(Number);
  var base=vb.slice(),st={x:vb[0],y:vb[1],w:vb[2],h:vb[3]},drag=null;
  function apply(){svg.setAttribute('viewBox',st.x+' '+st.y+' '+st.w+' '+st.h);}
  svg.addEventListener('wheel',function(e){e.preventDefault();var r=svg.getBoundingClientRect();if(!r.width)return;
   var mx=st.x+(e.clientX-r.left)/r.width*st.w,my=st.y+(e.clientY-r.top)/r.height*st.h,f=e.deltaY<0?0.85:1.18;
   st.w*=f;st.h*=f;st.x=mx-(e.clientX-r.left)/r.width*st.w;st.y=my-(e.clientY-r.top)/r.height*st.h;apply();},{passive:false});
  svg.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('[data-onion-go],[data-node-link]'))return;
   drag={x:e.clientX,y:e.clientY,sx:st.x,sy:st.y};try{svg.setPointerCapture(e.pointerId);}catch(_){}svg.style.cursor='grabbing';});
  svg.addEventListener('pointermove',function(e){if(!drag)return;var r=svg.getBoundingClientRect();if(!r.width)return;
   st.x=drag.sx-(e.clientX-drag.x)/r.width*st.w;st.y=drag.sy-(e.clientY-drag.y)/r.height*st.h;apply();});
  svg.addEventListener('pointerup',function(){drag=null;svg.style.cursor='';});
  svg.addEventListener('dblclick',function(){st.x=base[0];st.y=base[1];st.w=base[2];st.h=base[3];apply();});
 });
 /* per-layer cytoscape graphs (owner ruling 2026-07-09): dagre left-to-right over the
    baked JSON islands; the assets are the ones the trace chapter inlines. A region tap
    transports to the trace row; theme clusters and the lower-levels node drill to their
    PRE-RENDERED views (the script never creates content); hovering a node isolates its
    neighborhood. A node subtitle (data "sub") bakes into the label's second line. */
 function __ogInit(host){
  if(host.__og||!window.cytoscape)return;
  if(!host.getBoundingClientRect().width)return; /* hidden view: init on first show */
  var de=host.parentElement.querySelector('.og-data');if(!de)return;
  var d;try{d=JSON.parse(de.textContent||'{}');}catch(e){return;}
  var fb=host.querySelector('.og-fallback');if(fb)fb.hidden=true;
  var els=[];
  (d.nodes||[]).forEach(function(n){
   var nd={id:n.id,label:n.sub?n.label+'\n'+n.sub:n.label,kind:n.kind};
   if(n.go)nd.go=n.go;
   els.push({data:nd});});
  (d.edges||[]).forEach(function(e,i){
   var ed={id:'og'+i,source:e.s,target:e.t,kind:e.kind};
   if(e.label)ed.label=e.label;
   els.push({data:ed});});
  var cy=cytoscape({container:host,elements:els,wheelSensitivity:0.2,
   layout:{name:'dagre',rankDir:'LR',nodeSep:12,rankSep:110},
   style:[
    {selector:'node',style:{'label':'data(label)','font-size':11,'text-valign':'center','text-halign':'center','text-wrap':'wrap','text-max-width':170,'shape':'round-rectangle','width':'label','height':'label','padding':'7px','background-color':'#fff','border-width':1,'border-color':'#4a6fa5','color':'#333'}},
    {selector:'node[kind="in"]',style:{'border-color':'#2f8f4e','background-color':'#eef7f0'}},
    {selector:'node[kind="out"]',style:{'border-color':'#b5651d','background-color':'#fbf2ea'}},
    {selector:'node[kind="xin"],node[kind="xout"]',style:{'border-color':'#8aa0c4','background-color':'#f3f7fc','color':'#5b7fa6'}},
    {selector:'node[kind="th"]',style:{'border-width':3,'border-style':'double','background-color':'#eef3fa','font-weight':'bold'}},
    {selector:'node[kind="peer"]',style:{'border-style':'dashed','border-color':'#8aa0c4','background-color':'#f3f7fc','color':'#5b7fa6'}},
    {selector:'node[kind="lower"]',style:{'shape':'ellipse','width':150,'height':90,'background-color':'#dce9f8','font-weight':'bold'}},
    {selector:'edge',style:{'curve-style':'bezier','width':1.4,'line-color':'#9db6e0','target-arrow-shape':'triangle','target-arrow-color':'#9db6e0','arrow-scale':0.9}},
    {selector:'edge[kind="in"]',style:{'line-color':'#2f8f4e','target-arrow-color':'#2f8f4e'}},
    {selector:'edge[kind="out"]',style:{'line-color':'#b5651d','target-arrow-color':'#b5651d'}},
    {selector:'edge[kind="lower"]',style:{'line-style':'dashed'}},
    {selector:'edge[label]',style:{'label':'data(label)','font-size':9,'color':'#5b7fa6','text-background-color':'#fff','text-background-opacity':0.85}},
    {selector:'.ogdim',style:{'opacity':0.12}}
   ]});
  cy.on('tap','node',function(ev){var n=ev.target,k=n.data('kind');
   var go=(k==='lower')?host.getAttribute('data-oglower'):n.data('go');
   if(go){
    var hostView=host.closest('.onion'),t=document.getElementById(go);
    if(t&&hostView){var cur=hostView.querySelector('.oview:not([hidden])');
     if(cur&&cur!==t){__onionStack.push({host:hostView,id:cur.id});window.__quackNav.push('onion');try{history.pushState({nav:'onion'},'');}catch(_){}}
     __onionShow(hostView,t);}
    return;}
   if(k!=='el')return;
   var s=document.querySelector('[data-node="'+n.id()+'"]');if(!s)return;
   if(window.bookPageTo)window.bookPageTo(s);
   var dd=s.closest('details');if(dd)dd.open=true;
   s.scrollIntoView({block:'center'});});
  cy.on('mouseover','node',function(ev){cy.elements().addClass('ogdim');ev.target.closedNeighborhood().removeClass('ogdim');});
  cy.on('mouseout','node',function(){cy.elements().removeClass('ogdim');});
  host.__og=cy;
 }
 function __ogRefit(scope){Array.prototype.forEach.call((scope||document).querySelectorAll('.ograph'),function(h){
  __ogInit(h);if(h.__og){h.__og.resize();h.__og.fit(undefined,30);}});}
 window.__ogRefit=__ogRefit;
 __ogRefit(document);
 /* figure fullscreen (owner 2026-07-09): the button flips a class on its own figure */
 document.querySelectorAll('[data-figfs]').forEach(function(btn){btn.addEventListener('click',function(){
  var f=btn.closest('figure');if(!f)return;
  f.classList.toggle('fig-full');
  __ogRefit(f);
  btn.textContent=f.classList.contains('fig-full')?'✕':'⛶';});});
 document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
  document.querySelectorAll('figure.fig-full').forEach(function(f){f.classList.remove('fig-full');
   var b=f.querySelector('[data-figfs]');if(b)b.textContent='⛶';});});
 /* trace-item links: scroll to the section already carrying the node, wherever it renders */
 document.querySelectorAll('[data-node-link]').forEach(function(a){a.addEventListener('click',function(ev){
  ev.preventDefault();
  var s=document.querySelector('[data-node="'+a.getAttribute('data-node-link')+'"]');
  if(!s)return;
  if(window.bookPageTo)window.bookPageTo(s);
  var d=s.closest('details');if(d)d.open=true;
  s.scrollIntoView({block:'center'});});});
 /* paging: one top-level section per page (req-section-paging); the pager text ECHOES the h1 */
 var arts=Array.prototype.slice.call(document.querySelectorAll('main article.ch')),pg=0;
 function pageShow(i,scroll){if(!arts.length)return;pg=Math.max(0,Math.min(arts.length-1,i));
  arts.forEach(function(a,j){a.classList.toggle('pg-hide',j!==pg);});
  var h=arts[pg].querySelector('h1');
  var pc=document.getElementById('pg-cur');
  if(pc)pc.textContent=(pg+1)+'/'+arts.length+(h?' · '+h.textContent:'');
  if(arts[pg].querySelector('#graph')&&window.__quackGraphRefit){setTimeout(window.__quackGraphRefit,0);}
  if(scroll)window.scrollTo(0,0);}
 function pageToEl(el){var a=el&&el.closest?el.closest('article.ch'):null;
  if(a){var i=arts.indexOf(a);if(i>=0&&i!==pg)pageShow(i,false);}}
 window.bookPageTo=pageToEl;
 var pp=document.getElementById('pg-prev'),pn=document.getElementById('pg-next');
 if(pp)pp.addEventListener('click',function(){pageShow(pg-1,true);});
 if(pn)pn.addEventListener('click',function(){pageShow(pg+1,true);});
 window.addEventListener('hashchange',function(){var el=document.getElementById(location.hash.slice(1));
  if(el){pageToEl(el);el.scrollIntoView();}});
 /* arrow keys page the book (owner c1) - inert in present mode and while typing */
 document.addEventListener('keydown',function(e){if(b.hasAttribute('data-present'))return;
  if(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))return;
  if(e.key==='ArrowRight')pageShow(pg+1,true);
  if(e.key==='ArrowLeft')pageShow(pg-1,true);});
 pageShow(0,false);
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
 apply();
})();
</script>
`)
	// design: go-annotator-core  implements: req-comment-mark-prose, req-comment-figure-target, req-comment-figure-fallback, req-comment-dom-static, req-comment-escape, req-comment-sidebar, req-comment-threads, req-comment-close, req-comment-author, req-comment-save, req-comment-save-fallback, req-comment-suggest, req-comment-persist, req-comment-ux
	// While a comment is unsaved the layer warns before the copy closes (beforeunload), keeps
	// the comment and minimize controls in one place, and never shifts the bar when a post lands.
	// The comment layer's core, emitted OUTSIDE <main>: one empty island slot plus the
	// quack-annotator script. Anchors = unit id + quote/prefix/suffix + position (W3C shape);
	// figure marks target <g id> elements, falling back to the whole figure's unit; paint goes
	// through the CSS Custom Highlight API, so the content DOM is NEVER mutated; every comment
	// string renders via textContent (no innerHTML anywhere in the layer); the island rewrite
	// escapes angle brackets so stored text can never close the script tag (M5 spike finding).
	doc.WriteString(`<script type="application/json" id="quack-comments">{"version":1,"annotations":[]}</script>
<script>
/* quack-annotator core */
(function(){
'use strict';
var island=document.getElementById('quack-comments');
var data;try{data=JSON.parse(island.textContent||'{}');}catch(e){data=null;}
if(!data||!Array.isArray(data.annotations))data={version:1,annotations:[]};
function unitOf(node){var el=node&&node.nodeType===1?node:(node?node.parentElement:null);
 while(el&&el!==document.body){if(el.id&&!el.closest('svg'))return el;el=el.parentElement;}
 return null;}
function textWalk(unit,fn){var w=document.createTreeWalker(unit,NodeFilter.SHOW_TEXT),n,pos=0;
 while((n=w.nextNode())){var len=n.textContent.length;if(fn(n,pos,pos+len))return;pos+=len;}}
function anchorFromSelection(){var sel=window.getSelection();
 if(!sel||sel.isCollapsed||sel.rangeCount===0)return null;
 var r=sel.getRangeAt(0),unit=unitOf(r.startContainer);
 if(!unit)return null;
 var full=unit.textContent,quote=r.toString();
 if(!quote)return null;
 var start=-1;
 textWalk(unit,function(n,s,e){if(n===r.startContainer){start=s+r.startOffset;return true;}return false;});
 if(start<0||full.slice(start,start+quote.length)!==quote)start=full.indexOf(quote);
 if(start<0)return null;
 return {unit:unit.id,quote:quote,prefix:full.slice(Math.max(0,start-16),start),
  suffix:full.slice(start+quote.length,start+quote.length+16),start:start,end:start+quote.length};}
function anchorFromElement(el){
 var g=el;
 while(g&&g!==document.body){
  if(g.id&&g.closest&&g.closest('svg')&&g.tagName.toLowerCase()!=='svg'){
   var su=unitOf(g.closest('svg').parentElement);
   return {unit:su?su.id:'',el:g.id};}
  if(g.tagName&&g.tagName.toLowerCase()==='svg'){var u=unitOf(g.parentElement);return u?{unit:u.id}:null;}
  g=g.parentElement;}
 var u2=unitOf(el);return u2?{unit:u2.id}:null;}
function resolveRange(t){var unit=document.getElementById(t.unit);
 if(!unit||!t.quote)return null;
 var full=unit.textContent,idx=-1;
 if(typeof t.start==='number'&&full.slice(t.start,t.end)===t.quote)idx=t.start;
 if(idx<0)idx=full.indexOf(t.quote);
 if(idx<0)return null;
 var range=new Range(),sN=null,sO=0,eN=null,eO=0,endAt=idx+t.quote.length;
 textWalk(unit,function(n,s,e){if(sN===null&&idx<e){sN=n;sO=idx-s;}
  if(sN!==null&&endAt<=e){eN=n;eO=endAt-s;return true;}return false;});
 if(!sN||!eN)return null;
 range.setStart(sN,Math.max(0,sO));range.setEnd(eN,Math.max(0,eO));return range;}
var canPaint=(typeof Highlight!=='undefined')&&window.CSS&&CSS.highlights;
function repaint(){if(!canPaint)return;
 var hl=new Highlight(),count=0;
 data.annotations.forEach(function(a){if(a.status==='closed'||!a.target)return;
  if(a.target.quote){var r=resolveRange(a.target);if(r){hl.add(r);count++;}}});
 if(count>0)CSS.highlights.set('quack-comments',hl);else CSS.highlights.delete('quack-comments');}
function persist(){island.textContent=JSON.stringify(data).replace(/</g,'\\u003c');}
function mintId(){var n=data.annotations.length+1,id='c'+n;
 while(data.annotations.some(function(a){return a.id===id;})){n++;id='c'+n;}
 return id;}
window.quackComments={data:data,
 anchorFromSelection:anchorFromSelection,
 anchorFromElement:anchorFromElement,
 resolveRange:resolveRange,repaint:repaint,persist:persist,
 setText:function(el,s){el.textContent=s;},
 add:function(target,author,text){
  var a={id:mintId(),target:target,author:author||'',status:'open',
   thread:text?[{author:author||'',mark:'neutral',text:text,ts:new Date().toISOString()}]:[]};
  data.annotations.push(a);persist();repaint();return a;}};
repaint();
})();
</script>
<script>
/* quack-annotator sidebar: threads, marks, close/reopen, changeable name field, no popups
   (owner field feedback, M7). */
(function(){
'use strict';
var QC=window.quackComments;if(!QC)return;
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;
 if(text!==undefined)QC.setText(e,text);return e;}
function author(){var f=document.getElementById('qc-name');
 var a=f?f.value.trim():(localStorage.getItem('quack-comment-author')||'');
 if(a)localStorage.setItem('quack-comment-author',a);
 return a;}
var unitOrder={};
/* whole-document order (field c46): units OUTSIDE main - the shell, the glossary -
   sort by their real place in the document, never into an arbitrary tail bucket */
Array.prototype.forEach.call(document.querySelectorAll('[id]'),function(n,i){unitOrder[n.id]=i;});
function orderKey(a){if(!a.target||!(a.target.unit in unitOrder))return 1e12;
 return unitOrder[a.target.unit]*1e6+(a.target.start||0);}
var sb=el('aside','',undefined);sb.id='quack-sb';
var head=el('div','qc-head',undefined);
var title=el('span','','Comments');
var min=el('button','','minimize');
head.appendChild(title);head.appendChild(min);sb.appendChild(head);
var nameInp=el('input','',undefined);nameInp.id='qc-name';
nameInp.placeholder='your name (changeable)';
nameInp.value=localStorage.getItem('quack-comment-author')||'';
nameInp.addEventListener('input',function(){localStorage.setItem('quack-comment-author',nameInp.value.trim());});
sb.appendChild(nameInp);
var list=el('div','qc-list',undefined);sb.appendChild(list);
document.body.appendChild(sb);
var toggle=el('button','','');toggle.id='quack-sb-toggle';toggle.hidden=true;
document.body.appendChild(toggle);
function setOpen(open){document.body.setAttribute('data-qc',open?'open':'min');toggle.hidden=open;}
min.addEventListener('click',function(){setOpen(false);});
toggle.addEventListener('click',function(){setOpen(true);});
function panTo(a){var t=a.target||{};
 /* paged book (i14): flip to the target's page before scrolling */
 var tu=document.getElementById(t.el||t.unit||'');
 if(tu&&window.bookPageTo)window.bookPageTo(tu);
 if(t.el){var g=document.getElementById(t.el);
  if(g){g.scrollIntoView({behavior:'smooth',block:'center'});return;}}
 if(t.quote){var r=QC.resolveRange(t);
  if(r){var rect=r.getBoundingClientRect();
   if(rect.height>0||rect.width>0){
    window.scrollTo({top:rect.top+window.scrollY-window.innerHeight/3,behavior:'smooth'});return;}}}
 var u=document.getElementById(t.unit);
 if(u)u.scrollIntoView({behavior:'smooth',block:'center'});}
var drafts={};
function postAllDrafts(){var posted=false;
 QC.data.annotations.forEach(function(a){var v=(drafts[a.id]||'').trim();
  if(!v||a.status==='closed')return;
  a.thread.push({author:author(),mark:'neutral',text:v,ts:new Date().toISOString()});
  delete drafts[a.id];posted=true;});
 if(posted){QC.persist();render();}
 return posted;}
function card(a){var c=el('div','qc-card'+(a.status==='closed'?' qc-closed':''),undefined);
 c.setAttribute('data-qcid',a.id);
 var label=a.target&&a.target.quote?a.target.quote:
  (a.target&&a.target.el?'[figure: '+a.target.el+']':'[section]');
 if(label.length>80)label=label.slice(0,77)+'...';
 c.appendChild(el('div','qc-quote',label));
 c.addEventListener('click',function(e){
  var tn=e.target.tagName;
  if(tn==='BUTTON'||tn==='TEXTAREA'||tn==='SELECT'||tn==='INPUT'||tn==='OPTION')return;
  panTo(a);});
 (a.thread||[]).forEach(function(m){var row=el('div','qc-msg',undefined);
  var sym=m.mark==='agree'?'+':(m.mark==='reject'?'x':'-');
  row.appendChild(el('span','qc-mark '+(m.mark||'neutral'),sym));
  row.appendChild(el('span','',(m.author?m.author+': ':'')+m.text));
  c.appendChild(row);});
 if(a.suggest)c.appendChild(el('div','qc-suggest','suggested: '+a.suggest.proposed));
 if(a.status!=='closed'){
  /* qc-draft (field c5, req-comment-persist): unposted text survives every re-render -
     drafts live in a map keyed by annotation id and restore into the rebuilt textarea */
  var inp=el('textarea','qc-inp qc-draft',undefined);inp.placeholder='write...';inp.rows=2;
  inp.value=drafts[a.id]||'';
  inp.addEventListener('input',function(){drafts[a.id]=inp.value;});
  c.appendChild(inp);
  var sel=el('select','qc-sel',undefined);
  ['neutral','agree','reject'].forEach(function(v){var o=el('option','',v);o.value=v;sel.appendChild(o);});
  var post=el('button','','post');
  post.addEventListener('click',function(){var v=inp.value.trim();if(!v)return;
   a.thread.push({author:author(),mark:sel.value,text:v,ts:new Date().toISOString()});
   delete drafts[a.id];QC.persist();
   /* keep the composer bar anchored: hold the sidebar scroll across the re-render so a
      posted comment does not shift the input bar (owner review c18) */
   var st=sb?sb.scrollTop:0;render();if(sb)sb.scrollTop=st;});
  var cls=el('button','','close');
  cls.addEventListener('click',function(){a.status='closed';QC.persist();QC.repaint();render();});
  var row2=el('div','qc-row',undefined);
  row2.appendChild(sel);row2.appendChild(post);row2.appendChild(cls);row2.appendChild(delBtn());
  c.appendChild(row2);
 }else{
  var row3=el('div','qc-row',undefined);
  var reo=el('button','','reopen');
  reo.addEventListener('click',function(){a.status='open';QC.persist();QC.repaint();render();});
  row3.appendChild(reo);row3.appendChild(delBtn());
  c.appendChild(row3);}
 function delBtn(){var d=el('button','','delete');
  d.addEventListener('click',function(){
   var i=QC.data.annotations.indexOf(a);
   if(i>=0)QC.data.annotations.splice(i,1);
   QC.persist();QC.repaint();render();});
  return d;}
 return c;}
function render(focusId){while(list.firstChild)list.removeChild(list.firstChild);
 var anns=QC.data.annotations.slice().sort(function(x,y){return orderKey(x)-orderKey(y);});
 var openN=0;
 anns.forEach(function(a){if(a.status!=='closed')openN++;list.appendChild(card(a));});
 QC.setText(title,'Comments ('+openN+')');
 QC.setText(toggle,'comments ('+openN+')');
 if(focusId){setOpen(true);
  var tc=list.querySelector('[data-qcid="'+focusId+'"] textarea');
  if(tc){tc.scrollIntoView({block:'nearest'});tc.focus();}}
 else setOpen(document.body.getAttribute('data-qc')!=='min');}
var fab=el('button','','comment');fab.id='quack-fab';fab.hidden=true;
document.body.appendChild(fab);
document.addEventListener('mouseup',function(e){
 if(sb.contains(e.target)||e.target===fab)return;
 setTimeout(function(){var s=window.getSelection();
  if(s&&!s.isCollapsed&&String(s).trim()){fab.hidden=false;
   fab.style.left=(e.pageX+8)+'px';fab.style.top=(e.pageY-34)+'px';}
  else fab.hidden=true;},0);});
fab.addEventListener('click',function(){
 var t=QC.anchorFromSelection();fab.hidden=true;if(!t)return;
 var a=QC.add(t,author(),'');
 render(a.id);});
document.addEventListener('dblclick',function(e){
 var svg=e.target&&e.target.closest?e.target.closest('svg'):null;
 if(!svg)return;
 var t=QC.anchorFromElement(e.target);if(!t)return;
 var a=QC.add(t,author(),'');
 render(a.id);});
window.quackCommentsUI={render:render,postAllDrafts:postAllDrafts};
render();
setOpen(QC.data.annotations.length>0);
/* warn before the copy is closed with an unsaved comment in a composer (owner review c2) */
window.addEventListener('beforeunload',function(e){
 var dirty=false;
 try{dirty=Object.keys(drafts).some(function(k){return (drafts[k]||'').trim();});}catch(_e){}
 if(!dirty){var tas=document.querySelectorAll('textarea.qc-inp');
  for(var i=0;i<tas.length;i++){if(tas[i]&&(tas[i].value||'').trim()){dirty=true;break;}}}
 if(dirty){e.preventDefault();e.returnValue='';}});
})();
</script>
<script>
/* quack-annotator save: in-place via the File System Access API (one pick, then reused),
   download fallback elsewhere. Serializes the document with the layer's own UI stripped -
   the island is the only content that changes. */
(function(){
'use strict';
var QC=window.quackComments;if(!QC)return;
var handle=null;
function serialize(){
 var clone=document.documentElement.cloneNode(true);
 ['quack-sb','quack-fab','quack-sb-toggle'].forEach(function(id){
  var n=clone.querySelector('#'+id);if(n&&n.parentNode)n.parentNode.removeChild(n);});
 var body=clone.querySelector('body');if(body)body.removeAttribute('data-qc');
 var isl=clone.querySelector('#quack-comments');
 if(isl)isl.textContent=JSON.stringify(QC.data).replace(/</g,'\\u003c');
 return '<!doctype html>\n'+clone.outerHTML;}
var btn=document.createElement('button');QC.setText(btn,'save');
var head=document.querySelector('#quack-sb .qc-head');
if(head)head.insertBefore(btn,head.lastChild);
function toast(t){var x=document.getElementById('qc-toast');
 if(!x){x=document.createElement('div');x.id='qc-toast';document.body.appendChild(x);}
 QC.setText(x,t);x.hidden=false;
 clearTimeout(x._t);x._t=setTimeout(function(){x.hidden=true;},5000);}
function proposedName(){
 var base=decodeURIComponent(location.pathname.split('/').pop()||'book.html').replace(/\.html?$/,'');
 var who=(localStorage.getItem('quack-comment-author')||'reader').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'reader';
 var d=new Date(),p=function(n){return (n<10?'0':'')+n;};
 var ts=''+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes());
 return base+'_'+who+'_comments_'+ts+'.html';}
function writeTo(h){h.createWritable().then(function(w){
  return w.write(serialize()).then(function(){return w.close();});})
 .then(function(){toast('saved: '+(h.name||'file')+' (a browser cannot show the folder; you picked it)');},
  function(e){toast('save failed: '+e.message+' - downloading a copy instead');download();});}
function saveInPlace(){
 if(!window.showSaveFilePicker)return false;
 if(handle){writeTo(handle);return true;}
 window.showSaveFilePicker({suggestedName:proposedName(),startIn:'desktop',
  types:[{description:'HTML',accept:{'text/html':['.html']}}]})
  .then(function(h){handle=h;writeTo(h);},function(){});
 return true;}
function download(){
 var blob=new Blob([serialize()],{type:'text/html'});
 var a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=proposedName();
 document.body.appendChild(a);a.click();
 if(a.parentNode)a.parentNode.removeChild(a);
 setTimeout(function(){URL.revokeObjectURL(a.href);},2000);
 toast('downloaded: '+a.download+' (browser Downloads folder)');}
btn.addEventListener('click',function(){
 /* save auto-posts every unposted draft first (field c5, req-comment-persist) */
 if(window.quackCommentsUI&&window.quackCommentsUI.postAllDrafts)window.quackCommentsUI.postAllDrafts();
 if(!saveInPlace())download();});
})();
</script>
</body></html>
`)
	// enddesign
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
				for _, line := range strings.Split(stripFillComments(u.Body), "\n") {
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
// fig: model takes an optional node-id argument (i16) — the group carries it through
var figRefRe = regexp.MustCompile(`^fig:\s*([a-z-]+(?:\s+[a-z0-9-]+)?)\s*$`)

// design: go-fig-elem-ids  implements: req-comment-figure-target
// Figure sub-elements carry stable ids (the M5 spike's P3 failure: the book had none, so
// figure part-marking had nothing to grab). Each figure takes the next ordinal at render
// (reset per emit - regeneration stays byte-identical); each element wraps in a <g> whose
// id slugs its label: fig<N>-<label-slug>. The comment layer anchors to these ids.
var figSeq int

func figNext() int { figSeq++; return figSeq }

var figSlugRe = regexp.MustCompile(`[^a-z0-9]+`)

func figElemID(fig int, label string) string {
	s := strings.Trim(figSlugRe.ReplaceAllString(strings.ToLower(label), "-"), "-")
	if len(s) > 24 {
		s = s[:24]
	}
	return fmt.Sprintf("fig%d-%s", fig, s)
}

// enddesign

func svgBox(x, y, w, h int, label, id string) string {
	cx := x + w/2
	return fmt.Sprintf(`<g id="%s"><rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#f6f8fa" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text></g>`, id, x, y, w, h, cx, y+h/2+5, htmlEscape(label))
}

// rectBorder returns the point on a rect's border (centre cx,cy, half-extents hw,hh) in the
// direction (dx,dy) - so a connector can stop at the border instead of the node's centre.
func rectBorder(cx, cy, hw, hh int, dx, dy float64) (int, int) {
	adx, ady := dx, dy
	if adx < 0 {
		adx = -adx
	}
	if ady < 0 {
		ady = -ady
	}
	t := 1e9
	if adx > 1e-6 {
		t = float64(hw) / adx
	}
	if ady > 1e-6 {
		if ty := float64(hh) / ady; ty < t {
			t = ty
		}
	}
	return cx + int(t*dx), cy + int(t*dy)
}

// svgContextStar draws the derived context diagram. Actors split by flank (owner ruling
// 2026-07-09): direction `in` feeds the system and sits LEFT, direction `out` consumes
// from it and sits RIGHT; an actor without a direction joins the left flank. Each flank
// fans out vertically from the middle.
func svgContextStar(center string, ins, outs []string) string {
	fig := figNext()
	var b strings.Builder
	b.WriteString(`<svg viewBox="0 0 640 420" font-family="system-ui" font-size="13" role="img" aria-label="context diagram">`)
	b.WriteString(fmt.Sprintf(`<g id="%s"><rect x="250" y="180" width="140" height="60" rx="8" fill="#e8f0fe" stroke="#4a6fa5"/><text x="320" y="215" text-anchor="middle">%s</text></g>`, figElemID(fig, center), htmlEscape(center)))
	flank := func(actors []string, side int) { // side -1 = left (in), +1 = right (out)
		n := len(actors)
		if n > 8 {
			actors, n = actors[:8], 8
		}
		gap := 46
		y0 := 210 - (n-1)*gap/2
		for i, a := range actors {
			x := 320 + side*250
			y := y0 + i*gap
			// the connector ends at each node's BORDER, never crossing into the boxes (owner Q5):
			// centre node is 140x60 (half 70x30), each actor node 110x30 (half 55x15).
			dx, dy := float64(x-320)/250, float64(y-210)/250 // any proportional direction works for rectBorder
			sx, sy := rectBorder(320, 210, 70, 30, dx, dy)
			ex, ey := rectBorder(x, y, 55, 15, -dx, -dy)
			if side < 0 { // flow reads left→right: in-arrows point AT the system
				sx, sy, ex, ey = ex, ey, sx, sy
			}
			b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#999"/>`, sx, sy, ex, ey))
			b.WriteString(fmt.Sprintf(`<g id="%s"><rect x="%d" y="%d" width="110" height="30" rx="15" fill="#fff" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text></g>`, figElemID(fig, a), x-55, y-15, x, y+5, htmlEscape(a)))
		}
	}
	flank(ins, -1)
	flank(outs, +1)
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
	fig := figNext()
	var b strings.Builder
	rows := (len(blocks) + 2) / 3
	h := 90 + rows*100
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 640 %d" font-family="system-ui" font-size="13" role="img" aria-label="building blocks">`, h))
	b.WriteString(fmt.Sprintf(`<rect x="10" y="10" width="620" height="%d" rx="8" fill="none" stroke="#4a6fa5" stroke-width="2"/><text x="24" y="36">%s</text>`, h-20, htmlEscape(title)))
	for i, bl := range blocks {
		x := 34 + (i%3)*200
		y := 56 + (i/3)*100
		b.WriteString(svgBox(x, y, 180, 70, bl, figElemID(fig, bl)))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

// design: go-onion-figure  implements: req-figure-drilldown, req-compact-renders
// The onion figure (bs20 ruling; owner excalidraw draft 2026-07-09): a drill-down over the
// DESIGN ELEMENTS (marked code regions). The layer map comes from go-onion-model-source. In
// MODEL mode ring membership is STRAIGHT from the model — elements are design regions, files
// are THEMES (owner ruling, i16); a file never earns a ring and never renders as a block. In
// FALLBACK mode (spec/design-layers.md, stub projects) an element takes the layer of its FILE
// per the pattern map — the old behavior, untouched. The intra/inter-element flow is the REAL
// call graph derived by deriveDesignFlow (a static AST pass): consumes[A] = design ids A calls
// into, reads[A]/writes[A] = A does external input/output. Level 0 is an OVERVIEW ONLY —
// concentric layer rings, one per SURVIVING layer, each labelled `name · N elements`, with
// `inputs:` entering from the LEFT and `outputs:` leaving to the RIGHT as external boxes with
// dashed connectors. No element cards here; clicking a ring drills into THAT layer. A layer
// with NO flow at all (every element is off-flow infrastructure) is SKIPPED — no ring, no view
// — and its elements sink INWARD into the next surviving layer's infrastructure pills (owner
// c37). Level 1 is the LAYER view: a dagre LR graph (owner cytoscape ruling 2026-07-09) of the
// layer's BLOCKS between the ports (inputs LEFT, outputs RIGHT) and the `lower levels` node
// (drills a layer down; the kernel view has none). In model mode a BLOCK is the THEME: one
// cluster per file carrying SEVERAL of the layer's regions, labelled `file` + `N regions`; a
// single-region theme renders the region itself — responsibility text as the label, `in file`
// as the subtitle (the theme is secondary info, never the unit). Region arrows aggregate to
// theme level, deduplicated; a collapsed multiplicity shows as `×N` on the edge. Clicking a
// cluster opens LEVEL 2: that theme's regions in THIS layer as individual blocks (label = the
// model's responsibility text, subtitle = the region id), with the region-level arrows within
// the theme, outgoing to peer themes, and to the lower levels. Every region block transports
// to its trace item on tap (the conn-code-designs surface). Intra-layer `consumes` edges draw
// as arcs; `reads`/`writes` wire the port boxes. Design elements OFF the flow entirely render
// as `infrastructure:` pills below the graph, each linking to its trace item; model-mode
// AMBIENT elements always render as those pills — they sit on no ring, flow or not. EVERY view
// (levels 0, 1, and 2) is pre-rendered static DOM with its own breadcrumbs and layer nav — the
// script only toggles which view shows, it never creates content. Sectors (same-topic pie
// wedges) are deferred by the owner. Excluded patterns (iteration files) stay out; in model
// mode non-engine marker files (method/*.md) stay out too. An element no source claims falls
// into an outermost `unmapped` ring, so the map cannot rot silently — in model mode that ring
// holds regions the model does not allocate (the sky-fall lint keeps it empty).
type onionLayer struct {
	name string
	pats []string
}

func readDesignLayers() (layers []onionLayer, excludes, inputs, outputs, infra []string) {
	raw, err := os.ReadFile(filepath.Join(SPEC, "design-layers.md"))
	if err != nil {
		return nil, nil, nil, nil, nil
	}
	inComment := false
	for _, ln := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
		t := strings.TrimSpace(ln)
		if strings.HasPrefix(t, "<!--") {
			inComment = true
		}
		if inComment {
			if strings.HasSuffix(t, "-->") {
				inComment = false
			}
			continue
		}
		if t == "" || strings.HasPrefix(t, "#") {
			continue
		}
		i := strings.Index(t, ":")
		if i < 1 {
			continue
		}
		name := strings.TrimSpace(t[:i])
		var pats []string
		for _, p := range strings.Split(t[i+1:], ",") {
			if p = strings.TrimSpace(p); p != "" {
				pats = append(pats, p)
			}
		}
		switch name {
		case "exclude":
			excludes = append(excludes, pats...)
		case "inputs":
			inputs = append(inputs, pats...)
		case "outputs":
			outputs = append(outputs, pats...)
		case "infra":
			infra = append(infra, pats...)
		default:
			layers = append(layers, onionLayer{name: name, pats: pats})
		}
	}
	return layers, excludes, inputs, outputs, infra
}

// layerPatMatch: the pattern matches the END of the slash-normalized path; `*` matches any run.
func layerPatMatch(pat, path string) bool {
	path = strings.ReplaceAll(path, "\\", "/")
	re := "(^|/)" + strings.ReplaceAll(regexp.QuoteMeta(pat), `\*`, ".*") + "$"
	ok, err := regexp.MatchString(re, path)
	return err == nil && ok
}

// flowReadSel and flowWriteSel are the printed `pkg.Sel` selectors that mark a
// design region as doing external input / output. Matching is textual (no type
// resolution needed): additionally, flag.* counts as input and fmt.Fprint* as
// output, handled by prefix below.
var flowReadSel = map[string]bool{
	"os.ReadFile": true, "os.Open": true, "os.ReadDir": true, "os.Stat": true,
	"os.Args": true, "os.Stdin": true, "io.ReadAll": true,
}
var flowWriteSel = map[string]bool{
	"os.WriteFile": true, "os.Create": true, "os.MkdirAll": true,
	"os.Stdout": true, "os.Stderr": true,
	"fmt.Print": true, "fmt.Println": true, "fmt.Printf": true,
}

// deriveDesignFlow is a Doxygen-style static pass over the engine's own Go
// source. It reads the AST (go/parser + go/ast, zero third-party deps) and
// derives the dependency FLOW between design regions:
//   - consumes[A] = sorted, de-duplicated design ids B such that code inside
//     region A references a package-level symbol DECLARED inside region B
//     (self-edges A==B excluded).
//   - reads[A] = region A performs external INPUT (os read syscalls, os.Args,
//     os.Stdin, io.ReadAll, or any flag.* CLI read).
//   - writes[A] = region A performs external OUTPUT (os write syscalls,
//     os.Stdout/os.Stderr, fmt.Print*, fmt.Fprint*).
//
// The engine is one Go package (package main), so a bare identifier resolves
// unambiguously to its package-level declaration of the same name.
func deriveDesignFlow() (consumes map[string][]string, reads map[string]bool, writes map[string]bool) {
	consumes = map[string][]string{}
	reads = map[string]bool{}
	writes = map[string]bool{}
	consumeSet := map[string]map[string]bool{}

	// EngineSrc() names the engine source home; scanDesignsUnder gives every
	// region with its 1-based start line and body, from which we derive its
	// [start,end] line span, grouped by the absolute file path it walked.
	_ = EngineSrc()
	type span struct {
		id         string
		start, end int
	}
	byFile := map[string][]span{}
	for id, n := range scanDesignsUnder(filepath.Join(ROOT, "product")) {
		if !strings.HasSuffix(n.Path, ".go") {
			continue
		}
		nl := 0
		if n.RegionBody != "" {
			nl = strings.Count(n.RegionBody, "\n") + 1
		}
		byFile[n.Path] = append(byFile[n.Path], span{id: id, start: n.Line, end: n.Line + nl + 1})
	}
	inSpan := func(spans []span, line int) string {
		for _, s := range spans {
			if line >= s.start && line <= s.end {
				return s.id
			}
		}
		return ""
	}

	// Pass 1 — parse each region-bearing file once (its own fileset for line
	// lookup) and build the GLOBAL symbol table: package-level symbol name ->
	// owning design id, for decls whose start line falls inside a region.
	type parsedFile struct {
		file  *ast.File
		fset  *token.FileSet
		spans []span
	}
	files := map[string]parsedFile{}
	symOf := map[string]string{}
	recordSyms := func(fset *token.FileSet, spans []span, d ast.Decl) {
		id := inSpan(spans, fset.Position(d.Pos()).Line)
		if id == "" {
			return
		}
		switch t := d.(type) {
		case *ast.FuncDecl:
			if t.Name != nil {
				symOf[t.Name.Name] = id
			}
		case *ast.GenDecl:
			for _, sp := range t.Specs {
				switch s := sp.(type) {
				case *ast.ValueSpec: // var / const
					for _, nm := range s.Names {
						symOf[nm.Name] = id
					}
				case *ast.TypeSpec: // type
					if s.Name != nil {
						symOf[s.Name.Name] = id
					}
				}
			}
		}
	}
	for path, spans := range byFile {
		fset := token.NewFileSet()
		af, err := parser.ParseFile(fset, path, nil, 0)
		if err != nil || af == nil {
			continue // a broken file must not sink the whole pass
		}
		files[path] = parsedFile{file: af, fset: fset, spans: spans}
		for _, d := range af.Decls {
			recordSyms(fset, spans, d)
		}
	}

	// Pass 2 — walk each region's owned decls for cross-region references and
	// external I/O selectors.
	for _, p := range files {
		for _, d := range p.file.Decls {
			owner := inSpan(p.spans, p.fset.Position(d.Pos()).Line)
			if owner == "" {
				continue
			}
			ast.Inspect(d, func(n ast.Node) bool {
				switch e := n.(type) {
				case *ast.Ident:
					if to, ok := symOf[e.Name]; ok && to != owner {
						if consumeSet[owner] == nil {
							consumeSet[owner] = map[string]bool{}
						}
						consumeSet[owner][to] = true
					}
				case *ast.SelectorExpr:
					if x, ok := e.X.(*ast.Ident); ok && e.Sel != nil {
						key := x.Name + "." + e.Sel.Name
						switch {
						case flowReadSel[key], x.Name == "flag":
							reads[owner] = true
						case flowWriteSel[key],
							x.Name == "fmt" && strings.HasPrefix(e.Sel.Name, "Fprint"):
							writes[owner] = true
						}
					}
				}
				return true
			})
		}
	}

	for owner, set := range consumeSet {
		ids := make([]string, 0, len(set))
		for id := range set {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		consumes[owner] = ids
	}
	return consumes, reads, writes
}

// debugDesignFlow renders a compact text report of deriveDesignFlow for manual
// verification. Not wired into any figure.
func debugDesignFlow() string {
	consumes, reads, writes := deriveDesignFlow()
	all := map[string]bool{}
	for id, n := range scanDesignsUnder(filepath.Join(ROOT, "product")) {
		if strings.HasSuffix(n.Path, ".go") {
			all[id] = true
		}
	}
	for id := range consumes {
		all[id] = true
	}
	edges, nReads, nWrites := 0, 0, 0
	for _, bs := range consumes {
		edges += len(bs)
	}
	for _, v := range reads {
		if v {
			nReads++
		}
	}
	for _, v := range writes {
		if v {
			nWrites++
		}
	}
	ids := make([]string, 0, len(all))
	for id := range all {
		ids = append(ids, id)
	}
	sort.Slice(ids, func(i, j int) bool {
		if li, lj := len(consumes[ids[i]]), len(consumes[ids[j]]); li != lj {
			return li > lj
		}
		return ids[i] < ids[j]
	})
	var b strings.Builder
	fmt.Fprintf(&b, "design elements: %d\n", len(all))
	fmt.Fprintf(&b, "reads=true:      %d\n", nReads)
	fmt.Fprintf(&b, "writes=true:     %d\n", nWrites)
	fmt.Fprintf(&b, "consume-edges:   %d\n", edges)
	b.WriteString("top by out-degree:\n")
	for i, id := range ids {
		if i >= 15 || len(consumes[id]) == 0 {
			break
		}
		fmt.Fprintf(&b, "  %s -> %s\n", id, strings.Join(consumes[id], ", "))
	}
	return b.String()
}

func renderOnion(nodes map[string]Node) string {
	layers, excludes, inputs, outputs, _, model := onionLayerSource()
	if len(layers) == 0 {
		return `<p class="meta">no layer map yet — the onion renders once spec/models/model-engine-layers.md (or the spec/design-layers.md fallback) names the layers</p>`
	}
	// The REAL derived call graph between design elements (one AST pass; call once).
	consumes, reads, writes := deriveDesignFlow()

	// Every design element (marked code region), keyed by id, with its product-relative path.
	// Excluded patterns (iteration files) stay out — the book documents the CURRENT design.
	relOf := map[string]string{}
	var els []string
	for id, nd := range nodes {
		if nd.Type != "design" {
			continue
		}
		rel := strings.ReplaceAll(nd.Path, "\\", "/")
		if k := strings.Index(rel, "/product/"); k >= 0 {
			rel = rel[k+len("/product/"):]
		} else {
			rel = strings.TrimPrefix(rel, "product/")
		}
		if model != nil && !strings.HasSuffix(rel, ".go") {
			continue // model mode maps ENGINE regions only — method marker files are no blocks
		}
		skip := false
		for _, x := range excludes {
			if layerPatMatch(x, rel) {
				skip = true
				break
			}
		}
		if skip {
			continue
		}
		relOf[id] = rel
		els = append(els, id)
	}
	sortStrings(els) // each layer's slice inherits this sort order

	// Each element's LAYER: model mode allocates STRAIGHT from the model (elements are design
	// regions; files are themes — never a rank source). The fallback matches the element's FILE
	// against the layer patterns. An element no source claims falls into an outermost `unmapped`
	// ring, so the map cannot rot silently.
	fileLayer := map[string]string{}
	assign := func(f string) string {
		if ln, ok := fileLayer[f]; ok {
			return ln
		}
		ln := ""
		for _, l := range layers {
			for _, p := range l.pats {
				if layerPatMatch(p, f) {
					ln = l.name
					break
				}
			}
			if ln != "" {
				break
			}
		}
		if ln == "" {
			ln = "unmapped"
		}
		fileLayer[f] = ln
		return ln
	}
	layerOf := map[string]string{}
	haveUnmapped := false
	var ambientIDs []string // model-mode ambient: on NO ring, pinned to the innermost view's pills
	for _, id := range els {
		var ln string
		if model != nil {
			ln = model.layerOf[id]
			if ln == "" {
				ln = "unmapped" // the model does not allocate it — the sky-fall lint's territory
			}
		} else {
			ln = assign(relOf[id])
		}
		layerOf[id] = ln
		if ln == "unmapped" {
			haveUnmapped = true
		}
		if ln == "ambient" {
			ambientIDs = append(ambientIDs, id)
		}
	}

	// Rings outermost..innermost: unmapped outermost of all, then the layer map reversed (its last
	// entry, the kernel, is the innermost disc).
	var rings []onionLayer
	if haveUnmapped {
		rings = append(rings, onionLayer{name: "unmapped"})
	}
	for i := len(layers) - 1; i >= 0; i-- {
		rings = append(rings, layers[i])
	}
	elemsByLayer := map[string][]string{}
	for _, id := range els {
		elemsByLayer[layerOf[id]] = append(elemsByLayer[layerOf[id]], id)
	}

	// Global flow relations across ALL elements (for the off-flow / infrastructure test).
	consumedBy := map[string]bool{}
	for _, id := range els {
		for _, bb := range consumes[id] {
			consumedBy[bb] = true
		}
	}
	offFlow := func(id string) bool { // touches no other element and no external I/O
		return len(consumes[id]) == 0 && !consumedBy[id] && !reads[id] && !writes[id]
	}

	// (1) SKIP no-flow layers (owner c37): a layer with at least one ON-flow element (it consumes,
	// is consumed, or reads/writes) SURVIVES and keeps a ring + view; a layer where every element is
	// off-flow infrastructure gets NEITHER. Rings run outermost→innermost, so "inner" = higher index;
	// a skipped layer's elements sink INWARD into the next surviving layer's infrastructure pills.
	layerHasFlow := func(name string) bool {
		for _, id := range elemsByLayer[name] {
			if !offFlow(id) {
				return true
			}
		}
		return false
	}
	type survivor struct {
		name  string
		flow  []string // on-flow design elements (rendered in the ring band)
		infra []string // off-flow elements: own + those pushed down from skipped outer layers
	}
	var survivors []survivor
	var carry []string // infrastructure sinking inward from skipped layers
	for _, ring := range rings {
		own := elemsByLayer[ring.name]
		if !layerHasFlow(ring.name) {
			carry = append(carry, own...) // the whole (infra-only) layer sinks one level in
			continue
		}
		var flow, offs []string
		for _, id := range own {
			if offFlow(id) {
				offs = append(offs, id)
			} else {
				flow = append(flow, id)
			}
		}
		sortStrings(flow)
		offs = append(offs, carry...)
		carry = nil
		sortStrings(offs)
		survivors = append(survivors, survivor{name: ring.name, flow: flow, infra: offs})
	}
	// trailing skipped layers (no surviving inner layer) sink into the innermost survivor
	if len(carry) > 0 && len(survivors) > 0 {
		last := &survivors[len(survivors)-1]
		last.infra = append(last.infra, carry...)
		sortStrings(last.infra)
	}
	// model-mode ambient (meaning-free utilities): infrastructure pills on the innermost view,
	// flow or not — ambient is never a ring member and never a flow block.
	if len(ambientIDs) > 0 && len(survivors) > 0 {
		last := &survivors[len(survivors)-1]
		last.infra = append(last.infra, ambientIDs...)
		sortStrings(last.infra)
	}
	ns := len(survivors)
	if ns == 0 {
		return `<p class="meta">no design flow yet — every mapped layer is pure infrastructure</p>`
	}
	svPos := map[string]int{}
	for si, s := range survivors {
		svPos[s.name] = si
	}

	fig := figNext()
	base := "fig" + itoa(fig) + "-o"
	viewID := func(si int) string { return base + "Lv" + itoa(si) }
	shortID := func(id string) string {
		s := strings.TrimPrefix(id, "go-")
		if len(s) > 16 {
			s = s[:15] + "…"
		}
		return s
	}
	// theme = the FILE a region lives in (owner ruling: files are themes, secondary info only).
	theme := func(id string) string {
		rel := relOf[id]
		return rel[strings.LastIndex(rel, "/")+1:]
	}
	// respLabel = a block's display text: the model's responsibility text in model mode
	// (truncated for the canvas; the trace item carries the full text), the id otherwise.
	respLabel := func(id string) string {
		if model == nil {
			return shortID(id)
		}
		lb := model.labelOf[id]
		if lb == "" {
			return shortID(id) // an unmapped region has no authored responsibility yet
		}
		if r := []rune(lb); len(r) > 48 {
			lb = string(r[:47]) + "…"
		}
		return lb
	}
	// graph islands: nodes carry an optional subtitle (`sub`) and drill target (`go`);
	// edges carry an optional `×N` label when region arrows collapse onto one theme arrow.
	type gnode struct {
		ID    string `json:"id"`
		Label string `json:"label"`
		Kind  string `json:"kind"`
		Sub   string `json:"sub,omitempty"`
		Go    string `json:"go,omitempty"`
	}
	type gedge struct {
		S     string `json:"s"`
		T     string `json:"t"`
		Kind  string `json:"kind"`
		Label string `json:"label,omitempty"`
	}
	// mkAdd returns a deduplicating edge appender: one edge per (s,t,kind); a counted
	// edge that collapses several region arrows shows the multiplicity.
	mkAdd := func(edges *[]gedge) func(s, t, kind string, counted bool) {
		at, n := map[string]int{}, map[string]int{}
		return func(s, t, kind string, counted bool) {
			k := s + "|" + t + "|" + kind
			if i, ok := at[k]; ok {
				if counted {
					n[k]++
					(*edges)[i].Label = "×" + itoa(n[k]+1)
				}
				return
			}
			at[k] = len(*edges)
			*edges = append(*edges, gedge{S: s, T: t, Kind: kind})
		}
	}
	var b strings.Builder
	b.WriteString(`<div class="onion">` + "\n")
	fills := []string{"#eef3fa", "#dde8f5"}

	// --- level 0: the OVERVIEW only — concentric layer rings, one per layer, labelled name+count.
	// No element nodes here; inputs enter from the left, outputs leave to the right. Each ring
	// drills into that layer's own flow view. ---
	{
		W, H := 520, 280
		cx, cy := 260, 140
		rMax, rMin := 120, 30
		n := ns
		radius := func(k int) int { // k=0 outermost..ns-1 innermost (the kernel disc)
			if n <= 1 {
				return rMax
			}
			return rMin + (rMax-rMin)*(n-1-k)/(n-1)
		}
		leftRim, rightRim := cx-radius(0), cx+radius(0)
		b.WriteString(`<div class="oview" id="` + base + `0">` + "\n")
		b.WriteString(`<nav class="crumbs"><span>` + htmlEscape(brand()) + ` — layered overview</span></nav>` + "\n")
		b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 %d %d" font-family="system-ui" font-size="10" role="img" aria-label="layered overview">`, W, H))
		b.WriteString(`<defs><marker id="` + base + `arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#4a6fa5"/></marker></defs>`)
		for si := range survivors {
			fill := fills[si%2]
			if si == n-1 {
				fill = "#dce9f8"
			}
			b.WriteString(`<g data-onion-go="` + viewID(si) + `">` +
				fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="#4a6fa5"/></g>`, cx, cy, radius(si), fill))
		}
		for si, s := range survivors {
			var ly int
			if si == n-1 {
				ly = cy + 3
			} else {
				ly = cy + (radius(si)+radius(si+1))/2 + 3
			}
			b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" fill="#555" pointer-events="none">%s · %d elements</text>`,
				cx, ly, htmlEscape(s.name), len(s.flow)+len(s.infra)))
		}
		if len(inputs) > 0 {
			ebw, ebh, gap := 84, 22, 7
			y0 := cy - (len(inputs)*ebh+(len(inputs)-1)*gap)/2
			b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#777">inputs</text>`, 4+ebw/2, y0-5))
			for i, in := range inputs {
				by := y0 + i*(ebh+gap)
				b.WriteString(fmt.Sprintf(`<rect x="4" y="%d" width="%d" height="%d" rx="4" fill="#f6f8fa" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text>`,
					by, ebw, ebh, 4+ebw/2, by+ebh/2+4, htmlEscape(in)))
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#4a6fa5" stroke-dasharray="3 3" marker-end="url(#%sarr)"/>`,
					4+ebw+2, by+ebh/2, leftRim-3, cy, base))
			}
		}
		if len(outputs) > 0 {
			ebw, ebh, gap := 84, 22, 7
			y0 := cy - (len(outputs)*ebh+(len(outputs)-1)*gap)/2
			b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#777">outputs</text>`, W-4-ebw/2, y0-5))
			for i, out := range outputs {
				by := y0 + i*(ebh+gap)
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#4a6fa5" stroke-dasharray="3 3" marker-end="url(#%sarr)"/>`,
					rightRim+3, cy, W-4-ebw-2, by+ebh/2, base))
				b.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#f6f8fa" stroke="#888"/><text x="%d" y="%d" text-anchor="middle">%s</text>`,
					W-4-ebw, by, ebw, ebh, W-4-ebw/2, by+ebh/2+4, htmlEscape(out)))
			}
		}
		b.WriteString("</svg>\n</div>\n")
	}

	// --- level 1 (owner excalidraw draft 2026-07-09): per SURVIVING layer, a NESTED-ONION
	// round view. One true CIRCLE fills the width minus the port margins; input port boxes sit
	// outside LEFT, output port boxes outside RIGHT. The centre holds the smaller `lower levels`
	// circle (click drills; none on the kernel view). Input-flow nodes sit in the LEFT half,
	// output-path nodes in the RIGHT half, direct-throughput nodes in the MIDDLE as ONE box.
	// Since the owner's cytoscape ruling (2026-07-09) the layer body is a dagre LR graph;
	// the halves survive as flow DIRECTION (ports left/right, `lower levels` a node).
	// Breadcrumbs navigate up; every view's DATA is pre-baked. ---
	for si, s := range survivors {
		L := s.name
		// cross-layer relations of THIS layer's flow elements, by SURVIVING position (inner = higher)
		consumesOuter := map[string]bool{} // takes input from an outer layer
		consumesInner := map[string]bool{} // feeds or draws on an inner layer (→ centre)
		for _, a := range s.flow {
			for _, bb := range consumes[a] {
				if p, ok := svPos[layerOf[bb]]; ok {
					if p < si {
						consumesOuter[a] = true
					} else if p > si {
						consumesInner[a] = true
					}
				}
			}
		}
		consumedByOuter := map[string]bool{} // an outer element consumes it (→ feeds outward)
		for _, oa := range els {
			if p, ok := svPos[layerOf[oa]]; !ok || p >= si {
				continue
			}
			for _, bb := range consumes[oa] {
				if layerOf[bb] == L {
					consumedByOuter[bb] = true
				}
			}
		}
		isKernel := si == ns-1

		// adjacent surviving layers for the breadcrumb nav / centre / exit labels
		outerName := "overview"
		if si > 0 {
			outerName = survivors[si-1].name
		}
		innerView, innerName := "", ""
		if !isKernel {
			innerView, innerName = viewID(si+1), survivors[si+1].name
		}

		b.WriteString(`<div class="oview" id="` + viewID(si) + `" hidden>` + "\n")
		b.WriteString(`<nav class="crumbs"><button type="button" data-onion-go="` + base + `0">overview</button> ▸ <span>` + htmlEscape(L) + `</span></nav>` + "\n")
		// ▲ outer / ▼ inner layer nav
		b.WriteString(`<nav class="crumbs">`)
		if si > 0 {
			b.WriteString(`<button type="button" data-onion-go="` + viewID(si-1) + `">▲ ` + htmlEscape(outerName) + `</button> `)
		} else {
			b.WriteString(`<button type="button" data-onion-go="` + base + `0">▲ overview</button> `)
		}
		if !isKernel {
			b.WriteString(`<button type="button" data-onion-go="` + viewID(si+1) + `">▼ ` + htmlEscape(innerName) + `</button>`)
		}
		b.WriteString(`</nav>` + "\n")
		// graph data (owner ruling 2026-07-09, the cytoscape swap): the layer renders as a
		// dagre LEFT→RIGHT graph — real edge routing beats the hand-laid circle at 40+ edges,
		// and print-friendliness was explicitly traded away (the trace chapter set the
		// precedent). Ports and the outer-layer exchange are typed NODES; `lower levels`
		// drills down. The data bakes into a JSON island; the script instantiates the canvas
		// over the assets the trace chapter inlines.
		var gnodes []gnode
		var gedges []gedge
		addEdge := mkAdd(&gedges)
		// The layer's BLOCKS. Model mode clusters by THEME (owner mid-i16 ruling: 50+ flat
		// region blocks do not render): a file with several regions in this layer is ONE
		// cluster block that drills into a level-2 view; a single-region theme renders the
		// region itself. nodeOf maps every flow region to its level-1 block.
		nodeOf := map[string]string{}
		type themeView struct {
			file, view string
			ids        []string
		}
		var themes []themeView
		if model != nil {
			byTheme := map[string][]string{}
			var order []string
			for _, id := range s.flow {
				f := theme(id)
				if len(byTheme[f]) == 0 {
					order = append(order, f)
				}
				byTheme[f] = append(byTheme[f], id)
			}
			sortStrings(order)
			for _, f := range order {
				ids := byTheme[f]
				if len(ids) == 1 {
					nodeOf[ids[0]] = ids[0]
					gnodes = append(gnodes, gnode{ID: ids[0], Label: respLabel(ids[0]), Kind: "el", Sub: "in " + f})
					continue
				}
				vid := viewID(si) + "f" + itoa(len(themes))
				themes = append(themes, themeView{file: f, view: vid, ids: ids})
				for _, id := range ids {
					nodeOf[id] = "th:" + f
				}
				gnodes = append(gnodes, gnode{ID: "th:" + f, Label: f, Kind: "th", Sub: itoa(len(ids)) + " regions", Go: vid})
			}
		} else {
			for _, id := range s.flow {
				nodeOf[id] = id
				gnodes = append(gnodes, gnode{ID: id, Label: shortID(id), Kind: "el"})
			}
		}
		var readers, writers, inner []string
		for _, id := range s.flow {
			if reads[id] {
				readers = append(readers, id)
			}
			if writes[id] {
				writers = append(writers, id)
			}
			if consumesInner[id] {
				inner = append(inner, id)
			}
		}
		if len(readers) > 0 || !isKernel {
			for _, in := range inputs {
				gnodes = append(gnodes, gnode{ID: "in:" + in, Label: in, Kind: "in"})
				if len(readers) == 0 {
					addEdge("in:"+in, "lower:", "in", false)
					continue
				}
				for _, r := range readers {
					addEdge("in:"+in, nodeOf[r], "in", false)
				}
			}
		}
		if len(writers) > 0 {
			for _, out := range outputs {
				gnodes = append(gnodes, gnode{ID: "out:" + out, Label: out, Kind: "out"})
				for _, w := range writers {
					addEdge(nodeOf[w], "out:"+out, "out", false)
				}
			}
		}
		// the outer layer as explicit exchange nodes
		hasXin, hasXout := false, false
		for _, id := range s.flow {
			if consumesOuter[id] {
				hasXin = true
			}
			if consumedByOuter[id] {
				hasXout = true
			}
		}
		if hasXin {
			gnodes = append(gnodes, gnode{ID: "xin:", Label: "from " + outerName, Kind: "xin"})
			for _, id := range s.flow {
				if consumesOuter[id] {
					addEdge("xin:", nodeOf[id], "in", false)
				}
			}
		}
		if hasXout {
			gnodes = append(gnodes, gnode{ID: "xout:", Label: "→ " + outerName, Kind: "xout"})
			for _, id := range s.flow {
				if consumedByOuter[id] {
					addEdge(nodeOf[id], "xout:", "out", false)
				}
			}
		}
		if !isKernel {
			gnodes = append(gnodes, gnode{ID: "lower:", Label: "lower levels · " + innerName, Kind: "lower"})
			for _, id := range inner {
				// out-ish elements DRAW ON the lowers; the rest FEED them (left-to-right flow)
				if writes[id] || consumedByOuter[id] {
					addEdge("lower:", nodeOf[id], "lower", false)
				} else {
					addEdge(nodeOf[id], "lower:", "lower", false)
				}
			}
		}
		// intra-layer calls, aggregated to the BLOCK level: a cluster's internal region
		// arrows vanish here (level 2 shows them); parallel region arrows between two
		// blocks collapse onto one counted edge.
		for _, a := range s.flow {
			for _, bb := range consumes[a] {
				if layerOf[bb] != L {
					continue
				}
				tn, ok := nodeOf[bb]
				if !ok {
					continue // the target sits in the pills, not on the flow
				}
				if nodeOf[a] == tn {
					continue
				}
				addEdge(nodeOf[a], tn, "uses", true)
			}
		}
		gj, _ := json.Marshal(map[string]interface{}{"nodes": gnodes, "edges": gedges})
		b.WriteString(`<div class="onion-flow">`)
		b.WriteString(`<script type="application/json" class="og-data">` + string(gj) + `</script>`)
		b.WriteString(`<div class="ograph" data-oglower="` + innerView + `" aria-label="` + htmlEscape(L) + ` layer"><p class="meta og-fallback">the layer graph renders over the inlined graph library (it ships with the trace chapter)</p></div>`)
		b.WriteString(`</div>` + "\n")
		// off-flow design elements (own + pushed down from skipped outer layers, plus
		// model-mode ambient on the innermost view): infrastructure pills
		if len(s.infra) > 0 {
			b.WriteString(`<div class="onion-infra"><span class="il">infrastructure:</span>`)
			for _, id := range s.infra {
				if model != nil {
					// responsibility text on the pill; id + theme in the title (full text)
					b.WriteString(`<button type="button" data-node-link="` + htmlEscape(id) + `" title="` + htmlEscape(id+" — "+model.labelOf[id]+" (in "+theme(id)+")") + `">` + htmlEscape(respLabel(id)) + `</button>`)
					continue
				}
				b.WriteString(`<button type="button" data-node-link="` + htmlEscape(id) + `">` + htmlEscape(shortID(id)) + `</button>`)
			}
			b.WriteString(`</div>`)
		}
		b.WriteString("</div>\n")

		// --- level 2 (owner mid-i16 ruling): a theme cluster opens into ITS regions in this
		// layer — one pre-rendered view per cluster, the script only toggles (the dom-static
		// law). Blocks = the theme's regions (responsibility text, region id as subtitle);
		// arrows = the region-level calls within the theme, outgoing to peer themes
		// (aggregated per file), and to the lower levels. ---
		for _, th := range themes {
			inTheme := map[string]bool{}
			for _, id := range th.ids {
				inTheme[id] = true
			}
			var tns []gnode
			var tes []gedge
			add2 := mkAdd(&tes)
			for _, id := range th.ids {
				tns = append(tns, gnode{ID: id, Label: respLabel(id), Kind: "el", Sub: shortID(id)})
			}
			peers := map[string]bool{}
			lowerUsed := false
			for _, a := range th.ids {
				for _, bb := range consumes[a] {
					if inTheme[bb] {
						add2(a, bb, "uses", true)
						continue
					}
					if layerOf[bb] == L {
						if _, ok := nodeOf[bb]; !ok {
							continue // pills carry it, the flow does not
						}
						pf := theme(bb)
						if !peers[pf] {
							peers[pf] = true
							tns = append(tns, gnode{ID: "peer:" + pf, Label: pf, Kind: "peer"})
						}
						add2(a, "peer:"+pf, "uses", true)
						continue
					}
					if p, ok := svPos[layerOf[bb]]; ok && p > si {
						lowerUsed = true
						add2(a, "lower:", "lower", false)
					}
				}
			}
			if lowerUsed {
				tns = append(tns, gnode{ID: "lower:", Label: "lower levels · " + innerName, Kind: "lower"})
			}
			b.WriteString(`<div class="oview" id="` + th.view + `" hidden>` + "\n")
			b.WriteString(`<nav class="crumbs"><button type="button" data-onion-go="` + base + `0">overview</button> ▸ <button type="button" data-onion-go="` + viewID(si) + `">` + htmlEscape(L) + `</button> ▸ <span>` + htmlEscape(th.file) + `</span></nav>` + "\n")
			b.WriteString(`<nav class="crumbs"><button type="button" data-onion-go="` + viewID(si) + `">▲ ` + htmlEscape(L) + `</button></nav>` + "\n")
			gj2, _ := json.Marshal(map[string]interface{}{"nodes": tns, "edges": tes})
			b.WriteString(`<div class="onion-flow">`)
			b.WriteString(`<script type="application/json" class="og-data">` + string(gj2) + `</script>`)
			b.WriteString(`<div class="ograph" data-oglower="` + innerView + `" aria-label="` + htmlEscape(th.file) + ` regions in ` + htmlEscape(L) + `"><p class="meta og-fallback">the layer graph renders over the inlined graph library (it ships with the trace chapter)</p></div>`)
			b.WriteString(`</div>` + "\n")
			b.WriteString("</div>\n")
		}
	}
	b.WriteString("</div>\n")
	return b.String()
}

// enddesign

// design: go-onion-model-source  implements: req-models-in-book
// The onion's layer map derives from the engine-layers MODEL node
// (spec/models/model-engine-layers.md) — the authored truth since i16;
// spec/design-layers.md stays as the stub-project fallback. Rings = the model's
// REAL layers in declared order (innermost first; bands and ambient are never
// rings). The BLOCK unit is the model ELEMENT — a design region; files never
// rank and never convert to patterns (owner ruling: elements are design
// regions, files are themes). Allocation conventions:
//   - a band's ("outer--inner") elements merge into the INNER of its two named
//     rings — the transform feeds it
//   - ambient elements (and any unranked stray) map to "ambient": NO ring; the
//     renderer pins them to the innermost view's infrastructure pills
//   - a realized engine region the model does not allocate is ABSENT here; the
//     renderer's `unmapped` ring catches it (the sky-fall lint keeps it empty)
type modelOnion struct {
	rings   []string          // ring names, innermost first
	layerOf map[string]string // region id -> ring name ("ambient" = off the rings)
	labelOf map[string]string // region id -> the model's responsibility text
}

func modelOnionRegions() *modelOnion {
	raw, err := os.ReadFile(filepath.Join(SPEC, "models", "model-engine-layers.md"))
	if err != nil {
		return nil
	}
	g, _ := extractModelGraph(string(raw))
	rl := realLayers(g.Layers)
	if len(rl) == 0 || len(g.Elems) == 0 {
		return nil
	}
	rank := map[string]int{}
	for i, ly := range rl {
		rank[ly] = i
	}
	ringName := func(layer string) string {
		if _, ok := rank[layer]; ok {
			return layer
		}
		if a, b, isBand := strings.Cut(layer, "--"); isBand {
			ra, aok := rank[a]
			rb, bok := rank[b]
			switch {
			case aok && bok:
				if ra < rb {
					return a // the band's INNER named layer
				}
				return b
			case aok:
				return a
			case bok:
				return b
			}
		}
		return "ambient" // ambient, and any unranked stray, stays off the rings
	}
	mo := &modelOnion{rings: rl, layerOf: map[string]string{}, labelOf: map[string]string{}}
	for id, e := range g.Elems {
		mo.layerOf[id] = ringName(e.Layer)
		mo.labelOf[id] = e.Label
	}
	return mo
}

// onionLayerSource picks the onion's layer map: the model node when it exists
// (model non-nil — ring membership and labels come from it), spec/design-layers.md
// otherwise. In model mode the design-layers file still contributes only its
// exclude/inputs/outputs lines (the iteration-file excludes apply either way;
// the hardcoded set covers projects without one).
func onionLayerSource() (layers []onionLayer, excludes, inputs, outputs, infra []string, model *modelOnion) {
	layers, excludes, inputs, outputs, infra = readDesignLayers()
	if mo := modelOnionRegions(); mo != nil {
		model = mo
		layers = make([]onionLayer, len(mo.rings))
		for i, ly := range mo.rings {
			layers[i] = onionLayer{name: ly}
		}
		if len(excludes) == 0 {
			excludes = []string{"i*_build.go", "i*_red.go", "*_test.go"} // no design-layers.md around — same set, hardcoded
		}
	}
	return layers, excludes, inputs, outputs, infra, model
}

// enddesign

// design: go-trace-graph  implements: req-system-overview, req-compact-renders
// The trace chapter's per-need graph (bs13 ruling): it REUSES the report's per-need grouping
// (graphTabs/subtree/buildTab) - the report bakes those tabs into a cytoscape canvas, which the
// book cannot run under its zero-dependency CSP, so the SAME tab data renders here as a static
// SVG per need. One page per need (a tab bar toggles which need's graph shows); ALL nodes show by
// default (owner override of the report's collapse); each node is clickable and transports to its
// table row (data-node-link, shared handler); each node carries a [ch N] badge naming the chapter
// its item's table renders in, so a reader always knows where to read the detail.

// chapterNumbers maps each reader chapter's manifest id to its 1-based render number.
func chapterNumbers(nodes map[string]Node) map[string]int {
	var chs []Node
	for _, n := range nodes {
		if n.Type == "manifest" && (n.Mode == "chapter" || n.Mode == "guidance") {
			chs = append(chs, n)
		}
	}
	for i := 1; i < len(chs); i++ {
		for j := i; j > 0 && (chs[j].Order < chs[j-1].Order || (chs[j].Order == chs[j-1].Order && chs[j].ID < chs[j-1].ID)); j-- {
			chs[j], chs[j-1] = chs[j-1], chs[j]
		}
	}
	out := map[string]int{}
	for i, c := range chs {
		out[c.ID] = i + 1
	}
	return out
}

// typeChapterID names the chapter whose tables render each trace type (bs20 layout: decisions
// moved to the project chapter).
var typeChapterID = map[string]string{
	"need": "man-ch3-design-input", "usecase": "man-ch3-design-input",
	"requirement": "man-ch3-design-input", "design": "man-ch4-design-output",
	"test": "man-ch5-verification-validation", "adr": "man-ch6-project",
}

func renderTraceGraph(nodes map[string]Node) string {
	sm := StatusMap(nodes)
	// REUSE the report trace graph verbatim (design go-trace-graph, bs13 ruling): the SAME per-need
	// tabs, cytoscape+dagre layout, styles, legend toggles, and filter as the report - only the node
	// tap differs. The report opens its detail panel; here QUACK_NODE_TAP transports to the item table
	// row in the chapter that owns it. The three drawing libraries inline (owner ruling 2026-07-08:
	// CDN caching is per-site since ~2020 and unreliable for a file:// book, so inline is the only way
	// to KEEP the graph working offline after the book is received - the book stays fully self-contained,
	// its "no external requests" property intact).
	data := map[string]interface{}{
		"tabs":   graphTabs(nodes, sm),
		"checks": checksMap(nodes, sm, dataDirFor("out")),
	}
	gdata, _ := json.Marshal(data)
	chNum := chapterNumbers(nodes)
	chcap := func(id string) string {
		if n, ok := chNum[id]; ok {
			return itoa(n)
		}
		return "?"
	}
	// the book legend defaults EVERY type on (owner c25: render all by default, incl design and adr) -
	// the report's own default (design/adr off) does not carry into the book.
	bookLegend := `<div class=legend>` +
		`<label class=lg><input type=checkbox class=tytog data-type=need checked><i class='sw need'></i>need</label>` +
		`<label class=lg><input type=checkbox class=tytog data-type=usecase checked><i class='sw usecase'></i>use-case</label>` +
		`<label class=lg><input type=checkbox class=tytog data-type=requirement checked><i class='sw requirement'></i>requirement</label>` +
		`<label class=lg><input type=checkbox class=tytog data-type=design checked><i class='sw design'></i>design</label>` +
		`<label class=lg><input type=checkbox class=tytog data-type=test checked><i class='sw test'></i>test</label>` +
		`<label class=lg><input type=checkbox class=tytog data-type=adr checked><i class='sw adr'></i>ADR</label></div>`
	var b strings.Builder
	b.WriteString(`<div class="tgraph">`)
	// chapter marking lives OUTSIDE the 1:1 graph (owner c27: render it as a list): a node colour is
	// its type; this says which chapter each type's table sits in, and a click transports there.
	b.WriteString(`<p class="meta">Click any node to open its row in the chapter that owns it:</p><ul class="meta tg-chmap">` +
		`<li>needs, use-cases, and requirements — chapter ` + chcap("man-ch3-design-input") + `</li>` +
		`<li>designs — chapter ` + chcap("man-ch4-design-output") + `</li>` +
		`<li>tests — chapter ` + chcap("man-ch5-verification-validation") + `</li>` +
		`<li>decisions — chapter ` + chcap("man-ch6-project") + `</li></ul>`)
	b.WriteString(`<div id="tabbar" class="tabbar"></div>`)
	b.WriteString(`<div class="legendrow">` + bookLegend +
		`<input id="trace-filter" placeholder="filter… (click for help)" title="filter the graph" autocomplete="off"><button id="filter-clear" title="clear the filter">&#215;</button></div>`)
	b.WriteString(`<div id="graph"></div>`)
	b.WriteString(`<div id="detail" hidden></div>`)
	// the ONE override: a node tap jumps to the item table row, expands it, pages to it, and pushes a
	// history entry so the browser BACK returns to the graph (owner c23: on back, come back here).
	b.WriteString(`<script>window.QUACK_DATA=` + string(gdata) + `;` +
		`window.QUACK_NODE_TAP=function(id){var s=document.querySelector('.urow[data-node="'+id+'"]')||document.querySelector('[data-node="'+id+'"]');if(!s)return;` +
		`window.__quackNav=window.__quackNav||[];window.__quackNav.push('trace');` +
		`try{history.pushState({nav:'trace'},"");}catch(e){}` +
		`var ut=s.closest?s.closest('.utable'):null;if(ut&&ut.revealRow){var rr=ut.revealRow(id);if(rr)s=rr;}` +
		`if(window.bookPageTo)window.bookPageTo(s);var d=s.closest('details');if(d)d.open=true;` +
		`s.scrollIntoView({block:"center"});};` +
		`window.addEventListener('popstate',function(){var nv=window.__quackNav||[];` +
		`if(nv.length===0||nv[nv.length-1]!=='trace')return;nv.pop();var g=document.getElementById('graph');` +
		`if(g&&window.bookPageTo){window.bookPageTo(g);g.scrollIntoView({block:"start"});}});</script>`)
	b.WriteString(`<script>` + assetJS("cytoscape.min.js") + `</script>`)
	b.WriteString(`<script>` + assetJS("dagre.min.js") + `</script>`)
	b.WriteString(`<script>` + assetJS("cytoscape-dagre.js") + `</script>`)
	b.WriteString(`<script>` + reportJS + `</script>`)
	b.WriteString(`</div>`)
	return b.String()
}

// enddesign

func svgTimeline(items []string) string {
	fig := figNext()
	var b strings.Builder
	w := 80 + len(items)*130
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 %d 120" font-family="system-ui" font-size="12" role="img" aria-label="timeline">`, w))
	b.WriteString(fmt.Sprintf(`<line x1="40" y1="60" x2="%d" y2="60" stroke="#4a6fa5" stroke-width="2"/>`, w-40))
	for i, it := range items {
		x := 80 + i*130
		b.WriteString(fmt.Sprintf(`<g id="%s"><circle cx="%d" cy="60" r="6" fill="#4a6fa5"/><text x="%d" y="92" text-anchor="middle">%s</text></g>`, figElemID(fig, it), x, x, htmlEscape(it)))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

func svgMatrix(rows []string, cells map[string][]string) string {
	fig := figNext()
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
		b.WriteString(fmt.Sprintf(`<g id="%s"><text x="20" y="%d">%s</text><text x="220" y="%d">%s</text></g>`, figElemID(fig, r), y, htmlEscape(r), y, htmlEscape(joined)))
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
// Queries pool centrally (owner ruling 2026-07-05 evening): an inline block in a manifest
// is a smell - the canonical home is spec/queries/, and a unit references a pooled query
// with the Obsidian-native embed ![[name.base]] (Obsidian previews it live; the emitter
// inlines the file and evaluates it exactly like an authored block). A missing pooled
// query is a render-failing finding, never a silent skip.
var retiredFigKinds = map[string]string{
	"vv-table":           "(req-fig-tables) - embed its canned base query from method/templates/documents/spec/queries",
	"stakeholder-matrix": "(req-fig-tables) - embed its canned base query from method/templates/documents/spec/queries",
	"candidates-matrix":  "(req-candidates-timeline) - the record lives with the project chapter: the timeline reaches each iteration's candidates and decisions",
}

var queriesDirOverride string // test seam: an alternate pooled-query dir for fixtures

func queriesDir() string {
	if queriesDirOverride != "" {
		return queriesDirOverride
	}
	return filepath.Join(SPEC, "queries")
}

// baseEmbedRe matches an Obsidian embed of a pooled query: ![[name.base]] or
// ![[name.base#View Name]] (an optional |alias is tolerated and ignored; a path
// prefix resolves by its basename).
var baseEmbedRe = regexp.MustCompile(`!\[\[([^\]|#]+\.base)(?:#([^\]|]+))?(?:\|[^\]]*)?\]\]`)

// baseUseRe matches one base usage in a unit body: an authored inline block (group 1)
// or a pooled-query embed (groups 2+3, the file and the optional view).
var baseUseRe = regexp.MustCompile("(?s)```base\\s*\\n(.*?)```|!\\[\\[([^\\]|#]+\\.base)(?:#([^\\]|]+))?(?:\\|[^\\]]*)?\\]\\]")

// baseRefdRe spots the `referenced` predicate - those queries defer until the whole
// chapter pass has built the link graph.
var baseRefdRe = regexp.MustCompile(`\breferenced\b`)

// baseDeferred is one referenced-query awaiting the post-chapter evaluation pass.
type baseDeferred struct {
	token  string
	text   string
	view   string
	anchor string
}

// renderUnitBody renders a unit's markdown, evaluating base usages (inline blocks and
// pooled-query embeds) to tables, full sections, or state-aware ref sections. A
// `referenced` query defers via a placeholder token; the post-chapter pass evaluates it
// with the complete link graph.
func renderUnitBody(body string, nodes map[string]Node, aliasIdx map[string]string, findings *[]string, deferred *[]baseDeferred, sm map[string]string, bl map[string]Event, anchor string) string {
	uses := baseUseRe.FindAllStringSubmatchIndex(body, -1)
	if len(uses) == 0 {
		return mdLite(AutoLink(body, aliasIdx))
	}
	var out strings.Builder
	last := 0
	for _, m := range uses {
		if seg := body[last:m[0]]; strings.TrimSpace(seg) != "" {
			out.WriteString(mdLite(AutoLink(seg, aliasIdx)))
		}
		last = m[1]
		text, view := "", ""
		if m[2] >= 0 { // authored inline block
			text = body[m[2]:m[3]]
		} else { // pooled-query embed
			name := filepath.Base(strings.TrimSpace(body[m[4]:m[5]]))
			if m[6] >= 0 {
				view = strings.TrimSpace(body[m[6]:m[7]])
			}
			raw, err := os.ReadFile(filepath.Join(queriesDir(), name))
			if err != nil {
				*findings = append(*findings, "base: pooled query "+name+" not found in spec/queries")
				continue
			}
			text = string(raw)
		}
		if deferred != nil && baseRefdRe.MatchString(text) {
			token := "<!--base-deferred-" + itoa(len(*deferred)) + "-->"
			*deferred = append(*deferred, baseDeferred{token: token, text: text, view: view, anchor: anchor + "-d" + itoa(len(*deferred))})
			out.WriteString(token + "\n")
			continue
		}
		out.WriteString(renderBaseHTML(text, view, nodes, findings, nil, sm, bl, anchor))
	}
	if seg := body[last:]; strings.TrimSpace(seg) != "" {
		out.WriteString(mdLite(AutoLink(seg, aliasIdx)))
	}
	return out.String()
}

// baseEvalPaths collects the note files a base query evaluates over: every node file plus
// the content notes. ONE referent for the renderer and the orphan lint - they must agree.
func baseEvalPaths(nodes map[string]Node) []string {
	seen := map[string]bool{}
	var paths []string
	for _, n := range nodes {
		if n.Path != "" && strings.HasSuffix(n.Path, ".md") && !seen[n.Path] {
			seen[n.Path] = true
			paths = append(paths, n.Path)
		}
	}
	for _, kind := range []string{"glossary", "references", "fundamentals", "methods"} {
		for _, c := range ReadContentNotes(kind) {
			if !seen[c.Path] {
				seen[c.Path] = true
				paths = append(paths, c.Path)
			}
		}
	}
	return paths
}

// renderBaseHTML evaluates one base query over the workspace's node files and content
// notes. A named view renders alone; the pull-law link graph arrives via used; sm/bl and
// the anchor base serve the refs render mode.
func renderBaseHTML(text string, viewName string, nodes map[string]Node, findings *[]string, used map[string]bool, sm map[string]string, bl map[string]Event, anchorBase string) string {
	results, err := EvalBaseUsed(text, baseEvalPaths(nodes), nodes, used)
	if err != nil {
		*findings = append(*findings, "base: "+err.Error())
		return `<p class="missing">base query error (see findings)</p>` + "\n"
	}
	if viewName != "" {
		var picked []BaseResult
		for _, r := range results {
			if r.Name == viewName {
				picked = append(picked, r)
			}
		}
		if len(picked) == 0 {
			*findings = append(*findings, "base: view "+viewName+" not found in the embedded query")
			return `<p class="missing">base query error (see findings)</p>` + "\n"
		}
		results = picked
	}
	return baseResultHTML(results, nodes, sm, bl, anchorBase)
}

// baseResultHTML renders evaluation results: semantic tables (WCAG: real th headers),
// full sections with note bodies (render: full, section id = the note slug), or
// state-aware node sections (render: refs - each row through renderNodeAtDepth).
func baseResultHTML(rs []BaseResult, nodes map[string]Node, sm map[string]string, bl map[string]Event, anchorBase string) string {
	var b strings.Builder
	for ri, r := range rs {
		if r.Full {
			b.WriteString(renderBaseFull(r))
			continue
		}
		if r.Refs {
			// design: go-render-refs  implements: req-render-refs
			// A refs view hands its rows to the SAME renderer ref units use - gate state,
			// verdict links, and depth mechanics ride along; Obsidian previews the rows as
			// a plain table (the render key is ignored there).
			depth := r.Depth
			if depth < 1 {
				depth = 1
			}
			empty := true
			rn := 0
			for _, g := range r.Groups {
				grouped := g.Key != ""
				if grouped {
					// a grouped refs view discloses per group (owner ruling 2026-07-07): when the
					// key is a node id, the summary carries that node's statement - click the need
					// to see its use cases. Same disc markup as depth layers: until-found and
					// EXPAND ALL keep working.
					label := strings.ToUpper(g.Key[:1]) + g.Key[1:]
					if kn, ok := nodes[g.Key]; ok && kn.Statement != "" {
						label = kn.Statement
					}
					b.WriteString(`<details class="disc" data-dl="0"><summary>` + htmlEscape(label) +
						` <span class="meta">(` + itoa(g.Count) + `)</span></summary><div hidden="until-found">` + "\n")
				}
				for _, row := range g.Rows {
					empty = false
					b.WriteString(renderNodeAtDepth(row.ID, depth, nodes, sm, bl, anchorBase+"-q"+itoa(ri)+"r"+itoa(rn)))
					rn++
				}
				if grouped {
					b.WriteString("</div></details>\n")
				}
			}
			if empty {
				b.WriteString(`<p class="meta">no rows yet — the query renders as items arrive</p>` + "\n")
			}
			// enddesign
			continue
		}
		// design: go-q-table  implements: req-table-render, req-table-noise, req-table-interact, req-table-expand, req-compact-renders, req-table-facets
		// Combinable pill FACETS ride above the table (AND across facets, OR within one): a
		// universal need facet for trace items plus one facet per small-enum column - never a
		// pill per item.
		// The universal query table (field c10/c21/c27/c30/c40): a real thead with a clear
		// header row, separated cells, rendered even with zero rows; the empty-value
		// "(none)" bucket header never renders (its rows still do). Interactivity is
		// STATIC DOM: a filter row with a text input plus one select per enum column
		// (small distinct value set, derived from the rows at emit); ungrouped tables
		// carry data-sortable and the shell script sorts by MOVING existing rows.
		// Since bs20 every row with an id is EXPANDABLE (req-table-expand): a static
		// detail row (statement, meta, body prose) follows it, hidden until toggled;
		// expand-all/collapse-all buttons ride the filter row. A table beyond twenty
		// rows pages BY NEED: each row is stamped with the first need its item traces
		// up to (refines/verifies/implements walked upward, deterministic order),
		// needless rows land on the last page, buckets chunk at twenty. Off-page rows
		// carry hidden AT EMIT, so the no-script default is one bounded page
		// (req-compact-renders); the pager only toggles visibility.
		// The unified reader table (owner review 2026-07-08): ONE interactive pattern everywhere.
		// A row is the item NAME with a disclosure triangle; the expand carries the statement, the
		// remaining fields, and the body. Combinable FILTER PILL facets ride above the table - a
		// "need" facet plus one per small-distinct-value column. The controls below - filter box,
		// expand/collapse-all, page size, pager - sit right-aligned. Pagination is client-side,
		// default 20, configurable. Rows keep data-node for trace-graph transport; the script only toggles.
		enumCols := []int{}
		for ci := 1; ci < len(r.Columns); ci++ {
			distinct := map[string]bool{}
			enum := true
			for _, g := range r.Groups {
				for _, row := range g.Rows {
					if ci >= len(row.Cells) || row.Cells[ci] == "" {
						continue
					}
					if len(row.Cells[ci]) > 24 {
						enum = false
					}
					distinct[row.Cells[ci]] = true
				}
			}
			if enum && len(distinct) >= 2 && len(distinct) <= 8 {
				enumCols = append(enumCols, ci)
			}
		}
		// briefCol: a description-like column supplies the short one-liner for the brief
		// column (the item statement is usually too long). First match wins.
		briefCol := -1
		for ci := 1; ci < len(r.Columns); ci++ {
			switch strings.ToLower(r.Columns[ci]) {
			case "description", "brief", "summary", "desc":
				briefCol = ci
			}
			if briefCol >= 0 {
				break
			}
		}
		// needOf(id): the smallest need id an item traces up to (refines/verifies/implements,
		// sorted, cycle-guarded, memoized). Every trace item belongs to a need indirectly, so
		// "need" makes a good universal filter facet.
		needMemo := map[string]string{}
		var needOf func(id string) string
		needOf = func(id string) string {
			if v, ok := needMemo[id]; ok {
				return v
			}
			needMemo[id] = "" // in-progress guard: a re-entrant hit breaks the cycle
			n, ok := nodes[id]
			if !ok {
				return ""
			}
			if n.Type == "need" {
				needMemo[id] = id
				return id
			}
			parents := append([]string{}, n.Refines...)
			parents = append(parents, n.Verifies...)
			parents = append(parents, n.Implements...)
			sortStrings(parents)
			best := ""
			for _, p := range parents {
				if nd := needOf(p); nd != "" && (best == "" || nd < best) {
					best = nd
				}
			}
			needMemo[id] = best
			return best
		}
		needCount := map[string]int{}
		for _, g := range r.Groups {
			for _, row := range g.Rows {
				if nd := needOf(row.ID); nd != "" {
					needCount[nd]++
				}
			}
		}
		tid := "ut" + itoa(figNext())
		b.WriteString(`<div class="utable" id="` + tid + `">`)
		if r.Name != "" {
			b.WriteString(`<p class="utable-cap">` + htmlEscape(r.Name) + `</p>`)
		}
		// MULTIPLE pill facets, each its own combinable .upills row (AND across facets, OR within
		// one). A pill facet per column of small distinct value set (the enumCols), plus a universal
		// "need" facet (every trace item traces up to a need). Cap needs at ~16: beyond that it is
		// one-per-item, not a filter.
		if len(needCount) >= 2 && len(needCount) <= 16 {
			needs := []string{}
			for k := range needCount {
				needs = append(needs, k)
			}
			sortStrings(needs)
			b.WriteString(`<div class="upills" data-facet="need"><span class="pilllbl">need</span><button type="button" class="upill on" data-fv="*">all</button>`)
			for _, nd := range needs {
				b.WriteString(` <button type="button" class="upill" data-fv="` + htmlEscape(nd) + `">` + htmlEscape(nd) + ` <span class="meta">(` + itoa(needCount[nd]) + `)</span></button>`)
			}
			b.WriteString(`</div>`)
		}
		for _, ci := range enumCols {
			vals := []string{}
			seen := map[string]bool{}
			cnt := map[string]int{}
			for _, g := range r.Groups {
				for _, row := range g.Rows {
					if ci < len(row.Cells) && row.Cells[ci] != "" {
						if !seen[row.Cells[ci]] {
							seen[row.Cells[ci]] = true
							vals = append(vals, row.Cells[ci])
						}
						cnt[row.Cells[ci]]++
					}
				}
			}
			sortStrings(vals)
			b.WriteString(`<div class="upills" data-facet="e` + itoa(ci) + `"><span class="pilllbl">` + htmlEscape(r.Columns[ci]) + `</span><button type="button" class="upill on" data-fv="*">all</button>`)
			for _, v := range vals {
				b.WriteString(` <button type="button" class="upill" data-fv="` + htmlEscape(v) + `">` + htmlEscape(v) + ` <span class="meta">(` + itoa(cnt[v]) + `)</span></button>`)
			}
			b.WriteString(`</div>`)
		}
		b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">name</th><th scope="col">brief</th></tr></thead><tbody>`)
		empty := true
		for _, g := range r.Groups {
			for _, row := range g.Rows {
				empty = false
				name := row.ID
				if len(row.Cells) > 0 && strings.TrimSpace(row.Cells[0]) != "" {
					name = row.Cells[0]
				}
				cls := "urow"
				for _, fc := range row.Facets {
					cls += " " + fc
				}
				expandable := row.ID != "" && (row.Head != "" || row.Body != "" || len(row.Cells) > 1)
				attr := ""
				if row.ID != "" {
					attr += ` data-node="` + htmlEscape(row.ID) + `"`
				}
				if g.Key != "" && g.Key != "(none)" {
					attr += ` data-gp="` + htmlEscape(g.Key) + `"`
				}
				var txt strings.Builder
				for _, c := range row.Cells {
					txt.WriteString(strings.ToLower(c) + " ")
				}
				txt.WriteString(strings.ToLower(row.Head))
				attr += ` data-text="` + htmlEscape(txt.String()) + `"`
				for _, ci := range enumCols {
					if ci < len(row.Cells) {
						attr += ` data-e` + itoa(ci) + `="` + htmlEscape(row.Cells[ci]) + `"`
					}
				}
				attr += ` data-need="` + htmlEscape(needOf(row.ID)) + `"`
				// brief: a SHORT one-liner or empty. A description-like column wins (<=110 chars);
				// else the statement only when it is itself short (<=80) and differs from the name;
				// else empty (a long EARS statement is not a brief - it shows in the expand).
				brief := ""
				if briefCol >= 0 && briefCol < len(row.Cells) {
					if v := strings.TrimSpace(row.Cells[briefCol]); v != "" && len(v) <= 110 {
						brief = v
					}
				}
				if brief == "" && row.Head != "" && len(row.Head) <= 80 && row.Head != name {
					brief = row.Head
				}
				tri := ""
				if expandable {
					cls += " qt-exp"
					tri = `<span class="utri" aria-hidden="true"></span>`
				}
				b.WriteString(`<tr class="` + htmlEscape(cls) + `"` + attr + `><td>` + tri + htmlEscape(name) + `</td><td class="ubrief">` + htmlEscape(brief) + `</td></tr>`)
				if expandable {
					b.WriteString(`<tr class="udetail" hidden><td colspan="2">`)
					// a statement that is not the brief (a long EARS sentence) still shows here.
					if row.Head != "" && row.Head != name && row.Head != brief {
						b.WriteString(`<p class="stmt">` + htmlEscape(row.Head) + `</p>`)
					}
					for ci := 1; ci < len(r.Columns) && ci < len(row.Cells); ci++ {
						if strings.TrimSpace(row.Cells[ci]) == "" || row.Cells[ci] == brief {
							continue
						}
						b.WriteString(`<p class="ufield"><span class="ufl">` + htmlEscape(r.Columns[ci]) + `:</span> ` + htmlEscape(row.Cells[ci]) + `</p>`)
					}
					b.WriteString(`<p class="meta">` + htmlEscape(row.ID) + `</p>`)
					if row.Body != "" {
						b.WriteString(`<div data-layer="informative">` + mdLite(row.Body) + `</div>`)
					}
					b.WriteString(`</td></tr>`)
				}
			}
		}
		b.WriteString(`</tbody></table>`)
		if empty {
			b.WriteString(`<p class="meta">no rows yet — the query renders as items arrive</p>`)
		} else {
			b.WriteString(`<div class="ucontrols">`)
			b.WriteString(`<button type="button" class="qt-xall">expand all</button><button type="button" class="qt-call">collapse all</button>`)
			b.WriteString(`<input class="qt-search" type="search" placeholder="filter…">`)
			// the enum columns are pill facets above the table now; only the text filter, the
			// page-size select, and the pager live below.
			b.WriteString(`<label class="qt-sizel">show <select class="qt-size"><option>20</option><option>50</option><option value="0">all</option></select></label>`)
			b.WriteString(`<span class="qt-pager"><button type="button" class="qt-prev" aria-label="previous page">&#8249;</button><span class="qt-pos"></span><button type="button" class="qt-next" aria-label="next page">&#8250;</button></span>`)
			b.WriteString(`</div>`)
		}
		b.WriteString(`</div>`)
		// enddesign
	}
	return b.String()
}

// renderBaseFull renders one full view: a section per row (headline, meta cells, body).
// Group keys become headings, capitalized (Normative before Informative rides on the
// groupBy sort entry).
func renderBaseFull(r BaseResult) string {
	var b strings.Builder
	empty := true
	for _, g := range r.Groups {
		if g.Key != "" {
			// a nested group divider (e.g. "Informative") must not out-size the section
			// heading that introduces the query (a `##` -> h3); h3 keeps it consistent, never
			// larger (owner review c22).
			b.WriteString(`<h3>` + htmlEscape(strings.ToUpper(g.Key[:1])+g.Key[1:]) + `</h3>` + "\n")
		}
		for _, row := range g.Rows {
			empty = false
			meta := ""
			for i, cell := range row.Cells {
				if cell == "" || cell == row.Head || (i < len(r.Columns) && r.Columns[i] == "file.name") {
					continue
				}
				if strings.HasPrefix(cell, "http://") || strings.HasPrefix(cell, "https://") {
					meta += ` — <a href="` + htmlEscape(cell) + `">` + htmlEscape(cell) + `</a>`
				} else {
					meta += `, ` + htmlEscape(cell)
				}
			}
			b.WriteString(`<section id="` + htmlEscape(row.ID) + `" data-layer="informative"><p class="stmt"><strong>` + htmlEscape(row.Head) + `</strong>` + meta + "</p>\n")
			if row.Body != "" {
				b.WriteString(mdLite(row.Body))
			}
			b.WriteString("</section>\n")
		}
	}
	if empty {
		b.WriteString(`<p class="meta">no entries yet — the pull law renders them as chapters use them</p>` + "\n")
	}
	return b.String()
}

// enddesign

func renderFigure(kind string, nodes map[string]Node) string {
	if kind == "model" || strings.HasPrefix(kind, "model ") {
		// structural models in the design output chapter (go-model-render, i16)
		return renderModelFigure(strings.TrimSpace(strings.TrimPrefix(kind, "model")), nodes)
	}
	switch kind {
	case "context-star":
		// design: go-context-neighbours  implements: req-context-diagram
		// The context star derives from the modeled neighbour notes (type: neighbour, id
		// nbr-<name>): one border-connected node per note, sorted for determinism - never
		// an invented actor (the class-derived star died with the owner's 2026-07-09 ruling).
		// direction `in` (or none) feeds the system and sits LEFT; `out` consumes from it
		// and sits RIGHT. With no neighbour notes the figure says so. rectBorder ends every
		// connector at the node's border, so no line crosses the centre node.
		var ins, outs []string
		for id, n := range nodes {
			if n.Type != "neighbour" {
				continue
			}
			if n.Direction == "out" {
				outs = append(outs, strings.TrimPrefix(id, "nbr-"))
			} else {
				ins = append(ins, strings.TrimPrefix(id, "nbr-"))
			}
		}
		if len(ins)+len(outs) == 0 {
			return `<p class="meta">no neighbour notes yet — the context star renders as nbr- notes arrive</p>`
		}
		sortStrings(ins)
		sortStrings(outs)
		return svgContextStar(brand(), ins, outs)
		// enddesign
	case "timeline":
		return svgTimeline(versions())
	case "ucfn-board":
		return renderUcfnBoard(nodes)
	case "block-tree":
		// design: go-block-tree-design  implements: req-block-tree-design
		// The block tree draws the SYSTEM's design elements (code-marker designs and des-
		// notes), never the book's own chapters - every project got a picture of its
		// document structure in its architecture chapter (template red-team, 2026-07-06).
		var blocks []string
		for id, n := range nodes {
			if n.Type == "design" {
				blocks = append(blocks, id)
			}
		}
		sortStrings(blocks)
		if len(blocks) == 0 {
			return `<p class="meta">no design elements yet — the tree renders as designs arrive</p>`
		}
		return svgBlockTree(brand()+" — the system", blocks)
		// enddesign
	case "results-exception":
		// design: go-results-exception  implements: req-results-exception
		// Ledger-state views are FIG kinds, never base queries - state lives in the
		// ledger, not frontmatter. The green mass summarizes as a count; failures and
		// accepted deviations render prominently, by exception (the lab rule).
		sm := StatusMap(nodes)
		var ids []string
		for id := range nodes {
			ids = append(ids, id)
		}
		sortStrings(ids)
		pass, total := 0, 0
		var bad []string
		for _, id := range ids {
			st := strings.ToLower(sm[id])
			if st == "" || st == "content" {
				continue
			}
			total++
			if st == "done" || st == "ok" {
				pass++
				continue
			}
			bad = append(bad, id+" — "+stateTag(st))
		}
		var b strings.Builder
		b.WriteString(`<div data-layer="derived" aria-label="results by exception">` + "\n")
		b.WriteString(`<p class="meta">` + itoa(pass) + ` of ` + itoa(total) + ` checks verified — what follows renders by exception</p>` + "\n")
		if len(bad) == 0 {
			b.WriteString(`<p>No failing or unverified check on this board.</p>` + "\n")
		} else {
			b.WriteString("<ul>\n")
			for _, f := range bad {
				b.WriteString(`<li class="state-suspect">` + htmlEscape(f) + "</li>\n")
			}
			b.WriteString("</ul>\n")
		}
		b.WriteString(`<h2>Accepted deviations</h2>` + "\n")
		wv := 0
		for _, id := range ids {
			n := nodes[id]
			if n.Type == "adr" && n.Kind == "waiver" {
				wv++
				b.WriteString(`<p class="stmt"><strong>` + htmlEscape(n.Statement) + `</strong> <span class="meta">(` + htmlEscape(id) + `)</span></p>` + "\n")
			}
		}
		if wv == 0 {
			b.WriteString(`<p class="meta">none — no failure has been accepted</p>` + "\n")
		}
		b.WriteString("</div>\n")
		return b.String()
		// enddesign
	case "coverage-board":
		return renderCoverageBoard(nodes)
	case "onion":
		return renderOnion(nodes)
	case "readme":
		// the project README rendered as the home chapter (owner c14): the first page the reader
		// sees. Improve the README itself later; the book just projects it.
		raw, err := os.ReadFile(filepath.Join(ROOT, "README.md"))
		if err != nil || strings.TrimSpace(string(raw)) == "" {
			return `<p class="meta">no README.md at the project root yet</p>`
		}
		return renderReadme(string(raw))
	case "trace-graph":
		return renderTraceGraph(nodes)
	case "vv-exceptions":
		// design: go-vv-exceptions  implements: req-vv-exceptions, req-compact-renders
		// The verdict-first block (bs20 ruling, the no-green-ocean law): the verified mass is
		// ONE derived count; every requirement with no verifying test renders prominently by
		// name before the full matrix. Zero exceptions collapse to one green sentence.
		verified := map[string]bool{}
		for _, n := range nodes {
			if n.Type == "test" {
				for _, r := range n.Verifies {
					verified[r] = true
				}
			}
		}
		var reqIDs, missing []string
		for id, n := range nodes {
			if n.Type == "requirement" {
				reqIDs = append(reqIDs, id)
				if !verified[id] {
					missing = append(missing, id)
				}
			}
		}
		sortStrings(reqIDs)
		sortStrings(missing)
		var b strings.Builder
		b.WriteString(`<div data-layer="derived" aria-label="verification by exception">` + "\n")
		if len(missing) == 0 {
			// owner c36: read it as N/N and make it green
			b.WriteString(`<p class="stmt state-ok"><strong>✓ ` + itoa(len(reqIDs)) + ` / ` + itoa(len(reqIDs)) + ` requirements verified.</strong></p>` + "\n")
		} else {
			b.WriteString(`<p class="stmt state-suspect"><strong>` + itoa(len(reqIDs)-len(missing)) + ` / ` + itoa(len(reqIDs)) +
				` requirements verified — ` + itoa(len(missing)) + ` unverified:</strong></p>` + "\n")
			b.WriteString(`<table class="q-table" data-layer="derived"><thead><tr><th scope="col">requirement</th><th scope="col">statement</th><th scope="col">why visible</th></tr></thead><tbody>` + "\n")
			for _, id := range missing {
				b.WriteString(`<tr class="state-suspect"><td>` + htmlEscape(id) + `</td><td>` + htmlEscape(nodes[id].Statement) + `</td><td>no verifying test</td></tr>` + "\n")
			}
			b.WriteString("</tbody></table>\n")
		}
		b.WriteString("</div>\n")
		return b.String()
		// enddesign
	case "project-table":
		// design: go-project-record  implements: req-candidates-timeline, req-verdict-order
		// The project view is the record of how the architecture came to be (bs20 ruling):
		// every iteration with its gate tally, expandable to its decisions and the candidates
		// they weighed - grouped per axis with that axis's own rating criteria (no sparse
		// union table). The verdict scan walks adr ids SORTED - a map-order walk rendered a
		// double-claimed candidate nondeterministically (red-team find, 2026-07-06); the
		// double claim itself is a lint finding (candidateClaimFindings).
		sm := StatusMap(nodes)
		var adrIDs []string
		for id, n := range nodes {
			if n.Type == "adr" {
				adrIDs = append(adrIDs, id)
			}
		}
		sortStrings(adrIDs)
		verdict := func(id string) string {
			for _, aid := range adrIDs {
				n := nodes[aid]
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
			// the iteration's candidates (by path) and the decisions that claimed them
			var cands []Node
			for _, n := range nodes {
				if n.Type == "candidate" && iterOf(n.Path) == v {
					cands = append(cands, n)
				}
			}
			for i := 1; i < len(cands); i++ {
				for j := i; j > 0 && (cands[j].Axis < cands[j-1].Axis || (cands[j].Axis == cands[j-1].Axis && cands[j].ID < cands[j-1].ID)); j-- {
					cands[j], cands[j-1] = cands[j-1], cands[j]
				}
			}
			decs := map[string]bool{}
			for _, aid := range adrIDs {
				n := nodes[aid]
				if iterOf(n.Path) == v {
					decs[aid] = true
				}
				for _, c := range append(append([]string{}, n.Chosen...), n.Rejected...) {
					if cn, ok := nodes[c]; ok && iterOf(cn.Path) == v {
						decs[aid] = true
					}
				}
			}
			var decIDs []string
			for id := range decs {
				decIDs = append(decIDs, id)
			}
			sortStrings(decIDs)
			b.WriteString(`<details class="disc" data-dl="0"><summary>` + htmlEscape(v) +
				` <span class="meta">(gates ` + itoa(done) + `/` + itoa(total) + `, decisions ` + itoa(len(decIDs)) + `, candidates ` + itoa(len(cands)) + `)</span></summary><div hidden="until-found">` + "\n")
			if len(decIDs) > 0 {
				b.WriteString(`<table class="q-table" data-layer="derived"><thead><tr><th scope="col">decision</th><th scope="col">statement</th></tr></thead><tbody>` + "\n")
				for _, id := range decIDs {
					b.WriteString("<tr><td>" + htmlEscape(id) + "</td><td>" + htmlEscape(nodes[id].Statement) + "</td></tr>\n")
				}
				b.WriteString("</tbody></table>\n")
			}
			// one compact Pugh table PER AXIS: only that axis's criteria, no sparse union
			for ai := 0; ai < len(cands); {
				axis := cands[ai].Axis
				aj := ai
				critSet := map[string]bool{}
				for ; aj < len(cands) && cands[aj].Axis == axis; aj++ {
					for c := range cands[aj].Maps["ratings"] {
						critSet[c] = true
					}
				}
				var crits []string
				for c := range critSet {
					crits = append(crits, c)
				}
				sortStrings(crits)
				b.WriteString(`<table class="q-table" data-layer="derived"><caption>` + htmlEscape(axis) + `</caption><thead><tr><th scope="col">candidate</th>`)
				for _, c := range crits {
					b.WriteString(`<th scope="col">` + htmlEscape(c) + `</th>`)
				}
				b.WriteString(`<th scope="col">decision</th></tr></thead><tbody>` + "\n")
				for k := ai; k < aj; k++ {
					b.WriteString("<tr><td>" + htmlEscape(cands[k].ID) + "</td>")
					for _, c := range crits {
						b.WriteString("<td>" + htmlEscape(cands[k].Maps["ratings"][c]) + "</td>")
					}
					b.WriteString("<td>" + htmlEscape(verdict(cands[k].ID)) + "</td></tr>\n")
				}
				b.WriteString("</tbody></table>\n")
				ai = aj
			}
			if len(decIDs) == 0 && len(cands) == 0 {
				b.WriteString(`<p class="meta">no recorded decisions or candidates in this iteration</p>` + "\n")
			}
			b.WriteString("</div></details>\n")
		}
		return b.String()
		// enddesign
	}
	return `<p class="missing">unknown figure kind: ` + htmlEscape(kind) + `</p>`
}

// enddesign

// design: go-book-glossary  implements: req-glossary-shared, req-meta-quarantine, req-glossary-table
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

// design: go-ref-tooltips  implements: req-ref-tooltips
// In-book reference links in prose render as their plain label plus a small (?) marker
// (field c39): the marker's title carries the referent's statement or long form as the
// hover tooltip; a click jumps to the definition. External URLs stay real links; runs
// per chapter AFTER term expansion, so the term machinery is untouched.
var refTipRe = regexp.MustCompile(`<a (?:class="term" )?href="#([^"]+)">([^<]+)</a>`)

func refTooltips(html string, nodes map[string]Node, gloss map[string]GlossTerm) string {
	return refTipRe.ReplaceAllStringFunc(html, func(m string) string {
		g := refTipRe.FindStringSubmatch(m)
		target, label := g[1], g[2]
		tip := ""
		if strings.HasPrefix(target, "term-") {
			if t, ok := gloss[strings.TrimPrefix(target, "term-")]; ok {
				tip = t.Long
				if tip == "" {
					tip = t.Term
				}
			}
		} else if n, ok := nodes[target]; ok {
			tip = n.Statement
		}
		if tip == "" {
			tip = "go to definition"
		}
		return `<button type="button" class="termref" data-title="` + attesc(htmlEscape(label)) + `" data-help="` + attesc(htmlEscape(tip)) + `" data-goto="` + target + `">` + label + `</button>`
	})
}

// attesc escapes double-quotes so a (already htmlEscaped) string is safe in an attribute value.
func attesc(s string) string { return strings.ReplaceAll(s, "\"", "&quot;") }

// enddesign

var termLinkRe = regexp.MustCompile(`<a href="#term:([a-z0-9-]+)">([^<]*)</a>`)

// expandTermLinks rewrites term anchors, expands the first use per chapter, and collects usage.
func expandTermLinks(chapterID, html string, gloss map[string]GlossTerm, used map[string][]string, findings *[]string) string {
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
		return `<button type="button" class="termref" data-title="` + attesc(htmlEscape(t.Term)) + `" data-help="` + attesc(htmlEscape(t.Long)) + `" data-goto="term-` + slug + `">` + label + `</button>`
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
	// the glossary is the same interactive table as every query (field c43,
	// req-glossary-table); the term-<slug> anchors ride on the rows.
	// the glossary lives at the end of ch3 (design input), NOT as a standalone chapter
	// (owner review c13): a <section> the emitter splices into the ch3 article; the
	// term-<slug> row anchors stay so term links still jump here.
	b.WriteString(`<section id="glossary" data-layer="glossary"><h2>Glossary</h2>` + "\n")
	b.WriteString(`<table class="q-table" data-sortable="1" data-layer="glossary"><thead><tr><th scope="col">term</th><th scope="col">definition</th><th scope="col">used in</th></tr>`)
	b.WriteString(`<tr class="q-filter"><td colspan="3"><input class="qt-search" type="search" placeholder="filter rows"></td></tr></thead><tbody>` + "\n")
	for _, s := range slugs {
		t := gloss[s]
		if t.Class == "notation" {
			continue // notation renders in its own derived list (go-ch2-derived)
		}
		b.WriteString(`<tr id="term-` + s + `"><td class="stmt"><strong>` + htmlEscape(t.Term) + `</strong> — ` + htmlEscape(t.Long) + `</td><td>` + mdLite(t.Def) + `</td><td class="meta">`)
		for i, ch := range used[s] {
			if i > 0 {
				b.WriteString(", ")
			}
			b.WriteString(`<a href="#` + htmlEscape(ch) + `">` + htmlEscape(ch) + `</a>`)
		}
		b.WriteString("</td></tr>\n")
	}
	b.WriteString("</tbody></table></section>\n")
	return b.String()
}

// design: go-ch2-derived  implements: req-ch2-derived
// The pull law of the fundamentals chapter (owner rulings 2026-07-05 + 2026-07-06):
// everything renders from USAGE alone - an entry nothing links does not render. Usage =
// a link in the rendered chapters, authored or auto-linked (go-auto-link). Since the
// 2026-07-06 ruling the references and fundamentals lists are POOLED QUERIES the ch2/ch8
// manifests embed (`referenced != false`, evaluated deferred over the emitter's link
// graph; full bodies via `render: full` - go-base-eval); references are the ONLY legal
// home of an external URL (req-external-links), so the URL prints in that view and
// nowhere else. Notation and the glossary stay emitter-derived below: their term-anchor
// (`term-<slug>`) and first-use-expansion machinery is inherently the emitter's.

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
		// usage = an anchor OR an i14 termref affordance (buttons carry data-goto, not href)
		if strings.Contains(chaptersHTML, `href="#`+s+`"`) || strings.Contains(chaptersHTML, `data-goto="`+s+`"`) {
			out = append(out, notes[s])
		}
	}
	return out
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
	// a live view REACHES its matched nodes (owner ruling 2026-07-07): the book shows them,
	// so the lint must count them - req-b matches the inline query below; req-d matches nothing.
	rb := filepath.Join(dir, "req-b.md")
	os.WriteFile(rb, []byte("---\nid: req-b\ntype: requirement\nstatement: B.\n---\n"), 0o644)
	mv := filepath.Join(dir, "man-view.md")
	viewMan := "---\nid: man-view\ntype: manifest\nmode: chapter\nstatement: View.\n---\n```base\nfilters:\n  and:\n    - 'type == \"requirement\"'\nviews:\n  - type: table\n    name: R\n```\n"
	os.WriteFile(mv, []byte(viewMan), 0o644)
	syn["req-b"] = Node{ID: "req-b", Type: "requirement", Path: rb}
	syn["req-d"] = Node{ID: "req-d", Type: "requirement", Path: iterPath}
	syn["man-view"] = Node{ID: "man-view", Type: "manifest", Mode: "chapter", Path: mv}
	found = bookOrphanFindings(syn)
	if len(found) != 1 || !strings.Contains(found[0], "req-d") {
		return false // the view-matched node is reached; the truly unshown one still flags
	}
	// a pull-law query (`referenced`) FOLLOWS references and can never create one.
	os.WriteFile(mv, []byte(strings.Replace(viewMan, "- 'type == \"requirement\"'", "- 'type == \"requirement\"'\n    - 'referenced'", 1)), 0o644)
	if len(bookOrphanFindings(syn)) != 2 {
		return false // with only the pull-law view, req-b and req-d both stay orphans
	}
	noman := map[string]Node{"req-x": {ID: "req-x", Type: "requirement", Path: iterPath}}
	return bookOrphanFindings(noman) == nil // zero manifests -> disarmed
}
