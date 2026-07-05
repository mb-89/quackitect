package main

// design: go-facet-board  implements: req-facet-board
// The faceted coverage board (owner screenshot 2026-07-05): requirements carry multi-valued
// classification facets (phase, discipline, quality); the VOCABULARIES live in the type
// layer and derive like the stakeholder classes - default plus the union of the iterations'
// types - so the board stores no names (owner ruling). The board renders one count per
// vocabulary value; a ZERO count is a visible hole (the Hauptmerkmalliste upgraded from a
// checklist comment to live coverage). A facet value outside the vocabulary is a loud
// finding. Click-through is a CSS filter over the once-rendered register rows (DOM-static:
// the script toggles one body attribute, never creates content). Facet tagging is accepted,
// expected work the AI does - no advisory valve (owner ruling).

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var facetNames = []string{"phase", "discipline", "quality"}

var iterTypeRe = regexp.MustCompile(`(?m)^type:\s*(\S+)`)

// projectTypeNames scans the iterations for their declared types (derive over store).
func projectTypeNames() []string {
	var types []string
	iters, _ := os.ReadDir(filepath.Join(SPEC, "iterations"))
	for _, it := range iters {
		raw, err := os.ReadFile(filepath.Join(SPEC, "iterations", it.Name(), "iteration.md"))
		if err != nil {
			continue
		}
		if m := iterTypeRe.FindStringSubmatch(string(raw)); m != nil {
			types = append(types, m[1])
		}
	}
	return types
}

// FacetVocab unions the facet vocabularies of default plus the project's derived types.
func FacetVocab() map[string][]string {
	set := map[string]map[string]bool{}
	for _, f := range facetNames {
		set[f] = map[string]bool{}
	}
	for _, t := range append([]string{"default"}, projectTypeNames()...) {
		tf := typeFilePath(t)
		if tf == "" {
			continue
		}
		props := basePropsOf(tf)
		for _, f := range facetNames {
			for _, v := range props.lists[f] {
				set[f][v] = true
			}
		}
	}
	out := map[string][]string{}
	for _, f := range facetNames {
		var vals []string
		for v := range set[f] {
			vals = append(vals, v)
		}
		sortStrings(vals)
		out[f] = vals
	}
	return out
}

// facetFindings refuses facet values absent from the vocabulary - loud, never silent.
func facetFindings(nodes map[string]Node) []string {
	vocab := FacetVocab()
	inVocab := func(f, v string) bool {
		for _, w := range vocab[f] {
			if w == v {
				return true
			}
		}
		return false
	}
	var out []string
	var ids []string
	for id, n := range nodes {
		if n.Type == "requirement" && strings.HasSuffix(n.Path, ".md") {
			ids = append(ids, id)
		}
	}
	sortStrings(ids)
	for _, id := range ids {
		props := basePropsOf(nodes[id].Path)
		for _, f := range facetNames {
			for _, v := range props.lists[f] {
				if !inVocab(f, v) {
					out = append(out, "facet: requirement "+id+" carries "+f+" value '"+v+"' outside the type layer's vocabulary")
				}
			}
		}
	}
	return out
}

// renderCoverageBoard emits the counts-per-value board with zero-count holes and filter hooks.
func renderCoverageBoard(nodes map[string]Node) string {
	vocab := FacetVocab()
	counts := map[string]map[string]int{}
	for _, f := range facetNames {
		counts[f] = map[string]int{}
	}
	for _, n := range nodes {
		if n.Type != "requirement" || !strings.HasSuffix(n.Path, ".md") {
			continue
		}
		props := basePropsOf(n.Path)
		for _, f := range facetNames {
			for _, v := range props.lists[f] {
				counts[f][v]++
			}
		}
	}
	var b strings.Builder
	b.WriteString(`<div class="board" data-layer="derived">` + "\n")
	for _, f := range facetNames {
		if len(vocab[f]) == 0 {
			continue
		}
		b.WriteString(`<section class="board-col"><h2>` + htmlEscape(f) + `</h2><ul>` + "\n")
		for _, v := range vocab[f] {
			cls, n := "facet-count", counts[f][v]
			if n == 0 {
				cls += " hole" // a zero count IS the finding the board exists for
			}
			b.WriteString(`<li><button class="` + cls + `" data-target="f-` + f + `-` + htmlEscape(v) + `">` + htmlEscape(v) + ` (` + itoa(n) + `)</button></li>` + "\n")
		}
		b.WriteString("</ul></section>\n")
	}
	b.WriteString("</div>\n")
	return b.String()
}

// facetFilterCSS emits one static rule per vocabulary value - the click-through filter.
func facetFilterCSS() string {
	vocab := FacetVocab()
	var b strings.Builder
	for _, f := range facetNames {
		for _, v := range vocab[f] {
			key := "f-" + f + "-" + v
			b.WriteString(`body[data-facet="` + key + `"] tr.rowf:not(.` + key + `){display:none}`)
		}
	}
	b.WriteString(`.facet-count.hole{color:` + bookColors["suspect"] + `;font-weight:bold}`)
	b.WriteString(`.board{display:flex;gap:2rem}.board ul{list-style:none;padding:0}`)
	return b.String()
}

// enddesign
