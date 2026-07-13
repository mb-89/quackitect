package main

// i14_build.go — the i0014_doc_review build: reader-first book rework.
// Each design region realizes one requirement; the RED battery in i14_red.go verifies.

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// design: go-shell-title-card  implements: req-book-shell-nav.2
// The page header is gone and so is the standing info
// block: the spec-state root, iteration, and engine ride the title button as data
// attributes - DOM from birth - and a title click feeds the DETAILS pane like any other
// click target (window.bookDetail fills the chrome pane; the content DOM never changes).
func bookTitleAttrs(root, iteration, engineVersion string) string {
	return ` data-root="` + htmlEscape(root) +
		`" data-iteration="` + htmlEscape(iteration) +
		`" data-engine="` + htmlEscape(engineVersion) + `"`
}

// enddesign

// design: go-white-label-identity  implements: req-vehicle-white-label.1, req-vehicle-white-label.2, req-vehicle-white-label.3, req-vehicle-white-label.4
// A rendered book's identity comes from the WORKSPACE, never from the binary's invocation
// name: brand() is argv[0]-based — the right seam for console output, the wrong one for a
// published artifact (a vehicle usually drives an engine binary named quack, and its book
// must not present the engine as itself — adr-white-label-hybrid). The name source, most
// explicit first:
//   - product/brand/name.txt — the brand layer's name asset, WORKSPACE-ONLY. The engine
//     design fallback is deliberately not consulted: an engine default here would BE the leak.
//   - the overlay key's product/<name> — the vehicle's committed product home.
//   - the workspace basename.
// whiteLabelLeaks is the identity guard: it scans ONLY the identity surfaces
// (title, wordmark). Mentions in prose are legal — identity is the bar, not occurrences.

// engineCredit is the retired colophon text. It remains only so tests can assert it is absent.
const engineCredit = "engine: quackitect " + version

// productNameOf is the pure identity rule (testable): brand name asset, else the
// overlay's product/<name>, else the workspace basename.
func productNameOf(brandName, overlay, base string) string {
	if n := strings.TrimSpace(brandName); n != "" {
		return n
	}
	if ov := strings.TrimSpace(overlay); ov != "" {
		return filepath.Base(filepath.FromSlash(ov))
	}
	return base
}

// workspaceProduct resolves the CURRENT workspace's product identity.
func workspaceProduct() string {
	name := ""
	if raw, err := os.ReadFile(filepath.Join(ROOT, "product", "brand", "name.txt")); err == nil {
		name = strings.TrimSpace(string(raw))
	}
	overlay := ReadConfig(filepath.Join(ROOT, "spec", "project.toml")).Overlay
	return productNameOf(name, overlay, filepath.Base(ROOT))
}

var bookTitleIDRe = regexp.MustCompile(`<title>([^<]*) — the spec book</title>`)
var bookWordmarkIDRe = regexp.MustCompile(`id="book-title"[^>]*>([^<]*) — the spec book</button>`)

// whiteLabelLeaks names every identity surface of a rendered book that presents an
// identity other than the workspace's product (req-vehicle-white-label.4).
func whiteLabelLeaks(html, product string) []string {
	want := htmlEscape(product)
	var out []string
	for _, s := range []struct {
		surface string
		re      *regexp.Regexp
	}{{"title", bookTitleIDRe}, {"wordmark", bookWordmarkIDRe}} {
		m := s.re.FindStringSubmatch(html)
		if m == nil {
			out = append(out, s.surface+": the identity surface is missing from the rendered book")
			continue
		}
		if m[1] != want {
			out = append(out, s.surface+" presents '"+m[1]+"' as the book's identity - the workspace product is '"+product+"'")
		}
	}
	return out
}

// enddesign

// design: go-reader-name  implements: req-reader-tables.6
// The reader-facing `name` property: the node id, its kind prefix
// stripped, dashes read as spaces. Reader tables order by [name, statement] and never
// show filename, weight, or source-internal columns; the queries carry the policy,
// this helper carries the derivation.
var readerKindPrefixes = map[string]bool{
	"need": true, "uc": true, "req": true, "test": true, "adr": true, "stk": true,
	"raid": true, "crit": true, "rule": true, "asr": true, "cand": true, "guide": true,
	"budget": true, "rec": true, "ratl": true, "meth": true, "ref": true, "fund": true,
	"qual": true, "ex": true, "con": true,
	"q": true, // question nodes (go-question-nodes)
}

func humanizeID(id string) string {
	rest := id
	if i := indexByte(id, '-'); i > 0 && readerKindPrefixes[id[:i]] {
		rest = id[i+1:]
	}
	out := make([]byte, len(rest))
	for i := 0; i < len(rest); i++ {
		if rest[i] == '-' {
			out[i] = ' '
		} else {
			out[i] = rest[i]
		}
	}
	return string(out)
}

func indexByte(s string, b byte) int {
	for i := 0; i < len(s); i++ {
		if s[i] == b {
			return i
		}
	}
	return -1
}

// enddesign

// design: go-icon-density  implements: req-icon-density
// ONE AI-involvement column per unit: the unit's column carries the MAX of
// its paragraphs' recorded data-ai values; the per-paragraph record stays in the DOM,
// machine-readable. A short unit (little text) gets bottom padding so neighbouring
// columns never collide.
var dataAIRe = regexp.MustCompile(`data-ai="([0-9])"`)
var tagStripRe = regexp.MustCompile(`<[^>]+>`)

func unitAIColumn(html string) string {
	max := -1
	for _, m := range dataAIRe.FindAllStringSubmatch(html, -1) {
		if v := int(m[1][0] - '0'); v > max {
			max = v
		}
	}
	if max <= 0 {
		return ""
	}
	return aiMarkColumn(max)
}

func shortUnitClass(html string) string {
	if len(strings.TrimSpace(tagStripRe.ReplaceAllString(html, ""))) < 240 {
		return " qpad-short"
	}
	return ""
}

// enddesign

// design: go-ucfn-board  implements: req-need-scoped-views.1, req-need-scoped-views.2
// Use cases and functions merge into ONE deterministic per-need board:
// each need row expands into two columns - its functions (the need item's `functions:`
// list) and its use cases (the refines edges, lane-fed by the loader). The board is a
// query over the graph, never agent prose; empty columns say so honestly.
var needFnsRe = regexp.MustCompile(`(?m)^functions:\s*\[([^\]]*)\]`)

func needFunctions(path string) []string {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	m := needFnsRe.FindStringSubmatch(string(raw))
	if m == nil {
		return nil
	}
	var out []string
	for _, p := range strings.Split(m[1], ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func renderUcfnBoard(nodes map[string]Node) string {
	// TWO reader tables - one for the
	// use cases, one for the functions - inside the one merged
	// section. A use-case row expands to its definition; a function IS its
	// definition (verb plus noun, solution-neutral, recorded on its need item). The
	// need facet pills carry the per-need view the old board's rows gave.
	var needs []Node
	for _, n := range nodes {
		if n.Type == "need" {
			needs = append(needs, n)
		}
	}
	for i := 1; i < len(needs); i++ {
		for j := i; j > 0 && needs[j].ID < needs[j-1].ID; j-- {
			needs[j], needs[j-1] = needs[j-1], needs[j]
		}
	}
	var ucs []Node
	for _, n := range nodes {
		if n.Type == "usecase" {
			ucs = append(ucs, n)
		}
	}
	for i := 1; i < len(ucs); i++ {
		for j := i; j > 0 && ucs[j].ID < ucs[j-1].ID; j-- {
			ucs[j], ucs[j-1] = ucs[j-1], ucs[j]
		}
	}
	ucT := BaseResult{Name: "Use cases", Columns: []string{"name"}}
	var ucRows []BaseRow
	for _, u := range ucs {
		ucRows = append(ucRows, BaseRow{ID: u.ID, Cells: []string{humanizeID(u.ID)}, Head: u.Statement, Body: nodeBodyOf(u)})
	}
	ucT.Groups = []BaseGroup{{Rows: ucRows}}
	fnT := BaseResult{Name: "Functions", Columns: []string{"name", "need"}}
	var fnRows []BaseRow
	for _, nd := range needs {
		for _, f := range needFunctions(nd.Path) {
			fnRows = append(fnRows, BaseRow{Cells: []string{f, nd.ID}})
		}
	}
	fnT.Groups = []BaseGroup{{Rows: fnRows}}
	var b strings.Builder
	b.WriteString(`<div id="ucfn-board" data-layer="derived">` + "\n")
	b.WriteString(baseResultHTML([]BaseResult{ucT, fnT}, nodes, nil, nil, "ucfn"))
	b.WriteString("</div>\n")
	return b.String()
}

// enddesign

// renderInputRegister bakes THE design input register: one table over every use
// case, function, constraint, and requirement, with a `type` facet beside the
// board facets and the universal need facet. The need never sits in the body -
// node-backed rows resolve it through the trace, a function row carries its
// need explicitly (BaseRow.Need). Rows emit in type order, then by id, so the
// render stays byte-deterministic.
func renderInputRegister(nodes map[string]Node) string {
	// qualities and constraints are register TYPES, never own chapters (the
	// post-ship ch6 consolidation): the type facet filters to either, and a
	// quality row's expand carries its six-part scenario.
	typeOf := func(n Node) string {
		switch n.Kind {
		case "constraint":
			return "constraint"
		case "quality":
			return "quality"
		}
		return "requirement"
	}
	scenarioMD := func(props baseProps) string {
		fields := []struct{ key, label string }{
			{"stimulus_source", "stimulus source"}, {"stimulus", "stimulus"},
			{"artifact", "artifact"}, {"environment", "environment"},
			{"response", "response"}, {"response_measure", "response measure (the pass line)"},
		}
		var lines []string
		for _, f := range fields {
			if v := strings.TrimSpace(props.scalars[f.key]); v != "" {
				lines = append(lines, "- "+f.label+": "+v)
			}
		}
		if len(lines) == 0 {
			return ""
		}
		return "## Quality scenario\n" + strings.Join(lines, "\n") + "\n"
	}
	// file-backed nodes only - the same population a base view evaluates, so the
	// orphan lint keeps flagging a node no file and no view carries
	collect := func(nodeType string) []Node {
		var out []Node
		for _, n := range nodes {
			if n.Type != nodeType {
				continue
			}
			if _, err := os.Stat(n.Path); err != nil {
				continue
			}
			out = append(out, n)
		}
		for i := 1; i < len(out); i++ {
			for j := i; j > 0 && out[j].ID < out[j-1].ID; j-- {
				out[j], out[j-1] = out[j-1], out[j]
			}
		}
		return out
	}
	reg := BaseResult{Name: "Design input register", Columns: []string{"name", "type"}}
	var rows []BaseRow
	for _, u := range collect("usecase") {
		rows = append(rows, BaseRow{ID: u.ID, Cells: []string{humanizeID(u.ID), "use case"}, Head: u.Statement, Body: nodeBodyOf(u)})
	}
	for _, nd := range collect("need") {
		for _, f := range needFunctions(nd.Path) {
			rows = append(rows, BaseRow{Cells: []string{f, "function"}, Need: nd.ID})
		}
	}
	var cons, reqs []BaseRow
	for _, rq := range collect("requirement") {
		// the same f-<facet>-<value> row classes EvalBase stamps, so the coverage
		// board above keeps filtering this register
		props := basePropsOf(rq.Path)
		var fcs []string
		for _, f := range facetNames {
			for _, v := range props.lists[f] {
				fcs = append(fcs, "f-"+f+"-"+v)
			}
		}
		body := nodeBodyOf(rq)
		if typeOf(rq) == "quality" {
			if sc := scenarioMD(props); sc != "" {
				body = strings.TrimSpace(sc + "\n" + body)
			}
		}
		row := BaseRow{ID: rq.ID, Cells: []string{humanizeID(rq.ID), typeOf(rq)}, Head: rq.Statement, Body: body, Facets: fcs}
		if row.Cells[1] == "constraint" {
			cons = append(cons, row)
		} else {
			reqs = append(reqs, row)
		}
	}
	rows = append(rows, cons...)
	rows = append(rows, reqs...)
	reg.Groups = []BaseGroup{{Rows: rows}}
	var b strings.Builder
	b.WriteString(`<div id="input-register" data-layer="derived">` + "\n")
	b.WriteString(baseResultHTML([]BaseResult{reg}, nodes, nil, nil, "inreg"))
	b.WriteString("</div>\n")
	return b.String()
}
