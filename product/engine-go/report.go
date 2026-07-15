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
	"strconv"
	"strings"
)

// assetJS reads a vendored JS asset from disk and returns it for inlining into the report (one
// self-contained, emailable report.html). Not baked into the binary: a JS blob inside the .exe
// trips AV heuristics. The report inlines cytoscape + dagre + cytoscape-dagre.
func assetJS(name string) string {
	for _, p := range []string{
		filepath.Join(EngineDir(), "assets", name), // vendored (vehicle) or dogfood
		filepath.Join(EngineSrc(), "assets", name), // engine-go/assets fallback
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
// requirement they implement, not a phantom group. A target may name a numbered
// statement (req-x.2); the ONE suffix helper (go-sub-addressing) resolves it, raw id first.
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
		if _, ok := nodes[q]; !ok {
			if b := subAddrBase(q); b != q {
				if _, ok := nodes[b]; ok {
					q = b
				}
			}
		}
		if qn, ok := nodes[q]; ok && !seen[q] {
			return iterationOfNode(qn, nodes, seen)
		}
	}
	return "i0000_baseline"
}

// The graph whitelist holds the SIX core types with toggles: the item types - candidate,
// stakeholder, raid, rationale, record, and the extension kinds - are content, never
// graph nodes; the engine's traceContent classification keeps them counted and off
// the walkable board.
var traceTypes = map[string]bool{"need": true, "usecase": true, "requirement": true, "design": true, "test": true, "adr": true}

// A semantic target may name a numbered statement (req-x.2). The graph resolves it
// against the base node with the ONE suffix helper (go-sub-addressing); the raw id
// wins when it names a node. Targets that collapse to one base keep one edge.
func traceEdges(n Node, nodes map[string]Node) [][2]string {
	var e [][2]string
	seen := map[[2]string]bool{}
	add := func(q, kind string) {
		if _, ok := nodes[q]; !ok {
			if b := subAddrBase(q); b != q {
				if _, ok := nodes[b]; ok {
					q = b
				}
			}
		}
		k := [2]string{q, kind}
		if seen[k] {
			return
		}
		seen[k] = true
		e = append(e, k)
	}
	for _, q := range n.Refines {
		add(q, "refines")
	}
	for _, q := range n.Implements {
		add(q, "implements")
	}
	for _, q := range n.Verifies {
		add(q, "verifies")
	}
	for _, q := range n.Addresses {
		add(q, "addresses")
	}
	return e
}

func edgesOf(n Node, nodes map[string]Node) [][2]string {
	e := traceEdges(n, nodes)
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

// design: go-render-folds  implements: req-trace-clustered
// The trace graph renders UNFOLDED, one tab per need, in the report and the book alike.
// It carries the semantic design dimension ONLY - no fold boxes, no iteration or age
// grouping (adr-trace-graph-unfolded): age is the iteration sidebar's concept, and each
// node gel carries an "iter" attribute for filters. The report adds the (unrooted)
// leftovers tab for strays the operator must see; the book renders per-need tabs only,
// decisions only when architectural (bookGraphTabs). Render compaction for large tabs
// is an open design discussion, deliberately NOT solved here.

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
		els = append(els, gel{Data: map[string]string{"id": id, "label": id, "type": n.Type,
			"state": sm[id], "killer": k, "iter": iterationOfNode(n, nodes, nil)}})
	}
	for _, id := range ids {
		for _, e := range traceEdges(nodes[id], nodes) {
			if !idset[e[0]] {
				continue
			}
			els = append(els, gel{Data: map[string]string{"id": e[0] + "__" + id, "source": e[0], "target": id, "etype": e[1]}})
		}
	}
	return gtab{Label: label, Count: len(ids), Elements: els}
}

// enddesign

// graphTabs bakes the REPORT's trace tabs: folds on, every live decision, and the
// (unrooted) leftovers tab for strays the operator must see.
func graphTabs(nodes map[string]Node, sm map[string]string) []gtab {
	return traceTabs(nodes, sm, false)
}

// bookGraphTabs bakes the BOOK's trace tabs: the clean per-need trace. No folds,
// no (unrooted) tab (a node reaching no need root does not render), and decisions
// only when architectural - project and strategy decisions read in the project
// chapter's table, never in the trace graph.
func bookGraphTabs(nodes map[string]Node, sm map[string]string) []gtab {
	return traceTabs(nodes, sm, true)
}

func traceTabs(nodes map[string]Node, sm map[string]string, book bool) []gtab {
	tnodes := map[string]Node{}
	for id, n := range nodes {
		if !traceTypes[n.Type] {
			continue
		}
		if n.Type == "adr" && addressesSink(n) {
			continue // graveyard/parked decisions live OUTSIDE the requirement trace by design
			// (go-decisions); their read paths are `decisions --parked` and the archive, not the graph.
		}
		if book && n.Type == "adr" && !decisionArchitectural(n) {
			continue
		}
		tnodes[id] = n
	}
	children := map[string][]string{}
	for id, n := range tnodes {
		for _, e := range traceEdges(n, tnodes) {
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
	if book {
		return tabs
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
	bl := latestBless()
	for id, n := range nodes {
		var edges []string
		for _, e := range edgesOf(n, nodes) {
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
		// design: go-verdict-link  implements: req-report-check-display.2
		// Every DONE check surfaces its VERDICT: the bless attestation (actor · short-hash) for a review
		// check, or "engine-verified" for an executed check — read from the attest log — so a DONE check
		// shows WHY it passed even when NO milestone evidence doc exists. The optional
		// verdict_href deep-links the M<n>-*.md doc when one is present. selftest:report-verdict guards it.
		verdict, verdictHref := "", ""
		if sm[id] == "DONE" {
			if n.Class == "executed" {
				verdict = "engine-verified · executed"
			} else if e, ok := bl[id]; ok {
				actor := normActor(e.Actor) // legacy records read as user (go-stamp-user)
				h := e.Hash
				if len(h) > 8 {
					h = h[:8]
				}
				verdict = "blessed · " + actor + " · " + h
			}
			if n.Milestone > 0 {
				it := iterationOfNode(n, nodes, nil)
				for _, pat := range []string{fmt.Sprintf("M%d-*.md", n.Milestone), filepath.Join("design", fmt.Sprintf("M%d*.md", n.Milestone))} {
					if m, _ := filepath.Glob(filepath.Join(SPEC, "iterations", it, pat)); len(m) > 0 {
						rel, _ := filepath.Rel(outDir, m[0])
						verdictHref = filepath.ToSlash(rel)
						break
					}
				}
			}
		}
		// enddesign
		out[id] = map[string]interface{}{"id": id, "type": n.Type, "state": sm[id], "killer": k,
			"stmt": n.Statement, "edges": edges, "verify": n.Verify, "href": href, "verdict": verdict, "verdict_href": verdictHref,
			"cause": checkCause(id, n, nodes, sm, bl)}
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

// design: go-trace-nesting  implements: req-report-check-display.1, req-build-test-nesting
// renderSubs nests subtasks: children (parent: <id>) render beneath their parent, collapsible; leaves
// render flat. The third level (build/test parents) reflects real hierarchy; selftest:report-nesting guards it.
// enddesign
// renderSubs renders a milestone's subtasks as a tree: a node's children (parent: <id>)
// nest beneath it. A parent (e.g. a generic "build" task) groups its planned steps; leaves
// render flat. Trace nodes (tests, etc.) are content and never appear here — only gates.
func renderSubs(ids []string, nodes map[string]Node, sm map[string]string) string {
	return renderSubsMarked(ids, nodes, sm, nil)
}

func renderSubsCurrent(ids []string, nodes map[string]Node, sm map[string]string, currentID string) string {
	marked := map[string]bool{}
	if currentID != "" {
		marked[currentID] = true
	}
	return renderSubsMarked(ids, nodes, sm, marked)
}

func renderSubsMarked(ids []string, nodes map[string]Node, sm map[string]string, marked map[string]bool) string {
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
		if marked[id] {
			auto += " <span class=\"auto current\" title=\"this page blesses this check\">this page</span>"
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

func milestoneDisplayTitle(iter string, ms int, nodes map[string]Node) string {
	if ms <= 0 {
		return "standalone"
	}
	label := "M" + strconv.Itoa(ms)
	for id, n := range nodes {
		if n.Milestone != ms || iterOf(n.Path) != iter || !strings.HasSuffix(id, "-gate") {
			continue
		}
		title := strings.TrimSpace(n.Statement)
		for _, suffix := range []string{" reviewed and adjudicated.", " reviewed and adjudicated"} {
			title = strings.TrimSuffix(title, suffix)
		}
		if title == "" {
			return label
		}
		if strings.HasPrefix(title, label) {
			return title
		}
		return label + " " + title
	}
	return label
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
		frac, fracCls := "planned", "frac"
		if len(gates) > 0 {
			frac = fmt.Sprintf("%d/%d", done, len(gates))
			if done == len(gates) {
				fracCls = "frac ok" // a fully-done iteration wears its count green
			}
		}
		b.WriteString(fmt.Sprintf("<details class=\"iter%s\"%s><summary data-iter=\"%s\">%s <span class=\"%s\">%s</span></summary>", cur, op, esc(it), esc(it), fracCls, frac))
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
			b.WriteString(fmt.Sprintf("<details class=\"ms%s\"><summary%s>%s<span class=\"mstag\">%s</span><span class=\"mscount\">%d/%d</span></summary><div class=\"kids\">%s</div></details>",
				openAttr, attr, gmark, esc(milestoneDisplayTitle(it, ms, nodes)), d, len(subs), body))
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
		// the three attest-log ratios are removed (never consulted; the veto decision
		// records the testimony) - git history is their archive
	}
	// standalone checks: one card each, evaluated LIVE (adr-standalone-suite — workspace-state
	// watchers; a cached verdict would freeze the tripwire).
	for _, n := range standaloneChecks(nodes) {
		v := "OK ✓"
		if !runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):])) {
			v = "RED ✗"
		}
		cards = append(cards, card{"Workspace check: " + n.ID, v, "standalone — live, outside every verification suite"})
	}
	var b strings.Builder
	for _, c := range cards {
		b.WriteString(fmt.Sprintf("<div class=\"card\" data-mlabel=\"%s\" data-mval=\"%s\" data-mform=\"%s\"><div class=\"cval\">%s</div><div class=\"clabel\">%s</div></div>",
			esc(c.label), esc(c.val), esc(c.form), esc(c.val), esc(c.label)))
	}
	// the spec-book card: clickable, opens the docu rendered beside this
	// report (quack report book writes book.html into the same out dir). Later enhancement
	// recorded in the notes: the card shows which spec state the docu represents (its stamp).
	b.WriteString("<a class=\"card\" href=\"book.html\" target=\"_blank\" rel=\"noopener\" style=\"text-decoration:none;color:inherit\" title=\"open the spec book in a new tab (render it with: quack report book)\"><div class=\"cval\">📖 👆</div><div class=\"clabel\">The spec book — click to open</div></a>")
	return b.String()
}

func projectDesc() string {
	raw, err := os.ReadFile(filepath.Join(ROOT, "README.md"))
	if err != nil {
		return ""
	}
	// The FIRST TWO text paragraphs: skip structural lines (headings, HTML, blockquotes,
	// tables, images, rules, fences); collect consecutive text paragraphs and stop at the
	// first structural line after text began, capped at two. BOM-stripped per line — a
	// BOM'd README can smuggle its logo markup past the '<' check.
	var paras []string
	var cur []string
	collecting := false
	flush := func() {
		if len(cur) > 0 {
			paras = append(paras, strings.Join(cur, " "))
			cur = nil
		}
	}
	for _, line := range strings.Split(strings.TrimPrefix(string(raw), "\ufeff"), "\n") {
		t := strings.TrimSpace(strings.TrimPrefix(line, "\ufeff"))
		if t == "" {
			flush()
			continue
		}
		structural := strings.HasPrefix(t, "#") || strings.HasPrefix(t, "<") ||
			strings.HasPrefix(t, ">") || strings.HasPrefix(t, "|") ||
			strings.HasPrefix(t, "![") || strings.HasPrefix(t, "---") ||
			strings.HasPrefix(t, "```")
		if structural {
			if collecting {
				break
			}
			continue
		}
		collecting = true
		cur = append(cur, t)
	}
	flush()
	if len(paras) > 2 {
		paras = paras[:2] // the card carries the first TWO text paragraphs, no more
	}
	text := strings.Join(paras, "\n\n")
	for _, m := range []string{"**", "*", "`"} {
		text = strings.ReplaceAll(text, m, "")
	}
	return strings.TrimSpace(text)
}

// design: go-report  implements: report-requirements, req-go-port.1, req-trace-filter
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

var renderBusy bool // see renderingTests (coverage.go): bounds battery re-entry from renders

// View-only: it never changes the committed HTML or the determinism root.
func RenderReport(outPath string) error {
	renderBusy = true
	defer func() { renderBusy = false }()
	if outPath == "" {
		outPath = filepath.Join(dataDirFor("out"), "report.html")
	}
	outDir := reportOutDir(outPath)
	nodes := LoadAll()
	// The report always recomputes live — no cached snapshot. A stale snapshot could show a cached
	// pass (a green that a live re-run would fail); computing fresh every render makes the board
	// always truthful. Cheap now that checks are fast + deterministic. Pairs with --watch live-reload.
	sm := StatusMap(nodes)
	root := MerkleRoot(nodes)
	cfg := readProjectConfig()

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
		"<input id=trace-filter placeholder='filter… (click for help)' title='filter the graph' autocomplete=off><button id=filter-clear title='clear the filter'>&#215;</button></div>" +
		"<div id=graph></div><noscript><p class=ns>Enable scripts for the interactive graph.</p></noscript></section>")
	H.WriteString("<section class='col right'><h2>Metrics</h2><div class=cards>" + metricCards(nodes, sm, cfg) + "</div>" +
		"<h2 class=push>Details</h2><div id=detail class=detail><div class=dempty>click an element to show detail</div></div></section>")
	H.WriteString("</main>")
	// NO standing register (adr-handoff-html): provenance stays node data; colors
	// render only on the per-gate hand-off page.
	H.WriteString("<script>window.QUACK_DATA=" + string(gdata) + ";</script>")
	H.WriteString("<script>" + assetJS("cytoscape.min.js") + "</script>")
	H.WriteString("<script>" + assetJS("dagre.min.js") + "</script>")
	H.WriteString("<script>" + assetJS("cytoscape-dagre.js") + "</script>")
	H.WriteString("<script>" + reportJS + "</script>")
	// live-reload hook: when served by `quack report --watch`, the SSE endpoint pushes on source
	// change and the page reloads. Harmless as a standalone file:// report (EventSource silently fails).
	H.WriteString("<script>try{new EventSource('/__reload').onmessage=function(){location.reload()}}catch(e){}</script>")
	H.WriteString("</body></html>")

	os.MkdirAll(outDir, 0o755)
	return os.WriteFile(outPath, []byte(H.String()), 0o644)
}

// enddesign

// design: go-register-render  implements: req-register-render
// The REGISTER: fill/adjudicate as UI (adr-register-in-report). One row per node whose
// TYPE carries its own schema fields; the row collapses to statement + computed color
// chip (go-register-colors), the first disclosure level shows the CORE fields, the
// second every field with its provenance line. The two greens wear DISTINCT marks
// (adjudicated = filled, agent-confident = outlined) so a proposal never reads as a
// decision. A KILLER node's row carries the pager pointer and no answer affordance
// (req-register-killer-guard); a red non-killer row carries the answer affordance the
// watch lane activates (b7) and the static file leaves inert.
// renderHandoffHTML is the adjudication page (adr-handoff-html): one gate as a DECISION
// BRIEF on a single phone-sized card, centered unchanged on a desktop, no page scroll.
// Top: gate id, the gate's question, a one-line BLUF wearing the striped agent chip (a
// proposal, never a ruling). Middle: the summary lines — you-must-decide, settle
// later, riding a default, done. Tests and walked steps appear NOWHERE: they are
// state, never decisions, and the brief is only about decisions (owner ruling); a
// killer DEMO settles at its own milestone and rides the "settle later" line; the
// decide view deals the blockers ONE AT A TIME (‹ › deck) — every card states in
// plain words WHAT A BLESS ACCEPTS (the agent's defaults become the ruling; a killer
// gate is adjudicated individually in the user's name). Bottom: the page's ONLY two
// actions, y/n — a y makes handoffBless record everything stated. The buttons POST to the
// local watch server; on a stale file with no listener they no-op by design (the
// owner's ruling). Self-contained: no external asset, ever.
// handoffCone is the gate's adjudication material: its direct inputs plus every
// register-eligible trace node of the gate's iteration.
func handoffCone(gate Node, nodes map[string]Node) map[string]bool {
	member := map[string]bool{}
	for _, d := range gate.DependsOn {
		member[d] = true
	}
	it := iterOf(gate.Path)
	for id, n := range nodes {
		if iterOf(n.Path) == it && traceContent[n.Type] && n.Type != "manifest" {
			member[id] = true
		}
	}
	return member
}

// handoffDefault is one stated consequence of a bless: this field of this node
// gets recorded at this value, in the user's name.
type handoffDefault struct{ node, field, value string }

// handoffBriefText is the phone-lane rendering of the decision brief: the same
// content the page shows — BLUF, each open decision with its options and the
// letter a bless selects — as plain text under the ntfy ceiling.
func handoffBriefText(gateID string, nodes map[string]Node, sm map[string]string) string {
	gate, ok := nodes[gateID]
	if !ok {
		return ""
	}
	fs, killers := handoffAccepts(gateID, nodes, sm)
	byNode := map[string][]handoffDefault{}
	var order []string
	for _, f := range fs {
		if len(byNode[f.node]) == 0 {
			order = append(order, f.node)
		}
		byNode[f.node] = append(byNode[f.node], f)
	}
	var b strings.Builder
	b.WriteString(gateID + " — " + gate.Statement + "\n")
	switch nd := len(order) + len(killers); {
	case nd == 0:
		b.WriteString("agent: recommend bless — nothing blocks\n")
	case nd == 1:
		b.WriteString("agent: recommend hold — 1 decision is open\n")
	default:
		b.WriteString("agent: recommend hold — " + strconv.Itoa(nd) + " decisions are open\n")
	}
	for _, id := range order {
		n := nodes[id]
		b.WriteString("\nDECIDE " + id + ": " + n.Statement + "\n")
		for _, p := range nodeBodySection(n.Path, "Options") {
			b.WriteString(p + "\n")
		}
		if v := frontmatterMap(n.Path)["decided_via"]; v != "" {
			b.WriteString("Bless selects " + selLetter(v) + "\n")
		} else {
			var parts []string
			for _, f := range byNode[id] {
				parts = append(parts, f.field+" = "+f.value)
			}
			b.WriteString("Bless selects " + strings.Join(parts, "; ") + "\n")
		}
	}
	for _, id := range killers {
		b.WriteString("\nKILLER " + id + ": " + nodes[id].Statement + "\nBless adjudicates it, in your name.\n")
	}
	b.WriteString("\n👍 records the selections above and blesses " + gateID + ".")
	return b.String()
}

// optHTML renders one Options paragraph; a leading "A) " letter goes bold.
func optHTML(p string) string {
	e := esc(p)
	if len(e) > 3 && e[0] >= 'A' && e[0] <= 'Z' && e[1] == ')' && e[2] == ' ' {
		return "<b>" + e[:2] + "</b>" + e[2:]
	}
	return e
}

// selLetter reduces a lettered ruling ("B (adr-x)", "B — ...") to its letter: "B)".
func selLetter(v string) string {
	if v != "" && v[0] >= 'A' && v[0] <= 'Z' && (len(v) == 1 || v[1] == ' ' || v[1] == ')') {
		return string(v[0]) + ")"
	}
	return v
}

// nodeBodySection returns the paragraphs of one `## <title>` section of a node's
// body — the authored prose a decision card shows (e.g. the Options block).
func nodeBodySection(path, title string) []string {
	body := nodeBodySectionRaw(path, title)
	if body == "" {
		return nil
	}
	var out []string
	for _, p := range strings.Split(body, "\n\n") {
		p = strings.TrimSpace(strings.ReplaceAll(p, "\n", " "))
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func nodeBodySectionRaw(path, title string) string {
	raw, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	text := strings.ReplaceAll(string(raw), "\r\n", "\n")
	parts := strings.SplitN(text, "\n## "+title, 2)
	if len(parts) < 2 {
		return ""
	}
	body := parts[1]
	if i := strings.Index(body, "\n## "); i >= 0 {
		body = body[:i]
	}
	if i := strings.Index(body, "\n"); i >= 0 {
		body = body[i+1:]
	}
	return strings.TrimSpace(body)
}

var handoffMermaidFenceRe = regexp.MustCompile("(?s)```mermaid[ \t]*\n(.*?)```")

func handoffEvidenceHTML(body string, nodes map[string]Node) string {
	body = strings.ReplaceAll(body, "\r\n", "\n")
	var out strings.Builder
	writeSegment := func(seg string) {
		var buf []string
		flush := func() {
			if strings.TrimSpace(strings.Join(buf, "\n")) != "" {
				out.WriteString(mdLite(strings.Join(buf, "\n")))
			}
			buf = nil
		}
		for _, line := range strings.Split(seg, "\n") {
			if m := figRefRe.FindStringSubmatch(strings.TrimSpace(line)); m != nil {
				flush()
				out.WriteString(`<figure data-layer="figure">` + renderFigure(m[1], nodes) + `</figure>` + "\n")
				continue
			}
			buf = append(buf, line)
		}
		flush()
	}
	last := 0
	for _, m := range handoffMermaidFenceRe.FindAllStringSubmatchIndex(body, -1) {
		if seg := body[last:m[0]]; strings.TrimSpace(seg) != "" {
			writeSegment(seg)
		}
		src := body[m[2]:m[3]]
		g, lint := extractModelGraph(src)
		if len(lint) == 0 && len(g.Elems) > 0 {
			out.WriteString(`<div class="handoff-model">` + svgModelGraph(g) + `</div>` + "\n")
		} else {
			out.WriteString("<pre><code>" + esc(src) + "</code></pre>\n")
		}
		last = m[1]
	}
	if seg := body[last:]; strings.TrimSpace(seg) != "" {
		writeSegment(seg)
	}
	return out.String()
}

// handoffAccepts computes what a y on the gate's page records: every red
// (unadjudicated) field default on a non-killer register node of the cone, plus
// every ripe killer GATE in the cone — each blessed individually, actor=user.
// A killer that is CONTENT (a demo use case) is never in the set: it settles at
// its own milestone.
func handoffAccepts(gateID string, nodes map[string]Node, sm map[string]string) ([]handoffDefault, []string) {
	gate, ok := nodes[gateID]
	if !ok {
		return nil, nil
	}
	schemas := loadFieldSchemas(schemaConfigDir())
	member := handoffCone(gate, nodes)
	ids := make([]string, 0, len(member))
	for id := range member {
		if id != gateID {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	var fs []handoffDefault
	var killers []string
	for _, id := range ids {
		n, ok := nodes[id]
		if !ok {
			continue
		}
		if n.Killer && isGate(n) {
			if sm[id] != "DONE" {
				killers = append(killers, id)
			}
			continue
		}
		if n.Type == "test" || n.Type == "" {
			continue
		}
		schema := mergedSchema(schemas, n.Type)
		fm := frontmatterMap(n.Path)
		if len(schema.fields) == 0 || fm["id"] != id {
			continue
		}
		prov := n.Maps["provenance"]
		names := make([]string, 0, len(schema.fields))
		for name := range schema.fields {
			names = append(names, name)
		}
		sort.Strings(names)
		for _, name := range names {
			fr := schema.fields[name]
			if fieldColor(fr, fm[name], prov[name]) != "red" {
				continue
			}
			val := fm[name]
			if val == "" && fr.defSet {
				val = fr.def
			}
			fs = append(fs, handoffDefault{node: id, field: name, value: val})
		}
	}
	return fs, killers
}

func renderHandoffHTML(gateID string, nodes map[string]Node, sm map[string]string) string {
	gate, ok := nodes[gateID]
	if !ok {
		return ""
	}
	it := iterOf(gate.Path)
	milestoneTitle := milestoneDisplayTitle(it, gate.Milestone, nodes)
	groupLabel := gateID
	markedTasks := map[string]bool{gateID: true}
	if group, mergedGate := pagerGroup(gateID, nodes, sm); len(group) > 0 && mergedGate != "" {
		markedTasks[mergedGate] = true
		others := 0
		if mergedGate != gateID {
			others++
		}
		for _, id := range group {
			markedTasks[id] = true
			if id != gateID {
				others++
			}
		}
		if others > 0 {
			groupLabel = gateID + " + " + strconv.Itoa(others) + " others"
		}
	}
	// the cone: the material the bless accepts (shared with handoffAccepts)
	member := handoffCone(gate, nodes)
	schemas := loadFieldSchemas(schemaConfigDir())
	var b strings.Builder
	b.WriteString(`<!doctype html><html><head><meta charset="utf-8">` +
		`<meta name="viewport" content="width=device-width, initial-scale=1">` +
		`<title>` + esc(milestoneTitle) + ` — hand-off</title><style>` + handoffCSS + `</style></head><body>`)

	// classify every cone row once: schema match, fields, computed color
	type hoffRow struct {
		id     string
		n      Node
		schema *typeSchema
		fm     map[string]string
		hasReg bool
		color  string
	}
	ids := make([]string, 0, len(member))
	for id := range member {
		if id == gateID {
			continue
		}
		if _, ok := nodes[id]; ok {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	rows := make([]hoffRow, 0, len(ids))
	for _, id := range ids {
		n := nodes[id]
		r := hoffRow{id: id, n: n, schema: mergedSchema(schemas, n.Type), fm: frontmatterMap(n.Path)}
		r.hasReg = len(r.schema.fields) > 0 && r.fm["id"] == id
		switch {
		case r.hasReg:
			r.color = "reg-" + nodeRegisterColor(r.schema, r.fm, n.Maps["provenance"])
		case sm[id] == "DONE":
			r.color = "reg-green-user"
		case sm[id] == "OPEN" || sm[id] == "SUSPECT":
			r.color = "reg-red"
		default:
			r.color = "reg-none"
		}
		rows = append(rows, r)
	}

	// the decision-brief buckets (owner rulings): the page is ONLY about decisions.
	// Open ones (red registers, ripe killer gates) go to the deck. The audit line
	// keeps only nodes where a RULING exists — a decided question, or a field ruled
	// by the user or the agent; a node merely riding defaults decided nothing and
	// appears nowhere. Tests and steps are state — the tasks panel's job.
	hasRuling := func(r hoffRow) bool {
		if r.fm["decided_via"] != "" {
			return true
		}
		if !r.hasReg {
			return false
		}
		prov := r.n.Maps["provenance"]
		for name, fr := range r.schema.fields {
			fc := fieldColor(fr, r.fm[name], prov[name])
			if fc == "green-user" || fc == "green-agent" {
				return true
			}
		}
		return false
	}
	var blockers, doneRows []hoffRow
	for _, r := range rows {
		switch {
		case r.n.Type == "test" || r.n.Type == "":
			// state, not a decision
		case r.color == "reg-red" || (r.n.Killer && isGate(r.n) && sm[r.id] != "DONE"):
			blockers = append(blockers, r)
		case hasRuling(r):
			doneRows = append(doneRows, r)
		}
	}
	doneOrder := map[string]int{"reg-green-user": 0, "reg-green-agent": 1, "reg-yellow": 2, "reg-none": 3}
	sort.SliceStable(doneRows, func(i, j int) bool {
		if doneOrder[doneRows[i].color] != doneOrder[doneRows[j].color] {
			return doneOrder[doneRows[i].color] < doneOrder[doneRows[j].color]
		}
		return doneRows[i].id < doneRows[j].id
	})
	sort.SliceStable(blockers, func(i, j int) bool {
		if blockers[i].n.Killer != blockers[j].n.Killer {
			return !blockers[i].n.Killer // answerable cards first, killer pointers last
		}
		qi, qj := blockers[i].n.Type == "question", blockers[j].n.Type == "question"
		if qi != qj {
			return qi
		}
		return blockers[i].id < blockers[j].id
	})
	// shared field rendering: mode all|red. Every field carries its machine-readable
	// proposal (data-field/data-value) so the card's accept-default can record it.
	writeFields := func(r hoffRow, mode string) {
		prov := r.n.Maps["provenance"]
		names := make([]string, 0, len(r.schema.fields))
		for name := range r.schema.fields {
			names = append(names, name)
		}
		sort.Strings(names)
		for _, name := range names {
			fr := r.schema.fields[name]
			fc := fieldColor(fr, r.fm[name], prov[name])
			if mode == "red" && fc != "red" {
				continue
			}
			raw := r.fm[name]
			val := raw
			if raw == "" && fr.defSet {
				raw = fr.def
				val = fr.def + " (default)"
			}
			red := ""
			if fc == "red" {
				red = ` data-red="1"`
			}
			b.WriteString(`<div class="hfield" data-tier="` + fr.tier + `" data-field="` + esc(name) + `" data-value="` + esc(raw) + `"` + red + `>` +
				`<span class="regdot reg-` + fc + `"></span>` +
				`<span class="hfn">` + esc(name) + `</span><span class="hfv">` + esc(val) + `</span>` +
				`<span class="hfp">` + esc(prov[name]) + `</span></div>`)
		}
	}
	writeRow := func(r hoffRow) {
		b.WriteString(`<details class="hrow" data-node="` + esc(r.id) + `">`)
		b.WriteString(`<summary><span class="regdot ` + r.color + `"></span><span class="hid">` + esc(r.id) + `</span>` +
			`<span class="hstmt">` + esc(r.n.Statement) + `</span></summary>`)
		// a decided decision reads like an open one: the options, then the letter
		if opts := nodeBodySection(r.n.Path, "Options"); len(opts) > 0 {
			for _, p := range opts {
				b.WriteString(`<p class="dopt">` + optHTML(p) + `</p>`)
			}
			if v := r.fm["decided_via"]; v != "" {
				b.WriteString(`<p class="dsel"><b>Decided:</b> ` + esc(selLetter(v)) + `</p>`)
			}
		}
		if r.hasReg {
			b.WriteString(`<details class="reg-all"><summary>fields</summary>`)
			writeFields(r, "all")
			b.WriteString(`</details>`)
		} else if r.n.Statement != "" {
			b.WriteString(`<p class="hbody">state: ` + esc(sm[r.id]) + `</p>`)
		}
		b.WriteString(`</details>` + "\n")
	}

	// blessSelects is the card's one plain line: the ruling a bless records.
	blessSelects := func(r hoffRow) string {
		if v := r.fm["decided_via"]; v != "" {
			return v
		}
		prov := r.n.Maps["provenance"]
		names := make([]string, 0, len(r.schema.fields))
		for name := range r.schema.fields {
			names = append(names, name)
		}
		sort.Strings(names)
		var parts []string
		for _, name := range names {
			fr := r.schema.fields[name]
			if fieldColor(fr, r.fm[name], prov[name]) != "red" {
				continue
			}
			val := r.fm[name]
			if val == "" && fr.defSet {
				val = fr.def
			}
			parts = append(parts, name+" = "+val)
		}
		if len(parts) == 0 {
			return "the recorded values (see fields)"
		}
		return strings.Join(parts, "; ")
	}

	// the brief: title, the gate's question, the BLUF line, the summary lines
	bluf := "recommend bless — nothing blocks"
	if len(blockers) == 1 {
		bluf = "recommend hold — 1 decision is open"
	} else if len(blockers) > 1 {
		bluf = "recommend hold — " + strconv.Itoa(len(blockers)) + " decisions are open"
	}
	b.WriteString(`<div class="hcard">`)
	b.WriteString(`<header class="hh"><p class="hg">` + esc(groupLabel) + `</p><h1>` + esc(milestoneTitle) + `</h1>` +
		`<p class="bluf"><span class="ag">agent</span>` + esc(bluf) + `</p></header>`)
	// the tasks panel data: every check of the iteration, milestone-grouped
	var taskIDs []string
	tasksDone := 0
	for id, n := range nodes {
		if iterOf(n.Path) == it && isGate(n) {
			taskIDs = append(taskIDs, id)
			if sm[id] == "DONE" {
				tasksDone++
			}
		}
	}
	sort.Strings(taskIDs)

	// Opt-in evidence rides the handoff when the check asks for it. Milestone gates
	// also carry the whole milestone verdict.
	var evidenceSecs, verdictSecs [][2]string
	if raw := nodeBodySectionRaw(gate.Path, "Handoff Evidence"); raw != "" {
		evidenceSecs = append(evidenceSecs, [2]string{"Evidence", handoffEvidenceHTML(raw, nodes)})
	}
	if gate.Milestone > 0 {
		pat := filepath.Join(SPEC, "iterations", it, fmt.Sprintf("M%d-*.md", gate.Milestone))
		if ms, _ := filepath.Glob(pat); len(ms) > 0 {
			if raw, err := os.ReadFile(ms[0]); err == nil {
				for _, p := range strings.Split("\n"+strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n## ")[1:] {
					lines := strings.SplitN(p, "\n", 2)
					title := strings.TrimSpace(lines[0])
					body := ""
					if len(lines) > 1 {
						body = lines[1]
					}
					sec := [2]string{title, handoffEvidenceHTML(body, nodes)}
					verdictSecs = append(verdictSecs, sec)
				}
			}
		}
	}

	b.WriteString(`<nav class="sum">`)
	b.WriteString(`<button class="sline on" data-view="decide"><span class="regdot reg-red"></span><span class="n">` +
		strconv.Itoa(len(blockers)) + `</span>&nbsp;you must decide<span class="chev">›</span></button>`)
	if len(doneRows) > 0 {
		b.WriteString(`<button class="sline" data-view="done"><span class="regdot reg-green-user"></span><span class="n">` +
			strconv.Itoa(len(doneRows)) + `</span>&nbsp;decided already<span class="chev">›</span></button>`)
	}
	if len(evidenceSecs) > 0 {
		b.WriteString(`<button class="sline" data-view="evidence"><span class="regdot reg-none"></span>evidence<span class="chev">›</span></button>`)
	}
	if len(verdictSecs) > 0 {
		b.WriteString(`<button class="sline" data-view="verdict"><span class="regdot reg-none"></span>milestone verdict<span class="chev">›</span></button>`)
	}
	if len(taskIDs) > 0 {
		b.WriteString(`<button class="sline" data-view="tasks"><span class="regdot reg-none"></span>tasks ` +
			strconv.Itoa(tasksDone) + `/` + strconv.Itoa(len(taskIDs)) + `<span class="chev">›</span></button>`)
	}
	b.WriteString(`</nav>`)

	// the middle: the one-at-a-time deck plus one list view per summary line
	b.WriteString(`<main><section class="view on" id="view-decide">`)
	if len(blockers) == 0 {
		b.WriteString(`<p class="dempty">nothing to decide — bless when ready 👍</p>`)
	} else {
		b.WriteString(`<div class="dnav"><button class="dbtn" id="dprev">‹</button>` +
			`<span class="dpos" id="dpos">1 / ` + strconv.Itoa(len(blockers)) + `</span>` +
			`<button class="dbtn" id="dnext">›</button></div>`)
		for i, r := range blockers {
			on := ""
			if i == 0 {
				on = " on"
			}
			killer := ""
			if r.n.Killer {
				killer = ` data-killer="1"`
			}
			b.WriteString(`<article class="dcard` + on + `" data-node="` + esc(r.id) + `"` + killer + `>`)
			b.WriteString(`<p class="did"><span class="regdot ` + r.color + `"></span>` + esc(r.id) + `</p>`)
			b.WriteString(`<p class="dstmt">` + esc(r.n.Statement) + `</p>`)
			for _, p := range nodeBodySection(r.n.Path, "Options") {
				b.WriteString(`<p class="dopt">` + optHTML(p) + `</p>`)
			}
			switch {
			case r.n.Killer:
				b.WriteString(`<p class="dsel"><b>Bless</b> adjudicates this killer, in your name.</p>`)
			case r.hasReg:
				b.WriteString(`<p class="dsel"><b>Bless selects</b> ` + esc(selLetter(blessSelects(r))) + `</p>`)
			default:
				b.WriteString(`<p class="dsel"><b>Bless</b> accepts this as it stands.</p>`)
			}
			if r.hasReg {
				b.WriteString(`<details class="reg-all"><summary>fields</summary>`)
				writeFields(r, "all")
				b.WriteString(`</details>`)
			}
			b.WriteString(`</article>`)
		}
	}
	b.WriteString(`</section>`)
	if len(doneRows) > 0 {
		b.WriteString(`<section class="view" id="view-done"><p class="vlead">Decided already — solid green you, outlined the agent, yellow a schema default. Bless changes nothing here.</p>`)
		for _, r := range doneRows {
			writeRow(r)
		}
		b.WriteString(`</section>`)
	}
	if len(evidenceSecs) > 0 {
		b.WriteString(`<section class="view" id="view-evidence"><p class="vlead">Evidence for this handoff.</p>`)
		for _, s := range evidenceSecs {
			b.WriteString(`<details class="hrow" open><summary><span class="hstmt">` + esc(s[0]) + `</span></summary>` +
				`<div class="vmd">` + s[1] + `</div></details>`)
		}
		b.WriteString(`</section>`)
	}
	if len(verdictSecs) > 0 {
		b.WriteString(`<section class="view" id="view-verdict"><p class="vlead">The milestone's evidence, one section per heading.</p>`)
		for _, s := range verdictSecs {
			b.WriteString(`<details class="hrow"><summary><span class="hstmt">` + esc(s[0]) + `</span></summary>` +
				`<div class="vmd">` + s[1] + `</div></details>`)
		}
		b.WriteString(`</section>`)
	}
	// the tasks panel: the report's own tree, milestone-grouped, current one open —
	// the auditor sees where the iteration stands (owner ruling)
	if len(taskIDs) > 0 {
		b.WriteString(`<section class="view" id="view-tasks">`)
		byMS := map[int][]string{}
		for _, id := range taskIDs {
			byMS[nodes[id].Milestone] = append(byMS[nodes[id].Milestone], id)
		}
		var mss []int
		for ms := range byMS {
			mss = append(mss, ms)
		}
		sort.Ints(mss)
		for _, ms := range mss {
			done := 0
			for _, id := range byMS[ms] {
				if sm[id] == "DONE" {
					done++
				}
			}
			label := milestoneDisplayTitle(it, ms, nodes)
			open := ""
			if ms == gate.Milestone {
				open = " open"
			}
			b.WriteString(`<details class="hrow"` + open + `><summary><span class="hid">` + label + `</span>` +
				`<span class="hstmt">` + strconv.Itoa(done) + ` / ` + strconv.Itoa(len(byMS[ms])) + ` done</span></summary>` +
				`<div class="ttree">` + renderSubsMarked(byMS[ms], nodes, sm, markedTasks) + `</div></details>`)
		}
		b.WriteString(`</section>`)
	}
	b.WriteString(`</main>`)

	b.WriteString(`<footer class="hfoot"><button class="hb hy" data-bless="` + esc(gateID) + `" data-verdict="y">👍 bless</button>` +
		`<button class="hb hn" data-bless="` + esc(gateID) + `" data-verdict="n">👎 reopen</button>` +
		`<span class="hnote" id="hnote"></span></footer>`)
	b.WriteString(`</div><script>` + handoffJS + `</script></body></html>`)
	return b.String()
}

// handoffCSS: a decision brief on one phone-sized card, centered unchanged on a
// desktop. No page scroll — only lists and the dealt card scroll, inside the middle
// area. The brief block stays compact; the deck gets the room. The agent chip wears
// stripes: a proposal, never a ruling.
const handoffCSS = `
:root{--red:#d6336c;--redb:#b02a5b;--yel:#f5c542;--yelb:#e0a800;--grn:#2f9e44;--mut:#e6e6e6;--mutb:#ccc}
html,body{height:100%}
body{margin:0;font:15px/1.4 system-ui,sans-serif;color:#1e1e1e;background:#dfe2e8;overflow:hidden;display:flex;justify-content:center}
.hcard{width:min(430px,100vw);height:100%;display:flex;flex-direction:column;background:#fafafa;box-shadow:0 0 24px rgba(0,0,0,.18)}
.hh{background:#fff;padding:8px 12px 6px}
.hg{margin:0;font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#777}
h1{margin:2px 0 4px;font-size:15px;line-height:1.3;overflow-wrap:anywhere}
.hsub{margin:0 0 4px;font-size:12px;color:#555;line-height:1.25;overflow-wrap:anywhere}
.bluf{margin:0;font-size:12px;color:#333;display:flex;gap:6px;align-items:center}
.ag{font-size:10px;font-weight:700;letter-spacing:.4px;color:#14531f;background:repeating-linear-gradient(135deg,#d9efdc 0 4px,#fff 4px 7px);border:1px solid var(--grn);border-radius:4px;padding:1px 5px;flex:none}
.sum{display:flex;flex-direction:column;background:#fff;border-bottom:1px solid #ddd}
.sline{display:flex;gap:8px;align-items:center;font:inherit;font-size:13px;padding:6px 12px;border:0;border-top:1px solid #f2f2f2;background:none;cursor:pointer;text-align:left;color:#1e1e1e}
.sline.on{background:#eef2fb}
.sline .n{font-weight:700}
.chev{margin-left:auto;color:#aaa}
main{flex:1;min-height:0;display:flex}
.view{flex:1;min-width:0;overflow-y:auto;padding:4px 10px;display:none}
.view.on{display:block}
#view-decide{overflow:hidden;padding:6px 10px}
#view-decide.on{display:flex;flex-direction:column}
.dnav{display:flex;align-items:center;gap:12px;justify-content:center;padding:0 0 6px}
.dbtn{font:inherit;font-size:17px;line-height:1;padding:5px 18px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer}
.dpos{font-size:12px;color:#666}
.dcard{display:none;flex:1;min-height:0;overflow-y:auto;border:1px solid #ddd;border-radius:12px;background:#fff;padding:10px 12px}
.dcard.on{display:block}
.did{margin:0;font-family:ui-monospace,Consolas,monospace;font-size:12px;font-weight:700;display:flex;gap:6px;align-items:center}
.dstmt{margin:6px 0;font-size:14px}
.dopt{margin:6px 0;font-size:12px;color:#444}
.dsel{margin:8px 0 4px;font-size:13px}
.dempty{margin:auto;color:#39763f;font-size:14px;text-align:center}
.hfoot{display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #ddd;align-items:center}
.hb{font:inherit;font-weight:600;padding:10px 0;border-radius:10px;border:1px solid #bbb;cursor:pointer;flex:1 1 0}
.hy{background:#e6f4e6}.hn{background:#fdeaea}
.hnote{font-size:11px;color:#777}
.regdot{width:12px;height:12px;border-radius:50%;flex:none;display:inline-block;vertical-align:-1px}
.regdot.reg-green-user{background:var(--grn);border:2px solid var(--grn)}
.regdot.reg-green-agent{background:#fff;border:2px solid var(--grn)}
.regdot.reg-yellow{background:var(--yel);border:2px solid var(--yelb)}
.regdot.reg-red{background:var(--red);border:2px solid var(--redb)}
.regdot.reg-none{background:var(--mut);border:2px solid var(--mutb)}
.hrow{border-top:1px solid #eee}
.hrow>summary{display:flex;gap:8px;align-items:center;padding:8px 0;cursor:pointer;list-style:none;min-width:0}
.hrow>summary::-webkit-details-marker{display:none}
.hid{font-family:ui-monospace,Consolas,monospace;font-size:11px;font-weight:600;flex:none;max-width:45vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hstmt{font-size:12px;color:#555;flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hrow[open]>summary{flex-wrap:wrap}
.hrow[open]>summary .hstmt{white-space:normal;overflow:visible;flex:1 1 100%}
.hfield{display:flex;gap:6px;align-items:baseline;font-size:12px;padding:4px 0 4px 8px;flex-wrap:wrap}
.hfn{font-weight:600;min-width:90px}.hfv{overflow-wrap:anywhere}.hfp{color:#888;font-style:italic;flex:1 1 100%;padding-left:20px}
.reg-all{margin:4px 0 8px 8px;font-size:12px}.reg-all>summary{cursor:pointer;color:#666}
.hbody{font-size:12px;color:#555;margin:4px 0 8px 8px}
.vlead{margin:6px 2px;font-size:11px;color:#777;font-style:italic}
.vmd{font-size:12px;color:#333;padding:2px 2px 10px}
.vmd p{margin:6px 0}
.vmd ul,.vmd ol{margin:6px 0;padding-left:18px}
.vmd li{margin:3px 0}
.vmd h1,.vmd h2,.vmd h3,.vmd h4{font-size:12px;margin:8px 0 4px}
.vmd a{color:#2456b3;text-decoration:none;border-bottom:1px dotted #2456b3}
.vmd code{font-family:ui-monospace,Consolas,monospace;font-size:11px;background:#f2f2f2;padding:0 3px;border-radius:3px}
.vmd figure{margin:6px 0}.vmd .onion .oview[hidden]{display:none}.vmd .onion [data-onion-go]{cursor:pointer}.vmd .onion-flow{overflow-x:auto;max-width:100%}.vmd .onion-flow svg{display:block}.vmd .onion svg{cursor:grab;touch-action:none;max-width:100%}.vmd .onion [data-node-link],.vmd .onion .oblock,.vmd .onion .opill{cursor:pointer}.vmd .onion .osel>rect{stroke:#1b6fd6;stroke-width:2.6}.vmd .onion .oc-nb>rect{stroke:#1b6fd6;stroke-width:2}.vmd .onion .oc-on{stroke:#1b6fd6;stroke-width:2.6;opacity:1}
.ttree{font-size:12px;padding:2px 0 8px 4px}
.ttree .task{display:block;padding:3px 0;color:inherit;text-decoration:none;cursor:default}
.ttree details.task{padding:0}
.ttree details.task>summary{cursor:pointer;list-style:none;padding:3px 0}
.ttree details.task>summary::-webkit-details-marker{display:none}
.ttree .kids{padding-left:14px;border-left:1px solid #eee}
.ttree .rid{font-family:ui-monospace,Consolas,monospace;font-size:11px}
.ttree .auto{font-size:10px;color:#999}
.mk{display:inline-block;width:16px;font-weight:700}
.mk.done{color:var(--grn)}
.mk.fail{color:var(--red)}
.mk.sus{color:var(--yelb)}
`

// handoffJS: the bless tap and the red-field ruling POST to the local watch server;
// with no listener a tap no-ops (a stale page's dead button is fine - the owner's
// ruling). Plus the brief's pure-display moves: summary-line view switch and the
// one-at-a-time deck. A killer card never prompts (req-register-killer-guard).
const handoffJS = `
/* the watchdog's other half (req-handoff-lifecycle): heartbeat while open, a beacon on
   close. Against a stale file both silently fail - dead buttons by ruling. */
setInterval(function(){fetch('/hb',{method:'POST'}).catch(function(){});},3000);
window.addEventListener('pagehide',function(){try{navigator.sendBeacon('/bye');}catch(_){}});
function dgo(fwd){
 var cards=document.querySelectorAll('.dcard'),i;if(!cards.length)return;
 var cur=0;
 for(i=0;i<cards.length;i++){if(cards[i].className.indexOf('on')>=0)cur=i;}
 var nx=(cur+(fwd?1:cards.length-1))%cards.length;
 for(i=0;i<cards.length;i++){cards[i].className=i===nx?'dcard on':'dcard';}
 var pos=document.getElementById('dpos');if(pos)pos.textContent=(nx+1)+' / '+cards.length;
}
var __onionStack=[];
function __onionShow(host,t){Array.prototype.forEach.call(host.querySelectorAll('.oview'),function(v){v.hidden=true;});t.hidden=false;}
function __onionClear(host){Array.prototype.forEach.call(host.querySelectorAll('.osel,.oc-nb,.oc-on'),function(x){x.classList.remove('osel','oc-nb','oc-on');});}
function __onionInspect(g){var host=g.closest('.onion');if(!host)return;__onionClear(host);g.classList.add('osel');
 var id=g.getAttribute('data-oc-id')||'';
 Array.prototype.forEach.call(host.querySelectorAll('[data-oc-block="'+id+'"]'),function(l){l.classList.add('oc-on');});
 Array.prototype.forEach.call(host.querySelectorAll('[data-oc-src],[data-oc-dst]'),function(l){
	var s=l.getAttribute('data-oc-src'),d=l.getAttribute('data-oc-dst');if(s!==id&&d!==id)return;
	l.classList.add('oc-on');var o=host.querySelector('[data-oc-id="'+(s===id?d:s)+'"]');if(o)o.classList.add('oc-nb');});}
function __onionPill(g){var host=g.closest('.onion');if(!host)return;__onionClear(host);g.classList.add('osel');
 var flow=g.getAttribute('data-oc-pill');
 (g.getAttribute('data-oc-blocks')||'').split(',').forEach(function(id){if(!id)return;
	var o=host.querySelector('[data-oc-id="'+id+'"]');if(o)o.classList.add('oc-nb');
	Array.prototype.forEach.call(host.querySelectorAll('[data-oc-block="'+id+'"][data-oc-flow="'+flow+'"]'),function(l){l.classList.add('oc-on');});});}
function __onionDrill(el){var t=document.getElementById(el.getAttribute('data-onion-go'));var host=el.closest('.onion');if(!t||!host)return;var cur=host.querySelector('.oview:not([hidden])');if(cur&&cur!==t){__onionStack.push({host:host,id:cur.id});}__onionShow(host,t);}
document.querySelectorAll('.onion [data-onion-go]').forEach(function(el){var ev=el.hasAttribute('data-oc-id')?'dblclick':'click';el.addEventListener(ev,function(e){e.preventDefault();e.stopPropagation();__onionDrill(el);});});
document.querySelectorAll('.onion [data-oc-id]').forEach(function(el){el.addEventListener('click',function(ev){ev.preventDefault();__onionInspect(el);});});
document.querySelectorAll('.onion [data-oc-pill]').forEach(function(el){el.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();__onionPill(el);});});
document.querySelectorAll('.onion svg').forEach(function(svg){
 var vb=(svg.getAttribute('viewBox')||'0 0 380 360').split(/\s+/).map(Number);
 var base=vb.slice(),st={x:vb[0],y:vb[1],w:vb[2],h:vb[3]},drag=null;
 function apply(){svg.setAttribute('viewBox',st.x+' '+st.y+' '+st.w+' '+st.h);}
 svg.addEventListener('wheel',function(e){e.preventDefault();var r=svg.getBoundingClientRect();if(!r.width)return;var mx=st.x+(e.clientX-r.left)/r.width*st.w,my=st.y+(e.clientY-r.top)/r.height*st.h,f=e.deltaY<0?0.85:1.18;st.w*=f;st.h*=f;st.x=mx-(e.clientX-r.left)/r.width*st.w;st.y=my-(e.clientY-r.top)/r.height*st.h;apply();},{passive:false});
 svg.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('[data-onion-go],[data-node-link],[data-oc-id],[data-oc-pill]'))return;drag={x:e.clientX,y:e.clientY,sx:st.x,sy:st.y};try{svg.setPointerCapture(e.pointerId);}catch(_){}svg.style.cursor='grabbing';});
 svg.addEventListener('pointermove',function(e){if(!drag)return;var r=svg.getBoundingClientRect();if(!r.width)return;st.x=drag.sx-(e.clientX-drag.x)/r.width*st.w;st.y=drag.sy-(e.clientY-drag.y)/r.height*st.h;apply();});
 svg.addEventListener('pointerup',function(){drag=null;svg.style.cursor='';});
 svg.addEventListener('dblclick',function(){st.x=base[0];st.y=base[1];st.w=base[2];st.h=base[3];apply();});
});
document.addEventListener('click',function(e){
 var i;
 var tk=e.target.closest?e.target.closest('a.task'):null;
 if(tk){e.preventDefault();return;} /* the tasks tree is display-only here */
 var t=e.target.closest?e.target.closest('button[data-bless]'):null;
 if(t){
  var note=document.getElementById('hnote');
	t.disabled=true;if(note){note.textContent='recording…';}
  fetch('/handoff-answer',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:'gate='+encodeURIComponent(t.getAttribute('data-bless'))+'&verdict='+encodeURIComponent(t.getAttribute('data-verdict'))})
	 .then(function(r){if(note){note.textContent=r.ok?'recorded':'refused';}if(!r.ok){t.disabled=false;}})
	 .catch(function(){if(note){note.textContent='';}t.disabled=false;});
  return;
 }
 /* a summary line switches the middle view */
 var s=e.target.closest?e.target.closest('.sline'):null;
 if(s){
  var v=s.getAttribute('data-view');
  var lines=document.querySelectorAll('.sline'),views=document.querySelectorAll('.view');
  for(i=0;i<lines.length;i++){lines[i].className=lines[i]===s?'sline on':'sline';}
  for(i=0;i<views.length;i++){views[i].className=views[i].id==='view-'+v?'view on':'view';}
  return;
 }
 /* the deck deals one decision at a time */
 if(e.target.id==='dprev'){dgo(false);return;}
 if(e.target.id==='dnext'){dgo(true);return;}
 /* a red field row rules in place (req-register-ask): the custom-value path */
 var f=e.target.closest?e.target.closest('.hfield'):null;if(!f)return;
 var dot=f.querySelector('.regdot');if(!dot||dot.className.indexOf('reg-red')<0&&dot.className.indexOf('reg-yellow')<0)return;
 var row=f.closest('[data-node]');if(!row)return;
 var name=f.querySelector('.hfn').textContent,cur2=f.querySelector('.hfv').textContent;
 var v2=window.prompt('rule '+row.getAttribute('data-node')+' · '+name,cur2);
 if(v2==null||v2===''){return;}
 fetch('/register-answer',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:'node='+encodeURIComponent(row.getAttribute('data-node'))+'&field='+encodeURIComponent(name)+'&value='+encodeURIComponent(v2)})
  .then(function(r){if(!r.ok){r.text().then(function(x){alert(x);});}else{location.reload();}})
  .catch(function(){});
});
`

// enddesign

// design: go-report-why  implements: req-report-why
// Every check's detail entry carries its CAUSE when not green, baked at render (the report stays a
// pure display; nothing is computed client-side): a SUSPECT review names the changed inputs — its own
// re-stated statement, upstream checks currently reopened, or the scoped need-set — and an OPEN
// derived check names the coverage rule that computes false. This is the report-side answer to
// "quack why says nothing changed" for coverage-driven suspects.
func suspectCauseText(changedInputs []string, flippedRule string) string {
	if flippedRule != "" {
		return "coverage rule " + flippedRule + " computes false over its scope"
	}
	if len(changedInputs) > 0 {
		return "inputs changed since the bless: " + strings.Join(changedInputs, ", ")
	}
	return ""
}

func checkCause(id string, n Node, nodes map[string]Node, sm map[string]string, bl map[string]Event) string {
	switch sm[id] {
	case "SUSPECT":
		var changed []string
		if e, ok := bl[id]; ok && e.StatementHash != "" && e.StatementHash != stmtHash(n) {
			changed = append(changed, "its own statement")
		}
		for _, d := range parents(n) {
			if _, ok := nodes[d]; ok && (sm[d] == "SUSPECT" || sm[d] == "OPEN") {
				changed = append(changed, d+" ("+strings.ToLower(sm[d])+")")
			}
		}
		if n.Validates == "needs" && len(changed) == 0 {
			changed = append(changed, "the validated need-set (a need in scope changed)")
		}
		if len(changed) == 0 {
			changed = append(changed, "an upstream content edit (input hash moved; the inputs themselves read DONE)")
		}
		return suspectCauseText(changed, "")
	case "OPEN":
		if strings.HasPrefix(n.Verify, "coverage:") {
			return suspectCauseText(nil, strings.TrimPrefix(n.Verify, "coverage:"))
		}
	}
	return ""
}

// enddesign
