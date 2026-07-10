package main

// i14_build.go — the i0014_doc_review build: reader-first book rework.
// Each design region realizes one requirement; the RED battery in i14_red.go verifies.

import (
	"os"
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
