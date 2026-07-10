package main

// design: go-conn-lanes  implements: req-connections-lanes.5, req-connections-lanes.3, req-connections-lanes.6, req-connections-lanes.4
// The connections home (adr-connections-reified + adr-connection-lanes): one subfolder per
// kind under spec/connections/, two lanes per kind - edges.jsonl carries trivial edges one
// JSON line each ({"src","dst"[,"q"]}), con- notes carry the prose-bearing ones. An edge
// lives in exactly ONE lane; the same triple in both refuses the graph. The kind vocabulary
// is TYPE-LAYER data (project_types/*/type.md `connections:` map: "<direction> <lane>"),
// unioned like the facet vocabularies; an unknown kind refuses. Every refusal is loud and
// names its file - the empty-statement guard silently dropping a note is the trap this
// loader exists to avoid.

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// ConnKind is one declared connection kind.
type ConnKind struct {
	Symmetric bool
	Lane      string // jsonl | note - the DEFAULT lane mint uses
}

// ConnKinds unions the type layer's connection vocabularies (default + derived types).
func ConnKinds() map[string]ConnKind {
	out := map[string]ConnKind{}
	for _, t := range append([]string{"default"}, projectTypeNames()...) {
		tf := typeFilePath(t)
		if tf == "" {
			continue
		}
		props := basePropsOf(tf)
		for k, v := range props.maps["connections"] {
			parts := strings.Fields(v)
			ck := ConnKind{Lane: "jsonl"}
			for _, p := range parts {
				switch p {
				case "symmetric":
					ck.Symmetric = true
				case "directed":
					ck.Symmetric = false
				case "note", "jsonl":
					ck.Lane = p
				}
			}
			out[k] = ck
		}
	}
	return out
}

// ConnEdge is one loaded edge, whichever lane it came from.
type ConnEdge struct {
	Kind string
	Src  string
	Dst  string
	Q    string
	Note string // the con- note id when the edge is note-lane; "" for jsonl
}

type connLine struct {
	Src string `json:"src"`
	Dst string `json:"dst"`
	Q   string `json:"q,omitempty"`
}

// connID derives the deterministic note id for a triple (canonical order for symmetric kinds).
func connID(kind, src, dst, q string, symmetric bool) string {
	if symmetric && dst < src {
		src, dst = dst, src
	}
	id := "con-" + kind + "--" + src + "--" + dst
	if q != "" {
		id += "--" + q
	}
	return id
}

// connTriple is the one-lane identity: kind + canonical endpoints + qualifier.
func connTriple(kind, src, dst, q string, symmetric bool) string {
	if symmetric && dst < src {
		src, dst = dst, src
	}
	return kind + "|" + src + "|" + dst + "|" + q
}

// LoadConnections reads both lanes of every kind folder. Malformed content returns an
// error naming the file (and line for jsonl); dedup/endpoint checks live in
// connectionIssues (the strict guard), which has the id universe.
func LoadConnections(specDir string) ([]ConnEdge, error) {
	root := filepath.Join(specDir, "connections")
	kinds, err := os.ReadDir(root)
	if err != nil {
		return nil, nil // no connections home yet - legal
	}
	var out []ConnEdge
	sort.Slice(kinds, func(a, b int) bool { return kinds[a].Name() < kinds[b].Name() })
	for _, kd := range kinds {
		if !kd.IsDir() {
			continue
		}
		kind := kd.Name()
		kdir := filepath.Join(root, kind)
		ents, _ := os.ReadDir(kdir)
		sort.Slice(ents, func(a, b int) bool { return ents[a].Name() < ents[b].Name() })
		for _, e := range ents {
			p := filepath.Join(kdir, e.Name())
			switch {
			case e.Name() == "edges.jsonl":
				raw, rerr := os.ReadFile(p)
				if rerr != nil {
					return nil, fmt.Errorf("%s: unreadable: %v", p, rerr)
				}
				for i, line := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
					t := strings.TrimSpace(line)
					if t == "" {
						continue
					}
					var cl connLine
					if jerr := json.Unmarshal([]byte(t), &cl); jerr != nil || cl.Src == "" || cl.Dst == "" {
						return nil, fmt.Errorf("%s:%d: malformed edge line (need {\"src\",\"dst\"[,\"q\"]})", p, i+1)
					}
					out = append(out, ConnEdge{Kind: kind, Src: cl.Src, Dst: cl.Dst, Q: cl.Q})
				}
			case strings.HasSuffix(e.Name(), ".md") && e.Name() != "README.md":
				n := ParseNode(p)
				if n.Type != "connection" {
					return nil, fmt.Errorf("%s: a connections-home note must be type connection", p)
				}
				props := basePropsOf(p)
				s, d, q := props.scalars["src"], props.scalars["dst"], props.scalars["q"]
				if n.Statement == "" || s == "" || d == "" || props.scalars["kind"] == "" {
					return nil, fmt.Errorf("%s: a connection note needs kind, src, dst, and statement", p)
				}
				out = append(out, ConnEdge{Kind: props.scalars["kind"], Src: s, Dst: d, Q: q, Note: n.ID})
			}
		}
	}
	return out, nil
}

// connectionIssues is the strict guard's connection pass: unknown kinds, folder/kind
// mismatches, malformed notes and lines, dangling endpoints, in-lane duplicates, and the
// one-edge-one-lane rule. ids is the workspace id universe the endpoints resolve against.
func connectionIssues(specDir string, ids map[string]string) []ParseIssue {
	var issues []ParseIssue
	root := filepath.Join(specDir, "connections")
	kdirs, err := os.ReadDir(root)
	if err != nil {
		return nil
	}
	vocab := ConnKinds()
	seen := map[string]string{} // triple -> lane descriptor
	resolve := func(id string) bool {
		if id == scrapSink {
			return true // the built-in sink (go-decisions) is always recognized; it has no file
		}
		if _, ok := ids[id]; ok {
			return true
		}
		_, ok := ids[subAddrBase(id)]
		return ok // a numbered sub-statement resolves against its base node (go-sub-addressing)
	}
	mode := edgesModeOf(specDir)
	sort.Slice(kdirs, func(a, b int) bool { return kdirs[a].Name() < kdirs[b].Name() })
	for _, kd := range kdirs {
		if !kd.IsDir() {
			continue
		}
		kind := kd.Name()
		ck, known := vocab[kind]
		if !known {
			issues = append(issues, ParseIssue{filepath.Join(root, kind), kind, "unknown connection kind (declare it in the type layer's connections map)"})
			continue
		}
		if mode != "connections" && legacyEdgeKeys[kind] {
			// a legacy kind lane in frontmatter mode is the unfinished-migration state -
			// loud, resumable, never a silent double-count (go-edge-mode)
			if ents, _ := os.ReadDir(filepath.Join(root, kind)); len(ents) > 0 {
				issues = append(issues, ParseIssue{filepath.Join(root, kind), kind,
					"legacy-kind lane in frontmatter mode - finish the migration (quack migrate-edges)"})
				continue
			}
		}
		kdir := filepath.Join(root, kind)
		ents, _ := os.ReadDir(kdir)
		sort.Slice(ents, func(a, b int) bool { return ents[a].Name() < ents[b].Name() })
		for _, e := range ents {
			p := filepath.Join(kdir, e.Name())
			switch {
			case e.Name() == "edges.jsonl":
				raw, rerr := os.ReadFile(p)
				if rerr != nil {
					issues = append(issues, ParseIssue{p, "", "unreadable: " + rerr.Error()})
					continue
				}
				for i, line := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
					t := strings.TrimSpace(line)
					if t == "" {
						continue
					}
					var cl connLine
					if jerr := json.Unmarshal([]byte(t), &cl); jerr != nil || cl.Src == "" || cl.Dst == "" {
						issues = append(issues, ParseIssue{p, fmt.Sprintf("line %d", i+1), "malformed edge line (need {\"src\",\"dst\"[,\"q\"]})"})
						continue
					}
					for _, ep := range []string{cl.Src, cl.Dst} {
						if !resolve(ep) {
							issues = append(issues, ParseIssue{p, fmt.Sprintf("line %d", i+1), "dangling endpoint '" + ep + "' (no such node)"})
						}
					}
					tr := connTriple(kind, cl.Src, cl.Dst, cl.Q, ck.Symmetric)
					if prev, dup := seen[tr]; dup {
						issues = append(issues, ParseIssue{p, fmt.Sprintf("line %d", i+1), "duplicate edge (also in " + prev + ") - one edge, one lane"})
					} else {
						seen[tr] = p + " line " + fmt.Sprint(i+1)
					}
				}
			case strings.HasSuffix(e.Name(), ".md") && e.Name() != "README.md":
				props := basePropsOf(p)
				s, d, q := props.scalars["src"], props.scalars["dst"], props.scalars["q"]
				nk := props.scalars["kind"]
				if props.scalars["statement"] == "" || s == "" || d == "" || nk == "" {
					issues = append(issues, ParseIssue{p, "", "a connection note needs kind, src, dst, and statement - refused, never skipped"})
					continue
				}
				if nk != kind {
					issues = append(issues, ParseIssue{p, nk, "note kind does not match its folder '" + kind + "'"})
				}
				for _, ep := range []string{s, d} {
					if !resolve(ep) {
						issues = append(issues, ParseIssue{p, "", "dangling endpoint '" + ep + "' (no such node)"})
					}
				}
				want := connID(kind, s, d, q, ck.Symmetric)
				if props.id != want {
					issues = append(issues, ParseIssue{p, props.id, "connection id must be " + want + " (deterministic; symmetric kinds order endpoints lexicographically)"})
				}
				tr := connTriple(kind, s, d, q, ck.Symmetric)
				if prev, dup := seen[tr]; dup {
					issues = append(issues, ParseIssue{p, "", "duplicate edge (also in " + prev + ") - one edge, one lane"})
				} else {
					seen[tr] = p
				}
			}
		}
	}
	return issues
}

// design: go-conn-loader  implements: req-connections-lanes.2
// Adjacency reconstruction, HASH-NEUTRAL by construction: a connection-stored edge lands
// in exactly the Node field its frontmatter twin used, and fullHash sorts deps - so with
// unchanged membership the node hashes are byte-identical across the two storages, and
// blessed history never mass-suspects at migration.
// Kinds without a legacy adjacency field (interface, conflicts-with, ...) reconstruct
// nothing - they are queryable connections only.
var connKindField = map[string]string{
	"verifies": "verifies", "refines": "refines", "addresses": "addresses",
	"supersedes": "supersedes", "chosen": "chosen", "rejected": "rejected", "refers": "refers",
}

// applyConnEdges folds connection-stored edges into per-node adjacency.
func applyConnEdges(nodes map[string]Node, edges []ConnEdge) {
	for _, e := range edges {
		field, ok := connKindField[e.Kind]
		if !ok {
			continue
		}
		// go-sub-addressing: a numbered target (req-x.2) folds onto its base node AT
		// MERGE TIME, and only when the raw id resolves nowhere — downstream lookups
		// (parents, fullHash, the coverage walks) then never see a dotted ref.
		if _, ok := nodes[e.Dst]; !ok {
			if base := subAddrBase(e.Dst); base != e.Dst {
				if _, ok := nodes[base]; ok {
					e.Dst = base
				}
			}
		}
		n, ok := nodes[e.Src]
		if !ok {
			continue // strict guard already refused dangling endpoints
		}
		switch field {
		case "verifies":
			n.Verifies = append(n.Verifies, e.Dst)
		case "refines":
			n.Refines = append(n.Refines, e.Dst)
		case "addresses":
			n.Addresses = append(n.Addresses, e.Dst)
		case "supersedes":
			n.Supersedes = append(n.Supersedes, e.Dst)
		case "chosen":
			n.Chosen = append(n.Chosen, e.Dst)
		case "rejected":
			n.Rejected = append(n.Rejected, e.Dst)
		case "refers":
			n.Refers = append(n.Refers, e.Dst)
		}
		nodes[e.Src] = n
	}
}

// enddesign

// design: go-conn-tools  implements: req-connections-lanes.10, req-connections-lanes.11, req-connections-lanes.1
// The connection determinizers own the housekeeping (no AI reasoning in the
// loop). mint places an edge ONCE in its kind's default lane with the deterministic id and
// canonical symmetric order; promote moves a jsonl edge into a note skeleton; connections
// answers adjacency across ALL THREE lanes (jsonl, notes, code-derived implements) so no
// consumer ever knows which lane an edge sits in - the view never lies.

// design: go-edge-mode  implements: req-connections-lanes.8
// The two-source interim gets a referee: spec/project.toml declares
// edges = "frontmatter" (default) | "connections". In connections mode a legacy edge key
// in node frontmatter REFUSES naming file and key - a leftover cannot silently double-count
// or mask an edit. migrate-edges writes the flag LAST, as its commit point. depends_on and
// parent (task wiring) plus code-declared implements stay legal in both modes
// (adr-edges-scope).
var legacyEdgeKeys = map[string]bool{
	"verifies": true, "refines": true, "addresses": true, "refers": true,
	"chosen": true, "rejected": true, "supersedes": true,
}

var edgesModeRe = regexp.MustCompile(`(?m)^edges\s*=\s*"?(\w+)"?`)

// edgesModeOf reads the edge-storage mode of a spec dir's project.toml.
func edgesModeOf(specDir string) string {
	raw, err := os.ReadFile(filepath.Join(specDir, "project.toml"))
	if err != nil {
		return "frontmatter"
	}
	if m := edgesModeRe.FindStringSubmatch(string(raw)); m != nil {
		return m[1]
	}
	return "frontmatter"
}

// enddesign

// connHasTriple reports whether the triple already exists in either lane.
func connHasTriple(specDir, kind, src, dst, q string, symmetric bool) (bool, error) {
	edges, err := LoadConnections(specDir)
	if err != nil {
		return false, err
	}
	want := connTriple(kind, src, dst, q, symmetric)
	for _, e := range edges {
		if connTriple(e.Kind, e.Src, e.Dst, e.Q, symmetric) == want {
			return true, nil
		}
	}
	return false, nil
}

// mintConnection places one edge in the kind's default lane. A repeated mint is a no-op.
func mintConnection(specDir, kind, src, dst, q, stmt string) (string, error) {
	ck, ok := ConnKinds()[kind]
	if !ok {
		return "", fmt.Errorf("mint connection: unknown kind %q (declare it in the type layer's connections map)", kind)
	}
	if src == "" || dst == "" {
		return "", fmt.Errorf("mint connection needs <kind> <src> <dst>")
	}
	if legacyEdgeKeys[kind] && edgesModeOf(specDir) != "connections" {
		return "", fmt.Errorf("mint connection: kind %q is frontmatter-stored until quack migrate-edges runs", kind)
	}
	if ck.Symmetric && dst < src {
		src, dst = dst, src
	}
	if have, err := connHasTriple(specDir, kind, src, dst, q, ck.Symmetric); err != nil {
		return "", err
	} else if have {
		return "exists (idempotent no-op)", nil
	}
	kdir := filepath.Join(specDir, "connections", kind)
	if err := os.MkdirAll(kdir, 0o755); err != nil {
		return "", err
	}
	if ck.Lane == "jsonl" {
		jp := filepath.Join(kdir, "edges.jsonl")
		line, _ := json.Marshal(connLine{Src: src, Dst: dst, Q: q})
		f, err := os.OpenFile(jp, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
		if err != nil {
			return "", err
		}
		defer f.Close()
		if _, err := f.Write(append(line, '\n')); err != nil {
			return "", err
		}
		return jp, nil
	}
	id := connID(kind, src, dst, q, ck.Symmetric)
	if stmt == "" {
		stmt = src + " " + strings.ReplaceAll(kind, "-", " ") + " " + dst
	}
	p := filepath.Join(kdir, id+".md")
	body := "---\nid: " + id + "\ntype: connection\nkind: " + kind + "\nsrc: " + src + "\ndst: " + dst + "\n"
	if q != "" {
		body += "q: " + q + "\n"
	}
	body += "statement: " + stmt + "\nclass: review\nkiller: false\n---\nTODO — the prose that makes this edge worth a note\n"
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		return "", err
	}
	return p, nil
}

// promoteConnection moves a jsonl edge into a note skeleton. A repeated promote is a no-op.
func promoteConnection(specDir, kind, src, dst, q string) (string, error) {
	ck, ok := ConnKinds()[kind]
	if !ok {
		return "", fmt.Errorf("promote connection: unknown kind %q", kind)
	}
	if ck.Symmetric && dst < src {
		src, dst = dst, src
	}
	id := connID(kind, src, dst, q, ck.Symmetric)
	kdir := filepath.Join(specDir, "connections", kind)
	np := filepath.Join(kdir, id+".md")
	if _, err := os.Stat(np); err == nil {
		return "already a note (idempotent no-op)", nil
	}
	jp := filepath.Join(kdir, "edges.jsonl")
	raw, err := os.ReadFile(jp)
	if err != nil {
		return "", fmt.Errorf("promote connection: no jsonl lane for %s", kind)
	}
	want := connTriple(kind, src, dst, q, ck.Symmetric)
	var kept []string
	found := false
	for _, line := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
		t := strings.TrimSpace(line)
		if t == "" {
			continue
		}
		var cl connLine
		if json.Unmarshal([]byte(t), &cl) == nil && connTriple(kind, cl.Src, cl.Dst, cl.Q, ck.Symmetric) == want {
			found = true
			continue
		}
		kept = append(kept, t)
	}
	if !found {
		return "", fmt.Errorf("promote connection: edge not in the jsonl lane")
	}
	out := strings.Join(kept, "\n")
	if out != "" {
		out += "\n"
	}
	if err := os.WriteFile(jp, []byte(out), 0o644); err != nil {
		return "", err
	}
	body := "---\nid: " + id + "\ntype: connection\nkind: " + kind + "\nsrc: " + src + "\ndst: " + dst + "\n"
	if q != "" {
		body += "q: " + q + "\n"
	}
	body += "statement: " + src + " " + strings.ReplaceAll(kind, "-", " ") + " " + dst + "\nclass: review\nkiller: false\n---\nTODO — the prose this edge earned its promotion for\n"
	if err := os.WriteFile(np, []byte(body), 0o644); err != nil {
		return "", err
	}
	return np, nil
}

// connectionsFor answers adjacency for one id across all lanes, deterministically.
func connectionsFor(id string, nodes map[string]Node, edges []ConnEdge) []string {
	seen := map[string]bool{}
	var out []string
	addEdge := func(kind, src, dst, lane string) {
		if src != id && dst != id {
			return
		}
		key := kind + "|" + src + "|" + dst
		if seen[key] {
			return
		}
		seen[key] = true
		out = append(out, kind+"  "+src+" -> "+dst+"  ["+lane+"]")
	}
	for _, e := range edges {
		lane := "jsonl"
		if e.Note != "" {
			lane = "note"
		}
		addEdge(e.Kind, e.Src, e.Dst, lane)
	}
	var ids []string
	for nid := range nodes {
		ids = append(ids, nid)
	}
	sort.Strings(ids)
	for _, nid := range ids {
		n := nodes[nid]
		lane := "frontmatter"
		if n.Type == "design" && !strings.HasSuffix(n.Path, ".md") {
			lane = "code"
		}
		for _, d := range n.Implements {
			addEdge("implements", nid, d, lane)
		}
		for _, d := range n.Verifies {
			addEdge("verifies", nid, d, lane)
		}
		for _, d := range n.Refines {
			addEdge("refines", nid, d, lane)
		}
		for _, d := range n.Addresses {
			addEdge("addresses", nid, d, lane)
		}
		for _, d := range n.Supersedes {
			addEdge("supersedes", nid, d, lane)
		}
		for _, d := range n.Chosen {
			addEdge("chosen", nid, d, lane)
		}
		for _, d := range n.Rejected {
			addEdge("rejected", nid, d, lane)
		}
		for _, d := range n.DependsOn {
			addEdge("depends-on", nid, d, lane)
		}
	}
	sort.Strings(out)
	return out
}

// design: go-migrate-edges  implements: req-connections-lanes.12
// The audited one-shot: every frontmatter edge of the seven
// legacy kinds moves into the connections home's jsonl lanes. It REFUSES on a duplicate
// list entry (dups are hash-load-bearing; a lane cannot represent them)
// and on a before-and-after adjacency mismatch (the golden re-baseline at
// migration would bake a migration bug invisibly - so the migration proves itself before
// the flag). The mode flag writes LAST, as the commit point; a crash mid-way leaves the
// loud unfinished-migration state, and a re-run resumes idempotently.
var legacyEdgeLine = regexp.MustCompile(`^(verifies|refines|addresses|refers|chosen|rejected|supersedes):`)

func migrateEdges(specDir string) (string, error) {
	if edgesModeOf(specDir) == "connections" {
		return "already migrated (edges = connections)", nil
	}
	type stripFile struct {
		path  string
		lines []string
	}
	adj := map[string]map[string]int{} // src -> "kind|dst" -> count (the audit multiset)
	addAdj := func(src, kind, dst string) {
		if adj[src] == nil {
			adj[src] = map[string]int{}
		}
		adj[src]["kind:"+kind+"|"+dst]++
	}
	perKind := map[string][]connLine{}
	var strips []stripFile
	var walkErr error
	filepath.Walk(specDir, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") || walkErr != nil {
			return nil
		}
		if isSpecContent(specDir, path) || strings.Contains(filepath.ToSlash(path), "/connections/") {
			return nil
		}
		raw, rerr := os.ReadFile(path)
		if rerr != nil || !nodeFence(raw) || filepath.Base(path) == "iteration.md" {
			return nil
		}
		txt := strings.ReplaceAll(string(raw), "\r\n", "\n")
		lines := strings.Split(txt, "\n")
		end := -1
		for i := 1; i < len(lines); i++ {
			if strings.TrimSpace(lines[i]) == "---" {
				end = i
				break
			}
		}
		if end < 0 {
			return nil
		}
		id := strings.TrimSuffix(filepath.Base(path), ".md")
		for i := 1; i < end; i++ {
			if m := regexp.MustCompile(`(?m)^id:\s*(\S+)`).FindStringSubmatch(lines[i]); m != nil {
				id = m[1]
			}
		}
		var kept []string
		touched := false
		for i, l := range lines {
			if i >= 1 && i < end && legacyEdgeLine.MatchString(strings.TrimSpace(l)) && !strings.HasPrefix(l, " ") {
				kv := strings.SplitN(l, ":", 2)
				kind := strings.TrimSpace(kv[0])
				targets := splitIDs(strings.TrimSpace(kv[1]))
				seenT := map[string]bool{}
				for _, t := range targets {
					if t == "" {
						continue
					}
					if seenT[t] {
						walkErr = fmt.Errorf("migrate-edges: REFUSED - duplicate %s entry '%s' in %s (duplicates are hash-load-bearing; resolve it first)", kind, t, path)
						return nil
					}
					seenT[t] = true
					perKind[kind] = append(perKind[kind], connLine{Src: id, Dst: t})
					addAdj(id, kind, t)
				}
				touched = true
				continue
			}
			kept = append(kept, l)
		}
		if touched {
			strips = append(strips, stripFile{path, kept})
		}
		return nil
	})
	if walkErr != nil {
		return "", walkErr
	}
	// resume case: union with edges already in the lanes (dedup by triple - the file copy strips below)
	if existing, err := LoadConnections(specDir); err == nil {
		for _, e := range existing {
			if !legacyEdgeKeys[e.Kind] || e.Note != "" {
				continue
			}
			key := "kind:" + e.Kind + "|" + e.Dst
			if adj[e.Src] == nil || adj[e.Src][key] == 0 {
				perKind[e.Kind] = append(perKind[e.Kind], connLine{Src: e.Src, Dst: e.Dst, Q: e.Q})
				addAdj(e.Src, e.Kind, e.Dst)
			}
		}
	}
	// write the lanes deterministically (whole-file, sorted)
	total := 0
	var kinds []string
	for k := range perKind {
		kinds = append(kinds, k)
	}
	sort.Strings(kinds)
	for _, k := range kinds {
		ls := perKind[k]
		sort.Slice(ls, func(a, b int) bool {
			if ls[a].Src != ls[b].Src {
				return ls[a].Src < ls[b].Src
			}
			return ls[a].Dst < ls[b].Dst
		})
		kdir := filepath.Join(specDir, "connections", k)
		if err := os.MkdirAll(kdir, 0o755); err != nil {
			return "", err
		}
		var b strings.Builder
		for _, l := range ls {
			j, _ := json.Marshal(l)
			b.Write(j)
			b.WriteString("\n")
			total++
		}
		if err := os.WriteFile(filepath.Join(kdir, "edges.jsonl"), []byte(b.String()), 0o644); err != nil {
			return "", err
		}
	}
	// the self-audit: the written lanes must reproduce the collected multiset EXACTLY
	check, err := LoadConnections(specDir)
	if err != nil {
		return "", fmt.Errorf("migrate-edges: REFUSED - written lanes unreadable: %v", err)
	}
	got := map[string]map[string]int{}
	for _, e := range check {
		if !legacyEdgeKeys[e.Kind] || e.Note != "" {
			continue
		}
		if got[e.Src] == nil {
			got[e.Src] = map[string]int{}
		}
		got[e.Src]["kind:"+e.Kind+"|"+e.Dst]++
	}
	for src, m := range adj {
		for key, c := range m {
			if got[src][key] != c {
				return "", fmt.Errorf("migrate-edges: REFUSED - adjacency mismatch for %s %s (before %d, lanes %d); the mode flag stays unwritten", src, key, c, got[src][key])
			}
		}
	}
	for src, m := range got {
		for key, c := range m {
			if adj[src][key] != c {
				return "", fmt.Errorf("migrate-edges: REFUSED - lane surplus for %s %s (%d); the mode flag stays unwritten", src, key, c)
			}
		}
	}
	// strip the frontmatter copies
	for _, s := range strips {
		if err := os.WriteFile(s.path, []byte(strings.Join(s.lines, "\n")), 0o644); err != nil {
			return "", err
		}
	}
	// the commit point: the mode flag writes LAST
	tp := filepath.Join(specDir, "project.toml")
	raw, err := os.ReadFile(tp)
	if err != nil {
		return "", err
	}
	txt := strings.ReplaceAll(string(raw), "\r\n", "\n")
	if !strings.HasSuffix(txt, "\n") {
		txt += "\n"
	}
	txt += "edges = \"connections\"\n"
	if err := os.WriteFile(tp, []byte(txt), 0o644); err != nil {
		return "", err
	}
	return fmt.Sprintf("migrated %d edge(s) across %d kind(s); mode flag written last; audit: multisets byte-equal", total, len(kinds)), nil
}

func cmdMigrateEdges(args []string) {
	out, err := migrateEdges(SPEC)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		quackExit(1)
	}
	fmt.Println(out)
}

// enddesign

// cmdConnections prints the merged adjacency answer for one id.
func cmdConnections(args []string) {
	if len(args) == 0 || strings.HasPrefix(args[0], "-") {
		fmt.Println("usage: connections <id>   (every edge touching the id - jsonl, notes, frontmatter, code)")
		return
	}
	nodes := LoadAll()
	edges, _ := LoadConnections(SPEC)
	lines := connectionsFor(args[0], nodes, edges)
	if len(lines) == 0 {
		fmt.Println("no connections touch '" + args[0] + "'")
		return
	}
	for _, l := range lines {
		fmt.Println(l)
	}
}

// enddesign
