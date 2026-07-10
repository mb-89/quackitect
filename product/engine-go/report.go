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

// The graph whitelist holds the SIX core types with toggles: the item types - candidate,
// stakeholder, raid, rationale, record, and the extension kinds - are content, never
// graph nodes; the engine's traceContent classification keeps them counted and off
// the walkable board.
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

// design: go-render-folds  implements: req-trace-clustered
// The trace renders fold, RENDER-ONLY (adr-cluster-numbered-statements). The data never changes.
// Two folds:
//   1. The fan fold. A regular fan collapses to ONE box. The canonical case: a usecase
//      whose requirement children each carry exactly their own tests and designs. No edge
//      leaves the group, except the parent's own upward edge and ADRs addressing a member.
//      External edges draw to the box boundary. An ADR edge names its member as the label.
//   2. The age fold. Everything older than the last FIVE iterations folds behind a click:
//      one summary box per old iteration (id, node count, gate light).
// A click expands a box to the group's full pre-baked view. The dom-static law holds:
// every member node, every internal edge, and every boundary variant bakes here, server-side.
// The browser only flips node visibility; cytoscape hides an edge when an endpoint hides.
// Both full-trace renders share this path (graphTabs -> buildTab): the report's trace view
// and the book's trace chapter. Milestone and board views never fold.

// recentIterations names the iterations that stay unfolded: the last five of the sorted
// iteration list, plus the active one (readProjectConfig).
func recentIterations() map[string]bool {
	vers := versions()
	recent := map[string]bool{}
	start := len(vers) - 5
	if start < 0 {
		start = 0
	}
	for _, v := range vers[start:] {
		recent[v] = true
	}
	if v := readProjectConfig().Version; v != "" {
		recent[v] = true
	}
	return recent
}

// foldPlan assigns one tab's members to fold groups and carries one collapsed box per group.
type foldPlan struct {
	groupOf map[string]string // member id -> its fold group ("" = loose)
	kindOf  map[string]string // group id -> "age" | "fan"
	boxes   []gel             // the collapsed boxes, in deterministic order
}

// planFolds computes both folds over one tab. The age fold claims first; a fan candidate
// never captures an already-folded member.
func planFolds(ids []string, idset map[string]bool, nodes map[string]Node, sm map[string]string, recent map[string]bool) foldPlan {
	fp := foldPlan{groupOf: map[string]string{}, kindOf: map[string]string{}}
	// the age fold: one box per iteration outside the recent window
	byIter := map[string][]string{}
	for _, id := range ids {
		it := iterationOfNode(nodes[id], nodes, nil)
		if !recent[it] {
			byIter[it] = append(byIter[it], id)
		}
	}
	var oldIts []string
	for it := range byIter {
		oldIts = append(oldIts, it)
	}
	sort.Strings(oldIts)
	for _, it := range oldIts {
		gid := "fold::age::" + it
		light := "🟢" // green until a member gate reads OPEN or SUSPECT
		for _, id := range byIter[it] {
			fp.groupOf[id] = gid
			if sm[id] == "OPEN" || sm[id] == "SUSPECT" {
				light = "🔴"
			}
		}
		unit := " nodes"
		if len(byIter[it]) == 1 {
			unit = " node"
		}
		fp.kindOf[gid] = "age"
		fp.boxes = append(fp.boxes, gel{Data: map[string]string{
			"id": gid, "label": it + " · " + itoa(len(byIter[it])) + unit + " · " + light,
			"foldbox": gid, "kind": "age", "type": "iterfold"}})
	}
	// the fan fold: candidates walk in type order (usecase before requirement), then by id,
	// so an outer fan claims its members before an inner sub-fan can
	kids := map[string][]string{}
	for _, id := range ids {
		for _, e := range traceEdges(nodes[id]) {
			if idset[e[0]] {
				kids[e[0]] = append(kids[e[0]], id)
			}
		}
	}
	cands := append([]string{}, ids...)
	sort.Slice(cands, func(i, j int) bool {
		ti, tj := typeRank[nodes[cands[i]].Type], typeRank[nodes[cands[j]].Type]
		if ti != tj {
			return ti < tj
		}
		return cands[i] < cands[j]
	})
	for _, p := range cands {
		if t := nodes[p].Type; t != "usecase" && t != "requirement" {
			continue
		}
		if fp.groupOf[p] != "" {
			continue
		}
		group := fanGroup(p, kids, nodes, fp.groupOf)
		if len(group) < 4 { // a fold below parent + three members compacts nothing
			continue
		}
		if !fanIsClosed(p, group, ids, idset, nodes) {
			continue
		}
		gid := "fold::fan::" + p
		counts := map[string]int{}
		for id := range group {
			fp.groupOf[id] = gid
			if id != p {
				counts[nodes[id].Type]++
			}
		}
		fp.kindOf[gid] = "fan"
		fp.boxes = append(fp.boxes, gel{Data: map[string]string{
			"id": gid, "label": p + ": " + fanCounts(counts),
			"foldbox": gid, "kind": "fan", "type": nodes[p].Type}})
	}
	return fp
}

// fanGroup collects p plus every in-tab descendant. ADR nodes stay outside: decisions are
// boundary neighbours, never members. nil when a member already belongs to another fold.
func fanGroup(p string, kids map[string][]string, nodes map[string]Node, groupOf map[string]string) map[string]bool {
	group := map[string]bool{p: true}
	stack := []string{p}
	for len(stack) > 0 {
		x := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, k := range kids[x] {
			if group[k] || nodes[k].Type == "adr" {
				continue
			}
			if groupOf[k] != "" {
				return nil
			}
			group[k] = true
			stack = append(stack, k)
		}
	}
	return group
}

// fanIsClosed verifies the fan touches nothing outside. Only two edge kinds may cross the
// boundary: an outside edge entering at the parent, and a member edge leaving toward an ADR.
func fanIsClosed(p string, group map[string]bool, ids []string, idset map[string]bool, nodes map[string]Node) bool {
	for _, id := range ids {
		for _, e := range traceEdges(nodes[id]) {
			if !idset[e[0]] {
				continue
			}
			inS, inT := group[e[0]], group[id]
			if inS == inT {
				continue
			}
			if !inS && id != p {
				return false // an outside edge enters a non-parent member
			}
			if inS && nodes[id].Type != "adr" {
				return false // a member edge leaves toward a non-ADR node
			}
		}
	}
	return true
}

// fanCounts renders the box tally, e.g. "5 reqs · 5 tests · 5 designs" (types present only).
func fanCounts(counts map[string]int) string {
	names := []struct{ t, s string }{{"usecase", "ucs"}, {"requirement", "reqs"}, {"test", "tests"}, {"design", "designs"}}
	var parts []string
	for _, n := range names {
		if c := counts[n.t]; c > 0 {
			parts = append(parts, itoa(c)+" "+n.s)
		}
	}
	if len(parts) == 0 {
		return "empty fan"
	}
	return strings.Join(parts, " · ")
}

// buildTab emits one need's subtree as cytoscape elements (nodes + V-model edges). No positions:
// the browser lays it out with the breadthfirst hierarchical layout (the same algo the filter uses).
// Fold membership bakes into the element data (go-render-folds); the browser only toggles it.
func buildTab(label string, idset map[string]bool, nodes map[string]Node, sm map[string]string, recent map[string]bool) gtab {
	ids := []string{}
	for id := range idset {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	fp := planFolds(ids, idset, nodes, sm, recent)
	var els []gel
	for _, id := range ids {
		n := nodes[id]
		k := "0"
		if n.Killer {
			k = "1"
		}
		d := map[string]string{"id": id, "label": id, "type": n.Type, "state": sm[id], "killer": k, "iter": iterationOfNode(n, nodes, nil)}
		if g := fp.groupOf[id]; g != "" {
			d["fold"] = g // pre-baked membership: the member hides while its box shows
		}
		els = append(els, gel{Data: d})
	}
	els = append(els, fp.boxes...)
	// boundary edges: every variant a collapse can need bakes here, deduplicated. A fan
	// box's edge toward an ADR collects the addressed members as its label.
	type bedge struct {
		data    map[string]string
		members map[string]bool
	}
	bmap := map[string]*bedge{}
	addBoundary := func(src, dst, etype, member string) {
		eid := "fold__" + src + "__" + dst + "__" + etype
		be, ok := bmap[eid]
		if !ok {
			be = &bedge{data: map[string]string{"id": eid, "source": src, "target": dst, "etype": etype}}
			bmap[eid] = be
		}
		if member != "" {
			if be.members == nil {
				be.members = map[string]bool{}
			}
			be.members[member] = true
		}
	}
	for _, id := range ids {
		for _, e := range traceEdges(nodes[id]) {
			if !idset[e[0]] {
				continue
			}
			els = append(els, gel{Data: map[string]string{"id": e[0] + "__" + id, "source": e[0], "target": id, "etype": e[1]}})
			gs, gt := fp.groupOf[e[0]], fp.groupOf[id]
			if gs == gt {
				continue // both loose, or both inside the same group
			}
			mlabel := ""
			if gs != "" && fp.kindOf[gs] == "fan" && nodes[id].Type == "adr" {
				mlabel = e[0] // the ADR edge names which member it addresses
			}
			if gs != "" {
				addBoundary(gs, id, e[1], mlabel)
			}
			if gt != "" {
				addBoundary(e[0], gt, e[1], "")
			}
			if gs != "" && gt != "" {
				addBoundary(gs, gt, e[1], "")
			}
		}
	}
	var beids []string
	for eid := range bmap {
		beids = append(beids, eid)
	}
	sort.Strings(beids)
	for _, eid := range beids {
		be := bmap[eid]
		if len(be.members) > 0 {
			var ms []string
			for m := range be.members {
				ms = append(ms, m)
			}
			sort.Strings(ms)
			be.data["label"] = strings.Join(ms, ", ")
		}
		els = append(els, gel{Data: be.data})
	}
	return gtab{Label: label, Count: len(ids), Elements: els}
}

// enddesign

func graphTabs(nodes map[string]Node, sm map[string]string) []gtab {
	tnodes := map[string]Node{}
	for id, n := range nodes {
		if !traceTypes[n.Type] {
			continue
		}
		if n.Type == "adr" && addressesSink(n) {
			continue // graveyard/parked decisions live OUTSIDE the requirement trace by design
			// (go-decisions); their read paths are `decisions --parked` and the archive, not the graph.
		}
		tnodes[id] = n
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
	recent := recentIterations() // the fold window (go-render-folds), computed once per render
	rooted := map[string]bool{}
	for _, need := range needs {
		st := subtree(need)
		for id := range st {
			rooted[id] = true
		}
		tabs = append(tabs, buildTab(need, st, tnodes, sm, recent))
	}
	unrooted := map[string]bool{}
	for id := range tnodes {
		if !rooted[id] {
			unrooted[id] = true
		}
	}
	if len(unrooted) > 0 {
		tabs = append(tabs, buildTab("(unrooted)", unrooted, tnodes, sm, recent))
	}
	return tabs
}

func checksMap(nodes map[string]Node, sm map[string]string, outDir string) map[string]map[string]interface{} {
	out := map[string]map[string]interface{}{}
	bl := latestBless()
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
		// design: go-verdict-link  implements: req-report-check-display.2
		// Every DONE check surfaces its VERDICT: the bless attestation (actor · short-hash) for a review
		// check, or "engine-verified" for an executed check — read from the attest log — so a DONE check
		// shows WHY it passed even when NO milestone evidence doc exists (the i6 field gap). The optional
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
