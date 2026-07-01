package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
)

// assetJS reads a vendored JS asset from disk and returns it for inlining into the report (one
// self-contained, emailable report.html). Not baked into the binary: a JS blob inside the .exe
// trips AV heuristics. The report inlines cytoscape + dagre + cytoscape-dagre.
func assetJS(name string) string {
	for _, p := range []string{
		filepath.Join(EngineDir(), "assets", name),               // vendored (vehicle) or dogfood
		filepath.Join(EngineSrc(), "assets", name),               // engine-go/assets fallback
		filepath.Join(ROOT, "product", "quackitect", "assets", name),
		filepath.Join(ROOT, "product", "engine-go", "assets", name),
	} {
		if raw, err := os.ReadFile(p); err == nil {
			return string(raw)
		}
	}
	return "/* " + name + " not found */"
}

// design: go-report-logo  implements: req-design-language
// brandLogoInline inlines the resolved brand mark (overlay -> engine default placeholder) into the
// report titlebar, left of the project name, sized by CSS to ~90% of the titlebar height.
func brandLogoInline() string {
	p := resolveBrand("logo-mark.svg")
	if p == "" {
		return ""
	}
	raw, err := os.ReadFile(p)
	if err != nil {
		return ""
	}
	return "<span class=brandlogo>" + string(raw) + "</span>"
}

// enddesign

func esc(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}

func gitStamp() string {
	out, err := exec.Command("git", "-C", ROOT, "log", "-1", "--format=%h %ci").Output()
	if err != nil {
		return "(no git stamp)"
	}
	return strings.TrimSpace(string(out))
}

func mark(state string) string {
	cls, glyph := "fail", "✗"
	switch state {
	case "DONE":
		cls, glyph = "done", "✓"
	case "SUSPECT":
		cls, glyph = "sus", "?"
	}
	return "<span class=\"mk " + cls + "\">" + glyph + "</span>"
}

func openFile(path string) {
	var c *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		c = exec.Command("cmd", "/c", "start", "", path)
	case "darwin":
		c = exec.Command("open", path)
	default:
		c = exec.Command("xdg-open", path)
	}
	_ = c.Start()
}

// --- model helpers ---

type iterMeta struct{ Motivation, Status, Type, Rigor string }

func readIterMeta(name string) iterMeta {
	m := iterMeta{}
	if name == "i0000_baseline" {
		return m
	}
	raw, err := os.ReadFile(filepath.Join(SPEC, "iterations", name, "iteration.md"))
	if err != nil {
		return m
	}
	parts := strings.Split(string(raw), "---")
	if len(parts) >= 3 {
		for _, line := range strings.Split(parts[1], "\n") {
			if i := strings.Index(line, ":"); i >= 0 {
				k, v := strings.TrimSpace(line[:i]), strings.TrimSpace(line[i+1:])
				switch k {
				case "status":
					m.Status = v
				case "type":
					m.Type = v
				case "rigor":
					m.Rigor = v
				}
			}
		}
		m.Motivation = strings.TrimSpace(strings.Join(parts[2:], "---"))
	}
	return m
}

func rigorOf(it string, cfg Config) string {
	if it == cfg.Version {
		return cfg.Rigor
	}
	return readIterMeta(it).Rigor
}

var msRe = regexp.MustCompile(`(?m)^\s*-\s*\*\*M(\d+)`)

// policyMilestones returns the milestone numbers declared in a rigor's checklist template.
func policyMilestones(rigor string) []int {
	if rigor == "" {
		return nil
	}
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "rigor", rigor, "checklist.md"))
	if err != nil {
		return nil
	}
	var out []int
	for _, m := range msRe.FindAllStringSubmatch(string(raw), -1) {
		out = append(out, atoiSafe(m[1]))
	}
	return out
}

func atoiSafe(s string) int {
	n := 0
	for _, c := range s {
		if c >= '0' && c <= '9' {
			n = n*10 + int(c-'0')
		}
	}
	return n
}

// iterationOfNode: code-design nodes (path under product/) belong to the iteration of the
// requirement they implement, not a phantom group.
func iterationOfNode(n Node, nodes map[string]Node, seen map[string]bool) string {
	rel, _ := filepath.Rel(SPEC, n.Path)
	if !strings.HasPrefix(filepath.ToSlash(rel), "..") {
		return iterOf(n.Path)
	}
	if seen == nil {
		seen = map[string]bool{}
	}
	seen[n.ID] = true
	for _, q := range append(append([]string{}, n.Implements...), n.Refines...) {
		if qn, ok := nodes[q]; ok && !seen[q] {
			return iterationOfNode(qn, nodes, seen)
		}
	}
	return "i0000_baseline"
}

var traceTypes = map[string]bool{"need": true, "usecase": true, "requirement": true, "design": true, "test": true, "adr": true}

func traceEdges(n Node) [][2]string {
	var e [][2]string
	for _, q := range n.Refines {
		e = append(e, [2]string{q, "refines"})
	}
	for _, q := range n.Implements {
		e = append(e, [2]string{q, "implements"})
	}
	for _, q := range n.Verifies {
		e = append(e, [2]string{q, "verifies"})
	}
	for _, q := range n.Addresses {
		e = append(e, [2]string{q, "addresses"})
	}
	return e
}

func edgesOf(n Node) [][2]string {
	e := traceEdges(n)
	for _, q := range n.DependsOn {
		e = append(e, [2]string{q, "depends_on"})
	}
	return e
}

// --- graph data (server-baked positions; cytoscape uses layout:preset) ---

var typeRank = map[string]int{"need": 0, "usecase": 1, "requirement": 2, "design": 3, "test": 4, "adr": 5}

type gpos struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}
type gel struct {
	Data map[string]string `json:"data"`
	Pos  *gpos             `json:"position,omitempty"`
}
type gtab struct {
	Label    string `json:"label"`
	Count    int    `json:"count"`
	Elements []gel  `json:"elements"`
}

// buildTab emits one need's subtree as cytoscape elements (nodes + V-model edges). No positions:
// the browser lays it out with the breadthfirst hierarchical layout (the same algo the filter uses).
func buildTab(label string, idset map[string]bool, nodes map[string]Node, sm map[string]string) gtab {
	ids := []string{}
	for id := range idset {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	var els []gel
	for _, id := range ids {
		n := nodes[id]
		k := "0"
		if n.Killer {
			k = "1"
		}
		els = append(els, gel{Data: map[string]string{"id": id, "label": id, "type": n.Type, "state": sm[id], "killer": k, "iter": iterationOfNode(n, nodes, nil)}})
	}
	for _, id := range ids {
		for _, e := range traceEdges(nodes[id]) {
			if idset[e[0]] {
				els = append(els, gel{Data: map[string]string{"id": e[0] + "__" + id, "source": e[0], "target": id, "etype": e[1]}})
			}
		}
	}
	return gtab{Label: label, Count: len(ids), Elements: els}
}

func graphTabs(nodes map[string]Node, sm map[string]string) []gtab {
	tnodes := map[string]Node{}
	for id, n := range nodes {
		if traceTypes[n.Type] {
			tnodes[id] = n
		}
	}
	children := map[string][]string{}
	for id, n := range tnodes {
		for _, e := range traceEdges(n) {
			if _, ok := tnodes[e[0]]; ok {
				children[e[0]] = append(children[e[0]], id)
			}
		}
		_ = id
	}
	subtree := func(root string) map[string]bool {
		seen := map[string]bool{}
		stack := []string{root}
		for len(stack) > 0 {
			x := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if seen[x] {
				continue
			}
			seen[x] = true
			stack = append(stack, children[x]...)
		}
		return seen
	}
	var needs []string
	for id, n := range tnodes {
		if n.Type == "need" {
			needs = append(needs, id)
		}
	}
	sort.Strings(needs)
	var tabs []gtab
	rooted := map[string]bool{}
	for _, need := range needs {
		st := subtree(need)
		for id := range st {
			rooted[id] = true
		}
		tabs = append(tabs, buildTab(need, st, tnodes, sm))
	}
	unrooted := map[string]bool{}
	for id := range tnodes {
		if !rooted[id] {
			unrooted[id] = true
		}
	}
	if len(unrooted) > 0 {
		tabs = append(tabs, buildTab("(unrooted)", unrooted, tnodes, sm))
	}
	return tabs
}

func checksMap(nodes map[string]Node, sm map[string]string, outDir string) map[string]map[string]interface{} {
	out := map[string]map[string]interface{}{}
	for id, n := range nodes {
		var edges []string
		for _, e := range edgesOf(n) {
			if _, ok := nodes[e[0]]; ok {
				edges = append(edges, e[1]+" "+e[0])
			}
		}
		href, _ := filepath.Rel(outDir, n.Path)
		href = filepath.ToSlash(href)
		if n.Line > 0 {
			href = fmt.Sprintf("%s#L%d", href, n.Line)
		}
		k := "0"
		if n.Killer {
			k = "1"
		}
		// design: go-verdict-link  implements: req-verdict-link
		// the "verdict" link: a DONE check links to its evidence — the milestone doc where the reason it
		// passed is written (the bless rationale). selftest:report-verdict guards the wiring.
		// enddesign
		// Only DONE items have a verdict; a failed/open item has no reason-it-passed, even if an old doc exists.
		verdictHref := ""
		if sm[id] == "DONE" && n.Milestone > 0 {
			it := iterationOfNode(n, nodes, nil)
			for _, pat := range []string{fmt.Sprintf("M%d-*.md", n.Milestone), filepath.Join("design", fmt.Sprintf("M%d*.md", n.Milestone))} {
				if m, _ := filepath.Glob(filepath.Join(SPEC, "iterations", it, pat)); len(m) > 0 {
					rel, _ := filepath.Rel(outDir, m[0])
					verdictHref = filepath.ToSlash(rel)
					break
				}
			}
		}
		out[id] = map[string]interface{}{"id": id, "type": n.Type, "state": sm[id], "killer": k,
			"stmt": n.Statement, "edges": edges, "verify": n.Verify, "href": href, "verdict_href": verdictHref}
	}
	return out
}

// --- panels ---

func milestoneOf(n Node) (int, bool) {
	if n.Milestone > 0 {
		return n.Milestone, true
	}
	return 0, false
}

// design: go-trace-nesting  implements: req-trace-nesting
// renderSubs nests subtasks: children (parent: <id>) render beneath their parent, collapsible; leaves
// render flat. The third level (build/test parents) reflects real hierarchy; selftest:report-nesting guards it.
// enddesign
// renderSubs renders a milestone's subtasks as a tree: a node's children (parent: <id>)
// nest beneath it. A parent (e.g. a generic "build" task) groups its planned steps; leaves
// render flat. Trace nodes (tests, etc.) are content and never appear here — only gates.
func renderSubs(ids []string, nodes map[string]Node, sm map[string]string) string {
	set := map[string]bool{}
	for _, id := range ids {
		set[id] = true
	}
	// Topological rank within this set (longest in-set depends_on chain), so steps render in
	// dependency order — e.g. "build planned" before "build", a step before the next.
	rank := map[string]int{}
	inprog := map[string]bool{}
	var rk func(id string) int
	rk = func(id string) int {
		if r, ok := rank[id]; ok {
			return r
		}
		if inprog[id] {
			return 0
		}
		inprog[id] = true
		m := -1
		for _, d := range nodes[id].DependsOn {
			if set[d] && d != id {
				if dr := rk(d); dr > m {
					m = dr
				}
			}
		}
		inprog[id] = false
		rank[id] = m + 1
		return rank[id]
	}
	for _, id := range ids {
		rk(id)
	}
	ordered := func(xs []string) {
		sort.Slice(xs, func(i, j int) bool {
			if rank[xs[i]] != rank[xs[j]] {
				return rank[xs[i]] < rank[xs[j]]
			}
			return xs[i] < xs[j]
		})
	}
	kids := map[string][]string{}
	var roots []string
	for _, id := range ids {
		if p := nodes[id].Parent; p != "" && p != id && set[p] {
			kids[p] = append(kids[p], id)
		} else {
			roots = append(roots, id)
		}
	}
	ordered(roots)
	var b strings.Builder
	var emit func(id string)
	emit = func(id string) {
		auto := ""
		if strings.HasPrefix(nodes[id].Verify, "coverage:") {
			auto = " <span class=\"auto\" title=\"derived from the trace\">auto</span>"
		}
		row := mark(sm[id]) + "<span class=\"rid\">" + esc(id) + "</span>" + auto
		ks := kids[id]
		if len(ks) > 0 {
			ordered(ks)
			// a parent with children is a collapsible group (open by default)
			b.WriteString("<details class=\"task par\" open><summary data-nid=\"" + esc(id) + "\">" + row + "</summary><div class=\"kids\">")
			for _, k := range ks {
				emit(k)
			}
			b.WriteString("</div></details>")
		} else {
			b.WriteString("<a class=\"task leaf\" href=\"#\" data-nid=\"" + esc(id) + "\">" + row + "</a>")
		}
	}
	for _, r := range roots {
		emit(r)
	}
	return b.String()
}

func milestoneGate(members []string, ms int) string {
	suf := fmt.Sprintf("m%d-gate", ms)
	for _, m := range members {
		if m == suf || strings.HasSuffix(m, "-"+suf) {
			return m
		}
	}
	return ""
}

func iterationsPanel(nodes map[string]Node, sm map[string]string, iters map[string][]string, cfg Config) string {
	var its []string
	for it := range iters {
		its = append(its, it)
	}
	sort.Strings(its)
	var b strings.Builder
	for _, it := range its {
		var gates []string
		for _, id := range iters[it] {
			if sm[id] != "CONTENT" {
				gates = append(gates, id)
			}
		}
		done := 0
		for _, id := range gates {
			if sm[id] == "DONE" {
				done++
			}
		}
		op, cur := "", ""
		if it == cfg.Version {
			op, cur = " open", " current"
		}
		frac := "planned"
		if len(gates) > 0 {
			frac = fmt.Sprintf("%d/%d", done, len(gates))
		}
		b.WriteString(fmt.Sprintf("<details class=\"iter%s\"%s><summary data-iter=\"%s\">%s <span class=\"frac\">%s</span></summary>", cur, op, esc(it), esc(it), frac))
		lanes := map[int][]string{}
		var loose []string
		for _, id := range gates {
			if ms, ok := milestoneOf(nodes[id]); ok {
				lanes[ms] = append(lanes[ms], id)
			} else {
				loose = append(loose, id)
			}
		}
		b.WriteString("<div class=\"tg\">")
		b.WriteString("<div class=\"bracket start\" data-bracket=\"" + esc(it) + "::start\"><span class=\"bdot\"></span>START</div>")
		msset := map[int]bool{}
		for _, m := range policyMilestones(rigorOf(it, cfg)) {
			msset[m] = true
		}
		for m := range lanes {
			msset[m] = true
		}
		var mss []int
		for m := range msset {
			mss = append(mss, m)
		}
		sort.Ints(mss)
		for _, ms := range mss {
			members := lanes[ms]
			sort.Strings(members)
			gate := milestoneGate(members, ms)
			var subs []string
			for _, m := range members {
				if m != gate {
					subs = append(subs, m)
				}
			}
			d := 0
			for _, x := range subs {
				if sm[x] == "DONE" {
					d++
				}
			}
			gmark := mark("OPEN")
			attr := ""
			if gate != "" {
				gmark = mark(sm[gate])
				attr = " data-nid=\"" + esc(gate) + "\""
			}
			body := renderSubs(subs, nodes, sm)
			if len(subs) == 0 {
				body = "<div class=\"mshint\">no subtasks</div>"
			}
			openAttr := ""
			if len(subs) > 0 {
				openAttr = " open"
			}
			b.WriteString(fmt.Sprintf("<details class=\"ms%s\"><summary%s>%s<span class=\"mstag\">M%d</span><span class=\"mscount\">%d/%d</span></summary><div class=\"kids\">%s</div></details>",
				openAttr, attr, gmark, ms, d, len(subs), body))
		}
		if len(loose) > 0 {
			b.WriteString("<div class=\"kids nolane\">" + renderSubs(loose, nodes, sm) + "</div>")
		}
		endok := ""
		if len(gates) > 0 && done == len(gates) {
			endok = " ok"
		}
		b.WriteString("<div class=\"bracket end" + endok + "\" data-bracket=\"" + esc(it) + "::end\"><span class=\"bdot\"></span>END</div>")
		b.WriteString("</div></details>")
	}
	return b.String()
}

func metricCards(nodes map[string]Node, sm map[string]string, cfg Config) string {
	var gates []string
	for id := range nodes {
		if sm[id] != "CONTENT" {
			gates = append(gates, id)
		}
	}
	total := len(gates)
	content := len(nodes) - total
	done, suspect := 0, 0
	var killers, derived []string
	kdone, ddone := 0, 0
	for _, id := range gates {
		if sm[id] == "DONE" {
			done++
		}
		if sm[id] == "SUSPECT" {
			suspect++
		}
		if nodes[id].Killer {
			killers = append(killers, id)
			if sm[id] == "DONE" {
				kdone++
			}
		}
		if strings.HasPrefix(nodes[id].Verify, "coverage:") {
			derived = append(derived, id)
			if sm[id] == "DONE" {
				ddone++
			}
		}
	}
	mx := metricsReport()
	holes := CoverageHoles(nodes, cfg.Version)
	vcov := "clean"
	if len(holes) > 0 {
		vcov = fmt.Sprintf("%d holes", len(holes))
	}
	type card struct{ label, val, form string }
	cards := []card{
		{"Gate state", fmt.Sprintf("%d / %d", done, total), "DONE ÷ total GATES (trace excluded)"},
		{"Suspect frontier", fmt.Sprintf("%d", suspect), "gates currently in SUSPECT"},
		{"Killer coverage", fmt.Sprintf("%d / %d", kdone, len(killers)), "killer DONE ÷ killer total"},
		{"Derived gates", fmt.Sprintf("%d / %d", ddone, len(derived)), "coverage-derived subtasks passing ÷ total"},
		{"Trace content", fmt.Sprintf("%d", content), "work-product nodes (need/uc/req/design/test/adr)"},
		{"V-model coverage", vcov, "n>=1 over the full trace through this iteration (cumulative)"},
		{"Reversal rate", fmt.Sprintf("%d / %d", mx["reversal"][0], mx["reversal"][1]), "re-attestations after a change ÷ blesses"},
		{"Rework rate", fmt.Sprintf("%d / %d", mx["rework"][0], mx["rework"][1]), "checks re-blessed ÷ blessed checks"},
		{"Self-cert ratio", fmt.Sprintf("%d / %d", mx["selfcert"][0], mx["selfcert"][1]), "agent-blessed killers ÷ killer checks"},
	}
	var b strings.Builder
	for _, c := range cards {
		b.WriteString(fmt.Sprintf("<div class=\"card\" data-mlabel=\"%s\" data-mval=\"%s\" data-mform=\"%s\"><div class=\"cval\">%s</div><div class=\"clabel\">%s</div></div>",
			esc(c.label), esc(c.val), esc(c.form), esc(c.val), esc(c.label)))
	}
	return b.String()
}

func projectDesc() string {
	raw, err := os.ReadFile(filepath.Join(ROOT, "README.md"))
	if err == nil {
		for _, line := range strings.Split(string(raw), "\n") {
			t := strings.TrimSpace(line)
			if t != "" && !strings.HasPrefix(t, "#") {
				return t
			}
		}
	}
	return ""
}

// design: go-report  implements: report-requirements, req-behavior-parity, req-trace-filter
// A faithful port of the deterministic report shell: a 3-column grid (iterations tree with
// START/END brackets, a trace graph of per-need tabs with server-baked positions + a type legend,
// and metric cards + a detail panel). Pure display: rendering never runs checks (the engine guard).
// Plus one filter box over the graph: iteration predicates (0001, <=0002, >=0001), text or /regex/,
// combined with AND/OR, on-focus help; on change a breadthfirst relayout of the visible subgraph.
// reportOutDir returns the directory that report links are made relative to. Node paths are absolute
// (walked from an absolute SPEC), so outDir must be absolute too — otherwise filepath.Rel(outDir, path)
// errors and yields "", blanking every href and verdict link when rendered with a RELATIVE --out.
func reportOutDir(outPath string) string {
	d := filepath.Dir(outPath)
	if abs, err := filepath.Abs(d); err == nil {
		return abs
	}
	return d
}

// View-only: it never changes the committed HTML or the determinism root.
func RenderReport(outPath string) error {
	if outPath == "" {
		outPath = filepath.Join(QUACK, "out", "report.html")
	}
	outDir := reportOutDir(outPath)
	nodes := LoadAll()
	// The report is a display: show the persisted status snapshot, never re-run checks here.
	// Recompute only when an input (spec, product, attest) is newer than the snapshot.
	var sm map[string]string
	if snapshotFresh() {
		sm = loadSnapshot()
	}
	if sm == nil {
		sm = StatusMap(nodes)
	}
	root := MerkleRoot(nodes)
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))

	iters := map[string][]string{}
	for id, n := range nodes {
		it := iterationOfNode(n, nodes, nil)
		iters[it] = append(iters[it], id)
	}
	if es, err := os.ReadDir(filepath.Join(SPEC, "iterations")); err == nil {
		for _, e := range es {
			if e.IsDir() {
				if _, ok := iters[e.Name()]; !ok {
					iters[e.Name()] = []string{}
				}
			}
		}
	}

	data := map[string]interface{}{}
	data["tabs"] = graphTabs(nodes, sm)
	data["checks"] = checksMap(nodes, sm, outDir)
	im := map[string]interface{}{}
	for it, ids := range iters {
		d := 0
		for _, x := range ids {
			if sm[x] == "DONE" {
				d++
			}
		}
		m := readIterMeta(it)
		typ, rig, status := m.Type, m.Rigor, m.Status
		if it == cfg.Version {
			if typ == "" {
				typ = cfg.Type
			}
			if rig == "" {
				rig = cfg.Rigor
			}
			if status == "" {
				status = "active"
			}
		} else if status == "" && len(ids) > 0 && d == len(ids) {
			status = "done"
		}
		im[it] = map[string]interface{}{"name": it, "done": d, "total": len(ids),
			"type": typ, "rigor": rig, "motivation": m.Motivation, "status": status, "current": it == cfg.Version}
	}
	data["itermeta"] = im
	data["project"] = map[string]string{"name": filepath.Base(ROOT), "desc": projectDesc()}
	gdata, _ := json.Marshal(data)

	var H strings.Builder
	H.WriteString("<!doctype html><html lang=en><head><meta charset=utf-8>")
	H.WriteString("<meta name=viewport content='width=device-width,initial-scale=1'>")
	H.WriteString("<title>" + esc(filepath.Base(ROOT)) + " — report</title>")
	H.WriteString("<style>" + reportCSS + "</style></head><body>")
	H.WriteString(fmt.Sprintf("<header>%s<div class=h1 id=ptitle title='click for project info'>%s</div><div class=hash>⛓ %s</div><div class=stamp>%s</div></header>",
		brandLogoInline(), esc(filepath.Base(ROOT)), root[:12], esc(gitStamp())))
	H.WriteString("<main class=grid>")
	H.WriteString("<section class=col><h2>Iterations</h2>" + iterationsPanel(nodes, sm, iters, cfg) + "</section>")
	H.WriteString("<section class=col mid><h2>Trace graph</h2>" +
		"<div id=tabbar class=tabbar></div>" +
		"<div class=legendrow>" + reportLegend +
		"<input id=trace-filter placeholder='filter… (click for help)' title='filter the graph' autocomplete=off></div>" +
		"<div id=graph></div><noscript><p class=ns>Enable scripts for the interactive graph.</p></noscript></section>")
	H.WriteString("<section class='col right'><h2>Metrics</h2><div class=cards>" + metricCards(nodes, sm, cfg) + "</div>" +
		"<h2 class=push>Details</h2><div id=detail class=detail><div class=dempty>click an element to show detail</div></div></section>")
	H.WriteString("</main>")
	H.WriteString("<script>window.QUACK_DATA=" + string(gdata) + ";</script>")
	H.WriteString("<script>" + assetJS("cytoscape.min.js") + "</script>")
	H.WriteString("<script>" + assetJS("dagre.min.js") + "</script>")
	H.WriteString("<script>" + assetJS("cytoscape-dagre.js") + "</script>")
	H.WriteString("<script>" + reportJS + "</script>")
	H.WriteString("</body></html>")

	os.MkdirAll(outDir, 0o755)
	return os.WriteFile(outPath, []byte(H.String()), 0o644)
}

// enddesign
