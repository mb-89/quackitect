package main

// The i12 extension (2026-07-06): connection system, mechanized chapters, and their
// selftests. Implementation grows here step by step (bs9-bs24); each selftest below
// was observed RED before its build step.

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// design: go-verdict-order  implements: req-verdict-order
// candidateClaimFindings: a candidate chosen or rejected by more than one decision is a
// finding - the render stays deterministic (sorted adr walk), but a double claim is a
// content error the owner must resolve, never a silent first-wins.
func candidateClaimFindings(nodes map[string]Node) []string {
	claims := map[string][]string{}
	for _, n := range nodes {
		if n.Type != "adr" {
			continue
		}
		for _, c := range append(append([]string{}, n.Chosen...), n.Rejected...) {
			claims[c] = append(claims[c], n.ID)
		}
	}
	var out []string
	var ids []string
	for c, by := range claims {
		if len(by) > 1 {
			ids = append(ids, c)
		}
		_ = by
	}
	sort.Strings(ids)
	for _, c := range ids {
		by := claims[c]
		sort.Strings(by)
		out = append(out, "candidate '"+c+"' claimed by more than one decision: "+strings.Join(by, ", "))
	}
	return out
}

// enddesign

// design: go-id-charset  implements: req-id-charset
// The id-charset lint ships BEFORE any edge migration: '--' is the connection-id
// separator and Windows folds filename case, so an id outside lowercase [a-z0-9-]
// (or with stray consecutive hyphens) can collide or parse ambiguously (red-team
// findings 8/9, 2026-07-06). Connection ids carry '--' BY GRAMMAR - their segments
// are checked, not the separators.
var idCharRe = regexp.MustCompile(`^[a-z0-9-]+$`)

func idCharsetFindings(nodes map[string]Node) []string {
	var ids []string
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	var out []string
	for _, id := range ids {
		if !idCharRe.MatchString(id) {
			out = append(out, "id '"+id+"' carries a character outside lowercase [a-z0-9-]")
			continue
		}
		if nodes[id].Type == "connection" {
			for _, seg := range strings.Split(strings.TrimPrefix(id, "con-"), "--") {
				if seg == "" || strings.Contains(seg, "--") {
					out = append(out, "connection id '"+id+"' has an empty or malformed segment")
					break
				}
			}
			continue
		}
		if strings.Contains(id, "--") {
			out = append(out, "id '"+id+"' contains consecutive hyphens - reserved for connection separators")
		}
	}
	return out
}

// enddesign

// test-id-charset -> selftest:id-charset
func selftestIDCharset() bool {
	bad := map[string]Node{
		"Req-A":    {ID: "Req-A", Type: "requirement"},
		"req_b":    {ID: "req_b", Type: "requirement"},
		"req--c":   {ID: "req--c", Type: "requirement"},
		"req-good": {ID: "req-good", Type: "requirement"},
	}
	f := idCharsetFindings(bad)
	if len(f) != 3 {
		return false
	}
	for _, want := range []string{"Req-A", "req_b", "req--c"} {
		hit := false
		for _, x := range f {
			if strings.Contains(x, want) {
				hit = true
			}
		}
		if !hit {
			return false
		}
	}
	// a well-formed connection id passes; a malformed one refuses
	conn := map[string]Node{
		"con-verifies--test-x--req-y": {ID: "con-verifies--test-x--req-y", Type: "connection"},
	}
	if len(idCharsetFindings(conn)) != 0 {
		return false
	}
	badConn := map[string]Node{
		"con-verifies----req-y": {ID: "con-verifies----req-y", Type: "connection"},
	}
	return len(idCharsetFindings(badConn)) == 1
}

// connFixture builds a spec dir (connections mode) with endpoint nodes; returns (specDir, ids).
func connFixture(dir string) (string, map[string]string) {
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(filepath.Join(sp, "trace"), 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	ids := map[string]string{}
	for _, id := range []string{"stk-a", "stk-b", "req-y", "test-x"} {
		p := filepath.Join(sp, "trace", id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: stakeholder\nstatement: fixture.\nclass: review\nkiller: false\n---\n"), 0o644)
		ids[id] = p
	}
	return sp, ids
}

// test-conn-notes -> selftest:conn-notes
func selftestConnNotes() bool {
	dir, _ := os.MkdirTemp("", "qst-cnote")
	defer os.RemoveAll(dir)
	sp, ids := connFixture(dir)
	kd := filepath.Join(sp, "connections", "conflicts-with")
	os.MkdirAll(kd, 0o755)
	good := filepath.Join(kd, "con-conflicts-with--stk-a--stk-b.md")
	os.WriteFile(good, []byte("---\nid: con-conflicts-with--stk-a--stk-b\ntype: connection\nkind: conflicts-with\nsrc: stk-a\ndst: stk-b\nstatement: a pulls against b.\nclass: review\nkiller: false\n---\nThe tension prose.\n"), 0o644)
	if issues := connectionIssues(sp, ids); len(issues) != 0 {
		return false
	}
	edges, err := LoadConnections(sp)
	if err != nil || len(edges) != 1 || edges[0].Kind != "conflicts-with" || edges[0].Note == "" {
		return false
	}
	// a note missing its statement refuses, never skips
	os.WriteFile(good, []byte("---\nid: con-conflicts-with--stk-a--stk-b\ntype: connection\nkind: conflicts-with\nsrc: stk-a\ndst: stk-b\nstatement: \nclass: review\nkiller: false\n---\n"), 0o644)
	if len(connectionIssues(sp, ids)) == 0 {
		return false
	}
	// a dangling endpoint refuses naming the node
	os.WriteFile(good, []byte("---\nid: con-conflicts-with--stk-a--stk-ghost\ntype: connection\nkind: conflicts-with\nsrc: stk-a\ndst: stk-ghost\nstatement: dangles.\nclass: review\nkiller: false\n---\n"), 0o644)
	found := false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Msg, "stk-ghost") {
			found = true
		}
	}
	return found
}

// test-conn-jsonl -> selftest:conn-jsonl
func selftestConnJsonl() bool {
	dir, _ := os.MkdirTemp("", "qst-cjson")
	defer os.RemoveAll(dir)
	sp, ids := connFixture(dir)
	kd := filepath.Join(sp, "connections", "verifies")
	os.MkdirAll(kd, 0o755)
	jp := filepath.Join(kd, "edges.jsonl")
	os.WriteFile(jp, []byte("{\"src\":\"test-x\",\"dst\":\"req-y\"}\n"), 0o644)
	if issues := connectionIssues(sp, ids); len(issues) != 0 {
		return false
	}
	edges, err := LoadConnections(sp)
	if err != nil || len(edges) != 1 || edges[0].Src != "test-x" || edges[0].Note != "" {
		return false
	}
	// a malformed line refuses naming file and line
	os.WriteFile(jp, []byte("{\"src\":\"test-x\",\"dst\":\"req-y\"}\nnot json\n"), 0o644)
	hit := false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Key, "line 2") {
			hit = true
		}
	}
	if !hit {
		return false
	}
	// a dangling endpoint refuses
	os.WriteFile(jp, []byte("{\"src\":\"test-x\",\"dst\":\"req-ghost\"}\n"), 0o644)
	hit = false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Msg, "req-ghost") {
			hit = true
		}
	}
	return hit
}

// test-conn-one-lane -> selftest:conn-one-lane
func selftestConnOneLane() bool {
	dir, _ := os.MkdirTemp("", "qst-clane")
	defer os.RemoveAll(dir)
	sp, ids := connFixture(dir)
	kd := filepath.Join(sp, "connections", "conflicts-with")
	os.MkdirAll(kd, 0o755)
	os.WriteFile(filepath.Join(kd, "edges.jsonl"), []byte("{\"src\":\"stk-a\",\"dst\":\"stk-b\"}\n"), 0o644)
	os.WriteFile(filepath.Join(kd, "con-conflicts-with--stk-a--stk-b.md"),
		[]byte("---\nid: con-conflicts-with--stk-a--stk-b\ntype: connection\nkind: conflicts-with\nsrc: stk-a\ndst: stk-b\nstatement: duplicated.\nclass: review\nkiller: false\n---\n"), 0o644)
	dup := false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Msg, "one edge, one lane") {
			dup = true
		}
	}
	if !dup {
		return false
	}
	// symmetric canonical order: the REVERSED triple in the note still collides
	os.WriteFile(filepath.Join(kd, "con-conflicts-with--stk-a--stk-b.md"),
		[]byte("---\nid: con-conflicts-with--stk-a--stk-b\ntype: connection\nkind: conflicts-with\nsrc: stk-b\ndst: stk-a\nstatement: reversed duplicate.\nclass: review\nkiller: false\n---\n"), 0o644)
	dup = false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Msg, "one edge, one lane") {
			dup = true
		}
	}
	return dup
}

// test-conn-kinds -> selftest:conn-kinds
func selftestConnKinds() bool {
	vocab := ConnKinds()
	cw, ok := vocab["conflicts-with"]
	if !ok || !cw.Symmetric || cw.Lane != "note" {
		return false
	}
	vf, ok := vocab["verifies"]
	if !ok || vf.Symmetric || vf.Lane != "jsonl" {
		return false
	}
	// an unknown kind folder refuses
	dir, _ := os.MkdirTemp("", "qst-ckind")
	defer os.RemoveAll(dir)
	sp, ids := connFixture(dir)
	os.MkdirAll(filepath.Join(sp, "connections", "bogus-kind"), 0o755)
	os.WriteFile(filepath.Join(sp, "connections", "bogus-kind", "edges.jsonl"), []byte("{\"src\":\"stk-a\",\"dst\":\"stk-b\"}\n"), 0o644)
	hit := false
	for _, is := range connectionIssues(sp, ids) {
		if strings.Contains(is.Msg, "unknown connection kind") {
			hit = true
		}
	}
	return hit
}

// test-conn-root -> selftest:conn-root
func selftestConnRoot() bool {
	// a connection note's prose folds into its hash (RegionBody seam)
	dir, _ := os.MkdirTemp("", "qst-croot")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "con-conflicts-with--a--b.md")
	os.WriteFile(p, []byte("---\nid: con-conflicts-with--a--b\ntype: connection\nkind: conflicts-with\nsrc: a\ndst: b\nstatement: s.\nclass: review\nkiller: false\n---\nprose one\n"), 0o644)
	n1 := ParseNode(p)
	if !strings.Contains(n1.RegionBody, "prose one") {
		return false
	}
	r1 := MerkleRoot(map[string]Node{n1.ID: n1})
	os.WriteFile(p, []byte("---\nid: con-conflicts-with--a--b\ntype: connection\nkind: conflicts-with\nsrc: a\ndst: b\nstatement: s.\nclass: review\nkiller: false\n---\nprose two\n"), 0o644)
	n2 := ParseNode(p)
	if MerkleRoot(map[string]Node{n2.ID: n2}) == r1 {
		return false
	}
	// a jsonl lane joins the root as a synthetic lane node whose bytes are the content
	a := Node{ID: "con-lane-verifies", Type: "connection", Statement: "lane", RegionBody: "{\"src\":\"x\",\"dst\":\"y\"}\n"}
	b := a
	b.RegionBody = "{\"src\":\"x\",\"dst\":\"z\"}\n"
	return MerkleRoot(map[string]Node{a.ID: a}) != MerkleRoot(map[string]Node{b.ID: b})
}

// test-migrate-edges -> selftest:migrate-edges
func selftestMigrateEdges() bool {
	dir, _ := os.MkdirTemp("", "qst-medge")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(filepath.Join(sp, "trace"), 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\ntype = \"software\"\nrigor = \"lean\"\nversion = \"\"\n"), 0o644)
	os.WriteFile(filepath.Join(sp, "trace", "req-y.md"), []byte("---\nid: req-y\ntype: requirement\nstatement: the claim.\nclass: review\nkiller: false\n---\n"), 0o644)
	os.WriteFile(filepath.Join(sp, "trace", "uc-z.md"), []byte("---\nid: uc-z\ntype: usecase\nstatement: the use.\nclass: review\nkiller: false\n---\n"), 0o644)
	tp := filepath.Join(sp, "trace", "test-x.md")
	os.WriteFile(tp, []byte("---\nid: test-x\ntype: test\nverifies: [req-y]\nverify: selftest:x\nstatement: proves it.\nclass: executed\nkiller: false\n---\n"), 0o644)
	rp := filepath.Join(sp, "trace", "req-r.md")
	os.WriteFile(rp, []byte("---\nid: req-r\ntype: requirement\nrefines: [uc-z]\nstatement: The system shall do the thing.\nclass: review\nkiller: false\n---\n"), 0o644)
	// the BEFORE hashes (frontmatter storage)
	before := map[string]Node{}
	for _, id := range []string{"req-y", "uc-z", "test-x", "req-r"} {
		before[id] = ParseNode(filepath.Join(sp, "trace", id+".md"))
	}
	hBefore := map[string]string{}
	memoB := map[string]string{}
	for id := range before {
		hBefore[id] = fullHash(id, before, memoB)
	}
	out, err := migrateEdges(sp)
	if err != nil || !strings.Contains(out, "migrated 2 edge(s)") || !strings.Contains(out, "mode flag written last") {
		return false
	}
	// the flag committed; the frontmatter copies are gone; the lanes carry the edges
	if edgesModeOf(sp) != "connections" {
		return false
	}
	raw, _ := os.ReadFile(tp)
	if strings.Contains(string(raw), "verifies:") {
		return false
	}
	// the AFTER hashes (connection storage) are byte-identical - the hard requirement
	after := map[string]Node{}
	for _, id := range []string{"req-y", "uc-z", "test-x", "req-r"} {
		after[id] = ParseNode(filepath.Join(sp, "trace", id+".md"))
	}
	edges, err := LoadConnections(sp)
	if err != nil {
		return false
	}
	applyConnEdges(after, edges)
	memoA := map[string]string{}
	for id := range after {
		if fullHash(id, after, memoA) != hBefore[id] {
			return false
		}
	}
	// a re-run is a no-op
	out2, err := migrateEdges(sp)
	if err != nil || !strings.Contains(out2, "already migrated") {
		return false
	}
	// a duplicate list entry refuses the whole migration
	dir2, _ := os.MkdirTemp("", "qst-medge2")
	defer os.RemoveAll(dir2)
	sp2 := filepath.Join(dir2, "spec")
	os.MkdirAll(filepath.Join(sp2, "trace"), 0o755)
	os.WriteFile(filepath.Join(sp2, "project.toml"), []byte("[iteration]\nversion = \"\"\n"), 0o644)
	os.WriteFile(filepath.Join(sp2, "trace", "req-y.md"), []byte("---\nid: req-y\ntype: requirement\nstatement: s.\nclass: review\nkiller: false\n---\n"), 0o644)
	os.WriteFile(filepath.Join(sp2, "trace", "test-d.md"), []byte("---\nid: test-d\ntype: test\nverifies: [req-y, req-y]\nverify: selftest:d\nstatement: dup.\nclass: executed\nkiller: false\n---\n"), 0o644)
	_, err = migrateEdges(sp2)
	return err != nil && strings.Contains(err.Error(), "duplicate")
}

// test-edge-mode -> selftest:edge-mode
func selftestEdgeMode() bool {
	dir, _ := os.MkdirTemp("", "qst-emode")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(filepath.Join(sp, "trace"), 0o755)
	node := "---\nid: test-x\ntype: test\nverifies: [req-y]\nverify: selftest:x\nstatement: proves it.\nclass: executed\nkiller: false\n---\n"
	os.WriteFile(filepath.Join(sp, "trace", "test-x.md"), []byte(node), 0o644)
	os.WriteFile(filepath.Join(sp, "trace", "req-y.md"), []byte("---\nid: req-y\ntype: requirement\nstatement: the claim.\nclass: review\nkiller: false\n---\n"), 0o644)
	// frontmatter mode (default): the legacy key is legal
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\ntype = \"software\"\nrigor = \"lean\"\nversion = \"\"\n"), 0o644)
	if len(StrictIssues(sp)) != 0 {
		return false
	}
	// connections mode: the same key refuses naming file and key
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\ntype = \"software\"\nrigor = \"lean\"\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	hit := false
	for _, is := range StrictIssues(sp) {
		if is.Key == "verifies" && strings.Contains(is.Msg, "legacy edge key") {
			hit = true
		}
	}
	if !hit {
		return false
	}
	// task wiring stays legal in connections mode (adr-edges-scope)
	os.WriteFile(filepath.Join(sp, "trace", "test-x.md"), []byte("---\nid: test-x\ntype: test\nverify: selftest:x\nstatement: proves it.\nclass: executed\nkiller: false\ndepends_on: [req-y]\n---\n"), 0o644)
	return len(StrictIssues(sp)) == 0
}

// test-mint-connection -> selftest:mint-connection
func selftestMintConnection() bool {
	dir, _ := os.MkdirTemp("", "qst-cmint")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(sp, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	// a directed jsonl kind lands as one line, idempotently
	out, err := mintConnection(sp, "verifies", "test-x", "req-y", "", "")
	if err != nil || !strings.HasSuffix(out, "edges.jsonl") {
		return false
	}
	out2, err := mintConnection(sp, "verifies", "test-x", "req-y", "", "")
	if err != nil || !strings.Contains(out2, "no-op") {
		return false
	}
	raw, _ := os.ReadFile(filepath.Join(sp, "connections", "verifies", "edges.jsonl"))
	if strings.Count(string(raw), "test-x") != 1 {
		return false
	}
	// a symmetric note kind mints canonical order with a stamped statement
	np, err := mintConnection(sp, "conflicts-with", "stk-b", "stk-a", "", "")
	if err != nil || !strings.HasSuffix(np, "con-conflicts-with--stk-a--stk-b.md") {
		return false
	}
	nraw, _ := os.ReadFile(np)
	if !strings.Contains(string(nraw), "statement: stk-b conflicts with stk-a") &&
		!strings.Contains(string(nraw), "statement: stk-a conflicts with stk-b") {
		return false
	}
	// the reversed re-mint is the same edge: no-op
	if out3, err := mintConnection(sp, "conflicts-with", "stk-a", "stk-b", "", ""); err != nil || !strings.Contains(out3, "no-op") {
		return false
	}
	// an unknown kind refuses
	_, err = mintConnection(sp, "bogus-kind", "a", "b", "", "")
	return err != nil && strings.Contains(err.Error(), "unknown kind")
}

// test-promote-connection -> selftest:promote-connection
func selftestPromoteConnection() bool {
	dir, _ := os.MkdirTemp("", "qst-cprom")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(sp, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"), []byte("[iteration]\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	if _, err := mintConnection(sp, "verifies", "test-x", "req-y", "", ""); err != nil {
		return false
	}
	np, err := promoteConnection(sp, "verifies", "test-x", "req-y", "")
	if err != nil || !strings.HasSuffix(np, "con-verifies--test-x--req-y.md") {
		return false
	}
	// the line left the jsonl lane; the note carries the triple
	raw, _ := os.ReadFile(filepath.Join(sp, "connections", "verifies", "edges.jsonl"))
	if strings.Contains(string(raw), "test-x") {
		return false
	}
	nraw, _ := os.ReadFile(np)
	if !strings.Contains(string(nraw), "src: test-x") || !strings.Contains(string(nraw), "dst: req-y") {
		return false
	}
	// a second promote changes nothing
	out, err := promoteConnection(sp, "verifies", "test-x", "req-y", "")
	return err == nil && strings.Contains(out, "no-op")
}

// test-conn-adjacency -> selftest:conn-adjacency
func selftestConnAdjacency() bool {
	nodes := map[string]Node{
		"req-y":   {ID: "req-y", Type: "requirement", Statement: "the claim."},
		"test-x":  {ID: "test-x", Type: "test", Statement: "proves it.", Verifies: []string{"req-y"}},
		"go-core": {ID: "go-core", Type: "design", Statement: "the core.", Implements: []string{"req-y"}, Path: "engine.go"},
	}
	edges := []ConnEdge{{Kind: "conflicts-with", Src: "req-y", Dst: "req-z", Note: "con-conflicts-with--req-y--req-z"}}
	l1 := connectionsFor("req-y", nodes, edges)
	// all three lanes answer: frontmatter verifies, code implements, note conflict
	joined := strings.Join(l1, "\n")
	if !strings.Contains(joined, "verifies  test-x -> req-y") || !strings.Contains(joined, "[code]") ||
		!strings.Contains(joined, "conflicts-with  req-y -> req-z  [note]") {
		return false
	}
	// deterministic across runs
	l2 := connectionsFor("req-y", nodes, edges)
	if strings.Join(l2, "\n") != joined {
		return false
	}
	// an id nothing touches answers empty
	return len(connectionsFor("req-none", nodes, edges)) == 0
}

// test-conn-hash-neutral -> selftest:conn-hash-neutral
func selftestConnHashNeutral() bool {
	// storage A: the edge lives in frontmatter adjacency
	nA := map[string]Node{
		"req-y":  {ID: "req-y", Type: "requirement", Statement: "the claim.", Class: "review"},
		"test-x": {ID: "test-x", Type: "test", Statement: "proves it.", Class: "executed", Verify: "selftest:x", Verifies: []string{"req-y"}},
	}
	// storage B: the same edge arrives through the connections loader
	nB := map[string]Node{
		"req-y":  {ID: "req-y", Type: "requirement", Statement: "the claim.", Class: "review"},
		"test-x": {ID: "test-x", Type: "test", Statement: "proves it.", Class: "executed", Verify: "selftest:x"},
	}
	applyConnEdges(nB, []ConnEdge{{Kind: "verifies", Src: "test-x", Dst: "req-y"}})
	hA := fullHash("test-x", nA, map[string]string{})
	hB := fullHash("test-x", nB, map[string]string{})
	if hA != hB {
		return false // the hard requirement: migration must never move a node hash
	}
	// check states stay identical too
	sA, sB := StatusMap(nA), StatusMap(nB)
	for id := range nA {
		if sA[id] != sB[id] {
			return false
		}
	}
	// changed membership DOES move the hash - neutrality is not blindness
	applyConnEdges(nB, []ConnEdge{{Kind: "verifies", Src: "test-x", Dst: "req-y"}})
	return fullHash("test-x", nB, map[string]string{}) != hA
}

// test-virtual-edges -> selftest:virtual-edges
func selftestVirtualEdges() bool {
	dir, _ := os.MkdirTemp("", "qst-vedge")
	defer os.RemoveAll(dir)
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "vv-matrix.base"))
	if err != nil {
		return false
	}
	// frontmatter-stored: the reference rendering
	pf := filepath.Join(dir, "test-x.md")
	os.WriteFile(pf, []byte("---\nid: test-x\ntype: test\nverifies: [req-y]\nmethod: test\nlevel: system\nverify: selftest:x\nstatement: proves it.\nclass: executed\nkiller: false\n---\n"), 0o644)
	rsF, err := EvalBase(string(q), []string{pf}, nil)
	if err != nil {
		return false
	}
	// connection-stored: the file has NO verifies key; the graph carries the edge
	pc := filepath.Join(dir, "test-c.md")
	os.WriteFile(pc, []byte("---\nid: test-x\ntype: test\nmethod: test\nlevel: system\nverify: selftest:x\nstatement: proves it.\nclass: executed\nkiller: false\n---\n"), 0o644)
	nodes := map[string]Node{"test-x": {ID: "test-x", Type: "test", Statement: "proves it.", Verifies: []string{"req-y"}}}
	rsC, err := EvalBaseUsed(string(q), []string{pc}, nodes, nil)
	if err != nil {
		return false
	}
	// same rows, same cells, same groups - byte-equal rendering
	return BaseResultText(rsF) == BaseResultText(rsC) && strings.Contains(BaseResultText(rsC), "req-y")
}

// test-verdict-order -> selftest:verdict-order
func selftestVerdictOrder() bool {
	nodes := map[string]Node{
		"cand-x": {ID: "cand-x", Type: "candidate", Axis: "ax", Statement: "x", Maps: map[string]map[string]string{"ratings": {"crit": "0.5"}}},
		"adr-b":  {ID: "adr-b", Type: "adr", Statement: "b", Chosen: []string{"cand-x"}},
		"adr-a":  {ID: "adr-a", Type: "adr", Statement: "a", Rejected: []string{"cand-x"}},
	}
	// the double claim is a finding naming both decisions, deterministically ordered
	claims := candidateClaimFindings(nodes)
	if len(claims) != 1 || !strings.Contains(claims[0], "cand-x") ||
		!strings.Contains(claims[0], "adr-a, adr-b") {
		return false
	}
	// the rendered verdict is identical across repeated renders (sorted walk, not map order)
	h1 := renderFigure("candidates-matrix", nodes)
	for i := 0; i < 8; i++ {
		if renderFigure("candidates-matrix", nodes) != h1 {
			return false
		}
	}
	// the winner is the sorted-first decision, stated in the cell
	if !strings.Contains(h1, "rejected by adr-a") {
		return false
	}
	// a single-claim candidate is clean
	single := map[string]Node{
		"cand-y": {ID: "cand-y", Type: "candidate", Axis: "ax", Statement: "y", Maps: map[string]map[string]string{"ratings": {"crit": "1"}}},
		"adr-a":  {ID: "adr-a", Type: "adr", Statement: "a", Chosen: []string{"cand-y"}},
	}
	return len(candidateClaimFindings(single)) == 0
}

// test-render-refs -> selftest:render-refs
func selftestRenderRefs() bool {
	dir, _ := os.MkdirTemp("", "qst-rrefs")
	defer os.RemoveAll(dir)
	nodes := bookFixture(dir, 1, true)
	pool := filepath.Join(dir, "queries")
	os.MkdirAll(pool, 0o755)
	q := "filters: 'type == \"requirement\"'\nviews:\n  - type: table\n    name: Reqs\n    render: refs\n    depth: 2\n"
	os.WriteFile(filepath.Join(pool, "reqs.base"), []byte(q), 0o644)
	oldPool := queriesDirOverride
	queriesDirOverride = pool
	defer func() { queriesDirOverride = oldPool }()
	man := "---\nid: man-fix\ntype: manifest\nmode: chapter\nstatement: Fixture chapter.\n---\n" +
		"<!-- ai:3 -->\nThe lede of the fixture chapter.\n---\n![[reqs.base]]\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man), 0o644)
	html, findings, _ := renderBookHTML(nodes)
	if len(findings) != 0 {
		return false
	}
	// the row renders through the node renderer: node identity, state, and statement present
	if !strings.Contains(html, `data-node="req-fix"`) || !strings.Contains(html, "The fixture shall be rendered.") {
		return false
	}
	// two renders are byte-identical (anchors are deterministic, no map-order leak)
	html2, _, _ := renderBookHTML(nodes)
	if html != html2 {
		return false
	}
	// a GROUPED refs view discloses per group (owner ruling 2026-07-07): the group key is a
	// node id, the summary carries that node's STATEMENT, the rows sit collapsed beneath it.
	np := filepath.Join(dir, "need-g.md")
	os.WriteFile(np, []byte("---\nid: need-g\ntype: need\nstatement: The grouped need.\n---\n"), 0o644)
	up := filepath.Join(dir, "uc-g.md")
	os.WriteFile(up, []byte("---\nid: uc-g\ntype: usecase\nstatement: A grouped use case.\n---\n"), 0o644)
	nodes["need-g"] = Node{ID: "need-g", Type: "need", Statement: "The grouped need.", Path: np}
	nodes["uc-g"] = Node{ID: "uc-g", Type: "usecase", Statement: "A grouped use case.", Refines: []string{"need-g"}, Path: up}
	gq := "filters: 'type == \"usecase\"'\nviews:\n  - type: table\n    name: UCs\n    render: refs\n    groupBy: refines\n"
	os.WriteFile(filepath.Join(pool, "ucs.base"), []byte(gq), 0o644)
	man2 := man + "---\n![[ucs.base]]\n"
	os.WriteFile(filepath.Join(dir, "man-fix.md"), []byte(man2), 0o644)
	ghtml, gfindings, _ := renderBookHTML(nodes)
	if len(gfindings) != 0 {
		return false
	}
	gi := strings.Index(ghtml, "The grouped need.")
	ui := strings.Index(ghtml, `data-node="uc-g"`)
	if gi < 0 || ui < gi {
		return false // the need heads its group; the use case renders beneath it
	}
	lo, hi := gi-200, gi+200
	if lo < 0 {
		lo = 0
	}
	if hi > len(ghtml) {
		hi = len(ghtml)
	}
	if !strings.Contains(ghtml[lo:hi], "<summary>") {
		return false // the group is a disclosure - click the need to see its use cases
	}
	// an out-of-subset render mode still refuses
	if _, err := EvalBase("views:\n  - type: table\n    render: cards\n", nil, nil); err == nil || !strings.Contains(err.Error(), "out-of-subset") {
		return false
	}
	// a non-number depth refuses
	_, err := EvalBase("views:\n  - type: table\n    depth: deep\n", nil, nil)
	return err != nil && strings.Contains(err.Error(), "depth")
}

// itemTemplateDir: the shipped item templates home.
func itemTemplateDir() string {
	return filepath.Join(EngineDir(), "method", "templates", "items")
}

// specQueryDir: the shipped pooled-queries home.
func specQueryDir() string {
	return filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "queries")
}

// test-need-item -> selftest:need-item
func selftestNeedItem() bool {
	raw, err := os.ReadFile(filepath.Join(itemTemplateDir(), "need.md"))
	if err != nil {
		return false
	}
	t := string(raw)
	if !strings.Contains(t, "## Fields") || !strings.Contains(t, "`source`") || !strings.Contains(t, "`acceptance`") {
		return false
	}
	// source and acceptance stay ITEM fields; the reader view shows name+statement
	// only since i14 (field c18, req-reader-columns)
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "needs.base"))
	if err != nil || !strings.Contains(string(q), "[name, statement]") {
		return false
	}
	// a fixture need renders both columns
	dir, _ := os.MkdirTemp("", "qst-need")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "need-x.md")
	os.WriteFile(p, []byte("---\nid: need-x\ntype: need\nsource: stk-owner\nacceptance: the board renders green\nstatement: The owner needs a green board.\nclass: review\nkiller: false\n---\n"), 0o644)
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups) != 1 || len(rs[0].Groups[0].Rows) != 1 {
		return false
	}
	cells := strings.Join(rs[0].Groups[0].Rows[0].Cells, "|")
	return strings.Contains(cells, "The owner needs a green board.") && strings.Contains(cells, "x")
}

// test-new-item-kinds -> selftest:new-item-kinds
func selftestNewItemKinds() bool {
	fieldLine := 0
	for _, k := range []string{"connection", "rule", "budget", "criterion", "design-element", "guide"} {
		raw, err := os.ReadFile(filepath.Join(itemTemplateDir(), k+".md"))
		if err != nil {
			return false
		}
		t := string(raw)
		if !strings.Contains(t, "## Fields") {
			return false
		}
		fieldLine += strings.Count(t, "- `")
	}
	if fieldLine < 18 { // the Attributierungsschema duty: fields declared across the six
		return false
	}
	raw, _ := os.ReadFile(filepath.Join(itemTemplateDir(), "budget.md"))
	return strings.Contains(string(raw), "`margin`")
}

// test-note-tags -> selftest:note-tags
func selftestNoteTags() bool {
	dir, _ := os.MkdirTemp("", "qst-tags")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "why-x.md")
	os.WriteFile(p, []byte("---\nid: why-x\ntype: rationale\nrefers: [stk-a]\ntags: [stakeholder-conflict]\nstatement: A pulls against B.\nclass: review\nkiller: false\n---\nThe tension.\n"), 0o644)
	if issues := StrictIssues(dir); len(issues) != 0 {
		return false
	}
	rs, err := EvalBase("filters: 'file.hasTag(\"stakeholder-conflict\")'\nviews:\n  - type: table\n    name: T\n    order: [file.name, statement]\n", []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups) != 1 || len(rs[0].Groups[0].Rows) != 1 {
		return false
	}
	// an untagged note does not match
	p2 := filepath.Join(dir, "why-y.md")
	os.WriteFile(p2, []byte("---\nid: why-y\ntype: rationale\nrefers: [stk-a]\nstatement: No tag.\nclass: review\nkiller: false\n---\n"), 0o644)
	rs2, err := EvalBase("filters: 'file.hasTag(\"stakeholder-conflict\")'\nviews:\n  - type: table\n    name: T\n", []string{p, p2}, nil)
	return err == nil && len(rs2[0].Groups[0].Rows) == 1
}

// test-quality-scenarios -> selftest:quality-scenarios
func selftestQualityScenarios() bool {
	dir, _ := os.MkdirTemp("", "qst-qual")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "req-fast.md")
	os.WriteFile(p, []byte("---\nid: req-fast\ntype: requirement\nkind: quality\nrefines: []\nquality: [performance]\nstimulus_source: the owner\nstimulus: runs status\nartifact: the board\nenvironment: warm cache\nresponse: the board renders\nresponse_measure: under 1 second\nstatement: The board shall render under 1 second at warm cache.\nclass: review\nkiller: false\n---\n"), 0o644)
	if issues := StrictIssues(dir); len(issues) != 0 {
		return false
	}
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "qualities.base"))
	if err != nil {
		return false
	}
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups) != 1 {
		return false
	}
	g := rs[0].Groups[0]
	if g.Key != "performance" || len(g.Rows) != 1 {
		return false
	}
	return strings.Contains(strings.Join(g.Rows[0].Cells, "|"), "under 1 second")
}

// test-mint-all-kinds -> selftest:mint-all-kinds
func selftestMintAllKinds() bool {
	dir, _ := os.MkdirTemp("", "qst-mintk")
	defer os.RemoveAll(dir)
	spot := map[string][]string{
		"need":        {"source:", "acceptance:"},
		"usecase":     {"refines:"},
		"requirement": {"refines:", "depends_on:"},
		"test":        {"verifies:", "class: executed"},
		"adr":         {"addresses:", "adjudicated_by: user"},
		"stakeholder": {"role:", "interest:", "weight:"},
		"candidate":   {"axis:", "ratings:"},
		"raid":        {"kind: risk", "probability:", "mitigation:"},
		"rationale":   {"refers:"},
		"record":      {"record_of:", "result:"},
		"criterion":   {"metric:", "target:"},
		"rule":        {"scope:", "refers:"},
		"budget":      {"metric:", "unit:", "rule: sum", "margin:", "allocations:"},
		"guide":       {"audience:"},
		"design":      {"responsibility:", "implements:", "realization:"},
		"connection":  {"kind:", "src:", "dst:"},
	}
	kinds := make([]string, 0, len(spot))
	for k := range spot {
		kinds = append(kinds, k)
	}
	sort.Strings(kinds)
	for _, k := range kinds {
		p, err := mintNodeAtX(dir, k, k+"-fix", map[string]string{})
		if err != nil {
			return false
		}
		raw, _ := os.ReadFile(p)
		body := string(raw)
		if strings.Contains(body, "human") { // the i11 vocabulary: user, never human
			return false
		}
		for _, want := range append(spot[k], "statement:", "type: ") {
			if !strings.Contains(body, want) {
				return false
			}
		}
	}
	// the content kinds mint their own shapes and demand a slug
	if mintContentBody("term") == "" || mintContentBody("reference") == "" ||
		mintContentBody("fundamental") == "" || mintContentBody("method") == "" {
		return false
	}
	if !strings.Contains(mintContentBody("method"), "applies_chapters") ||
		!strings.Contains(mintContentBody("reference"), "url:") {
		return false
	}
	_, err := mintContentAt("term", "")
	return err != nil && strings.Contains(err.Error(), "--id")
}

// test-chapter-canning -> selftest:chapter-canning
func selftestChapterCanning() bool {
	slotRe := regexp.MustCompile(`\{\{([a-z-]+)`)
	allowed := map[string]map[string]bool{
		"man-ch5-verification-validation": {"records-lede": true, "validation": true},
		"man-ch6-project":                 {"approach": true},
		"man-ch7-rationales":              {},
		"man-ch8-guidance":                {"guides": true},
	}
	base := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	for ch, ok := range allowed {
		raw, err := os.ReadFile(filepath.Join(base, ch+".md"))
		if err != nil {
			return false
		}
		for _, m := range slotRe.FindAllStringSubmatch(string(raw), -1) {
			if !ok[m[1]] {
				return false // a slot outside the allowed authored residue
			}
		}
	}
	return true
}

// test-doc-skeletons -> selftest:doc-skeletons
func selftestDocSkeletons() bool {
	base := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	deck, err := os.ReadFile(filepath.Join(base, "man-deck.md"))
	if err != nil || !strings.Contains(string(deck), "mode: deck") || !strings.Contains(string(deck), "Note:") {
		return false
	}
	preset, err := os.ReadFile(filepath.Join(base, "man-preset-newcomer.md"))
	if err != nil || !strings.Contains(string(preset), "mode: preset") ||
		!strings.Contains(string(preset), "man-ch0-orientation") {
		return false
	}
	agent, err := os.ReadFile(filepath.Join(base, "man-agent-guide.md"))
	if err != nil || !strings.Contains(string(agent), "mode: agent") ||
		!strings.Contains(string(agent), "<!-- ai:3 -->") || !strings.Contains(string(agent), "{{") {
		return false
	}
	return true
}

// test-methods-view -> selftest:methods-view
func selftestMethodsView() bool {
	dir, _ := os.MkdirTemp("", "qst-mview")
	defer os.RemoveAll(dir)
	md := filepath.Join(dir, "methods")
	os.MkdirAll(md, 0o755)
	p := filepath.Join(md, "method-pugh.md")
	os.WriteFile(p, []byte("---\nstatement: Score candidates against a datum.\napplies_chapters: [design-output]\nsource: ref-methodische-entwicklung\naliases: []\n---\n## Situation\nx\n"), 0o644)
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "methods.base"))
	if err != nil {
		return false
	}
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil {
		return false
	}
	inOut, inIn := false, false
	for _, r := range rs {
		rows := 0
		for _, g := range r.Groups {
			rows += len(g.Rows)
		}
		if r.Name == "Methods for design-output" && rows == 1 {
			inOut = true
		}
		if r.Name == "Methods for design-input" && rows != 0 {
			inIn = true
		}
	}
	if !inOut || inIn { // routes to its chapter and to no other
		return false
	}
	// the chapters embed their views
	base := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	for ch, view := range map[string]string{
		"man-ch3-design-input":             "Methods for design-input",
		"man-ch4-design-output":            "Methods for design-output",
		"man-ch5-verification-validation":  "Methods for verification-validation",
		"man-ch6-project":                  "Methods for project",
	} {
		raw, err := os.ReadFile(filepath.Join(base, ch+".md"))
		if err != nil || !strings.Contains(string(raw), "![[methods.base#"+view+"]]") {
			return false
		}
	}
	return true
}

// test-stubs-folders -> selftest:stubs-folders
func selftestStubsFolders() bool {
	dir, _ := os.MkdirTemp("", "qst-sfold")
	defer os.RemoveAll(dir)
	cmdStartStubs([]string{dir})
	for _, sub := range []string{"glossary", "methods", "stakeholders", "usecases", "raid",
		"rules", "guides", "connections", "fundamentals"} {
		if _, err := os.Stat(filepath.Join(dir, "spec", sub, "README.md")); err != nil {
			return false
		}
	}
	// the skeleton manifests land at the spec ROOT - the spec mirrors the template
	// (owner ruling 2026-07-07)
	for _, f := range []string{"man-deck.md", "man-preset-newcomer.md", "man-agent-guide.md"} {
		if _, err := os.Stat(filepath.Join(dir, "spec", f)); err != nil {
			return false
		}
	}
	return true
}

// test-verify-method -> selftest:verify-method
func selftestVerifyMethod() bool {
	// the requirement item declares verify_method, never a bare verify key
	raw, err := os.ReadFile(filepath.Join(itemTemplateDir(), "requirement.md"))
	if err != nil {
		return false
	}
	t := string(raw)
	if !strings.Contains(t, "`verify_method`") || strings.Contains(t, "- `verify` (") {
		return false
	}
	// a test item's method and level render in the verification matrix
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "vv-matrix.base"))
	if err != nil || !strings.Contains(string(q), "method") || !strings.Contains(string(q), "level") {
		return false
	}
	dir, _ := os.MkdirTemp("", "qst-vm")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "test-x.md")
	os.WriteFile(p, []byte("---\nid: test-x\ntype: test\nverifies: [req-a]\nmethod: analysis\nlevel: integration\nverify: selftest:x\nstatement: proves a.\nclass: executed\nkiller: false\n---\n"), 0o644)
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups) != 1 {
		return false
	}
	cells := strings.Join(rs[0].Groups[0].Rows[0].Cells, "|")
	return strings.Contains(cells, "analysis") && strings.Contains(cells, "integration")
}

// test-results-exception -> selftest:results-exception
func selftestResultsException() bool {
	nodes := map[string]Node{
		"req-x": {ID: "req-x", Type: "requirement", Statement: "the claim.", Class: "review"},
		"wvr-x": {ID: "wvr-x", Type: "adr", Kind: "waiver", Statement: "the failure of req-x is accepted for this release.", Class: "review"},
		"i0-check": {ID: "i0-check", Statement: "an unverified check.", Class: "review"},
	}
	h := renderFigure("results-exception", nodes)
	// the count line summarizes; the unverified check renders prominently by name
	if !strings.Contains(h, "checks verified") || !strings.Contains(h, "i0-check") {
		return false
	}
	// the accepted deviation renders with its statement
	if !strings.Contains(h, "Accepted deviations") || !strings.Contains(h, "the failure of req-x is accepted") {
		return false
	}
	// no waivers: the honest none-line
	h2 := renderFigure("results-exception", map[string]Node{"i0-check": {ID: "i0-check", Statement: "c.", Class: "review"}})
	return strings.Contains(h2, "none — no failure has been accepted")
}

// test-criteria-validation -> selftest:criteria-validation
func selftestCriteriaValidation() bool {
	// the criteria query ships and both chapters embed it
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "criteria.base"))
	if err != nil {
		return false
	}
	ch1, _ := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "man-ch1-motivation.md"))
	ch5, _ := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "man-ch5-verification-validation.md"))
	if !strings.Contains(string(ch1), "![[criteria.base]]") || !strings.Contains(string(ch5), "![[criteria.base]]") {
		return false
	}
	// a fixture criterion renders with metric and target
	dir, _ := os.MkdirTemp("", "qst-crit")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "crit-x.md")
	os.WriteFile(p, []byte("---\nid: crit-x\ntype: criterion\nmetric: render time\ntarget: under 1 second\nstatement: The board renders under one second.\nclass: review\nkiller: false\n---\n"), 0o644)
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups[0].Rows) != 1 {
		return false
	}
	cells := strings.Join(rs[0].Groups[0].Rows[0].Cells, "|")
	return strings.Contains(cells, "render time") && strings.Contains(cells, "under 1 second")
}

// test-ch3-mech -> selftest:ch3-mech
func selftestCh3Mech() bool {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "man-ch3-design-input.md"))
	if err != nil {
		return false
	}
	t := string(raw)
	// authored residue: exactly the context prose and the deferred functions unit
	slotRe := regexp.MustCompile(`\{\{([a-z-]+)`)
	allowed := map[string]bool{"context-and-scope": true, "functions": true}
	for _, m := range slotRe.FindAllStringSubmatch(t, -1) {
		if !allowed[m[1]] {
			return false
		}
	}
	// the mechanized views embed (use cases merged into the ucfn board at i14, field c25)
	for _, want := range []string{"![[stakeholder-matrix.base]]", "![[tensions.base]]", "fig: ucfn-board",
		"![[qualities.base]]", "![[constraints.base]]", "![[requirements.base]]", "![[assumptions.base]]",
		"![[methods.base#Methods for design-input]]"} {
		if !strings.Contains(t, want) {
			return false
		}
	}
	// the coverage board sits in its own unit
	body := t
	if i := strings.Index(body[3:], "---"); i >= 0 {
		body = body[3+i+3:]
	}
	for _, unit := range strings.Split(body, "\n---\n") {
		u := strings.TrimSpace(unit)
		if strings.Contains(u, "fig:") && (!strings.HasPrefix(u, "fig:") || strings.Contains(u, "\n")) {
			return false
		}
	}
	// the shipped queries the chapter leans on exist
	for _, q := range []string{"tensions.base", "usecases.base", "constraints.base", "qualities.base"} {
		if _, err := os.Stat(filepath.Join(specQueryDir(), q)); err != nil {
			return false
		}
	}
	return true
}

// test-ch4-mech -> selftest:ch4-mech
func selftestCh4Mech() bool {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", "documents", "spec", "man-ch4-design-output.md"))
	if err != nil {
		return false
	}
	t := string(raw)
	// exactly one authored slot survives: the type-gated budgets unit
	if strings.Count(t, "{{") != 1 || !strings.Contains(t, "{{budgets}}") {
		return false
	}
	// the mechanized views embed
	for _, want := range []string{"![[asr.base]]", "![[decisions-strategy.base]]", "![[interfaces.base]]",
		"![[force-rationales.base]]", "![[rules.base]]", "![[decisions-architecture.base]]"} {
		if !strings.Contains(t, want) {
			return false
		}
	}
	// every fig line is its own unit - a trailing fig line in a prose unit renders as text
	body := t
	if i := strings.Index(body[3:], "---"); i >= 0 {
		body = body[3+i+3:]
	}
	figs := 0
	for _, unit := range strings.Split(body, "\n---\n") {
		u := strings.TrimSpace(unit)
		if strings.Contains(u, "fig:") {
			if !strings.HasPrefix(u, "fig:") || strings.Contains(u, "\n") {
				return false
			}
			figs++
		}
	}
	return figs == 2 // candidates-matrix and block-tree
}

// test-block-tree-design -> selftest:block-tree-design
func selftestBlockTreeDesign() bool {
	nodes := map[string]Node{
		"des-core":  {ID: "des-core", Type: "design", Statement: "the core"},
		"des-shell": {ID: "des-shell", Type: "design", Statement: "the shell"},
		"man-ch1":   {ID: "man-ch1", Type: "manifest", Mode: "chapter", Statement: "Motivation."},
	}
	svg := renderFigure("block-tree", nodes)
	if !strings.Contains(svg, "des-core") || !strings.Contains(svg, "des-shell") {
		return false
	}
	if strings.Contains(svg, "man-ch1") { // the book's chapters stay out of the system tree
		return false
	}
	// no design elements yet: an honest meta line, never a chapter tree
	empty := renderFigure("block-tree", map[string]Node{"man-ch1": {ID: "man-ch1", Type: "manifest", Mode: "chapter", Statement: "M."}})
	return strings.Contains(empty, "no design elements yet")
}

// test-example-notes -> selftest:example-notes
func selftestExampleNotes() bool {
	dir, _ := os.MkdirTemp("", "qst-exn")
	defer os.RemoveAll(dir)
	cmdStartStubs([]string{dir})
	sp := filepath.Join(dir, "spec")
	for _, f := range []string{
		filepath.Join(sp, "stakeholders", "ex-stakeholder.md"),
		filepath.Join(sp, "stakeholders", "ex-stakeholder-b.md"),
		filepath.Join(sp, "trace", "ex-need.md"),
		filepath.Join(sp, "trace", "ex-criterion.md"),
		filepath.Join(sp, "trace", "ex-rationale.md"),
		filepath.Join(sp, "usecases", "ex-usecase.md"),
		filepath.Join(sp, "raid", "ex-assumption.md"),
		filepath.Join(sp, "rules", "ex-rule.md"),
		filepath.Join(sp, "guides", "ex-guide.md"),
		filepath.Join(sp, "connections", "conflicts-with", "con-conflicts-with--ex-stakeholder--ex-stakeholder-b.md"),
	} {
		if _, err := os.Stat(f); err != nil {
			return false
		}
	}
	// the instantiated example set loads strict-clean
	if issues := StrictIssues(sp); len(issues) != 0 {
		return false
	}
	// deleting a leaf example leaves the workspace consistent
	os.Remove(filepath.Join(sp, "rules", "ex-rule.md"))
	return len(StrictIssues(sp)) == 0
}

// test-stakeholder-links -> selftest:stakeholder-links
func selftestStakeholderLinks() bool {
	dir, _ := os.MkdirTemp("", "qst-stkl")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "stk-user.md")
	os.WriteFile(p, []byte("---\nid: stk-user\ntype: stakeholder\nrole: user\ninterest: 0.8\ninfluence: 0.5\nweight: 0.7\npreset: man-preset-user\nguide: guide-user\nstatement: wants tasks done without reading internals\nclass: review\nkiller: false\n---\n"), 0o644)
	if issues := StrictIssues(dir); len(issues) != 0 {
		return false
	}
	q, err := os.ReadFile(filepath.Join(specQueryDir(), "stakeholder-matrix.base"))
	if err != nil {
		return false
	}
	rs, err := EvalBase(string(q), []string{p}, nil)
	if err != nil || len(rs) != 1 || len(rs[0].Groups[0].Rows) != 1 {
		return false
	}
	cells := strings.Join(rs[0].Groups[0].Rows[0].Cells, "|")
	return strings.Contains(cells, "wants tasks done") && strings.Contains(cells, "man-preset-user") && strings.Contains(cells, "guide-user")
}

// test-migrate-layout -> selftest:migrate-layout
func selftestMigrateLayout() bool {
	dir, err := os.MkdirTemp("", "qml")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	tr := filepath.Join(sp, "trace")
	os.MkdirAll(tr, 0o755)
	for _, f := range []string{"man-ch1.md", "stk-a.md", "uc-b.md", "raid-c.md", "need-d.md", "crit-e.md"} {
		os.WriteFile(filepath.Join(tr, f), []byte("x"), 0o644)
	}
	moved, err := migrateLayout(sp)
	if err != nil || moved != 4 {
		return false // manifests + the three item kinds move; needs and criteria stay
	}
	for _, want := range []string{
		filepath.Join(sp, "man-ch1.md"),
		filepath.Join(sp, "stakeholders", "stk-a.md"),
		filepath.Join(sp, "usecases", "uc-b.md"),
		filepath.Join(sp, "raid", "raid-c.md"),
		filepath.Join(tr, "need-d.md"),
		filepath.Join(tr, "crit-e.md"),
	} {
		if _, err := os.Stat(want); err != nil {
			return false
		}
	}
	if n, err := migrateLayout(sp); err != nil || n != 0 {
		return false // idempotent: a second run finds nothing to move
	}
	os.WriteFile(filepath.Join(tr, "man-ch2.md"), []byte("from trace"), 0o644)
	os.WriteFile(filepath.Join(sp, "man-ch2.md"), []byte("at root"), 0o644)
	if _, err := migrateLayout(sp); err != nil {
		return false
	}
	raw, _ := os.ReadFile(filepath.Join(sp, "man-ch2.md"))
	raw2, _ := os.ReadFile(filepath.Join(tr, "man-ch2.md"))
	return string(raw) == "at root" && string(raw2) == "from trace" // kept both, never overwrote
}

// test-book-shell -> selftest:book-shell
func selftestBookShell() bool {
	dir, err := os.MkdirTemp("", "qbsh")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	html, findings, _ := renderBookHTML(bookFixture(dir, 2, true))
	if len(findings) != 0 {
		return false
	}
	// the sidebar shell is static DOM at emit time: the TOC (a link per chapter), the
	// global search, the hand-editable filter expression, and the details card.
	for _, want := range []string{`<nav id="sidebar"`, `id="toc"`, `href="#man-fix"`,
		`id="search"`, `id="filter-expr"`, `id="details-card"`} {
		if !strings.Contains(html, want) {
			return false
		}
	}
	// the identity (title card since i14, field c1 - the page header is gone) and the
	// content column survive the shell
	if !strings.Contains(html, `id="book-info"`) || !strings.Contains(html, "<main") {
		return false
	}
	// the dom-static law extends to the shell: the SHELL script toggles, never creates.
	// Scoped to the first script block since i13: the comment layer that follows creates
	// its OWN root outside <main> by design (req-comment-dom-static); the layer's law is
	// checked by selftest:comment-dom-static (no innerHTML, no artifacts inside content).
	si := strings.Index(html, "<script>")
	if si < 0 {
		return false
	}
	se := strings.Index(html[si:], "</script>")
	if se < 0 {
		return false
	}
	script := html[si : si+se]
	return !strings.Contains(script, "createElement") && !strings.Contains(script, "innerHTML")
}
