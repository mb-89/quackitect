package main

// i16_red.go — the i0016_structural_models RED battery: tests first, they FAIL until
// the build. Each case carries its trace line: test-<id> -> selftest:<name>. Hermetic:
// graphs are built from in-memory sources and temp fixtures; nothing touches the
// real spec. The stubs at the bottom define the build's API surface and are replaced
// by models.go at the green steps.

import (
	"os"
	"path/filepath"
	"strings"
)

const i16FixtureModel = `flowchart TD
  subgraph inner
    el-a["does a"]
    el-b["does b"]
  end
  subgraph outer
    el-c["does c"]
  end
  el-c -->|payload one| el-a
  el-a -->|payload two| el-b
`

// test-model-nodes -> selftest:model-nodes
func selftestModelNodes() bool {
	dir, err := os.MkdirTemp("", "q16n")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	raw := "---\nid: model-probe\ntype: model\nkind: layers-flow\nquestion: what depends on what?\nstatement: probe model\n---\n```mermaid\n" + i16FixtureModel + "```\n"
	p := filepath.Join(dir, "model-probe.md")
	os.WriteFile(p, []byte(raw), 0o644)
	n := ParseNode(p)
	if n.Type != "model" {
		return false // the strict parser accepts a model node
	}
	g, _ := extractModelGraph(raw)
	return len(g.Layers) == 2 && len(g.Elems) == 3 && g.CanonicalHash() != ""
}

// test-draft-is-truth -> selftest:draft-is-truth
func selftestDraftIsTruth() bool {
	// the graph extracts from the NODE FILE itself - the fenced block, no sidecar
	raw := "---\nid: model-x\ntype: model\nkind: layers-flow\nstatement: s\n---\nprose before\n```mermaid\n" + i16FixtureModel + "```\nprose after\n"
	g, _ := extractModelGraph(raw)
	if len(g.Elems) != 3 || len(g.Flows) != 2 {
		return false
	}
	// a BOM-prefixed source extracts identically (the M5 finding)
	bom := string([]byte{0xEF, 0xBB, 0xBF})
	g2, lint := extractModelGraph(bom + raw)
	return g2.CanonicalHash() == g.CanonicalHash() && len(lint) == 0
}

// test-semantic-hash -> selftest:semantic-hash
func selftestSemanticHash() bool {
	g, _ := extractModelGraph(i16FixtureModel)
	base := g.CanonicalHash()
	if base == "" {
		return false
	}
	cosmetic := strings.Replace(i16FixtureModel, "    el-a[\"does a\"]\n    el-b[\"does b\"]", "    %% a comment\n    el-b[\"does b\"]\n    el-a[\"does a\"]", 1)
	gc, _ := extractModelGraph(cosmetic)
	if gc.CanonicalHash() != base {
		return false // reorder within a layer + a comment is cosmetic
	}
	semantic := i16FixtureModel + "  el-b -->|payload three| el-c\n"
	gs, _ := extractModelGraph(semantic)
	return gs.CanonicalHash() != base // an added flow is semantic
}

// test-model-lint -> selftest:model-lint
func selftestModelLint() bool {
	bad := i16FixtureModel + "  el-ghost -->|| el-a\n"
	_, lint := extractModelGraph(bad)
	var undeclared, unlabeled bool
	for _, f := range lint {
		if strings.Contains(f, "el-ghost") {
			undeclared = true
		}
		if strings.Contains(f, "label") {
			unlabeled = true
		}
	}
	// beyond-subset syntax lints AND the rest still parses (the M5 finding)
	g, lint2 := extractModelGraph("style weird\n" + i16FixtureModel)
	return undeclared && unlabeled && len(lint2) > 0 && len(g.Elems) == 3
}

// test-model-consistency -> selftest:model-consistency
func selftestModelConsistency() bool {
	a, _ := extractModelGraph(i16FixtureModel)
	other := "flowchart TD\n  subgraph solo\n    el-z[\"z\"]\n  end\n  el-z -->|uses| el-a\n  el-z -->|uses| el-nowhere\n"
	b, _ := extractModelGraph(other)
	finds := modelConsistencyFindings(map[string]modelGraph{"model-a": a, "model-b": b})
	var dangling, crossOK bool
	for _, f := range finds {
		if strings.Contains(f, "el-nowhere") {
			dangling = true
		}
		if strings.Contains(f, "el-a") {
			crossOK = false // el-a IS declared by the sibling - not a finding
		}
	}
	crossOK = !strings.Contains(strings.Join(finds, "|"), "\"el-a\"")
	return dangling && crossOK
}

// test-conformance -> selftest:conformance
func selftestConformance() bool {
	declared, _ := extractModelGraph(i16FixtureModel)
	asBuilt := modelGraph{
		Layers: []string{"inner", "outer"},
		Elems:  map[string]modelElem{"el-a": {"inner", ""}, "el-b": {"inner", ""}, "el-c": {"outer", ""}, "el-sky": {"outer", ""}},
		Flows:  []modelFlow{{"el-c", "el-a", ""}, {"el-a", "el-c", ""}},
	}
	rep := conformanceReport(declared, asBuilt)
	return len(rep.Convergences) == 1 && // el-c -> el-a is declared and built
		len(rep.Divergences) == 1 && // el-a -> el-c points OUTWARD, undeclared
		len(rep.Absences) == 1 && // el-a -> el-b declared, never built
		len(rep.SkyFalls) == 1 // el-sky realized, never allocated
}

// test-divergence-suspect -> selftest:divergence-suspect
func selftestDivergenceSuspect() bool {
	declared, _ := extractModelGraph(i16FixtureModel)
	clean := modelGraph{Layers: declared.Layers, Elems: declared.Elems,
		Flows: []modelFlow{{"el-c", "el-a", ""}, {"el-a", "el-b", ""}}}
	if !modelConforms(declared, clean) {
		return false // a matching build conforms
	}
	dirty := modelGraph{Layers: declared.Layers, Elems: declared.Elems,
		Flows: []modelFlow{{"el-c", "el-a", ""}, {"el-a", "el-b", ""}, {"el-a", "el-c", ""}}}
	return !modelConforms(declared, dirty) // a divergence fails the executed check -> the board goes red
}

// test-no-flow-smell -> selftest:no-flow-smell
func selftestNoFlowSmell() bool {
	src := "flowchart TD\n  subgraph busy\n    el-p[\"p\"]\n    el-q[\"q\"]\n  end\n  subgraph idle\n    el-r[\"r\"]\n  end\n  el-p -->|work| el-q\n"
	g, _ := extractModelGraph(src)
	smells := noFlowSmells(g)
	return len(smells) == 1 && strings.Contains(smells[0], "idle")
}

// test-model-kinds -> selftest:model-kinds
func selftestModelKinds() bool {
	files := modelKindFiles()
	if len(files) < 5 {
		return false // the registry carries at least five kinds
	}
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			return false
		}
		s := string(raw)
		for _, key := range []string{"question:", "format:", "choose-when:"} {
			if !strings.Contains(s, key) {
				return false // every kind names its question, format, and heuristic
			}
		}
	}
	return true
}

// test-model-stubs -> selftest:model-stubs
func selftestModelStubs() bool {
	stub := modelStubFor("layers-flow")
	if stub == "" {
		return false
	}
	g, lint := extractModelGraph(stub)
	return len(lint) == 0 && len(g.Layers) > 0 // the emitted skeleton parses clean
}

// test-views-chosen -> selftest:views-chosen
func selftestViewsChosen() bool {
	covered := map[string]*Node{
		"model-a":     {ID: "model-a", Type: "model", Statement: "m"},
		"adr-views-x": {ID: "adr-views-x", Type: "adr", Statement: "views chosen: model-a in; state rejected - nothing modal"},
	}
	if fs := viewsChosenFindings(covered); len(fs) != 0 {
		return false // a covered model is no finding
	}
	orphan := map[string]*Node{"model-b": {ID: "model-b", Type: "model", Statement: "m"}}
	fs := viewsChosenFindings(orphan)
	return len(fs) == 1 && strings.Contains(fs[0], "model-b") // a model with no covering views-chosen decision lints
}

// test-models-gate-build -> selftest:models-gate-build
func selftestModelsGateBuild() bool {
	dir, err := os.MkdirTemp("", "q16g")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	authored := filepath.Join(dir, "model-full.md")
	os.WriteFile(authored, []byte("---\nid: model-full\ntype: model\nkind: layers-flow\nstatement: s\n---\n```mermaid\n"+i16FixtureModel+"```\n"), 0o644)
	empty := filepath.Join(dir, "model-hollow.md")
	os.WriteFile(empty, []byte("---\nid: model-hollow\ntype: model\nkind: layers-flow\nstatement: s\n---\n"), 0o644)
	nodes := map[string]*Node{
		"model-full":   {ID: "model-full", Type: "model", Path: authored},
		"model-hollow": {ID: "model-hollow", Type: "model", Path: empty},
	}
	fs := modelsGateFindings(nodes)
	return len(fs) == 1 && strings.Contains(fs[0], "model-hollow") // a declared-but-unauthored model holds the build
}

// test-models-in-book -> selftest:models-in-book
func selftestModelsInBook() bool {
	dir, err := os.MkdirTemp("", "q16b")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	mp := filepath.Join(dir, "model-probe.md")
	os.WriteFile(mp, []byte("---\nid: model-probe\ntype: model\nkind: layers-flow\nstatement: probe\n---\n```mermaid\n"+i16FixtureModel+"```\n"), 0o644)
	fx["model-probe"] = Node{ID: "model-probe", Type: "model", Statement: "probe", Path: mp}
	man := "---\nid: man-mod\ntype: manifest\nmode: chapter\nstatement: Design output.\n---\n<!-- ai:3 -->\nThe lede for the model chapter.\n---\nfig: model model-probe\n"
	mpn := filepath.Join(dir, "man-mod.md")
	os.WriteFile(mpn, []byte(man), 0o644)
	fx["man-mod"] = Node{ID: "man-mod", Type: "manifest", Mode: "chapter", Statement: "Design output.", Path: mpn}
	html, _, _ := renderBookHTML(fx)
	return strings.Contains(html, "model-probe") && strings.Contains(html, "payload one") // the chapter renders the model with its labeled flows
}

// test-answer-validated -> selftest:answer-validated
// Class guard for the external report 2026-07-10: an answer token outside the
// ask's declared options must not resolve the ask (uncontrolled input would
// otherwise land in a.Answer and later renders).
func selftestAnswerValidated() bool {
	mk := func() *AskStore {
		a := i15Ask("decision")
		a.Options = []AskOption{{ID: "1", Label: "one"}, {ID: "2", Label: "two"}, {ID: "3", Label: "three"}}
		return &AskStore{Asks: []Ask{a}}
	}
	s := mk()
	if _, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "9"}, "test", 2000); applied || s.Asks[0].State != "pending" {
		return false // an undeclared token neither applies nor resolves
	}
	if _, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: ""}, "test", 2000); applied || s.Asks[0].State != "pending" {
		return false // an empty body neither applies nor panics
	}
	if _, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "2 extra words"}, "test", 2000); !applied || s.Asks[0].Answer != "2" {
		return false // a declared option resolves, first token wins
	}
	return true
}

// (all build-surface stubs replaced by models.go)
