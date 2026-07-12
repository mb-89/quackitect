package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// i18_red.go — this iteration's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices EXPLICITLY; this file owns i18Tests).
//
// book-graph-membership — the post-ship batch regressed the book trace graph:
//   the kind-less "general" decisions rode the preserved pre-fold membership beside
//   the honest architecture-kind set, and the needs stopped reading as the per-need
//   roots. This check pins the membership at the DATA level (the derived tabs, not a
//   rendered pixel): one tab per need with that need as its root, decisions only of
//   frontmatter kind architecture, no unrooted stray.

var i18Tests = []namedTest{
	{"book-graph-membership", selftestBookGraphMembership},
	{"diagram-review-render", selftestDiagramReviewRender},
	{"dsm-cluster", selftestDSMCluster},
	{"mcp-serve", selftestMCPServe},
	{"field-schemas", selftestFieldSchemas},
}

// selftest:field-schemas — proves the field-schema mechanism on FIXTURES (test-field-schemas,
// req-field-schemas). It stands up a temp schema home and temp node files so the check never
// touches the live graph, then asserts, end to end:
//   - the schema set loads and its defaults resolve from the schema (default_class -> "review");
//   - the schema tester passes a well-formed set;
//   - the lint catches a node whose field values break the schema (class/killer/kind), while a
//     valid node draws no finding;
//   - the tester rejects a malformed schema — an unknown value-type, a bad tier, a default outside
//     its enum, an unknown key, and a missing tier are each findings.
func selftestFieldSchemas() bool {
	dir, err := os.MkdirTemp("", "q18fs")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	sdir := filepath.Join(dir, "schemas")
	os.MkdirAll(sdir, 0o755)

	common := `{"type":"common","fields":["class","killer"],` +
		`"type_class":"enum","enum_class":["review","executed","judgment"],"tier_class":"core","default_class":"review",` +
		`"type_killer":"bool","tier_killer":"core","default_killer":"false"}`
	req := `{"type":"requirement","fields":["kind"],"type_kind":"enum","enum_kind":["functional","quality"],"tier_kind":"deferrable"}`
	os.WriteFile(filepath.Join(sdir, "common.json"), []byte(common), 0o644)
	os.WriteFile(filepath.Join(sdir, "requirement.json"), []byte(req), 0o644)

	schemas := loadFieldSchemas(sdir)
	if len(schemas) != 2 {
		return false // both schema files load
	}
	// defaults resolve from the schema (common merges into the per-type view)
	m := mergedSchema(schemas, "requirement")
	if r := m.fields["class"]; r == nil || !r.defSet || r.def != "review" {
		return false
	}
	if _, ok := m.fields["kind"]; !ok {
		return false // the per-type field rode the merge
	}
	// a well-formed schema set passes the tester
	if len(schemaSetFindings(sdir)) != 0 {
		return false
	}

	anySub := func(fs []string, sub string) bool {
		for _, f := range fs {
			if strings.Contains(f, sub) {
				return true
			}
		}
		return false
	}

	// node fixtures: a valid requirement, and one whose class/killer/kind all break the schema
	good := filepath.Join(dir, "req-good.md")
	bad := filepath.Join(dir, "req-bad.md")
	os.WriteFile(good, []byte("---\nid: req-good\ntype: requirement\nclass: review\nkiller: false\nkind: quality\n---\n"), 0o644)
	os.WriteFile(bad, []byte("---\nid: req-bad\ntype: requirement\nclass: bogus\nkiller: maybe\nkind: nonsense\n---\n"), 0o644)
	nodes := map[string]Node{
		"req-good": {ID: "req-good", Type: "requirement", Path: good},
		"req-bad":  {ID: "req-bad", Type: "requirement", Path: bad},
	}
	finds := fieldSchemaFindingsWith(nodes, schemas)
	if anySub(finds, "req-good:") {
		return false // a valid node must pass clean
	}
	if !anySub(finds, `req-bad: field "class"`) ||
		!anySub(finds, `req-bad: field "killer"`) ||
		!anySub(finds, `req-bad: field "kind"`) {
		return false // every broken field is named
	}

	// the tester rejects a malformed schema: unknown type, bad tier, default outside enum, unknown key
	tdir := filepath.Join(dir, "bad-schemas")
	os.MkdirAll(tdir, 0o755)
	os.WriteFile(filepath.Join(tdir, "requirement.json"),
		[]byte(`{"type":"requirement","fields":["kind"],"type_kind":"colour","enum_kind":["a","b"],"tier_kind":"loose","default_kind":"z","bogus_kind":"x"}`), 0o644)
	tf := schemaSetFindings(tdir)
	if !anySub(tf, "unknown type") || !anySub(tf, "bad tier") || !anySub(tf, "outside its enum") || !anySub(tf, "unknown key") {
		return false
	}
	// a missing tier is its own finding
	os.WriteFile(filepath.Join(tdir, "requirement.json"),
		[]byte(`{"type":"requirement","fields":["kind"],"type_kind":"enum","enum_kind":["a"]}`), 0o644)
	return anySub(schemaSetFindings(tdir), "tier missing")
}

// selftest:mcp-serve — drives the real stdio MCP server IN-PROCESS (the handler and the serve
// loop, no subprocess) and asserts the conformance the spike ranked (test-mcp-serve,
// req-mcp-server). It exercises the handshake, the generated tool surface, a read-only call, the
// per-session attest choke on an unattested ledger call, an unknown-tool error result, the
// no-reply-to-a-notification rule, and a clean EOF exit.
//
// The read-only probe is `why` on an ABSENT id: it early-returns "unknown id" before any StatusMap
// call, so this test never recurses into tests-pass (which runs this very check).
func selftestMCPServe() bool {
	s := newMCPSession()
	call := func(line string) map[string]interface{} {
		var buf bytes.Buffer
		bw := bufio.NewWriter(&buf)
		s.handleLine([]byte(line+"\n"), bw)
		bw.Flush()
		if buf.Len() == 0 {
			return nil // a notification: no reply
		}
		var m map[string]interface{}
		if json.Unmarshal(buf.Bytes(), &m) != nil {
			return map[string]interface{}{"__parsefail__": true}
		}
		return m
	}
	resultOf := func(m map[string]interface{}) (map[string]interface{}, bool) {
		r, ok := m["result"].(map[string]interface{})
		return r, ok
	}
	contentText := func(r map[string]interface{}) string {
		c, _ := r["content"].([]interface{})
		if len(c) == 0 {
			return ""
		}
		first, _ := c[0].(map[string]interface{})
		t, _ := first["text"].(string)
		return t
	}

	// 1. initialize handshake
	m := call(`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`)
	if m == nil || m["jsonrpc"] != "2.0" || jsonNum(m["id"]) != "1" {
		return false
	}
	res, ok := resultOf(m)
	if !ok || res["protocolVersion"] != mcpProtocolVersion {
		return false
	}
	caps, _ := res["capabilities"].(map[string]interface{})
	if _, hasTools := caps["tools"]; !hasTools {
		return false
	}
	si, _ := res["serverInfo"].(map[string]interface{})
	if si == nil || si["name"] == nil {
		return false
	}

	// 2. a notification produces NO reply
	if call(`{"jsonrpc":"2.0","method":"notifications/initialized"}`) != nil {
		return false
	}

	// 3. tools/list returns the generated surface, each tool with a schema; id echoed verbatim
	m = call(`{"jsonrpc":"2.0","id":2,"method":"tools/list"}`)
	if m == nil || jsonNum(m["id"]) != "2" {
		return false
	}
	res, _ = resultOf(m)
	tl, _ := res["tools"].([]interface{})
	if len(tl) == 0 {
		return false
	}
	names := map[string]bool{}
	for _, t := range tl {
		tm, _ := t.(map[string]interface{})
		names[jsonNum(tm["name"])] = true
		if _, hasSchema := tm["inputSchema"].(map[string]interface{}); !hasSchema {
			return false
		}
	}
	if !names["status"] || !names["bless"] {
		return false // the read-only face AND the ledger face are both surfaced
	}

	// 4. a read-only tool call answers with the command's structured result (fresh from the graph)
	m = call(`{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"why","arguments":{"id":"__no_such_node__"}}}`)
	res, ok = resultOf(m)
	if !ok || res["isError"] != false || !strings.Contains(contentText(res), "unknown id") {
		return false
	}

	// 5. a ledger tool while UNATTESTED returns the challenge as a RESULT (not an error), and the
	//    session stays unattested — the choke refused the ledger advance
	m = call(`{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"bless","arguments":{"target":"anything"}}}`)
	if m["error"] != nil {
		return false // a refusal is NOT a transport error
	}
	res, ok = resultOf(m)
	if !ok || res["isError"] != false || !strings.Contains(strings.ToLower(contentText(res)), "attest") {
		return false
	}
	if s.attested {
		return false // an unattested ledger call must never flip the flag
	}

	// 6. an unknown tool is an isError result listing the available tools — the transport survives
	m = call(`{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"nope","arguments":{}}}`)
	if m["error"] != nil {
		return false
	}
	res, ok = resultOf(m)
	if !ok || res["isError"] != true || !strings.Contains(contentText(res), "status") {
		return false
	}

	// 7. the serve loop exits cleanly on EOF, having answered the one request it read
	var out bytes.Buffer
	done := make(chan bool, 1)
	go func() {
		newMCPSession().serve(strings.NewReader(`{"jsonrpc":"2.0","id":9,"method":"initialize","params":{}}`+"\n"), &out)
		done <- true
	}()
	select {
	case <-done:
	case <-time.After(3 * time.Second):
		return false // a loop that does not return on EOF would hang the client
	}
	return out.Len() > 0
}

// jsonNum renders a decoded JSON scalar (string, or a numeric id/name as float64) as a stable
// string — enough to compare an echoed id or read a tool name.
func jsonNum(v interface{}) string {
	switch t := v.(type) {
	case string:
		return t
	case float64:
		return strconv.FormatFloat(t, 'f', -1, 64)
	}
	return ""
}

// selftest:dsm-cluster — the DSM clustering + layering algorithm on two small
// KNOWN fixtures (req-dsm-cluster). Deterministic: the same fixture always yields
// the same clusters, layers, and tears, so these assertions are real regression
// guards, not flakes.
//   - two triangles joined by ONE directed bridge a1->b1: the two triangles must
//     separate into two clusters, the a-cluster must layer before the b-cluster
//     (the bridge direction), and the clean bridge must NOT be torn.
//   - a directed 3-cycle c1->c2->c3->c1: the cluster digraph is cyclic however the
//     nodes group, so tearing must break it with EXACTLY one edge.
func selftestDSMCluster() bool {
	// fixture 1 — two mutually-coupled triangles (w=2 within each), one bridge.
	f1 := map[string][]string{
		"a1": {"a2", "a3", "b1"}, // triangle A + the directed bridge to B
		"a2": {"a1", "a3"},
		"a3": {"a1", "a2"},
		"b1": {"b2", "b3"}, // triangle B
		"b2": {"b1", "b3"},
		"b3": {"b1", "b2"},
	}
	r1 := dsmAnalyze(f1)
	if len(r1.Clusters) != 2 {
		return false // the two obvious modules must separate
	}
	if r1.ClusterOf["a1"] != r1.ClusterOf["a2"] || r1.ClusterOf["a1"] != r1.ClusterOf["a3"] {
		return false // triangle A must stay whole
	}
	if r1.ClusterOf["b1"] != r1.ClusterOf["b2"] || r1.ClusterOf["b1"] != r1.ClusterOf["b3"] {
		return false // triangle B must stay whole
	}
	if r1.ClusterOf["a1"] == r1.ClusterOf["b1"] {
		return false // A and B must be different clusters
	}
	if r1.Layer[r1.ClusterOf["a1"]] >= r1.Layer[r1.ClusterOf["b1"]] {
		return false // the bridge a1->b1 orders A before B
	}
	if len(r1.Tears) != 0 {
		return false // a clean bridge is not a cycle — nothing to tear
	}
	// fixture 2 — a directed 3-cycle: exactly one tear breaks it.
	f2 := map[string][]string{"c1": {"c2"}, "c2": {"c3"}, "c3": {"c1"}}
	r2 := dsmAnalyze(f2)
	return len(r2.Tears) == 1
}

// selftest:diagram-review-render — the standalone single-model onion review.
// Asserts the two properties of req-diagram-review-render:
//   - PROPAGATION: with the i18 mark set (5 planned blocks auto-marked + the two
//     changed-existing ids), the change-mark appears at EVERY drill level. A
//     marked leaf element (go-bless, in the outer rim ring) must carry the mark;
//     the mark must ride UP to a cluster block and to a ring — proven by a change
//     DOT on a ring inside the top overview view and by more than one "changed" disc
//     or ring tag across the levels.
//   - STANDALONE: one self-contained document — a doctype, inlined <style>/<script>,
//     no external request, small, and NOT the whole book.
func selftestDiagramReviewRender() bool {
	html, err := renderStandaloneModel("model-engine-layers", []string{"go-ask-loop", "go-bless"})
	if err != nil || html == "" {
		return false
	}
	// standalone discipline
	if !strings.HasPrefix(html, "<!doctype html>") {
		return false
	}
	if !strings.Contains(html, "<style>") || !strings.Contains(html, "<script>") {
		return false
	}
	if strings.Contains(html, "http://") || strings.Contains(html, "https://") ||
		strings.Contains(html, "<link") || strings.Contains(html, " src=") {
		return false // an external request would break the single-file discipline
	}
	if strings.Contains(html, "man-readme") || strings.Contains(html, "the spec book") {
		return false // the whole book leaked in
	}
	// RE-POINTED (onion grouping redesign): the drill-down is now bus-bar GROUPING views
	// (input+output bars at EVERY level, both-direction cross-layer bars) plus the review
	// inspect data (per-block responsibility/requirement/decision for the details panel).
	// The page grew from ~290KB to ~314KB — still a SMALL self-contained review, under 10%
	// of the ~3.4MB full book. The guard rises to 384KB to keep the "not the whole book"
	// property honest without pinning the retired recursive-onion size.
	if len(html) > 384*1024 {
		return false // not small
	}
	// element level: at least one block carries the change outline
	if strings.Count(html, `stroke="`+onionMarkColor+`" stroke-width="2.4"`) < 1 {
		return false
	}
	// ring/disc level: the mark rode up — more than one ring or disc shows "changed"
	if strings.Count(html, "· changed") < 2 {
		return false
	}
	// TOP level: a ring inside the overview view itself shows the change, as a DOT on
	// the ring band (the owner's clear marker, replacing the old dashed overlay). figSeq
	// is reset in the standalone, so the overview is fig1-o0 and the layer views fig1-oLv*.
	i := strings.Index(html, `id="fig1-o0"`)
	j := strings.Index(html, `id="fig1-oLv`)
	if i < 0 || j <= i {
		return false
	}
	if !strings.Contains(html[i:j], `r="5" fill="`+onionMarkColor+`"`) {
		return false // no change dot on a top-level ring: propagation to the ring failed
	}
	return true
}

// selftest:book-graph-membership — asserts the book's per-need trace tabs
// (bookGraphTabs) carry the clean, kind-honest membership:
//   - at least one tab, and every tab is a need paged on its own root;
//   - the tab's need node is present and is a ROOT (no in-tab edge targets it);
//   - every decision node in any tab is frontmatter kind architecture (the display
//     fold that relabels kind-less decisions as "general->architecture" never feeds
//     the graph - project, risk, quality, and kind-less decisions stay out);
//   - no unrooted stray: every non-need node is reachable (a target of some in-tab edge).
//
// bookGraphBusy bounds the tests-pass re-entry (the report-live/status-fast recursion class):
// this check calls StatusMap, whose coverage:tests-pass rule re-runs this very check. Without a
// warm verdict cache that recurses forever, so on re-entry the nested call yields true — the
// OUTER (top-level battery) call owns the real assertions and reports the honest verdict.
var bookGraphBusy bool

func selftestBookGraphMembership() bool {
	if bookGraphBusy {
		return true
	}
	bookGraphBusy = true
	defer func() { bookGraphBusy = false }()
	nodes := LoadAll()
	sm := StatusMap(nodes)
	tabs := bookGraphTabs(nodes, sm)
	if len(tabs) == 0 {
		return false // the book always pages at least one need
	}
	for _, tab := range tabs {
		needID := tab.Label
		hasNeedRoot := false
		targets := map[string]bool{} // ids that are the CHILD end of some in-tab edge
		var nodeIDs []string
		for _, e := range tab.Elements {
			d := e.Data
			if d["source"] != "" || d["target"] != "" {
				targets[d["target"]] = true // an edge: record its child end
				continue
			}
			id := d["id"]
			nodeIDs = append(nodeIDs, id)
			if id == needID && d["type"] == "need" {
				hasNeedRoot = true
			}
			if d["type"] == "adr" {
				if decisionType(nodes[id]) != "architecture" {
					return false // a non-architecture decision rode into the graph (the fold misfire)
				}
			}
		}
		if !hasNeedRoot {
			return false // the need is missing as the tab's root
		}
		if targets[needID] {
			return false // the need is not a root - an in-tab edge points into it
		}
		for _, id := range nodeIDs {
			if id == needID {
				continue // the root reaches everything; it is a source, never a target
			}
			if !targets[id] {
				return false // an unrooted stray: a node no in-tab edge reaches
			}
		}
	}
	return true
}
