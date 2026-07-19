package main

// i27_red.go — the i0027_book_feedback RED battery: tests first, they FAIL until
// the build. Each case carries its trace line: test-<id> -> selftest:<name>.

import (
	"encoding/json"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var i27Tests = []namedTest{
	{"attest-freshness", selftestAttestFreshness},
	{"function-nodes", selftestFunctionNodes},
	{"onion-io-rendering", selftestOnionIORendering},
	{"onion-clusters", selftestOnionClusters},
	{"onion-click", selftestOnionClick},
	{"onion-enter", selftestOnionEnter},
	{"onion-boilerplate", selftestOnionBoilerplate},
	{"onion-space", selftestOnionSpace},
	{"timeline-singular", selftestTimelineSingular},
	{"ifu-deck-pills", selftestIfuDeckPills},
	{"pong-register-render", selftestPongRegisterRender},
	{"context-model-interfaces", selftestContextModelInterfaces},
	{"chapter-title-split", selftestChapterTitleSplit},
	{"filter-unification", selftestFilterUnification},
	{"toc-order", selftestTocOrder},
	{"quack-mv", selftestQuackMv},
	{"apply-field-ops", selftestApplyFieldOps},
	{"model-kinds-catalog", selftestModelKindsCatalog},
	{"filter-pills", selftestFilterPills},
	{"design-input-register", selftestDesignInputRegister},
	{"risk-matrix", selftestRiskMatrix},
	{"project-timeline", selftestProjectTimeline},
	{"timeline-anchor", selftestTimelineAnchor},
	{"timeline-drilldown", selftestTimelineDrilldown},
	{"pugh-render", selftestPughRender},
	{"details-full-entry", selftestDetailsFullEntry},
	{"evidence-md-tables", selftestEvidenceMdTables},
	{"handoff-live-figures", selftestHandoffLiveFigures},
	{"search-visible-hits", selftestSearchVisibleHits},
	{"type-colors", selftestTypeColors},
	{"apply-undo", selftestApplyUndo},
	{"refusal-recovery", selftestRefusalRecovery},
	{"why-honest-delta", selftestWhyHonestDelta},
	{"verify-pins-build", selftestVerifyPinsBuild},
	{"supervisor-any-swap", selftestSupervisorAnySwap},
	{"boot-sequence", selftestBootSequence},
	{"pager-round-end", selftestPagerRoundEnd},
	{"pager-open-questions", selftestPagerOpenQuestions},
	{"ifu-user-stories", selftestIfuUserStories},
	{"ifu-split-slide", selftestIfuSplitSlide},
	{"ifu-base-state", selftestIfuBaseState},
	{"ifu-quality", selftestIfuQuality},
	{"io-busbar", selftestIOBusbar},
	{"interface-notes", selftestInterfaceNotes},
	{"onion-interfaces", selftestOnionInterfaces},
	{"rationale-fill", selftestRationaleFill},
	{"filter-feedback", selftestFilterFeedback},
	{"models-useful", selftestModelsUseful},
	{"structure-layers", selftestStructureLayers},
	{"trace-collapsible", selftestTraceCollapsible},
	{"ch2-ifu-intro", selftestCh2IfuIntro},
	{"ch3-needs-intro", selftestCh3NeedsIntro},
	{"graph-centering", selftestGraphCentering},
	{"vv-result-links", selftestVVResultLinks},
	{"vv-no-test-policy", selftestVVNoTestPolicy},
	{"deck-nav-usability", selftestDeckNavUsability},
}

// test-models-useful -> selftest:models-useful
// req-models-useful (owner ruling 2026-07-19): the GLOSSARY PULL LAW for models.
// The book renders a model only when a views decision covers it (an ADR chooses it
// or names it - the views-chosen lint's covered rule). An uncovered model does not
// appear at all: no row, no stub, no review chatter in the reader surface. The
// markdown node stays legal spec truth; render follows use.
func selftestModelsUseful() bool {
	dir, err := os.MkdirTemp("", "q27mu")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	body := "---\nid: X\ntype: model\nkind: structural\n---\n```mermaid\nflowchart TD\n  a[\"one\"] --> b[\"two\"]\n```\n"
	pa, pb := filepath.Join(dir, "model-fxa.md"), filepath.Join(dir, "model-fxb.md")
	os.WriteFile(pa, []byte(body), 0o644)
	os.WriteFile(pb, []byte(body), 0o644)
	fx := map[string]Node{
		"model-fxa": {ID: "model-fxa", Type: "model", Kind: "structural", Statement: "does a answer its question?", Path: pa},
		"model-fxb": {ID: "model-fxb", Type: "model", Kind: "structural", Statement: "does b answer its question?", Path: pb},
		"adr-fx-views": {ID: "adr-fx-views", Type: "adr", Kind: "architecture",
			Statement: "the chosen views", Chosen: []string{"model-fxa"}},
	}
	ht := renderModelsTable(fx)
	if !strings.Contains(ht, `data-node="model-fxa"`) || !strings.Contains(ht, "<svg") {
		return false // the covered model renders its row and figure
	}
	if strings.Contains(ht, "model-fxb") {
		return false // the uncovered model appears NOWHERE - the pull law
	}
	if !strings.Contains(renderModelFigure("model-fxa", fx), "<svg") {
		return false
	}
	if strings.Contains(renderModelFigure("model-fxb", fx), "model-fxb") {
		return false // the figure lane pulls the same way
	}
	// a statement MENTION covers too (the lint's other arm)
	fx["adr-fx-views"] = Node{ID: "adr-fx-views", Type: "adr", Statement: "model-fxb carries the middle altitude"}
	if !strings.Contains(renderModelFigure("model-fxb", fx), "<svg") {
		return false
	}
	return true
}

// test-trace-collapsible -> selftest:trace-collapsible
// req-trace-collapsible: a homogeneous fan-out (>= traceClusterMin same-type,
// single-parent LEAF children) folds into ONE typed cluster node - the type keeps its
// place and color - joined to the parent by a DOUBLE line (two parallel bezier edges
// plus the double border), and the cluster OPENS with the busbar interior: every
// input and output of the cluster rides an identified bus bar, the onion-cluster law.
func selftestTraceCollapsible() bool {
	fx := map[string]Node{
		"need-fx": {ID: "need-fx", Type: "need", Statement: "n"},
		"uc-fx":   {ID: "uc-fx", Type: "usecase", Statement: "u", Refines: []string{"need-fx"}},
		"req-fx7": {ID: "req-fx7", Type: "requirement", Statement: "r7", Refines: []string{"uc-fx"}},
		"test-fx": {ID: "test-fx", Type: "test", Statement: "t", Verifies: []string{"req-fx7"}},
	}
	for i := 1; i <= 6; i++ {
		id := "req-fx" + itoa(i)
		fx[id] = Node{ID: id, Type: "requirement", Statement: "r" + itoa(i), Refines: []string{"uc-fx"}}
	}
	tabs := bookGraphTabs(fx, map[string]string{})
	if len(tabs) != 1 {
		return false
	}
	var cluster gel
	nodesSeen := map[string]bool{}
	clEdges := 0
	for _, e := range tabs[0].Elements {
		d := e.Data
		if d["source"] == "" {
			nodesSeen[d["id"]] = true
			if d["cluster"] == "1" {
				cluster = e
			}
			continue
		}
		if d["etype"] == "cluster" {
			clEdges++
			if d["source"] != "uc-fx" {
				return false // the double join runs parent -> cluster
			}
		}
	}
	if cluster.Data == nil || cluster.Data["type"] != "requirement" {
		return false // the cluster is a TYPED node: the requirements place and color
	}
	if !strings.Contains(cluster.Data["label"], "6") {
		return false // the label counts its members
	}
	if clEdges != 2 {
		return false // TWO parallel edges draw the double line
	}
	for i := 1; i <= 6; i++ {
		if nodesSeen["req-fx"+itoa(i)] {
			return false // a folded member never renders beside its cluster
		}
	}
	if !nodesSeen["req-fx7"] || !nodesSeen["test-fx"] {
		return false // a child-bearing sibling stays unfolded, its subtree intact
	}
	in := cluster.Data["interior"]
	if !strings.Contains(in, "<svg") || !strings.Contains(in, "from uc-fx") || !strings.Contains(in, "req-fx3") {
		return false // the cluster opens with the busbar interior: the parent lane identified, members as blocks
	}
	// the shell handles the open + draws the double border
	js := reportJS
	if !strings.Contains(js, "node[cluster]") || !strings.Contains(js, "'border-style':'double'") ||
		!strings.Contains(js, "data('interior')") {
		return false
	}
	return true
}

// test-structure-layers -> selftest:structure-layers
// req-structure-layers: the reading path context -> structural -> onion, as AUTHORED
// routes. A model declares `%% route: <element> -> <target>` in its source; the render
// gives the element the book's standard click-through. Routes are navigation, never
// semantics - the canonical hash ignores them. The context model's centre routes into
// the workspace's own structural model (model-<brand>-structure), and the live
// structural model routes its determinizer element into the onion.
func selftestStructureLayers() bool {
	src := "```mermaid\nflowchart TD\n  %% route: kernelfx -> model-target\n  kernelfx[\"the core\"]\n  shellfx[\"the shell\"]\n  shellfx -->|calls| kernelfx\n```"
	g, lint := extractModelGraph(src)
	if g.Routes["kernelfx"] != "model-target" || len(lint) != 0 {
		return false // the authored route parses clean
	}
	g2, _ := extractModelGraph(strings.Replace(src, "  %% route: kernelfx -> model-target\n", "", 1))
	if g.CanonicalHash() != g2.CanonicalHash() {
		return false // a route is navigation, never semantics: the hash ignores it
	}
	svg := svgModelGraph(g)
	if !strings.Contains(svg, `data-node-link="model-target"`) {
		return false // the routed element carries the book's click-through
	}
	if _, lint2 := extractModelGraph("```mermaid\nflowchart TD\n  %% route: ghost -> model-x\n  afx[\"a\"]\n```"); len(lint2) == 0 {
		return false // a route from an undeclared element lints loud
	}
	// the live reading path: the star routes into the structural model, and the
	// structural model's determinizer routes into the onion
	nodes := LoadAll()
	if !strings.Contains(renderFigure("context-model", nodes), `data-node-link="model-quack-structure"`) {
		return false
	}
	raw, err := os.ReadFile(filepath.Join(SPEC, "models", "model-quack-structure.md"))
	if err != nil {
		return false
	}
	lg, _ := extractModelGraph(string(raw))
	if lg.Routes["determinizer"] != "model-engine-layers" {
		return false
	}
	if !strings.Contains(renderModelFigure("model-quack-structure", nodes), `data-node-link="model-engine-layers"`) {
		return false
	}
	// SHARPENED at the i27 c6 walk: the route must LAND - the book carries exactly
	// ONE visible anchor for the structural model (embedded evidence copies scope
	// their ids away), so the click-through cannot strand on a hidden duplicate.
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Count(book, ` id="model-quack-structure"`) == 1
}

// test-filter-feedback -> selftest:filter-feedback
// req-filter-feedback (owner ruling 2026-07-18): applying a view filter lands the
// reader on the README (never filtered itself), the filter field shows the token and
// announces it with the attention ping, and every irrelevant chapter grays - the
// current one included. Probed on the rendered shell: the behaviors are baked source.
func selftestFilterFeedback() bool {
	dir, err := os.MkdirTemp("", "q27ff")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	html, _, _ := renderBookHTML(bookFixture(dir, 1, true))
	// the jump: an ADDED view token navigates to the README chapter
	if !strings.Contains(html, `bookGoto('man-readme')`) {
		return false
	}
	// the README is NEVER filtered: the apply loop exempts it by id
	if !strings.Contains(html, `a.id==='man-readme'`) {
		return false
	}
	// the ping: the filter field sits in static ping chrome (dom-static: the script
	// only re-arms the class), with the shared echo animation wired to the wrap
	if strings.Count(html, `<span class="ping-echo">`) < 3 ||
		!strings.Contains(html, `id="filter-wrap"`) ||
		!strings.Contains(html, `#filter-wrap.pinging .ping-echo`) {
		return false
	}
	// the graying stays whole-book: the apply loop walks EVERY chapter (no
	// current-chapter carve-out) and the flt-empty machinery grays headings
	ai := strings.Index(html, "function apply()")
	if ai < 0 {
		return false
	}
	seg := html[ai:]
	if e := strings.Index(seg, "if(fe)fe.addEventListener"); e >= 0 {
		seg = seg[:e]
	}
	if !strings.Contains(seg, `document.querySelectorAll('article.ch').forEach`) ||
		strings.Contains(seg, "pg-hide") {
		return false
	}
	return strings.Contains(html, "article.ch.flt-empty h1")
}

// test-interface-notes -> selftest:interface-notes
// req-interface-notes (owner ruling 2026-07-17): every boundary line of the context
// model IS an interface - one prose-bearing con- note of the declared interface kind
// per neighbour, its description naming the neighbour, what flows, the direction, and
// the channel.
func selftestInterfaceNotes() bool {
	nodes := LoadAll()
	edges, err := LoadConnections(SPEC)
	if err != nil {
		return false
	}
	byNbr := map[string][]ConnEdge{}
	for _, e := range edges {
		if e.Kind != "interface" {
			continue
		}
		for _, end := range []string{e.Src, e.Dst} {
			if strings.HasPrefix(end, "nbr-") {
				byNbr[end] = append(byNbr[end], e)
			}
		}
	}
	found := false
	for id, n := range nodes {
		if n.Type != "neighbour" {
			continue
		}
		found = true
		es := byNbr[id]
		if len(es) == 0 {
			return false // a boundary line without its interface note
		}
		for _, e := range es {
			if e.Note == "" {
				return false // an interface is prose-bearing: the note lane, never bare jsonl
			}
			cn, ok := nodes[e.Note]
			if !ok || strings.TrimSpace(cn.Statement) == "" {
				return false
			}
			raw, rerr := os.ReadFile(cn.Path)
			if rerr != nil {
				return false
			}
			parts := strings.SplitN(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n---\n", 2)
			if len(parts) < 2 || len(strings.TrimSpace(parts[1])) < 80 {
				return false // the description carries real prose, not a stub
			}
		}
	}
	return found
}

// test-onion-interfaces -> selftest:onion-interfaces
// req-onion-interfaces: the design chapter renders the interfaces as reviewed model
// content (one row per con- note, the contract in the expand), and the design-regions
// table hides a responsibility column that is EMPTY across every row.
func selftestOnionInterfaces() bool {
	html, live := bookOnceHTML()
	if live {
		if strings.Count(html, `data-node="con-interface-`) < 6 {
			return false // the six boundary interfaces render as rows
		}
	}
	long := strings.Repeat("a long responsibility sentence that never fits the brief column ", 3)
	fx := map[string]Node{
		"go-x": {ID: "go-x", Type: "design", Statement: long, Path: "product/x.go"},
		"go-y": {ID: "go-y", Type: "design", Statement: long, Path: "product/y.go"},
	}
	if strings.Contains(renderDesignRegions(fx), `>responsibility</th>`) {
		return false // every brief empty: the column hides
	}
	fx["go-z"] = Node{ID: "go-z", Type: "design", Statement: "short and clear", Path: "product/z.go"}
	if !strings.Contains(renderDesignRegions(fx), `>responsibility</th>`) {
		return false // one real brief brings the column back
	}
	return true
}

// test-rationale-fill -> selftest:rationale-fill
// req-rationale-fill: every rendered rationale carries real content or an explicit
// not-applicable mark - never empty, never a bare TODO. The lint enforces it; this
// battery member keeps the live workspace clean forever.
func selftestRationaleFill() bool {
	dir, err := os.MkdirTemp("", "q27rat")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	w := func(name, body string) {
		os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644)
	}
	w("req-todo.md", "---\nid: req-todo\ntype: requirement\nstatement: s\n---\n## Rationale (not load-bearing)\nTODO\n")
	w("req-empty.md", "---\nid: req-empty\ntype: requirement\nstatement: s\n---\n## Rationale (not load-bearing)\n")
	w("req-real.md", "---\nid: req-real\ntype: requirement\nstatement: s\n---\n## Rationale (not load-bearing)\nA real reason, grounded in a ruling.\n")
	w("req-na.md", "---\nid: req-na\ntype: requirement\nstatement: s\n---\n## Rationale (not load-bearing)\nNot applicable - the statement stands on its provenance.\n")
	fs := rationaleFillFindings(dir)
	if len(fs) != 2 {
		return false // exactly the TODO and the empty one
	}
	for _, f := range fs {
		if !strings.Contains(f, "req-todo") && !strings.Contains(f, "req-empty") {
			return false
		}
	}
	return len(rationaleFillFindings(SPEC)) == 0 // the live workspace is swept clean
}

// test-io-busbar -> selftest:io-busbar
// The q-coverage-ids-physics ruling (owner, B), pinned mechanically: external I/O goes
// through the layers - the reflexion diff runs CLEAN (no world contact outside the rim,
// no sky-fall, no inward violation, no ambient breach), the declared I/O carries the
// disk busbar on both sides, and only a block whose code touches the disk taps it.
func selftestIOBusbar() bool {
	raw, err := os.ReadFile(filepath.Join(SPEC, "models", "model-engine-layers.md"))
	if err != nil {
		return false
	}
	g, _ := extractModelGraph(string(raw))
	if len(engineConformanceFindings(g)) != 0 {
		return false // the physics law holds over the LIVE code, forever
	}
	_, _, inputs, outputs, _ := readDesignLayers()
	hasDisk := func(xs []string) bool {
		for _, x := range xs {
			if x == "disk" {
				return true
			}
		}
		return false
	}
	if !hasDisk(inputs) || !hasDisk(outputs) {
		return false // the disk busbar is DECLARED input and output
	}
	// honest taps: the disk bus belongs to disk-touching blocks only; every other
	// bus keeps today's union semantics
	if !busTapsIn("disk", false, true) || busTapsIn("disk", true, false) {
		return false
	}
	if !busTapsIn("spec notes", true, false) || busTapsIn("spec notes", false, false) {
		return false
	}
	if !busTapsOut("disk", false, true) || busTapsOut("disk", true, false) || !busTapsOut("report", true, false) {
		return false
	}
	// the selector classes behind the split
	for k, want := range map[string]string{
		"os.ReadFile": "disk-read", "os.ReadDir": "disk-read", "os.Stat": "disk-read",
		"os.WriteFile": "disk-write", "os.MkdirAll": "disk-write",
		"os.Args": "read", "os.Stdin": "read",
		"os.Stdout": "write", "os.Stderr": "write",
		"x.y": "",
	} {
		if ioSelClass(k) != want {
			return false
		}
	}
	return true
}

// test-ifu-base-state -> selftest:ifu-base-state
// req-ifu-base-state: ONE setup IFU defines the idle starting state; every other IFU
// deck REFERENCES it on its starting-state slide instead of restating it. The ruled
// exception (`arc: start: fresh` metadata - the Pong walkthrough) starts from nothing.
func selftestIfuBaseState() bool {
	nodes := LoadAll()
	setup, ok := nodes["ifu0001-setup"]
	if !ok || setup.Kind != "ifu" || setup.Mode != "deck" {
		return false // the setup IFU exists and IS an IFU deck
	}
	if !strings.Contains(strings.ToLower(manifestBody(setup.Path)), "idle") {
		return false // the setup deck defines the idle state in its own words
	}
	referenced := false
	for id, n := range nodes {
		if n.Type != "manifest" || n.Mode != "deck" || n.Kind != "ifu" || id == "ifu0001-setup" {
			continue
		}
		if n.Maps["arc"]["start"] == "fresh" {
			continue // the ruled exception: a fresh-start walkthrough owes no reference
		}
		units := parseManifestUnits(manifestBody(n.Path))
		if len(units) < 2 || !strings.Contains(units[1].Body, "ifu0001-setup") {
			return false // the starting-state slide rides the shared base, never restates it
		}
		referenced = true
	}
	return referenced // at least one journey deck starts from the shared idle state
}

// test-ifu-quality -> selftest:ifu-quality
// req-ifu-quality: every IFU deck carries a RECORDED review against the seven 82079-1
// principles - accessibility and completeness explicitly among them - as the
// review-82079 frontmatter map, every principle answered with real prose.
func selftestIfuQuality() bool {
	nodes := LoadAll()
	keys := []string{"completeness", "correctness", "conciseness", "comprehensibility",
		"minimalism", "accessibility", "target-group-fit"}
	found := false
	for _, n := range nodes {
		if n.Type != "manifest" || n.Mode != "deck" || n.Kind != "ifu" {
			continue
		}
		found = true
		rev := n.Maps["review-82079"]
		if rev == nil {
			return false // an IFU without its recorded review
		}
		for _, k := range keys {
			if len(strings.TrimSpace(rev[k])) < 10 {
				return false // every principle answered, in words, not a checkmark
			}
		}
	}
	return found
}

// test-ifu-user-stories -> selftest:ifu-user-stories
// req-ifu-user-stories: the deck follows the fixed arc (problem, starting state, at most
// six steps, result, coverage), and NO deck satisfies coverage with a bare id list -
// coverage is LINKS on the LAST slide, stories stay reference-free.
func selftestIfuUserStories() bool {
	has := func(fs []string, sub string) bool {
		for _, f := range fs {
			if strings.Contains(f, sub) {
				return true
			}
		}
		return false
	}
	good := "<!-- ai:3 -->\n# The problem\np\n---\n<!-- ai:3 -->\n# Starting state\ns\n---\n<!-- ai:3 -->\n# Step one\nx\n---\n<!-- ai:3 -->\n# The result\nr\n---\n<!-- ai:3 -->\n# Coverage\n[uc-a](uc-a) and [[uc-b]]\n"
	if len(ifuArcFindings("d-good", good)) != 0 {
		return false // a well-shaped arc renders clean
	}
	short := "<!-- ai:3 -->\n# P\np\n---\n<!-- ai:3 -->\n# Coverage\n[uc-a](uc-a)\n"
	if f := ifuArcFindings("d-short", short); len(f) == 0 || !strings.Contains(f[0], "d-short") {
		return false // fewer than the four fixed beats is named as a finding
	}
	long := strings.Repeat("<!-- ai:3 -->\n# S\nx\n---\n", 10) + "<!-- ai:3 -->\n# Coverage\n[uc-a](uc-a)\n"
	if !has(ifuArcFindings("d-long", long), "six") {
		return false // seven step slides break the six-step cap
	}
	bare := "<!-- ai:3 -->\n# P\np\n---\n<!-- ai:3 -->\n# S\ns\n---\n<!-- ai:3 -->\n# R\nr\n---\n<!-- ai:3 -->\n# Coverage\nuc-a, uc-b\n"
	if !has(ifuArcFindings("d-bare", bare), "bare") {
		return false // the banned coverage theater: bare ids never count
	}
	none := "<!-- ai:3 -->\n# P\np\n---\n<!-- ai:3 -->\n# S\ns\n---\n<!-- ai:3 -->\n# R\nr\n---\n<!-- ai:3 -->\n# Coverage\nnothing referenced\n"
	if !has(ifuArcFindings("d-none", none), "links no use case") {
		return false // a coverage slide must link something
	}
	clutter := "<!-- ai:3 -->\n# P\nsee [uc-a](uc-a)\n---\n<!-- ai:3 -->\n# S\ns\n---\n<!-- ai:3 -->\n# R\nr\n---\n<!-- ai:3 -->\n# Coverage\n[uc-a](uc-a)\n"
	if !has(ifuArcFindings("d-clutter", clutter), "coverage slide") {
		return false // story slides stay reference-free; the refs' home is the coverage slide
	}
	// the coverage RULE reads only linked ids on the last slide
	nodes := map[string]Node{
		"uc-a": {ID: "uc-a", Type: "usecase", Path: filepath.Join(SPEC, "iterations", "i0001_x", "uc-a.md")},
		"uc-b": {ID: "uc-b", Type: "usecase", Path: filepath.Join(SPEC, "iterations", "i0001_x", "uc-b.md")},
		"deck": {ID: "deck", Type: "manifest", Mode: "deck", Kind: "ifu", Path: "deck.md"},
	}
	old := manifestBodyOverride
	defer func() { manifestBodyOverride = old }()
	manifestBodyOverride = map[string]string{"deck.md": "# P\nuc-b mentioned bare in a story\n---\n# Coverage\n[uc-a](uc-a)\n"}
	if !sameSet(ifuCoverageMissing(nodes, "i0001_x"), "uc-b") {
		return false // a scattered bare mention satisfies nothing
	}
	manifestBodyOverride = map[string]string{"deck.md": "# P\np\n---\n# Coverage\n[uc-a](uc-a) [uc-b](uc-b)\n"}
	return len(ifuCoverageMissing(nodes, "i0001_x")) == 0
}

// test-ifu-split-slide -> selftest:ifu-split-slide
// req-ifu-split-slide: a slide splits at ||| into a left text half and a right visual
// half; the right half may be a LIVE book rendering - an id-scoped figure copy, or a
// slide-local model through the one interactive onion whose drill resolves WITHIN the
// host copy (the M5 spike fix). The arc check rides the render for kind: ifu decks.
func selftestIfuSplitSlide() bool {
	dir, err := os.MkdirTemp("", "q27ifu")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	mermaid := "```mermaid\nflowchart TD\n  subgraph state\n    fixcore[\"fix core\"]\n  end\n  subgraph shell\n    fixcli[\"fix cli\"]\n  end\n  fixcli -->|call| fixcore\n```"
	man := "---\nid: man-ifu-fix\ntype: manifest\nmode: deck\nkind: ifu\nstatement: Fixture IFU.\n---\n" +
		// re-pointed at the i27 c12 walk: the 'timeline' fig kind retired; the in-column
		// fig-reuse scoping probe rides the context model (its elements carry figElemIDs)
		"<!-- ai:3 -->\n# The problem\n<!-- ai:3 -->\nOne claim.\n|||\n<!-- ai:3 -->\nThe left text half.\n|||\nfig: context-model\nMinutes: 1\n---\n" +
		"<!-- ai:3 -->\n# Starting state\n<!-- ai:3 -->\nFrom the idle state.\nMinutes: 1\n---\n" +
		"<!-- ai:3 -->\n# The result\n<!-- ai:3 -->\nSolved, shown live.\n|||\n" + mermaid + "\nMinutes: 1\n---\n" +
		"<!-- ai:3 -->\n# Coverage\n<!-- ai:3 -->\n[uc-fix](uc-fix)\nMinutes: 1\n"
	mp := filepath.Join(dir, "man-ifu-fix.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-ifu-fix"] = Node{ID: "man-ifu-fix", Type: "manifest", Mode: "deck", Kind: "ifu", Statement: "Fixture IFU.", Path: mp}
	ucp := filepath.Join(dir, "uc-fix.md")
	os.WriteFile(ucp, []byte("---\nid: uc-fix\ntype: usecase\nstatement: A fixture use case.\n---\n"), 0o644)
	fx["uc-fix"] = Node{ID: "uc-fix", Type: "usecase", Statement: "A fixture use case.", Path: ucp}
	// the star needs a neighbour to draw its id-bearing elements
	nbp := filepath.Join(dir, "nbr-fixprobe.md")
	os.WriteFile(nbp, []byte("---\nid: nbr-fixprobe\ntype: neighbour\nstatement: the probe neighbour.\nclass: review\nkiller: false\n---\n"), 0o644)
	fx["nbr-fixprobe"] = Node{ID: "nbr-fixprobe", Type: "neighbour", Statement: "the probe neighbour.", Class: "review", Path: nbp}
	html, findings, _ := renderBookHTML(fx)
	if len(findings) != 0 {
		return false // the arc-valid split deck renders clean
	}
	i := strings.Index(html, `<article class="deck" id="man-ifu-fix"`)
	if i < 0 {
		return false
	}
	e := strings.Index(html[i:], "</article>")
	if e < 0 {
		return false
	}
	deck := html[i : i+e]
	if !strings.Contains(deck, `<div class="slide-cols">`) || !strings.Contains(deck, `class="scol"`) {
		return false // the ||| split renders as side-by-side halves
	}
	if !strings.Contains(deck, `id="man-ifu-fix-s1-`) {
		return false // the reused figure's copy is id-scoped to the slide (deckScopeIDs)
	}
	if !strings.Contains(deck, `id="man-ifu-fix-s3m1-o0"`) ||
		!strings.Contains(deck, `data-onion-go="man-ifu-fix-s3m1-`) {
		return false // the slide model rides the ONE onion, born-scoped incl. drill targets
	}
	if !strings.Contains(html, "__onionDrill") ||
		!strings.Contains(html, "v.id.slice(-tid.length-1)==='-'+tid") {
		return false // the drill resolves WITHIN the host figure (the M5 spike fix)
	}
	if deckScopeIDs(`<g id="x">`, "s7") != `<g id="s7-x">` {
		return false // the scoping stays a pure prefix
	}
	// the WIRING: a kind-ifu deck with a bare-id coverage slide surfaces the arc finding
	bad := "---\nid: man-ifu-bad\ntype: manifest\nmode: deck\nkind: ifu\nstatement: Bad IFU.\n---\n" +
		"<!-- ai:3 -->\n# P\np\n---\n<!-- ai:3 -->\n# S\ns\n---\n<!-- ai:3 -->\n# R\nr\n---\n<!-- ai:3 -->\n# Coverage\nuc-fix listed bare\n"
	bp := filepath.Join(dir, "man-ifu-bad.md")
	os.WriteFile(bp, []byte(bad), 0o644)
	fx["man-ifu-bad"] = Node{ID: "man-ifu-bad", Type: "manifest", Mode: "deck", Kind: "ifu", Statement: "Bad IFU.", Path: bp}
	_, findings2, _ := renderBookHTML(fx)
	for _, f := range findings2 {
		if strings.Contains(f, "man-ifu-bad") && strings.Contains(f, "bare") {
			return true
		}
	}
	return false
}

// test-pager-round-end -> selftest:pager-round-end
// req-pager-round-end (owner rulings 2026-07-17/18): a finished round prints ONE
// machine-readable line naming the gate and the verdict, and the pollable result file
// carries the same. CLOSING THE PAGE IS A REJECTION — an answer, never a limbo.
func selftestPagerRoundEnd() bool {
	if pagerRoundLine("i27-m6-gate", "y") != "ROUND-END gate=i27-m6-gate verdict=bless" {
		return false
	}
	if pagerRoundLine("g", "n") != "ROUND-END gate=g verdict=dissent" {
		return false
	}
	if pagerRoundLine("g", "closed") != "ROUND-END gate=g verdict=reject" {
		return false // the ruled semantics: a closed window ends the round as a rejection
	}
	if pagerRoundLine("g", "unopened") != "ROUND-END gate=g verdict=unopened" {
		return false // never opened is its own verdict - the agent must not read it as a ruling
	}
	raw := pagerResultJSON("g", "closed")
	var r struct{ Gate, Verdict, Outcome string }
	if json.Unmarshal(raw, &r) != nil || r.Gate != "g" || r.Verdict != "reject" || r.Outcome != "closed" {
		return false // the pollable file carries gate, mapped verdict, and the raw outcome
	}
	if !strings.HasSuffix(filepath.ToSlash(pagerResultPath("g")), "/handoff-g.result.json") {
		return false // a fixed, guessable path: any harness polls it without improvisation
	}
	return true
}

// test-pager-open-questions -> selftest:pager-open-questions
// req-pager-open-questions: an OPEN cone question refuses the round and is named; a
// PROPOSED one does not refuse - it deals as a card (the letter a bless selects), and
// a decided one is history.
func selftestPagerOpenQuestions() bool {
	p := "spec/iterations/i0099_fix/"
	nodes := map[string]Node{
		"g1":     {ID: "g1", Type: "task", Path: p + "tasks/g1.md", Killer: true, Class: "review", Statement: "the gate"},
		"q-open": {ID: "q-open", Type: "question", State: "open", Path: p + "q-open.md", Statement: "still unknown"},
		"q-prop": {ID: "q-prop", Type: "question", State: "proposed", DecidedVia: "A", Path: p + "q-prop.md", Statement: "which way"},
		"q-dec":  {ID: "q-dec", Type: "question", State: "decided", DecidedVia: "B", Path: p + "q-dec.md", Statement: "settled"},
	}
	open := pagerOpenQuestions(nodes["g1"], nodes)
	if len(open) != 1 || open[0] != "q-open" {
		return false // only the open question refuses; proposed and decided pass
	}
	delete(nodes, "q-open")
	if len(pagerOpenQuestions(nodes["g1"], nodes)) != 0 {
		return false // no open question, no refusal
	}
	return true
}

// test-boot-sequence -> selftest:boot-sequence
// req-boot-sequence: the boot command emits the FIXED sequence with completion state
// and reports the onboard.md verdict shape. Blocked outranks yellow; the verdict line
// names the deciding step's detail so the agent knows the one next action.
func selftestBootSequence() bool {
	want := []string{"contract", "recital+grant", "voice", "methods", "workspace", "attest", "next"}
	got := bootStepNames()
	if len(got) != len(want) {
		return false
	}
	for i := range want {
		if got[i] != want[i] {
			return false
		}
	}
	mk := func(undone ...string) []bootStep {
		u := map[string]bool{}
		for _, n := range undone {
			u[n] = true
		}
		var s []bootStep
		for _, n := range want {
			s = append(s, bootStep{Name: n, Done: !u[n], Detail: n + " detail"})
		}
		return s
	}
	if v := bootVerdict(mk()); v != "boot: green - next detail" {
		return false // all done: green, naming the ready check
	}
	if v := bootVerdict(mk("recital+grant", "attest")); !strings.HasPrefix(v, "boot: yellow - ") || !strings.Contains(v, "recital+grant detail") {
		return false // ritual steps missing: yellow, the FIRST undone step decides
	}
	if v := bootVerdict(mk("workspace", "next")); !strings.HasPrefix(v, "boot: blocked - ") || !strings.Contains(v, "workspace detail") {
		return false // no workspace: blocked, never yellow
	}
	if v := bootVerdict(mk("next")); !strings.HasPrefix(v, "boot: blocked - ") || !strings.Contains(v, "next detail") {
		return false // next unusable: blocked per onboard.md
	}
	return true
}

// test-supervisor-any-swap -> selftest:supervisor-any-swap
// req-supervisor-any-swap + the owner's kill directive (the 2026-07-18 four-process
// wedge): a wanted swap FORCES through after the drain timeout instead of waiting
// forever on stuck replies; the swap sweeps stale parked binaries; the swap sequence
// (drain, spawn, notify) holds. The kill path is verified live by the wedge recovery.
func selftestSupervisorAnySwap() bool {
	// the drain decision: clean drain swaps at once; stuck replies force after the
	// timeout, never a forever-wait
	if !supSwapReady(0, true) || supSwapReady(2, true) {
		return false
	}
	if supForceSwap(2, 3*time.Second, 10*time.Second) {
		return false // before the timeout the drain keeps waiting
	}
	if !supForceSwap(2, 11*time.Second, 10*time.Second) {
		return false // past the timeout the swap forces through, dropping the stuck replies
	}
	if supForceSwap(0, 11*time.Second, 10*time.Second) {
		return false // nothing stuck: the ready path owns it, force stays out
	}
	// the park sweep: unheld quack.exe.old* binaries die with the swap
	dir, err := os.MkdirTemp("", "q27sw")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	os.WriteFile(filepath.Join(dir, "quack.exe"), []byte("live"), 0o644)
	os.WriteFile(filepath.Join(dir, "quack.exe.old"), []byte("p1"), 0o644)
	os.WriteFile(filepath.Join(dir, "quack.exe.old.3"), []byte("p2"), 0o644)
	os.WriteFile(filepath.Join(dir, "other.txt"), []byte("x"), 0o644)
	if n := sweepStaleParks(dir); n != 2 {
		return false // both parks sweep; the live binary and strangers stay
	}
	if _, err := os.Stat(filepath.Join(dir, "quack.exe")); err != nil {
		return false
	}
	if _, err := os.Stat(filepath.Join(dir, "other.txt")); err != nil {
		return false
	}
	// the sequence law still holds: drain before spawn before notify
	var seq supSequence
	seq.record("drain")
	seq.record("spawn")
	seq.record("notify")
	return seq.orderHeld()
}

// test-verify-pins-build -> selftest:verify-pins-build
// req-verify-pins-build: a battery run PINS the on-disk build at start; when the binary
// swaps mid-run the recorded verdicts belong to a superseded build, so the run re-executes
// once under the final binary, and a second swap refuses with the recovery named.
func selftestVerifyPinsBuild() bool {
	dir, err := os.MkdirTemp("", "q27vp")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "bin.exe")
	os.WriteFile(p, []byte("build-one"), 0o644)
	h1 := diskBuildID(p)
	os.WriteFile(p, []byte("build-two"), 0o644)
	h2 := diskBuildID(p)
	if h1 == "" || h2 == "" || h1 == h2 {
		return false // the pin hashes the on-disk bytes, not a memo
	}
	if rerun, _ := verifySwapDecision(h1, h1, 0); rerun {
		return false // an unswapped run never re-executes
	}
	rerun, msg := verifySwapDecision(h1, h2, 0)
	if !rerun || !strings.Contains(msg, "final build") {
		return false // the first swap re-runs under the final build
	}
	rerun, msg = verifySwapDecision(h1, h2, 1)
	if rerun || !strings.Contains(msg, "re-run") {
		return false // a second swap refuses, naming the recovery
	}
	return true
}

// test-why-honest-delta -> selftest:why-honest-delta
// req-why-honest-delta: the why delta applies the deferral skip set — a DEFERRED test
// (the stamp, not only the adr-scrap lane) never lists as an offender — and a verdict
// cache miss reads distinctly from a real failure.
func selftestWhyHonestDelta() bool {
	dir, err := os.MkdirTemp("", "q27wd")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldOverride, oldMemo := verdictPathOverride, verdictsMemo
	defer func() { verdictPathOverride, verdictsMemo = oldOverride, oldMemo }()
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	it := "i9901_probe"
	p := filepath.Join(SPEC, "iterations", it, "t.md")
	nodes := map[string]Node{
		"test-def":  {ID: "test-def", Type: "test", Class: "executed", Verify: "selftest:x", Deferred: "parked by ruling", Path: p},
		"test-miss": {ID: "test-miss", Type: "test", Class: "executed", Verify: "selftest:y", Path: p},
		"test-fail": {ID: "test-fail", Type: "test", Class: "executed", Verify: "selftest:z", Path: p},
	}
	memo := map[string]string{}
	verdictRecord("test-fail", fullHash("test-fail", nodes, memo), false, 0)
	delta := coverageDelta(nodes, "tests-pass", it)
	joined := strings.Join(delta, "\n")
	if strings.Contains(joined, "test-def") {
		return false // a deferred test never lists as an offender
	}
	missLine, failLine := "", ""
	for _, d := range delta {
		if strings.Contains(d, "test-miss") {
			missLine = d
		}
		if strings.Contains(d, "test-fail") {
			failLine = d
		}
	}
	if missLine == "" || !strings.Contains(missLine, "cache miss") || strings.Contains(missLine, "FAILS") {
		return false // a miss reads as a miss, with its recovery
	}
	return failLine != "" && strings.Contains(failLine, "FAILS") && !strings.Contains(failLine, "cache miss")
}

// test-refusal-recovery -> selftest:refusal-recovery
// req-refusal-recovery: every refusal and cache-miss message names its cause and ONE
// recovery move; the lint sweeps the engine's string literals and the battery keeps the
// set clean forever (the unknown-name FAIL trap cost five false scares this iteration).
func selftestRefusalRecovery() bool {
	// the fixture: a refusal without a recovery clause is the finding
	bad := `package main
var a = "refused: the gate is closed"
var b = "BLOCKED: no session on this channel."
var c = "refused: the gate is closed - run ` + "`quack next`" + ` to walk it"
`
	fs := refusalLintSrc("probe.go", bad)
	if len(fs) != 2 {
		return false // a and b lack recovery; c carries it
	}
	// the live engine: zero unexplained refusals
	return len(refusalFindings()) == 0
}

// test-apply-undo -> selftest:apply-undo
// req-apply-undo (owner ruling after the b25 incident): the last few applies journal
// their prior bytes; one undo reverts the most recent byte-exactly and pops it; a
// drifted file refuses the undo; the journal keeps only the last few applies.
func selftestApplyUndo() bool {
	dir, err := os.MkdirTemp("", "q27au")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldJournal := applyJournalOverride
	defer func() { applyJournalOverride = oldJournal }()
	applyJournalOverride = filepath.Join(dir, "journal")
	fa := filepath.Join(dir, "a.txt")
	fb := filepath.Join(dir, "b.txt")
	os.WriteFile(fa, []byte("alpha one"), 0o644)
	os.WriteFile(fb, []byte("beta two"), 0o644)
	mk := func(name, body string) string {
		p := filepath.Join(dir, name)
		os.WriteFile(p, []byte(body), 0o644)
		return p
	}
	esc := func(p string) string { return strings.ReplaceAll(p, `\`, `\\`) }
	m1 := mk("m1.json", `[{"file":"`+esc(fa)+`","old":"one","new":"ONE"},{"file":"`+esc(fb)+`","old":"two","new":"TWO"}]`)
	if _, err := applyManifest(m1, false); err != nil {
		return false
	}
	if err := applyUndo(); err != nil {
		return false // the most recent apply reverts
	}
	ra, _ := os.ReadFile(fa)
	rb, _ := os.ReadFile(fb)
	if string(ra) != "alpha one" || string(rb) != "beta two" {
		return false // byte-exact restore
	}
	// drift refuses: apply, then an outside edit, then undo
	if _, err := applyManifest(m1, false); err != nil {
		return false
	}
	os.WriteFile(fa, []byte("alpha ONE drifted"), 0o644)
	if applyUndo() == nil {
		return false // a drifted file must refuse the undo
	}
	if rb2, _ := os.ReadFile(fb); string(rb2) != "beta TWO" {
		return false // the refusal writes nothing
	}
	// the journal keeps only the last few applies
	os.WriteFile(fa, []byte("alpha ONE"), 0o644)
	for i := 0; i < 6; i++ {
		mi := mk("mi.json", `[{"file":"`+esc(fb)+`","old":"beta","new":"gamma"}]`)
		if _, err := applyManifest(mi, false); err != nil {
			return false
		}
		mj := mk("mj.json", `[{"file":"`+esc(fb)+`","old":"gamma","new":"beta"}]`)
		if _, err := applyManifest(mj, false); err != nil {
			return false
		}
	}
	ents, _ := os.ReadDir(applyJournalOverride)
	n := 0
	for _, e := range ents {
		if e.IsDir() {
			n++
		}
	}
	return n == applyJournalKeep
}

// test-type-colors -> selftest:type-colors
// req-type-colors: every surface resolves a type's color from the ONE palette source
// (product/brand/palette.md through the brand overlay), and no render carries its own
// literal — the engine source is clean of the six trace hexes outside the palette files.
func selftestTypeColors() bool {
	m := typeColors()
	for _, t := range []string{"need", "usecase", "requirement", "design", "test", "adr",
		"function", "question", "risk", "assumption", "issue", "dependency"} {
		if m[t] == "" || !strings.HasPrefix(m[t], "#") {
			return false // every rendered type has its palette entry
		}
	}
	// the emitted rules carry the RESOLVED values
	css := traceTypeCSS(".sw.")
	if !strings.Contains(css, ".sw.need{background:"+m["need"]+"}") ||
		!strings.Contains(css, ".sw.adr{background:"+m["adr"]+"}") {
		return false
	}
	if typeColor("risk") != m["risk"] || typeColor("no-such-type") == "" {
		return false // the raid kinds resolve the same way; an unknown type still paints
	}
	// no render carries its own literal: the Go source is clean of the trace hexes
	// (the probes are split so this file cannot match itself)
	hexes := []string{"ffe0" + "b2", "fff3" + "b0", "cfe3" + "fb", "cdec" + "cd", "e9d5" + "f3", "d7cc" + "c8"}
	clean := true
	filepath.Walk(EngineSrc(), func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".go") {
			return nil
		}
		raw, rerr := os.ReadFile(path)
		if rerr != nil {
			return nil
		}
		s := strings.ToLower(string(raw))
		for _, h := range hexes {
			if strings.Contains(s, h) {
				clean = false
			}
		}
		return nil
	})
	return clean
}

// test-ch2-ifu-intro -> selftest:ch2-ifu-intro
// req-ch2-ifu-intro: ONE introduction chapter, "Introduction and IFUs" - the
// document overview, then the IFU landing with the audience prose. RE-POINTED at
// the owner's merge ruling: the separate fundamentals-titled chapter died; the
// landing lives in the orientation chapter.
func selftestCh2IfuIntro() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	i := strings.Index(book, `id="man-intro-ifus"`)
	if i < 0 {
		return false
	}
	ch := book[i:]
	if j := strings.Index(ch[1:], `<article `); j >= 0 {
		ch = ch[:j+1]
	}
	if !strings.Contains(ch, "Introduction and IFUs") {
		return false // the chapter wears its new name, IFU visible in the heading
	}
	if !strings.Contains(ch, "Document overview") || !strings.Contains(ch, " IFUs</h2>") {
		return false // the 2.1 / 2.2 split (the section number rides inside the heading)
	}
	// RE-POINTED at the owner's hand-edit (2026-07-19): the audience prose died with it;
	// the landing routes through the ifus.base table - its open pills ARE the deck lane
	return strings.Contains(ch, `data-goto="ifu`)
}

// test-ch3-needs-intro -> selftest:ch3-needs-intro
// req-ch3-needs-intro: chapter 3 opens with IFU prose — IFUs show what users can do, each
// tells a user story, the idea composes into needs — and references the design-input
// register instead of opening with a technical needs list.
func selftestCh3NeedsIntro() bool {
	book, live := bookOnceHTML()
	if !live {
		return true
	}
	i := strings.Index(book, `id="man-design-input"`)
	if i < 0 {
		return false
	}
	ch := book[i:]
	if j := strings.Index(ch[1:], `<article `); j >= 0 {
		ch = ch[:j+1]
	}
	// the IFU prose OPENS the chapter: it sits before the first bound section and
	// before the register embed — never a technical needs list first (the term
	// references split "IFU" into a button, so the asserted phrase follows it)
	pos := strings.Index(ch, "tells a user story")
	ctxPos := strings.Index(ch, "Context and scope")
	regPos := strings.Index(ch, "input-register")
	if pos < 0 || ctxPos < 0 || regPos < 0 {
		return false
	}
	if !(pos < ctxPos && pos < regPos) {
		return false
	}
	// SHARPENED at the i27 c3 walk (the weak-test lesson): the ruling says the
	// needs LIST is gone, so its absence is asserted, not assumed - the opening
	// section (before Context and scope) references no need node at all. The need
	// FACET in the register below stays, per the i26 filter ruling.
	return !regexp.MustCompile(`need-[a-z]`).MatchString(ch[:ctxPos])
}

// req-graph-centering: a rendered graph narrower than its container centers horizontally
// — the centering rules ride both shells.
func selftestGraphCentering() bool {
	book, live := bookOnceHTML()
	if !live {
		return true
	}
	if !strings.Contains(book, ".onion-flow svg{display:block;margin:0 auto") {
		return false
	}
	if !strings.Contains(book, `figure[data-layer="figure"]>svg{display:block;margin:0 auto`) {
		return false
	}
	// SHARPENED at the i27 c5 walk: the context model was the missed container -
	// capped at 560px, display block, NO auto margins, so it hugged the left edge.
	// Every capped svg container centers.
	if !strings.Contains(book, ".ctx-model svg{display:block;max-width:560px;margin:0 auto") {
		return false
	}
	if !strings.Contains(book, ".onion-sm svg{max-height:62vh;width:auto;margin:0 auto") {
		return false
	}
	return strings.Contains(handoffCSS, ".handoff-model svg{display:block;margin:0 auto")
}

// test-vv-result-links -> selftest:vv-result-links
// req-vv-result-links: every verification row links its LATEST recorded result — the
// verdict store's entry, reachable from the row's expand; a test with no record says so.
func selftestVVResultLinks() bool {
	dir, err := os.MkdirTemp("", "q27vv")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldOverride, oldMemo := verdictPathOverride, verdictsMemo
	defer func() { verdictPathOverride, verdictsMemo = oldOverride, oldMemo }()
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	verdictRecord("test-vp", "in1", true, 34*time.Millisecond)
	fp := filepath.Join(dir, "t.md")
	os.WriteFile(fp, []byte("---\nid: test-vp\n---\n"), 0o644)
	nodes := map[string]Node{
		"test-vp": {ID: "test-vp", Type: "test", Statement: "a verified probe", Path: fp},
		"test-nr": {ID: "test-nr", Type: "test", Statement: "a recordless probe", Path: fp},
	}
	rows := []BaseRow{
		{ID: "test-vp", Cells: []string{"vp"}, Head: "a verified probe"},
		{ID: "test-nr", Cells: []string{"nr"}, Head: "a recordless probe"},
	}
	html := baseResultHTML([]BaseResult{{Name: "probe", Columns: []string{"name"}, Groups: []BaseGroup{{Rows: rows}}}}, nodes, nil, nil, "t27vv")
	if !strings.Contains(html, `class="vvres"`) || !strings.Contains(html, "result: pass") || !strings.Contains(html, "34ms") {
		return false
	}
	return strings.Contains(html, "no recorded result yet")
}

// test-vv-no-test-policy -> selftest:vv-no-test-policy
// req-vv-no-test-policy: a verification item with no test shows its recorded reason; an
// unexplained item or a bare TODO rationale is a DEFECT — over fixtures AND this live
// workspace, so the policy enforces itself.
func selftestVVNoTestPolicy() bool {
	dir, err := os.MkdirTemp("", "q27np")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	bad := filepath.Join(dir, "req-bad.md")
	os.WriteFile(bad, []byte("---\nid: req-bad\ntype: requirement\nstatement: an unexplained shall\n---\n## Rationale (not load-bearing)\nTODO\n"), 0o644)
	good := filepath.Join(dir, "req-good.md")
	os.WriteFile(good, []byte("---\nid: req-good\ntype: requirement\nstatement: an explained shall\n---\n## Rationale (not load-bearing)\nInspection covers it; a test would re-run the reviewer.\n"), 0o644)
	fx := map[string]Node{
		"req-bad":  {ID: "req-bad", Type: "requirement", Statement: "an unexplained shall", Path: bad},
		"req-good": {ID: "req-good", Type: "requirement", Statement: "an explained shall", Path: good},
		"req-gone": {ID: "req-gone", Type: "requirement", Statement: "a dropped shall", Path: bad, Retired: "dropped by ruling"},
	}
	fs := noTestPolicyFindings(fx)
	if len(fs) != 1 || !strings.Contains(fs[0], "req-bad") {
		return false // the TODO rationale is the defect; the explained and the retired pass
	}
	// the policy holds on THIS workspace: every no-test requirement carries its reason
	return len(noTestPolicyFindings(LoadAll())) == 0
}

// test-deck-nav-usability -> selftest:deck-nav-usability
// req-deck-nav-usability: present-mode navigation clamps at both ends (no wraparound)
// and a visible ESC pill closes the deck. The behavior landed with the deck lane;
// this guard pins it (tests_red: exempt on the node — no red was observable).
func selftestDeckNavUsability() bool {
	book, live := bookOnceHTML()
	if !live {
		return true
	}
	return strings.Contains(book, "cur=Math.max(0,Math.min(slides.length-1,i))") &&
		strings.Contains(book, `id="slide-esc"`) &&
		strings.Contains(book, "esc.addEventListener('click',deckExit)") &&
		strings.Contains(book, "if(e.key==='Escape')deckExit()")
}

// test-search-visible-hits -> selftest:search-visible-hits
// req-search-visible-hits: landing on a hit REVEALS it — collapsed details open, hidden
// expand rows unhide with their trigger row marked open, a graph pans its viewBox to the
// hit — every hit stays painted, and Enter / Shift+Enter step next and previous.
func selftestSearchVisibleHits() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	for _, want := range []string{
		"function revealHit", // the reveal pass runs before the scroll
		"a.open=true",        // a collapsed details ancestor opens
		"udetail",            // a hidden expand row unhides, its trigger row marked open
		"getBBox",            // a graph hit pans the svg viewBox to the hit
		"e.shiftKey?-1:1",    // Enter steps next, Shift+Enter previous
		"CSS.highlights",     // every hit stays painted
	} {
		if !strings.Contains(book, want) {
			return false
		}
	}
	return true
}

// test-evidence-md-tables -> selftest:evidence-md-tables
// req-evidence-md-tables: a markdown table in evidence renders as a real HTML table on
// the hand-off — header row honored, never raw pipes.
func selftestEvidenceMdTables() bool {
	html := handoffEvidenceHTML("| axis | score |\n|---|---|\n| fit | 0.9 |\n", map[string]Node{})
	if !strings.Contains(html, "<table") || !strings.Contains(html, "<th>axis</th>") || !strings.Contains(html, "<td>0.9</td>") {
		return false
	}
	return !strings.Contains(html, "| axis |") // never raw pipes
}

// test-handoff-live-figures -> selftest:handoff-live-figures
// req-handoff-live-figures: a layered model figure on the hand-off is the book's
// interactive onion — clickable, enterable in place — never a flat picture; the page
// rides the ONE shared interaction script, fork retired.
func selftestHandoffLiveFigures() bool {
	src := "```mermaid\nflowchart TD\n  subgraph kernel\n    el-core[\"the core\"]\n  end\n  subgraph shell\n    el-io[\"the io\"]\n  end\n  el-io -->|feeds| el-core\n```\n"
	html := handoffEvidenceHTML(src, map[string]Node{})
	if !strings.Contains(html, `class="onion`) || !strings.Contains(html, "data-onion-go") {
		return false // layered figures are the enterable onion
	}
	if strings.Contains(handoffJS, "__onionStack") {
		return false // the pager's private onion fork is retired
	}
	iterPath := filepath.Join(SPEC, "iterations", "i0023_modules", "tasks", "x.md")
	pn := map[string]Node{
		"f1-m6-done": {ID: "f1-m6-done", Milestone: 6, Class: "review", Statement: "a step", Path: iterPath},
		"f1-m6-gate": {ID: "f1-m6-gate", Milestone: 6, Class: "review", Killer: true, Statement: "the gate", Path: iterPath, DependsOn: []string{"f1-m6-done"}},
	}
	psm := map[string]string{"f1-m6-done": "DONE", "f1-m6-gate": "OPEN"}
	page := renderHandoffHTML("f1-m6-gate", pn, psm)
	return strings.Contains(page, "v.id.slice(-tid.length-1)") // the shared script rides the page
}

// test-details-full-entry -> selftest:details-full-entry
// req-details-full-entry: ONE reference-resolution mechanism, two outputs — the details
// pane where one exists (book, report), a small toast on the hand-off. The hand-off page
// ships every referenced entry as a template the toast fills, so the dotted links live;
// the pane surfaces announce a change with three staggered border echoes.
func selftestDetailsFullEntry() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0023_modules", "tasks", "x.md")
	pn := map[string]Node{
		"e1-m6-done": {ID: "e1-m6-done", Milestone: 6, Class: "review", Statement: "the finished step", Path: iterPath},
		"e1-m6-kill": {ID: "e1-m6-kill", Milestone: 6, Class: "review", Killer: true, Statement: "the killer step", Path: iterPath, DependsOn: []string{"e1-m6-done"}},
		"e1-m6-gate": {ID: "e1-m6-gate", Milestone: 6, Class: "review", Killer: true, Statement: "the gate", Path: iterPath, DependsOn: []string{"e1-m6-done", "e1-m6-kill"}},
	}
	psm := map[string]string{"e1-m6-done": "DONE", "e1-m6-kill": "OPEN", "e1-m6-gate": "OPEN"}
	html := renderHandoffHTML("e1-m6-kill", pn, psm)
	if !strings.Contains(html, `<template data-entry="e1-m6-done">`) {
		return false // every referenced entry ships on the page
	}
	if !strings.Contains(html, "the finished step") {
		return false // the template holds the FULL entry — the one resolver's output
	}
	if !strings.Contains(html, `id="toast"`) {
		return false // the hand-off's output container is the toast
	}
	if !strings.Contains(handoffJS, "data-entry") {
		return false // the hand-off script resolves references into the toast
	}
	// the pane surfaces announce a change: three staggered border echoes. The ripple
	// expands OUTWARD (owner re-ruling 2026-07-19: no inversion; riding onto the text
	// area is fine, leaving the screen is accepted), wears a VISIBLE color, paints
	// above the pane content, and the sidebar clip carries a margin so the ripple
	// escapes the corner dock instead of being swallowed.
	if !strings.Contains(reportJS, "__panePing") || !strings.Contains(reportCSS, "@keyframes qping") {
		return false
	}
	if !strings.Contains(reportCSS, "calc(-2px - 3vmax)") ||
		!strings.Contains(reportCSS, "border:2px solid #555") || !strings.Contains(reportCSS, "z-index:3") {
		return false
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, "__panePing") && strings.Contains(book, "@keyframes qping") &&
		strings.Contains(book, "calc(-2px - 3vmax)") && strings.Contains(book, "border:2px solid #555") &&
		strings.Contains(book, "z-index:3") && strings.Contains(book, "overflow:clip;overflow-clip-margin:4vmax")
}

// test-onion-space -> selftest:onion-space
// req-onion-space: the interactive onion breaks out of the prose column. The figure
// wears fig-wide, the shell carries the breakout rule with the fullscreen exclusion,
// and a narrow screen reverts. Red-teamed at design: the CSS rule alone can pass
// while no figure wears the class, so both halves are pinned.
func selftestOnionSpace() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, "figure.fig-wide:not(.fig-full){width:min(calc(100vw - 380px),1600px)") &&
		strings.Contains(book, `class="fig-wide" data-layer="figure"`) &&
		strings.Contains(book, "@media(max-width:900px){figure.fig-wide{width:auto;left:auto;transform:none}}")
}

// test-ifu-deck-pills -> selftest:ifu-deck-pills
// req-ifu-discovery: a guide row that IS a slide deck carries the open pill at the
// row's end, wired through the data-goto transport. Content check over this
// workspace: the setup IFU guide row carries the pill for ifu0001-setup, and every
// IFU guide row carries one. Red-teamed at design: a pill anywhere would pass a bare
// contains, so the count pins one per IFU deck.
func selftestIfuDeckPills() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	if !strings.Contains(book, `class="upill gdeck" href="#ifu0001-setup" data-goto="ifu0001-setup"`) ||
		strings.Count(book, `class="upill gdeck"`) < 7 {
		return false
	}
	// SHARPENED at the owner's landing rework: the intro chapter lists the IFUs as
	// a BASE-QUERY table (ifus.base), and a deck-manifest row auto-earns the open
	// pill in the ONE generic table renderer - never a hand-maintained list.
	i := strings.Index(book, `id="man-intro-ifus"`)
	if i < 0 {
		return false
	}
	ch := book[i:]
	if e := strings.Index(ch[1:], `<article `); e >= 0 {
		ch = ch[:e+1]
	}
	return strings.Contains(ch, `class="upill gdeck"`) && strings.Contains(ch, `data-goto="ifu0002-pong"`)
}

// test-pong-register-render -> selftest:pong-register-render
// req-design-input-register: the pong deck's register slide renders the SAMPLE
// register through the real component - never an authored HTML table. Red-teamed at
// design: the component's presence alone passes while the table coexists, so the
// deck source is asserted table-free too.
func selftestPongRegisterRender() bool {
	raw, err := os.ReadFile(filepath.Join(SPEC, "ifus", "ifu0002-pong.md"))
	if err != nil || strings.Contains(string(raw), "<table") {
		return false // the authored table is gone from the deck source
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, `class="sample-register"`)
}

// test-context-model-interfaces -> selftest:context-model-interfaces
// req-interface-notes: the interfaces LIVE on the context model - each boundary
// line carries its interface label, and a click opens the full note through the
// data-node-link lane. Red-teamed at design: a link anywhere in the book passes a
// bare contains, so the assertion scopes to the ctx-model svg.
func selftestContextModelInterfaces() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	i := strings.Index(book, `class="ctx-model"`)
	if i < 0 {
		return false
	}
	seg := book[i:]
	if e := strings.Index(seg, "</svg>"); e > 0 {
		seg = seg[:e]
	}
	return strings.Contains(seg, `data-node-link="con-interface--go-mcp-server--nbr-agent"`) &&
		strings.Contains(seg, ">The agent lane<")
}

// test-chapter-titles -> selftest:chapter-title-split
// req-chapter-titles: a chapter heading carries only the SHORT title; the statement's
// remainder renders as the separate subtitle line. Red-teamed at design: asserting
// one known chapter passes while another leaks, so every heading is bounded.
func selftestChapterTitleSplit() bool {
	if t, s := splitChapterTitle("Introduction and IFUs. Who this document serves."); t != "Introduction and IFUs" || s != "Who this document serves." {
		return false // the sentence split works beside the dash split
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	if !strings.Contains(book, "Introduction and IFUs <span class=\"ch-sub\">") {
		return false
	}
	for _, m := range regexp.MustCompile(`<h1>\d+\. ([^<]+)`).FindAllStringSubmatch(book, -1) {
		if len(strings.TrimSpace(m[1])) > 40 {
			return false // a statement leaked into a heading
		}
	}
	return true
}

// test-filter-unification -> selftest:filter-unification
// req-derived-boards.1 (re-ruled at the M6 reopen): ONE filtering surface. The
// board facets ride the register's filter columns - multi-valued, class-matched,
// zero-count holes visible - and the separate coverage board is GONE. Red-teamed
// at design: new columns alone pass while the board coexists, so its absence and
// the class-matching wiring are asserted too.
func selftestFilterUnification() bool {
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, `data-facet="b:phase"`) &&
		strings.Contains(book, `data-facet="b:quality"`) &&
		!strings.Contains(book, `<div class="board"`) &&
		strings.Contains(book, "'f-'+fn.slice(2)+'-'+k")
}

// test-toc-order -> selftest:toc-order
// req-toc-order: the table of contents OWNS the order - a chapter never knows its
// position. A toc manifest reorders chapters against their Order slots; a chapter
// the toc misses appends at the END, visibly; without a toc the Order slots rule
// unchanged. Red-teamed at design: asserting only the reorder passes while the
// fallback breaks, so both lanes are pinned.
func selftestTocOrder() bool {
	dir, err := os.MkdirTemp("", "q27toc")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	mk := func(id string, ord int) Node {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: manifest\nmode: chapter\norder: "+itoa(ord)+"\nstatement: "+id+".\n---\n<!-- ai:3 -->\nprose\n"), 0o644)
		return Node{ID: id, Type: "manifest", Mode: "chapter", Order: ord, Statement: id + ".", Path: p}
	}
	fx := map[string]Node{
		"man-a": mk("man-a", 10),
		"man-b": mk("man-b", 20),
		"man-c": mk("man-c", 30),
	}
	tp := filepath.Join(dir, "toc.md")
	os.WriteFile(tp, []byte("---\nid: toc\ntype: manifest\nmode: toc\nstatement: The toc.\n---\n- [man-c](man-c.md)\n- [man-a](man-a.md)\n"), 0o644)
	fx["toc"] = Node{ID: "toc", Type: "manifest", Mode: "toc", Statement: "The toc.", Path: tp}
	chs, _ := readerChapters(fx)
	var ids []string
	for _, c := range chs {
		ids = append(ids, c.ID)
	}
	if strings.Join(ids, ",") != "man-c,man-a,man-b" {
		return false // toc order wins; the unlisted chapter appends at the end
	}
	delete(fx, "toc")
	chs2, _ := readerChapters(fx)
	ids = ids[:0]
	for _, c := range chs2 {
		ids = append(ids, c.ID)
	}
	return strings.Join(ids, ",") == "man-a,man-b,man-c"
}

// test-quack-mv -> selftest:quack-mv
// req-quack-mv: one command renames a node and follows every reference class -
// the file name, markdown links, bare ids, edge lanes, engine source -
// boundary-safe (a longer id containing the old one never corrupts),
// collision-refused, and nothing writes on dry.
func selftestQuackMv() bool {
	dir, err := os.MkdirTemp("", "q27mv")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	w := func(rel, body string) string {
		p := filepath.Join(dir, rel)
		os.MkdirAll(filepath.Dir(p), 0o755)
		os.WriteFile(p, []byte(body), 0o644)
		return p
	}
	w("spec/man-a.md", "---\nid: man-a\ntype: manifest\nmode: chapter\nstatement: a.\n---\nprose\n")
	w("spec/man-ab.md", "---\nid: man-ab\ntype: manifest\nmode: chapter\nstatement: ab.\n---\nsee [man-a](man-a.md)\n")
	w("spec/edges.jsonl", "{\"src\":\"man-a\",\"dst\":\"x\"}\n")
	w("spec/code.go", "// the region cites man-a here\n")
	roots := []string{filepath.Join(dir, "spec")}
	if _, refs, err := mvRename(roots, nil, "man-a", "man-z", true, false); err != nil || refs < 3 {
		return false // the dry plan sees every reference class
	}
	if raw, _ := os.ReadFile(filepath.Join(dir, "spec", "man-ab.md")); !strings.Contains(string(raw), "man-a.md") {
		return false // dry wrote nothing
	}
	if _, _, err := mvRename(roots, nil, "man-a", "man-z", false, false); err != nil {
		return false
	}
	if _, err := os.Stat(filepath.Join(dir, "spec", "man-z.md")); err != nil {
		return false // the file renamed
	}
	if _, err := os.Stat(filepath.Join(dir, "spec", "man-a.md")); err == nil {
		return false // the old file is gone
	}
	ab, _ := os.ReadFile(filepath.Join(dir, "spec", "man-ab.md"))
	if !strings.Contains(string(ab), "[man-z](man-z.md)") || !strings.Contains(string(ab), "id: man-ab") {
		return false // links follow; the longer id man-ab never corrupts
	}
	ed, _ := os.ReadFile(filepath.Join(dir, "spec", "edges.jsonl"))
	cd, _ := os.ReadFile(filepath.Join(dir, "spec", "code.go"))
	if !strings.Contains(string(ed), `"src":"man-z"`) || !strings.Contains(string(cd), "cites man-z") {
		return false // edge lanes and source follow
	}
	if _, _, err := mvRename(roots, nil, "man-z", "man-ab", false, false); err == nil {
		return false // renaming onto a declared id refuses
	}
	return true
}

// test-apply-field-ops -> selftest:apply-field-ops
// req-apply-field-ops: set-field replaces a scalar frontmatter field in place,
// inserts a missing one inside the block, refuses a file without frontmatter,
// and refuses a nested block - every other byte survives.
func selftestApplyFieldOps() bool {
	raw := []byte("---\nid: t-x\ntype: test\nstatement: s.\nkiller: false\n---\nbody\n")
	out, err := setFrontmatterField(raw, "killer", "true")
	if err != nil || !strings.Contains(string(out), "killer: true") || !strings.Contains(string(out), "body") {
		return false
	}
	out2, err := setFrontmatterField(raw, "tests_red", "exempt - probe")
	if err != nil || !strings.Contains(string(out2), "tests_red: exempt - probe") ||
		strings.Index(string(out2), "tests_red:") > strings.Index(string(out2), "\n---\nbody") {
		return false
	}
	if _, err := setFrontmatterField([]byte("no frontmatter"), "x", "y"); err == nil {
		return false
	}
	nested := []byte("---\nid: t-y\nprovenance:\n  class: x\n---\n")
	if _, err := setFrontmatterField(nested, "provenance", "z"); err == nil {
		return false
	}
	return true
}

// test-timeline-singular -> selftest:timeline-singular
// req-project-timeline: ONE timeline design on every surface. The shared .qtl
// stylesheet is a single constant embedded verbatim by the report, the hand-off,
// and the book; each surface carries the rules exactly once; the old dot-line
// timeline fig kind is retired and its svg emitter is gone from the rendered book.
// Red-teamed at design: asserting the shared block's presence alone passes while a
// local variant coexists, so the occurrence count is pinned to exactly one.
func selftestTimelineSingular() bool {
	if strings.Count(reportCSS, ".qtl .hid{") != 1 || !strings.Contains(reportCSS, qtlSharedCSS) {
		return false // the report carries the shared block exactly once, no variant
	}
	if strings.Count(handoffCSS, ".qtl .hid{") != 1 || !strings.Contains(handoffCSS, qtlSharedCSS) {
		return false // the hand-off likewise
	}
	// red-teamed again (the owner's milestones-look-different report, 2026-07-19): the
	// shared block can be verbatim while an UNSCOPED rule on the timeline's class names
	// restyles it on ONE surface. Round two added the task-tree classes: the state-mark
	// colors lived only in the hand-off and the report, so the book's tree was colorless.
	// No surface may carry an unscoped rule on ANY timeline class name.
	for _, css := range []string{handoffCSS, reportCSS} {
		for _, gen := range []string{"\n.hrow", "\n.hid{", "\n.hstmt{", "\n.ttree", "\n.mk{", "\n.mk."} {
			if strings.Contains(css, gen) {
				return false
			}
		}
	}
	if _, retired := retiredFigKinds["timeline"]; !retired {
		return false // the dot-line fig kind is retired
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, qtlSharedCSS) && strings.Count(book, ".qtl .hid{") == 1 &&
		!strings.Contains(book, `aria-label="timeline"`)
}

// test-pugh-render -> selftest:pugh-render
// req-pugh-render: the matrix derives from criterion weights, candidate ratings, and the
// chosen edge — never prose. Criteria rows with weights, candidates as columns with the
// datum marked, sign cells against the datum, raw ratings reachable, a weighted-totals
// row, the winner from the chosen edge. The book's decision expand carries it.
func selftestPughRender() bool {
	dir, err := os.MkdirTemp("", "q27pgh")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	write := func(name, body string) string {
		p := filepath.Join(dir, name)
		os.WriteFile(p, []byte(body), 0o644)
		return p
	}
	ca := write("crit-pa.md", "---\nid: crit-pa\ntype: criterion\nweight: 0.6\nstatement: the first axis\n---\n")
	cb := write("crit-pb.md", "---\nid: crit-pb\ntype: criterion\nweight: 0.4\nstatement: the second axis\n---\n")
	ap := write("adr-p.md", "---\nid: adr-p\ntype: adr\ndatum: cand-d\nstatement: the pick\n---\n")
	nodes := map[string]Node{
		"crit-pa": {ID: "crit-pa", Type: "criterion", Statement: "the first axis", Path: ca},
		"crit-pb": {ID: "crit-pb", Type: "criterion", Statement: "the second axis", Path: cb},
		"cand-d": {ID: "cand-d", Type: "candidate", Statement: "the datum concept",
			Maps: map[string]map[string]string{"ratings": {"crit-pa": "0.5", "crit-pb": "0.5"}}},
		"cand-w": {ID: "cand-w", Type: "candidate", Statement: "the winner",
			Maps: map[string]map[string]string{"ratings": {"crit-pa": "0.9", "crit-pb": "0.5"}}},
		"adr-p": {ID: "adr-p", Type: "adr", Statement: "the pick", Path: ap,
			Chosen: []string{"cand-w"}, Rejected: []string{"cand-d"}},
	}
	html := renderPughMatrix(nodes["adr-p"], nodes)
	if !strings.Contains(html, `class="pugh"`) {
		return false
	}
	if !strings.Contains(html, "pgh-datum") || !strings.Contains(html, "datum") {
		return false // the datum column is marked
	}
	if !strings.Contains(html, "chosen") {
		return false // the winner mark derives from the chosen edge
	}
	if !strings.Contains(html, `class="pgh-better"`) || !strings.Contains(html, `class="pgh-same"`) {
		return false // cells are signs against the datum, not raw numbers
	}
	if !strings.Contains(html, "0.74") || !strings.Contains(html, "0.50") {
		return false // the weighted-totals row closes the table
	}
	if !strings.Contains(html, `title="0.9"`) {
		return false // the raw rating stays reachable
	}
	if !strings.Contains(html, "0.6") || !strings.Contains(html, "0.4") {
		return false // criteria rows carry their weights
	}
	// a decision with no datum draws no matrix — the data gap stays honest
	np := write("adr-n.md", "---\nid: adr-n\ntype: adr\nstatement: no datum\n---\n")
	nodes["adr-n"] = Node{ID: "adr-n", Type: "adr", Statement: "no datum", Path: np, Chosen: []string{"cand-w"}}
	if renderPughMatrix(nodes["adr-n"], nodes) != "" {
		return false
	}
	// the book: the decisions table died (owner ruling 2026-07-19) - decisions ride the
	// timeline drill into the details pane, so the drill's decision buttons are the lane
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, `tty-adr`)
}

// test-timeline-drilldown -> selftest:timeline-drilldown
// req-timeline-drilldown: an expanded task lists its decisions, evidence, and trace
// elements grouped by type, each group expandable; one pill row narrows the types; an
// element click feeds every surface's details pane (data-nid for the report, data-node-link
// for the book). On the hand-off the separate milestone-verdict panel DISSOLVES into this
// drill, and the rows under decision wear the deciding mark.
func selftestTimelineDrilldown() bool {
	nodes := map[string]Node{
		"adr-x":  {ID: "adr-x", Type: "adr", Statement: "a ruling"},
		"req-y":  {ID: "req-y", Type: "requirement", Statement: "a shall"},
		"test-z": {ID: "test-z", Type: "test", Statement: "a check"},
	}
	ev := map[string]string{"t1-step": "walked it, citing adr-x and req-y (test-z went green)\n"}
	d := timelineTaskDrill("t1-step", ev, nodes)
	if !strings.Contains(d, `class="tdrill"`) {
		return false
	}
	for _, want := range []string{`data-ttype="decisions"`, `data-ttype="requirements"`, `data-ttype="tests"`, `data-ttype="evidence"`} {
		if !strings.Contains(d, want) {
			return false // typed groups, each expandable
		}
	}
	if !strings.Contains(d, `data-nid="adr-x"`) || !strings.Contains(d, `data-node-link="adr-x"`) {
		return false // an element click fills the details pane on every surface
	}
	if !strings.Contains(d, `data-facet="ttype"`) || strings.Contains(d, "ufcol") {
		return false // the narrowing pills: one dimension, one horizontal row
	}
	if timelineTaskDrill("t-none", ev, nodes) != "" {
		return false // a task with nothing recorded gets no drill
	}
	// the hand-off: the verdict panel dissolved; the deciding rows wear the mark
	iterPath := filepath.Join(SPEC, "iterations", "i0023_modules", "tasks", "x.md")
	pn := map[string]Node{
		"d1-m6-done": {ID: "d1-m6-done", Milestone: 6, Class: "review", Path: iterPath},
		"d1-m6-kill": {ID: "d1-m6-kill", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"d1-m6-done"}},
		"d1-m6-gate": {ID: "d1-m6-gate", Milestone: 6, Class: "review", Killer: true, Path: iterPath, DependsOn: []string{"d1-m6-done", "d1-m6-kill"}},
	}
	psm := map[string]string{"d1-m6-done": "DONE", "d1-m6-kill": "OPEN", "d1-m6-gate": "OPEN"}
	html := renderHandoffHTML("d1-m6-kill", pn, psm)
	if strings.Contains(html, "view-verdict") || strings.Contains(html, "milestone verdict") {
		return false // the separate panel is gone — the tasks view is the one field
	}
	return strings.Contains(html, `deciding`)
}

// timelineFixture: two iterations with milestone-tagged gates on synthetic paths
// under SPEC — iterOf derives from the path shape; nothing reads the files.
func timelineFixture() (map[string]Node, map[string]string, map[string][]string) {
	mkTask := func(id, it string, ms int) Node {
		return Node{ID: id, Statement: "a step", Class: "review", Milestone: ms,
			Path: filepath.Join(SPEC, "iterations", it, "tasks", id+".md")}
	}
	nodes := map[string]Node{
		"p1-m1-gate": mkTask("p1-m1-gate", "i9901_probe", 1),
		"p1-m2-gate": mkTask("p1-m2-gate", "i9901_probe", 2),
		"p2-m1-gate": mkTask("p2-m1-gate", "i9902_probe", 1),
		"p2-m2-gate": mkTask("p2-m2-gate", "i9902_probe", 2),
	}
	sm := map[string]string{"p1-m1-gate": "DONE", "p1-m2-gate": "DONE", "p2-m1-gate": "DONE", "p2-m2-gate": "OPEN"}
	iters := map[string][]string{
		"i9901_probe": {"p1-m1-gate", "p1-m2-gate"},
		"i9902_probe": {"p2-m1-gate", "p2-m2-gate"},
	}
	return nodes, sm, iters
}

// test-project-timeline -> selftest:project-timeline
// req-project-timeline: the BOOK frame — width unconstrained, every iteration through
// the ONE shared renderer; the project chapter carries the timeline and the risk matrix.
func selftestProjectTimeline() bool {
	nodes, _, _ := timelineFixture()
	html := renderFigure("project-timeline", nodes)
	if !strings.Contains(html, `qtl qtl-book`) ||
		!strings.Contains(html, `data-iter="i9901_probe"`) || !strings.Contains(html, `data-iter="i9902_probe"`) {
		return false // all iterations, one shared renderer, the book frame
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	ch := strings.Index(book, `id="man-project"`)
	if ch < 0 {
		return false
	}
	rest := book[ch:]
	return strings.Contains(rest, "qtl qtl-book") && strings.Contains(rest, `id="raid-matrix"`)
}

// test-timeline-anchor -> selftest:timeline-anchor
// req-timeline-anchor: the REPORT frame anchors the current iteration three quarters
// down, earlier iterations stack above, and overflow scrolls with arrows and the
// wheel — never pagination.
func selftestTimelineAnchor() bool {
	nodes, sm, iters := timelineFixture()
	panel := iterationsPanel(nodes, sm, iters, Config{Version: "i9902_probe"})
	if !strings.Contains(panel, `class="qtl-anchor"`) || !strings.Contains(panel, `id="qtl-scroll"`) {
		return false // the scroll host wraps the iteration stack
	}
	if !strings.Contains(panel, `data-uscroll="up"`) || !strings.Contains(panel, `data-uscroll="down"`) {
		return false // an arrow on each end
	}
	if !strings.Contains(panel, "qtl qtl-report") {
		return false // each iteration body is the shared renderer in its report frame
	}
	if strings.Contains(panel, `class="bracket`) {
		return false // the old bracket-lane renderer is dead
	}
	if strings.Contains(panel, "qt-pager") {
		return false // never pagination
	}
	// the shell anchors the CURRENT iteration three quarters down and scrolls by wheel
	// (native) and arrows; the factor lives in the report script
	return strings.Contains(reportJS, "0.75") && strings.Contains(reportJS, "qtl-scroll")
}

// test-risk-matrix -> selftest:risk-matrix
// req-risk-matrix: one continuous matrix over every RAID item — impact x, probability y,
// both 0..1; one bubble per item, COLOR by kind; kind and status ride the generic filter
// columns with closed hidden by default; a bubble click fills the details pane.
func selftestRiskMatrix() bool {
	dir, err := os.MkdirTemp("", "q27rm")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	mk := func(id, kind, status string, p, i string) Node {
		fp := filepath.Join(dir, id+".md")
		os.WriteFile(fp, []byte("---\nid: "+id+"\ntype: raid\nkind: "+kind+"\nprobability: "+p+"\nimpact: "+i+"\nstatus: "+status+"\nstatement: a "+kind+"\n---\n"), 0o644)
		return Node{ID: id, Type: "raid", Kind: kind, Statement: "a " + kind, Path: fp}
	}
	nodes := map[string]Node{
		"raid-r1": mk("raid-r1", "risk", "open", "0.8", "0.3"),
		"raid-r2": mk("raid-r2", "issue", "closed", "1", "0.6"),
		"raid-r3": mk("raid-r3", "assumption", "open", "0.2", "0.9"),
		// a second risk keeps the kind facet alive: the standard table drops a facet
		// whose values all name exactly one row (a pill per row is a list, not a filter)
		"raid-r4": mk("raid-r4", "risk", "open", "0.5", "0.5"),
	}
	html := renderRaidMatrix(nodes)
	if strings.Count(html, `class="rbub"`) != 4 {
		return false // one bubble per RAID item, closed ones in the DOM too
	}
	if !strings.Contains(html, `data-e1="issue" data-e2="closed"`) || !strings.Contains(html, `data-node-link="raid-r2"`) {
		return false // kind and status ride the bubble as the STANDARD facet attrs; a click opens the details pane
	}
	fills := map[string]bool{}
	for _, m := range regexp.MustCompile(`class="rbub"[^>]*fill="(#[0-9a-fA-F]+)"`).FindAllStringSubmatch(html, -1) {
		fills[m[1]] = true
	}
	if len(fills) != 3 {
		return false // three kinds, three colors — position alone carries severity
	}
	// the filters are the STANDARD reader-table pills (owner 2026-07-19: never reinvent
	// tables): kind is enum facet e1, status e2, and closed starts DESELECTED as DATA
	if !strings.Contains(html, `data-facet="e1"`) || !strings.Contains(html, `data-facet="e2"`) {
		return false
	}
	if !strings.Contains(html, `class="upill on" data-fv="open"`) {
		return false // open starts selected...
	}
	if strings.Contains(html, `class="upill on" data-fv="closed"`) {
		return false // ...and closed starts hidden
	}
	if !regexp.MustCompile(`data-facet="e2"><span class="pilllbl">status</span><button type="button" class="upill" data-fv="\*"`).MatchString(html) {
		return false // the status star is OFF while the pre-selection stands
	}
	cxOf := func(id string) int {
		m := regexp.MustCompile(`data-node-link="` + id + `"[^>]*cx="(\d+)" cy="(\d+)"`).FindStringSubmatch(html)
		if m == nil {
			return -1
		}
		v, _ := strconv.Atoi(m[1])
		return v
	}
	cyOf := func(id string) int {
		m := regexp.MustCompile(`data-node-link="` + id + `"[^>]*cx="(\d+)" cy="(\d+)"`).FindStringSubmatch(html)
		if m == nil {
			return -1
		}
		v, _ := strconv.Atoi(m[2])
		return v
	}
	if cxOf("raid-r3") <= cxOf("raid-r1") {
		return false // impact rides x: 0.9 sits right of 0.3
	}
	if cyOf("raid-r2") >= cyOf("raid-r3") {
		return false // probability rides y upward: 1 sits above 0.2
	}
	// the owner rework (2026-07-19): the side table IS the standard reader table — the
	// ONE table machinery with its own pills, expands, and pager; the bespoke raid table
	// is gone. Ten rows a page here; the statement rides the standard brief/expand lane,
	// never a raw statement column. The matrix sits beside and listens to the same pills.
	if !strings.Contains(html, `class="raid-wrap"`) || !strings.Contains(html, `class="raid-side"`) {
		return false // the side-by-side layout exists
	}
	if strings.Contains(html, `data-raid-row=`) || !strings.Contains(html, `q-table u-table`) {
		return false // the standard reader table replaced the bespoke one
	}
	if !strings.Contains(html, `data-node="raid-r2"`) || !strings.Contains(html, `class="qt-size"><option selected>10</option>`) {
		return false // standard expandable rows; the pager defaults to TEN rows
	}
	if !strings.Contains(html, `<th scope="col">kind</th>`) || !strings.Contains(html, `<th scope="col">status</th>`) {
		return false // the enum facets render as visible columns (a filterable hidden fact is banned)
	}
	if !strings.Contains(html, `probability: 1`) {
		return false // the expand carries the recorded scoring
	}
	if typeColor("risk") == typeColor("issue") || typeColor("issue") != "#7d3fa8" {
		return false // the kind colors are clearly distinct (the two-reds regression)
	}
	if raw, err := os.ReadFile(filepath.Join(SPEC, "man-project.md")); err != nil || strings.Contains(string(raw), "raid.base") {
		return false // the old register embed is gone: the side table is THE table
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return strings.Contains(book, `id="raid-matrix"`) && strings.Contains(book, ".raid-matrix") &&
		strings.Contains(book, `tr.urow[data-node=`) // the figure, the pills, and the bubble→row select wiring ride the book
}

// test-design-input-register -> selftest:design-input-register
// req-design-input-register: ONE register folds functions, use cases, and requirements
// (functional and quality) behind need and type filter columns; the separate
// use-cases-and-functions section is dead — the book renders the register, never the board.
func selftestDesignInputRegister() bool {
	dir, err := os.MkdirTemp("", "q27reg")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fp := filepath.Join(dir, "probe.md")
	os.WriteFile(fp, []byte("---\nid: probe\n---\n"), 0o644) // the register renders file-backed rows only
	nodes := map[string]Node{
		"need-a": {ID: "need-a", Type: "need", Statement: "the first need"},
		"need-b": {ID: "need-b", Type: "need", Statement: "the second need"},
		"uc-a":   {ID: "uc-a", Type: "usecase", Statement: "the owner does a", Refines: []string{"need-a"}, Path: fp},
		"uc-b":   {ID: "uc-b", Type: "usecase", Statement: "the owner does b", Refines: []string{"need-b"}, Path: fp},
		"fn-a":   {ID: "fn-a", Type: "function", Statement: "collect the sample", Refines: []string{"need-a"}, Path: fp},
		"req-q":  {ID: "req-q", Type: "requirement", Kind: "quality", Statement: "the probe shall answer fast", Refines: []string{"need-b"}, Path: fp},
	}
	html := renderInputRegister(nodes)
	for _, want := range []string{`data-e1="use case"`, `data-e1="function"`, `data-e1="quality"`} {
		if !strings.Contains(html, want) {
			return false // the fold carries every design-input type
		}
	}
	if !strings.Contains(html, `class="ufilters"`) || !strings.Contains(html, `data-facet="need"`) {
		return false // need and type ride the generic filter columns
	}
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	return !strings.Contains(book, `id="ucfn-board"`) && strings.Contains(book, `id="input-register"`)
}

// test-filter-pills -> selftest:filter-pills
// req-filter-pill-rule: several filter dimensions render one VERTICAL column each —
// header names the category, chips carry counts, an empty value stays clickable at
// zero, a column past ten values scrolls with an arrow on each end; ONE dimension
// stays a single horizontal pill row.
func selftestFilterPills() bool {
	nodes := map[string]Node{}
	var rows []BaseRow
	for i := 1; i <= 12; i++ {
		sfx := itoa(i)
		if i < 10 {
			sfx = "0" + sfx
		}
		nd, uc := "need-"+sfx, "uc-"+sfx
		nodes[nd] = Node{ID: nd, Type: "need", Statement: "a need"}
		nodes[uc] = Node{ID: uc, Type: "usecase", Statement: "a use case", Refines: []string{nd}}
		kind := "alpha"
		if i%2 == 0 {
			kind = "beta"
		}
		rows = append(rows, BaseRow{ID: uc, Cells: []string{"u" + sfx, kind}, Head: "a use case"})
	}
	nodes["need-zero"] = Node{ID: "need-zero", Type: "need", Statement: "no rows yet"}
	rs := []BaseResult{{Name: "probe", Columns: []string{"name", "kind"}, Groups: []BaseGroup{{Rows: rows}}}}
	html := baseResultHTML(rs, nodes, nil, nil, "t27fp")
	if !strings.Contains(html, `class="ufilters"`) {
		return false // several dimensions wrap into the filter-column row
	}
	if strings.Count(html, "upills ufcol") < 2 {
		return false // one vertical column per dimension
	}
	if !strings.Contains(html, `data-uscroll="up"`) || !strings.Contains(html, `data-uscroll="down"`) {
		return false // a column past ten values scrolls, arrows on both ends
	}
	if !strings.Contains(html, "(0)") {
		return false // an empty value stays visible and clickable, showing zero
	}
	if !strings.Contains(html, "(6)") {
		return false // chips carry their value counts
	}
	// one dimension only: a single horizontal pill row, never a column
	var rows1 []BaseRow
	for i := 0; i < 4; i++ {
		kind := "alpha"
		if i%2 == 0 {
			kind = "beta"
		}
		rows1 = append(rows1, BaseRow{Cells: []string{"p" + itoa(i), kind}, Head: "a row"})
	}
	h1 := baseResultHTML([]BaseResult{{Name: "single", Columns: []string{"name", "kind"}, Groups: []BaseGroup{{Rows: rows1}}}}, map[string]Node{}, nil, nil, "t27fp1")
	return strings.Contains(h1, `class="upills"`) && !strings.Contains(h1, "ufcol") && !strings.Contains(h1, "ufilters")
}

// test-model-kinds-catalog -> selftest:model-kinds-catalog
// req-model-kinds-catalog: the model-kinds section derives per kind from the registry
// template — its prose, its example rendered small, and the linked uses; a kind used
// nowhere does not render. The fixture nodes decide USE: one structural instance, no
// onion instance, no neighbour notes (so the derived context kind is unused too).
func selftestModelKindsCatalog() bool {
	nodes := map[string]Node{
		"model-s": {ID: "model-s", Type: "model", Kind: "structural", Statement: "a structural instance"},
	}
	html := renderModelKindsCatalog(nodes)
	if !strings.Contains(html, `data-kind-example="structural"`) {
		return false // the used kind renders
	}
	if !strings.Contains(html, "part-of") {
		return false // the prose comes from the template body, once
	}
	if !strings.Contains(html, "<svg") {
		return false // the template's example fence renders small
	}
	if !strings.Contains(html, `data-node-link="model-s"`) {
		return false // the use list links every declared instance of the kind
	}
	if strings.Contains(html, `data-kind-example="onion"`) || strings.Contains(html, `data-kind-example="context"`) {
		return false // a kind used nowhere is absent
	}
	// with an onion instance and a neighbour note, both kinds appear
	nodes["model-o"] = Node{ID: "model-o", Type: "model", Kind: "onion", Statement: "an onion instance"}
	nodes["nbr-app"] = Node{ID: "nbr-app", Type: "neighbour", Statement: "a neighbour"}
	html = renderModelKindsCatalog(nodes)
	return strings.Contains(html, `data-kind-example="onion"`) &&
		strings.Contains(html, `data-kind-example="context"`)
}

// test-onion-boilerplate -> selftest:onion-boilerplate
// req-onion-boilerplate: an ambient-stamped (boilerplate) element gets a hide control
// that FOLDS it from the render — CSS-side, so the DOM (and the model) stay complete.
func selftestOnionBoilerplate() bool {
	mo := &modelOnion{rings: []string{"shell"},
		layerOf: map[string]string{"a-flow": "shell", "a-util": "ambient"},
		labelOf: map[string]string{"a-flow": "does the work", "a-util": "log helper"}}
	in := onionInput{
		layers: []onionLayer{{name: "shell"}},
		model:  mo,
		reads:  map[string]bool{"a-flow": true},
		inputs: []string{"disk"},
		els:    []string{"a-flow", "a-util"},
		relOf:  map[string]string{"a-flow": "x/a.go", "a-util": "x/b.go"},
		themes: true,
		idp:    "t27bp",
	}
	html := renderOnionData(in, nil, map[string]Node{})
	if !strings.Contains(html, `data-oc-amb="1"`) {
		return false // the ambient pill carries the boilerplate stamp
	}
	if !strings.Contains(html, `data-oc-fold`) || !strings.Contains(html, "hide boilerplate") {
		return false // the fold control rides the infrastructure row
	}
	if !strings.Contains(html, "log helper") {
		return false // the fold is render-side: the DOM keeps the element (model complete)
	}
	// the fold rule and its toggle live in BOTH hosts' shells
	book, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	sa, err := renderStandaloneModel("model-engine-layers", nil)
	if err != nil || sa == "" {
		return false
	}
	for _, h := range []string{book, sa} {
		if !strings.Contains(h, ".onion.fold-amb [data-oc-amb]{display:none}") {
			return false // the CSS fold rule
		}
		if !strings.Contains(h, "classList.toggle('fold-amb')") {
			return false // the shared script's toggle
		}
	}
	return true
}

// test-onion-click -> selftest:onion-click
// Single-click shows a block's details (req-onion-click) in EVERY onion host: the book
// and the standalone review ride ONE shared interaction script (go-onion-interact). The
// book's details lane is the pane (its data-node-link handler); the standalone registers
// the inspect hook that fills its own panel.
func selftestOnionClick() bool {
	html, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	if !strings.Contains(html, "__onionInspect") || !strings.Contains(html, "window.bookNodeDetail(") {
		return false // the book: inspect + the details pane lane
	}
	if !strings.Contains(html, "window.__onionInspectHook)window.__onionInspectHook(") {
		return false // the shared script exposes the pluggable details hook
	}
	// SHARPENED at the i27 c10 walk: a block's single click INSPECTS and nothing
	// else - the inspect handler stops propagation, so the book's bubbling
	// data-node-link transport can never double-fire a cross-layer jump.
	if !strings.Contains(html, "ev.preventDefault();ev.stopPropagation();__onionInspect(el);") {
		return false
	}
	sa, err := renderStandaloneModel("model-engine-layers", nil)
	if err != nil || sa == "" {
		return false
	}
	if !strings.Contains(sa, "__onionInspect") {
		return false // the standalone rides the SAME script, never a fork
	}
	return strings.Contains(sa, "window.__onionInspectHook=function") // its panel is the hook
}

// test-onion-enter -> selftest:onion-enter
// Entering pushes browser history and BACK exits (req-onion-enter) in every host; the
// drill target resolves HOST-SCOPED by id or id-suffix, so a deck slide's id-prefixed
// copy drills its own views (the M5 spike's bounded defect); the popstate stack keeps
// the view element, never a global id lookup.
func selftestOnionEnter() bool {
	html, live := bookOnceHTML()
	if !live {
		return true
	}
	sa, err := renderStandaloneModel("model-engine-layers", nil)
	if err != nil || sa == "" {
		return false
	}
	for _, h := range []string{html, sa} {
		if !strings.Contains(h, `history.pushState({nav:'onion'}`) {
			return false // entering is a real, reversible navigation
		}
		if !strings.Contains(h, "'popstate'") {
			return false // BACK exits the entered block
		}
		if !strings.Contains(h, `v.id.slice(-tid.length-1)==='-'+tid`) {
			return false // host-scoped drill: an id-prefixed copy resolves its own view
		}
		if !strings.Contains(h, "__onionStack.push({host:host,el:cur})") {
			return false // the stack keeps the element - no global id lookups
		}
	}
	return true
}

// test-onion-clusters -> selftest:onion-clusters
// Cluster rules (req-onion-clusters): grouping derives from DSM coupling, never the
// file; a cluster is ONE enterable block whose interior view has a top input bus, a
// bottom output bus, identified lanes, and NO core; nesting repeats the rules. The
// fixture is the dsm-cluster battery's two-triangle graph, whose split is proven
// deterministic — and all six regions share ONE file, so a theme grouping would fuse
// them into a single block.
func selftestOnionClusters() bool {
	consumes := map[string][]string{
		"a1": {"a2", "a3", "b1"},
		"a2": {"a1", "a3"},
		"a3": {"a1", "a2"},
		"b1": {"b2", "b3"},
		"b2": {"b1", "b3"},
		"b3": {"b1", "b2"},
	}
	ids := []string{"a1", "a2", "a3", "b1", "b2", "b3"}
	layerOf := map[string]string{}
	relOf := map[string]string{}
	for _, id := range ids {
		layerOf[id] = "shell"
		relOf[id] = "x/same.go"
	}
	mo := &modelOnion{rings: []string{"shell"}, layerOf: layerOf, labelOf: map[string]string{}}
	in := onionInput{
		layers:    []onionLayer{{name: "shell"}},
		model:     mo,
		consumes:  consumes,
		reads:     map[string]bool{"a1": true},
		diskReads: map[string]bool{"a1": true}, // the disk bus taps disk-touchers only (go-io-busbar)
		writes:    map[string]bool{"b3": true},
		inputs:    []string{"disk"},
		outputs:   []string{"stdout"},
		els:       ids,
		relOf:     relOf,
		themes:    true,
		idp:       "t27cl",
	}
	html := renderOnionData(in, nil, map[string]Node{})
	// the coupling split wins over the shared file: TWO module views, no theme view
	if !strings.Contains(html, `id="t27cl-oLv0c0"`) || !strings.Contains(html, `id="t27cl-oLv0c1"`) {
		return false
	}
	if strings.Contains(html, `id="t27cl-oLv0f0"`) {
		return false // the file-theme grouping is retired
	}
	c0 := strings.Index(html, `id="t27cl-oLv0c0"`)
	c0end := strings.Index(html[c0:], "</svg>")
	if c0end < 0 {
		return false
	}
	view := html[c0 : c0+c0end]
	if strings.Contains(view, "core ▽") {
		return false // no core inside a cluster (rule 2)
	}
	inRail := regexp.MustCompile(`<line x1="(-?\d+)" y1="(-?\d+)" x2="(-?\d+)" y2="(-?\d+)" stroke="#2f8f4e" stroke-width="1.6"`).FindStringSubmatch(view)
	outRail := regexp.MustCompile(`<line x1="(-?\d+)" y1="(-?\d+)" x2="(-?\d+)" y2="(-?\d+)" stroke="#b5651d" stroke-width="1.6"`).FindStringSubmatch(view)
	if inRail == nil || outRail == nil || inRail[2] != inRail[4] || outRail[2] != outRail[4] {
		return false // the cluster interior keeps the top/bottom bus geometry (rule 2)
	}
	// identified lanes (rule 5): the cross-module output lane names its target module
	if !strings.Contains(view, "→ module 2") && !strings.Contains(view, "→ module 1") {
		return false
	}
	// nesting (rule 7): the SAME emitter, handed the whole six as one group, splits
	// it inside — sub-cluster blocks with their own coreless child views appear
	var nb strings.Builder
	ctx := ogCtx{
		consumes:  consumes,
		reads:     map[string]bool{"a1": true},
		diskReads: map[string]bool{"a1": true},
		writes:    map[string]bool{"b3": true},
		inputs:    []string{"disk"},
		outputs:   []string{"stdout"},
		els:       ids,
		layerOf:   layerOf,
		L:         "shell",
		base:      "t27n-o0",
		layerView: "t27n-oLv0",
		layerName: "shell",
		crossName: func(o string) string { return layerOf[o] },
		layerSort: func(string) int { return 0 },
		label:     func(id string) string { return id },
		sub:       func(string) string { return "" },
		full:      func(id string) string { return id },
		isMarked:  func(string) bool { return false },
		inspect:   func(*obusBlock, string) {},
	}
	ctx.emit(&nb, "t27n-g0", "the blob", ids, [][2]string{{"t27n-o0", "overview"}, {"t27n-oLv0", "shell"}})
	nested := nb.String()
	if !strings.Contains(nested, `id="t27n-g0c0"`) || !strings.Contains(nested, `id="t27n-g0c1"`) {
		return false // the interior split renders sub-cluster views
	}
	return !strings.Contains(nested, "core ▽") // bus-only boundaries at every depth
}

// test-onion-io-rendering -> selftest:onion-io-rendering
// The committed layout spec (onion-io-layout.excalidraw.md, req-onion-io-rendering) binds
// the onion geometry, and the DRAWING is the content: every bar owns its OWN full-width
// horizontal rail — inputs stacked across the TOP with each box riding its rail's LEFT
// end, outputs mirrored across the BOTTOM with each box at the RIGHT end. A merged shared
// rail is the twice-recorded regression this test now refuses. A block taps every rail it
// consumes; a to-core block sits LEFT of the core and a from-core block RIGHT; the body
// stays a round centered disc; the topmost overview carries the same per-bar rail form,
// its arrows stopping at the onion's outside.
func selftestOnionIORendering() bool {
	rails := func(hay, color string) [][3]int {
		var out [][3]int // {x1, y, x2}: horizontal markerless 1.6-width lines — the rails
		for _, m := range regexp.MustCompile(`<line x1="(-?\d+)" y1="(-?\d+)" x2="(-?\d+)" y2="(-?\d+)" stroke="`+color+`" stroke-width="1.6"/>`).FindAllStringSubmatch(hay, -1) {
			x1, _ := strconv.Atoi(m[1])
			y1, _ := strconv.Atoi(m[2])
			x2, _ := strconv.Atoi(m[3])
			y2, _ := strconv.Atoi(m[4])
			if y1 == y2 {
				out = append(out, [3]int{x1, y1, x2})
			}
		}
		return out
	}
	boxes := func(hay, fill string) [][4]int {
		var out [][4]int // {x, y, w, h}
		for _, m := range regexp.MustCompile(`<rect x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)" rx="4" fill="`+fill+`"`).FindAllStringSubmatch(hay, -1) {
			x, _ := strconv.Atoi(m[1])
			y, _ := strconv.Atoi(m[2])
			w, _ := strconv.Atoi(m[3])
			h, _ := strconv.Atoi(m[4])
			out = append(out, [4]int{x, y, w, h})
		}
		return out
	}
	boxed := func(rl [][3]int, bx [][4]int, left bool) bool {
		if len(rl) != len(bx) {
			return false // one box per rail, in rail order
		}
		for i, r := range rl {
			b := bx[i]
			if b[1]+b[3]/2 != r[1] {
				return false // the box centre rides its OWN rail line
			}
			if left && b[0]+b[2] != r[0] {
				return false // an input rail starts at its box's right edge
			}
			if !left && b[0] != r[2] {
				return false // an output rail ends at its box's left edge
			}
		}
		return true
	}

	// --- the band view (level 1): direct probe of the one shared SVG layout, TWO bars a side ---
	aBl := &obusBlock{id: "s", label: "sender", toCore: true, ins: []int{0, 1}}
	bBl := &obusBlock{id: "r", label: "receiver", fromCore: true, outs: []int{1}}
	svg := onionViewSVG("probe layer", "probe layer", "t27b", []string{"from outer", "conf"}, []string{"→ outer", "log"},
		[]*obusBlock{aBl, bBl}, nil, false, obusOpts{round: true, hasCore: true, coreName: "inner", coreDrill: "t27bx"})
	inR, outR := rails(svg, "#2f8f4e"), rails(svg, "#b5651d")
	if len(inR) != 2 || len(outR) != 2 || inR[0][1] == inR[1][1] || outR[0][1] == outR[1][1] {
		return false // one rail PER bar, stacked — never the merged shared rail
	}
	for _, r := range inR {
		if r[1] >= aBl.y || r[1] >= bBl.y {
			return false // every input rail runs ABOVE the blocks
		}
	}
	for _, r := range outR {
		if r[1] <= aBl.y+aBl.h || r[1] <= bBl.y+bBl.h {
			return false // every output rail runs BELOW the blocks
		}
	}
	if !boxed(inR, boxes(svg, "#eef7f0"), true) || !boxed(outR, boxes(svg, "#fbf2ea"), false) {
		return false
	}
	// the sender declared BOTH input bars: one inflow tap lands on EACH consumed rail
	tapIn := regexp.MustCompile(`<line data-oc-block="s" data-oc-flow="in" x1="-?\d+" y1="(-?\d+)"`).FindAllStringSubmatch(svg, -1)
	if len(tapIn) != 2 {
		return false
	}
	tys := map[string]bool{}
	for _, m := range tapIn {
		tys[m[1]] = true
	}
	if !tys[strconv.Itoa(inR[0][1])] || !tys[strconv.Itoa(inR[1][1])] {
		return false
	}
	if aBl.x+aBl.w/2 >= 0 || bBl.x+bBl.w/2 <= 0 {
		return false // side rule: to-core LEFT of the core, from-core RIGHT
	}
	if !strings.Contains(svg, `<circle cx="0" cy="0"`) || strings.Contains(svg, "<ellipse") {
		return false // the body is a round centered disc, never an oval
	}

	// --- the topmost overview (level 0): the SAME per-bar rail form over the rings ---
	in := onionInput{
		layers:  []onionLayer{{name: "shell", pats: []string{"shell/*"}}},
		inputs:  []string{"disk", "conf"},
		outputs: []string{"stdout"},
		ioLink:  map[string]string{"disk": "con-probe"},
		reads:   map[string]bool{"a-one": true},
		writes:  map[string]bool{"a-one": true},
		els:     []string{"a-one"},
		relOf:   map[string]string{"a-one": "shell/a.go"},
		idp:     "t27oio",
	}
	html := renderOnionData(in, nil, map[string]Node{})
	end := strings.Index(html, "</svg>")
	if end < 0 {
		return false
	}
	lv0 := html[:end]
	cm := regexp.MustCompile(`<circle cx="(-?\d+)" cy="(-?\d+)" r="120"`).FindStringSubmatch(lv0)
	if cm == nil {
		return false // the outer ring anchors the geometry
	}
	cx, _ := strconv.Atoi(cm[1])
	cy, _ := strconv.Atoi(cm[2])
	oinR, ooutR := rails(lv0, "#2f8f4e"), rails(lv0, "#b5651d")
	if len(oinR) != 2 || len(ooutR) != 1 || oinR[0][1] == oinR[1][1] {
		return false // one rail per input above the rings, one per output below
	}
	for _, r := range oinR {
		if r[1] >= cy-120 {
			return false
		}
	}
	if ooutR[0][1] <= cy+120 {
		return false
	}
	if !boxed(oinR, boxes(lv0, "#eef7f0"), true) || !boxed(ooutR, boxes(lv0, "#fbf2ea"), false) {
		return false
	}
	if strings.Contains(lv0, "stroke-dasharray") {
		return false // the dashed per-box radial arrows are gone
	}
	if !strings.Contains(lv0, `data-node-link="con-probe"`) {
		return false // a mapped pill opens its interface note
	}
	// every rail sends its OWN solid tap, stopping at the onion's OUTSIDE (rule 2):
	// marker arrows with one endpoint on the outer rim, never inside the rings
	taps := regexp.MustCompile(`<line x1="(-?\d+)" y1="(-?\d+)" x2="(-?\d+)" y2="(-?\d+)" stroke="#(?:2f8f4e|b5651d)" stroke-width="1.6" marker`).FindAllStringSubmatch(lv0, -1)
	if len(taps) != 3 {
		return false
	}
	for _, m := range taps {
		onRim := false
		for _, pt := range [][2]string{{m[1], m[2]}, {m[3], m[4]}} {
			x, _ := strconv.Atoi(pt[0])
			y, _ := strconv.Atoi(pt[1])
			d := math.Hypot(float64(x-cx), float64(y-cy))
			if d >= 118 && d <= 131 {
				onRim = true
			}
			if d < 118 {
				return false // an endpoint inside the rings breaks rule 2
			}
		}
		if !onRim {
			return false
		}
	}
	return true
}

// test-function-nodes -> selftest:function-nodes
// A former need-functions entry becomes a first-class function node (the owner ruling on
// req-function-nodes): migrate-functions mints one node per list entry beside its need,
// refines-wired, strips the retired list, and runs idempotent; the strict referee refuses
// a leftover list naming the recovery; the node is trace content (never a gate) and lands
// in the design-input register as TYPE function.
func selftestFunctionNodes() bool {
	dir, err := os.MkdirTemp("", "q27fn")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	tr := filepath.Join(sp, "trace")
	os.MkdirAll(tr, 0o755)
	np := filepath.Join(tr, "need-probe.md")
	os.WriteFile(np, []byte("---\nid: need-probe\ntype: need\nstatement: The owner needs the probe handled.\nfunctions: [collect the sample, render the verdict]\n---\n## note (not load-bearing)\nthe body stays\n"), 0o644)
	made, err := migrateFunctions(sp)
	if err != nil || made != 2 {
		return false
	}
	fnp := filepath.Join(tr, "fn-collect-the-sample.md")
	raw, err := os.ReadFile(fnp)
	if err != nil {
		return false
	}
	s := string(raw)
	if !strings.Contains(s, "type: function") || !strings.Contains(s, "refines: [need-probe]") ||
		!strings.Contains(s, "statement: collect the sample") {
		return false
	}
	if _, err := os.Stat(filepath.Join(tr, "fn-render-the-verdict.md")); err != nil {
		return false
	}
	nraw, _ := os.ReadFile(np)
	if strings.Contains(string(nraw), "functions:") || !strings.Contains(string(nraw), "the body stays") {
		return false // the retired list is gone, the rest of the need file intact
	}
	if n, err := migrateFunctions(sp); err != nil || n != 0 {
		return false // idempotent: a second run finds nothing to migrate
	}
	if len(StrictIssues(sp)) != 0 {
		return false // the migrated pair loads clean: the type accepted, the edge resolves
	}
	os.WriteFile(filepath.Join(tr, "need-left.md"),
		[]byte("---\nid: need-left\ntype: need\nstatement: A need with a leftover list.\nfunctions: [stray entry]\n---\n"), 0o644)
	retired := false
	for _, is := range StrictIssues(sp) {
		if is.Key == "functions" && strings.Contains(is.Msg, "migrate-functions") {
			retired = true
		}
	}
	if !retired {
		return false // the retired key refuses with its recovery clause
	}
	// connections mode: the minted node carries NO frontmatter edge; the refines
	// edge rides the jsonl lane instead (go-edge-mode binds the migration too)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\nedges = \"connections\"\n"), 0o644)
	if n, err := migrateFunctions(sp); err != nil || n != 1 {
		return false // the leftover list migrates in connections mode
	}
	sraw, err := os.ReadFile(filepath.Join(tr, "fn-stray-entry.md"))
	if err != nil || strings.Contains(string(sraw), "refines:") {
		return false // no legacy edge key on the minted node in connections mode
	}
	jraw, err := os.ReadFile(filepath.Join(sp, "connections", "refines", "edges.jsonl"))
	if err != nil || !strings.Contains(string(jraw), `{"src":"fn-stray-entry","dst":"need-left"}`) {
		return false // the edge landed in the refines jsonl lane
	}
	if isGate(Node{ID: "fn-collect-the-sample", Type: "function"}) {
		return false // trace content, never a walkable gate
	}
	nodes := map[string]Node{
		"need-probe":            {ID: "need-probe", Type: "need", Statement: "The owner needs the probe handled.", Path: np},
		"uc-probe":              {ID: "uc-probe", Type: "usecase", Statement: "The owner runs the probe.", Refines: []string{"need-probe"}, Path: np},
		"fn-collect-the-sample": {ID: "fn-collect-the-sample", Type: "function", Statement: "collect the sample", Refines: []string{"need-probe"}, Path: fnp},
	}
	html := renderInputRegister(nodes)
	// the row is node-backed (expandable), typed function (the enum facet needs the
	// second type to exist), named by the humanized id with the fn prefix stripped
	return strings.Contains(html, `data-node="fn-collect-the-sample"`) &&
		strings.Contains(html, `data-e1="function"`) &&
		strings.Contains(html, `data-text="collect the sample function`)
}

// test-attest-freshness -> selftest:attest-freshness
// A long-lived process must see ledger events written by ANOTHER process: the pager's
// watch server records a bless; the resident MCP child answers next. The attest-events
// memo must therefore invalidate on file change, never trust a per-process snapshot.
func selftestAttestFreshness() bool {
	dir, err := os.MkdirTemp("", "q27att")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	oldAttest := ATTEST
	defer func() { ATTEST = oldAttest }()
	ATTEST = filepath.Join(dir, "attest.json")
	os.WriteFile(ATTEST, []byte(`[{"check":"g-a","action":"bless","actor":"user","ts":"t1","hash":"h1","statement_hash":"s1","deps":{},"prev_hash":null}]`), 0o644)
	if len(attestEvents()) != 1 {
		return false // the first read parses the file
	}
	// an EXTERNAL writer (another process) appends a second event; force a
	// distinguishable file identity even on coarse mtime clocks via size change
	os.WriteFile(ATTEST, []byte(`[{"check":"g-a","action":"bless","actor":"user","ts":"t1","hash":"h1","statement_hash":"s1","deps":{},"prev_hash":null},{"check":"g-b","action":"bless","actor":"user","ts":"t2","hash":"h2","statement_hash":"s2","deps":{},"prev_hash":null}]`), 0o644)
	return len(attestEvents()) == 2 // the memo must not mask the external write
}
