package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// design: go-book-manifests  implements: req-manifest-render.1, req-spec-content-lint.2, req-lint-classification.2, req-ifu-markdown-source
// The manifest node type (adr-book-two-stage; one mechanism): a manifest is trace CONTENT whose body lists UNITS separated by `---` lines. A unit is either a node reference, a plain markdown link to a node id with optional `depth:N`, or inline markdown, ledes and glue, provenance-marked like all prose. `Note:` lines carry speaker notes, deck mode. The book-orphan lint arms once the FIRST manifest exists, fail-safe, the forward-only pattern. Every book-content node, need, usecase, requirement, adr, must be referenced by SOME manifest. An exclude-mode manifest is the explicit exclusion record, referenced-but-not-rendered.
type ManifestUnit struct {
	Ref     string // the referenced node id ("" for an inline unit)
	Depth   int    // declared depth 1..4; 0 = the mode's default
	Body    string // inline markdown ("" for a ref unit)
	Notes   string // speaker notes, `Note:` lines stripped from Body
	Minutes string // measured minutes this slide's step takes, `Minutes:` lines stripped from Body (deck timeline)
}

// a unit ref may carry a sub-address (req-x.2) - the render folds
// it to the base node and keeps the sub-number for the reader
var unitRefRe = regexp.MustCompile(`^\[([A-Za-z0-9_-]+(?:\.[0-9]+)?)\]\([^)]*\)(?:\s+depth:([1-4]))?\s*$`)

var manifestBodyOverride map[string]string // selftest seam: manifest path -> body

// manifestBody returns the content after the frontmatter fence of a manifest file.
func manifestBody(path string) string {
	if manifestBodyOverride != nil {
		return manifestBodyOverride[path]
	}
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
		minutes := ""
		for _, l := range strings.Split(chunk, "\n") {
			t := strings.TrimSpace(l)
			if strings.HasPrefix(t, "Note:") {
				notes = append(notes, strings.TrimSpace(strings.TrimPrefix(t, "Note:")))
				continue
			}
			if strings.HasPrefix(t, "Minutes:") {
				if minutes == "" {
					minutes = strings.TrimSpace(strings.TrimPrefix(t, "Minutes:"))
				}
				continue
			}
			content = append(content, l)
		}
		u := ManifestUnit{Notes: strings.Join(notes, "\n"), Minutes: minutes}
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
// A node is reached by a DIRECT unit ref, or by a LIVE VIEW that matches it:
// the book shows a view's rows, so the lint counts them. Pull-law queries
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
		// the design input register renders every FILE-BACKED use case, function,
		// and requirement (the population a base view evaluates), and its need
		// facet lists every need - a node without a file stays an orphan finding
		if strings.Contains(body, "fig: input-register") {
			for id, bn := range nodes {
				if bn.Type == "need" {
					referenced[id] = true
					continue
				}
				if bn.Type != "usecase" && bn.Type != "function" && bn.Type != "requirement" {
					continue
				}
				if _, err := os.Stat(bn.Path); err != nil {
					continue
				}
				referenced[id] = true
			}
		}
		// the other fig kinds render node sets the same way:
		// the one decisions table reaches every non-waiver decision, the
		// generated ASR list its tagged requirements, the guides table
		// every guide.
		if strings.Contains(body, "fig: decisions-table") {
			for id, bn := range nodes {
				if bn.Type == "adr" && bn.Kind != "waiver" {
					referenced[id] = true
				}
			}
		}
		if strings.Contains(body, "fig: asr-list") {
			for id, bn := range nodes {
				if bn.Type != "requirement" {
					continue
				}
				for _, t := range basePropsOf(bn.Path).lists["tags"] {
					if t == "architecturally-significant" {
						referenced[id] = true
					}
				}
			}
		}
		if strings.Contains(body, "fig: guides-table") {
			for id, bn := range nodes {
				if bn.Type == "guide" {
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

// design: go-book-emitter  implements: req-book-artifact.1, req-manifest-render.2, req-book-artifact.3, req-reader-structure.1, req-book-trust.2, req-book-artifact.6, req-chapter-placement.3, req-module-filter-first, req-evidence-md-tables
// This is the deterministic emitter core. Truth, nodes plus manifests, renders to ONE self-contained HTML. The project README opens the book as its own first chapter, the reader's starting point, through the zero-dep renderReadme projection: headings, tables, lists, inline images. Every layer is real text in a semantic DOM at emit time; script never creates content. Depth derives from node anatomy: 1 is statement, 2 adds rationale, 3 adds children, 4 adds evidence. It is never an authored tag; the strict allowlist refuses a `depth:` key on nodes. Every chapter OPENS with its lede, and a missing lede is a finding. Every unit carries a STABLE ANCHOR, <node>-u<idx>, the future comment system's hook. The artifact stamps its source state: merkle root, iteration, engine version. Each node renders a visible meta line, id, type, ledger state, so trust metadata survives plain-text extraction. No timestamps anywhere: same state, same bytes.
func mdLite(md string) string { return mdLiteAt(md, 2) }

// mdLiteAt renders markdown-lite with a heading BASE level: a single `#` becomes
// <h{base}>, each extra hash one level deeper, clamped to h2..h5. Unit bodies pass 1
// (`## section` = h2, the level right under the chapter h1 - nesting consistent for the
// render-time section numbering); item bodies inside expands pass 3 (`## Rationale` = h4,
// a compact detail heading, never a book section).
func mdLiteAt(md string, base int) string {
	md = stripFillComments(md) // template fill guidance stays in the source, never in the book
	// fenced code blocks (```lang ... ```) are pulled out before the paragraph split so a
	// multi-line block (e.g. a command list) renders as one HTML-escaped <pre><code>, keeping
	// its lines intact and deterministic; everything else flows through mdLiteBlocks unchanged.
	lines := strings.Split(strings.ReplaceAll(md, "\r\n", "\n"), "\n")
	var fout strings.Builder
	var buf []string
	flush := func() {
		if len(buf) > 0 {
			fout.WriteString(mdLiteBlocksAt(strings.Join(buf, "\n"), base))
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
func mdLiteBlocks(md string) string { return mdLiteBlocksAt(md, 2) }

// mdHeadingLevel returns the hash count of a heading line (1..4), or 0 for non-headings.
func mdHeadingLevel(l string) int {
	n := 0
	for n < len(l) && l[n] == '#' {
		n++
	}
	if n >= 1 && n <= 4 && n < len(l) && l[n] == ' ' {
		return n
	}
	return 0
}

// mdHeadingTag maps a hash count to its HTML level under the given base, clamped h2..h5.
func mdHeadingTag(hashes, base int) string {
	lvl := base + hashes - 1
	if lvl < 2 {
		lvl = 2
	}
	if lvl > 5 {
		lvl = 5
	}
	return "h" + itoa(lvl)
}

func mdLiteBlocksAt(md string, base int) string {
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
		// the per-paragraph data-ai RECORD stays; the visible icon column lives at the
		// unit level (req-icon-density) - see unitAIColumn.
		attr := ""
		if ai >= 0 {
			attr = ` data-ai="` + string(rune('0'+ai)) + `"`
		}
		// a heading line binds only ITSELF: a paragraph that opens
		// with `## x` directly followed by content lines emits the heading, then renders
		// the rest as its own block - the heading never swallows the list or prose below.
		for {
			nl := strings.IndexByte(p, '\n')
			first := p
			if nl >= 0 {
				first = p[:nl]
			}
			h := mdHeadingLevel(strings.TrimSpace(first))
			if h == 0 {
				break
			}
			tag := mdHeadingTag(h, base)
			t := strings.TrimSpace(first)
			out.WriteString("<" + tag + attr + ">" + htmlEscape(strings.TrimSpace(t[h:])) + "</" + tag + ">\n")
			if nl < 0 {
				p = ""
				break
			}
			p = strings.TrimSpace(p[nl+1:])
			if p == "" {
				break
			}
		}
		if p == "" {
			continue
		}
		if strings.HasPrefix(p, "<svg") || strings.HasPrefix(p, "<table") || strings.HasPrefix(p, `<div class="onion`) {
			// authored block-level SVG figures and tables pass through raw - both are
			// self-contained, text-based artifacts the figure/table laws already govern.
			// The onion host div is the mermaid-fence lane's own emit (replaceModelFences
			// runs before this pass): the interactive onion wraps its views in a div.
			out.WriteString(p + "\n")
			continue
		}
		// the block renders as RUNS: list lines make a real <ul>, pipe lines a real
		// <table> (req-evidence-md-tables), and quote lines a real <blockquote> even
		// when prose shares the block - an enumeration never renders as dashed prose.
		blines := strings.Split(p, "\n")
		for li := 0; li < len(blines); {
			t := strings.TrimSpace(blines[li])
			switch {
			case strings.HasPrefix(t, "|"):
				var trows [][]string
				for ; li < len(blines); li++ {
					rt := strings.TrimSpace(blines[li])
					if !strings.HasPrefix(rt, "|") {
						break
					}
					cells := strings.Split(strings.Trim(rt, "|"), "|")
					for ci := range cells {
						cells[ci] = strings.TrimSpace(cells[ci])
					}
					trows = append(trows, cells)
				}
				// a --- separator row marks row 0 as the header; without one the
				// block renders headerless
				hasHead := len(trows) > 1 && mdTableSepRe.MatchString(strings.Join(trows[1], "|"))
				out.WriteString(`<table class="mdtable"` + attr + `>`)
				start := 0
				if hasHead {
					out.WriteString("<thead><tr>")
					for _, c := range trows[0] {
						out.WriteString("<th>" + mdInline(c) + "</th>")
					}
					out.WriteString("</tr></thead>")
					start = 2
				}
				out.WriteString("<tbody>")
				for _, r := range trows[start:] {
					out.WriteString("<tr>")
					for _, c := range r {
						out.WriteString("<td>" + mdInline(c) + "</td>")
					}
					out.WriteString("</tr>")
				}
				out.WriteString("</tbody></table>\n")
			case strings.HasPrefix(t, "- "):
				if attr != "" {
					out.WriteString("<div" + attr + ">")
				}
				out.WriteString("<ul>\n")
				for ; li < len(blines) && strings.HasPrefix(strings.TrimSpace(blines[li]), "- "); li++ {
					out.WriteString("<li>" + mdInline(strings.TrimPrefix(strings.TrimSpace(blines[li]), "- ")) + "</li>\n")
				}
				out.WriteString("</ul>\n")
				if attr != "" {
					out.WriteString("</div>\n")
				}
			case strings.HasPrefix(t, "> ") || t == ">":
				var q []string
				for ; li < len(blines); li++ {
					qt := strings.TrimSpace(blines[li])
					if !strings.HasPrefix(qt, ">") {
						break
					}
					q = append(q, strings.TrimSpace(strings.TrimPrefix(qt, ">")))
				}
				out.WriteString("<blockquote" + attr + "><p>" + mdInline(strings.Join(q, " ")) + "</p></blockquote>\n")
			default:
				var pr []string
				for ; li < len(blines); li++ {
					pt := strings.TrimSpace(blines[li])
					if strings.HasPrefix(pt, "- ") || strings.HasPrefix(pt, "> ") || pt == ">" || strings.HasPrefix(pt, "|") {
						break
					}
					pr = append(pr, blines[li])
				}
				out.WriteString("<p" + attr + ">" + mdInline(strings.Join(pr, "\n")) + "</p>\n")
			}
		}
	}
	return out.String()
}

var mdLinkRe = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`)

// mdTableSepRe: the header separator row of a markdown table (dashes, colons, pipes).
var mdTableSepRe = regexp.MustCompile(`^[\s:|-]+$`)

// shortHash: the display prefix of a build or input hash.
func shortHash(s string) string {
	if len(s) > 12 {
		return s[:12]
	}
	return s
}

// aiMarksTokenRe: the ((ai:N)) inline token renders N robot glyphs (the involvement
// measure shows as the ROBOT icons the margins use,
// never as the words "recorded measure 0-3" - the reader connects the robots to the
// measure). Zero renders no glyph, by the same ladder the margin column obeys. The
// syntax deliberately avoids {{...}} - that shape is the template SLOT the residue
// lint and the canning check hunt.
var aiMarksTokenRe = regexp.MustCompile(`\(\(ai:([0-3])\)\)`)

func aiMarksInline(n int) string {
	if n <= 0 {
		return `<span class="ai-inline" role="img" aria-label="AI involvement: 0 of 3"></span>`
	}
	if n > 3 {
		n = 3
	}
	var b strings.Builder
	b.WriteString(`<span class="ai-inline" role="img" aria-label="AI involvement: ` + itoa(n) + ` of 3">`)
	for i := 0; i < n; i++ {
		b.WriteString(svgRobot)
	}
	b.WriteString(`</span>`)
	return b.String()
}

var mdBoldRe = regexp.MustCompile(`\*\*([^*]+)\*\*`)

func mdInline(s string) string {
	s = htmlEscape(s)
	s = aiMarksTokenRe.ReplaceAllStringFunc(s, func(m string) string {
		g := aiMarksTokenRe.FindStringSubmatch(m)
		return aiMarksInline(int(g[1][0] - '0'))
	})
	s = mdLinkRe.ReplaceAllString(s, `<a href="#$2">$1</a>`)
	return mdBoldRe.ReplaceAllString(s, "<strong>$1</strong>")
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

// readmeSelfBook is the workspace's own published-book URL prefix (derived live from
// the origin remote, never hardcoded); renderReadme sets it for the render's duration.
// A README link under this prefix is a SELF-reference: inside the book it rewrites to
// its in-book form - the bare fragment - so it navigates in-document through the
// existing rails (deck delegation included). The README file on disk keeps the
// absolute URL: that one is right for GitHub.
var readmeSelfBook string

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
		if readmeSelfBook != "" && strings.HasPrefix(url, readmeSelfBook) {
			if h := strings.Index(url, "#"); h >= 0 {
				return `<a href="` + url[h:] + `">` + label + `</a>`
			}
			url = "spec/book.html" // the fragmentless self-URL folds to the no-op below
		}
		if url == "spec/book.html" {
			// the book's own further-reading link: relative to the REPO root, it breaks
			// wherever a published copy opens from (out/, docs/, the zip root). Inside
			// the rendered book the target IS this document - an in-book no-op says so.
			return `<span class="self-link">` + label + `</span> <span class="meta">(this document — you are reading it)</span>`
		}
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
	readmeSelfBook = ""
	if url, ok := pagesBookURL(originRemoteURL(ROOT)); ok {
		readmeSelfBook = url
	}
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
		// a sub-addressed ref (req-x.2) folds to its cluster node (go-sub-addressing)
		if base := subAddrBase(id); base != id {
			n, ok = nodes[base]
		}
		if !ok {
			return "<p class=\"missing\">missing node: " + htmlEscape(id) + "</p>\n"
		}
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
		// the M5-proven disclosure: collapsed by default, auto-opened by find-in-page
		// (until-found) - script and CSS only ever toggle, never create.
		return `<details class="disc" data-dl="` + itoa(dl) + `"><summary>` + label + `</summary><div hidden="until-found">` + "\n" + inner + "</div></details>\n"
	}
	if depth >= 2 {
		// statement-once: a body that opens by restating the statement loses that prefix;
		// its headings render compact (base 3) - item detail, never a book section.
		if prose := stripLeadingStatement(nodeBodyProse(n.Path), n.Statement); prose != "" {
			b.WriteString(disc(2, "rationale", `<div data-layer="informative">`+"\n"+mdLiteAt(prose, 3)+"</div>"))
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
				// links, never copies: the child renders as its name + brief link
				ul.WriteString("<li>" + nodeLinkHTML(k, nodes) + "</li>\n")
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

// Render-time hierarchical section numbers: every section
// heading in a numbered chapter gets its number derived from the book structure at emit
// - h2 = N.s, h3 = N.s.t, h4 = N.s.t.u, where N is the chapter number the article's h1
// already carries. Item content never numbers: headings inside tables, figures, and
// disclosure details are detail text, not book sections. A sub-heading with no open
// parent level is a NESTING break - it surfaces as an advisory and stays unnumbered.
// The anchor map (unit/section id -> number) lets the toc reuse the same numbers.
var secNumTokRe = regexp.MustCompile(`<article\b[^>]*>|</article>|<table\b|</table>|<figure\b|</figure>|<details\b|</details>|<h1[^>]*>|<h[2-4][^>]*>|<(?:div|section)\s+id="[^"]+"`)

var secNumH1Re = regexp.MustCompile(`^([0-9]+)\. `)

var secNumIDRe = regexp.MustCompile(`id="([^"]+)"`)

func numberBookSections(html string) (string, map[string]string, []string) {
	secNums := map[string]string{}
	var advisories []string
	var out strings.Builder
	last := 0
	chNum := 0   // 0 = an unnumbered article (back-matter, decks): no numbering
	skip := 0    // table/figure/details nesting depth: item content, never numbered
	anchor := "" // the last unit/section id seen - the toc mapping target
	var sec, sub, sub2 int
	for _, m := range secNumTokRe.FindAllStringIndex(html, -1) {
		tok := html[m[0]:m[1]]
		switch {
		case strings.HasPrefix(tok, "<article"):
			chNum, sec, sub, sub2, anchor = 0, 0, 0, 0, ""
		case tok == "</article>":
			chNum = 0
		case strings.HasPrefix(tok, "<table") || strings.HasPrefix(tok, "<figure") || strings.HasPrefix(tok, "<details"):
			skip++
		case tok == "</table>" || tok == "</figure>" || tok == "</details>":
			if skip > 0 {
				skip--
			}
		case strings.HasPrefix(tok, "<h1"):
			if skip == 0 {
				if g := secNumH1Re.FindStringSubmatch(html[m[1]:]); g != nil {
					chNum = atoiSafe(g[1])
					sec, sub, sub2 = 0, 0, 0
				}
			}
		case strings.HasPrefix(tok, "<div") || strings.HasPrefix(tok, "<section"):
			if skip == 0 {
				if g := secNumIDRe.FindStringSubmatch(tok); g != nil {
					anchor = g[1]
				}
			}
		default: // <h2..h4 ...>
			if skip != 0 || chNum == 0 {
				continue
			}
			lvl := int(tok[2] - '0')
			num := ""
			switch lvl {
			case 2:
				sec++
				sub, sub2 = 0, 0
				num = itoa(chNum) + "." + itoa(sec)
			case 3:
				if sec == 0 {
					advisories = append(advisories, "numbering: h3 before any h2 in chapter "+itoa(chNum)+" - nesting is off")
					continue
				}
				sub++
				sub2 = 0
				num = itoa(chNum) + "." + itoa(sec) + "." + itoa(sub)
			case 4:
				if sec == 0 || sub == 0 {
					advisories = append(advisories, "numbering: h4 with no open parent section in chapter "+itoa(chNum)+" - nesting is off")
					continue
				}
				sub2++
				num = itoa(chNum) + "." + itoa(sec) + "." + itoa(sub) + "." + itoa(sub2)
			}
			out.WriteString(html[last:m[1]])
			out.WriteString(`<span class="secnum">` + num + `</span> `)
			last = m[1]
			if anchor != "" {
				if _, seen := secNums[anchor]; !seen {
					secNums[anchor] = num
				}
				anchor = ""
			}
		}
	}
	out.WriteString(html[last:])
	return out.String(), secNums, advisories
}

// design: go-chapter-title-split  implements: req-chapter-titles
// splitChapterTitle splits a chapter statement at its earliest dash or sentence
// separator into the short title and the subtitle. A statement with no separator
// stays whole. The heading renders the short title; the remainder is the sub line.
func splitChapterTitle(t string) (string, string) {
	cut, dl := -1, 0
	for _, d := range []string{" — ", " – ", " - ", ". "} {
		if i := strings.Index(t, d); i > 0 && (cut < 0 || i < cut) {
			cut, dl = i, len(d)
		}
	}
	if cut < 0 {
		return t, ""
	}
	return strings.TrimSpace(t[:cut]), strings.TrimSpace(t[cut+dl:])
}

// enddesign

// design: go-guide-ch8  implements: req-chapter-placement.1, req-chapter-placement.2
// The agent guide is no reader chapter. agent-mode manifests render INSIDE the guidance chapter as one row of the guides TABLE (go-guides-table), with no per-audience subchapters. Every audience class stays visible in that table, with empty ones as an honest no-guide-yet row, the pull law: a guide lands when demand appears. readerChapters collects the reading-flow chapters plus the agent guides, in reading order: explicit Order slot, then id (req-system-overview). The renderer and the terms-order lint (go-terms-order-lint) walk this SAME list. That is one order source.
func readerChapters(nodes map[string]Node) (chapters, agentGuides []Node) {
	for _, n := range nodes {
		if n.Type == "manifest" && (n.Mode == "chapter" || n.Mode == "guidance") {
			chapters = append(chapters, n)
		}
		if n.Type == "manifest" && n.Mode == "agent" {
			agentGuides = append(agentGuides, n)
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
		// silently vanishing (fail-safe); with a guidance chapter present the agent
		// guide renders as one row of the guides table (go-guides-table).
		chapters = append(chapters, agentGuides...)
		agentGuides = nil
	}
	less := chapterLess(nodes)
	for i := 1; i < len(chapters); i++ {
		for j := i; j > 0 && less(chapters[j], chapters[j-1]); j-- {
			chapters[j], chapters[j-1] = chapters[j-1], chapters[j]
		}
	}
	return chapters, agentGuides
}

// design: go-toc-order  implements: req-toc-order
// The table of contents OWNS the order: a mode-toc manifest lists the chapters as
// a markdown list, nested entries placing the decks. A chapter never knows its own
// position; the Order slot stays the fallback for a workspace without a toc. A
// chapter the toc misses appends at the END, visibly. Never a silent drop.
var tocEntryRe = regexp.MustCompile(`(?m)^([ \t]*)-\s*\[[^\]]*\]\(([^)]+)\)`)

func tocOrderIndex(nodes map[string]Node) (top map[string]int, nested map[string]int, ok bool) {
	for _, n := range nodes {
		if n.Type == "manifest" && n.Mode == "toc" {
			top, nested = map[string]int{}, map[string]int{}
			for i, m := range tocEntryRe.FindAllStringSubmatch(nodeBodyOf(n), -1) {
				id := strings.TrimSuffix(filepath.Base(strings.ReplaceAll(strings.TrimSpace(m[2]), "\\", "/")), ".md")
				if len(m[1]) == 0 {
					top[id] = i
				} else {
					nested[id] = i
				}
			}
			return top, nested, true
		}
	}
	return nil, nil, false
}

// chapterLess is the ONE chapter comparator: toc position first when a toc
// exists, the Order slot otherwise; the id breaks ties deterministically.
func chapterLess(nodes map[string]Node) func(a, b Node) bool {
	top, _, hasToc := tocOrderIndex(nodes)
	pos := func(n Node) (int, int) {
		if hasToc {
			if p, ok := top[n.ID]; ok {
				return p, 0
			}
			return 1 << 20, n.Order
		}
		return n.Order, 0
	}
	return func(a, b Node) bool {
		pa, sa := pos(a)
		pb, sb := pos(b)
		if pa != pb {
			return pa < pb
		}
		if sa != sb {
			return sa < sb
		}
		return a.ID < b.ID
	}
}

// enddesign

// enddesign

// renderBookHTML emits the whole book. findings are curation ERRORS (missing lede, unknown term);
// advisories are soft signals (unlinked term usages) that never fail a render.
func renderBookHTML(nodes map[string]Node) (string, []string, []string) {
	// figure ids restart per render: regeneration stays byte-identical (go-fig-elem-ids).
	// Re-entrancy guard: StatusMap below can evaluate executed
	// checks whose selftests render the book THROUGH this function - the inner render
	// walked the global figSeq to its end, every id in the outer render shifted, and the
	// bytes depended on the verdict-cache state. Each call restores its caller's counter.
	prevFigSeq := figSeq
	figSeq = 0
	defer func() { figSeq = prevFigSeq }()
	sm := StatusMap(nodes)
	bl := latestBless()
	cfg := readProjectConfig()
	root := workspaceRoot(nodes)
	gloss := readGlossary()
	tips := contentTips() // content-note one-liners for the termref affordance
	used := map[string][]string{}
	var findings, advisories []string
	chapters, _ := readerChapters(nodes)
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
	// the shell's TOC data: one entry per chapter, one link per unit heading (req-book-artifact.2)
	type tocSec struct{ anchor, title string }
	type tocEntry struct {
		id, title string
		num       int // chapter number (req-book-shell-nav.1): 0 = back-matter, unnumbered
		secs      []tocSec
	}
	var toc []tocEntry
	var body strings.Builder
	renderChapterUnit := func(chb *strings.Builder, chID string, idx int, u ManifestUnit) {
		anchor := chID + "-u" + itoa(idx+1)
		if u.Ref != "" {
			chb.WriteString(renderNodeAtDepth(u.Ref, u.Depth, nodes, sm, bl, anchor))
		} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
			// design: go-fig-fullscreen  implements: req-interactive-figures.1
			// Every chapter figure wraps with the fullscreen button. A click flips the fig-full class on THIS existing element, a fixed-inset modal. Escape closes it. The embedded graphs refit on toggle. The script creates nothing.
			if msg, retired := retiredFigKinds[m[1]]; retired {
				findings = append(findings, "fig kind '"+m[1]+"' retired "+msg)
			} else {
				// design: go-onion-space  implements: req-onion-space
				// An onion figure breaks out of the prose column: the wrapper wears fig-wide,
				// and the shell carries the breakout rule with the fullscreen exclusion.
				wide := ""
				if m[1] == "onion" {
					wide = ` class="fig-wide"`
				}
				// enddesign
				chb.WriteString(`<figure id="` + anchor + `"` + wide + ` data-layer="figure">` + "\n" +
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
				findings = append(findings, "chapter "+chID+" unit "+itoa(idx+1)+" carries unmarked prose - no unmarked path into the book (req-ai-provenance.1)")
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
		toc = append(toc, ent)
		if len(units) == 0 || units[0].Ref != "" {
			findings = append(findings, "chapter "+ch.ID+" does not open with its lede (req-reader-structure.1)")
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
		// the chapter head keeps the full title, split: the short title heads the line,
		// the remainder renders as a subtitle - never one long string.
		chShort, chSub := splitChapterTitle(ch.Statement)
		h1 := itoa(chNum) + ". " + htmlEscape(chShort)
		if chSub != "" {
			h1 += ` <span class="ch-sub">` + htmlEscape(chSub) + `</span>`
		}
		chb.WriteString(`<article id="` + htmlEscape(ch.ID) + `" class="ch` + htmlEscape(classes) + `">` + "\n<h1>" + h1 + "</h1>\n")
		for idx, u := range units {
			renderChapterUnit(&chb, ch.ID, idx, u)
		}
		// no per-audience sibling subchapters: the guidance chapter renders its guides
		// as ONE table where the
		// manifest asks for it (fig: guides-table) - intro and guides merged, the agent
		// guide one row embedding the emitted AGENTS.md verbatim.
		chb.WriteString("</article>\n")
		body.WriteString(refTooltips(expandTermLinks(ch.ID, chb.String(), gloss, used, &findings, false), nodes, gloss, tips, false))
		advisories = append(advisories, unlinkedTermAdvisories(ch.ID, raw, gloss)...)
	}
	chaptersHTML := body.String() // usage referent for the pull law (go-ch2-derived)
	// design: go-deck-mode  implements: req-manifest-render.4
	// Deck manifests render in the SAME file: one unit per slide. `Note:` lines become the presenter's aside, hidden on screen outside present mode, printed in the handout. The present button flips paged fullscreen driven by arrow keys, CSS and class toggles only.
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
		// the deck stays OUT of the reading flow: no inline title or present button
		// here - it is reachable only from the views' present button. The article sits off-screen
		// (CSS), and present mode lifts the current slide to fullscreen via position:fixed.
		// The boundary/slide naming, the timeline, and the inert embed slots come from
		// go-deck-anchors; the deck's anchor id IS the manifest's node id.
		units := parseManifestUnits(manifestBody(dk.Path))
		if dk.Kind == "ifu" {
			// the IFU arc shape check (go-ifu-arc): findings ride the render lane
			findings = append(findings, ifuArcFindings(dk.ID, manifestBody(dk.Path))...)
		}
		// the deck body assembles locally so it rides the SAME term-link + tooltip pass
		// the chapters get: a slide's glossary term becomes a real termref (the present-mode
		// toast reads its data-help), never a bare anchor.
		var dkb strings.Builder
		dkb.WriteString(`<article class="deck" id="` + htmlEscape(dk.ID) + `"` + deckRegionAttrs(dk) + ` aria-hidden="true">` + "\n")
		for idx, u := range units {
			sid := dk.ID + "-s" + itoa(idx+1)
			var sb strings.Builder
			if u.Ref != "" {
				sb.WriteString(renderNodeAtDepth(u.Ref, 1, nodes, sm, bl, sid+"-n"))
			} else if m := figRefRe.FindStringSubmatch(strings.TrimSpace(u.Body)); m != nil {
				if msg, retired := retiredFigKinds[m[1]]; retired {
					findings = append(findings, "fig kind '"+m[1]+"' retired "+msg)
				} else {
					sb.WriteString(renderFigure(m[1], nodes))
				}
			} else {
				if !proseUnitsMarked(u.Body) {
					findings = append(findings, "deck "+dk.ID+" slide "+itoa(idx+1)+" carries unmarked prose (req-ai-provenance.1)")
				}
				en := 0
				// one segment: prose (with in-body fig: lines resolved to the book's own
				// figure renders, id-scoped) followed by its inert embed slots.
				renderSeg := func(seg string) string {
					rest, embeds := splitEmbedFences(seg)
					rest = replaceModelFences(rest, sid, dk.ID, &findings)
					var s strings.Builder
					last := 0
					for _, fm := range deckFigLineRe.FindAllStringSubmatchIndex(rest, -1) {
						if t := rest[last:fm[0]]; strings.TrimSpace(t) != "" {
							s.WriteString(renderUnitBody(t, nodes, aliasIdx, &findings, &deferredQ, sm, bl, sid))
						}
						kind := strings.TrimSpace(rest[fm[2]:fm[3]])
						if msg, retired := retiredFigKinds[kind]; retired {
							findings = append(findings, "fig kind '"+kind+"' retired "+msg)
						} else {
							s.WriteString(deckScopeIDs(renderFigure(kind, nodes), sid))
						}
						last = fm[1]
					}
					if t := rest[last:]; strings.TrimSpace(t) != "" {
						s.WriteString(renderUnitBody(t, nodes, aliasIdx, &findings, &deferredQ, sm, bl, sid))
					}
					s.WriteString(renderDeckEmbedSlots(sid, embeds, &en))
					return s.String()
				}
				segs := splitDeckColumns(u.Body)
				sb.WriteString(renderSeg(segs[0]))
				if len(segs) > 1 {
					sb.WriteString(`<div class="slide-cols">`)
					for _, sg := range segs[1:] {
						sb.WriteString(`<div class="scol">` + renderSeg(sg) + `</div>`)
					}
					sb.WriteString("</div>\n")
				}
			}
			if u.Notes != "" {
				sb.WriteString(`<aside class="notes">` + htmlEscape(u.Notes) + "</aside>\n")
			}
			dkb.WriteString(`<section class="slide" id="` + htmlEscape(sid) + `"` + deckSlideAttrs(idx, len(units), sb.String()) + `>` + "\n")
			dkb.WriteString(sb.String())
			dkb.WriteString("</section>\n")
		}
		dkb.WriteString(renderDeckTimeline(dk.ID, units, &findings))
		dkb.WriteString("</article>\n")
		// the DECK lane carries the FULL definition in data-help: the present-mode toast
		// is its only help surface, and the short form just repeats the name.
		body.WriteString(refTooltips(expandTermLinks(dk.ID, dkb.String(), gloss, used, &findings, true), nodes, gloss, tips, true))
		// NO toc entry: the deck is out of the reading flow entirely.
		// Its one entry point is the views home (go-views-home): the derived-documents
		// table's present button opens it. The baked articles and the present-mode
		// machinery live here.
	}
	if len(decks) > 0 {
		// the present-mode toast (rendered here, dom-static: the shell script only fills
		// its text): a term link inside a slideshow explains instead of jumping out.
		body.WriteString(`<div id="deck-toast" hidden><strong id="deck-toast-t"></strong> <span id="deck-toast-b"></span></div>` + "\n")
	}
	// enddesign
	if g := renderGlossaryChapter(gloss, used); g != "" {
		// ONE glossary, spliced in at the END of the FUNDAMENTALS chapter, never its own
		// back-matter
		// chapter. The splice happens now - after the chapter AND deck loops - so `used`
		// is complete across the book (a deck-only term still enters the glossary); the
		// splice inserts positionally into fundamentals, so the trailing deck articles
		// stay untouched.
		full := body.String()
		if i := strings.Index(full, `id="`+fundamentalsChapterID+`"`); i >= 0 {
			if e := strings.Index(full[i:], "</article>\n"); e >= 0 {
				at := i + e // just before the fundamentals chapter's closing </article>
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
	bodyHTML := body.String()
	if len(deferredQ) > 0 {
		// the pull law as data: the link graph over the RENDERED chapters feeds the
		// deferred referenced-queries (same referent the derived lists always used).
		// Resolved BEFORE the section numbering so deferred headings number too.
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
	// render-time section numbering: every section heading gets
	// its hierarchical number derived from the book structure; nesting breaks surface as
	// advisories; the toc reuses the same numbers via the anchor map.
	bodyHTML, secNums, numAdvisories := numberBookSections(bodyHTML)
	advisories = append(advisories, numAdvisories...)
	// design: go-book-shell  implements: req-book-artifact.2, req-book-shell-nav.1, req-book-shell-nav.4, req-book-shell-nav.5, req-book-shell-nav.3, req-details-context.1, req-filter-feedback, req-search-visible-hits
	// This is the mdbook-style shell. One fixed sidebar carries the whole apparatus. It holds the chapter TOC, collected above, static DOM, its own scrollbar, the GLOBAL search, ONE hand-editable filter expression every control compiles into, and the DETAILS PANE. The details pane is a bar at the sidebar bottom that expands as the one context-help surface. window.bookDetail fills it for a clicked term, link, node, filter, search, graph node, or the book title. The pane is COMPLETELY context-sensitive: it shows only the clicked thing. The reader views ride the stakeholder rows as pills. The slide decks live in the views home (go-views-home). The baseline controls' placement stays deliberately undecided (q-views-placement). A single click on a node or term reference opens the pane. NAVIGATION runs through the pane's link (window.bookGoto), never a single-click jump. In-page anchors, the toc, keep navigating directly. The content column stays clean. The report's visual language carries over: #fafafa chrome, white panels, the uppercase small labels, the disclosure triangles. The script stays toggle-only.
	var doc strings.Builder
	// the book's identity is the WORKSPACE's product (go-white-label-identity):
	// a vehicle's book carries the vehicle's name, never the engine binary's.
	product := workspaceProduct()
	doc.WriteString("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n")
	doc.WriteString("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n")
	doc.WriteString("<title>" + htmlEscape(product) + " — the spec book</title>\n")
	doc.WriteString("<style>*{box-sizing:border-box}body{font-family:system-ui,Segoe UI,sans-serif;margin:0;line-height:1.5;color:" + bookColors["text"] + ";background:" + bookColors["bg"] + ";display:flex}" +
		"#sidebar{width:300px;flex:none;height:100vh;position:sticky;top:0;overflow:clip;overflow-clip-margin:4vmax;background:#fafafa;border-right:1px solid #e3e3e3;padding:14px 16px;display:flex;flex-direction:column;gap:10px}" +
		".sb-brand{font-weight:600;font-size:15px;margin:0;cursor:pointer;background:none;border:0;padding:0;text-align:left;font-family:inherit;color:inherit}" +
		".sb-h{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#7d7d7d;margin:8px 0 2px}" +
		"#sidebar input{width:100%;padding:5px 8px;border:1px solid #ddd;border-radius:5px;font:inherit;font-size:13px;background:" + bookColors["bg"] + "}" +
		// an ACTIVE filter is unmistakable: the input line goes yellow while any token is live
		"#filter-expr.flt-on{background:#ffe873;border-color:#c9a400;font-weight:bold}" +
		"#filter-wrap{position:relative;display:block}" +
		"#filter-wrap.pinging .ping-echo{animation:qping .32s ease-out forwards}#filter-wrap.pinging .ping-echo:nth-of-type(2){animation-delay:.15s}#filter-wrap.pinging .ping-echo:nth-of-type(3){animation-delay:.3s}" +
		// the contents area owns its scrollbar: the toc flexes to the
		// remaining height and scrolls on its own, so it stays scrollable while the
		// details pane below claims space.
		"#toc{font-size:13px;flex:1 1 auto;min-height:0;overflow:auto}#toc details{margin:1px 0}#toc summary{list-style:none;cursor:pointer;padding:3px 6px;border-radius:4px;display:flex;gap:6px;align-items:baseline}" +
		"#toc summary::-webkit-details-marker{display:none}#toc summary:before{content:\"▸\";font-size:10px;color:#bcc6d6;flex:none}#toc details[open]>summary:before{content:\"▾\"}" +
		"#toc summary:hover,#toc a:hover{background:#f0f0f0}#toc a{display:block;color:#333;text-decoration:none;padding:2px 6px;border-radius:4px}" +
		"#toc .toc-sec{padding-left:22px;font-size:12px;color:#555}#toc .off{color:#bbb}" +
		"#toc .toc-num{display:inline-block;min-width:1.1em;color:#8a93a3;font-variant-numeric:tabular-nums}" +
		"h1 .ch-sub{display:block;font-size:.45em;font-weight:400;color:" + bookColors["meta"] + ";margin-top:.15em;line-height:1.4}" +
		// context-help pane: a flex child pinned to the sidebar bottom. It claims space
		// from the contents area when it expands; the toc keeps its own scrollbar above.
		"#details.dpane{flex:none;position:relative;margin:auto -16px -14px;background:#fafafa;border-top:1px solid #d8d8d8;box-shadow:0 -4px 10px rgba(0,0,0,.06)}" +
		"#dpane-bar{width:100%;text-align:left;font:inherit;font-size:12px;font-weight:600;color:#555;background:#f0f0f0;border:0;border-top:1px solid #ddd;padding:5px 12px;cursor:pointer}" +
		"#dpane-body{max-height:60vh;overflow:auto;padding:6px 12px}" +
		"#details.collapsed #dpane-body{display:none}" +
		"#dpane-caret{float:right;transition:transform .1s}#details.collapsed #dpane-caret{transform:rotate(180deg)}" +
		".dh{font-weight:600;margin-bottom:3px}" +
		"#dpane-content ul{margin:.2rem 0;padding-left:1.2rem}#dpane-content button[data-view]{font:inherit;font-size:12px;padding:1px 8px;border:1px solid #ddd;border-radius:12px;background:" + bookColors["bg"] + ";cursor:pointer}" +
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
		".ufilters{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;margin:.3rem 0}" +
		".upills.ufcol{flex-direction:column;align-items:stretch;flex-wrap:nowrap;margin:0;min-width:110px}" +
		".upills.ufcol .pilllbl{font-weight:600}" +
		".ufchips{display:flex;flex-direction:column;gap:5px;max-height:250px;overflow-y:auto}" +
		".uarrow{font:inherit;font-size:.7rem;padding:0 4px;border:1px solid #d5d5d5;border-radius:6px;background:#fff;cursor:pointer}" +
		".gopen{text-align:right;white-space:nowrap}a.gdeck{text-decoration:none}" +
		".raid-matrix .rbub{cursor:pointer}.raid-wrap{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}.raid-wrap>svg{flex:0 0 50%;max-width:50%}.raid-side{flex:1 1 0;min-width:0;overflow-x:auto}.raid-side tr.rsel>td{background:#eef6ff}.rfacts{margin:.2rem 0;padding-left:18px}" +
		qtlSharedCSS +
		".pugh{border-collapse:collapse;margin:.4rem 0;font-size:.85rem}.pugh th,.pugh td{border:1px solid #e3e3e3;padding:2px 8px;text-align:center}.pugh td:first-child,.pugh th:first-child{text-align:left}" +
		".pugh .pgh-tag{font-size:.65rem;font-weight:700;color:#52628a;background:#eef2f9;border:1px solid #dce4f2;border-radius:8px;padding:0 5px}.pugh .pgh-tag.pgh-win{color:#14531f;background:#d9efdc;border-color:#2f8f4e}" +
		".pugh .pgh-better{color:#2f8f4e;font-weight:700}.pugh .pgh-worse{color:#c0392b;font-weight:700}.pugh .pgh-same{color:#888}.pugh .pgh-none{color:#ccc}.pugh tr.pgh-total td{font-weight:600;background:#fafafa}" +
		".mdtable{border-collapse:collapse;margin:.4rem 0;font-size:.85rem}.mdtable th,.mdtable td{border:1px solid #e3e3e3;padding:2px 8px;text-align:left}.mdtable th{background:#fafafa}" +
		".ping-echo{position:absolute;inset:-2px;border:2px solid #555;border-radius:inherit;pointer-events:none;opacity:0;z-index:3}" +
		"#details.pinging .ping-echo{animation:qping .32s ease-out forwards}#details.pinging .ping-echo:nth-of-type(2){animation-delay:.15s}#details.pinging .ping-echo:nth-of-type(3){animation-delay:.3s}" +
		"@keyframes qping{0%{inset:-2px;opacity:.95}100%{inset:calc(-2px - 3vmax);opacity:0}}" +
		`figure[data-layer="figure"]>svg{display:block;margin:0 auto;max-width:100%}` +
		".upill{font:inherit;font-size:.75rem;padding:2px 10px;border:1px solid #d5d5d5;border-radius:13px;background:#fff;cursor:pointer;color:#555}.upill.on{background:#2762c4;border-color:#2762c4;color:#fff}.upill.on .meta{color:#dbe6fa}" +
		".pilllbl{font-size:.72rem;color:#999;margin-right:2px;align-self:center}" +
		".u-table{width:100%;border-collapse:collapse}.u-table thead th{background:#fafafa;font-size:.75rem;font-weight:600;color:#888;text-align:left;padding:4px 8px;border:0;border-bottom:2px solid #e3e3e3;cursor:pointer}" +
		".u-table thead th[aria-sort=ascending]:after{content:\" \\25B4\"}.u-table thead th[aria-sort=descending]:after{content:\" \\25BE\"}" +
		".u-table tr.urow>td{padding:5px 8px 5px 6px;border:0;border-bottom:1px solid #eee;cursor:pointer;vertical-align:top}.u-table tr.urow:hover>td{background:#f6f8fb}.u-table td.ubrief{color:#555;font-size:.85rem}" +
		".utri{display:inline-block;width:.8em;color:#9aa4b2;transition:transform .1s}.utri:before{content:\"\\25B8\"}tr.urow.open .utri{transform:rotate(90deg)}" +
		".u-table tr.udetail>td{padding:2px 8px 10px 24px;border:0;border-bottom:1px solid #eee;background:#fbfbfe}.u-table .ufield{margin:.15rem 0;font-size:.85rem}.ufl{color:#8a93a3}" +
		".u-table td.uenum{font-size:.78rem;color:#555;white-space:nowrap}" +
		".ai-inline{display:inline-flex;gap:1px;vertical-align:text-bottom}" +
		"pre.uverb{background:#fafafa;border:1px solid #e3e3e3;border-radius:6px;padding:8px 10px;overflow-x:auto;font-size:.78rem;max-width:100%}" +
		/* item-body headings inside expands render compact - detail labels, not sections */
		".u-table tr.udetail h4,.u-table tr.udetail h5,.disc h4,.disc h5{margin:.4rem 0 .15rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:#7d7d7d}" +
		/* render-time section numbers */
		".secnum{color:#8a93a3;margin-right:.45em;font-variant-numeric:tabular-nums}" +
		".views-home button{font:inherit;font-size:.78rem;padding:2px 10px;border:1px solid #d5d5d5;border-radius:13px;background:#fff;cursor:pointer;color:#555}.views-home button:hover{background:#f0f0f0}" +
		".ucontrols{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;align-items:center;margin:.3rem 0;font-size:.8rem}" +
		".ucontrols button{font:inherit;font-size:.75rem;padding:2px 8px;border:1px solid #ddd;border-radius:5px;background:#fff;cursor:pointer}.ucontrols button:hover{background:#f0f0f0}" +
		".ucontrols input,.ucontrols select{font:inherit;font-size:.78rem;padding:2px 6px;border:1px solid #ddd;border-radius:5px}.qt-pos{color:#555;min-width:8ch;text-align:center;display:inline-block}" +
		".onion .oview[hidden]{display:none}.onion [data-onion-go]{cursor:pointer}.onion-flow{overflow-x:auto;max-width:100%}.onion-flow svg{display:block;margin:0 auto}.onion svg{cursor:grab;touch-action:none;max-width:100%}.onion [data-node-link]{cursor:pointer}.onion .oblock{cursor:pointer}.onion .opill{cursor:pointer}.onion .osel>rect{stroke:#1b6fd6;stroke-width:2.6}.onion .oc-nb>rect{stroke:#1b6fd6;stroke-width:2}.onion .oc-on{stroke:#1b6fd6;stroke-width:2.6;opacity:1}" +
		// the compact slide instance: the same interactive onion, sized to share a slide
		// the slide onion FILLS the slide (owner rule): width up to the slide, height capped
		// so the heading, bullets, and timeline stay on one screen with it
		".onion-sm{width:100%;max-width:1100px;margin:0 auto}.onion-sm svg{max-height:62vh;width:auto;margin:0 auto;display:block}" +
		".ctx-model svg{display:block;max-width:560px;margin:0 auto}" +
		/* the fullscreen button flows BELOW the figure's explanation paragraph (the prose
		   unit above the figure), never floating over the graphic */
		"figure[data-layer=\"figure\"]{position:relative;margin:1rem 0}.fig-fs{display:inline-block;margin:0 0 .35rem;font:inherit;font-size:13px;padding:2px 8px;border:1px solid #d5d5d5;border-radius:6px;background:#fff;cursor:pointer;opacity:.55}.fig-fs:hover{opacity:1}" +
		/* fullscreen fills BOTH axes: the graphic gets the whole viewport box and scales
		   into it (a wide figure uses the full width, a tall one the full height) */
		"figure.fig-full{position:fixed;inset:0;z-index:50;background:#fff;overflow:auto;margin:0;padding:26px;box-shadow:0 0 0 100vmax rgba(0,0,0,.35)}" +
		"figure.fig-full .fig-fs{position:sticky;top:0;z-index:2}" +
		"figure.fig-full>svg,figure.fig-full .oview svg,figure.fig-full .onion-flow svg,figure.fig-full .ctx-model svg{width:100%;height:calc(100vh - 100px);max-height:none;max-width:none}" +
		"figure.fig-full .tgraph #graph{height:calc(100vh - 170px)}" +
		"figure.fig-wide:not(.fig-full){width:min(calc(100vw - 380px),1600px);position:relative;left:50%;transform:translateX(-50%)}" +
		"@media(max-width:900px){figure.fig-wide{width:auto;left:auto;transform:none}}" +
		".onion-infra{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:.3rem 0;font-size:.78rem}.onion-infra .il{color:#888;margin-right:4px}.onion-infra button{font:inherit;font-size:.75rem;padding:2px 9px;border:1px solid #d5d5d5;border-radius:12px;background:#fff;cursor:pointer}" +
		".onion.fold-amb [data-oc-amb]{display:none}" +
		".tgraph #graph{height:675px;border:1px solid #e3e3e3;border-radius:6px;background:#fff}" +
		".tgraph .tabbar{display:flex;flex-wrap:wrap;gap:4px;margin:.4rem 0}.tgraph .tab{font:inherit;font-size:.78rem;padding:3px 9px;border:1px solid #ddd;border-radius:12px;background:#fff;cursor:pointer}.tgraph .tab.active{background:#eaf0fb;border-color:#9db6e0}" +
		".tgraph .legendrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:.3rem 0;font-size:.8rem}.tgraph .legend{display:flex;flex-wrap:wrap;gap:8px}.tgraph .lg{display:flex;align-items:center;gap:3px;cursor:pointer}" +
		".tgraph .sw{width:11px;height:11px;border-radius:3px;display:inline-block}" +
		// the legend swatches come from the ONE palette source (go-type-colors)
		traceTypeCSS(".tgraph .sw.") +
		".tgraph #trace-filter{flex:1;min-width:120px;padding:3px 8px;border:1px solid #ddd;border-radius:5px;font:inherit;font-size:.8rem}.tgraph #filter-clear{border:1px solid #ddd;border-radius:5px;background:#fff;cursor:pointer}.tgraph #detail{display:none}" +
		".crumbs{font-size:.85rem;margin:.3rem 0;color:#555}.crumbs button{background:none;border:none;color:#2762c4;cursor:pointer;padding:0;font:inherit;text-decoration:underline}" +
		"article.ch.pg-hide{display:none}" +
		"@media print{article.ch.pg-hide{display:block}}" +
		/* an emptied chapter keeps every heading line visible; only the content hides */
		"article.ch.flt-empty>*:not(h1){display:none}" +
		"article.ch.flt-empty>*:has(h2,h3,h4){display:block}" +
		"article.ch.flt-empty>*:has(h2,h3,h4)>*:not(h2):not(h3):not(h4){display:none}" +
		"article.ch.flt-empty h1,article.ch.flt-empty h2,article.ch.flt-empty h3,article.ch.flt-empty h4{color:#a9b2bf}" +
		".meta{font-size:.8rem;color:" + bookColors["meta"] + "}.stmt{margin-bottom:.2rem}.missing{color:#b00}" +
		".marked{position:relative}.ai-marks{position:absolute;left:-1.6rem;top:.15rem;display:flex;flex-direction:column;gap:2px}" +
		".qpad-short{padding-bottom:2.2rem}" +
		".state-suspect{color:" + bookColors["suspect"] + "}.state-ok{color:#1c7c33}" +
		"aside.notes{display:none;border-left:3px solid #ccc;padding-left:.6rem;font-size:.85rem}" +
		"article.deck{position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden}" +
		"body[data-present] .slide{display:none}body[data-present] .slide.current{display:block;position:fixed;inset:0;background:" + bookColors["bg"] + ";padding:8vh 10vw;overflow:auto;z-index:9}" +
		// the slide counter: baked chrome the present script fills; hidden outside present mode
		"#slide-pos{display:none}body[data-present] #slide-pos{display:block;position:fixed;right:16px;bottom:12px;z-index:10;font-size:13px;color:" + bookColors["meta"] + ";background:" + bookColors["bg"] + ";border:1px solid #ddd;border-radius:12px;padding:2px 10px;font-variant-numeric:tabular-nums}" +
		"#slide-esc{display:none}body[data-present] #slide-esc{display:block;position:fixed;right:16px;bottom:44px;z-index:10;font:inherit;font-size:12px;color:" + bookColors["meta"] + ";background:" + bookColors["bg"] + ";border:1px solid #ddd;border-radius:12px;padding:2px 10px;cursor:pointer}" +
		// the deck timeline: a slim measured-minutes bar across the presented deck's slides
		".deck-timeline{display:none}" +
		// prominent (owner rule): a visibly taller bar, a "time since start" caption above it,
		// and the elapsed-minutes NUMBER under every tick - it must read as a timeline at a glance
		"body[data-present] .deck-timeline.tl-on{display:block;position:fixed;left:10vw;right:18vw;bottom:34px;height:10px;background:#e3e3e3;border-radius:5px;z-index:10}" +
		".deck-timeline .tl-cap{position:absolute;left:0;top:-22px;font-size:12px;color:" + bookColors["meta"] + ";white-space:nowrap}" +
		".deck-timeline .tl-tick{position:absolute;top:-4px;width:5px;height:18px;background:#9db6e0;border-radius:2px}" +
		".deck-timeline .tl-tick.cur{background:#1b6fd6;width:9px;margin-left:-2px}" +
		".deck-timeline .tl-num{position:absolute;top:16px;transform:translateX(-50%);font-size:11px;color:" + bookColors["meta"] + ";white-space:nowrap}" +
		// the total is a CAPTION after the bar, outside it - never bar-space beyond the last tick
		".deck-timeline .tl-total{position:absolute;left:100%;margin-left:14px;top:-2px;font-size:12px;font-weight:bold;color:" + bookColors["meta"] + ";white-space:nowrap}" +
		// the inert embed slot: its start button is the one lane that runs the baked script
		".embed-slot{margin:.6rem 0}.embed-start{font:inherit;font-size:.9rem;padding:6px 18px;border:1px solid #d5d5d5;border-radius:6px;background:#fff;cursor:pointer}.embed-start:disabled{opacity:.45;cursor:default}" +
		// the present-mode toast: a slide's term link explains in place instead of jumping out
		"#deck-toast{position:fixed;bottom:78px;left:50%;transform:translateX(-50%);max-width:540px;background:#fff;border:1px solid #d5d5d5;border-radius:8px;padding:10px 16px;box-shadow:0 4px 16px rgba(0,0,0,.18);z-index:11;font-size:.9rem;cursor:pointer}" +
		// slide columns (the ||| marker): side by side wide, stacked narrow
		".slide-cols{display:flex;gap:2.2rem;align-items:flex-start;flex-wrap:wrap;margin-top:.4rem}.slide-cols>.scol{flex:1 1 320px;min-width:280px}" +
		// a bold-only lead line before a block (the deck's option headers) breathes
		".slide p:has(>strong:only-child){margin-top:1.5rem;font-size:1.05em}" +
		"@media(max-width:900px){body{flex-direction:column}#sidebar{position:static;width:auto;height:auto}}" +
		"@media print{aside.notes{display:block}.slide{page-break-after:always}#sidebar{display:none}}" +
		"::highlight(quack-comments){background:#ffdf80}" +
		"::highlight(book-hits){background:#ffff00}" +
		"#search-nav{white-space:nowrap}#hits-pos{font-size:.8rem;color:#555;margin:0 4px}" +
		"#search-nav button{font:inherit;font-size:11px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;padding:1px 7px}" +
		// the comment layer sits ABOVE the fullscreen slide (z 9): commenting works in present mode
		"#quack-sb{position:fixed;right:0;top:0;height:100vh;width:280px;background:#fffdf6;border-left:1px solid #e4dcc6;overflow:auto;padding:10px;font-size:13px;z-index:11;box-sizing:border-box}" +
		"body[data-qc=\"min\"] #quack-sb{display:none}#quack-sb .qc-head{display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-bottom:6px}" +
		".qc-card{border:1px solid #e8e2d0;border-radius:6px;padding:6px;margin:6px 0;background:#fff}.qc-closed{opacity:.55}" +
		".qc-quote{font-style:italic;color:#555;cursor:pointer;margin-bottom:4px}.qc-msg{margin:2px 0}.qc-suggest{color:#365f8a;margin:2px 0}" +
		".qc-mark{display:inline-block;width:1em;margin-right:4px}.qc-mark.agree{color:#2a8a4a}.qc-mark.reject{color:#b33}" +
		".qc-row{display:flex;gap:4px;margin-top:4px}.qc-inp{flex:1;min-width:0}" +
		// ONE comments toggle look, upper-right: the closed-state opener
		// and the open-state minimize share the .qc-toggle style and the same corner.
		"#quack-fab{position:absolute;z-index:12}" +
		".qc-toggle{font:inherit;font-size:12px;border:1px solid #e4dcc6;border-radius:14px;background:#fffdf6;cursor:pointer;padding:4px 10px}" +
		"#quack-sb-toggle{position:fixed;right:12px;top:12px;z-index:11}" +
		"#qc-name{width:100%;box-sizing:border-box;margin-bottom:6px;font:inherit;font-size:12px;padding:3px 6px}" +
		"textarea.qc-inp{width:100%;box-sizing:border-box;font:inherit;font-size:12px;margin-top:4px}" +
		"#qc-toast{position:fixed;left:12px;bottom:12px;z-index:12;background:#2d3a2f;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;max-width:60ch}" +
		"@media print{#quack-sb,#quack-sb-toggle,#quack-fab{display:none}}" +
		".readme img,.readme svg{max-width:100%;height:auto;display:block;margin:.6rem auto}.readme blockquote{border-left:3px solid #dcdcdc;margin:.6rem 0;padding:.2rem .9rem;color:#555}.readme h1{margin-top:.2rem}.readme table{margin:.8rem 0}" + facetFilterCSS() + "</style>\n")
	doc.WriteString("</head><body data-paged=\"1\">\n")
	doc.WriteString(`<nav id="sidebar" aria-label="views">` + "\n")
	doc.WriteString(`<button class="sb-brand" id="book-title" title="click for book info"` + bookTitleAttrs(root, cfg.Version, version) + `>` + htmlEscape(product) + ` — the spec book</button>` + "\n")
	// sidebar order (req-book-shell-nav.1): search, filter expression,
	// then the toc.
	// no browser input history on the search bar: the details pane explains the
	// mechanics on focus instead - stored past queries would ride over it.
	doc.WriteString(`<input id="search" type="search" placeholder="search the whole book" autocomplete="off" autocapitalize="off" spellcheck="false">` + "\n")
	// inline match nav (req-book-shell-nav.5): prev / counter / next on one line,
	// the script steps a single highlighted match - no hit list, never created content.
	doc.WriteString(`<span id="search-nav" hidden><button id="hits-prev" aria-label="previous match">&lsaquo;</button><span id="hits-pos"></span><button id="hits-next" aria-label="next match">&rsaquo;</button></span>` + "\n")
	// filter is one line; help opens in the details pane on focus/click.
	// The facet tokens (phase/discipline/quality) are not in the expression: the register's
	// coverage board carries those filters (the pills-rule exemption).
	// the filter field rides static ping chrome (req-filter-feedback + the dom-static
	// law): the echoes are emitted here; the script only re-arms the pinging class
	doc.WriteString(`<span id="filter-wrap"><input id="filter-expr" type="text" placeholder="filter: preset:… text" title="tokens: preset:<name> state:<suspect|verified> - anything else filters as text"><span class="ping-echo"></span><span class="ping-echo"></span><span class="ping-echo"></span></span>` + "\n")
	doc.WriteString(`<p class="sb-h">contents</p><div id="toc">` + "\n")
	for _, e := range toc {
		// the chapter number leads its toc entry (req-book-shell-nav.1); back-matter (num 0) stays bare
		numPfx := ""
		if e.num > 0 {
			numPfx = `<span class="toc-num">` + itoa(e.num) + `</span> `
		}
		// the sidebar shows ONLY the short chapter title; the remainder renders as the
		// subtitle at the chapter head, never here.
		short, _ := splitChapterTitle(e.title)
		label := numPfx + htmlEscape(short)
		if len(e.secs) == 0 {
			doc.WriteString(`<a href="#` + htmlEscape(e.id) + `" data-ch="` + htmlEscape(e.id) + `">` + label + `</a>` + "\n")
			continue
		}
		doc.WriteString(`<details><summary><a href="#` + htmlEscape(e.id) + `" data-ch="` + htmlEscape(e.id) + `">` + label + `</a></summary>` + "\n")
		for _, s := range e.secs {
			// the toc reuses the render-time section numbers
			secPfx := ""
			if n := secNums[s.anchor]; n != "" {
				secPfx = `<span class="toc-num">` + n + `</span> `
			}
			doc.WriteString(`<a class="toc-sec" href="#` + htmlEscape(s.anchor) + `">` + secPfx + htmlEscape(s.title) + `</a>` + "\n")
		}
		doc.WriteString("</details>\n")
	}
	doc.WriteString("</div>\n")
	// context-help pane: COMPLETELY context-sensitive. The reader views ride the
	// stakeholder rows, the slide decks live in the views home (go-views-home); the
	// baseline controls stay unplaced (q-views-placement stays open). window.bookDetail fills
	// #dpane-content on demand; the book identity rides the title button's data
	// attributes and shows on a title click like any other click target.
	// the three ping echoes are STATIC chrome siblings of the bar (dom-static law:
	// the shell script toggles the pinging class, never creates nodes); they sit on
	// #details, outside #dpane-content, so the pane fill never wipes them
	doc.WriteString(`<div id="details" class="dpane collapsed"><div class="ping-echo"></div><div class="ping-echo"></div><div class="ping-echo"></div><button id="dpane-bar" type="button">Details <span id="dpane-caret">▴</span></button><div id="dpane-body"><div id="dpane-content"><p class="meta">Click a term, link, filter, or a graph node to see details here.</p></div></div></div>` + "\n")
	doc.WriteString("</nav>\n")
	doc.WriteString(`<div id="page">` + "\n")
	// one page per top-level section (req-book-shell-nav.4, adr-section-paging):
	// the top header bar is gone; paging flows through the toc, hash and arrow keys.
	doc.WriteString("<main>\n")
	// enddesign
	doc.WriteString(bodyHTML)
	doc.WriteString(`</main>
<div id="slide-pos" role="status"></div>
<button id="slide-esc" type="button" title="close the slideshow">ESC</button>
</div>
<script>/* filters and toggles only - this script never creates content (go-book-shell) */
(function(){
 var b=document.body,fe=document.getElementById('filter-expr'),se=document.getElementById('search');
 function setTok(key,val,toggle){var t=(fe.value||'').split(/\s+/).filter(function(x){return x&&x.indexOf(key+':')!==0;});
  var had=(fe.value||'').split(/\s+/).indexOf(key+':'+val)>=0,add=!!val&&!(toggle&&had);
  if(add)t.push(key+':'+val);fe.value=t.join(' ');apply();
  /* the round-trip (req-filter-feedback): an APPLIED view filter lands the reader on
     the README - the stable ground - and the field announces itself with the ping */
  if(add){if(window.bookGoto)window.bookGoto('man-readme');
   var w=document.getElementById('filter-wrap');
   if(w){w.classList.remove('pinging');void w.offsetWidth;w.classList.add('pinging');
    setTimeout(function(){w.classList.remove('pinging');},800);}}}
 function apply(){
  var toks=(fe.value||'').trim().split(/\s+/).filter(Boolean),preset='',state='',words=[];
  fe.classList.toggle('flt-on',toks.length>0);
  toks.forEach(function(t){var i=t.indexOf(':'),k=i<0?'':t.slice(0,i),v=t.slice(i+1);
   if(k==='preset')preset=v;else if(k==='state')state=v;
   else words.push(t.toLowerCase());});
  /* a chapter with nothing for the active filter EMPTIES, never disappears:
     the heading lines stay visible, only the content hides (CSS on flt-empty) */
  document.querySelectorAll('article.ch').forEach(function(a){
   /* the README is NEVER filtered (req-filter-feedback): it stays whole, whatever
      the filter - the ground the filtered world is surveyed from */
   if(a.id==='man-readme'){a.classList.remove('flt-empty');return;}
   var hid=(preset!=='')&&!a.classList.contains('in-man-preset-'+preset);
   if(!hid&&words.length){var txt=a.textContent.toLowerCase();
    words.forEach(function(w){if(txt.indexOf(w)<0)hid=true;});}
   a.classList.toggle('flt-empty',hid);});
  document.querySelectorAll('main section[data-node]').forEach(function(s){
   var hid=false;
   if(state&&s.getAttribute('data-state')!==state)hid=true;
   if(!hid&&words.length){var txt=s.textContent.toLowerCase();
    words.forEach(function(w){if(txt.indexOf(w)<0)hid=true;});}
   s.hidden=hid;});
  /* the contents GRAY OUT an emptied chapter but keep it clickable */
  document.querySelectorAll('#toc a[data-ch]').forEach(function(l){
   var a=document.getElementById(l.getAttribute('data-ch'));
   l.classList.toggle('off',!!(a&&a.classList.contains('flt-empty')));});}
 if(fe)fe.addEventListener('input',apply);
 /* filter help opens in the details pane (owner c6): chrome, not book content.
    The reader views live on the stakeholder rows as view pills; the help keeps
    the baked clickable preset list so the tokens stay discoverable. */
 if(fe){var fhelp=function(){window.bookDetail('Filter','<div class=meta>Filter the book as you type. Combine tokens with spaces; anything else filters as text.</div><ul class=meta>`)
	doc.WriteString(`<li><b>preset:</b>&lt;name&gt;`)
	if len(presetIDs) > 0 {
		doc.WriteString(`<ul>`)
		for _, p := range presetIDs {
			doc.WriteString(`<li><button type="button" data-view="` + htmlEscape(p) + `">` + htmlEscape(strings.TrimPrefix(p, "man-preset-")) + `</button></li>`)
		}
		doc.WriteString(`</ul>`)
	}
	doc.WriteString(`</li><li><b>state:</b>suspect|verified</li></ul>');};
  fe.addEventListener('focus',fhelp);fe.addEventListener('click',fhelp);}
 /* search help mirrors the filter help: focus fills the details pane with the
    how-search-works explainer */
 if(se){var shelp=function(){window.bookDetail('Search','<div class=meta>Searches the text of the whole book as you type.</div><ul class=meta><li>Every match paints yellow.</li><li>The &lsaquo; &rsaquo; buttons step through the matches.</li><li>The counter shows which match you are on.</li><li>Clear the box to end the search.</li></ul>');};
  se.addEventListener('focus',shelp);}
 /* search -> inline match nav (owner c5, req-book-shell-nav.5): step one match at a time,
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
 /* revealHit (req-search-visible-hits): landing on a hit makes it VISIBLE first —
    collapsed details ancestors open, a hidden expand row unhides with its trigger row
    marked open, and a graph hit pans its svg viewBox onto the hit. */
 function revealHit(x){var el=x.node.parentElement;if(!el)return;
  for(var a=el;a&&a.tagName!=='MAIN';a=a.parentElement){
   if(a.tagName==='DETAILS'&&!a.open)a.open=true;
   if(a.hasAttribute&&a.hasAttribute('hidden'))a.removeAttribute('hidden');
   if(a.classList&&a.classList.contains('udetail')){
    var pr=a.previousElementSibling;if(pr&&pr.classList.contains('urow'))pr.classList.add('open');}
  }
  var svg=el.ownerSVGElement;
  if(svg&&svg.getAttribute('viewBox')&&el.getBBox){try{
   var bb=el.getBBox(),vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
   svg.setAttribute('viewBox',(bb.x+bb.width/2-vb[2]/2)+' '+(bb.y+bb.height/2-vb[3]/2)+' '+vb[2]+' '+vb[3]);
  }catch(e){}}}
 function goHit(i){var x=hits[i];if(!x)return;
  var host=x.node.parentElement;if(window.bookPageTo)window.bookPageTo(host);
  revealHit(x);
  var r=document.createRange();
  try{r.setStart(x.node,x.start);r.setEnd(x.node,x.start+x.len);
   var rect=r.getBoundingClientRect();
   window.scrollTo({top:rect.top+window.scrollY-window.innerHeight/3});}catch(e){host.scrollIntoView();}}
 function stepHit(d){if(!hits.length)return;hcur=(hcur+d+hits.length)%hits.length;updateNav();goHit(hcur);}
 var hprev=document.getElementById('hits-prev'),hnext=document.getElementById('hits-next');
 if(hprev)hprev.addEventListener('click',function(){stepHit(-1);});
 if(hnext)hnext.addEventListener('click',function(){stepHit(1);});
 if(se)se.addEventListener('input',function(){collectHits((se.value||'').trim());paintHits();hcur=0;updateNav();if(hits.length)goHit(0);});
 /* the previous/next SHORTCUTS: Enter steps forward, Shift+Enter back */
 if(se)se.addEventListener('keydown',function(e){if(e.key!=='Enter')return;
  e.preventDefault();stepHit(e.shiftKey?-1:1);});
 /* the coverage board IS the register's filter row: a facet-count click
    toggles a VISIBLY selected pill and filters the
    register table in the same chapter - OR within one facet, AND across facets,
    multi-select by construction. The board stays the completeness check. */
 document.querySelectorAll('button.facet-count').forEach(function(btn){btn.addEventListener('click',function(){
  btn.classList.toggle('on');
  var art=btn.closest?btn.closest('article.ch'):null;if(!art)return;
  var act={};
  Array.prototype.forEach.call(art.querySelectorAll('button.facet-count.on'),function(x){
   var t=x.getAttribute('data-target')||'',m=t.match(/^f-([a-z]+)-/);
   if(!m)return;(act[m[1]]=act[m[1]]||{})[t]=true;});
  Array.prototype.forEach.call(art.querySelectorAll('.utable'),function(ut){
   if(ut.setBoardFacets)ut.setBoardFacets(act);});});});
 /* a disclosure's until-found content unhides on open (field c24: expand rendered nothing) */
 document.querySelectorAll('details.disc').forEach(function(d){d.addEventListener('toggle',function(){
  if(d.open)Array.prototype.forEach.call(d.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');});});});
 /* the ONE entry point that shows context help. This pane is chrome, not book content,
    so filling it with markup is acceptable (as the old card was) - escaping is the caller's job. */
 window.bookDetail=function(title,html){var c=document.getElementById('dpane-content');if(!c)return;c.innerHTML='<div class="dh">'+(title||'')+'</div>'+(html||'');document.getElementById('details').classList.remove('collapsed');};
 function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
 /* the click model, book-wide: a single click on a node/term
    reference opens the DETAILS pane - name, brief, and the navigate link. The actual
    NAVIGATION is bookGoto, reached ONLY through that link; it pushes a history entry
    so the browser BACK returns to where the reader clicked. */
 var __gotoStack=[];
 window.bookGoto=function(id){
  var t=document.getElementById(id)||document.querySelector('tr.urow[data-node="'+id+'"]')||document.querySelector('[data-node="'+id+'"]');
  if(!t){if(window.__facetJump)window.__facetJump(id);return;}
  /* a DECK target enters present mode (go-deck-anchors): scrolling to a hidden
     slide section reads as a dead link - the deck rail owns the navigation. */
  if(window.__deckJump&&window.__deckJump(t))return;
  var from=document.querySelector('main article.ch:not(.pg-hide)');
  __gotoStack.push({art:from,y:window.scrollY});
  (window.__quackNav=window.__quackNav||[]).push('goto');
  try{history.pushState({nav:'goto'},'');}catch(_){}
  var ut=t.closest?t.closest('.utable'):null;
  if(ut&&ut.revealRow){var rr=ut.revealRow(id);if(rr)t=rr;}
  if(window.bookPageTo)window.bookPageTo(t);
  var d=t.closest('details');if(d)d.open=true;
  t.scrollIntoView({block:'center'});};
 window.addEventListener('popstate',function(){
  var nv=window.__quackNav||[];
  if(nv.length===0||nv[nv.length-1]!=='goto')return;nv.pop();
  var e=__gotoStack.pop();if(!e)return;
  if(e.art&&window.bookPageTo)window.bookPageTo(e.art);
  window.scrollTo(0,e.y);});
 window.bookNodeDetail=function(id){
  var s=document.querySelector('section[data-node="'+id+'"]')||document.querySelector('tr.urow[data-node="'+id+'"]')||document.querySelector('[data-node="'+id+'"]');
  var meta='',stmt='';
  if(s){meta=(s.getAttribute('data-type')||'')+((s.getAttribute('data-state'))?(' · '+s.getAttribute('data-state')):'');
   var st=s.querySelector('.stmt');
   if(!st&&s.nextElementSibling&&s.nextElementSibling.classList&&s.nextElementSibling.classList.contains('udetail'))st=s.nextElementSibling.querySelector('.stmt');
   if(st)stmt=st.textContent;}
  window.bookDetail(esc(id),(meta?('<div class=meta>'+esc(meta)+'</div>'):'')+(stmt?('<p>'+esc(stmt)+'</p>'):'')+'<a href="#'+esc(id)+'" data-goto="'+esc(id)+'">open the full entry &#8599;</a>');};
 var dbar=document.getElementById('dpane-bar');
 if(dbar)dbar.addEventListener('click',function(){var dp=document.getElementById('details');if(dp)dp.classList.toggle('collapsed');});
 /* pane-internal affordances, delegated (the pane refills): the navigate link and the
    preset buttons of the filter help */
 var dcont=document.getElementById('dpane-content');
 if(dcont)dcont.addEventListener('click',function(e){
  var v=e.target.closest?e.target.closest('button[data-view]'):null;
  if(v){setTok('preset',(v.getAttribute('data-view')||'').replace(/^man-preset-/,''),true);return;}
  var g=e.target.closest?e.target.closest('a[data-goto]'):null;
  if(g){e.preventDefault();window.bookGoto(g.getAttribute('data-goto'));}});
 var dmain=document.querySelector('main');
 if(dmain)dmain.addEventListener('click',function(e){
  /* a views-home button enters its preset into the filter; a second click clears it */
  var v=e.target.closest?e.target.closest('button[data-view]'):null;
  if(v){setTok('preset',(v.getAttribute('data-view')||'').replace(/^man-preset-/,''),true);return;}
  /* a content link with data-goto transports through bookGoto; when it also
     carries a facet (an iteration link), the target table SELECTS that value */
  var g=e.target.closest?e.target.closest('a[data-goto]'):null;
  if(g){e.preventDefault();
   var gid=g.getAttribute('data-goto');window.bookGoto(gid);
   var fn=g.getAttribute('data-facet'),fv=g.getAttribute('data-fv');
   if(fn&&fv){var gt=document.getElementById(gid);
    var gut=gt&&gt.closest?(gt.closest('.utable')||gt):null;
    if(gut&&gut.setFacet)gut.setFacet(fn,fv);}
   return;}
  var s=e.target.closest('section[data-node]');if(!s)return;
  window.bookNodeDetail(s.getAttribute('data-node')||'');});
 document.addEventListener('click',function(e){var t=e.target.closest?e.target.closest('.termref'):null;if(!t)return;e.preventDefault();var goto=t.getAttribute('data-goto'),help=t.getAttribute('data-help')||'';var link=goto?('<a href="#'+goto+'" data-goto="'+goto+'">open the full entry &#8599;</a>'):'';window.bookDetail(t.getAttribute('data-title')||t.textContent,'<p>'+help+'</p>'+link);});
 /* no standing title-card block: a title click feeds the details pane
    like any other click target - the identity rides the button's data attributes */
 var bt=document.getElementById('book-title');
 if(bt)bt.addEventListener('click',function(){window.bookDetail(esc(bt.textContent),
  '<div class=meta><b>state</b> '+esc(bt.getAttribute('data-root'))+'</div>'+
  '<div class=meta><b>iteration</b> '+esc(bt.getAttribute('data-iteration'))+'</div>'+
  '<div class=meta><b>engine</b> '+esc(bt.getAttribute('data-engine'))+'</div>');});
 /* unified reader table: each .upills row is a filter facet (AND
    across facets, OR within one), the controls below the table filter and paginate the visible
    set, a row toggles its detail. The script only ever toggles visibility - never creates content. */
 document.querySelectorAll('.utable').forEach(function(ut){
  var tb=ut.querySelector('table.u-table'),body=tb?tb.tBodies[0]:null;if(!body)return;
  var facets={},board={},page=0;
  /* the emitted pill states seed the model (FacetOff pre-selection): a chip already
     wearing .on starts selected - the default is data, not code */
  Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){var fn=fe.getAttribute('data-facet');if(!fn)return;facets[fn]={};
   Array.prototype.forEach.call(fe.querySelectorAll('.upill.on'),function(p){var v=p.getAttribute('data-fv');if(v!=='*')facets[fn][v]=true;});});
  function size(){var s=ut.querySelector('.qt-size');return s?+s.value:20;}
  function rows(){return Array.prototype.slice.call(body.querySelectorAll('tr.urow'));}
  function detailOf(r){var n=r.nextElementSibling;return (n&&n.classList.contains('udetail'))?n:null;}
  function matches(r){
   var qi=ut.querySelector('.qt-search'),q=(qi&&qi.value?qi.value:'').toLowerCase();
   if(q&&(r.getAttribute('data-text')||'').indexOf(q)<0)return false;
   for(var fn in facets){var act=facets[fn],any=false,k;
    for(k in act){if(act[k]){any=true;break;}}
    if(!any)continue;
    if(fn.indexOf('b:')===0){var fok=false;
     for(k in act){if(act[k]&&r.classList.contains('f-'+fn.slice(2)+'-'+k)){fok=true;break;}}
     if(!fok)return false;
    }else if(!act[r.getAttribute('data-'+fn)||''])return false;}
   /* board facets: the coverage board's selected values filter here -
      OR within one facet, AND across facets, over the rows' baked f-… classes */
   for(var bf in board){var bact=board[bf],bany=false,bk;
    for(bk in bact){if(bact[bk]){bany=true;break;}}
    if(!bany)continue;
    var bok=false;for(bk in bact){if(bact[bk]&&r.classList.contains(bk)){bok=true;break;}}
    if(!bok)return false;}
   return true;}
  ut.setBoardFacets=function(act){board=act||{};page=0;apply();};
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
  /* header click sorts: asc, then desc; numeric-aware when every filled cell parses
     as a number; the sort MOVES the existing row pairs - it never creates content */
  var hrow=tb.tHead?tb.tHead.rows[0]:null;
  if(hrow)Array.prototype.forEach.call(hrow.cells,function(th,ci){
   th.addEventListener('click',function(){
    var dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending';
    Array.prototype.forEach.call(hrow.cells,function(x){x.removeAttribute('aria-sort');});
    th.setAttribute('aria-sort',dir);
    var pairs=rows().map(function(r){var c=r.cells[ci];
     return {r:r,d:detailOf(r),k:c?c.textContent.trim():''};});
    var num=pairs.some(function(p){return p.k!=='';})&&
     pairs.every(function(p){return p.k===''||isFinite(parseFloat(p.k));});
    pairs.sort(function(a,b){var x=a.k,y=b.k;
     if(num){x=x===''?-Infinity:parseFloat(x);y=y===''?-Infinity:parseFloat(y);}
     else{x=x.toLowerCase();y=y.toLowerCase();}
     return x<y?(dir==='ascending'?-1:1):(x>y?(dir==='ascending'?1:-1):0);});
    pairs.forEach(function(p){body.appendChild(p.r);if(p.d)body.appendChild(p.d);});
    page=0;apply();});});
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
  /* filter-column scroll arrows (req-filter-pill-rule): past ten values the chip
     column scrolls; each arrow nudges it three chip heights. */
  Array.prototype.forEach.call(ut.querySelectorAll('.uarrow'),function(a){a.addEventListener('click',function(){
   var col=a.closest('.upills');if(!col)return;var ch=col.querySelector('.ufchips');if(!ch)return;
   ch.scrollTop+=a.getAttribute('data-uscroll')==='up'?-75:75;});});
  /* setFacetMulti: select a SET of values of one pill facet (the preset-fragment
     router feeds it) - state and pill classes stay in step; an empty set resets to all */
  ut.setFacetMulti=function(fn,fvs){if(!(fn in facets))return;
   var on={};facets[fn]={};
   fvs.forEach(function(v){facets[fn][v]=true;on[v]=true;});
   Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){if(fe.getAttribute('data-facet')!==fn)return;
    Array.prototype.forEach.call(fe.querySelectorAll('.upill'),function(x){var v=x.getAttribute('data-fv');
     x.classList.toggle('on',v==='*'?fvs.length===0:!!on[v]);});});
   page=0;apply();};
  /* setFacet: exactly ONE value (an iteration link selects its iteration) - the same lane */
  ut.setFacet=function(fn,fv){ut.setFacetMulti(fn,[fv]);};
  ut.revealRow=function(id){var r=body.querySelector('tr.urow[data-node="'+id+'"]');if(!r)return null;
   for(var fn in facets)facets[fn]={};
   board={};
   var art=ut.closest?ut.closest('article.ch'):null;
   if(art)Array.prototype.forEach.call(art.querySelectorAll('button.facet-count.on'),function(x){x.classList.remove('on');});
   Array.prototype.forEach.call(ut.querySelectorAll('.upills'),function(fe){Array.prototype.forEach.call(fe.querySelectorAll('.upill'),function(x){x.classList.toggle('on',x.getAttribute('data-fv')==='*');});});
   var qs=ut.querySelector('.qt-search');if(qs)qs.value='';
   var vis=rows().filter(matches),idx=vis.indexOf(r),sz2=size();page=sz2>0?Math.floor(idx/sz2):0;
   var d=detailOf(r);if(d){d.setAttribute('data-open','1');r.classList.add('open');}
   apply();return r;};
  apply();
 });
 /* onion drill-down (req-interactive-figures.2): the shared interaction script
    (go-onion-interact) — one constant for the book and the standalone review. */
` + onionInteractJS + `
 /* figure fullscreen: the button flips a class on its own figure; an embedded
    cytoscape canvas refits to the new box */
 document.querySelectorAll('[data-figfs]').forEach(function(btn){btn.addEventListener('click',function(){
  var f=btn.closest('figure');if(!f)return;
  f.classList.toggle('fig-full');
  btn.textContent=f.classList.contains('fig-full')?'✕':'⛶';
  if(f.querySelector('#graph')&&window.__quackGraphRefit){setTimeout(window.__quackGraphRefit,0);}});});
 document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
  document.querySelectorAll('figure.fig-full').forEach(function(f){f.classList.remove('fig-full');
   var b=f.querySelector('[data-figfs]');if(b)b.textContent='⛶';});});
 /* the drill-down's type pills (req-timeline-drilldown): first draft, one selection */
 document.addEventListener('click',function(e){
  var p=e.target.closest?e.target.closest('.tdrill .upill'):null;if(!p)return;
  e.preventDefault();var dr=p.closest('.tdrill'),v=p.getAttribute('data-fv');
  Array.prototype.forEach.call(dr.querySelectorAll('.upill'),function(x){x.classList.toggle('on',x===p);});
  Array.prototype.forEach.call(dr.querySelectorAll('.tgroup'),function(g){
   g.style.display=(v==='*'||g.getAttribute('data-ttype')===v)?'':'none';});});
 /* the attention ping (req-details-full-entry): three STATIC border echoes announce a
    pane change — the pane never moves; each echo expands 3vmax outward while fading.
    Dom-static: the script only re-arms the pinging class; the echoes are emitted chrome. */
 function __panePing(card){if(!card)return;
  card.classList.remove('pinging');void card.offsetWidth;card.classList.add('pinging');
  setTimeout(function(){card.classList.remove('pinging');},800);}
 (function(){
  var det=document.getElementById('dpane-content'),card=document.getElementById('details');
  if(!det||!card||!window.MutationObserver)return;
  new MutationObserver(function(){__panePing(card);}).observe(det,{childList:true});
 })();
 /* the RAID matrix (req-risk-matrix): the STANDARD reader table beside the matrix owns
    the pills and the rows; the bubbles just LISTEN - visibility recomputes from the
    pills' on-state after the table script has handled the click, so the default stays
    data, not code. Bubble clicks ride the shared data-node-link lane below. */
 document.querySelectorAll('.raid-matrix').forEach(function(host){
  function apply(){
   var sel={};
   Array.prototype.forEach.call(host.querySelectorAll('.upills'),function(fe){
    var fn=fe.getAttribute('data-facet');if(!fn)return;sel[fn]={};
    var star=fe.querySelector('.upill[data-fv="*"]');
    if(star&&star.classList.contains('on'))return;
    Array.prototype.forEach.call(fe.querySelectorAll('.upill.on'),function(p){
     var v=p.getAttribute('data-fv');if(v!=='*')sel[fn][v]=true;});});
   Array.prototype.forEach.call(host.querySelectorAll('.rbub'),function(c){
    var ok=true;
    for(var fn in sel){var vs=sel[fn];if(!Object.keys(vs).length)continue;
     if(!vs[c.getAttribute('data-'+fn)])ok=false;}
    c.style.display=ok?'':'none';});}
  host.addEventListener('click',function(e){
   if(e.target.closest&&e.target.closest('.upill')){setTimeout(apply,0);return;}
   var bb=e.target.closest?e.target.closest('.rbub'):null;if(!bb)return;
   var id=bb.getAttribute('data-node-link');
   Array.prototype.forEach.call(host.querySelectorAll('tr.rsel'),function(r){r.classList.remove('rsel');});
   var row=host.querySelector('tr.urow[data-node="'+id+'"]');
   if(row){row.classList.add('rsel');if(row.scrollIntoView)row.scrollIntoView({block:'nearest'});}});
  apply();});
 /* trace-item links: a single click opens the node in
    the DETAILS pane; navigation runs through the pane's link, never the click itself */
 document.querySelectorAll('[data-node-link]').forEach(function(a){a.addEventListener('click',function(ev){
  ev.preventDefault();
  window.bookNodeDetail(a.getAttribute('data-node-link'));});});
 /* paging: one top-level section per page (req-book-shell-nav.4); the pager text ECHOES the h1 */
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
  if(el){if(window.__deckJump&&window.__deckJump(el))return;pageToEl(el);el.scrollIntoView();}
  else if(window.__facetJump)window.__facetJump(location.hash.slice(1));});
 /* arrow keys page the book (owner c1) - inert in present mode and while typing */
 document.addEventListener('keydown',function(e){if(b.hasAttribute('data-present'))return;
  if(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))return;
  if(e.key==='ArrowRight')pageShow(pg+1,true);
  if(e.key==='ArrowLeft')pageShow(pg-1,true);});
 pageShow(0,false);
 var cur=-1,slides=[];
 /* navigation clamps at the ends - no wraparound (owner ruling) */
 function show(i){if(!slides.length)return;cur=Math.max(0,Math.min(slides.length-1,i));
  slides.forEach(function(s,j){s.classList.toggle('current',j===cur);});
  var sp=document.getElementById('slide-pos');if(sp)sp.textContent=(cur+1)+'/'+slides.length;
  if(window.__deckShown)window.__deckShown(slides[cur],cur);}
 function deckExit(){if(window.__deckExit)window.__deckExit();b.removeAttribute('data-present');slides.forEach(function(s){s.classList.remove('current');});slides=[];cur=-1;}
 var esc=document.getElementById('slide-esc');if(esc)esc.addEventListener('click',deckExit);
 document.querySelectorAll('button.present').forEach(function(btn){btn.addEventListener('click',function(){
  var d=document.getElementById(btn.getAttribute('data-deck'));
  slides=Array.prototype.slice.call(d.querySelectorAll('.slide'));
  b.setAttribute('data-present',btn.getAttribute('data-deck'));
  if(window.__deckEnter)window.__deckEnter(d);show(0);});});
 /* an element inside a deck presents its slide - the comment layer pans to deck-anchored
    comments through this; the deck DOM is off-screen outside present mode */
 window.bookSlideTo=function(el){var s=el&&el.closest?el.closest('.slide'):null;if(!s)return false;
  var d=s.closest('article.deck');if(!d)return false;
  if(b.getAttribute('data-present')!==d.id){slides=Array.prototype.slice.call(d.querySelectorAll('.slide'));b.setAttribute('data-present',d.id);if(window.__deckEnter)window.__deckEnter(d);}
  show(slides.indexOf(s));return true;};
 document.addEventListener('keydown',function(e){if(!b.hasAttribute('data-present'))return;
  if(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))return;
  if(e.key==='ArrowRight'||e.key==='PageDown')show(cur+1);
  if(e.key==='ArrowLeft'||e.key==='PageUp')show(cur-1);
  if(e.key==='Escape')deckExit();});
 apply();
})();
`)
	// the deck half of the shell script rides the SAME script element: window-level hooks
	// the present machinery above calls (go-deck-anchors owns the const).
	doc.WriteString(deckAnchorsJS)
	doc.WriteString("</script>\n")
	// design: go-annotator-core  implements: req-comment-layer.8, req-comment-layer.6, req-comment-layer.5, req-comment-layer.3, req-comment-layer.4, req-comment-layer.12, req-comment-layer.14, req-comment-layer.2, req-comment-layer.1, req-comment-layer.10, req-comment-layer.11, req-comment-layer.13, req-comment-ux-keep.1, req-comment-ux-keep.2
	// While a comment is unsaved, the layer warns before the copy closes (beforeunload). It keeps the comment and minimize controls in one place, and never shifts the bar when a post lands. The comment layer's core is emitted OUTSIDE <main>: one empty island slot plus the quack-annotator script. Anchors equal unit id plus quote/prefix/suffix plus position, the W3C shape. Figure marks target <g id> elements, falling back to the whole figure's unit. Paint goes through the CSS Custom Highlight API, so the content DOM is NEVER mutated. Every comment string renders via textContent, with no innerHTML anywhere in the layer. The island rewrite escapes angle brackets so stored text can never close the script tag.
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
/* one toggle, one corner: the open-state minimize and the closed-state
   opener share the .qc-toggle look and the upper-right spot */
var min=el('button','qc-toggle','minimize');
head.appendChild(title);head.appendChild(min);sb.appendChild(head);
var nameInp=el('input','',undefined);nameInp.id='qc-name';
nameInp.placeholder='your name (changeable)';
nameInp.value=localStorage.getItem('quack-comment-author')||'';
nameInp.addEventListener('input',function(){localStorage.setItem('quack-comment-author',nameInp.value.trim());});
sb.appendChild(nameInp);
var list=el('div','qc-list',undefined);sb.appendChild(list);
document.body.appendChild(sb);
var toggle=el('button','qc-toggle','');toggle.id='quack-sb-toggle';toggle.hidden=true;
document.body.appendChild(toggle);
function setOpen(open){document.body.setAttribute('data-qc',open?'open':'min');toggle.hidden=open;}
/* opening the panel fills the details pane with the how-it-works explainer - the
   marking gesture is not self-explanatory */
function explain(){if(!window.bookDetail)return;
 window.bookDetail('Comments','<ul class=meta>'+
  '<li>Select text anywhere in the book.</li>'+
  '<li>Click the <b>comment</b> button that appears.</li>'+
  '<li>Write in the panel card. Post it.</li>'+
  '<li>Double-click a figure to comment it.</li>'+
  '<li>Comments live inside this file. <b>save</b> writes them into your copy.</li>'+
  '</ul>');}
min.addEventListener('click',function(){setOpen(false);});
toggle.addEventListener('click',function(){setOpen(true);explain();});
function panTo(a){var t=a.target||{};
 /* paged book: flip to the target's page before scrolling */
 var tu=document.getElementById(t.el||t.unit||'');
 if(tu&&window.bookSlideTo&&window.bookSlideTo(tu))return;
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
  /* qc-draft (field c5, req-comment-ux-keep.1): unposted text survives every re-render -
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
      posted comment does not shift the input bar */
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
   /* a presented slide is position:fixed - the button must pin to the viewport there,
      or a scrolled book puts it off-screen */
   var pres=document.body.hasAttribute('data-present');
   fab.style.position=pres?'fixed':'absolute';
   fab.style.left=((pres?e.clientX:e.pageX)+8)+'px';
   fab.style.top=((pres?e.clientY:e.pageY)-34)+'px';}
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
var boot=QC.data.annotations.length>0;
setOpen(boot);if(boot)explain();
/* warn before the copy is closed with an unsaved comment in a composer */
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
 /* a copy saved mid-presentation must reopen as the BOOK: the present state is
    session chrome, not content */
 var body=clone.querySelector('body');if(body){body.removeAttribute('data-qc');body.removeAttribute('data-present');}
 Array.prototype.forEach.call(clone.querySelectorAll('.slide.current'),function(s){s.classList.remove('current');});
 var sp=clone.querySelector('#slide-pos');if(sp)sp.textContent='';
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
 /* save auto-posts every unposted draft first (field c5, req-comment-ux-keep.1) */
 if(window.quackCommentsUI&&window.quackCommentsUI.postAllDrafts)window.quackCommentsUI.postAllDrafts();
 if(!saveInPlace())download();});
})();
</script>
</body></html>
`)
	// enddesign
	return doc.String(), findings, advisories
}

// design: go-book-a11y  implements: req-book-artifact.4
// WCAG 2 AA applies over every surface the views added, the prior-art check's miss, owner-added at M2. This means landmarks (header, labeled nav, main), a real heading hierarchy, and native focusable controls only (button, input, summary, a, never a click-only div). Contrast is COMPUTED, not eyeballed. The theme colors live in ONE map, the stylesheet renders from it, and the selftest recomputes the WCAG ratio against the page background: text at 4.5:1, graphics at 3:1.
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

// design: go-book-drift  implements: req-book-trust.3
// Every published book copy, spec/book.html and the Pages copy docs/book.html, both written at ship, must equal a fresh render. The emitter is deterministic by construction, with no timestamps; identity equals the merkle root. So same state means same bytes, and a drifted copy is a lint finding. An absent copy is disarmed, since day-to-day renders live in the data home.
func committedBookPath() string { return filepath.Join(SPEC, "book.html") }

// docsBookPath is the GitHub-Pages copy of the book: <workspace-root>/docs/book.html.
// Pages serves only the root or /docs, so this copy makes the book readable without cloning.
func docsBookPath() string { return filepath.Join(ROOT, "docs", "book.html") }

// publishedBookPaths lists every book copy the ship writes and the drift law covers.
func publishedBookPaths() []string { return []string{committedBookPath(), docsBookPath()} }

func bookDriftFindingAt(path string, nodes map[string]Node) []string {
	committed, err := os.ReadFile(path)
	if err != nil {
		return nil // not committed: disarmed
	}
	fresh, _, _ := renderBookHTML(nodes)
	if string(committed) == fresh {
		return nil
	}
	return []string{"the committed book differs from a fresh render - regenerate it at ship (req-book-trust.3)"}
}

// bookDriftFindings drift-checks every published copy against ONE fresh render.
func bookDriftFindings(nodes map[string]Node) []string {
	var out []string
	fresh, rendered := "", false
	for _, p := range publishedBookPaths() {
		committed, err := os.ReadFile(p)
		if err != nil {
			continue // absent: disarmed
		}
		if !rendered {
			fresh, _, _ = renderBookHTML(nodes)
			rendered = true
		}
		if string(committed) != fresh {
			rel, rerr := filepath.Rel(ROOT, p)
			if rerr != nil {
				rel = p
			}
			out = append(out, filepath.ToSlash(rel)+" differs from a fresh render - regenerate it at ship (req-book-trust.3)")
		}
	}
	return out
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
	if len(findings) > 0 {
		quackExit(1)
	}
}

// enddesign

// design: go-book-figures  implements: req-book-artifact.5
// The derived figure set (adr-figures-derived-set) has four diagram kinds whose layout is trivial arithmetic, rendering as inline SVG with REAL text: context model, building-block tree, timeline, stakeholder matrix. Each is fed from live graph data, sorted for determinism. A manifest unit references one with a single `fig: <kind>` line. Authored inline SVG passes through mdLite as ordinary, provenance-marked, content, the generous release valve. fig: model takes an optional node-id argument, and the group carries it through.
var figRefRe = regexp.MustCompile(`^fig:\s*([a-z-]+(?:\s+[a-z0-9-]+)?)\s*$`)

// design: go-fig-elem-ids  implements: req-comment-layer.6
// Figure sub-elements carry stable ids. Without them, figure part-marking has nothing to grab. Each figure takes the next ordinal at render, reset per emit so regeneration stays byte-identical. Each element wraps in a <g> whose id slugs its label: fig<N>-<label-slug>. The comment layer anchors to these ids.
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

// circleBorder returns the point on the circle (centre cx,cy, radius r) along the ray from
// the centre toward (tx,ty). A core arrow aims at the core CENTRE and clips here, so it reads
// as pointing radially at the middle instead of at the top of the circle.
func circleBorder(cx, cy, r, tx, ty int) (int, int) {
	dx, dy := float64(tx-cx), float64(ty-cy)
	d := math.Hypot(dx, dy)
	if d < 1e-6 {
		return cx + r, cy
	}
	return cx + int(float64(r)*dx/d), cy + int(float64(r)*dy/d)
}

// svgContextModel draws the derived context diagram. Actors split by flank:
// direction `in` feeds the system and sits LEFT, direction `out` consumes
// from it and sits RIGHT; an actor without a direction joins the left flank. Each flank
// fans out vertically from the middle.
// design: go-structure-layers  implements: req-structure-layers
// The reading path, an owner ruling. The context model's CENTRE routes into the
// workspace's own structural model, model-<brand>-structure. The id is brand-derived,
// so a vehicle inherits the path. The structural model's determinizer element routes
// onward into the onion via its authored `%% route:` line. Each hop rides the book's
// standard data-node-link click lane. No hop is hardcoded to this workspace.
func contextModelRoute(nodes map[string]Node) string {
	id := "model-" + brand() + "-structure"
	if _, ok := nodes[id]; ok {
		return id
	}
	return ""
}

// enddesign

func svgContextModel(center string, ins, outs []string, route string, iface map[string][2]string) string {
	fig := figNext()
	var b strings.Builder
	b.WriteString(`<svg viewBox="0 0 640 420" font-family="system-ui" font-size="13" role="img" aria-label="context diagram">`)
	link := ""
	if route != "" {
		link = ` data-node-link="` + htmlEscape(route) + `" style="cursor:pointer"`
	}
	b.WriteString(fmt.Sprintf(`<g id="%s"%s><rect x="250" y="180" width="140" height="60" rx="8" fill="#e8f0fe" stroke="#4a6fa5"/><text x="320" y="215" text-anchor="middle">%s</text></g>`, figElemID(fig, center), link, htmlEscape(center)))
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
			ln := fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#999"/>`, sx, sy, ex, ey)
			if fi, ok := iface[a]; ok && fi[0] != "" {
				// the boundary line IS the interface: a label on the connector, the
				// full note one click away
				mx, my := (sx+ex)/2, (sy+ey)/2
				ln = `<g data-node-link="` + htmlEscape(fi[0]) + `" style="cursor:pointer">` + ln +
					fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#667">%s</text>`, mx, my-4, htmlEscape(fi[1])) + `</g>`
			}
			b.WriteString(ln)
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

// design: go-onion-figure  implements: req-interactive-figures.2, req-compact-derived.1, req-onion-io-rendering
// The onion figure is a drill-down over the DESIGN ELEMENTS, the marked code regions. The layer map comes from go-onion-model-source. In MODEL mode ring membership is STRAIGHT from the model: elements are design regions, and files are THEMES (secondary info only). A file never earns a ring and never renders as a block. In FALLBACK mode (spec/design-layers.md, stub projects) an element takes the layer of its FILE per the pattern map, the old behavior, untouched. The intra/inter-element flow is the REAL call graph derived by deriveDesignFlow, a static AST pass: consumes[A] = design ids A calls into, and reads[A]/writes[A] = A does external input/output. The ONION is the OVERVIEW ONLY. Level 0 draws concentric layer rings, one per SURVIVING layer, each labelled `name · N elements`. `inputs:` enters from the TOP, and `outputs:` leaves to the BOTTOM as external boxes; every overview arrow STOPS at the onion's outside. No element cards appear here; a changed ring carries a DOT. A layer with NO flow at all, where every element is off-flow infrastructure, is SKIPPED entirely: no ring, no view. Its elements sink INWARD into the next surviving layer's infrastructure pills. Below the overview the drill-down keeps the owner's ONION vs CLUSTER split (go-onion-busbar renders both shapes). Level 1 is the BAND view, and a band is itself an ONION. It has a ROUND body with the band's INPUT bars across the TOP, OUTPUT bars across the BOTTOM, and its BLOCKS beside the centre by the side rule. Unless it is the innermost KERNEL, it also carries a central CORE at the dead centre. The core is the inner bands beneath. It is the drill affordance INTO the next-inner band, a single-click, its only action. Bars follow FLOW CONSERVATION. An input bar is an edge that ENTERS the band from an OUTER band, keyed by the source band, or the external world for os reads. An output bar LEAVES it to an outer band. An edge crossing to an INNER band routes to the CORE instead of a bar; that is signal TO or FROM the core. An edge whose two ends are both in the band draws as a direct block-to-block SIBLING arrow, never detouring through a bar. The kernel band is a round, coreless onion, since nothing lies beneath it. In model mode a BLOCK is a DSM COUPLING MODULE (go-onion-dsm-groups): one cluster per coupling group carrying SEVERAL of the layer's regions, labelled `module k` + `N regions`. An uncoupled region renders itself, with responsibility text as the label and `in file` as the subtitle. Region arrows aggregate to block level, deduplicated; a collapsed multiplicity shows as `×N`. Level 2 opens ONE cluster into a coreless bus-bar BOX; a cluster is NOT an onion, with no round body and no core. The cluster's own INPUT bars sit on top, OUTPUT bars on the bottom, its regions as blocks in the middle, and region-to-region arrows inside. Conservation carries the cluster's band-level I/O down. Exactly the bars it tapped as a band block reappear. A member may itself be a cluster: the interior re-derives its grouping, and the bus-only, coreless boundary repeats at every depth. A band-level SIBLING arrow becomes a `from <sibling>` / `→ <sibling>` bar once that sibling is outside the drilled view. A drillable block hangs a small drill HANDLE off its own bottom edge, double-click to ENTER. A leaf block has none. SINGLE-click a block to INSPECT it, showing details and highlighting its connections while staying at this level; the review render adds a details panel. Every region block transports to its trace item on tap, the conn-code-designs surface. Design elements OFF the flow entirely render as `infrastructure:` pills below the figure, each linking to its trace item. Model-mode AMBIENT elements always render as those pills; they sit on no ring, flow or not. EVERY view, levels 0, 1, and 2, is pre-rendered static DOM with its own breadcrumbs and layer nav. The script only toggles which view shows; it never creates content. Excluded patterns, such as iteration files, stay out. In model mode, non-engine marker files (method/*.md) stay out too. An element no source claims falls into an outermost `unmapped` ring, so the map cannot rot silently. In model mode that ring holds regions the model does not allocate; the sky-fall lint keeps it empty.
type onionLayer struct {
	name string
	pats []string
}

// designLayersPath resolves the layer map: spec/design/ is its home; the old
// top-level spot stays a fallback for vehicles that have not moved yet.
func designLayersPath() string {
	p := filepath.Join(SPEC, "design", "design-layers.md")
	if _, err := os.Stat(p); err == nil {
		return p
	}
	return filepath.Join(SPEC, "design-layers.md")
}

func readDesignLayers() (layers []onionLayer, excludes, inputs, outputs, infra []string) {
	raw, err := os.ReadFile(designLayersPath())
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
			for _, p := range pats {
				inputs = append(inputs, stripNbrAnnotation(p))
			}
		case "outputs":
			for _, p := range pats {
				outputs = append(outputs, stripNbrAnnotation(p))
			}
		case "infra":
			infra = append(infra, pats...)
		default:
			layers = append(layers, onionLayer{name: name, pats: pats})
		}
	}
	return layers, excludes, inputs, outputs, infra
}

// an inputs/outputs entry may name its neighbour: `git (nbr-git)`. The name
// renders; the neighbour drives the overview pill's click-through.
func stripNbrAnnotation(p string) string {
	if i := strings.Index(p, "("); i > 0 {
		return strings.TrimSpace(p[:i])
	}
	return p
}

// designLayerNeighbours maps each annotated input/output name to its neighbour.
func designLayerNeighbours() map[string]string {
	out := map[string]string{}
	raw, err := os.ReadFile(designLayersPath())
	if err != nil {
		return out
	}
	re := regexp.MustCompile(`([^,:()]+)\((nbr-[a-z0-9-]+)\)`)
	for _, ln := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
		t := strings.TrimSpace(ln)
		if !strings.HasPrefix(t, "inputs:") && !strings.HasPrefix(t, "outputs:") {
			continue
		}
		for _, m := range re.FindAllStringSubmatch(t, -1) {
			out[strings.TrimSpace(m[1])] = m[2]
		}
	}
	return out
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
// The I/O selector vocabulary lives in ioSelClass (io_busbar.go, go-io-busbar):
// disk touches apart from console traffic, one classification for the flow pass
// and the busbar taps alike.

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
//
// design: go-lint-ast-cache  implements: req-battery-lean
// The flow is derived ONCE per process. The engine source cannot change within a run, yet a single lint asks for the flow more than once (the conformance pass, then every model figure of the book-drift render). Each ask used to re-run go/parser over the whole engine source. The memo holds the derived facts for the process lifetime. Callers treat the returned maps as read-only. It stays in-process only; nothing lands on disk, so there is no staleness risk across runs.
var designFlowMemo *struct {
	consumes map[string][]string
	reads    map[string]bool
	writes   map[string]bool
	diskR    map[string]bool
	diskW    map[string]bool
}

func deriveDesignFlow() (map[string][]string, map[string]bool, map[string]bool) {
	if designFlowMemo == nil {
		c, r, w, dr, dw := deriveDesignFlowUncached()
		designFlowMemo = &struct {
			consumes map[string][]string
			reads    map[string]bool
			writes   map[string]bool
			diskR    map[string]bool
			diskW    map[string]bool
		}{c, r, w, dr, dw}
	}
	return designFlowMemo.consumes, designFlowMemo.reads, designFlowMemo.writes
}

// deriveDesignIO returns the DISK subsets of the derived I/O flags (go-io-busbar):
// the blocks that tap the onion's disk busbar.
func deriveDesignIO() (diskReads, diskWrites map[string]bool) {
	deriveDesignFlow()
	return designFlowMemo.diskR, designFlowMemo.diskW
}

// enddesign

func deriveDesignFlowUncached() (consumes map[string][]string, reads, writes, diskR, diskW map[string]bool) {
	consumes = map[string][]string{}
	reads = map[string]bool{}
	writes = map[string]bool{}
	diskR = map[string]bool{}
	diskW = map[string]bool{}
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
	// sorted span order: adjacent region spans overlap by a line and inSpan takes the
	// FIRST match - map-walk order would make the attribution (so the flow/infra split and the
	// derived edges) flip per process.
	for _, spans := range byFile {
		sort.Slice(spans, func(i, j int) bool {
			if spans[i].start != spans[j].start {
				return spans[i].start < spans[j].start
			}
			return spans[i].id < spans[j].id
		})
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
	// sorted file order: symOf resolves name collisions (methods share bare names across
	// types) by last-write-wins - map-order iteration would make the winner flip per process and
	// the derived edges (so the rendered book) nondeterministic.
	paths := make([]string, 0, len(byFile))
	for path := range byFile {
		paths = append(paths, path)
	}
	sort.Strings(paths)
	for _, path := range paths {
		spans := byFile[path]
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
						// the class split (go-io-busbar): disk touches apart from
						// console traffic; the union flags keep their historical meaning
						switch ioSelClass(key) {
						case "disk-read":
							reads[owner] = true
							diskR[owner] = true
						case "disk-write":
							writes[owner] = true
							diskW[owner] = true
						case "read":
							reads[owner] = true
						case "write":
							writes[owner] = true
						default:
							if x.Name == "flag" {
								reads[owner] = true
							}
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
	return consumes, reads, writes, diskR, diskW
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

func renderOnion(nodes map[string]Node) string { return renderOnionOpt(nodes, nil) }

// renderOnionOpt renders the layer onion. rev == nil is the book projection —
// its output is byte-identical to the historical renderOnion. A non-nil rev is
// the standalone REVIEW projection: it draws the model's planned (unrealized)
// elements as extra blocks, wires the authored a-to-b edges that touch them, and
// propagates a change-mark up the drill-down (element -> cluster -> ring), so a
// marked block badges at every level. Every rev-gated line below emits nothing
// when rev == nil, which is what keeps the book render byte-stable.
// onionInput is the DATA SOURCE behind the interactive onion renderer: layers in
// rank order, the elements (id -> layer via model, label via model, theme via relOf),
// and the flow between them. Two bindings fill it. The ENGINE binding
// (renderOnionOpt) keeps today's behavior exactly: onionLayerSource's model +
// deriveDesignFlow's code-derived arrows, file themes as clusters, trace links on
// blocks. The GRAPH binding (renderOnionFromGraph) adapts any extracted modelGraph:
// bands from layers, blocks from elements, arrows from the authored flows only
// (payload-labeled), no file-theme clusters — bands hold blocks directly.
type onionInput struct {
	layers          []onionLayer
	inputs, outputs []string
	model           *modelOnion
	consumes        map[string][]string
	reads, writes   map[string]bool
	// the disk subsets (go-io-busbar): only these tap the declared "disk" bus
	diskReads, diskWrites map[string]bool
	payload               map[[2]string]string // authored payload per src->dst edge; nil = count labels only
	els                   []string             // the block-earning element ids
	relOf                 map[string]string    // element -> its theme path ("" = none)
	themes                bool                 // group a layer's blocks into DSM coupling modules (the engine binding)
	links                 bool                 // blocks carry data-node-link to their trace items
	crumb                 string               // overview crumb text ("" = the brand's default)
	idp                   string               // instance id prefix; "" mints the fig-sequence default
	sizeClass             string               // extra class on the .onion host (the compact slide instance)
	ioLink                map[string]string    // input/output name -> the node its pill opens (interface note or neighbour)
}

func renderOnionOpt(nodes map[string]Node, rev *onionReview) string {
	layers, excludes, inputs, outputs, _, model := onionLayerSource()
	if len(layers) == 0 {
		return `<p class="meta">no layer map yet — the onion renders once spec/models/model-engine-layers.md (or the spec/design-layers.md fallback) names the layers</p>`
	}
	// The REAL derived call graph between design elements (one AST pass; call once).
	consumes, reads, writes := deriveDesignFlow()
	// Review mode: the memo maps are shared read-only, so copy `consumes` before
	// merging the authored edges that reach a planned element — this connects the
	// new blocks the book render (realized code only) never draws.
	planned := map[string]bool{}
	if rev != nil && model != nil {
		for id := range model.layerOf {
			if _, real := nodes[id]; !real {
				planned[id] = true
			}
		}
		cp := make(map[string][]string, len(consumes))
		for k, v := range consumes {
			cp[k] = v
		}
		consumes = cp
		for _, fl := range model.flows {
			if !planned[fl.Src] && !planned[fl.Dst] {
				continue // an all-realized edge already rode the AST pass
			}
			consumes[fl.Src] = appendUniqStr(consumes[fl.Src], fl.Dst)
		}
	}

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
		// Every design region's file, even one excluded from the block grid below: theme()
		// and the band classification (layerOf) need it regardless of whether the region
		// earns its own visible block (deriveDesignFlow's AST pass sees an excluded region
		// as a flow endpoint just as readily as a rendered one).
		relOf[id] = rel
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
		els = append(els, id)
	}
	// Review mode: add the model's PLANNED elements (declared, not yet realized) as
	// blocks so the reviewer sees what is new. A synthetic per-element theme keeps
	// each planned block distinct (never clustered with realized code).
	if rev != nil && model != nil {
		for id := range planned {
			if _, done := relOf[id]; done {
				continue
			}
			relOf[id] = "planned/" + id + ".go"
			els = append(els, id)
			rev.marked[id] = true // a planned element is a change, auto-marked
		}
	}
	diskR, diskW := deriveDesignIO()
	// an annotated input/output pill opens its neighbour's interface note, the
	// neighbour itself when no note exists
	ioLink := map[string]string{}
	if nbrOf := designLayerNeighbours(); len(nbrOf) > 0 {
		note := map[string]string{}
		if edges, err := LoadConnections(SPEC); err == nil {
			for _, e := range edges {
				if e.Kind != "interface" {
					continue
				}
				for _, end := range []string{e.Src, e.Dst} {
					if strings.HasPrefix(end, "nbr-") && note[end] == "" {
						note[end] = e.Note
					}
				}
			}
		}
		for name, nbr := range nbrOf {
			if n := note[nbr]; n != "" {
				ioLink[name] = n
			} else {
				ioLink[name] = nbr
			}
		}
	}
	in := onionInput{layers: layers, inputs: inputs, outputs: outputs, model: model,
		ioLink:   ioLink,
		consumes: consumes, reads: reads, writes: writes,
		diskReads: diskR, diskWrites: diskW, els: els, relOf: relOf,
		themes: true, links: true}
	return renderOnionData(in, rev, nodes)
}

// renderOnionFromGraph renders ANY extracted layered model through the SAME
// interactive onion the engine's own model uses — the graph binding of onionInput.
// A graph without ranked layers falls back to the flow figure (it is no onion).
func renderOnionFromGraph(g modelGraph, idp string) string {
	mo := modelOnionFromGraph(g)
	if mo == nil {
		return svgModelGraph(g)
	}
	layers := make([]onionLayer, len(mo.rings))
	for i, ly := range mo.rings {
		layers[i] = onionLayer{name: ly}
	}
	consumes := map[string][]string{}
	payload := map[[2]string]string{}
	for _, f := range g.Flows {
		consumes[f.Src] = appendUniqStr(consumes[f.Src], f.Dst)
		k := [2]string{f.Src, f.Dst}
		if _, ok := payload[k]; !ok {
			payload[k] = f.Payload
		}
	}
	els := make([]string, 0, len(g.Elems))
	relOf := map[string]string{}
	for id := range g.Elems {
		els = append(els, id)
		relOf[id] = id
	}
	in := onionInput{layers: layers, model: mo, consumes: consumes,
		reads: map[string]bool{}, writes: map[string]bool{}, payload: payload,
		els: els, relOf: relOf, crumb: "layered overview", idp: idp, sizeClass: "onion-sm"}
	return renderOnionData(in, nil, nil)
}

// renderOnionData is the ONE renderer behind every onion instance: it draws
// whatever onionInput describes. nodes may be nil (the graph binding); it feeds
// only the review projection's inspect data.
func renderOnionData(in onionInput, rev *onionReview, nodes map[string]Node) string {
	layers, inputs, outputs, model := in.layers, in.inputs, in.outputs, in.model
	consumes, reads, writes := in.consumes, in.reads, in.writes
	els, relOf := in.els, in.relOf
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
	classify := func(id string) string {
		if model != nil {
			if ln := model.layerOf[id]; ln != "" {
				return ln
			}
			return "unmapped" // the model does not allocate it — the sky-fall lint's territory
		}
		return assign(relOf[id])
	}
	band := func(id string) {
		ln := classify(id)
		layerOf[id] = ln
		if ln == "unmapped" {
			haveUnmapped = true
		}
		if ln == "ambient" {
			ambientIDs = append(ambientIDs, id)
		}
	}
	for _, id := range els {
		band(id)
	}
	// A region can be a flow ENDPOINT without ever earning its own block above: deriveDesignFlow's
	// AST pass sees every design marker, iteration-file exclude or not, so a call into (or out of)
	// an excluded-file region (e.g. a region living in i*_red.go) still shows up in consumes/reads/
	// writes. Band those too, so no cross-band bar ever falls back to Go's map zero-value "" — the
	// targetless "→" bug. This never changes which ids get their own visible block (els is untouched).
	if len(layerOf) > 0 {
		seen := make(map[string]bool, len(layerOf))
		for id := range layerOf {
			seen[id] = true
		}
		var extra []string
		addExtra := func(id string) {
			if id == "" || seen[id] {
				return
			}
			seen[id] = true
			extra = append(extra, id)
		}
		for a, tos := range consumes {
			addExtra(a)
			for _, t := range tos {
				addExtra(t)
			}
		}
		for id := range reads {
			addExtra(id)
		}
		for id := range writes {
			addExtra(id)
		}
		sortStrings(extra)
		for _, id := range extra {
			band(id)
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

	declaredOnly := len(consumes) == 0 && len(reads) == 0 && len(writes) == 0 && len(inputs)+len(outputs) > 0

	// (1) SKIP no-flow layers: a layer with at least one ON-flow element (it consumes,
	// is consumed, or reads/writes) SURVIVES and keeps a ring + view; a layer where every element is
	// off-flow infrastructure gets NEITHER. Rings run outermost→innermost, so "inner" = higher index;
	// a skipped layer's elements sink INWARD into the next surviving layer's infrastructure pills.
	layerHasFlow := func(name string) bool {
		if declaredOnly && len(elemsByLayer[name]) > 0 {
			return true
		}
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
			if !declaredOnly && offFlow(id) {
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

	// change-mark propagation (review mode): a marked element makes its enclosing
	// cluster and ring marked, so the mark travels up toward the reader. All three
	// closures answer false when rev == nil, so the book render draws no badge.
	isMarked := func(id string) bool { return rev != nil && rev.marked[id] }
	anyMarked := func(ids []string) bool {
		for _, id := range ids {
			if isMarked(id) {
				return true
			}
		}
		return false
	}
	layerMarked := func(s survivor) bool { return anyMarked(s.flow) || anyMarked(s.infra) }

	// the instance id root: a prefixed instance never touches the fig sequence, so
	// N onions coexist on one page with disjoint view/element/marker ids.
	base := in.idp + "-o"
	if in.idp == "" {
		base = "fig" + itoa(figNext()) + "-o"
	}
	viewID := func(si int) string { return base + "Lv" + itoa(si) }
	shortID := func(id string) string {
		s := strings.TrimPrefix(id, "go-")
		if len(s) > 16 {
			s = s[:15] + "…"
		}
		return s
	}
	// theme = the FILE a region lives in (files are themes, secondary info only).
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
	// inspect-panel data (single-click on a block): the untruncated responsibility, the
	// requirement the region implements, and the architectural decisions that name it.
	fullResp := func(id string) string {
		if model != nil {
			if lb := model.labelOf[id]; lb != "" {
				return lb
			}
		}
		return shortID(id)
	}
	reqOf := func(id string) string { return strings.Join(nodes[id].Implements, ", ") }
	elemDec := map[string]string{}
	if rev != nil {
		var arch []Node
		for _, n := range nodes {
			if n.Type == "adr" && n.Kind != "waiver" && decisionArchitectural(n) {
				arch = append(arch, n)
			}
		}
		sort.Slice(arch, func(i, j int) bool { return arch[i].ID < arch[j].ID })
		for _, id := range els {
			if !strings.Contains(id, "-") {
				continue // plain-word ids are indistinguishable from prose
			}
			var ds []string
			for _, n := range arch {
				if nameMatchToken(n.Statement, id) {
					ds = append(ds, n.ID)
				}
			}
			if len(ds) > 0 {
				elemDec[id] = strings.Join(ds, ", ")
			}
		}
	}
	// setInspect fills the single-click panel data. Only the standalone REVIEW render
	// (rev != nil) carries it; the book uses its own details pane (bookNodeDetail), so it
	// stays lean — no per-block responsibility/requirement/decision attributes.
	setInspect := func(bl *obusBlock, id string) {
		if bl == nil || rev == nil {
			return
		}
		bl.resp = fullResp(id)
		bl.req = reqOf(id)
		bl.dec = elemDec[id]
		if _, real := nodes[id]; !real {
			bl.newel = true
		}
	}
	var b strings.Builder
	cls := "onion"
	if in.sizeClass != "" {
		cls += " " + in.sizeClass
	}
	b.WriteString(`<div class="` + cls + `">` + "\n")
	fills := []string{"#eef3fa", "#dde8f5"}

	// --- level 0: the OVERVIEW only — concentric layer rings, one per layer, labelled name+count.
	// No element nodes here; input boxes ride the TOP and output boxes the BOTTOM (the committed
	// layout spec onion-io-layout.excalidraw.md, rule 1), and every arrow STOPS at the onion's
	// OUTSIDE (rule 2). Each ring drills into that layer's own flow view. ---
	{
		W := 520
		rMax, rMin := 120, 30
		// the bus stack sizes the canvas: every bar owns a FULL-WIDTH rail (the committed
		// layout spec onion-io-layout.excalidraw.md — one bus line per input, never a merged
		// rail), so the ring centre slides down as input rails stack above it
		ebw, ebh, egap := 84, 22, 6
		topH := 24
		if len(inputs) > 0 {
			topH = 20 + len(inputs)*(ebh+egap)
		}
		botH := 24
		if len(outputs) > 0 {
			botH = 20 + len(outputs)*(ebh+egap)
		}
		cx := W / 2
		cy := topH + 26 + rMax
		H := cy + rMax + 26 + botH
		n := ns
		radius := func(k int) int { // k=0 outermost..ns-1 innermost (the kernel disc)
			if n <= 1 {
				return rMax
			}
			return rMin + (rMax-rMin)*(n-1-k)/(n-1)
		}
		crumb := in.crumb
		if crumb == "" {
			crumb = brand() + " — layered overview"
		}
		b.WriteString(`<div class="oview" id="` + base + `0">` + "\n")
		b.WriteString(`<nav class="crumbs"><span>` + htmlEscape(crumb) + `</span></nav>` + "\n")
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
			label := fmt.Sprintf("%s · %d elements", s.name, len(s.flow)+len(s.infra))
			if layerMarked(s) {
				label += " · changed"
				// one clear dot ON the changed ring's band, at its 12-o'clock edge (always
				// on the circle, never the old cx+radius geometry that floated off-disc).
				b.WriteString(onionMarkDot(cx, cy-radius(si)+6))
			}
			b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" fill="#555" pointer-events="none">%s</text>`,
				cx, ly, htmlEscape(label)))
		}
		// the overview carries the SAME bus form as the band view: one full-width rail PER
		// input across the top with its box riding the rail's LEFT end, the mirrored
		// per-output rails below with each box at the RIGHT end; every rail sends its own
		// solid tap stopping at the onion's outside, and an annotated box opens its
		// interface note
		if len(inputs) > 0 {
			b.WriteString(fmt.Sprintf(`<text x="%d" y="12" text-anchor="middle" font-size="9" fill="#777">inputs</text>`, cx))
			for i, name := range inputs {
				ry := 29 + i*(ebh+egap)
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#2f8f4e" stroke-width="1.6"/>`, 12+ebw, ry, W-12, ry))
				pill := fmt.Sprintf(`<rect x="12" y="%d" width="%d" height="%d" rx="4" fill="#eef7f0" stroke="#2f8f4e"/><text x="%d" y="%d" text-anchor="middle">%s</text>`,
					ry-ebh/2, ebw, ebh, 12+ebw/2, ry+4, htmlEscape(name))
				if nl := in.ioLink[name]; nl != "" {
					pill = `<g data-node-link="` + htmlEscape(nl) + `" style="cursor:pointer">` + pill + `</g>`
				}
				b.WriteString(pill)
				tx := cx - (len(inputs)-1)*12 + i*24
				ex, ey := circleBorder(cx, cy, radius(0)+3, tx, ry)
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#2f8f4e" stroke-width="1.6" marker-end="url(#%sarr)"/>`, tx, ry, ex, ey, base))
			}
		}
		if len(outputs) > 0 {
			b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#777">outputs</text>`, cx, H-2))
			for i, name := range outputs {
				ry := H - 29 - i*(ebh+egap)
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b5651d" stroke-width="1.6"/>`, 12, ry, W-12-ebw, ry))
				pill := fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#fbf2ea" stroke="#b5651d"/><text x="%d" y="%d" text-anchor="middle">%s</text>`,
					W-12-ebw, ry-ebh/2, ebw, ebh, W-12-ebw/2, ry+4, htmlEscape(name))
				if nl := in.ioLink[name]; nl != "" {
					pill = `<g data-node-link="` + htmlEscape(nl) + `" style="cursor:pointer">` + pill + `</g>`
				}
				b.WriteString(pill)
				tx := cx - (len(outputs)-1)*12 + i*24
				sx, sy := circleBorder(cx, cy, radius(0)+3, tx, ry)
				b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b5651d" stroke-width="1.6" marker-end="url(#%sarr)"/>`, sx, sy, tx, ry, base))
			}
		}
		b.WriteString("</svg>\n</div>\n")
	}

	// --- level 1 (the BAND onion): per SURVIVING band, a ROUND onion — the band's INPUT bars
	// across the top, OUTPUT bars across the bottom, its BLOCKS in the middle, and a central
	// CORE (the inner bands; the kernel band is round but coreless).
	// Flow conservation (owner): a bar is an edge crossing to an OUTER band; an edge crossing to
	// an INNER band routes to the CORE; an edge whose two ends are both in the band draws as a
	// direct sibling arrow. Breadcrumbs navigate up; every view is pre-baked static SVG. ---
	for si, s := range survivors {
		L := s.name
		isKernel := si == ns-1

		// adjacent surviving layers for the breadcrumb ▲/▼ nav labels
		outerName := "overview"
		if si > 0 {
			outerName = survivors[si-1].name
		}
		innerName := ""
		if !isKernel {
			innerName = survivors[si+1].name
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
		// The layer's BLOCKS. Model mode clusters by THEME (50+ flat
		// region blocks do not render): a file with several regions in this layer is ONE
		// cluster block that drills into a level-2 view; a single-region theme renders the
		// region itself. nodeOf maps every flow region to its level-1 block.
		nodeOf := map[string]string{}
		type clusterView struct {
			view, title string
			ids         []string
		}
		var clusters []clusterView
		var blocks []*obusBlock
		blockOf := map[string]*obusBlock{}
		addBlock := func(id, label, sub string, cluster bool, drill, link, full string) {
			bl := &obusBlock{id: id, label: label, sub: sub, cluster: cluster, drill: drill, link: link, full: full, marked: isMarked(id)}
			blocks = append(blocks, bl)
			blockOf[id] = bl
		}
		if model != nil && !in.themes {
			// the graph binding: no file themes exist — the band holds its blocks
			// directly, each element one block, the id as the subtitle.
			for _, id := range s.flow {
				nodeOf[id] = id
				link := ""
				if in.links {
					link = id
				}
				full := id
				if lb := model.labelOf[id]; lb != "" {
					full = id + " — " + lb
				}
				addBlock(id, respLabel(id), shortID(id), false, "", link, full)
				setInspect(blockOf[id], id)
			}
		} else if model != nil {
			// DSM grouping (go-onion-dsm-groups): coupling clusters are the grouping
			// source; a file stays secondary info on a single block, never a group.
			groups, singles := dsmGroups(s.flow, consumes)
			for gi, g := range groups {
				cv := viewID(si) + "c" + itoa(gi)
				lbl := "module " + itoa(gi+1)
				for _, id := range g {
					nodeOf[id] = "cl:" + cv
				}
				addBlock("cl:"+cv, lbl, itoa(len(g))+" regions", true, cv, "",
					lbl+" — "+itoa(len(g))+" regions in "+L+": "+strings.Join(g, ", "))
				blockOf["cl:"+cv].marked = anyMarked(g) // a cluster carries a marked member's mark
				clusters = append(clusters, clusterView{view: cv, title: lbl, ids: g})
			}
			for _, id := range singles {
				nodeOf[id] = id
				full := id
				if lb := model.labelOf[id]; lb != "" {
					full = id + " — " + lb
				}
				addBlock(id, respLabel(id), "in "+theme(id), false, "", id, full)
				setInspect(blockOf[id], id)
			}
		} else {
			for _, id := range s.flow {
				nodeOf[id] = id
				addBlock(id, shortID(id), "", false, "", id, id)
				setInspect(blockOf[id], id)
			}
		}
		var readers, writers []string
		for _, id := range s.flow {
			if reads[id] {
				readers = append(readers, id)
			}
			if writes[id] {
				writers = append(writers, id)
			}
		}
		// Bus bars by FLOW CONSERVATION (owner): a bar is an edge crossing the layer
		// boundary. An edge x→y with y inside L and x outside = an INPUT bar keyed by x's
		// layer (or the external world for os reads); an edge y→z with y inside and z
		// outside = an OUTPUT bar keyed by z's layer (or the external world for os writes).
		// Global external inputs/outputs sit first; cross-layer bars follow in ring order.
		// tapIn/tapOut record which block taps each bar, so drilling a block carries the
		// SAME bars down (conservation).
		var inBars, outBars []string
		inTap := map[string][]string{}
		outTap := map[string][]string{}
		pushIn := func(label, block string) {
			if _, ok := inTap[label]; !ok {
				inBars = append(inBars, label)
			}
			inTap[label] = appendUniqStr(inTap[label], block)
		}
		pushOut := func(label, block string) {
			if _, ok := outTap[label]; !ok {
				outBars = append(outBars, label)
			}
			outTap[label] = appendUniqStr(outTap[label], block)
		}
		layerSort := func(name string) int {
			if p, ok := svPos[name]; ok {
				return p
			}
			return 1 << 20
		}
		// external world: os reads feed every reader, os writes leave every writer
		for _, in := range inputs {
			for _, r := range readers {
				pushIn(in, nodeOf[r])
			}
		}
		for _, out := range outputs {
			for _, w := range writers {
				pushOut(out, nodeOf[w])
			}
		}
		// cross-layer INPUT bars: edges from outside INTO this layer, keyed by source layer
		type xbar struct {
			key, block string
			sort       int
		}
		// isInner: a survivor band deeper than L (higher survivor index). Its edges route
		// through the CORE, not a bus bar — the core IS the inner bands (owner's onion model).
		isInner := func(name string) bool { p, ok := svPos[name]; return ok && p > si }
		// withPayload: an authored model names its signals — the bar carries the payload
		// beside the band key (the engine binding has no payloads; keys stay band-only).
		withPayload := func(key, src, dst string) string {
			if in.payload != nil {
				if p := in.payload[[2]string{src, dst}]; p != "" {
					return key + ": " + p
				}
			}
			return key
		}
		var xin []xbar
		for _, oa := range els {
			if layerOf[oa] == L {
				continue // an internal source is a sibling arrow, not a bar
			}
			if layerOf[oa] == "ambient" {
				continue // ambient is off-flow: infra pills only, never a bar (owner rule)
			}
			for _, bb := range consumes[oa] {
				if layerOf[bb] != L {
					continue
				}
				if _, ok := nodeOf[bb]; !ok {
					continue // the target is a pill, not a block
				}
				if isInner(layerOf[oa]) {
					if bl := blockOf[nodeOf[bb]]; bl != nil {
						bl.fromCore = true // signal FROM the core
					}
					continue
				}
				xin = append(xin, xbar{key: withPayload("from "+layerOf[oa], oa, bb), block: nodeOf[bb], sort: layerSort(layerOf[oa])})
			}
		}
		sort.Slice(xin, func(i, j int) bool {
			if xin[i].sort != xin[j].sort {
				return xin[i].sort < xin[j].sort
			}
			if xin[i].key != xin[j].key {
				return xin[i].key < xin[j].key
			}
			return xin[i].block < xin[j].block
		})
		for _, x := range xin {
			pushIn(x.key, x.block)
		}
		// cross-layer OUTPUT bars: edges from this layer OUT to another layer
		var xout []xbar
		for _, a := range s.flow {
			for _, bb := range consumes[a] {
				if layerOf[bb] == L {
					continue // internal = sibling arrow
				}
				if layerOf[bb] == "ambient" {
					continue // ambient is off-flow: infra pills only, never a bar (owner rule)
				}
				if isInner(layerOf[bb]) {
					if bl := blockOf[nodeOf[a]]; bl != nil {
						bl.toCore = true // signal TO the core
					}
					continue
				}
				xout = append(xout, xbar{key: withPayload("→ "+layerOf[bb], a, bb), block: nodeOf[a], sort: layerSort(layerOf[bb])})
			}
		}
		sort.Slice(xout, func(i, j int) bool {
			if xout[i].sort != xout[j].sort {
				return xout[i].sort < xout[j].sort
			}
			if xout[i].key != xout[j].key {
				return xout[i].key < xout[j].key
			}
			return xout[i].block < xout[j].block
		})
		for _, x := range xout {
			pushOut(x.key, x.block)
		}
		// apply the taps now that the bar order is final
		for k, label := range inBars {
			for _, blk := range inTap[label] {
				if bl := blockOf[blk]; bl != nil {
					bl.tapIn(k)
				}
			}
		}
		for j, label := range outBars {
			for _, blk := range outTap[label] {
				if bl := blockOf[blk]; bl != nil {
					bl.tapOut(j)
				}
			}
		}
		// intra-layer calls, aggregated to the BLOCK level: a cluster's internal region
		// arrows vanish here (level 2 shows them); parallel region arrows between two
		// blocks collapse onto one counted edge.
		ecount := map[[2]string]int{}
		epay := map[[2]string]string{}
		var eorder [][2]string
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
				k := [2]string{nodeOf[a], tn}
				if ecount[k] == 0 {
					eorder = append(eorder, k)
					if in.payload != nil {
						epay[k] = in.payload[[2]string{a, bb}]
					}
				}
				ecount[k]++
			}
		}
		var edges []obusEdge
		for _, k := range eorder {
			lb := ""
			if ecount[k] > 1 {
				lb = "×" + itoa(ecount[k])
			}
			// an authored sibling arrow carries its payload name (the model's signal)
			if p := epay[k]; p != "" {
				lb = p
				if ecount[k] > 1 {
					lb = p + " ×" + itoa(ecount[k])
				}
			}
			edges = append(edges, obusEdge{s: k[0], t: k[1], label: lb})
		}
		// the layer is an ONION (round, with a core); the kernel is the one coreless onion.
		// coreMarked badges the core when any deeper band changed, so the reviewer sees where
		// to drill next.
		lopts := obusOpts{round: true}
		if !isKernel {
			lopts.hasCore = true
			lopts.coreName = survivors[si+1].name
			lopts.coreDrill = viewID(si + 1)
			for k := si + 1; k < ns; k++ {
				if layerMarked(survivors[k]) {
					lopts.coreMarked = true
					break
				}
			}
		}
		b.WriteString(`<div class="onion-flow">` +
			onionViewSVG(L+" layer", L+" layer", viewID(si), inBars, outBars, blocks, edges, layerMarked(s), lopts) +
			`</div>` + "\n")
		// off-flow design elements (own + pushed down from skipped outer layers, plus
		// model-mode ambient on the innermost view): infrastructure pills
		// design: go-onion-boilerplate  implements: req-onion-boilerplate
		// An ambient-stamped element is BOILERPLATE: its pill carries data-oc-amb, and a
		// hide control folds every stamped pill render-side (the fold-amb CSS class the
		// shared script toggles). The DOM keeps the pills, so the model stays complete.
		if len(s.infra) > 0 {
			amb := 0
			for _, id := range s.infra {
				if layerOf[id] == "ambient" {
					amb++
				}
			}
			b.WriteString(`<div class="onion-infra"><span class="il">infrastructure:</span>`)
			if amb > 0 {
				b.WriteString(`<button type="button" data-oc-fold="1" data-oc-hide="hide boilerplate" data-oc-show="show boilerplate (` + itoa(amb) + `)">hide boilerplate</button>`)
			}
			for _, id := range s.infra {
				ambAttr := ""
				if layerOf[id] == "ambient" {
					ambAttr = ` data-oc-amb="1"`
				}
				dot := ""
				if isMarked(id) {
					dot = `<span style="color:` + onionMarkColor + `">● </span>`
				}
				if model != nil {
					// responsibility text on the pill; id + theme in the title (full text)
					title := id + " — " + model.labelOf[id]
					if in.themes {
						title += " (in " + theme(id) + ")"
					}
					link := ""
					if in.links {
						link = ` data-node-link="` + htmlEscape(id) + `"`
					}
					b.WriteString(`<button type="button"` + link + ambAttr + ` title="` + htmlEscape(title) + `">` + dot + htmlEscape(respLabel(id)) + `</button>`)
					continue
				}
				b.WriteString(`<button type="button" data-node-link="` + htmlEscape(id) + `"` + ambAttr + `>` + dot + htmlEscape(shortID(id)) + `</button>`)
			}
			b.WriteString(`</div>`)
		}
		// enddesign
		b.WriteString("</div>\n")

		// --- level 2 and deeper: a coupling cluster opens into its interior — the
		// recursive DSM group emitter (go-onion-dsm-groups). Conservation carries the
		// cluster's band-level I/O down as identified lanes; a member may itself be a
		// cluster; every depth keeps the bus-only, coreless boundary. ---
		if len(clusters) > 0 {
			// crossName: the display name a crossing edge points at — a SIBLING block in
			// this layer (its level-1 label) or, off-layer, the layer name.
			crossName := func(other string) string {
				if layerOf[other] == L {
					if bn := nodeOf[other]; bn != "" {
						if bb := blockOf[bn]; bb != nil {
							return bb.label
						}
						return bn
					}
				}
				return layerOf[other]
			}
			ctx := ogCtx{
				consumes: consumes, reads: reads, writes: writes,
				diskReads: in.diskReads, diskWrites: in.diskWrites,
				inputs: inputs, outputs: outputs, els: els, layerOf: layerOf,
				L: L, base: base + "0", layerView: viewID(si), layerName: L,
				crossName: crossName, layerSort: layerSort,
				label: respLabel,
				sub:   func(id string) string { return "in " + theme(id) },
				full: func(id string) string {
					if model != nil {
						if lb := model.labelOf[id]; lb != "" {
							return id + " — " + lb
						}
					}
					return id
				},
				link: in.links, isMarked: isMarked, inspect: setInspect,
			}
			for _, cl := range clusters {
				ctx.emit(&b, cl.view, cl.title, cl.ids,
					[][2]string{{base + "0", "overview"}, {viewID(si), L}})
			}
		}
	}
	b.WriteString("</div>\n")
	return b.String()
}

// enddesign

// design: go-onion-dsm-groups  implements: req-onion-clusters
// Coupling clusters are the ONE grouping source of the onion's interiors (the owner's
// cluster rules, req-onion-clusters). File themes retired as the source; a file stays
// secondary info on a single block. dsmGroups splits a member set by its INTERNAL call
// graph through the deterministic DSM pipeline (go-dsm-cluster). A cluster of two or
// more members becomes ONE enterable block, and every other member keeps its own block.
// The recursive emitter renders a cluster's interior as a coreless bus-bar box: top
// input bus, bottom output bus, identified lanes carrying the group's outer I/O by flow
// conservation. It re-derives grouping INSIDE each cluster, so a member may itself be a
// cluster at every depth (rule 7). A member's talk with the core rides the group's
// output lane. The core wiring stays on the band level (rule 4).
func dsmGroups(ids []string, consumes map[string][]string) ([][]string, []string) {
	inSet := make(map[string]bool, len(ids))
	for _, id := range ids {
		inSet[id] = true
	}
	sub := map[string][]string{}
	for _, a := range ids {
		for _, bb := range consumes[a] {
			if inSet[bb] && bb != a {
				sub[a] = append(sub[a], bb)
			}
		}
	}
	res := dsmAnalyze(sub)
	var groups [][]string
	grouped := map[string]bool{}
	for _, cl := range res.Clusters {
		if len(cl) >= 2 {
			g := append([]string{}, cl...)
			sortStrings(g)
			groups = append(groups, g)
			for _, id := range g {
				grouped[id] = true
			}
		}
	}
	var singles []string
	for _, id := range ids {
		if !grouped[id] {
			singles = append(singles, id)
		}
	}
	sortStrings(singles)
	if len(groups) == 1 && len(groups[0]) == len(ids) {
		all := append([]string{}, ids...)
		sortStrings(all)
		return nil, all // the analysis keeps the set whole: no split, flat members
	}
	return groups, singles
}

// ogCtx carries the band context the recursive DSM group emitter needs.
type ogCtx struct {
	consumes              map[string][]string
	reads, writes         map[string]bool
	diskReads, diskWrites map[string]bool
	inputs, outputs       []string
	els                   []string
	layerOf               map[string]string
	L                     string
	base                  string // the overview view id (the crumb root)
	layerView             string // the band's own view id (the ▲ up-nav)
	layerName             string
	crossName             func(string) string
	layerSort             func(string) int
	label                 func(string) string
	sub                   func(string) string
	full                  func(string) string
	link                  bool
	isMarked              func(string) bool
	inspect               func(*obusBlock, string)
}

// emit renders one cluster group's interior view, then recurses into its sub-groups.
// Every depth keeps the bus-only boundary: a coreless box, lanes named by source/target.
func (c ogCtx) emit(b *strings.Builder, view, title string, ids []string, trail [][2]string) {
	inSet := make(map[string]bool, len(ids))
	for _, id := range ids {
		inSet[id] = true
	}
	groups, singles := dsmGroups(ids, c.consumes)
	memberBlock := map[string]string{} // member -> the block carrying it in THIS view
	type child struct {
		view, title string
		ids         []string
	}
	var children []child
	var blocks []*obusBlock
	blockOf := map[string]*obusBlock{}
	for k, g := range groups {
		cv := view + "c" + itoa(k)
		lbl := "module " + itoa(k+1)
		bl := &obusBlock{id: "cl:" + cv, label: lbl, sub: itoa(len(g)) + " regions",
			cluster: true, drill: cv, full: lbl + " — " + strings.Join(g, ", ")}
		for _, id := range g {
			memberBlock[id] = bl.id
			if c.isMarked(id) {
				bl.marked = true
			}
		}
		blocks = append(blocks, bl)
		blockOf[bl.id] = bl
		children = append(children, child{cv, lbl, g})
	}
	for _, id := range singles {
		bl := &obusBlock{id: id, label: c.label(id), sub: c.sub(id), full: c.full(id), marked: c.isMarked(id)}
		if c.link {
			bl.link = id
		}
		c.inspect(bl, id)
		memberBlock[id] = id
		blocks = append(blocks, bl)
		blockOf[id] = bl
	}
	// bars by flow conservation over the whole member set: an outside edge becomes an
	// identified lane (rule 5); an inside edge stays a sibling arrow at block level.
	var inBars, outBars []string
	inTap := map[string][]string{}
	outTap := map[string][]string{}
	pushIn := func(label, blk string) {
		if _, ok := inTap[label]; !ok {
			inBars = append(inBars, label)
		}
		inTap[label] = appendUniqStr(inTap[label], blk)
	}
	pushOut := func(label, blk string) {
		if _, ok := outTap[label]; !ok {
			outBars = append(outBars, label)
		}
		outTap[label] = appendUniqStr(outTap[label], blk)
	}
	for _, id := range ids {
		// per-bus tap decision (go-io-busbar): the disk bus belongs to disk-touching
		// blocks alone; every other bus keeps the union flag
		for _, in := range c.inputs {
			if busTapsIn(in, c.reads[id], c.diskReads[id]) {
				pushIn(in, memberBlock[id])
			}
		}
		for _, out := range c.outputs {
			if busTapsOut(out, c.writes[id], c.diskWrites[id]) {
				pushOut(out, memberBlock[id])
			}
		}
	}
	type xb struct {
		key, block string
		sort       int
	}
	ec := map[[2]string]int{}
	var eo [][2]string
	var xi, xo []xb
	for _, a := range ids {
		for _, bb := range c.consumes[a] {
			if inSet[bb] {
				sa, tb := memberBlock[a], memberBlock[bb]
				if sa == tb {
					continue
				}
				k := [2]string{sa, tb}
				if ec[k] == 0 {
					eo = append(eo, k)
				}
				ec[k]++
				continue
			}
			if c.layerOf[bb] == "ambient" {
				continue // ambient is off-flow: infra pills only, never a lane (owner rule)
			}
			xo = append(xo, xb{key: "→ " + c.crossName(bb), block: memberBlock[a], sort: c.layerSort(c.layerOf[bb])})
		}
	}
	for _, oa := range c.els {
		if inSet[oa] || c.layerOf[oa] == "ambient" {
			continue
		}
		for _, bb := range c.consumes[oa] {
			if !inSet[bb] {
				continue
			}
			xi = append(xi, xb{key: "from " + c.crossName(oa), block: memberBlock[bb], sort: c.layerSort(c.layerOf[oa])})
		}
	}
	sortXb := func(v []xb) {
		sort.Slice(v, func(i, j int) bool {
			if v[i].sort != v[j].sort {
				return v[i].sort < v[j].sort
			}
			if v[i].key != v[j].key {
				return v[i].key < v[j].key
			}
			return v[i].block < v[j].block
		})
	}
	sortXb(xi)
	sortXb(xo)
	for _, x := range xi {
		pushIn(x.key, x.block)
	}
	for _, x := range xo {
		pushOut(x.key, x.block)
	}
	for k, label := range inBars {
		for _, blk := range inTap[label] {
			if bl := blockOf[blk]; bl != nil {
				bl.tapIn(k)
			}
		}
	}
	for j, label := range outBars {
		for _, blk := range outTap[label] {
			if bl := blockOf[blk]; bl != nil {
				bl.tapOut(j)
			}
		}
	}
	var edges []obusEdge
	for _, k := range eo {
		lb := ""
		if ec[k] > 1 {
			lb = "×" + itoa(ec[k])
		}
		edges = append(edges, obusEdge{s: k[0], t: k[1], label: lb})
	}
	anyM := false
	for _, id := range ids {
		if c.isMarked(id) {
			anyM = true
			break
		}
	}
	b.WriteString(`<div class="oview" id="` + view + `" hidden>` + "\n")
	b.WriteString(`<nav class="crumbs">`)
	for i, t := range trail {
		if i > 0 {
			b.WriteString(" ▸ ")
		}
		b.WriteString(`<button type="button" data-onion-go="` + t[0] + `">` + htmlEscape(t[1]) + `</button>`)
	}
	b.WriteString(` ▸ <span>` + htmlEscape(title) + `</span></nav>` + "\n")
	up := trail[len(trail)-1]
	b.WriteString(`<nav class="crumbs"><button type="button" data-onion-go="` + up[0] + `">▲ ` + htmlEscape(up[1]) + `</button></nav>` + "\n")
	b.WriteString(`<div class="onion-flow">` +
		onionViewSVG(title+" in "+c.layerName, title+" in "+c.layerName, view, inBars, outBars, blocks, edges, anyM, obusOpts{}) +
		`</div>` + "\n")
	b.WriteString("</div>\n")
	for _, ch := range children {
		c.emit(b, ch.view, ch.title, ch.ids, append(append([][2]string{}, trail...), [2]string{view, title}))
	}
}

// enddesign

// design: go-onion-busbar  implements: req-interactive-figures.2, req-onion-io-rendering
// The drill-view SVG uses ONE deterministic layout to render both drill shapes (the owner's ONION vs CLUSTER distinction). A BAND/LAYER is an ONION. opts.round draws a ROUND body, and unless it is the innermost KERNEL it carries a CORE, a central circle standing for the layers beneath. Signals go TO the core when a block calls inward, FROM the core when an inner layer calls a block, or across it. The core is the DRILL affordance into the next-inner band. A single-click ENTERS it; drilling is its only action. The kernel onion is round with buses but coreless. A core arrow aims at the core CENTRE and clips to its circular border, so it reads as pointing radially inward. A CLUSTER, a theme or a grouping INSIDE a band, is NOT an onion: a coreless bus-bar BOX, with no round body and no centre. Either way, inputs enter on the TOP and outputs leave on the BOTTOM (the committed layout spec onion-io-layout.excalidraw.md, rule 1). A round band stacks its BLOCKS beside the centred core by the SIDE rule: to-core LEFT, from-core RIGHT, pass-through balanced against crowding. A cluster lays them in a centred grid. Bars carry flow conservation. An input bar is an edge that ENTERS this view from outside a BAND boundary. An output bar LEAVES it. An edge whose two ends are both inside draws as a direct block-to-block SIBLING arrow, never detouring through a bar. In the layer onion an edge crossing to an INNER band routes to the CORE instead of a bar. Each bus is ONE horizontal rail OUTSIDE the body. Its pills sit at the vertical extreme and join the rail with a plain connector; an arrowhead never lands on a pill. A pill is CLICKABLE: a click traces every block the bus signal reaches. A tapping block gets ONE flow arrow between it and the rail. A drillable CLUSTER block hangs a small drill HANDLE off its own bottom edge, never a centre circle, since only a band has a core. Generated SVG keeps the book byte-stable with real, machine-readable text; a canvas library needed live scripts and rendered nothing on paper. Each block group carries a stable id, which the comment layer anchors to. It also carries a <title> with the full untruncated text, its connection ids for the inspect highlight, and either the drill target (clusters) or the trace link (regions).

type obusBlock struct {
	id, label, sub, full string
	cluster              bool
	marked               bool
	newel                bool // review mode: a planned (not-yet-realized) element = NEW
	toCore, fromCore     bool // layer onion: this block sends to / receives from the CORE (the inner layers)
	drill, link          string
	resp, req, dec       string // inspect-panel data: responsibility, implemented req, informing decisions
	ins, outs            []int
	x, y, w, h           int
	lines                []string
}

func (bl *obusBlock) tapIn(k int) {
	for _, x := range bl.ins {
		if x == k {
			return
		}
	}
	bl.ins = append(bl.ins, k)
}

func (bl *obusBlock) tapOut(j int) {
	for _, x := range bl.outs {
		if x == j {
			return
		}
	}
	bl.outs = append(bl.outs, j)
}

type obusEdge struct{ s, t, label string }

// obusOpts selects the drill SHAPE (owner's ONION vs CLUSTER split). The zero value is a
// coreless CLUSTER box (a theme grouping inside a band). round draws the ROUND band/layer
// onion; hasCore adds the central CORE that drills into the next-inner band (the kernel
// onion is round but coreless).
type obusOpts struct {
	round      bool
	hasCore    bool
	coreName   string // the inner band the core represents and drills into
	coreDrill  string // the view id the core enters on double-click
	coreMarked bool   // an inner band changed — badge the core
}

// design: go-onion-change-marks  implements: req-diagram-review-render
// This is the review render's change-mark and its upward propagation. onionReview carries the marked element set. renderOnionOpt propagates it up the drill-down: a marked element marks its grouping block, and a marked block marks its ring. It draws an unmistakable orange DOT at EVERY level; dots, never dashes, is the owner's rule. So the overview shows WHICH rings changed. Each grouping view narrows to the changed block, then the element. The mark travels up toward the reader.
const onionMarkColor = "#e8590c"

type onionReview struct{ marked map[string]bool }

// onionMarkDot is the badge glyph: a filled dot carrying an accessible title.
func onionMarkDot(cx, cy int) string {
	return fmt.Sprintf(`<circle cx="%d" cy="%d" r="5" fill="%s" stroke="#fff" stroke-width="1.3"><title>changed</title></circle>`, cx, cy, onionMarkColor)
}

func appendUniqStr(s []string, v string) []string {
	for _, x := range s {
		if x == v {
			return s
		}
	}
	return append(s, v)
}

// enddesign

// owrap greedily wraps s into at most maxLines lines of width runes; the last line
// truncates with an ellipsis when the text does not fit.
func owrap(s string, width, maxLines int) []string {
	var lines []string
	cur := ""
	for _, w := range strings.Fields(s) {
		cand := w
		if cur != "" {
			cand = cur + " " + w
		}
		if len([]rune(cand)) <= width {
			cur = cand
			continue
		}
		if cur != "" {
			lines = append(lines, cur)
		}
		cur = w
		for len([]rune(cur)) > width {
			r := []rune(cur)
			lines = append(lines, string(r[:width]))
			cur = string(r[width:])
		}
	}
	if cur != "" {
		lines = append(lines, cur)
	}
	if len(lines) == 0 {
		lines = []string{""}
	}
	if len(lines) > maxLines {
		r := []rune(lines[maxLines-1])
		if len(r) > width-1 {
			r = r[:width-1]
		}
		lines = append(lines[:maxLines-1], string(r)+"…")
	}
	return lines
}

func onionViewSVG(aria, title, vid string, inBars, outBars []string, blocks []*obusBlock, edges []obusEdge, titleMarked bool, opts obusOpts) string {
	const (
		pad     = 14
		barH    = 24
		blockW  = 170
		colGap  = 28
		rowGap  = 26
		ringGap = 26
		busGap  = 46
		coreRad = 48
		maxCols = 4
	)
	// block sizes from the wrapped label plus an optional subtitle line
	for _, bl := range blocks {
		bl.lines = owrap(bl.label, 26, 2)
		n := len(bl.lines)
		if bl.sub != "" {
			n++
		}
		bl.w, bl.h = blockW, 20+12*n
	}
	// pill width fits the widest bar label, capped
	barW := 92
	for _, s := range append(append([]string{}, inBars...), outBars...) {
		if w := 22 + 6*len([]rune(s)); w > barW {
			barW = w
		}
	}
	if barW > 210 {
		barW = 210
	}
	N := len(blocks)
	coreR := 0
	if opts.hasCore {
		coreR = coreRad
	}
	// --- block placement, centred on the origin (0,0) ---
	// A round BAND (or the coreless KERNEL) is an onion with the core dead centre. Its blocks
	// obey the SIDE rule (the committed layout spec onion-io-layout.excalidraw.md, rules 3/4/6):
	// a block whose output goes INTO the core stacks on the LEFT, a block receiving its input
	// FROM the core stacks on the RIGHT, and a pass-through block joins the emptier side. A
	// coreless CLUSTER stays a centred grid box.
	var contentL, contentR, contentT, contentB, discR int
	if opts.round {
		var left, right []*obusBlock
		for _, bl := range blocks {
			switch {
			case bl.toCore: // a both-ways block sits left: the output rule names the side first
				left = append(left, bl)
			case bl.fromCore:
				right = append(right, bl)
			}
		}
		for _, bl := range blocks {
			if bl.toCore || bl.fromCore {
				continue
			}
			if len(left) <= len(right) {
				left = append(left, bl)
			} else {
				right = append(right, bl)
			}
		}
		sideX := coreR + 46 + blockW/2
		stack := func(col []*obusBlock, cx int) {
			total := 0
			for i, bl := range col {
				if i > 0 {
					total += rowGap
				}
				total += bl.h
			}
			y := -total / 2
			for _, bl := range col {
				bl.x, bl.y = cx-bl.w/2, y
				y += bl.h + rowGap
			}
		}
		stack(left, -sideX)
		stack(right, sideX)
		// the disc is a TRUE CIRCLE (never an ellipse — owner hard rule) enclosing every block
		// corner and the core; one radius, concentric with its inner echo.
		discR = coreR + 22
		for _, bl := range blocks {
			for _, x4 := range []int{bl.x, bl.x + bl.w} {
				for _, y4 := range []int{bl.y, bl.y + bl.h} {
					if d := int(math.Hypot(float64(x4), float64(y4))) + 14; d > discR {
						discR = d
					}
				}
			}
		}
		contentL, contentR, contentT, contentB = -discR, discR, -discR, discR
	} else {
		cols := maxCols
		if N < cols {
			cols = N
		}
		if cols < 1 {
			cols = 1
		}
		var rows [][]*obusBlock
		for i := 0; i < N; i += cols {
			j := i + cols
			if j > N {
				j = N
			}
			rows = append(rows, blocks[i:j])
		}
		gridW := cols*blockW + (cols-1)*colGap
		rowH := make([]int, len(rows))
		gridH := 0
		for ri, r := range rows {
			h := 0
			for _, bl := range r {
				if bl.h > h {
					h = bl.h
				}
			}
			rowH[ri] = h
			if ri > 0 {
				gridH += rowGap
			}
			gridH += h
		}
		if gridH == 0 {
			gridH = 40
		}
		y := -gridH / 2
		for ri, r := range rows {
			rw := len(r)*blockW + (len(r)-1)*colGap
			x := -rw / 2
			for _, bl := range r {
				bl.x, bl.y = x, y+(rowH[ri]-bl.h)/2
				x += blockW + colGap
			}
			y += rowH[ri] + rowGap
		}
		contentL, contentR, contentT, contentB = -gridW/2, gridW/2, -gridH/2, gridH/2
	}
	bcx := func(bl *obusBlock) int { return bl.x + bl.w/2 }
	bcy := func(bl *obusBlock) int { return bl.y + bl.h/2 }

	// --- bus rails + boxes OUTSIDE the body: ONE full-width horizontal rail PER input bar,
	// stacked across the TOP with each bar's box riding its rail's LEFT end; the output bars
	// mirror across the BOTTOM, each box riding its rail's RIGHT end (the committed layout
	// spec onion-io-layout.excalidraw.md — every bus is its own line, never a merged rail,
	// and every layer renders the same). No arrowhead ever lands on or leaves a box. ---
	Kin, Kout := len(inBars), len(outBars)
	railStep := barH + 8
	railL, railR := contentL-8, contentR+8
	inRailY := func(k int) int { return contentT - busGap - (Kin-1-k)*railStep }
	outRailY := func(k int) int { return contentB + busGap + (Kout-1-k)*railStep }
	clampIn := func(x int) int {
		if x < railL+barW+10 {
			return railL + barW + 10
		}
		if x > railR-10 {
			return railR - 10
		}
		return x
	}
	clampOut := func(x int) int {
		if x < railL+10 {
			return railL + 10
		}
		if x > railR-barW-10 {
			return railR - barW - 10
		}
		return x
	}

	// viewBox bounds over everything drawn
	minX, maxX := railL-pad, railR+pad
	top := contentT
	if Kin > 0 {
		top = inRailY(0) - barH/2
	}
	titleY := top - 14
	minY := titleY - 12
	maxY := contentB + pad
	if Kout > 0 {
		maxY = outRailY(0) + barH/2 + pad
	}

	slug := func(s string) string {
		t := strings.Trim(figSlugRe.ReplaceAllString(strings.ToLower(s), "-"), "-")
		if len(t) > 24 {
			t = t[:24]
		}
		return t
	}
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf(`<svg viewBox="%d %d %d %d" font-family="system-ui" font-size="10" role="img" aria-label="%s">`, minX, minY, maxX-minX, maxY-minY, htmlEscape(aria)))
	mark := func(id, color string) string {
		return `<marker id="` + id + `" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="` + color + `"/></marker>`
	}
	sb.WriteString(`<defs>` + mark(vid+"mi", "#2f8f4e") + mark(vid+"mo", "#b5651d") + mark(vid+"mu", "#9db6e0") + `</defs>`)

	// the ROUND band body: a TRUE CIRCLE behind the content with a concentric inner echo. A
	// cluster (opts.round == false) is a plain coreless box, so it draws none.
	if opts.round {
		sb.WriteString(fmt.Sprintf(`<circle cx="0" cy="0" r="%d" fill="#eef3fa" stroke="#4a6fa5" stroke-width="1.4"/>`, discR))
		sb.WriteString(fmt.Sprintf(`<circle cx="0" cy="0" r="%d" fill="none" stroke="#c4d4ea"/>`, discR*82/100))
	}
	// title naming the grouping; a change DOT rides up here
	tt := title
	if titleMarked {
		tt += " · changed"
	}
	sb.WriteString(fmt.Sprintf(`<text x="0" y="%d" text-anchor="middle" font-weight="bold" fill="#33475e" pointer-events="none">%s</text>`, titleY, htmlEscape(tt)))
	if titleMarked {
		sb.WriteString(onionMarkDot(len([]rune(tt))*3+9, titleY-4))
	}

	// per-bar rails: every bar draws its OWN rail with its box riding the end; a box is
	// CLICKABLE — a click traces every block the bus signal reaches (data-oc-blocks).
	pillTargets := func(k int, out bool) []string {
		var tgt []string
		for _, bl := range blocks {
			list := bl.ins
			if out {
				list = bl.outs
			}
			for _, kk := range list {
				if kk == k {
					tgt = appendUniqStr(tgt, bl.id)
					break
				}
			}
		}
		return tgt
	}
	if Kin > 0 {
		for k, lb := range inBars {
			ry := inRailY(k)
			sb.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#2f8f4e" stroke-width="1.6"/>`, railL+barW, ry, railR, ry))
			sb.WriteString(fmt.Sprintf(`<g class="opill" data-oc-pill="in" data-oc-blocks="%s"><title>%s — input bus (click to trace its targets)</title>`, htmlEscape(strings.Join(pillTargets(k, false), ",")), htmlEscape(lb)))
			sb.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#eef7f0" stroke="#2f8f4e"/><text x="%d" y="%d" text-anchor="middle" pointer-events="none">%s</text></g>`,
				railL, ry-barH/2, barW, barH, railL+barW/2, ry+4, htmlEscape(lb)))
		}
	}
	// output rails (bottom): the mirror — each rail runs INTO its box at the right end.
	if Kout > 0 {
		for k, lb := range outBars {
			ry := outRailY(k)
			sb.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b5651d" stroke-width="1.6"/>`, railL, ry, railR-barW, ry))
			sb.WriteString(fmt.Sprintf(`<g class="opill" data-oc-pill="out" data-oc-blocks="%s"><title>%s — output bus (click to trace its sources)</title>`, htmlEscape(strings.Join(pillTargets(k, true), ",")), htmlEscape(lb)))
			sb.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#fbf2ea" stroke="#b5651d"/><text x="%d" y="%d" text-anchor="middle" pointer-events="none">%s</text></g>`,
				railR-barW, ry-barH/2, barW, barH, railR-barW/2, ry+4, htmlEscape(lb)))
		}
	}
	// block taps: ONE flow arrow between EACH consumed rail and the tapping block. The input
	// arrow points INTO the block (inflow); the output arrow terminates ON its rail (outflow).
	// Either way the arrowhead is on a rail or a block — never on a box.
	for _, bl := range blocks {
		for _, k := range bl.ins {
			if k < 0 || k >= Kin {
				continue
			}
			ry := inRailY(k)
			bx := clampIn(bcx(bl))
			ex, ey := rectBorder(bcx(bl), bcy(bl), bl.w/2, bl.h/2, float64(bx-bcx(bl)), float64(ry-bcy(bl)))
			sb.WriteString(fmt.Sprintf(`<line data-oc-block="%s" data-oc-flow="in" x1="%d" y1="%d" x2="%d" y2="%d" stroke="#2f8f4e" stroke-width="1.2" marker-end="url(#%smi)"/>`,
				htmlEscape(bl.id), bx, ry, ex, ey, vid))
		}
		for _, k := range bl.outs {
			if k < 0 || k >= Kout {
				continue
			}
			ry := outRailY(k)
			bx := clampOut(bcx(bl))
			sx, sy := rectBorder(bcx(bl), bcy(bl), bl.w/2, bl.h/2, float64(bx-bcx(bl)), float64(ry-bcy(bl)))
			sb.WriteString(fmt.Sprintf(`<line data-oc-block="%s" data-oc-flow="out" x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b5651d" stroke-width="1.2" marker-end="url(#%smo)"/>`,
				htmlEscape(bl.id), sx, sy, bx, ry, vid))
		}
	}
	// sibling flow arrows: both ends inside this view (a flow never detours through a bar)
	bm := map[string]*obusBlock{}
	for _, bl := range blocks {
		bm[bl.id] = bl
	}
	for _, e := range edges {
		s, t := bm[e.s], bm[e.t]
		if s == nil || t == nil {
			continue
		}
		scx, scy := bcx(s), bcy(s)
		tcx, tcy := bcx(t), bcy(t)
		dxf, dyf := float64(tcx-scx), float64(tcy-scy)
		if dxf == 0 && dyf == 0 {
			continue
		}
		x1, y1 := rectBorder(scx, scy, s.w/2, s.h/2, dxf, dyf)
		x2, y2 := rectBorder(tcx, tcy, t.w/2, t.h/2, -dxf, -dyf)
		sb.WriteString(fmt.Sprintf(`<line data-oc-src="%s" data-oc-dst="%s" x1="%d" y1="%d" x2="%d" y2="%d" stroke="#9db6e0" stroke-width="1.4" marker-end="url(#%smu)"/>`,
			htmlEscape(e.s), htmlEscape(e.t), x1, y1, x2, y2, vid))
		if e.label != "" {
			sb.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#5b7fa6" paint-order="stroke" stroke="#fff" stroke-width="3" pointer-events="none">%s</text>`,
				(x1+x2)/2, (y1+y2)/2-3, htmlEscape(e.label)))
		}
	}
	// the CORE circle (centred, opaque so a bus tap passing behind it is hidden). It is the
	// drill affordance into the next-inner band and the centre the inner-directed signals aim at.
	if opts.hasCore {
		g := `<g`
		if opts.coreDrill != "" {
			g += ` data-onion-go="` + opts.coreDrill + `"`
		}
		sb.WriteString(g + `>`)
		sb.WriteString(`<title>core — ` + htmlEscape(opts.coreName) + ` and the bands beneath (click to enter)</title>`)
		sb.WriteString(fmt.Sprintf(`<circle cx="0" cy="0" r="%d" fill="#dce9f8" stroke="#4a6fa5" stroke-width="1.6"/>`, coreR))
		if opts.coreMarked {
			sb.WriteString(fmt.Sprintf(`<circle cx="0" cy="0" r="%d" fill="none" stroke="%s" stroke-width="2.4"/>`, coreR, onionMarkColor))
			sb.WriteString(onionMarkDot(coreR-6, -coreR+6))
		}
		cl := owrap(opts.coreName, 12, 2)
		ty := -(len(cl)*12)/2 + 4
		for _, ln := range cl {
			sb.WriteString(fmt.Sprintf(`<text x="0" y="%d" text-anchor="middle" font-weight="bold" fill="#33475e" pointer-events="none">%s</text>`, ty, htmlEscape(ln)))
			ty += 12
		}
		sb.WriteString(fmt.Sprintf(`<text x="0" y="%d" text-anchor="middle" font-size="8" fill="#5b7fa6" pointer-events="none">core ▽</text>`, ty+2))
	}
	// core taps (drawn ON the core so the arrowhead shows at its rim): each aims at the core
	// CENTRE and clips to the core's circular border, so it reads as pointing radially inward.
	if opts.hasCore {
		for _, bl := range blocks {
			cxB, cyB := bcx(bl), bcy(bl)
			if bl.toCore {
				sx, sy := rectBorder(cxB, cyB, bl.w/2, bl.h/2, float64(-cxB), float64(-cyB))
				ex, ey := circleBorder(0, 0, coreR, cxB, cyB)
				sb.WriteString(fmt.Sprintf(`<line data-oc-block="%s" x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b5651d" stroke-width="1.2" marker-end="url(#%smo)"/>`,
					htmlEscape(bl.id), sx, sy, ex, ey, vid))
			}
			if bl.fromCore {
				sx, sy := circleBorder(0, 0, coreR, cxB, cyB)
				ex, ey := rectBorder(cxB, cyB, bl.w/2, bl.h/2, float64(-cxB), float64(-cyB))
				sb.WriteString(fmt.Sprintf(`<line data-oc-block="%s" x1="%d" y1="%d" x2="%d" y2="%d" stroke="#2f8f4e" stroke-width="1.2" marker-end="url(#%smi)"/>`,
					htmlEscape(bl.id), sx, sy, ex, ey, vid))
			}
		}
	}
	// blocks on top
	for _, bl := range blocks {
		attr := ` data-oc-id="` + htmlEscape(bl.id) + `"`
		if bl.drill != "" {
			attr += ` data-onion-go="` + bl.drill + `"`
		}
		if bl.link != "" {
			attr += ` data-node-link="` + htmlEscape(bl.link) + `"`
		}
		if bl.resp != "" {
			attr += ` data-oc-resp="` + htmlEscape(bl.resp) + `"`
		}
		if bl.req != "" {
			attr += ` data-oc-req="` + htmlEscape(bl.req) + `"`
		}
		if bl.dec != "" {
			attr += ` data-oc-dec="` + htmlEscape(bl.dec) + `"`
		}
		if bl.newel {
			attr += ` data-oc-new="1"`
		} else if bl.marked {
			attr += ` data-oc-changed="1"`
		}
		cls := "oblock"
		if bl.drill != "" {
			cls += " odrill"
		}
		sb.WriteString(`<g class="` + cls + `" id="` + vid + `-e-` + slug(bl.id) + `"` + attr + `>`)
		sb.WriteString(`<title>` + htmlEscape(bl.full) + `</title>`)
		fill := "#fff"
		if bl.cluster {
			fill = "#eef3fa"
		}
		sb.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="%s" stroke="#4a6fa5"/>`, bl.x, bl.y, bl.w, bl.h, fill))
		if bl.drill != "" {
			// the double border marks an enterable block
			sb.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="none" stroke="#4a6fa5"/>`, bl.x+3, bl.y+3, bl.w-6, bl.h-6))
		}
		if bl.marked {
			sb.WriteString(fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="none" stroke="%s" stroke-width="2.4"/>`, bl.x, bl.y, bl.w, bl.h, onionMarkColor))
			sb.WriteString(onionMarkDot(bl.x+bl.w-7, bl.y+7))
		}
		bold := ""
		if bl.cluster {
			bold = ` font-weight="bold"`
		}
		ty := bl.y + 15
		for _, ln := range bl.lines {
			sb.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle"%s pointer-events="none">%s</text>`, bl.x+bl.w/2, ty, bold, htmlEscape(ln)))
			ty += 12
		}
		if bl.sub != "" {
			sb.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-size="9" fill="#777" pointer-events="none">%s</text>`, bl.x+bl.w/2, ty, htmlEscape(bl.sub)))
		}
		// drill affordance: a small handle hanging off the block's own bottom edge
		// (double-click the block to enter — a cluster block also inspects on a single click).
		if bl.drill != "" {
			hx, hy := bl.x+bl.w-14, bl.y+bl.h
			sb.WriteString(fmt.Sprintf(`<circle cx="%d" cy="%d" r="7" fill="#4a6fa5" stroke="#fff" stroke-width="1.3"/><path d="M%d,%d l4,4 l4,-4" fill="none" stroke="#fff" stroke-width="1.6"/>`,
				hx, hy, hx-4, hy-1))
		}
		sb.WriteString(`</g>`)
	}
	sb.WriteString(`</svg>`)
	return sb.String()
}

// enddesign

// design: go-onion-interact  implements: req-onion-click, req-onion-enter
// ONE onion interaction script for every host. The book shell and the standalone review
// page ride the SAME constant, so behavior can never drift (the M5 spike: the standalone
// lacked history navigation). Single-click INSPECTS a block: highlight plus the host's
// details lane. The book's data-node-link handler opens its details pane, and a
// standalone host registers window.__onionInspectHook to fill its own panel. Double-click
// ENTERS a drillable block. A ring, core, or crumb with no inspect action enters on a
// single click. Every entry pushes a history state, so browser BACK exits the block
// (req-onion-enter): entering is normal, reversible navigation. Drill targets resolve
// HOST-SCOPED by exact id or id-SUFFIX, so a deck slide's id-prefixed copy drills its
// own views, never the chapter original (the spike's bounded defect). The popstate
// stack keeps the view ELEMENT, never a global id lookup.
const onionInteractJS = `
 window.__quackNav=window.__quackNav||[];
 var __onionStack=[];
 function __onionShow(host,t){Array.prototype.forEach.call(host.querySelectorAll('.oview'),function(v){v.hidden=true;});t.hidden=false;}
 function __onionClear(host){Array.prototype.forEach.call(host.querySelectorAll('.osel,.oc-nb,.oc-on'),function(x){x.classList.remove('osel','oc-nb','oc-on');});}
 function __onionInspect(g){var host=g.closest('.onion');if(!host)return;__onionClear(host);g.classList.add('osel');
  var id=g.getAttribute('data-oc-id')||'';
  Array.prototype.forEach.call(host.querySelectorAll('[data-oc-block="'+id+'"]'),function(l){l.classList.add('oc-on');});
  Array.prototype.forEach.call(host.querySelectorAll('[data-oc-src],[data-oc-dst]'),function(l){
   var s=l.getAttribute('data-oc-src'),d=l.getAttribute('data-oc-dst');if(s!==id&&d!==id)return;
   l.classList.add('oc-on');var o=host.querySelector('[data-oc-id="'+(s===id?d:s)+'"]');if(o)o.classList.add('oc-nb');});
  if(window.__onionInspectHook)window.__onionInspectHook(g);}
 /* a bus PILL: single-click traces every block the bus signal reaches (data-oc-blocks),
    lighting each target block and the tap arrow that carries this direction. */
 function __onionPill(g){var host=g.closest('.onion');if(!host)return;__onionClear(host);g.classList.add('osel');
  var flow=g.getAttribute('data-oc-pill');
  (g.getAttribute('data-oc-blocks')||'').split(',').forEach(function(id){if(!id)return;
   var o=host.querySelector('[data-oc-id="'+id+'"]');if(o)o.classList.add('oc-nb');
   Array.prototype.forEach.call(host.querySelectorAll('[data-oc-block="'+id+'"][data-oc-flow="'+flow+'"]'),function(l){l.classList.add('oc-on');});});}
 function __onionDrill(el){var host=el.closest('.onion');if(!host)return;
  var tid=el.getAttribute('data-onion-go'),t=null;
  Array.prototype.forEach.call(host.querySelectorAll('.oview'),function(v){
   if(!t&&(v.id===tid||v.id.length>tid.length&&v.id.slice(-tid.length-1)==='-'+tid))t=v;});
  if(!t)return;
  var cur=host.querySelector('.oview:not([hidden])');
  if(cur&&cur!==t){__onionStack.push({host:host,el:cur});window.__quackNav.push('onion');try{history.pushState({nav:'onion'},'');}catch(_){}}
  __onionShow(host,t);}
 /* drill is SINGLE-click when it is the only action (a ring, a core, a crumb); a block that
    ALSO inspects keeps drill on DOUBLE-click, so its single click can inspect+highlight. */
 document.querySelectorAll('.onion [data-onion-go]').forEach(function(el){
  var ev=el.hasAttribute('data-oc-id')?'dblclick':'click';
  el.addEventListener(ev,function(e){e.preventDefault();e.stopPropagation();__onionDrill(el);});});
 /* a block's single click INSPECTS and nothing else: propagation stops here, so
    the book's bubbling data-node-link transport never double-fires a jump */
 document.querySelectorAll('.onion [data-oc-id]').forEach(function(el){el.addEventListener('click',function(ev){
  ev.preventDefault();ev.stopPropagation();__onionInspect(el);});});
 document.querySelectorAll('.onion [data-oc-pill]').forEach(function(el){el.addEventListener('click',function(ev){
  ev.preventDefault();ev.stopPropagation();__onionPill(el);});});
 window.addEventListener('popstate',function(){
  var nv=window.__quackNav||[];
  if(nv.length===0||nv[nv.length-1]!=='onion')return;
  nv.pop();
  var e=__onionStack.pop();if(!e)return;
  __onionShow(e.host,e.el);});
 /* hide-boilerplate (req-onion-boilerplate): the fold control toggles the host's fold-amb
    class; the CSS rule hides every ambient-stamped pill, the DOM stays complete. */
 document.querySelectorAll('.onion [data-oc-fold]').forEach(function(btn){btn.addEventListener('click',function(){
  var host=btn.closest('.onion');if(!host)return;
  var on=host.classList.toggle('fold-amb');
  Array.prototype.forEach.call(host.querySelectorAll('[data-oc-fold]'),function(x){
   x.textContent=on?x.getAttribute('data-oc-show'):x.getAttribute('data-oc-hide');});});});
 /* pan+zoom the onion svgs (owner: zoomable like the trace graph) - wheel zooms toward the
    cursor, drag pans, double-click resets; clicks on drill targets still pass through */
 document.querySelectorAll('.onion svg').forEach(function(svg){
  var vb=(svg.getAttribute('viewBox')||'0 0 380 360').split(/\s+/).map(Number);
  var base=vb.slice(),st={x:vb[0],y:vb[1],w:vb[2],h:vb[3]},drag=null;
  function apply(){svg.setAttribute('viewBox',st.x+' '+st.y+' '+st.w+' '+st.h);}
  svg.addEventListener('wheel',function(e){e.preventDefault();var r=svg.getBoundingClientRect();if(!r.width)return;
   var mx=st.x+(e.clientX-r.left)/r.width*st.w,my=st.y+(e.clientY-r.top)/r.height*st.h,f=e.deltaY<0?0.85:1.18;
   st.w*=f;st.h*=f;st.x=mx-(e.clientX-r.left)/r.width*st.w;st.y=my-(e.clientY-r.top)/r.height*st.h;apply();},{passive:false});
  svg.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('[data-onion-go],[data-node-link],[data-oc-id],[data-oc-pill]'))return;
   drag={x:e.clientX,y:e.clientY,sx:st.x,sy:st.y};try{svg.setPointerCapture(e.pointerId);}catch(_){}svg.style.cursor='grabbing';});
  svg.addEventListener('pointermove',function(e){if(!drag)return;var r=svg.getBoundingClientRect();if(!r.width)return;
   st.x=drag.sx-(e.clientX-drag.x)/r.width*st.w;st.y=drag.sy-(e.clientY-drag.y)/r.height*st.h;apply();});
  svg.addEventListener('pointerup',function(){drag=null;svg.style.cursor='';});
  svg.addEventListener('dblclick',function(){st.x=base[0];st.y=base[1];st.w=base[2];st.h=base[3];apply();});
 });
`

// enddesign

// design: go-model-standalone  implements: req-diagram-review-render
// The standalone single-model render shows ONE model's onion drill-down as a small, self-contained HTML page. It reuses renderOnionOpt, the book's own onion, AND the shared interaction script (go-onion-interact), so the two projections never drift in figure or behavior. It inlines only the CSS and panel glue it needs. It makes no external request, the dom-static, single-file discipline. `marked` names the changed elements. The shell adds a title, a legend, and the drill script.
const onionStandaloneCSS = "*{box-sizing:border-box}" +
	"body{font-family:system-ui,Segoe UI,sans-serif;margin:0;line-height:1.5;color:#1a1a1a;background:#fff}" +
	"main{max-width:1040px;margin:0 auto;padding:1rem 1.5rem 3rem}" +
	".rv-head{padding:1rem 1.5rem;background:#fafafa;border-bottom:1px solid #e3e3e3}" +
	".rv-head h1{margin:.2rem 0;font-size:1.3rem}" +
	".rv-sub{color:#55606a;font-size:.9rem;margin:.2rem 0;max-width:74ch}" +
	".rv-legend{font-size:.85rem;color:#55606a;margin:.5rem 0 0}" +
	".rv-dot{display:inline-block;width:.8em;height:.8em;border-radius:50%;background:#e8590c;margin-right:3px;vertical-align:middle}" +
	".crumbs{font-size:.85rem;margin:.3rem 0;color:#555}" +
	".crumbs button{background:none;border:none;color:#2762c4;cursor:pointer;padding:0;font:inherit;text-decoration:underline}" +
	".onion .oview[hidden]{display:none}.onion [data-onion-go]{cursor:pointer}.onion .oblock{cursor:pointer}.onion .opill{cursor:pointer}" +
	".onion-flow{overflow-x:auto;max-width:100%}.onion-flow svg{display:block}" +
	".onion svg{cursor:grab;touch-action:none;max-width:100%}" +
	".onion .osel>rect{stroke:#1b6fd6;stroke-width:2.6}.onion .oc-nb>rect{stroke:#1b6fd6;stroke-width:2}.onion .oc-on{stroke:#1b6fd6;stroke-width:2.6;opacity:1}" +
	".onion-infra{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:.3rem 0;font-size:.78rem}" +
	".onion-infra .il{color:#888;margin-right:4px}" +
	".onion-infra button{font:inherit;font-size:.75rem;padding:2px 9px;border:1px solid #d5d5d5;border-radius:12px;background:#fff;cursor:pointer}" +
	".onion.fold-amb [data-oc-amb]{display:none}" +
	"#rv-detail{position:fixed;top:0;right:0;width:320px;max-width:88vw;height:100%;overflow:auto;background:#fff;border-left:1px solid #e3e3e3;box-shadow:-4px 0 16px rgba(0,0,0,.08);padding:1rem 1.1rem;font-size:.85rem;z-index:20}" +
	"#rv-detail[hidden]{display:none}#rv-detail h2{margin:.2rem 0 .6rem;font-size:1rem;word-break:break-word}" +
	"#rv-close{float:right;font:inherit;font-size:.78rem;padding:2px 9px;border:1px solid #d5d5d5;border-radius:6px;background:#fff;cursor:pointer}" +
	".rv-d-row{margin:.35rem 0;display:flex;gap:.5rem}.rv-d-lbl{color:#888;min-width:6.5rem;flex:0 0 6.5rem}"

// onionStandaloneJS is only the PANEL GLUE: the interaction itself is the shared
// onionInteractJS (go-onion-interact); this registers the inspect hook filling the
// standalone's own details panel, plus its close button.
const onionStandaloneJS = "(function(){" +
	"var panel=document.getElementById('rv-detail');" +
	"function fld(i,v){var e=document.getElementById(i);if(e)e.textContent=v||'\\u2014';}" +
	"window.__onionInspectHook=function(g){if(!panel)return;" +
	"fld('rv-d-name',g.getAttribute('data-oc-id')||'');" +
	"fld('rv-d-status',g.getAttribute('data-oc-new')?'new element':(g.getAttribute('data-oc-changed')?'behavior change':'unchanged'));" +
	"fld('rv-d-resp',g.getAttribute('data-oc-resp'));fld('rv-d-req',g.getAttribute('data-oc-req'));fld('rv-d-dec',g.getAttribute('data-oc-dec'));" +
	"panel.hidden=false;};" +
	"var cl=document.getElementById('rv-close');if(cl&&panel)cl.addEventListener('click',function(){panel.hidden=true;});" +
	"})();"

func renderStandaloneModel(modelID string, marked []string) (string, error) {
	if modelID != "model-engine-layers" {
		return "", fmt.Errorf("render: only model-engine-layers (the engine onion) renders today, not %q", modelID)
	}
	nodes := LoadAll()
	rev := &onionReview{marked: map[string]bool{}}
	for _, id := range marked {
		if id = strings.TrimSpace(id); id != "" {
			rev.marked[id] = true
		}
	}
	figSeq = 0 // stable figure ids in the standalone (no other figures precede it)
	fig := renderOnionOpt(nodes, rev)
	var b strings.Builder
	b.WriteString("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n")
	b.WriteString(`<meta name="viewport" content="width=device-width,initial-scale=1">` + "\n")
	b.WriteString("<title>" + htmlEscape(brand()+" — "+modelID+" review") + "</title>\n")
	b.WriteString("<style>" + onionStandaloneCSS + "</style>\n</head><body>\n")
	b.WriteString(`<header class="rv-head"><h1>` + htmlEscape(modelID) + ` — change review</h1>`)
	b.WriteString(`<p class="rv-sub">Click a ring or a band's core to drill in. A band is a round onion with a centred core; a cluster is a coreless box. Click a block to inspect it; double-click a cluster block to drill in. Click a bus pill to trace where its signal flows. Wheel zooms, drag pans, double-click empty space resets. Orange marks a change.</p>`)
	b.WriteString(`<p class="rv-legend"><span class="rv-dot"></span>changed in this iteration — a marked element marks its block and its ring, so the change shows at every level.</p></header>` + "\n")
	b.WriteString(`<main>` + fig + `</main>` + "\n")
	b.WriteString(`<aside id="rv-detail" hidden><button id="rv-close" type="button">close</button>` +
		`<h2 id="rv-d-name"></h2>` +
		`<p class="rv-d-row"><span class="rv-d-lbl">status</span><span id="rv-d-status"></span></p>` +
		`<p class="rv-d-row"><span class="rv-d-lbl">responsibility</span><span id="rv-d-resp"></span></p>` +
		`<p class="rv-d-row"><span class="rv-d-lbl">implements</span><span id="rv-d-req"></span></p>` +
		`<p class="rv-d-row"><span class="rv-d-lbl">informed by</span><span id="rv-d-dec"></span></p></aside>` + "\n")
	b.WriteString("<script>" + onionInteractJS + onionStandaloneJS + "</script>\n</body></html>\n")
	return b.String(), nil
}

// enddesign

// design: go-onion-model-source  implements: req-models-in-book
// The onion's layer map derives from the engine-layers MODEL node (spec/models/model-engine-layers.md), the authored truth. spec/design-layers.md stays as the stub-project fallback. Rings are the model's REAL layers in declared order, innermost first; bands and ambient are never rings. The BLOCK unit is the model ELEMENT, a design region. Files never rank and never convert to patterns; elements are design regions, and files are themes. Allocation follows three conventions. A band's ("outer--inner") elements merge into the INNER of its two named rings; the transform feeds it. Ambient elements, and any unranked stray, map to "ambient": NO ring, and the renderer pins them to the innermost view's infrastructure pills. A realized engine region the model does not allocate is ABSENT here; the renderer's `unmapped` ring catches it, and the sky-fall lint keeps it empty.
type modelOnion struct {
	rings   []string          // ring names, innermost first
	layerOf map[string]string // region id -> ring name ("ambient" = off the rings)
	labelOf map[string]string // region id -> the model's responsibility text
	flows   []modelFlow       // the authored a-to-b edges (used by the review render)
}

func modelOnionRegions() *modelOnion {
	raw, err := os.ReadFile(filepath.Join(SPEC, "models", "model-engine-layers.md"))
	if err != nil {
		return nil
	}
	g, _ := extractModelGraph(string(raw))
	return modelOnionFromGraph(g)
}

// modelOnionFromGraph binds ANY extracted layered graph to the onion's model
// shape — the same ring/band/ambient allocation whatever file the graph came from.
func modelOnionFromGraph(g modelGraph) *modelOnion {
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
	mo := &modelOnion{rings: rl, layerOf: map[string]string{}, labelOf: map[string]string{}, flows: g.Flows}
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

// design: go-trace-graph  implements: req-system-overview, req-compact-derived.1, req-graph-centering
// The trace chapter's per-need graph REUSES the report's per-need grouping, traceTabs/subtree/buildTab via bookGraphTabs, with the book's own tab bake. This is the CLEAN per-need trace: no fold boxes, no (unrooted) tab, since a node reaching no need root does not render, and decisions only when architectural. One page appears per need; a tab bar toggles which need's graph shows. Each node is clickable and opens the details pane, data-node-link, a shared handler; the pane's link transports to the table row. Each node carries a [ch N] badge naming the chapter its item's table renders in, so a reader always knows where to read the detail.

// chapterNumbers maps each reader chapter's manifest id to its 1-based render number.
func chapterNumbers(nodes map[string]Node) map[string]int {
	var chs []Node
	for _, n := range nodes {
		if n.Type == "manifest" && (n.Mode == "chapter" || n.Mode == "guidance") {
			chs = append(chs, n)
		}
	}
	clless := chapterLess(nodes)
	for i := 1; i < len(chs); i++ {
		for j := i; j > 0 && clless(chs[j], chs[j-1]); j-- {
			chs[j], chs[j-1] = chs[j-1], chs[j]
		}
	}
	out := map[string]int{}
	for i, c := range chs {
		out[c.ID] = i + 1
	}
	return out
}

// typeChapterID names the chapter whose tables render each trace type (decisions
// render in the project chapter).
var typeChapterID = map[string]string{
	"need": "man-design-input", "usecase": "man-design-input",
	"requirement": "man-design-input", "design": "man-design-output",
	"test": "man-verification-validation", "adr": "man-project",
}

func renderTraceGraph(nodes map[string]Node) string {
	sm := StatusMap(nodes)
	// REUSE the report trace graph verbatim (design go-trace-graph): the SAME per-need
	// tabs, cytoscape+dagre layout, styles, legend toggles, and filter as the report - only the node
	// tap differs. The report opens its detail panel; here QUACK_NODE_TAP opens the details pane
	// whose link transports to the item table
	// row in the chapter that owns it. The three drawing libraries inline (CDN
	// caching is per-site since ~2020 and unreliable for a file:// book, so inline is the only way
	// to KEEP the graph working offline after the book is received - the book stays fully self-contained,
	// its "no external requests" property intact).
	data := map[string]interface{}{
		"tabs":       bookGraphTabs(nodes, sm),
		"checks":     checksMap(nodes, sm, dataDirFor("out")),
		"typecolors": typeColors(), // the one palette source paints the graph (go-type-colors)
	}
	gdata, _ := json.Marshal(data)
	chNum := chapterNumbers(nodes)
	chcap := func(id string) string {
		if n, ok := chNum[id]; ok {
			return itoa(n)
		}
		return "?"
	}
	// the book legend defaults EVERY type on (render all by default, incl design and adr) -
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
	// chapter marking lives OUTSIDE the 1:1 graph (rendered as a list): a node colour is
	// its type; this says which chapter each type's table sits in, and a click transports there.
	b.WriteString(`<p class="meta">Click any node to open its row in the chapter that owns it:</p><ul class="meta tg-chmap">` +
		`<li>needs, use-cases, and requirements — chapter ` + chcap("man-design-input") + `</li>` +
		`<li>designs — chapter ` + chcap("man-design-output") + `</li>` +
		`<li>tests — chapter ` + chcap("man-verification-validation") + `</li>` +
		`<li>decisions — chapter ` + chcap("man-project") + `</li></ul>`)
	b.WriteString(`<div id="tabbar" class="tabbar"></div>`)
	b.WriteString(`<div class="legendrow">` + bookLegend +
		`<input id="trace-filter" placeholder="filter… (click for help)" title="filter the graph" autocomplete="off"><button id="filter-clear" title="clear the filter">&#215;</button></div>`)
	b.WriteString(`<div id="graph"></div>`)
	b.WriteString(`<div id="detail" hidden></div>`)
	// the ONE override: a node tap opens the DETAILS pane;
	// the pane's link runs the transport through window.bookGoto, which pushes the history
	// entry, so the browser BACK still returns to the graph.
	b.WriteString(`<script>window.QUACK_DATA=` + string(gdata) + `;` +
		`window.QUACK_NODE_TAP=function(id){if(window.bookNodeDetail)window.bookNodeDetail(id);};</script>`)
	b.WriteString(`<script>` + assetJS("cytoscape.min.js") + `</script>`)
	b.WriteString(`<script>` + assetJS("dagre.min.js") + `</script>`)
	b.WriteString(`<script>` + assetJS("cytoscape-dagre.js") + `</script>`)
	b.WriteString(`<script>` + reportJS + `</script>`)
	b.WriteString(`</div>`)
	return b.String()
}

// enddesign

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
// design: go-fig-tables  implements: req-derived-boards.2
// Tables are tables, figures are figures. The tabular fig kinds, vv-table and stakeholder-matrix, retire in favor of canned base queries the manifests embed as ```base blocks; they gain live Obsidian preview. fig: keeps only spatial graphics whose selection is topological: context model, block tree, timeline. A retired kind is a FINDING with the pointer to its canned query. A base block in any unit body evaluates through the pinned evaluator (go-base-eval) into a semantic table. Queries pool centrally. An inline block in a manifest is a smell. The canonical home is spec/queries/, and a unit references a pooled query with the Obsidian-native embed ![[name.base]]. Obsidian previews it live, and the emitter inlines the file and evaluates it exactly like an authored block. A missing pooled query is a render-failing finding, never a silent skip.
var retiredFigKinds = map[string]string{
	"vv-table":           "(req-derived-boards.2) - embed its canned base query from method/templates/documents/spec/queries",
	"stakeholder-matrix": "(req-derived-boards.2) - embed its canned base query from method/templates/documents/spec/queries",
	"candidates-matrix":  "(req-decision-rendering.2) - the record lives with the project chapter: the timeline reaches each iteration's candidates and decisions",
	"timeline":           "(req-project-timeline) - use fig: project-timeline, the one shared component",
	"context-star":       "(req-interactive-figures.3) - use fig: context-model, the same derived figure under its right name",
	"coverage-board":     "(req-derived-boards.1) - its facets ride the register's filter columns now",
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
	// unit prose renders at heading base 1: an authored `## section` is a real h2 book
	// section (the chapter h1's direct child) - the render-time numbering counts it.
	uses := baseUseRe.FindAllStringSubmatchIndex(body, -1)
	if len(uses) == 0 {
		return mdLiteAt(AutoLink(body, aliasIdx), 1)
	}
	var out strings.Builder
	last := 0
	for _, m := range uses {
		if seg := body[last:m[0]]; strings.TrimSpace(seg) != "" {
			out.WriteString(mdLiteAt(AutoLink(seg, aliasIdx), 1))
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
		out.WriteString(mdLiteAt(AutoLink(seg, aliasIdx), 1))
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

// baseRowsNodeBacked reports whether a result's rows are a homogeneous set of typed
// trace nodes: at least one row, every row id resolves in the graph, and all resolved
// nodes share ONE type. This is the structural test the deterministic table law rests
// on - it derives from node data, never from how content was authored.
func baseRowsNodeBacked(r BaseResult, nodes map[string]Node) bool {
	n := 0
	typ := ""
	for _, g := range r.Groups {
		for _, row := range g.Rows {
			nd, ok := nodes[row.ID]
			if !ok {
				nd, ok = nodes[subAddrBase(row.ID)]
			}
			if !ok {
				return false
			}
			if typ == "" {
				typ = nd.Type
			} else if nd.Type != typ {
				return false
			}
			n++
		}
	}
	return n > 0
}

// nodeLinkHTML renders a LINK to a node - its human name plus the statement as the brief
// - never a copy of the node's content (links, never copies). It
// emits the established termref affordance directly (data-help + data-goto): a click
// carries name, brief, and the jump link into the details pane.
func nodeLinkHTML(id string, nodes map[string]Node) string {
	label := humanizeID(subAddrBase(id))
	n, ok := nodes[id]
	if !ok {
		n, ok = nodes[subAddrBase(id)]
	}
	if !ok || n.Statement == "" {
		// no brief to carry: the plain anchor form - the chapter's refTooltips pass
		// upgrades it to the same termref affordance with the default tip.
		return `<a href="#` + htmlEscape(id) + `">` + htmlEscape(label) + `</a>`
	}
	return `<button type="button" class="termref" data-title="` + attesc(htmlEscape(label)) +
		`" data-help="` + attesc(htmlEscape(n.Statement)) + `" data-goto="` + htmlEscape(id) + `">` +
		htmlEscape(label) + `</button>`
}

// stripLeadingStatement drops a body's opening duplicate of the node statement:
// the expand shows only what the row does not already show.
func stripLeadingStatement(body, stmt string) string {
	body = strings.TrimSpace(body)
	stmt = strings.TrimSpace(stmt)
	if stmt == "" || !strings.HasPrefix(body, stmt) {
		return body
	}
	return strings.TrimSpace(body[len(stmt):])
}

// leadPara peels a markdown body's opening plain-prose paragraph. Anything that is
// not prose - a heading, a list, a table, code, or markup - yields nothing.
func leadPara(body string) (para, rest string) {
	body = strings.TrimSpace(strings.ReplaceAll(body, "\r\n", "\n"))
	if body == "" {
		return "", ""
	}
	cut := strings.Index(body, "\n\n")
	if cut < 0 {
		para, rest = body, ""
	} else {
		para, rest = body[:cut], strings.TrimSpace(body[cut+2:])
	}
	para = strings.Join(strings.Fields(para), " ")
	for _, bad := range []string{"#", "- ", "* ", "|", "```", "<", ">", "!"} {
		if strings.HasPrefix(para, bad) {
			return "", body
		}
	}
	if strings.ContainsAny(para, "<>[]`{}|") {
		return "", body // markup or markdown syntax never promotes into a plain cell
	}
	return para, rest
}

// promoteBrief derives a missing row brief from the expand content. The expand's
// opening paragraph - the statement when the row could not carry it, else the body's
// lead paragraph - moves whole into the brief when it fits the line; a longer one
// lends its lead before a dash. A whole-promoted body paragraph leaves the body.
func promoteBrief(name, head, body string) (brief, outBody string) {
	const fit = 110
	if head != "" && head != name {
		// the expand opens with the too-long statement: its dash lead gives the gist
		if lead, sub := splitChapterTitle(head); sub != "" && len(lead) <= fit && lead != name {
			return lead, body
		}
		return "", body
	}
	para, rest := leadPara(body)
	if para == "" || para == name {
		return "", body
	}
	if len(para) <= fit {
		return para, rest
	}
	if lead, sub := splitChapterTitle(para); sub != "" && len(lead) <= fit && lead != name {
		return lead, body
	}
	return "", body
}

// utableControls is the shared reader-table footer: expand/collapse-all, the text
// filter, the page size, and the pager - ONE markup for every utable render site.
// psize > 0 makes that size the table's default page (a leading selected option);
// 0 keeps the shared default of twenty.
func utableControls(psize int) string {
	sizes := `<select class="qt-size"><option>20</option><option>50</option><option value="0">all</option></select>`
	if psize > 0 && psize != 20 {
		sizes = `<select class="qt-size"><option selected>` + itoa(psize) + `</option><option>20</option><option>50</option><option value="0">all</option></select>`
	}
	return `<div class="ucontrols">` +
		`<button type="button" class="qt-xall">expand all</button><button type="button" class="qt-call">collapse all</button>` +
		`<input class="qt-search" type="search" placeholder="filter…">` +
		`<label class="qt-sizel">show ` + sizes + `</label>` +
		`<span class="qt-pager"><button type="button" class="qt-prev" aria-label="previous page">&#8249;</button><span class="qt-pos"></span><button type="button" class="qt-next" aria-label="next page">&#8250;</button></span>` +
		`</div>`
}

// baseResultHTML renders evaluation results: semantic tables (WCAG: real th headers),
// full sections with note bodies (render: full, section id = the note slug), or
// state-aware node sections (render: refs - each row through renderNodeAtDepth).
func baseResultHTML(rs []BaseResult, nodes map[string]Node, sm map[string]string, bl map[string]Event, anchorBase string) string {
	var b strings.Builder
	for ri, r := range rs {
		if r.Full && !baseRowsNodeBacked(r, nodes) {
			// the deterministic table law: a homogeneous set of
			// typed trace nodes renders as a TABLE, decided here from node data - never by
			// the authored render mode. `render: full` survives only for content notes
			// (references, fundamentals, methods), which are not trace nodes.
			b.WriteString(renderBaseFull(r))
			continue
		}
		if r.Refs {
			// design: go-render-refs  implements: req-manifest-render.3
			// A refs view hands its rows to the SAME renderer ref units use. Gate state, verdict links, and depth mechanics ride along. Obsidian previews the rows as a plain table; the render key is ignored there.
			depth := r.Depth
			if depth < 1 {
				depth = 1
			}
			empty := true
			rn := 0
			for _, g := range r.Groups {
				grouped := g.Key != ""
				if grouped {
					// a grouped refs view discloses per group: when the
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
		// design: go-q-table  implements: req-reader-tables.1, req-reader-tables.5, req-reader-tables.2, req-reader-tables.3, req-compact-derived.1, req-reader-tables.4, req-vv-result-links, req-onion-interfaces
		// Combinable pill FACETS ride above the table: AND across facets, OR within one. A universal need facet covers trace items, plus one facet per small-enum column. There is never a pill per item. The universal query table uses a real thead with a clear header row and separated cells, rendered even with zero rows. The empty-value "(none)" bucket header never renders, though its rows still do. Interactivity is STATIC DOM. A filter row carries a text input plus one select per enum column, a small distinct value set derived from the rows at emit. Ungrouped tables carry data-sortable, and the shell script sorts by MOVING existing rows. Every row with an id is EXPANDABLE (req-reader-tables.3). A static detail row, with statement, meta, and body prose, follows it, hidden until toggled. Expand-all and collapse-all buttons ride the filter row. A table beyond twenty rows pages BY NEED. Each row is stamped with the first need its item traces up to, walking refines, verifies, and implements upward in deterministic order. Needless rows land on the last page, and buckets chunk at twenty. Off-page rows carry hidden AT EMIT, so the no-script default is one bounded page (req-compact-derived.1); the pager only toggles visibility. The unified reader table is ONE interactive pattern everywhere. A row is the item NAME with a disclosure triangle. The expand carries the statement, the remaining fields, and the body. Combinable FILTER PILL facets ride above the table: a "need" facet plus one per small-distinct-value column. The controls below, filter box, expand/collapse-all, page size, pager, sit right-aligned. Pagination is client-side, default 20, configurable. Rows keep data-node for trace-graph transport; the script only toggles. A row landing in SEVERAL groups, a multi-valued groupBy facet, renders ONCE. The flat reader table shows no group sections, so the duplicate would read as a defect, not a grouping. The first group's key wins for data-gp.
		type flatRow struct {
			row BaseRow
			gp  string
		}
		var frows []flatRow
		seenRow := map[string]bool{}
		for _, g := range r.Groups {
			for _, row := range g.Rows {
				if row.ID != "" {
					if seenRow[row.ID] {
						continue
					}
					seenRow[row.ID] = true
				}
				frows = append(frows, flatRow{row, g.Key})
			}
		}
		enumCols := []int{}
		for ci := 1; ci < len(r.Columns); ci++ {
			distinct := map[string]bool{}
			enum := true
			for _, fr := range frows {
				row := fr.row
				if ci >= len(row.Cells) || row.Cells[ci] == "" {
					continue
				}
				// a URL is never an enum value: it belongs in the expand as a live
				// link, not in a pill or a column (the references table's url field)
				if len(row.Cells[ci]) > 24 || strings.HasPrefix(row.Cells[ci], "http://") || strings.HasPrefix(row.Cells[ci], "https://") {
					enum = false
				}
				distinct[row.Cells[ci]] = true
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
		// rowNeed: an authored Need (a row without a node id, e.g. a function) wins;
		// every node-backed row resolves through the trace walk.
		rowNeed := func(row BaseRow) string {
			if row.Need != "" {
				return row.Need
			}
			return needOf(row.ID)
		}
		cfg := readProjectConfig()
		rowModule := func(row BaseRow) string {
			if row.ID != "" {
				if n, ok := nodes[row.ID]; ok && n.Module != "" {
					return n.Module
				}
			}
			return cfg.moduleDefault()
		}
		moduleCount := map[string]int{}
		for _, fr := range frows {
			if m := rowModule(fr.row); m != "" {
				moduleCount[m]++
			}
		}
		needCount := map[string]int{}
		// rowDim: the facet would enumerate the rows themselves (every row IS its
		// need) - a pill per row is a list, not a filter, so the facet is skipped.
		rowDim := true
		for _, fr := range frows {
			nd := rowNeed(fr.row)
			if nd != "" {
				needCount[nd]++
			}
			if nd != fr.row.ID {
				rowDim = false
			}
		}
		// stakeholder rows carry a VIEW pill: a click enters the reader's preset (the
		// stakeholder's preset link, else the man-preset-<role> manifest its id names)
		// into the book filter - the same delegated data-view machinery the filter help
		// uses. A stakeholder with NO resolvable preset gets NO pill: a token no chapter
		// carries would filter the whole book away (the post-ship preset incident).
		viewTok := map[string]string{}
		for _, fr := range frows {
			n, ok := nodes[fr.row.ID]
			if !ok || n.Type != "stakeholder" {
				continue
			}
			tok := basePropsOf(n.Path).scalars["preset"]
			if tok == "" {
				cand := "man-preset-" + strings.TrimPrefix(fr.row.ID, "stk-")
				if pn, has := nodes[cand]; has && pn.Mode == "preset" {
					tok = cand
				}
			}
			if tok == "" {
				continue
			}
			viewTok[fr.row.ID] = tok
		}
		viewCols := 0
		if len(viewTok) > 0 {
			viewCols = 1
		}
		// a deck-manifest row auto-earns an OPEN pill: a click transports to the deck
		// through the data-goto rail - the same affordance the guides table wears,
		// derived from the row's node, never hand-maintained
		openTok := map[string]bool{}
		for _, fr := range frows {
			if n, ok := nodes[fr.row.ID]; ok && n.Type == "manifest" && n.Mode == "deck" {
				openTok[fr.row.ID] = true
			}
		}
		openCols := 0
		if len(openTok) > 0 {
			openCols = 1
		}
		tid := "ut" + itoa(figNext())
		b.WriteString(`<div class="utable" id="` + tid + `">`)
		if r.Name != "" {
			b.WriteString(`<p class="utable-cap">` + htmlEscape(r.Name) + `</p>`)
		}
		// design: go-filter-columns  implements: req-filter-pill-rule
		// Combinable pill facets: AND across facets, OR within one. The mechanism is
		// GENERIC (the owner's filter rules). The facets COLLECT first, and the emit
		// shape follows their count. SEVERAL dimensions render one VERTICAL column each
		// inside one .ufilters row. The header names the category, and the chips carry
		// counts. An empty value stays visible and clickable at zero, since the need
		// facet lists every need. A column past TEN values scrolls between an arrow on
		// each end. ONE dimension stays a single horizontal .upills row. The chips keep
		// the same data-facet/data-fv wiring, so the shell script needs no fork.
		type uchip struct {
			v string
			n int
		}
		type ufacet struct {
			facet, label string
			chips        []uchip
			off          map[string]bool // values DESELECTED at emit (BaseResult.FacetOff): the rest start on
		}
		var ufacets []ufacet
		if len(cfg.Modules) > 1 && len(moduleCount) >= 2 {
			mods := []string{}
			for k := range moduleCount {
				mods = append(mods, k)
			}
			sortStrings(mods)
			fc := ufacet{facet: "mod", label: "module"}
			for _, m := range mods {
				fc.chips = append(fc.chips, uchip{m, moduleCount[m]})
			}
			ufacets = append(ufacets, fc)
		}
		if !rowDim && len(needCount) >= 2 && len(needCount) <= 16 {
			needs := []string{}
			for k := range needCount {
				needs = append(needs, k)
			}
			for id, n := range nodes {
				if n.Type == "need" && needCount[id] == 0 {
					needs = append(needs, id) // an empty value stays visible, at zero
				}
			}
			sortStrings(needs)
			fc := ufacet{facet: "need", label: "need"}
			for _, nd := range needs {
				fc.chips = append(fc.chips, uchip{nd, needCount[nd]})
			}
			ufacets = append(ufacets, fc)
		}
		for _, ci := range enumCols {
			vals := []string{}
			seen := map[string]bool{}
			cnt := map[string]int{}
			for _, fr := range frows {
				row := fr.row
				if ci < len(row.Cells) && row.Cells[ci] != "" {
					if !seen[row.Cells[ci]] {
						seen[row.Cells[ci]] = true
						vals = append(vals, row.Cells[ci])
					}
					cnt[row.Cells[ci]]++
				}
			}
			sortStrings(vals)
			// every value naming exactly one row is the row dimension again - skip the facet
			singletons := true
			for _, v := range vals {
				if cnt[v] > 1 {
					singletons = false
				}
			}
			if singletons {
				continue
			}
			fc := ufacet{facet: "e" + itoa(ci), label: r.Columns[ci]}
			if offs := r.FacetOff[r.Columns[ci]]; len(offs) > 0 {
				fc.off = map[string]bool{}
				for _, v := range offs {
					fc.off[v] = true
				}
			}
			for _, v := range vals {
				fc.chips = append(fc.chips, uchip{v, cnt[v]})
			}
			ufacets = append(ufacets, fc)
		}
		// the board facets fold into the SAME filter row: each f-<facet>-<value> row
		// class becomes a chip column keyed "b:<facet>" (the class-matching lane
		// carries multi-valued facets); the type-layer vocabulary supplies the
		// zero-count holes, so the completeness check stays live in the ONE surface
		rowFacetCnt := map[string]map[string]int{}
		for _, fr := range frows {
			for _, cls := range fr.row.Facets {
				rest := strings.TrimPrefix(cls, "f-")
				for _, f := range facetNames {
					if strings.HasPrefix(rest, f+"-") {
						if rowFacetCnt[f] == nil {
							rowFacetCnt[f] = map[string]int{}
						}
						rowFacetCnt[f][strings.TrimPrefix(rest, f+"-")]++
					}
				}
			}
		}
		if len(rowFacetCnt) > 0 {
			vocab := FacetVocab()
			for _, f := range facetNames {
				vals := append([]string{}, vocab[f]...)
				seen := map[string]bool{}
				for _, v := range vals {
					seen[v] = true
				}
				for v := range rowFacetCnt[f] {
					if !seen[v] {
						vals = append(vals, v)
						seen[v] = true
					}
				}
				sortStrings(vals)
				if len(vals) == 0 {
					continue
				}
				fc := ufacet{facet: "b:" + f, label: f}
				for _, v := range vals {
					fc.chips = append(fc.chips, uchip{v, rowFacetCnt[f][v]})
				}
				ufacets = append(ufacets, fc)
			}
		}
		multiF := len(ufacets) >= 2
		if multiF {
			b.WriteString(`<div class="ufilters">`)
		}
		for _, fc := range ufacets {
			cls := "upills"
			if multiF {
				cls += " ufcol"
			}
			// FacetOff pre-selection: the star yields to the emitted chip states, so the
			// no-script default is the same bounded view the script would compute
			starOn := " on"
			if len(fc.off) > 0 {
				starOn = ""
			}
			b.WriteString(`<div class="` + cls + `" data-facet="` + fc.facet + `"><span class="pilllbl">` + htmlEscape(fc.label) + `</span><button type="button" class="upill` + starOn + `" data-fv="*">all</button>`)
			scroll := multiF && len(fc.chips) > 10
			if scroll {
				b.WriteString(`<button type="button" class="uarrow" data-uscroll="up">▲</button><div class="ufchips">`)
			}
			for _, c := range fc.chips {
				chipOn := ""
				if len(fc.off) > 0 && !fc.off[c.v] {
					chipOn = " on"
				}
				b.WriteString(` <button type="button" class="upill` + chipOn + `" data-fv="` + htmlEscape(c.v) + `">` + htmlEscape(c.v) + ` <span class="meta">(` + itoa(c.n) + `)</span></button>`)
			}
			if scroll {
				b.WriteString(`</div><button type="button" class="uarrow" data-uscroll="down">▼</button>`)
			}
			b.WriteString(`</div>`)
		}
		if multiF {
			b.WriteString(`</div>`)
		}
		// enddesign
		// enum facet columns render as VISIBLE columns too (references carry their
		// normative/informative kind, decisions their type - a
		// filterable value the reader cannot see per row is a hidden fact).
		b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">name</th><th scope="col">brief</th>`)
		for _, ci := range enumCols {
			b.WriteString(`<th scope="col">` + htmlEscape(r.Columns[ci]) + `</th>`)
		}
		if viewCols > 0 {
			b.WriteString(`<th scope="col">view</th>`)
		}
		if openCols > 0 {
			b.WriteString(`<th scope="col"></th>`)
		}
		b.WriteString(`</tr></thead><tbody>`)
		empty := true
		for _, fr := range frows {
			row := fr.row
			{
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
				if fr.gp != "" && fr.gp != "(none)" {
					attr += ` data-gp="` + htmlEscape(fr.gp) + `"`
				}
				attr += ` data-mod="` + htmlEscape(rowModule(row)) + `"`
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
				attr += ` data-need="` + htmlEscape(rowNeed(row)) + `"`
				// brief: a SHORT one-liner or empty. A description-like column wins (<=110 chars);
				// else the statement only when it is itself brief (<=110) and differs from the name;
				// else empty (a long EARS statement is not a brief - it shows in the expand).
				// Statement-once: whatever the row shows, the expand
				// never repeats - see the detail row below.
				brief := ""
				if briefCol >= 0 && briefCol < len(row.Cells) {
					if v := strings.TrimSpace(row.Cells[briefCol]); v != "" && len(v) <= 110 {
						brief = v
					}
				}
				if brief == "" && row.Head != "" && len(row.Head) <= 110 && row.Head != name {
					brief = row.Head
				}
				bodyTxt := stripLeadingStatement(row.Body, row.Head)
				if brief == "" {
					brief, bodyTxt = promoteBrief(name, row.Head, bodyTxt)
				}
				tri := ""
				if expandable {
					cls += " qt-exp"
					tri = `<span class="utri" aria-hidden="true"></span>`
				}
				b.WriteString(`<tr class="` + htmlEscape(cls) + `"` + attr + `><td>` + tri + htmlEscape(name) + `</td><td class="ubrief">` + htmlEscape(brief) + `</td>`)
				for _, ci := range enumCols {
					v := ""
					if ci < len(row.Cells) {
						v = row.Cells[ci]
					}
					b.WriteString(`<td class="uenum">` + htmlEscape(v) + `</td>`)
				}
				if viewCols > 0 {
					pill := ""
					if tok := viewTok[row.ID]; tok != "" {
						pill = `<button type="button" class="upill" data-view="` + htmlEscape(tok) + `">view</button>`
					}
					b.WriteString(`<td class="uview">` + pill + `</td>`)
				}
				if openCols > 0 {
					pill := ""
					if openTok[row.ID] {
						pill = `<a class="upill gdeck" href="#` + htmlEscape(row.ID) + `" data-goto="` + htmlEscape(row.ID) + `">open the slides</a>`
					}
					b.WriteString(`<td class="gopen">` + pill + `</td>`)
				}
				b.WriteString(`</tr>`)
				if expandable {
					// statement-once: the expand shows ONLY what the
					// row does not show. The statement renders here exactly when the brief did
					// not carry it; a cell repeating the statement, the brief, or the name is
					// skipped; a body that opens by restating the statement loses that prefix,
					// and a body paragraph promoted into the brief leaves the body.
					b.WriteString(`<tr class="udetail" hidden><td colspan="` + itoa(2+len(enumCols)+viewCols+openCols) + `">`)
					if row.Head != "" && row.Head != name && row.Head != brief {
						b.WriteString(`<p class="stmt">` + htmlEscape(row.Head) + `</p>`)
					}
					for ci := 1; ci < len(r.Columns) && ci < len(row.Cells); ci++ {
						v := strings.TrimSpace(row.Cells[ci])
						if v == "" || v == brief || v == row.Head || v == name {
							continue
						}
						shown := false // an enum value already renders as a visible column (statement-once)
						for _, ec := range enumCols {
							if ec == ci {
								shown = true
							}
						}
						if shown {
							continue
						}
						// a URL value renders as a live link (references carry the only legal external URL)
						if strings.HasPrefix(v, "http://") || strings.HasPrefix(v, "https://") {
							b.WriteString(`<p class="ufield"><span class="ufl">` + htmlEscape(r.Columns[ci]) + `:</span> <a href="` + htmlEscape(v) + `">` + htmlEscape(v) + `</a></p>`)
							continue
						}
						b.WriteString(`<p class="ufield"><span class="ufl">` + htmlEscape(r.Columns[ci]) + `:</span> ` + htmlEscape(row.Cells[ci]) + `</p>`)
					}
					b.WriteString(`<p class="meta">` + htmlEscape(row.ID) + `</p>`)
					// a verification row links its LATEST recorded result (req-vv-result-links):
					// the verdict store's entry, opened in place; no record says so honestly
					if rn, isNode := nodes[row.ID]; isNode && rn.Type == "test" {
						if v, hasRec := verdictLoad()[row.ID]; hasRec {
							res := "fail"
							if v.Result {
								res = "pass"
							}
							b.WriteString(`<details class="vvres"><summary>result: ` + res + ` · ` + itoa(int(v.Ms)) + `ms</summary>` +
								`<p class="meta">the latest recorded run — build ` + htmlEscape(shortHash(v.Build)) + `, input ` + htmlEscape(shortHash(v.Input)) + `</p></details>`)
						} else {
							b.WriteString(`<p class="meta vvres-none">no recorded result yet</p>`)
						}
					}
					if bodyTxt != "" {
						// item-body headings render compact (base 3: `## x` = h4) - detail
						// labels inside the expand, never book sections.
						b.WriteString(`<div data-layer="informative">` + mdLiteAt(bodyTxt, 3) + `</div>`)
					}
					b.WriteString(`</td></tr>`)
				}
			}
		}
		b.WriteString(`</tbody></table>`)
		if empty {
			b.WriteString(`<p class="meta">no rows yet — the query renders as items arrive</p>`)
		} else {
			// the enum columns are pill facets above the table; only the shared
			// controls footer lives below.
			b.WriteString(utableControls(r.PageSize))
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
			// larger.
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
		// structural models in the design output chapter (go-model-render)
		return renderModelFigure(strings.TrimSpace(strings.TrimPrefix(kind, "model")), nodes)
	}
	if kind == "model-kinds" {
		// the per-kind catalog: template prose, small render, linked uses; unused
		// kinds absent — derived from the kind registry (go-models-complete-book)
		return renderModelKindsCatalog(nodes)
	}
	if kind == "models-table" {
		// the structural-models section table: one row per declared model,
		// figure in the expand (go-model-render)
		return renderModelsTable(nodes)
	}
	if kind == "design-regions" {
		// the detailed-design section table: one row per design element
		return renderDesignRegions(nodes)
	}
	if kind == "sample-register" {
		return renderSampleRegister()
	}
	if kind == "raid-matrix" {
		// the RAID bubble matrix: impact x probability, kind colors (go-raid-matrix)
		return renderRaidMatrix(nodes)
	}
	if kind == "project-timeline" {
		// the BOOK frame of the shared timeline (go-timeline-frames)
		return renderProjectTimeline(nodes)
	}
	switch kind {
	case "context-model":
		// design: go-context-neighbours  implements: req-interactive-figures.3
		// The context model derives from the modeled neighbour notes, type neighbour, id nbr-<name>: one border-connected node per note, sorted for determinism, never an invented actor. direction `in`, or none, feeds the system and sits LEFT. `out` consumes from it and sits RIGHT. With no neighbour notes, the figure says so. rectBorder ends every connector at the node's border, so no line crosses the centre node.
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
			return `<p class="meta">no neighbour notes yet — the context model renders as nbr- notes arrive</p>`
		}
		sortStrings(ins)
		sortStrings(outs)
		// each boundary line carries its interface note: the label rides the
		// connector, the click opens the note (the c16 card-4 ruling)
		iface := map[string][2]string{}
		if edges, err := LoadConnections(SPEC); err == nil {
			for _, e := range edges {
				if e.Kind != "interface" {
					continue
				}
				for _, end := range []string{e.Src, e.Dst} {
					if strings.HasPrefix(end, "nbr-") {
						a := strings.TrimPrefix(end, "nbr-")
						if _, seen := iface[a]; !seen && e.Note != "" {
							lb := nodes[e.Note].Statement
							if ci := strings.Index(lb, ":"); ci > 0 {
								lb = lb[:ci]
							}
							iface[a] = [2]string{e.Note, lb}
						}
					}
				}
			}
		}
		// the model is the familiar-but-secondary view: the neighbours table above
		// carries the detail, so the graphic renders capped, not page-wide
		return `<div class="ctx-model">` + svgContextModel(brand(), ins, outs, contextModelRoute(nodes), iface) + `</div>`
		// enddesign
	case "input-register":
		return renderInputRegister(nodes)
	case "block-tree":
		// design: go-block-tree-design  implements: req-derived-boards.5
		// The block tree draws the SYSTEM's design elements, code-marker designs and des- notes, never the book's own chapters. Otherwise every project gets a picture of its document structure in its architecture chapter.
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
		// design: go-results-exception  implements: req-derived-boards.3
		// Ledger-state views are FIG kinds, never base queries. State lives in the ledger, not frontmatter. The green mass summarizes as a count. Failures and accepted deviations render prominently, by exception, the lab rule.
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
	case "onion":
		return renderOnion(nodes)
	case "readme":
		// the project README rendered as the home chapter: the first page the reader
		// sees. Improve the README itself later; the book just projects it.
		raw, err := os.ReadFile(filepath.Join(ROOT, "README.md"))
		if err != nil || strings.TrimSpace(string(raw)) == "" {
			return `<p class="meta">no README.md at the project root yet</p>`
		}
		return renderReadme(string(raw))
	case "trace-graph":
		return renderTraceGraph(nodes)
	case "vv-exceptions":
		// design: go-vv-exceptions  implements: req-compact-derived.2, req-compact-derived.1
		// The verdict-first block (the no-green-ocean law): the verified mass is
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
				if n.Retired != "" || n.Deferred != "" {
					continue // out of scope by recorded ruling — not a verification item
				}
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
			// read it as N/N and make it green
			b.WriteString(`<p class="stmt state-ok"><strong>✓ ` + itoa(len(reqIDs)) + ` / ` + itoa(len(reqIDs)) + ` requirements verified.</strong></p>` + "\n")
		} else {
			b.WriteString(`<p class="stmt state-suspect"><strong>` + itoa(len(reqIDs)-len(missing)) + ` / ` + itoa(len(reqIDs)) +
				` requirements verified — ` + itoa(len(missing)) + ` unverified:</strong></p>` + "\n")
			b.WriteString(`<table class="q-table" data-layer="derived"><thead><tr><th scope="col">requirement</th><th scope="col">statement</th><th scope="col">recorded reason</th></tr></thead><tbody>` + "\n")
			for _, id := range missing {
				// the no-test policy (req-vv-no-test-policy): the recorded reason renders
				// beside the item; an unexplained one shows AS the defect it is
				reason := noTestReason(nodes[id])
				cell := htmlEscape(reason)
				if reason == "" {
					cell = `<span class="state-fail">unexplained — record the reason</span>`
				}
				b.WriteString(`<tr class="state-suspect"><td>` + htmlEscape(id) + `</td><td>` + htmlEscape(nodes[id].Statement) + `</td><td>` + cell + `</td></tr>` + "\n")
			}
			b.WriteString("</tbody></table>\n")
		}
		b.WriteString("</div>\n")
		return b.String()
		// enddesign
	case "project-table":
		// design: go-project-record  implements: req-decision-rendering.2
		// The milestones table is SLIM:
		// timeline order and the iteration name in the row, the expand a short introduction
		// only. The decisions and the candidate matrices live OUT in the one decisions
		// table (fig: decisions-table); each iteration's record stays reachable through that
		// table's iteration filter, linked from every expand.
		sm := StatusMap(nodes)
		var b strings.Builder
		b.WriteString(`<div class="utable" id="ut` + itoa(figNext()) + `">`)
		b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">iteration</th><th scope="col">gates</th></tr></thead><tbody>` + "\n")
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
			b.WriteString(`<tr class="urow qt-exp" data-node="` + htmlEscape(v) + `" data-text="` + attesc(htmlEscape(strings.ToLower(v))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(v) + `</td><td class="ubrief">` + itoa(done) + `/` + itoa(total) + `</td></tr>` + "\n")
			b.WriteString(`<tr class="udetail" hidden><td colspan="2">`)
			if intro := iterationIntro(v); intro != "" {
				b.WriteString(`<div data-layer="informative">` + mdLiteAt(intro, 3) + `</div>`)
			} else {
				b.WriteString(`<p class="meta">no introduction recorded</p>`)
			}
			// the iteration link SELECTS: it navigates to the one decisions table AND
			// applies this iteration's facet pill (data-facet/data-fv ride the same
			// upills machinery; the delegated main handler wires them).
			b.WriteString(`<p class="meta"><a href="#decisions-table" data-goto="decisions-table" data-facet="diter" data-fv="` + htmlEscape(v) + `">this iteration's decisions — the decisions table, filtered to ` + htmlEscape(v) + `</a></p>`)
			b.WriteString(`</td></tr>` + "\n")
		}
		b.WriteString("</tbody></table></div>\n")
		return b.String()
		// enddesign
	case "decisions-table":
		return renderDecisionsTable(nodes)
	case "asr-list":
		return renderAsrList(nodes)
	case "guides-table":
		return renderGuidesTable(nodes)
	case "views-home":
		return renderViewsHome(nodes)
	}
	return `<p class="missing">unknown figure kind: ` + htmlEscape(kind) + `</p>`
}

// archiveBodyMemo caches parsed archive containers for body lookups (one read per
// archive per process; the render stays deterministic - the memo only avoids re-reads).
var archiveBodyMemo = map[string]map[string]string{}

// nodeBodyOf returns a node's body prose - from its file when it exists, else from
// its compacted archive entry (the synthetic path names the original home).
func nodeBodyOf(n Node) string {
	if _, err := os.Stat(n.Path); err == nil {
		return nodeBodyProse(n.Path)
	}
	iter := iterOf(n.Path)
	ap := filepath.Join(SPEC, "iterations", iter, archiveName)
	bodies, ok := archiveBodyMemo[ap]
	if !ok {
		bodies = map[string]string{}
		if raw, err := os.ReadFile(ap); err == nil {
			for _, e := range splitArchive(raw) {
				parts := strings.SplitN(string(e.raw), "---", 3)
				if len(parts) >= 3 {
					bodies[e.rel] = strings.TrimSpace(parts[2])
				}
			}
		}
		archiveBodyMemo[ap] = bodies
	}
	if rel, err := filepath.Rel(filepath.Join(SPEC, "iterations", iter), n.Path); err == nil {
		return bodies[filepath.ToSlash(rel)]
	}
	return ""
}

// iterationIntro reads an iteration's short introduction - the body prose of its
// iteration.md, live or from the compacted archive entry.
func iterationIntro(v string) string {
	p := filepath.Join(SPEC, "iterations", v, "iteration.md")
	if _, err := os.Stat(p); err == nil {
		return strings.TrimSpace(nodeBodyProse(p))
	}
	raw, err := os.ReadFile(filepath.Join(SPEC, "iterations", v, archiveName))
	if err != nil {
		return ""
	}
	for _, e := range splitArchive(raw) {
		if e.rel != "iteration.md" {
			continue
		}
		parts := strings.SplitN(string(e.raw), "---", 3)
		if len(parts) >= 3 {
			return strings.TrimSpace(parts[2])
		}
	}
	return ""
}

// mintedSlug reports whether an id's tail looks auto-minted (the slug quack mint
// stamps when no --id is given): one dash-free token, never a worded slug.
func mintedSlug(id string) bool {
	rest := id
	if i := indexByte(id, '-'); i > 0 && readerKindPrefixes[id[:i]] {
		rest = id[i+1:]
	}
	return !strings.Contains(rest, "-")
}

// decisionTitle renders the human title of a decision - never a hash slug.
// A worded id humanizes; an auto-minted slug falls back to the
// statement, the one human line every decision carries.
func decisionTitle(n Node) string {
	if mintedSlug(n.ID) {
		return n.Statement
	}
	return humanizeID(n.ID)
}

// decisionType folds the recorded kind and the strategy tag into the rendered TYPE
// column: project | strategy | architecture | general. A kind-less decision renders
// honestly as "general" - display only, the node keeps its empty kind (the old fold
// relabeled the everyday majority as architecture and hid it).
func decisionType(n Node) string {
	if n.Kind == "project" {
		return "project"
	}
	for _, t := range basePropsOf(n.Path).lists["tags"] {
		if t == "strategy" {
			return "strategy"
		}
	}
	if n.Kind == "" {
		return "general"
	}
	return n.Kind
}

// decisionArchitectural is the membership rule for the non-table surfaces (the book
// trace graph, a model's informed-by list): a decision belongs only when its frontmatter
// kind is architecture. The display fold that renders a kind-less decision as "general"
// is a ch9 TYPE-column concern; it never feeds these surfaces. A kind-less, project, risk,
// or quality decision reads in the project chapter's table, never in the trace graph.
func decisionArchitectural(n Node) bool {
	return decisionType(n) == "architecture"
}

// decisionIteration derives the iteration a decision belongs to: the recorded
// decided_in field FIRST (mint stamps it; the one-time backfill filled history),
// else its own archive home when it was recorded inside one, else the iteration
// of the candidates it claimed, else the iteration of the nodes it ADDRESSES (a
// decision minted into the global decisions folder belongs to the iteration whose
// inputs it decided; the ledger cannot supply this - decisions are content, never
// blessed, so no event carries their id), else "-" (nothing places it).
func decisionIteration(n Node, nodes map[string]Node) string {
	if n.DecidedIn != "" {
		return n.DecidedIn
	}
	if rel, err := filepath.Rel(SPEC, n.Path); err == nil {
		parts := strings.Split(filepath.ToSlash(rel), "/")
		if len(parts) > 1 && parts[0] == "iterations" {
			return parts[1]
		}
	}
	iterOfNode := func(id string) string {
		cn, ok := nodes[id]
		if !ok {
			cn, ok = nodes[subAddrBase(id)]
		}
		if !ok {
			return ""
		}
		rel, err := filepath.Rel(SPEC, cn.Path)
		if err != nil {
			return ""
		}
		parts := strings.Split(filepath.ToSlash(rel), "/")
		if len(parts) > 1 && parts[0] == "iterations" {
			return parts[1]
		}
		return ""
	}
	for _, refs := range [][]string{append(append([]string{}, n.Chosen...), n.Rejected...), n.Addresses} {
		var iters []string
		for _, c := range refs {
			if it := iterOfNode(c); it != "" {
				iters = append(iters, it)
			}
		}
		sortStrings(iters)
		if len(iters) > 0 {
			return iters[0]
		}
	}
	return "-"
}

// design: go-no-test-policy  implements: req-vv-no-test-policy
// A verification item with NO test must carry its recorded reason. The reason is the
// item's rationale body. A bare TODO (the mint prefill) records nothing. noTestReason
// extracts it for the verdict-first render, and noTestPolicyFindings is the CHECK: one
// finding per unverified requirement whose reason is missing or TODO. It runs over
// fixtures and over this workspace alike, so the policy enforces itself in the battery.
func noTestReason(n Node) string {
	body := nodeBodyOf(n)
	if i := strings.Index(body, "## Rationale"); i >= 0 {
		body = body[i:]
		if j := strings.IndexByte(body, '\n'); j >= 0 {
			body = body[j+1:]
		} else {
			body = ""
		}
	}
	line := ""
	for _, l := range strings.Split(body, "\n") {
		if t := strings.TrimSpace(l); t != "" && !strings.HasPrefix(t, "#") {
			line = t
			break
		}
	}
	if line == "" || strings.HasPrefix(strings.ToUpper(line), "TODO") {
		return ""
	}
	return line
}

func noTestPolicyFindings(nodes map[string]Node) []string {
	verified := map[string]bool{}
	for _, n := range nodes {
		if n.Type == "test" {
			for _, r := range n.Verifies {
				verified[r] = true
			}
		}
	}
	var fs []string
	for id, n := range nodes {
		if n.Type != "requirement" || verified[id] {
			continue
		}
		if n.Retired != "" || n.Deferred != "" {
			continue // the retirement/defer stamp IS the recorded reason
		}
		if noTestReason(n) == "" {
			fs = append(fs, id+": no verifying test and no recorded reason (a bare TODO records nothing)")
		}
	}
	sortStrings(fs)
	return fs
}

// enddesign

// design: go-decisions-table  implements: req-decision-rendering.2, req-decision-rendering.3, req-candidate-decisions.2
// There is ONE decisions table: every project, strategy, and architecture decision in one reader table, with human titles, never hash-slug ids. The TYPE renders as a column, with pill facets over type AND iteration. The row expand carries the rationale, the addressed requirements as links, and the candidates the decision weighed: the per-axis rating matrix plus each rejected candidate's reason (q-candidates-placement, decided). Waivers stay with V&V. The verdict scan walks adr ids SORTED. A map-order walk would render a double-claimed candidate nondeterministically. The double claim itself is a lint finding (candidateClaimFindings).
func renderDecisionsTable(nodes map[string]Node) string {
	var adrIDs []string
	for id, n := range nodes {
		if n.Type == "adr" && n.Kind != "waiver" {
			adrIDs = append(adrIDs, id)
		}
	}
	sortStrings(adrIDs)
	if len(adrIDs) == 0 {
		return `<p class="meta">no recorded decisions yet — the table renders as they arrive</p>`
	}
	var allIDs []string
	for id, n := range nodes {
		if n.Type == "adr" {
			allIDs = append(allIDs, id)
		}
	}
	sortStrings(allIDs)
	verdict := func(id string) string {
		for _, aid := range allIDs {
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
	types := map[string]int{}
	iters := map[string]int{}
	for _, id := range adrIDs {
		types[decisionType(nodes[id])]++
		iters[decisionIteration(nodes[id], nodes)]++
	}
	var b strings.Builder
	b.WriteString(`<div class="utable" id="decisions-table">`)
	pills := func(facet, label string, cnt map[string]int) {
		var vals []string
		for k := range cnt {
			vals = append(vals, k)
		}
		sortStrings(vals)
		b.WriteString(`<div class="upills" data-facet="` + facet + `"><span class="pilllbl">` + label + `</span><button type="button" class="upill on" data-fv="*">all</button>`)
		for _, v := range vals {
			b.WriteString(` <button type="button" class="upill" data-fv="` + htmlEscape(v) + `">` + htmlEscape(v) + ` <span class="meta">(` + itoa(cnt[v]) + `)</span></button>`)
		}
		b.WriteString(`</div>`)
	}
	pills("dtype", "type", types)
	if len(iters) >= 2 {
		pills("diter", "iteration", iters)
	}
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">decision</th><th scope="col">type</th><th scope="col">iteration</th></tr></thead><tbody>` + "\n")
	for _, id := range adrIDs {
		n := nodes[id]
		dt, di := decisionType(n), decisionIteration(n, nodes)
		title := decisionTitle(n)
		b.WriteString(`<tr class="urow qt-exp" data-node="` + htmlEscape(id) + `" data-dtype="` + htmlEscape(dt) + `" data-diter="` + htmlEscape(di) + `" data-text="` + attesc(htmlEscape(strings.ToLower(title+" "+n.Statement+" "+id))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(title) + `</td><td class="uenum">` + htmlEscape(dt) + `</td><td class="uenum">` + htmlEscape(di) + `</td></tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="3">`)
		if n.Statement != title {
			b.WriteString(`<p class="stmt">` + htmlEscape(n.Statement) + `</p>`)
		}
		if len(n.Addresses) > 0 {
			b.WriteString(`<p class="ufield"><span class="ufl">addresses:</span> `)
			for i, a := range n.Addresses {
				if i > 0 {
					b.WriteString(", ")
				}
				b.WriteString(nodeLinkHTML(a, nodes))
			}
			b.WriteString(`</p>`)
		}
		b.WriteString(`<p class="meta">` + htmlEscape(id) + `</p>`)
		if bodyTxt := stripLeadingStatement(nodeBodyOf(n), n.Statement); bodyTxt != "" {
			b.WriteString(`<div data-layer="informative">` + mdLiteAt(bodyTxt, 3) + `</div>`)
		}
		// the derived Pugh matrix (go-pugh-render): signs against the datum, weighted
		// totals, the winner from the chosen edge — rendered when the decision
		// declares its datum; the raw per-axis matrix below stays the expand.
		if pm := renderPughMatrix(n, nodes); pm != "" {
			b.WriteString(pm)
		}
		// the considered alternatives (q-candidates-placement, decided): the per-axis
		// rating matrix over this decision's claimed candidates, then each rejected
		// candidate's reason from its own note.
		var cands []Node
		for _, c := range append(append([]string{}, n.Chosen...), n.Rejected...) {
			if cn, ok := nodes[c]; ok {
				cands = append(cands, cn)
			}
		}
		for i := 1; i < len(cands); i++ {
			for j := i; j > 0 && (cands[j].Axis < cands[j-1].Axis || (cands[j].Axis == cands[j-1].Axis && cands[j].ID < cands[j-1].ID)); j-- {
				cands[j], cands[j-1] = cands[j-1], cands[j]
			}
		}
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
			b.WriteString(`<table class="q-table" data-layer="derived"><caption>considered alternatives — ` + htmlEscape(axis) + `</caption><thead><tr><th scope="col">candidate</th>`)
			for _, c := range crits {
				b.WriteString(`<th scope="col">` + htmlEscape(c) + `</th>`)
			}
			b.WriteString(`<th scope="col">verdict</th></tr></thead><tbody>` + "\n")
			for k := ai; k < aj; k++ {
				b.WriteString("<tr><td>" + htmlEscape(cands[k].Statement) + "</td>")
				for _, c := range crits {
					b.WriteString("<td>" + htmlEscape(cands[k].Maps["ratings"][c]) + "</td>")
				}
				b.WriteString("<td>" + htmlEscape(verdict(cands[k].ID)) + "</td></tr>\n")
			}
			b.WriteString("</tbody></table>\n")
			ai = aj
		}
		for _, c := range n.Rejected {
			cn, ok := nodes[c]
			if !ok {
				continue
			}
			if reason := strings.TrimSpace(nodeBodyOf(cn)); reason != "" {
				b.WriteString(`<p class="ufield"><span class="ufl">rejected — ` + htmlEscape(cn.Statement) + `:</span></p><div data-layer="informative">` + mdLiteAt(reason, 3) + `</div>`)
			}
		}
		b.WriteString(`</td></tr>` + "\n")
	}
	b.WriteString("</tbody></table>")
	b.WriteString(utableControls(0))
	b.WriteString(`</div>` + "\n")
	return b.String()
}

// enddesign

// design: go-asr-list  implements: req-decision-rendering.2, req-drivers-derived
// The drivers section is GENERATED as a reader TABLE, the same table law as every derived view. A requirement joins it as the DERIVED UNION. It is addressed by at least one kind:architecture ADR, self-maintaining since the edges already exist, or it carries the `architecturally-significant` hand tag, the judgment residue no ADR touched. Each derived row's expand names its deciding ADR(s), and the register-row link stays. An empty table renders honestly: the union is derivation, never renderer guesswork.

// driversUnion computes requirement -> deciding kind:architecture ADR ids. A hand-tagged
// requirement joins with an empty list; a requirement with neither stays absent.
func driversUnion(nodes map[string]Node) map[string][]string {
	u := map[string][]string{}
	for id, n := range nodes {
		if n.Type != "adr" || decisionType(n) != "architecture" {
			continue
		}
		for _, q := range n.Addresses {
			t := q
			if _, ok := nodes[t]; !ok {
				t = subAddrBase(q)
			}
			if rn, ok := nodes[t]; ok && rn.Type == "requirement" {
				u[t] = append(u[t], id)
			}
		}
	}
	for id, n := range nodes {
		if n.Type != "requirement" {
			continue
		}
		for _, t := range basePropsOf(n.Path).lists["tags"] {
			if t == "architecturally-significant" {
				if _, ok := u[id]; !ok {
					u[id] = []string{}
				}
			}
		}
	}
	for _, adrs := range u {
		sortStrings(adrs)
	}
	return u
}

func renderAsrList(nodes map[string]Node) string {
	union := driversUnion(nodes)
	ids := make([]string, 0, len(union))
	for id := range union {
		ids = append(ids, id)
	}
	sortStrings(ids)
	if len(ids) == 0 {
		return `<p class="meta">no driver derives yet — a requirement joins when a kind:architecture ADR addresses it, or the owner hand-tags it architecturally-significant</p>`
	}
	var b strings.Builder
	b.WriteString(`<div class="utable" id="drivers-table" data-layer="derived">`)
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">driver</th><th scope="col">brief</th></tr></thead><tbody>` + "\n")
	for _, id := range ids {
		n := nodes[id]
		name := humanizeID(id)
		brief := ""
		if len(n.Statement) <= 110 {
			brief = n.Statement
		} else if lead, sub := splitChapterTitle(n.Statement); sub != "" && len(lead) <= 110 {
			brief = lead
		}
		b.WriteString(`<tr class="urow qt-exp" data-node="` + htmlEscape(id) + `" data-text="` + attesc(htmlEscape(strings.ToLower(name+" "+n.Statement+" "+id))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(name) + `</td><td class="ubrief">` + htmlEscape(brief) + `</td></tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="2">`)
		if n.Statement != "" && n.Statement != brief {
			b.WriteString(`<p class="stmt">` + htmlEscape(n.Statement) + `</p>`)
		}
		b.WriteString(`<p class="ufield"><span class="ufl">register row:</span> ` + nodeLinkHTML(id, nodes) + `</p>`)
		if adrs := union[id]; len(adrs) > 0 {
			var links []string
			for _, a := range adrs {
				links = append(links, nodeLinkHTML(a, nodes))
			}
			b.WriteString(`<p class="ufield"><span class="ufl">decided by:</span> ` + strings.Join(links, ", ") + `</p>`)
		} else {
			b.WriteString(`<p class="ufield"><span class="ufl">decided by:</span> owner hand-tag (no ADR yet)</p>`)
		}
		b.WriteString(`<p class="meta">` + htmlEscape(id) + `</p></td></tr>` + "\n")
	}
	b.WriteString("</tbody></table>")
	b.WriteString(utableControls(0))
	b.WriteString(`</div>` + "\n")
	return b.String()
}

// enddesign

// renderDesignRegions is the detailed-design section body (`fig: design-regions`):
// one expandable row per design element of the loaded graph - the code-derived
// design regions plus any authored des- notes - sorted by id. The row carries the
// element's name and its responsibility (brief-promoted); the expand holds the full
// responsibility, the file the region lives in (files are themes, secondary info),
// and the implements links. Same table law as every other derived view.
func renderDesignRegions(nodes map[string]Node) string {
	var ids []string
	for id, n := range nodes {
		if n.Type == "design" {
			ids = append(ids, id)
		}
	}
	sortStrings(ids)
	if len(ids) == 0 {
		return `<p class="meta">no design elements yet — the table renders as design regions arrive</p>`
	}
	// briefs first: a responsibility column that is EMPTY across every row hides
	// (req-onion-interfaces) - an all-blank column is noise, not information
	briefOf := map[string]string{}
	anyBrief := false
	for _, id := range ids {
		resp := strings.TrimSpace(nodes[id].Statement)
		brief := ""
		if len(resp) <= 110 {
			brief = resp
		} else if lead, sub := splitChapterTitle(resp); sub != "" && len(lead) <= 110 {
			brief = lead
		}
		briefOf[id] = brief
		if brief != "" {
			anyBrief = true
		}
	}
	cols := 2
	if !anyBrief {
		cols = 1
	}
	var b strings.Builder
	b.WriteString(`<div class="utable" id="design-regions" data-layer="derived">`)
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">element</th>`)
	if anyBrief {
		b.WriteString(`<th scope="col">responsibility</th>`)
	}
	b.WriteString(`</tr></thead><tbody>` + "\n")
	for _, id := range ids {
		n := nodes[id]
		resp := strings.TrimSpace(n.Statement)
		brief := briefOf[id]
		file := n.Path
		if rel, err := filepath.Rel(ROOT, n.Path); err == nil {
			file = filepath.ToSlash(rel)
		}
		// visible text escapes QUOTES too (attesc on top of htmlEscape): a design
		// statement may legitimately name an artifact signature like the comments
		// island's id attribute - rendered with &quot; it reads the same and never
		// counterfeits the artifact inside the content region (comment-dom-static).
		b.WriteString(`<tr class="urow qt-exp" data-node="` + htmlEscape(id) + `" data-text="` + attesc(htmlEscape(strings.ToLower(id+" "+resp+" "+file))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(id) + `</td>`)
		if anyBrief {
			b.WriteString(`<td class="ubrief">` + attesc(htmlEscape(brief)) + `</td>`)
		}
		b.WriteString(`</tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="` + itoa(cols) + `">`)
		if resp != "" && resp != brief {
			b.WriteString(`<p class="stmt">` + attesc(htmlEscape(resp)) + `</p>`)
		}
		b.WriteString(`<p class="ufield"><span class="ufl">file:</span> ` + htmlEscape(file) + `</p>`)
		if len(n.Implements) > 0 {
			b.WriteString(`<p class="ufield"><span class="ufl">implements:</span> `)
			for i, r := range n.Implements {
				if i > 0 {
					b.WriteString(", ")
				}
				b.WriteString(nodeLinkHTML(r, nodes))
			}
			b.WriteString(`</p>`)
		}
		b.WriteString(`<p class="meta">` + htmlEscape(id) + `</p></td></tr>` + "\n")
	}
	b.WriteString("</tbody></table>")
	b.WriteString(utableControls(0))
	b.WriteString(`</div>` + "\n")
	return b.String()
}

// design: go-guides-table  implements: req-chapter-placement.1, req-chapter-placement.2, req-ifu-discovery
// The guides render as ONE table: one row per guide, with the TARGET AUDIENCE as a rendered, pill-filterable column and the guide's full content in the row expand. There are never per-audience sibling subchapters. Every audience class of the project type stays visible. A class with no guide renders an honest empty row, the pull law: a guide lands the day the audience asks. The agent guide is ONE ROW, audience: agent. Its expand embeds the repo-root AGENTS.md VERBATIM at render time, read, never regenerated, so the book shows exactly the file an agent reads.
func renderGuidesTable(nodes map[string]Node) string {
	classes := typeClassSlugs(readProjectConfig().Type)
	if len(classes) == 0 {
		classes = typeClassSlugs("default")
	}
	byAud := map[string][]Node{}
	var agents []Node
	for _, n := range nodes {
		if n.Type == "guide" {
			aud := basePropsOf(n.Path).scalars["audience"]
			byAud[aud] = append(byAud[aud], n)
		}
		if n.Type == "manifest" && n.Mode == "agent" {
			agents = append(agents, n)
		}
	}
	for aud := range byAud {
		gs := byAud[aud]
		for i := 1; i < len(gs); i++ {
			for j := i; j > 0 && gs[j].ID < gs[j-1].ID; j-- {
				gs[j], gs[j-1] = gs[j-1], gs[j]
			}
		}
	}
	for i := 1; i < len(agents); i++ {
		for j := i; j > 0 && agents[j].ID < agents[j-1].ID; j-- {
			agents[j], agents[j-1] = agents[j-1], agents[j]
		}
	}
	seen := map[string]bool{}
	for _, c := range classes {
		seen[c] = true
	}
	// audiences outside the type's classes still render (never silently dropped)
	var extra []string
	for aud := range byAud {
		if !seen[aud] && aud != "" {
			extra = append(extra, aud)
		}
	}
	sortStrings(extra)
	order := append(append([]string{}, classes...), extra...)
	cnt := map[string]int{}
	for _, c := range order {
		cnt[c] = len(byAud[c])
		if c == "agent" {
			cnt[c] += len(agents)
		}
		if cnt[c] == 0 {
			cnt[c] = 1 // the honest empty row carries the class
		}
	}
	var b strings.Builder
	b.WriteString(`<div class="utable" id="guides-table">`)
	b.WriteString(`<div class="upills" data-facet="aud"><span class="pilllbl">audience</span><button type="button" class="upill on" data-fv="*">all</button>`)
	for _, c := range order {
		b.WriteString(` <button type="button" class="upill" data-fv="` + htmlEscape(c) + `">` + htmlEscape(c) + ` <span class="meta">(` + itoa(cnt[c]) + `)</span></button>`)
	}
	b.WriteString(`</div>`)
	// the TARGET AUDIENCE leads the row (the owner reads the table by audience first)
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">target audience</th><th scope="col">guide</th><th scope="col">brief</th><th scope="col"></th></tr></thead><tbody>` + "\n")
	row := func(id, name, brief, aud, expand, deck string) {
		exp := expand != ""
		cls := "urow"
		tri := ""
		if exp {
			cls += " qt-exp"
			tri = `<span class="utri" aria-hidden="true"></span>`
		}
		pill := ""
		if deck != "" {
			// a guide that IS a slide deck carries the open pill at the row's end
			pill = `<a class="upill gdeck" href="#` + htmlEscape(deck) + `" data-goto="` + htmlEscape(deck) + `">open the slides</a>`
		}
		b.WriteString(`<tr class="` + cls + `" id="` + htmlEscape(id) + `" data-node="` + htmlEscape(id) + `" data-aud="` + htmlEscape(aud) + `" data-text="` + attesc(htmlEscape(strings.ToLower(name+" "+brief+" "+aud))) + `"><td class="uenum">` + tri + htmlEscape(aud) + `</td><td>` + htmlEscape(name) + `</td><td class="ubrief">` + htmlEscape(brief) + `</td><td class="gopen">` + pill + `</td></tr>` + "\n")
		if exp {
			b.WriteString(`<tr class="udetail" hidden><td colspan="4">` + expand + `</td></tr>` + "\n")
		}
	}
	deckLink := regexp.MustCompile(`\]\(([a-z0-9-]+)\)`)
	for _, c := range order {
		for _, g := range byAud[c] {
			expand := `<p class="meta">` + htmlEscape(g.ID) + `</p>`
			if body := strings.TrimSpace(nodeBodyOf(g)); body != "" {
				expand += `<div data-layer="informative">` + mdLiteAt(body, 3) + `</div>`
			}
			deck := ""
			for _, m := range deckLink.FindAllStringSubmatch(nodeBodyOf(g), -1) {
				if t, ok := nodes[m[1]]; ok && t.Type == "manifest" && t.Mode == "deck" {
					deck = m[1]
					break
				}
			}
			row(g.ID, humanizeID(g.ID), g.Statement, c, expand, deck)
		}
		if c == "agent" {
			for _, ag := range agents {
				expand := `<p class="meta">embedded verbatim from the project root — the emitter writes this file from ` + htmlEscape(ag.ID) + `, the book never regenerates it</p>`
				if raw, err := os.ReadFile(filepath.Join(ROOT, "AGENTS.md")); err == nil {
					expand += `<pre class="uverb"><code>` + htmlEscape(string(raw)) + `</code></pre>`
				} else {
					expand += `<p class="meta">AGENTS.md not found at the project root yet</p>`
				}
				row(ag.ID, "AGENTS.md", ag.Statement, "agent", expand, "")
			}
		}
		if len(byAud[c]) == 0 && !(c == "agent" && len(agents) > 0) {
			row("guide-hole-"+c, "—", "no guide yet — one lands the day this audience asks.", c, "", "")
		}
	}
	b.WriteString("</tbody></table></div>\n")
	return b.String()
}

// enddesign

// enddesign

// design: go-views-home  implements: req-book-shell-nav.3, req-ifu-discovery, req-ifu-usecase-index
// The views home is BOOK CONTENT (`fig: views-home` in the orientation chapter). It opens with the DOCUMENT OVERVIEW: one line per chapter with its link. That line derives from the book structure at render time, the same order and numbers the shell uses, never a hand-maintained list. Then come the derived documents: the deck manifests baked into this same file, compiled from book content only, one row each with its present button. The reader views moved to the stakeholder rows, a view pill per reader. No preset table renders here. An empty population says so out loud.
func renderViewsHome(nodes map[string]Node) string {
	var chapters, decks []Node
	anyIFU := false
	for _, n := range nodes {
		if n.Type != "manifest" {
			continue
		}
		switch n.Mode {
		case "chapter", "guidance":
			chapters = append(chapters, n)
		case "deck":
			if n.Kind == "ifu" {
				// an IFU deck's one home is the intro's ifus.base table (owner
				// ruling: ONE IFU table in chapter two) - never listed here too
				anyIFU = true
				continue
			}
			decks = append(decks, n)
		}
	}
	vhless := chapterLess(nodes)
	for i := 1; i < len(chapters); i++ {
		for j := i; j > 0 && vhless(chapters[j], chapters[j-1]); j-- {
			chapters[j], chapters[j-1] = chapters[j-1], chapters[j]
		}
	}
	// the toc's NESTED entries place the decks; an unlisted deck sorts by id after
	_, nested, hasToc := tocOrderIndex(nodes)
	dpos := func(n Node) int {
		if hasToc {
			if p, ok := nested[n.ID]; ok {
				return p
			}
		}
		return 1 << 20
	}
	dless := func(a, b Node) bool {
		if pa, pb := dpos(a), dpos(b); pa != pb {
			return pa < pb
		}
		return a.ID < b.ID
	}
	for i := 1; i < len(decks); i++ {
		for j := i; j > 0 && dless(decks[j], decks[j-1]); j-- {
			decks[j], decks[j-1] = decks[j-1], decks[j]
		}
	}
	var b strings.Builder
	b.WriteString(`<div class="views-home">` + "\n")
	if len(chapters) == 0 {
		b.WriteString(`<p class="meta">no chapters yet — the overview renders as chapters arrive</p>` + "\n")
	} else {
		b.WriteString(`<ul class="ch-lines">` + "\n")
		for i, ch := range chapters {
			short, sub := splitChapterTitle(ch.Statement)
			b.WriteString(`<li><a href="#` + htmlEscape(ch.ID) + `">` + itoa(i+1) + `. ` + htmlEscape(short) + `</a>`)
			if sub != "" {
				b.WriteString(` <span class="meta">— ` + htmlEscape(sub) + `</span>`)
			}
			b.WriteString(`</li>` + "\n")
		}
		b.WriteString("</ul>\n")
	}
	if len(decks) == 0 {
		if !anyIFU { // all decks IFU: the ifus.base table below lists them - say nothing here
			b.WriteString(`<p class="meta">no derived documents yet — the shipped decks render here as they arrive</p>` + "\n")
		}
	} else {
		// the document column IS the file name; the statement is its own description
		// column (owner ruling) - a reader finds the deck by the name on disk
		b.WriteString(`<table class="q-table"><caption>Derived documents — presentations compiled from this book</caption>` +
			`<thead><tr><th>document</th><th>description</th><th>slides</th><th></th></tr></thead><tbody>` + "\n")
		for _, d := range decks {
			slides := len(parseManifestUnits(manifestBody(d.Path)))
			b.WriteString(`<tr><td>` + htmlEscape(d.ID) + `</td><td class="ubrief">` + htmlEscape(d.Statement) + `</td><td class="uenum">` + itoa(slides) +
				`</td><td><button type="button" class="present" data-deck="` + htmlEscape(d.ID) + `">present</button></td></tr>` + "\n")
		}
		b.WriteString("</tbody></table>\n")
	}
	b.WriteString("</div>\n")
	return b.String()
}

// enddesign

// design: go-deck-anchors  implements: req-deck-links.1, req-deck-links.2, req-deck-links.3, req-deck-semantics.1, req-deck-semantics.2, req-onboarding-chapter.3, req-pong-deck.3, req-deck-nav-usability, req-ifu-split-slide
// This is deck citizenship (adr-deck-anchor-fragment). Every deck keeps ONE stable, human-readable anchor: the manifest's own node id. Each slide keeps `<deck>-s<n>`. The ids derive from the manifest, never from render order, so links survive re-renders. The URL fragment rides the EXISTING hash rail. Present mode WRITES the current slide's anchor with history.replaceState, a silent write, since hashchange keeps its single reader. The rail's reader routes a fragment that lands inside a deck into present mode, on load and on change. The deck boundary is machine-legible in the raw bytes: a named region landmark carrying the slideshow roledescription. Slides are named groups, their first heading's text, else their ordinal, groups, never landmarks, so a long deck cannot become landmark soup. Decks stay OUT of the toc by construction, since the toc collects chapter manifests only. The timeline renders measured per-slide minutes (`Minutes:` unit lines) as a slim bar. Ticks mark slide STARTS, and the bar ends exactly at the LAST slide's tick, so no bar-space can read as a step after the final slide. The measured total is a text caption after the bar, outside it. An ```embed``` fence bakes its script INERT inside a <template>. Two lanes turn the text into code, both lazy relative to page load. One is the start button, the default. The other, with the `auto` marker (```embed auto), is the deck's show() on the slide's FIRST entry in present mode. One embed may add at most deckEmbedBudget bytes to the book. Over it, the executable lane is refused and a static stand-in figure says so; the slide's authored figure carries the deliverable's picture. A standalone `fig:` line INSIDE a slide body resolves to the book's own figure render. The deck reuses figures, never duplicates them by hand. The copy's id attributes get a slide prefix so the reading-flow copy keeps every anchor. A `|||` marker line splits a slide body into columns, and the first segment stays full-width, the heading lane. FACET-PRESET fragments ride this same rail. An unknown-id fragment of the shape `<base-id>--<facet>=<v1>,<v2>` scrolls to the base element and applies the named pill facet MULTI-value (setFacetMulti). Every reader of the rail delegates to the ONE router (__facetJump): the hashchange reader, the load-time jump, and bookGoto's miss lane. The router writes the fragment with history.replaceState, never a push, so repeated applications stay idempotent and spam no history. That is the deck rail's own discipline.

var deckHeadingRe = regexp.MustCompile(`(?s)<h[1-6][^>]*>(.*?)</h[1-6]>`)
var deckTagStripRe = regexp.MustCompile(`<[^>]*>`)
var embedFenceRe = regexp.MustCompile("(?s)```embed([ \t]+auto)?[ \t]*\n(.*?)\n[ \t]*```")

// deckFigLineRe matches a standalone fig: line inside a slide body - the same shape
// figRefRe accepts for a whole unit, anchored per line.
var deckFigLineRe = regexp.MustCompile(`(?m)^fig:\s*([a-z-]+(?:\s+[a-z0-9-]+)?)\s*$`)

// deckRegionAttrs names the deck boundary: a region landmark with a slideshow roledescription.
func deckRegionAttrs(dk Node) string {
	return ` role="region" aria-roledescription="slideshow" aria-label="` + attesc(htmlEscape(dk.Statement)) + `"`
}

// deckSlideAttrs names one slide: a group (never a landmark), labelled by its first
// heading when it has one, its ordinal otherwise.
func deckSlideAttrs(idx, total int, inner string) string {
	label := "slide " + itoa(idx+1) + " of " + itoa(total)
	if m := deckHeadingRe.FindStringSubmatch(inner); m != nil {
		if t := strings.TrimSpace(deckTagStripRe.ReplaceAllString(m[1], "")); t != "" {
			label = t
		}
	}
	return ` role="group" aria-roledescription="slide" aria-label="` + attesc(label) + `"`
}

// deckEmbed is one lifted ```embed fence: the script text, and whether the `auto`
// marker asked for run-on-slide-entry instead of the start button.
type deckEmbed struct {
	Code string
	Auto bool
}

// splitEmbedFences lifts every ```embed fence out of a slide body; the script texts return
// separately so the render can bake them inert.
func splitEmbedFences(body string) (string, []deckEmbed) {
	var embeds []deckEmbed
	rest := embedFenceRe.ReplaceAllStringFunc(body, func(m string) string {
		g := embedFenceRe.FindStringSubmatch(m)
		embeds = append(embeds, deckEmbed{Code: g[2], Auto: strings.TrimSpace(g[1]) != ""})
		return ""
	})
	return rest, embeds
}

// splitDeckColumns splits a slide body at `|||` marker lines: the first segment renders
// full-width (the heading lane), each further segment becomes one column.
func splitDeckColumns(body string) []string {
	var segs []string
	var cur []string
	for _, ln := range strings.Split(body, "\n") {
		if strings.TrimSpace(ln) == "|||" {
			segs = append(segs, strings.Join(cur, "\n"))
			cur = nil
			continue
		}
		cur = append(cur, ln)
	}
	return append(segs, strings.Join(cur, "\n"))
}

// deckScopeIDs prefixes every id attribute in a reused figure with the slide id, so the
// deck's copy never shadows the reading-flow copy's anchors (getElementById, bookGoto,
// and every url(#…) reference keep resolving to the chapter's copy).
func deckScopeIDs(html, sid string) string {
	return strings.ReplaceAll(html, ` id="`, ` id="`+sid+`-`)
}

// deckModelFenceRe lifts a ```mermaid fence out of a slide body: a slide may carry its
// OWN small model (the walked project's architecture), rendered exactly the way the
// book renders every declared model - same extractor, same onion/flow figure - without
// the model entering the workspace's registry (a slide illustration, not a ledger node).
var deckModelFenceRe = regexp.MustCompile("(?s)```mermaid[ \t]*\n(.*?)```")

// replaceModelFences renders each mermaid fence in place through the model pipeline,
// id-scoped to the slide; extraction lint surfaces as render findings. A layered graph
// renders through the ONE interactive onion (owner rule: one renderer for every model,
// everywhere) as a compact, instance-scoped slide instance — its ids and drill targets
// are born scoped, so it never passes deckScopeIDs (rewriting only id= attributes
// would tear the drill targets off their views).
func replaceModelFences(seg, sid, dkID string, findings *[]string) string {
	n := 0
	return deckModelFenceRe.ReplaceAllStringFunc(seg, func(m string) string {
		g, lint := extractModelGraph(deckModelFenceRe.FindStringSubmatch(m)[1])
		for _, l := range lint {
			*findings = append(*findings, "deck "+dkID+" slide model: "+l)
		}
		n++
		if len(g.Layers) > 1 {
			return strings.ReplaceAll(renderOnionFromGraph(g, sid+"m"+itoa(n)), "\n", " ")
		}
		return deckScopeIDs(strings.ReplaceAll(svgModelGraph(g), "\n", " "), sid)
	})
}

// deckEmbedBudget is the size ceiling ONE embed may add to the book. The book is a
// multi-megabyte single file; a slide's example must stay a rounding error in it.
const deckEmbedBudget = 50 * 1024

// renderDeckEmbedSlots bakes each embed inert: the script text lives HTML-escaped inside a
// <template> (parsed, never executed). Two lanes turn it into code: the start button (the
// default), or - for an `auto` embed - the deck's show() on the slide's first entry in
// present mode. Both are zero work at page load. An embed over deckEmbedBudget gets NO
// executable lane: a static stand-in figure names the refusal, and the slide's authored
// figure carries the deliverable's picture instead. at numbers the slots across one slide.
func renderDeckEmbedSlots(slideID string, embeds []deckEmbed, at *int) string {
	if len(embeds) == 0 {
		return ""
	}
	var b strings.Builder
	for _, e := range embeds {
		*at++
		id := slideID + "-e" + itoa(*at)
		if len(e.Code) > deckEmbedBudget {
			b.WriteString(`<figure class="embed-fallback" id="` + id + `"><figcaption class="meta">this example is too big to embed playable (` +
				itoa(len(e.Code)) + ` bytes; the budget is ` + itoa(deckEmbedBudget/1024) + ` KB) - the static figure stands in</figcaption></figure>` + "\n")
			continue
		}
		if e.Auto {
			b.WriteString(`<div class="embed-slot"><template id="` + id + `" data-auto="1">` + htmlEscape(e.Code) + `</template></div>` + "\n")
			continue
		}
		b.WriteString(`<div class="embed-slot"><button type="button" class="embed-start" data-embed="` + id + `">start</button>` +
			`<template id="` + id + `">` + htmlEscape(e.Code) + `</template></div>` + "\n")
	}
	return b.String()
}

// deckMinutes formats a minutes value the shortest exact way (5, 3.5). Authored
// Minutes carry at most tenths; rounding to hundredths keeps a SUM of them from
// printing float noise (5.6+1.7+2.4+0.7 must render 10.4, never 10.399999…).
func deckMinutes(v float64) string {
	return strconv.FormatFloat(math.Round(v*100)/100, 'f', -1, 64)
}

// renderDeckTimeline draws the slim elapsed-minutes bar: one tick per slide at its
// cumulative START, the bar's right edge AT the last slide's tick, the measured total
// as a caption after the bar; absent when no slide carries minutes.
func renderDeckTimeline(dkID string, units []ManifestUnit, findings *[]string) string {
	durs := make([]float64, len(units))
	seen := false
	for i, u := range units {
		if u.Minutes == "" {
			continue
		}
		v, err := strconv.ParseFloat(u.Minutes, 64)
		if err != nil || v < 0 {
			*findings = append(*findings, "deck "+dkID+" slide "+itoa(i+1)+" carries an unreadable Minutes value ('"+u.Minutes+"')")
			continue
		}
		durs[i] = v
		seen = true
	}
	if !seen {
		return ""
	}
	total := 0.0
	for _, d := range durs {
		total += d
	}
	if total <= 0 {
		return ""
	}
	// the bar spans [0, last slide's START]: the last tick sits at 100%, so nothing
	// right of the final slide can read as another step. Each tick shows its
	// elapsed-minutes NUMBER and the bar carries its "time since start" caption -
	// the timeline must READ as a timeline at a glance (owner rule).
	span := total - durs[len(durs)-1]
	var b strings.Builder
	b.WriteString(`<div class="deck-timeline" role="img" aria-label="deck timeline: ` + deckMinutes(total) + ` measured minutes">`)
	b.WriteString(`<span class="tl-cap">time since start</span>`)
	at := 0.0
	for i := range units {
		pct := 0.0
		if span > 0 {
			pct = at / span * 100
		}
		p := fmt.Sprintf("%.1f", pct)
		b.WriteString(`<span class="tl-tick" style="left:` + p + `%" title="` + deckMinutes(at) + ` min"></span>`)
		b.WriteString(`<span class="tl-num" style="left:` + p + `%">` + deckMinutes(at) + `</span>`)
		at += durs[i]
	}
	b.WriteString(`<span class="tl-total">` + deckMinutes(total) + ` min</span></div>` + "\n")
	return b.String()
}

// deckAnchorsJS: the deck half of the shell script - the window-level hooks the present
// machinery calls (enter/exit/shown), the fragment router the hash rail delegates to, the
// load-time jump, and the embed start handler.
const deckAnchorsJS = `/* deck anchors: fragments ride the existing hash rail (adr-deck-anchor-fragment) */
(function(){
 'use strict';
 function park(){Array.prototype.forEach.call(document.querySelectorAll('article.deck'),function(a){
  a.setAttribute('aria-hidden','true');
  var t=a.querySelector('.deck-timeline');if(t)t.classList.remove('tl-on');});}
 window.__deckEnter=function(d){if(!d)return;park();d.removeAttribute('aria-hidden');
  var t=d.querySelector('.deck-timeline');if(t)t.classList.add('tl-on');};
 window.__deckExit=function(){park();
  try{history.replaceState(null,'',location.pathname+location.search);}catch(_){}};
 /* leaving a slide STOPS its running embeds and re-arms their start buttons -
    re-entering the slide asks for a fresh start (owner rule) */
 function stopEmbeds(scope,except){Array.prototype.forEach.call(scope.querySelectorAll('.embed-slot'),function(sl){
  if(except&&except.contains&&except.contains(sl))return;
  if(sl.__stop){try{sl.__stop();}catch(_){}sl.__stop=null;}
  var b=sl.querySelector('button.embed-start');if(b)b.disabled=false;});}
 window.__deckShown=function(s,i){if(!s)return;
  if(s.id){try{history.replaceState(null,'','#'+s.id);}catch(_){}}
  /* an auto embed runs ONCE, on its slide's first entry - still zero work at page load */
  Array.prototype.forEach.call(s.querySelectorAll('template[data-auto]:not([data-run])'),function(h){
   h.setAttribute('data-run','1');
   try{new Function(h.content?h.content.textContent:h.textContent)();}catch(_){}});
  var d=s.closest?s.closest('article.deck'):null;if(!d)return;
  stopEmbeds(d,s);
  Array.prototype.forEach.call(d.querySelectorAll('.tl-tick'),function(t,j){t.classList.toggle('cur',j===i);});};
 window.__deckJump=function(el){if(!el)return false;
  var d=el.classList&&el.classList.contains('deck')?el:(el.closest?el.closest('article.deck'):null);
  if(!d)return false;
  var s=(el.closest&&el.closest('.slide'))||d.querySelector('.slide');
  return !!(s&&window.bookSlideTo&&window.bookSlideTo(s));};
 /* the embed stays inert in its template until the reader starts it */
 document.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('button.embed-start'):null;if(!t||t.disabled)return;
  var h=document.getElementById(t.getAttribute('data-embed'));if(!h)return;
  t.disabled=true;
  try{new Function(h.content?h.content.textContent:h.textContent)();}catch(_){t.disabled=false;}});
 /* present mode never jumps out of the slideshow: a term link shows its explanation
    as a TOAST instead (owner rule); the toast is rendered in the HTML, js only fills text */
 var tlT=null;
 document.addEventListener('click',function(e){
  var el=document.getElementById('deck-toast');if(!el)return;
  if(e.target.closest&&e.target.closest('#deck-toast')){el.hidden=true;if(tlT)clearTimeout(tlT);return;}
  if(!document.body.hasAttribute('data-present'))return;
  var t=e.target.closest?e.target.closest('.termref'):null;if(!t)return;
  if(!(t.closest&&t.closest('article.deck')))return;
  e.preventDefault();e.stopPropagation();
  var ti=document.getElementById('deck-toast-t'),tb=document.getElementById('deck-toast-b');
  if(ti)ti.textContent=t.getAttribute('data-title')||t.textContent;
  if(tb)tb.textContent=t.getAttribute('data-help')||'';
  el.hidden=false;
  if(tlT)clearTimeout(tlT);tlT=setTimeout(function(){el.hidden=true;},7000);
 },true);
 /* the facet-preset router: an unknown-id fragment <base-id>--<facet>=<v1>,<v2> scrolls
    to the base element and applies the pill preset multi-value. replaceState only -
    repeated applications stay idempotent and push no history. */
 window.__facetJump=function(frag){
  if(!frag)return false;
  var m=/^(.+)--([A-Za-z0-9_-]+)=(.*)$/.exec(frag);if(!m)return false;
  var base=document.getElementById(m[1]);if(!base)return false;
  var ut=base.classList&&base.classList.contains('utable')?base:(base.querySelector?base.querySelector('.utable'):null);
  if(!ut&&base.closest)ut=base.closest('.utable');
  var vals=m[3].split(',').filter(function(v){return v!=='';});
  if(window.bookPageTo)window.bookPageTo(base);
  if(ut&&ut.setFacetMulti)ut.setFacetMulti(m[2],vals);
  base.scrollIntoView();
  try{history.replaceState(null,'','#'+frag);}catch(_){}
  return true;};
 /* a fragment naming a deck or a slide opens the book AT that deck; an unknown id
    routes through the facet-preset router */
 if(location.hash){var el=document.getElementById(location.hash.slice(1));if(el)window.__deckJump(el);else window.__facetJump(location.hash.slice(1));}
})();
`

// enddesign

// design: go-book-glossary  implements: req-project-content-roots.1, req-spec-content-lint.6, req-reader-tables.7
// This follows the LaTeX glossaries discipline (adr-glossary-discipline) over one shared source: per-term notes in method/glossary, with frontmatter term, long, class. A USAGE is a marked link `[label](term:slug)`, never trusted plain text. The emitter renders the used-terms-only glossary chapter with back-references and expands the FIRST linked use per chapter to the long form. A link to a missing term is an error finding. A plain-text occurrence of a defined term outside a link is an ADVISORY. The meta-quarantine lint reads the SAME class field: a meta-classified term appearing in a reader chapter's authored content is flagged. The agent guide, mode `agent`, is exempt. Per-vehicle classification keeps the dogfood edge honest, since harness terms ARE domain here.
type GlossTerm struct {
	Slug, Term, Long, Class, Def string
	Aliases                      []string // Obsidian-native aliases (go-spec-content); the auto-link pass shares them
	Unit                         string   // notation symbols carry units
}

var glossaryDirOverride string // test seam

// glossaryDir: the glossary is PROJECT content under the workspace spec (req-project-content-roots.2)
// - spec/glossary for every project, quackitect included.
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

// design: go-ref-tooltips  implements: req-details-context.2
// In-book reference links in prose render as their plain label plus a small (?) marker. The marker's title carries the referent's statement or long form as the hover tooltip. A click jumps to the definition. External URLs stay real links. This runs per chapter AFTER term expansion, so the term machinery is untouched. Content notes, methods, fundamentals, references, carry their statement as the brief. A method mention in prose is a dashed-underline link; the details pane shows the brief plus the jump to the full method in the appendix.
var refTipRe = regexp.MustCompile(`<a (?:class="term" )?href="#([^"]+)">([^<]+)</a>`)

// contentTips maps every content-note slug to its one-liner - the termref brief.
func contentTips() map[string]string {
	out := map[string]string{}
	for _, kind := range []string{"methods", "fundamentals", "references"} {
		for s, c := range ReadContentNotes(kind) {
			tip := c.Statement
			if tip == "" {
				tip = c.Title
			}
			if tip != "" {
				out[s] = tip
			}
		}
	}
	return out
}

// glossHelp composes a term's data-help. The default is the short `long:` form.
// full=true (the DECK lane) appends the whole definition body as plain text: a
// present-mode toast is the reader's only surface — repeating the name helps nobody.
func glossHelp(t GlossTerm, full bool) string {
	help := t.Long
	if help == "" {
		help = t.Term
	}
	if !full {
		return help
	}
	if d := plainProse(t.Def); d != "" {
		if help != "" {
			return help + " — " + d
		}
		return d
	}
	return help
}

var htmlCommentRe = regexp.MustCompile(`(?s)<!--.*?-->`)
var mdLinkPlainRe = regexp.MustCompile(`\[([^\]]*)\]\([^)]*\)`)

// plainProse flattens a markdown definition body to one attribute-safe text line:
// comments out, links to their labels, emphasis markers dropped, whitespace collapsed.
func plainProse(md string) string {
	s := htmlCommentRe.ReplaceAllString(md, "")
	s = mdLinkPlainRe.ReplaceAllString(s, "$1")
	s = strings.NewReplacer("**", "", "`", "").Replace(s)
	return strings.Join(strings.Fields(s), " ")
}

func refTooltips(html string, nodes map[string]Node, gloss map[string]GlossTerm, tips map[string]string, full bool) string {
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
				if full {
					tip = glossHelp(t, true)
				}
			}
		} else if n, ok := nodes[target]; ok {
			tip = n.Statement
		} else if t, ok := tips[target]; ok {
			tip = t
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

// expandTermLinks rewrites term anchors, expands the first use per chapter, and collects
// usage. full=true is the DECK lane: data-help carries the whole definition (glossHelp).
func expandTermLinks(chapterID, html string, gloss map[string]GlossTerm, used map[string][]string, findings *[]string, full bool) string {
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
		help := t.Long
		if full {
			help = glossHelp(t, true)
		}
		return `<button type="button" class="termref" data-title="` + attesc(htmlEscape(t.Term)) + `" data-help="` + attesc(htmlEscape(help)) + `" data-goto="term-` + slug + `">` + label + `</button>`
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
	// ONE glossary for the whole book, spliced into the
	// FUNDAMENTALS chapter.
	// The unified reader-table anatomy: NAME plus
	// BRIEF collapsed; the expand carries the full definition and where the
	// term is used. The term-<slug> row anchors stay so term links still jump here.
	b.WriteString(`<section id="glossary" data-layer="glossary"><h2>Glossary</h2>` + "\n")
	b.WriteString(`<div class="utable">`)
	b.WriteString(`<table class="q-table u-table" data-sortable="1" data-layer="glossary"><thead><tr><th scope="col">name</th><th scope="col">brief</th></tr></thead><tbody>` + "\n")
	for _, s := range slugs {
		t := gloss[s]
		if t.Class == "notation" {
			continue // notation renders in its own derived list (go-ch2-derived)
		}
		b.WriteString(`<tr class="urow qt-exp" id="term-` + s + `" data-node="term-` + s + `" data-text="` + attesc(htmlEscape(strings.ToLower(t.Term+" "+t.Long))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(t.Term) + `</td><td class="ubrief">` + htmlEscape(t.Long) + `</td></tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="2">`)
		if d := strings.TrimSpace(t.Def); d != "" {
			b.WriteString(`<div data-layer="informative">` + mdLiteAt(d, 3) + `</div>`)
		}
		b.WriteString(`<p class="ufield"><span class="ufl">used in:</span> `)
		for i, ch := range used[s] {
			if i > 0 {
				b.WriteString(", ")
			}
			b.WriteString(`<a href="#` + htmlEscape(ch) + `">` + htmlEscape(ch) + `</a>`)
		}
		b.WriteString("</p></td></tr>\n")
	}
	b.WriteString("</tbody></table></div></section>\n")
	return b.String()
}

// design: go-ch2-derived  implements: req-chapters-canned.1
// This is the pull law of the fundamentals chapter: everything renders from USAGE alone, and an entry nothing links does not render. Usage means a link in the rendered chapters, authored or auto-linked (go-auto-link). The references and fundamentals lists are POOLED QUERIES the ch2/ch8 manifests embed, `referenced != false`, evaluated deferred over the emitter's link graph, with full bodies via `render: full` (go-base-eval). References are the ONLY legal home of an external URL (req-spec-content-lint.3), so the URL prints in that view and nowhere else. Notation and the glossary stay emitter-derived below: their term-anchor (`term-<slug>`) and first-use-expansion machinery is inherently the emitter's.

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
		// usage = an anchor OR a termref affordance (buttons carry data-goto, not href)
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
	// design: go-quarantine-scope  implements: req-spec-content-lint.7
	// This is the boundary: EVERY chapter speaks only about the system, rationales included. The guidance chapter (mode `guidance`, renders as a chapter) and the agent guide (mode `agent`) are the only self-referential surfaces.
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

// design: go-book-honesty  implements: req-book-trust.1, req-ai-provenance.2
// The book never claims more than the gates (req-book-trust.1). Every transcluded node renders its LIVE ledger state as visible text and a data attribute. A SUSPECT or unverified state carries the warning tag in the reading flow, never only styling. The provenance marks render as a drawn SVG robot column: small icons set vertically in the text margin. There is no font dependency, and each carries a machine-readable label "AI involvement: N of 3". The count comes ONLY from the stored mark, write-time truth (adr-provenance-involvement). Rendering can never show more marks than recorded, and ai:0 renders none.
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
	body := "---\nid: man-probe\ntype: manifest\nmode: chapter\nstatement: Probe chapter.\n---\n<!-- ai:3 -->\nAn inline lede unit.\n---\n[req-book-trust.1](req-book-trust.1.md) depth:2\nNote: speak slowly here\n---\n[uc-book-read](uc-book-read.md)\n"
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
	if units[1].Ref != "req-book-trust.1" || units[1].Depth != 2 || units[1].Notes != "speak slowly here" {
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
	// no global expand-all pill; the disclosure mechanism itself stays.
	if !strings.Contains(html, `hidden="until-found"`) || strings.Contains(html, `id="expand-all"`) {
		return false // the disclosure mechanism (depth 2 renders it); no global expand-all pill
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
	// a live view REACHES its matched nodes: the book shows them,
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
