package main

// models.go — structural models: the pinned Mermaid-subset
// extractor, the canonical semantic graph, and its hash. The truth is the authored
// node file; the graph is derived, read-only, and the only thing the ledger hashes
// (adr-element-major-format, adr-edit-paths-unique).

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// design: go-model-extract  implements: req-draft-is-truth, req-semantic-hash, req-model-lint
// The pinned flowchart subset: `subgraph <layer>` blocks in rank order (innermost
// first), element declarations `id["responsibility"]` inside them, then flows
// `a -->|payload| b` on declared names. A UTF-8 BOM is stripped; a
// beyond-subset line is a lint FINDING and the rest still parses;
// an undeclared flow endpoint or an empty payload lints (the TikZ discipline).
// The canonical form keeps layer ORDER (semantic) and sorts elements and flows
// (their line order is cosmetic) — so the hash moves only on meaning.

type modelElem struct{ Layer, Label string }
type modelFlow struct{ Src, Dst, Payload string }
type modelGraph struct {
	Layers []string
	Elems  map[string]modelElem
	Flows  []modelFlow
}

var (
	modelSubRe  = regexp.MustCompile(`^subgraph\s+([A-Za-z0-9_-]+)$`)
	modelNodeRe = regexp.MustCompile(`^([A-Za-z0-9_-]+)\["([^"]*)"\]$`)
	modelEdgeRe = regexp.MustCompile(`^([A-Za-z0-9_-]+)\s*-->\|([^|]*)\|\s*([A-Za-z0-9_-]+)$`)
)

// modelSource isolates the fenced mermaid block when the source is a full node
// file; a bare diagram passes through untouched. The authored file IS the truth —
// there is no sidecar to extract from.
func modelSource(src string) string {
	src = strings.TrimPrefix(src, "\ufeff")
	if i := strings.Index(src, "```mermaid"); i >= 0 {
		rest := src[i+len("```mermaid"):]
		if j := strings.Index(rest, "```"); j >= 0 {
			return rest[:j]
		}
		return rest
	}
	return src
}

// design: go-model-behavior  implements: req-draft-is-truth
// The behavior kinds ride the SAME extractor with a header dispatch: a
// stateDiagram-v2 file maps states to elements and labeled transitions to flows;
// a sequenceDiagram maps participants to elements and messages to flows. One
// graph shape, one hash rule, one lint discipline for every authored kind.
var (
	modelStateRe = regexp.MustCompile(`^([A-Za-z0-9_\[\]*-]+)\s*-->\s*([A-Za-z0-9_\[\]*-]+)(?::\s*(.*))?$`)
	modelSeqRe   = regexp.MustCompile(`^([A-Za-z0-9_-]+)\s*(?:->>|-->>)\s*([A-Za-z0-9_-]+):\s*(.*)$`)
)

func extractBehaviorGraph(header string, lines []string) (modelGraph, []string) {
	g := modelGraph{Elems: map[string]modelElem{}}
	var lint []string
	seq := header == "sequenceDiagram"
	implicit := func(id string) {
		if _, ok := g.Elems[id]; !ok && id != "[*]" {
			if seq {
				lint = append(lint, fmt.Sprintf("message references undeclared participant %q (declare before use)", id))
			}
			g.Elems[id] = modelElem{Layer: header, Label: id}
		}
	}
	for ln, line := range lines {
		t := strings.TrimSpace(line)
		switch {
		case t == "" || strings.HasPrefix(t, "%%") || t == header:
		case seq && strings.HasPrefix(t, "participant "):
			id := strings.TrimSpace(strings.TrimPrefix(t, "participant "))
			g.Elems[id] = modelElem{Layer: header, Label: id}
		case seq && modelSeqRe.MatchString(t):
			m := modelSeqRe.FindStringSubmatch(t)
			implicit(m[1])
			implicit(m[2])
			if strings.TrimSpace(m[3]) == "" {
				lint = append(lint, fmt.Sprintf("line %d: message without a payload label", ln+1))
			}
			g.Flows = append(g.Flows, modelFlow{Src: m[1], Dst: m[2], Payload: m[3]})
		case !seq && modelStateRe.MatchString(t):
			m := modelStateRe.FindStringSubmatch(t)
			implicit(m[1])
			implicit(m[2])
			g.Flows = append(g.Flows, modelFlow{Src: m[1], Dst: m[2], Payload: m[3]})
		default:
			lint = append(lint, fmt.Sprintf("line %d: beyond-subset syntax: %q", ln+1, t))
		}
	}
	return g, lint
}

// enddesign

func extractModelGraph(src string) (modelGraph, []string) {
	body := modelSource(src)
	for _, h := range []string{"stateDiagram-v2", "sequenceDiagram"} {
		if strings.Contains(body, h) {
			return extractBehaviorGraph(h, strings.Split(body, "\n"))
		}
	}
	g := modelGraph{Elems: map[string]modelElem{}}
	var lint []string
	cur := ""
	// a flat model (element-tree kind): no subgraph anywhere -> bare declarations
	// are legal, layer stays empty
	flat := !strings.Contains(body, "subgraph ")
	for ln, line := range strings.Split(body, "\n") {
		t := strings.TrimSpace(strings.TrimPrefix(line, "\ufeff"))
		switch {
		case t == "" || strings.HasPrefix(t, "%%") || t == "flowchart TD":
			// blank, comment, or the header — cosmetic
		case t == "end":
			cur = ""
		case modelSubRe.MatchString(t):
			cur = modelSubRe.FindStringSubmatch(t)[1]
			g.Layers = append(g.Layers, cur)
		case modelNodeRe.MatchString(t):
			m := modelNodeRe.FindStringSubmatch(t)
			if cur == "" && !flat {
				lint = append(lint, fmt.Sprintf("line %d: element %q declared outside a layer", ln+1, m[1]))
				continue
			}
			g.Elems[m[1]] = modelElem{Layer: cur, Label: m[2]}
		case modelEdgeRe.MatchString(t):
			m := modelEdgeRe.FindStringSubmatch(t)
			for _, ref := range []string{m[1], m[3]} {
				if _, ok := g.Elems[ref]; !ok {
					lint = append(lint, fmt.Sprintf("line %d: flow references undeclared %q (declare before use)", ln+1, ref))
				}
			}
			if strings.TrimSpace(m[2]) == "" {
				lint = append(lint, fmt.Sprintf("line %d: flow without a payload label", ln+1))
			}
			g.Flows = append(g.Flows, modelFlow{Src: m[1], Dst: m[3], Payload: m[2]})
		default:
			lint = append(lint, fmt.Sprintf("line %d: beyond-subset syntax: %q", ln+1, t))
		}
	}
	return g, lint
}

// CanonicalHash serializes rank order verbatim and everything else sorted, then
// hashes — the ledger's view of the model. Cosmetic churn cannot move it.
func (g modelGraph) CanonicalHash() string {
	if len(g.Elems) == 0 && len(g.Layers) == 0 {
		return ""
	}
	var sb strings.Builder
	sb.WriteString("layers:" + strings.Join(g.Layers, ">") + "\n")
	ids := make([]string, 0, len(g.Elems))
	for id := range g.Elems {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		e := g.Elems[id]
		sb.WriteString("elem:" + id + "@" + e.Layer + ":" + e.Label + "\n")
	}
	fl := make([]string, 0, len(g.Flows))
	for _, f := range g.Flows {
		fl = append(fl, "flow:"+f.Src+"->"+f.Dst+":"+f.Payload)
	}
	sort.Strings(fl)
	sb.WriteString(strings.Join(fl, "\n"))
	h := sha256.Sum256([]byte(sb.String()))
	return hex.EncodeToString(h[:])
}

// enddesign

// design: go-model-render  implements: req-models-in-book
// The book's design output chapter renders every declared model from its extracted
// graph — the derived view of the text truth. Every arrow carries its payload name
// (unlabeled arrows are useless). One figure line: `fig: model <id>`,
// or bare `fig: model` for all models sorted. The structural-models SECTION renders
// as the auto-generated table below (`fig: models-table`, the same table law as
// every other derived view): one row per declared model, the figure and its derived
// "informed by" link list (modelInformedBy below) inside the row expand.
func renderModelFigure(arg string, nodes map[string]Node) string {
	var ids []string
	for id, n := range nodes {
		if n.Type == "model" && (arg == "" || arg == id) {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		return `<p class="meta">no model nodes yet — models render as spec/models/ fills</p>`
	}
	sort.Strings(ids)
	var b strings.Builder
	for _, id := range ids {
		n := nodes[id]
		raw, err := os.ReadFile(n.Path)
		if err != nil {
			continue
		}
		g, _ := extractModelGraph(string(raw))
		b.WriteString(`<section id="` + id + `" data-layer="informative"><p class="stmt"><strong>` + id + `</strong> — ` + n.Statement + "</p>\n")
		b.WriteString(svgModelGraph(g))
		src := string(raw)
		if !strings.Contains(src, "stateDiagram-v2") && !strings.Contains(src, "sequenceDiagram") {
			b.WriteString(renderModelInformed(id, src, nodes))
		}
		b.WriteString("</section>\n")
	}
	return b.String()
}

// renderModelsTable is the structural-models section body: one expandable row per
// declared model node, sorted by id; the expand carries the extracted figure and
// the informed-by links. An empty population says so honestly.
func renderModelsTable(nodes map[string]Node) string {
	var ids []string
	for id, n := range nodes {
		if n.Type == "model" {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		return `<p class="meta">no model nodes yet — the table renders as spec/models/ fills</p>`
	}
	sort.Strings(ids)
	var b strings.Builder
	b.WriteString(`<div class="utable" id="models-table" data-layer="derived">`)
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">model</th><th scope="col">brief</th><th scope="col">kind</th></tr></thead><tbody>` + "\n")
	for _, id := range ids {
		n := nodes[id]
		name := strings.ReplaceAll(strings.TrimPrefix(id, "model-"), "-", " ")
		brief := ""
		if len(n.Statement) <= 110 {
			brief = n.Statement
		} else if lead, sub := splitChapterTitle(n.Statement); sub != "" && len(lead) <= 110 {
			brief = lead
		}
		kind := n.Kind
		if kind == "" {
			kind = "-"
		}
		b.WriteString(`<tr class="urow qt-exp" data-node="` + htmlEscape(id) + `" data-text="` + attesc(htmlEscape(strings.ToLower(name+" "+n.Statement+" "+id))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(name) + `</td><td class="ubrief">` + htmlEscape(brief) + `</td><td class="uenum">` + htmlEscape(kind) + `</td></tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="3">`)
		if n.Statement != "" && n.Statement != brief {
			b.WriteString(`<p class="stmt">` + htmlEscape(n.Statement) + `</p>`)
		}
		if raw, err := os.ReadFile(n.Path); err == nil {
			src := string(raw)
			g, _ := extractModelGraph(src)
			b.WriteString(svgModelGraph(g))
			if !strings.Contains(src, "stateDiagram-v2") && !strings.Contains(src, "sequenceDiagram") {
				b.WriteString(renderModelInformed(id, src, nodes))
			}
		}
		b.WriteString(`<p class="meta">` + htmlEscape(id) + `</p></td></tr>` + "\n")
	}
	b.WriteString("</tbody></table>")
	b.WriteString(utableControls())
	b.WriteString(`</div>` + "\n")
	return b.String()
}

// modelInformedBy derives the architecture decisions CURRENTLY informing a
// structural model, from existing data only — no new model kind, no authored list:
//   - the decisions the model's own authored file cites by id (the model says
//     why it is the way it is), and
//   - the decisions whose statement names the model, its kind, or one of its
//     id-shaped (dash-carrying) elements.
//
// The addresses→implements→element chain was measured and rejected: a TOTAL
// model (the engine onion covers every design region by construction) is
// "informed" by nearly every decision through it — a list that discriminates
// nothing is not an honest view. Plain-word element ids (a product tree's
// `engine`, `method`) are skipped for the same reason: indistinguishable from
// prose. Decisions not informing stay out — the full set lives with the
// project chapter's one decisions table.
func modelInformedBy(modelID, src string, nodes map[string]Node) []string {
	tokens := []string{modelID}
	if k := nodes[modelID].Kind; k != "" {
		tokens = append(tokens, k)
	}
	g, _ := extractModelGraph(src)
	var elems []string
	for e := range g.Elems {
		if strings.Contains(e, "-") {
			elems = append(elems, e)
		}
	}
	sort.Strings(elems)
	tokens = append(tokens, elems...)
	var out []string
	for id, n := range nodes {
		if n.Type != "adr" || n.Kind == "waiver" || !decisionArchitectural(n) {
			continue
		}
		if nameMatchToken(src, id) {
			out = append(out, id)
			continue
		}
		for _, t := range tokens {
			if nameMatchToken(n.Statement, t) {
				out = append(out, id)
				break
			}
		}
	}
	sort.Strings(out)
	return out
}

// nameMatchToken reports whether text carries tok as a whole id-shaped word:
// the neighbours may not be id characters ([a-z0-9-]), so `state` never
// matches `check-states` and `adr-x` never matches `adr-x-y`.
func nameMatchToken(text, tok string) bool {
	if tok == "" {
		return false
	}
	isID := func(c byte) bool {
		return c == '-' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
	}
	for i := 0; ; {
		j := strings.Index(text[i:], tok)
		if j < 0 {
			return false
		}
		j += i
		before := j == 0 || !isID(text[j-1])
		after := j+len(tok) >= len(text) || !isID(text[j+len(tok)])
		if before && after {
			return true
		}
		i = j + 1
	}
}

// renderModelInformed emits the compact informed-by link list for one model —
// nodeLinkHTML affordances, honest when empty. The list LEADS with the decisions holding a
// FIRST-CLASS addresses edge to the model or one of its elements (go-informed-by-edges,
// req-informed-by-edges.2), then keeps the name-derived citation only for a decision without
// a first-class edge.
func renderModelInformed(modelID, src string, nodes map[string]Node) string {
	g, _ := extractModelGraph(src)
	var elems []string
	for e := range g.Elems {
		elems = append(elems, e)
	}
	fc := firstClassInformedBy(modelID, elems, nodes)
	seen := map[string]bool{}
	for _, id := range fc {
		seen[id] = true
	}
	var derived []string
	for _, id := range modelInformedBy(modelID, src, nodes) {
		if !seen[id] {
			derived = append(derived, id) // name-derived citation only WITHOUT a first-class edge
		}
	}
	ids := append(append([]string{}, fc...), derived...)
	if len(ids) == 0 {
		return `<p class="meta model-informed">no decision names this model yet — informing decisions link here as they arrive; the full set lives with the project chapter</p>` + "\n"
	}
	var b strings.Builder
	b.WriteString(`<p class="meta model-informed">informed by: `)
	for i, id := range ids {
		if i > 0 {
			b.WriteString(", ")
		}
		b.WriteString(nodeLinkHTML(id, nodes))
	}
	b.WriteString("</p>\n")
	return b.String()
}

func svgModelGraph(g modelGraph) string {
	ids := make([]string, 0, len(g.Elems))
	for id := range g.Elems {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	pos := map[string][2]float64{}
	var b strings.Builder
	if len(g.Layers) > 1 {
		// ranked model: concentric rings, innermost first
		cx, cy, gap := 400.0, 400.0, 320.0/float64(len(g.Layers))
		b.WriteString(`<svg viewBox="0 0 800 800" role="img" aria-label="structural model: ` + itoa(len(g.Layers)) + ` layers, ` + itoa(len(ids)) + ` elements" style="max-width:640px">`)
		for i := len(g.Layers) - 1; i >= 0; i-- {
			r := gap * float64(i+1) * 1.15
			b.WriteString(fmt.Sprintf(`<circle cx="%.0f" cy="%.0f" r="%.0f" fill="hsl(%d,40%%,%d%%)" stroke="#b8a888"/>`, cx, cy, r, 40+i*22, 92-i*4))
			b.WriteString(fmt.Sprintf(`<text x="%.0f" y="%.0f" font-size="15" fill="#7a6a4f" text-anchor="middle">%s</text>`, cx, cy-r+18, g.Layers[i]))
		}
		layerIdx := map[string]int{}
		for i, ly := range g.Layers {
			layerIdx[ly] = i
		}
		perLayer := map[string][]string{}
		for _, id := range ids {
			ly := g.Elems[id].Layer
			perLayer[ly] = append(perLayer[ly], id)
		}
		for ly, ms := range perLayer {
			r := gap*float64(layerIdx[ly]+1)*1.15 - gap*0.55
			for j, id := range ms {
				ang := 6.283*float64(j)/float64(len(ms)) + float64(layerIdx[ly])*0.6
				pos[id] = [2]float64{cx + r*math.Cos(ang), cy + r*math.Sin(ang)}
			}
		}
	} else {
		// flat model (tree, state, sequence): a labeled column
		b.WriteString(fmt.Sprintf(`<svg viewBox="0 0 800 %d" role="img" aria-label="structural model: %d elements" style="max-width:640px">`, 80+70*len(ids), len(ids)))
		for i, id := range ids {
			pos[id] = [2]float64{400, float64(60 + 70*i)}
		}
	}
	b.WriteString(`<defs><marker id="mar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8a7a5f"/></marker></defs>`)
	for _, f := range g.Flows {
		a, aok := pos[f.Src]
		c, cok := pos[f.Dst]
		if !aok || !cok {
			continue
		}
		b.WriteString(fmt.Sprintf(`<line x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f" stroke="#8a7a5f" stroke-width="1.5" marker-end="url(#mar)"/>`, a[0], a[1], c[0], c[1]))
		b.WriteString(fmt.Sprintf(`<text x="%.0f" y="%.0f" font-size="11" fill="#6a5a3f" text-anchor="middle">%s</text>`, (a[0]+c[0])/2, (a[1]+c[1])/2-4, f.Payload))
	}
	for _, id := range ids {
		p := pos[id]
		b.WriteString(fmt.Sprintf(`<circle cx="%.0f" cy="%.0f" r="5" fill="#4a3a1f"/>`, p[0], p[1]))
		b.WriteString(fmt.Sprintf(`<text x="%.0f" y="%.0f" font-size="12" fill="#2a2a2a" text-anchor="middle">%s</text>`, p[0], p[1]-10, id))
	}
	b.WriteString(`</svg>`)
	return b.String()
}

// enddesign

// design: go-informed-by-edges  implements: req-informed-by-edges
// A decision may address a MODEL or a model ELEMENT first-class, exactly as it addresses a
// requirement (req-informed-by-edges.1): the trace rules (coverage:adr-traced and the hole
// lister) accept such a target, and the strict referee recognizes every DECLARED model element
// as a resolvable endpoint so a first-class edge never reads dangling. The book's informed-by
// list then LEADS with the decisions holding a first-class edge to the model or its elements and
// keeps the name-derived citation only for a decision without one (req-informed-by-edges.2). An
// addresses edge naming an element-shaped target that NO model declares is a dangling model
// target the lint flags (req-informed-by-edges.3). Elements ARE design regions (the onion
// physics), so a realized region in a model resolves both ways; the set is derived, never authored.

// modelDeclaredElements returns every element id declared across all model nodes' graphs — the
// first-class trace endpoints, resolvable even before a design region realizes them.
func modelDeclaredElements(nodes map[string]Node) map[string]bool {
	out := map[string]bool{}
	for _, n := range nodes {
		if n.Type != "model" {
			continue
		}
		raw, err := os.ReadFile(n.Path)
		if err != nil {
			continue
		}
		g, _ := extractModelGraph(string(raw))
		for e := range g.Elems {
			out[e] = true
		}
	}
	return out
}

// addressFirstClass reports whether an addresses target traces first-class: a requirement, a
// use-case, a need, a model node, a question, or a declared model element. The coverage rules use
// it so a decision informing an element is credited exactly like one addressing a requirement.
// question: a defer/decide decision legitimately addresses the question it rules on — the
// engine's own `mint defer --of q-…` wires exactly that edge (found live at i19 M4).
func addressFirstClass(id string, nodes map[string]Node, elems map[string]bool) bool {
	if n, ok := nodes[id]; ok {
		switch n.Type {
		case "requirement", "usecase", "need", "model", "question":
			return true
		}
	}
	return elems[id]
}

// firstClassInformedBy returns the decisions holding a first-class addresses edge to the model
// modelID or to one of its elements — the discriminating, authored informed-by set.
func firstClassInformedBy(modelID string, elems []string, nodes map[string]Node) []string {
	targets := map[string]bool{modelID: true}
	for _, e := range elems {
		targets[e] = true
	}
	var out []string
	for id, n := range nodes {
		if n.Type != "adr" {
			continue
		}
		for _, a := range n.Addresses {
			if targets[a] {
				out = append(out, id)
				break
			}
		}
	}
	sort.Strings(out)
	return out
}

// informedByDanglingFindings flags an addresses edge whose target is element-shaped (it resolves
// to a design region, or looks like one) yet NO model declares it — the dangling model target
// (req-informed-by-edges.3). A requirement / use-case / need / model target traces normally and
// is never flagged; an entirely unknown id is refused earlier by the strict referee.
func informedByDanglingFindings(nodes map[string]Node) []string {
	elems := modelDeclaredElements(nodes)
	var finds []string
	for id, n := range nodes {
		if n.Type != "adr" {
			continue
		}
		for _, a := range n.Addresses {
			if a == scrapSink || elems[a] || addressFirstClass(a, nodes, elems) {
				continue
			}
			tn, ok := nodes[a]
			if ok && tn.Type == "design" {
				finds = append(finds, id+": addresses '"+a+"' — a design region no model declares (dangling model target)")
			}
		}
	}
	sort.Strings(finds)
	return finds
}

// enddesign

// design: go-model-registry  implements: req-model-kinds, req-model-stubs
// The kind registry is a FOLDER, not a list: method/models/*.md, engine-scanned -
// the file IS the registration (the rigor/project_types/roles pattern). Each kind
// names its question, format, choose-when heuristic, and smells in frontmatter;
// its fenced example doubles as the mint stub. Kinds are data, formats are code:
// a kind reusing a built-in format subset is alive on arrival; a new grammar owes
// an engine step.
func modelKindFiles() []string {
	dir := filepath.Join(engineRoot(), "product", "quackitect", "method", "models")
	ents, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var files []string
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || strings.HasPrefix(e.Name(), "_") {
			continue
		}
		files = append(files, filepath.Join(dir, e.Name()))
	}
	sort.Strings(files)
	return files
}

func modelStubFor(kind string) string {
	for _, f := range modelKindFiles() {
		if strings.TrimSuffix(filepath.Base(f), ".md") != kind {
			continue
		}
		raw, err := os.ReadFile(f)
		if err != nil {
			return ""
		}
		src := string(raw)
		if i := strings.Index(src, "```mermaid"); i >= 0 {
			rest := src[i+len("```mermaid"):]
			if j := strings.Index(rest, "```"); j >= 0 {
				return strings.TrimSpace(rest[:j]) + "\n"
			}
		}
	}
	return ""
}

// enddesign

// design: go-models-complete-book  implements: req-models-complete-book
// The kind-example figure (`fig: model-kinds`): ONE row per supported model kind
// in the same expandable reader table as everything else, derived at render time
// from the registry files themselves (modelKindFiles) - the book carries no
// hand-authored duplicate. The row names the kind, the brief is the kind's own
// question, and the expand holds the example: a section marked
// data-kind-example="<kind>" (<kind> = the registry file's base name) whose figure
// is the kind's by-example stub run through the normal extractor and renderer. A
// derived kind (no authored stub - the context star computes from live spec
// data) says so instead of faking an authored example.
func renderModelKindExamples() string {
	files := modelKindFiles()
	if len(files) == 0 {
		return `<p class="meta">no model kinds yet — the registry (method/models/) is empty</p>`
	}
	var b strings.Builder
	b.WriteString(`<div class="utable" id="model-kinds-table" data-layer="derived">`)
	b.WriteString(`<table class="q-table u-table" data-layer="derived"><thead><tr><th scope="col">kind</th><th scope="col">question</th></tr></thead><tbody>` + "\n")
	for _, f := range files {
		kind := strings.TrimSuffix(filepath.Base(f), filepath.Ext(f))
		raw, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		question := ""
		for _, ln := range strings.Split(string(raw), "\n") {
			if strings.HasPrefix(ln, "question:") {
				question = strings.TrimSpace(strings.TrimPrefix(ln, "question:"))
				break
			}
		}
		b.WriteString(`<tr class="urow qt-exp" data-text="` + attesc(htmlEscape(strings.ToLower(kind+" "+question))) + `"><td><span class="utri" aria-hidden="true"></span>` + htmlEscape(kind) + `</td><td class="ubrief">` + htmlEscape(question) + `</td></tr>` + "\n")
		b.WriteString(`<tr class="udetail" hidden><td colspan="2">`)
		b.WriteString(`<section data-kind-example="` + kind + `" data-layer="informative">` + "\n")
		if stub := modelStubFor(kind); stub != "" {
			g, _ := extractModelGraph(stub)
			b.WriteString(svgModelGraph(g))
		} else {
			b.WriteString(`<p class="meta">derived kind — its figure computes from live spec data; no authored example exists</p>`)
		}
		b.WriteString("</section>")
		b.WriteString(`</td></tr>` + "\n")
	}
	b.WriteString("</tbody></table>")
	b.WriteString(utableControls())
	b.WriteString(`</div>` + "\n")
	return b.String()
}

// enddesign

// design: go-model-asbuilt  implements: req-conformance
// The as-built side of the engine's own onion: deriveDesignFlow's region call
// graph becomes a modelGraph - elements are the regions the code actually
// carries (their layer looked up from the DECLARED model, sky-falls empty),
// flows are the real calls, and reads/writes mark world contact. The lint runs
// the reflexion diff live: inward-only calls, rim-only I/O, kernel purity,
// sky-fall - the code's answer to the declared intent, on every lint.
func engineAsBuiltGraph(declared modelGraph) modelGraph {
	consumes, reads, writes := deriveDesignFlow()
	g := modelGraph{Layers: declared.Layers, Elems: map[string]modelElem{}}
	ids := make([]string, 0, len(consumes))
	for id := range consumes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		layer := ""
		if e, ok := declared.Elems[id]; ok {
			layer = e.Layer
		}
		g.Elems[id] = modelElem{Layer: layer}
		for _, dst := range consumes[id] {
			g.Flows = append(g.Flows, modelFlow{Src: id, Dst: dst})
		}
	}
	_ = reads
	_ = writes
	return g
}

// realLayers filters the declaration order down to RANKED layers - bands
// (name contains "--") and ambient sit outside the ranking.
func realLayers(layers []string) []string {
	var out []string
	for _, ly := range layers {
		if ly == "ambient" || strings.Contains(ly, "--") {
			continue
		}
		out = append(out, ly)
	}
	return out
}

// rankOf returns an element's rank index among the REAL layers (0 = innermost),
// bands and ambient -1 (outside the ranking).
func rankOf(layer string, layers []string) int {
	if layer == "" || layer == "ambient" || strings.Contains(layer, "--") {
		return -1
	}
	for i, ly := range realLayers(layers) {
		if ly == layer {
			return i
		}
	}
	return -1
}

// engineConformanceFindings runs the owner-physics checks over declared vs as-built.
func engineConformanceFindings(declared modelGraph) []string {
	consumes, reads, writes := deriveDesignFlow()
	var finds []string
	ids := make([]string, 0, len(consumes))
	for id := range consumes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		de, ok := declared.Elems[id]
		if !ok {
			finds = append(finds, fmt.Sprintf("sky-fall: region %s realized but no model allocates it", id))
			continue
		}
		srcRank := rankOf(de.Layer, declared.Layers)
		// rim-only I/O: only the OUTERMOST real layer touches the world; bands are
		// exempt (transforms read and write their coordinate media)
		rl := realLayers(declared.Layers)
		if (reads[id] || writes[id]) && srcRank >= 0 && len(rl) > 0 && de.Layer != rl[len(rl)-1] {
			finds = append(finds, fmt.Sprintf("world contact outside the rim: %s (%s) does external I/O", id, de.Layer))
		}
		for _, dst := range consumes[id] {
			te, ok := declared.Elems[dst]
			if !ok {
				continue // the dst's own sky-fall reports it
			}
			dstRank := rankOf(te.Layer, declared.Layers)
			if srcRank >= 0 && dstRank >= 0 && dstRank > srcRank {
				finds = append(finds, fmt.Sprintf("inward-only violated: %s (%s) calls %s (%s)", id, de.Layer, dst, te.Layer))
			}
			if de.Layer == "ambient" && te.Layer != "ambient" {
				finds = append(finds, fmt.Sprintf("ambient discipline: %s calls %s (%s) - ambient may call only ambient", id, dst, te.Layer))
			}
		}
	}
	return finds
}

// enddesign

// design: go-model-conformance  implements: req-conformance, req-divergence-suspect, req-no-flow-smell
// Reflexion models, mechanized: the declared graph (the owner's intent) against
// the as-built graph (derived from code), diffed into convergences (declared and
// built), divergences (built, never declared - including outward dependencies),
// absences (declared, never built), and sky-falls (elements realized that no model
// allocates - "no device falls from the sky"). modelConforms is the executed
// verdict: any divergence, sky-fall, or absence fails the check, and a failing
// check is a red board - the SUSPECT flip rides the model node's graph hash.
type conformance struct{ Convergences, Divergences, Absences, SkyFalls []string }

func conformanceReport(declared, asBuilt modelGraph) conformance {
	var rep conformance
	declFlow := map[string]string{}
	for _, f := range declared.Flows {
		declFlow[f.Src+"->"+f.Dst] = f.Payload
	}
	builtFlow := map[string]bool{}
	for _, f := range asBuilt.Flows {
		builtFlow[f.Src+"->"+f.Dst] = true
	}
	keys := make([]string, 0, len(declFlow))
	for k := range declFlow {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		if builtFlow[k] {
			rep.Convergences = append(rep.Convergences, k)
		} else {
			rep.Absences = append(rep.Absences, k)
		}
	}
	bkeys := make([]string, 0, len(builtFlow))
	for k := range builtFlow {
		bkeys = append(bkeys, k)
	}
	sort.Strings(bkeys)
	for _, k := range bkeys {
		if _, ok := declFlow[k]; !ok {
			rep.Divergences = append(rep.Divergences, k)
		}
	}
	bids := make([]string, 0, len(asBuilt.Elems))
	for id := range asBuilt.Elems {
		bids = append(bids, id)
	}
	sort.Strings(bids)
	for _, id := range bids {
		if _, ok := declared.Elems[id]; !ok {
			rep.SkyFalls = append(rep.SkyFalls, id)
		}
	}
	return rep
}

func modelConforms(declared, asBuilt modelGraph) bool {
	rep := conformanceReport(declared, asBuilt)
	return len(rep.Divergences) == 0 && len(rep.SkyFalls) == 0 && len(rep.Absences) == 0
}

func noFlowSmells(g modelGraph) []string {
	touched := map[string]bool{}
	for _, f := range g.Flows {
		if e, ok := g.Elems[f.Src]; ok {
			touched[e.Layer] = true
		}
		if e, ok := g.Elems[f.Dst]; ok {
			touched[e.Layer] = true
		}
	}
	var smells []string
	for _, ly := range g.Layers {
		if !touched[ly] {
			smells = append(smells, fmt.Sprintf("layer %q carries no flow - push its infrastructure a level down", ly))
		}
	}
	return smells
}

// enddesign

// design: go-model-lints  implements: req-model-consistency, req-views-chosen, req-models-gate-build
// The cross-model layer: an element is declared in exactly ONE owning view
// (adr-edit-paths-unique); siblings reference it by name, so a reference that no
// model declares is a dangling finding. A model with no covering views-chosen
// decision lints (the choice is recorded, never implicit). A model node whose
// file extracts to an empty graph is declared-but-unauthored and holds the build.
func modelConsistencyFindings(graphs map[string]modelGraph) []string {
	declared := map[string]bool{}
	for _, g := range graphs {
		for id := range g.Elems {
			declared[id] = true
		}
	}
	var finds []string
	names := make([]string, 0, len(graphs))
	for name := range graphs {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		for _, f := range graphs[name].Flows {
			for _, ref := range []string{f.Src, f.Dst} {
				if ref == "[*]" {
					continue // the state kind's start/end token, never an element
				}
				if !declared[ref] {
					finds = append(finds, fmt.Sprintf("%s: flow references %q - no model declares it", name, ref))
				}
			}
		}
	}
	return finds
}

func viewsChosenFindings(nodes map[string]*Node) []string {
	var finds []string
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := nodes[id]
		if n == nil || n.Type != "model" {
			continue
		}
		covered := false
		for _, d := range nodes {
			if d == nil || d.Type != "adr" {
				continue
			}
			if strings.Contains(d.Statement, id) || containsID(d.Chosen, id) {
				covered = true
				break
			}
		}
		if !covered {
			finds = append(finds, fmt.Sprintf("model %s has no covering views-chosen decision", id))
		}
	}
	return finds
}

func containsID(list []string, id string) bool {
	for _, x := range list {
		if x == id {
			return true
		}
	}
	return false
}

func modelsGateFindings(nodes map[string]*Node) []string {
	var finds []string
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := nodes[id]
		if n == nil || n.Type != "model" {
			continue
		}
		raw, err := os.ReadFile(n.Path)
		if err != nil {
			finds = append(finds, fmt.Sprintf("model %s: unreadable file", id))
			continue
		}
		g, _ := extractModelGraph(string(raw))
		if len(g.Elems) == 0 && len(g.Layers) == 0 {
			finds = append(finds, fmt.Sprintf("model %s declared but not authored - the build waits on it", id))
		}
	}
	return finds
}

// enddesign

// design: go-model-nodes  implements: req-model-nodes
// A model node (type: model) is trace content: never blessed, never a gate; it
// ripples through the ledger via its EXTRACTED graph — the hash computes once
// at load (ParseNode, band work) into Node.ModelHash, and the kernel's fullHash
// folds the FIELD, so dependents reopen exactly when the model's meaning
// changes and the kernel never reads a file for it.
// enddesign
