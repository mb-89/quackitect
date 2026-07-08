package main

// i14_build.go — the i0014_doc_review build: reader-first book rework.
// Each design region realizes one requirement; the RED battery in i14_red.go verifies.

import (
	"os"
	"regexp"
	"strings"
)

// design: go-shell-title-card  implements: req-shell-title-card
// The page header is gone (field c1): the spec-state root, iteration, and engine move
// into a statically rendered info block inside the sidebar details card, revealed by a
// click on the book title. The shell script stays toggle-only — the card's content is
// DOM from birth, the click only flips `hidden`.
func bookTitleCardHTML(root, iteration, engineVersion string) string {
	return `<div id="book-info" hidden><dl>` +
		`<dt>state</dt><dd id="dc-root">` + htmlEscape(root) + `</dd>` +
		`<dt>iteration</dt><dd id="dc-iteration">` + htmlEscape(iteration) + `</dd>` +
		`<dt>engine</dt><dd id="dc-engine">` + htmlEscape(engineVersion) + `</dd>` +
		`</dl></div>` + "\n"
}

// enddesign

// design: go-reader-name  implements: req-reader-columns
// The reader-facing `name` property (field c11-c31): the node id, its kind prefix
// stripped, dashes read as spaces. Reader tables order by [name, statement] and never
// show filename, weight, or source-internal columns; the queries carry the policy,
// this helper carries the derivation.
var readerKindPrefixes = map[string]bool{
	"need": true, "uc": true, "req": true, "test": true, "adr": true, "stk": true,
	"raid": true, "crit": true, "rule": true, "asr": true, "cand": true, "guide": true,
	"budget": true, "rec": true, "ratl": true, "meth": true, "ref": true, "fund": true,
	"qual": true, "ex": true, "con": true,
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
// ONE AI-involvement column per unit (field c14): the unit's column carries the MAX of
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

// design: go-ucfn-board  implements: req-ch3-ucfn-merge, req-need-expand
// Use cases and functions merge into ONE deterministic per-need board (field c24/c25):
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
	var b strings.Builder
	b.WriteString(`<div id="ucfn-board" data-layer="derived">` + "\n")
	for _, nd := range needs {
		fns := needFunctions(nd.Path)
		var ucs []Node
		for _, n := range nodes {
			if n.Type != "usecase" {
				continue
			}
			for _, r := range n.Refines {
				if r == nd.ID {
					ucs = append(ucs, n)
				}
			}
		}
		for i := 1; i < len(ucs); i++ {
			for j := i; j > 0 && ucs[j].ID < ucs[j-1].ID; j-- {
				ucs[j], ucs[j-1] = ucs[j-1], ucs[j]
			}
		}
		b.WriteString(`<details class="disc ucfn-need"><summary>` + htmlEscape(nd.Statement) +
			` <span class="meta">(` + humanizeID(nd.ID) + ` · ` + itoa(len(ucs)) + ` use cases · ` + itoa(len(fns)) + ` functions)</span></summary><div class="ucfn-cols">`)
		b.WriteString(`<div><h4>functions</h4><ul class="need-fns">`)
		for _, f := range fns {
			b.WriteString("<li>" + htmlEscape(f) + "</li>")
		}
		if len(fns) == 0 {
			b.WriteString(`<li class="meta">none recorded</li>`)
		}
		b.WriteString(`</ul></div><div><h4>use cases</h4><ul class="need-ucs">`)
		for _, u := range ucs {
			b.WriteString("<li>" + htmlEscape(u.Statement) + "</li>")
		}
		if len(ucs) == 0 {
			b.WriteString(`<li class="meta">none yet</li>`)
		}
		b.WriteString(`</ul></div></div></details>` + "\n")
	}
	b.WriteString("</div>\n")
	return b.String()
}

// enddesign
