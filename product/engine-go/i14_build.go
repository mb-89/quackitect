package main

// i14_build.go — the i0014_doc_review build: reader-first book rework.
// Each design region realizes one requirement; the RED battery in i14_red.go verifies.

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// design: go-shell-title-card  implements: req-book-shell-nav.2
// The page header is gone, and so is the standing info block. The spec-state root, iteration, and engine ride the title button as data attributes, DOM from birth. A title click feeds the DETAILS pane like any other click target. window.bookDetail fills the chrome pane, and the content DOM never changes.
func bookTitleAttrs(root, iteration, engineVersion string) string {
	return ` data-root="` + htmlEscape(root) +
		`" data-iteration="` + htmlEscape(iteration) +
		`" data-engine="` + htmlEscape(engineVersion) + `"`
}

// enddesign

// design: go-white-label-identity  implements: req-vehicle-white-label.1, req-vehicle-white-label.2, req-vehicle-white-label.3, req-vehicle-white-label.4
// A rendered book's identity comes from the WORKSPACE, never from the binary's invocation name. brand() is argv[0]-based, the right seam for console output but the wrong one for a published artifact. A vehicle usually drives an engine binary named quack, and its book must not present the engine as itself (adr-white-label-hybrid). The name source, most explicit first, works like this. First is product/brand/name.txt, the brand layer's name asset, WORKSPACE-ONLY. The engine design fallback is deliberately not consulted; an engine default here would BE the leak. Second is the overlay key's product/<name>, the vehicle's committed product home. Third is the workspace basename. whiteLabelLeaks is the identity guard. It scans ONLY the identity surfaces: title, wordmark. Mentions in prose are legal; identity is the bar, not occurrences.

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
	"q":  true, // question nodes (go-question-nodes)
	"fn": true, // function nodes (go-function-nodes)
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

// design: go-register-fold  implements: req-design-input-register, req-need-scoped-views.1, req-need-scoped-views.2
// THE design input register: ONE table folding every use case, function, constraint,
// quality, and requirement. A `type` facet sits beside the board facets and the
// universal need facet, and the generic filter columns (go-filter-columns) carry both.
// The former use-cases-and-functions board is folded in here (the owner's register
// ruling), and the need facet carries the per-need view its rows gave. The need never
// sits in the body. Every node-backed row resolves it through the trace, and a function
// node's refines edge (go-function-nodes) is that path. Rows emit in type order, then
// by id, so the render stays byte-deterministic.
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
	// needs lead the register as rows (the owner's B ruling, 2026-07-19, superseding
	// the facet-only i26 rule): the user level sits above what refines it
	for _, nd := range collect("need") {
		rows = append(rows, BaseRow{ID: nd.ID, Cells: []string{humanizeID(nd.ID), "need"}, Head: nd.Statement, Body: nodeBodyOf(nd)})
	}
	for _, u := range collect("usecase") {
		rows = append(rows, BaseRow{ID: u.ID, Cells: []string{humanizeID(u.ID), "use case"}, Head: u.Statement, Body: nodeBodyOf(u)})
	}
	for _, f := range collect("function") {
		rows = append(rows, BaseRow{ID: f.ID, Cells: []string{humanizeID(f.ID), "function"}, Head: f.Statement, Body: nodeBodyOf(f)})
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

// enddesign

// design: go-sample-register  implements: req-design-input-register
// The teaching SAMPLE of the register: pong's design input rendered through the SAME
// component the live register uses, so the demo can never drift from the real look.
// The pong fixture is the repo's canonical teaching example (the five-minute IFU).
func renderSampleRegister() string {
	reg := BaseResult{Name: "Pong's design input register", Columns: []string{"name", "type"}}
	reg.Groups = []BaseGroup{{Rows: []BaseRow{
		{ID: "need-pong", Cells: []string{"pong", "need"}, Head: "a playable pong, from nothing, in minutes"},
		{ID: "uc-play-pong", Cells: []string{"play pong", "use case"}, Head: "a player opens one file and plays to five"},
		{ID: "req-paddle-control", Cells: []string{"paddle control", "requirement"}, Head: "the player moves the left paddle with the keyboard", Body: "Verified by test-paddle-control."},
		{ID: "req-ball-scoring", Cells: []string{"ball scoring", "requirement"}, Head: "the ball bounces off paddles and walls; first to five wins", Body: "Verified by test-ball-scoring."},
		{ID: "req-single-file", Cells: []string{"single file", "requirement"}, Head: "the whole game ships as one HTML file, zero dependencies", Body: "Verified by test-single-file."},
	}}}
	return `<div class="sample-register" data-layer="informative">` + baseResultHTML([]BaseResult{reg}, nil, nil, nil, "sreg") + `</div>`
}

// enddesign

// design: go-raid-matrix-render  implements: req-risk-matrix
// The RAID bubble matrix: ONE continuous probability-consequence diagram over every RAID
// item. Impact rides x, probability rides y, both 0..1 (the owner's axis ruling). One
// bubble draws per item. COLOR encodes the KIND, and position alone carries severity.
// Kind and status ride the generic filter columns (go-filter-columns). Every status chip
// starts selected EXCEPT closed, so closed items hide by default while staying in the
// DOM. A bubble click opens the details pane through the data-node-link lane. The
// shell's .raid-matrix script reads the initial selection from the pills, so the
// default is data, not code.
func renderRaidMatrix(nodes map[string]Node) string {
	type rItem struct {
		id, kind, status, stmt, mit, own string
		p, i                             float64
	}
	var items []rItem
	for _, n := range nodes {
		if n.Type != "raid" {
			continue
		}
		if _, err := os.Stat(n.Path); err != nil {
			continue
		}
		props := basePropsOf(n.Path)
		pf, err1 := strconv.ParseFloat(strings.TrimSpace(props.scalars["probability"]), 64)
		xf, err2 := strconv.ParseFloat(strings.TrimSpace(props.scalars["impact"]), 64)
		if err1 != nil || err2 != nil {
			continue // an unplottable item stays in the register table only
		}
		status := props.scalars["status"]
		if status == "" {
			status = "open"
		}
		items = append(items, rItem{id: n.ID, kind: n.Kind, status: status, stmt: n.Statement, p: pf, i: xf,
			mit: strings.TrimSpace(props.scalars["mitigation"]), own: strings.TrimSpace(props.scalars["owner"])})
	}
	if len(items) == 0 {
		return `<p class="meta">no plottable RAID items yet — probability and impact put an item on the matrix</p>`
	}
	sort.Slice(items, func(a, b int) bool { return items[a].id < items[b].id })
	var b strings.Builder
	b.WriteString(`<div class="raid-matrix" id="raid-matrix" data-layer="derived">` + "\n")
	b.WriteString(`<div class="raid-wrap">`)
	// the side table IS the standard reader table (owner ruling 2026-07-19: never
	// reinvent tables): name, kind, and status columns - kind and status auto-earn
	// the enum pills the matrix bubbles listen to; the statement rides the standard
	// brief/expand lane; ten rows a page; closed starts deselected as emitted DATA
	reg := BaseResult{Columns: []string{"name", "kind", "status"}, PageSize: 10,
		FacetOff: map[string][]string{"status": {"closed"}}}
	var rows []BaseRow
	for _, it := range items {
		body := fmt.Sprintf("probability: %.2g · impact: %.2g", it.p, it.i)
		if it.mit != "" {
			body += "\n\nmitigation: " + it.mit
		}
		if it.own != "" {
			body += "\n\nowner: " + it.own
		}
		rows = append(rows, BaseRow{ID: it.id, Cells: []string{humanizeID(it.id), it.kind, it.status}, Head: it.stmt, Body: body})
	}
	reg.Groups = []BaseGroup{{Rows: rows}}
	b.WriteString(`<div class="raid-side">` + baseResultHTML([]BaseResult{reg}, nodes, nil, nil, "raidt") + `</div>` + "\n")
	const (
		W, H           = 480, 430
		mL, mR, mT, mB = 46, 16, 16, 40
	)
	px := func(v float64) int { return mL + int(v*float64(W-mL-mR)+0.5) }
	py := func(v float64) int { return mT + int((1-v)*float64(H-mT-mB)+0.5) }
	b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 %d %d" font-family="system-ui" font-size="10" role="img" aria-label="the RAID matrix: impact against probability">`, W, H))
	for _, g := range []float64{0, 0.25, 0.5, 0.75, 1} {
		b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#e3e3e3"/>`, px(g), py(0), px(g), py(1)))
		b.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#e3e3e3"/>`, px(0), py(g), px(1), py(g)))
		lb := strings.TrimPrefix(fmt.Sprintf("%.2g", g), "0")
		if g == 0 {
			lb = "0"
		}
		b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" fill="#888">%s</text>`, px(g), py(0)+14, lb))
		b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="end" fill="#888">%s</text>`, px(0)-5, py(g)+3, lb))
	}
	b.WriteString(fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" fill="#555">impact →</text>`, (px(0)+px(1))/2, H-6))
	b.WriteString(fmt.Sprintf(`<text x="12" y="%d" text-anchor="middle" fill="#555" transform="rotate(-90 12 %d)">probability →</text>`, (py(0)+py(1))/2, (py(0)+py(1))/2))
	for _, it := range items {
		// kind colors resolve from the one palette source (go-type-colors); the facet
		// attrs mirror the standard table's enum facets (e1 = kind, e2 = status)
		fill := typeColor(it.kind)
		b.WriteString(fmt.Sprintf(`<circle class="rbub" data-node-link="%s" data-e1="%s" data-e2="%s" cx="%d" cy="%d" r="9" fill="%s" fill-opacity="0.8" stroke="#fff" stroke-width="1.2"><title>%s — %s (p %.2g, i %.2g)</title></circle>`,
			htmlEscape(it.id), htmlEscape(it.kind), htmlEscape(it.status), px(it.i), py(it.p), fill, htmlEscape(it.id), htmlEscape(it.stmt), it.p, it.i))
	}
	b.WriteString(`</svg>` + "\n</div>\n</div>\n")
	return b.String()
}

// enddesign
