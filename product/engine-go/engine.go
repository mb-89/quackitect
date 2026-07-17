package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// Roots, discovered by walking up to a .quack or pyproject.toml (mirrors engine.find_root).
var ROOT, SPEC, QUACK, ATTEST, ENGINE string // NOTES retired: the note lane resolves notesHome() live

// design: go-workspace-base  implements: req-vendor-workspace.5, req-vehicle-drives-stub.2, req-vehicle-drives-stub.3
// The engine operates on a selectable WORKSPACE, separate from the ENGINE install. ROOT, and all state, SPEC/QUACK/ATTEST/NOTES, is the cwd walk-up by default, or an explicit --base/-C target. So one engine drives its own or ANOTHER project's workspace, sebot base-style, like git -C. ENGINE, the binary plus vendored resources, resolves from the executable's own location, independent of the workspace. In self mode the two roots coincide, and behaviour is unchanged.
func baseFromArgs() string {
	for i := 1; i < len(os.Args)-1; i++ {
		if os.Args[i] == "--base" || os.Args[i] == "-C" {
			return os.Args[i+1]
		}
	}
	return ""
}

func findRoot() string {
	if b := baseFromArgs(); b != "" { // drive a different project's workspace
		if abs, err := filepath.Abs(b); err == nil {
			return abs
		}
		return b
	}
	d, _ := os.Getwd()
	for {
		if _, err := os.Stat(filepath.Join(d, "spec", "project.toml")); err == nil {
			return d // the committed root marker (go-truth-in-spec)
		}
		if st, err := os.Stat(filepath.Join(d, ".quack")); err == nil && st.IsDir() {
			return d // legacy marker: not-yet-migrated workspaces and vehicles
		}
		if _, err := os.Stat(filepath.Join(d, "pyproject.toml")); err == nil {
			return d
		}
		p := filepath.Dir(d)
		if p == d {
			cwd, _ := os.Getwd()
			return cwd
		}
		d = p
	}
}

// hasEngineLayer reports whether dir carries the engine resource layer (either layout).
func hasEngineLayer(dir string) bool {
	if dir == "" {
		return false
	}
	for _, l := range []string{filepath.Join(dir, "tools", "vendor", "quackitect"), filepath.Join(dir, "product", "quackitect")} {
		if st, err := os.Stat(filepath.Join(l, "method")); err == nil && st.IsDir() {
			return true
		}
	}
	return false
}

// resolveEngineRoot is engineRoot's pure core, seamed for the selftest. Order (LIVE
// resolution, never a copy): a legacy
// .quack ancestor of the executable; the WORKSPACE when it carries the resource layer itself
// (dogfood and vendored vehicles stay live-first); the workspace's OWN engine-home record —
// start stubs wrote it, so a vehicle-created stub resolves the vehicle's merged methods;
// the machine-global RECORDED engine home — the quackitect
// repo the binary was last built or ratcheted from, so a resource edit there changes every
// stub workspace immediately; else the workspace (the old fallback: strict names the real gap).
// A stale or layer-less record is ignored at its step, never trusted.
func resolveEngineRoot(exeDir, root, workspaceRecord, recordedHome string) string {
	if exeDir != "" {
		d := exeDir
		for i := 0; i < 4 && d != filepath.Dir(d); i++ {
			if filepath.Base(d) == ".quack" {
				return filepath.Dir(d)
			}
			d = filepath.Dir(d)
		}
	}
	if hasEngineLayer(root) {
		return root
	}
	if hasEngineLayer(workspaceRecord) {
		return workspaceRecord
	}
	if hasEngineLayer(recordedHome) {
		return recordedHome
	}
	return root
}

// isEngineRepo reports whether dir is a REAL engine repo — the dogfood resource layer AND
// the engine source. A vehicle with committed method overrides carries the layer shape but
// never the source; only a real repo may re-record the machine-global pointer.
func isEngineRepo(dir string) bool {
	if st, err := os.Stat(filepath.Join(dir, "product", "quackitect", "method")); err != nil || !st.IsDir() {
		return false
	}
	st, err := os.Stat(filepath.Join(dir, "product", "engine-go"))
	return err == nil && st.IsDir()
}

// enddesign

// engineRoot resolves the engine install (the resource layer's home) from the executable
// path, independent of the workspace (req-vendor-workspace.5). The plumbing shell: it
// gathers the inputs (exe dir, the workspace's own record, the machine-global record)
// and hands them to the pure core.
func engineRoot() string {
	exeDir := ""
	if exe, err := os.Executable(); err == nil {
		exeDir = filepath.Dir(exe)
	}
	return resolveEngineRoot(exeDir, ROOT, workspaceEngineHome(ROOT), recordedEngineHome())
}

func init() {
	ROOT = findRoot()
	SPEC = filepath.Join(ROOT, "spec")
	QUACK = filepath.Join(ROOT, ".quack")
	ATTEST = filepath.Join(SPEC, "ledger", "attest.json") // truth lives under spec/ (go-truth-in-spec)
	if _, err := os.Stat(ATTEST); err != nil {
		if _, lerr := os.Stat(filepath.Join(QUACK, "attest.json")); lerr == nil {
			ATTEST = filepath.Join(QUACK, "attest.json") // not-yet-migrated workspace
		}
	}
	ENGINE = engineRoot()
	// self-heal the recorded engine home (the cross-machine case): any run
	// whose workspace IS a real engine repo (isEngineRepo: resource layer AND engine source)
	// re-records the pointer, so a fresh clone on a new machine fixes every stub with one
	// command run inside the repo. A vehicle — even one committing overrides under the
	// engine's own method path — never steals the pointer.
	if isEngineRepo(ROOT) {
		if recordedEngineHome() != ROOT {
			recordEngineHome(ROOT)
		}
	}
}

// design: go-engine-core  implements: req-go-port.1, req-trace-model.1, req-review
// This is the identity kernel: the hashing primitive and merkle fold over the typed node graph. These are pure functions, with no file or directory I/O. Every disk read of the load belongs to go-graph-load. norm and full_hash are byte-identical to the Python original.
var wsRe = regexp.MustCompile(`\s+`)

func norm(s string) string { return strings.ToLower(strings.TrimSpace(wsRe.ReplaceAllString(s, " "))) }
func h12(s string) string  { x := sha256.Sum256([]byte(s)); return hex.EncodeToString(x[:])[:12] }

func parents(n Node) []string {
	out := append([]string{}, n.DependsOn...)
	out = append(out, n.Refines...)
	out = append(out, n.Implements...)
	out = append(out, n.Verifies...)
	out = append(out, n.Addresses...)
	for i, p := range out {
		// sub-addressed refs (req-x.2) fold to their cluster base so the dep
		// hash chain never drops a clustered parent (go-sub-addressing)
		out[i] = subAddrBase(p)
	}
	return out
}

func stmtHash(n Node) string { return h12(norm(n.Statement)) }

func fullHash(id string, nodes map[string]Node, memo map[string]string) string {
	if v, ok := memo[id]; ok {
		return v
	}
	n := nodes[id]
	deps := []string{}
	for _, d := range parents(n) {
		if _, ok := nodes[d]; ok {
			deps = append(deps, d)
		}
	}
	sort.Strings(deps)
	parts := make([]string, 0, len(deps))
	for _, d := range deps {
		parts = append(parts, fullHash(d, nodes, memo))
	}
	// region content folds through normWS (go-region-hash-norm): whitespace-collapse only, case and
	// comments retained — reformat churn never reopens a design; content edits always do.
	seed := norm(n.Statement) + "|" + n.Verify + "|" + strings.Join(parts, ",") + "|" + h12(normWS(n.RegionBody))
	if n.Validates == "needs" {
		// validation, made structural AND backward-cumulative (go-vv-time-scope): fold the digest of
		// every need UP TO THE CHECK'S OWN ITERATION into its identity — changing/removing a need the
		// check actually validated reopens it (SUSPECT), while a need added in a later iteration never
		// reaches back. The verification analogue (coverage:tests-pass) carries the same scope.
		seed += "|needs:" + needsDigestAsOf(iterOf(n.Path), nodes)
	}
	if n.Type == "model" {
		// a model node's identity IS its extracted semantic graph (go-model-nodes):
		// cosmetic file churn never moves it, a meaning change always does. The hash
		// was computed at load - a pure field fold, no I/O here (kernel purity).
		seed += "|model:" + n.ModelHash
	}
	if n.Type == "question" {
		// a question's ruling state and provenance are identity (go-question-nodes):
		// deciding a question ripples its dependents like any content edit
		seed += "|question:" + n.State + "|" + n.DecidedVia
	}
	if n.DecidedIn != "" {
		// a decision's decided_in provenance is identity, folded exactly like the
		// question fields: stamping or changing it ripples the dependents
		seed += "|decided_in:" + n.DecidedIn
	}
	// design: go-provenance-block  implements: req-mint-prefill.2
	// Per-field provenance is IDENTITY (adr-provenance-in-node). The block parses with the generic frontmatter maps and folds here deterministically. So a value edit and its provenance stamp travel under one hash. The register's colors can trust it.
	if p := n.Maps["provenance"]; len(p) > 0 {
		ks := make([]string, 0, len(p))
		for k := range p {
			ks = append(ks, k)
		}
		sort.Strings(ks)
		for _, k := range ks {
			seed += "|prov:" + k + "=" + norm(p[k])
		}
	}
	// enddesign
	if n.Milestone > 0 && strings.HasSuffix(id, "-gate") {
		seed += evidenceDocSeed(iterOf(n.Path), n.Milestone) // the gate folds its evidence docs (go-evidence-hash)
	}
	hh := h12(seed)
	memo[id] = hh
	return hh
}

// needsDigest is a stable fingerprint of the whole need-set: sorted "id:stmtHash" of every need node.
// Independent of the node it is folded into (needs are roots), so no recursion.
func needsDigest(nodes map[string]Node) string {
	parts := []string{}
	for id, n := range nodes {
		if n.Type == "need" {
			parts = append(parts, id+":"+stmtHash(n))
		}
	}
	sort.Strings(parts)
	return h12(strings.Join(parts, ";"))
}

// enddesign

// design: go-graph-load  implements: req-model-nodes
// This is the load band (rim to graph): text on disk to the typed node map. LoadAll walks spec/**/*.md plus the in-code design markers under product/ and assembles the nodes. Every file and directory read of the load lives here. The kernel takes assembled nodes only.

var designRe = regexp.MustCompile(`design:\s*(\S+)\s+implements:\s*([^>]+)`)

// scanCodeDesigns finds the marked design regions ('#' or '//' comment markers,
// opener through closer) in the vehicle's own product/ (its tool). Engine-internal
// markers live under the engine layer; scan those with scanDesignsUnder(EngineDir()/...)
// when needed (e.g. the method self-test).
func scanCodeDesigns() map[string]Node {
	return scanDesignsUnder(filepath.Join(ROOT, "product"))
}

// design: go-node-module-default  implements: req-node-module
// Loading assigns every graph node to a module. Historical nodes with no module frontmatter inherit the workspace default module, so single-module workspaces keep working unchanged. LoadAll walks spec/**/*.md plus the in-code design markers under product/. It refuses a malformed graph first (strictGuard, go-strict-load): batched findings plus a nonzero exit, instead of a silently-shrunk suspect cone.
func LoadAll() map[string]Node {
	strictGuard()
	nodes := map[string]Node{}
	cfg := readProjectConfig()
	filepath.Walk(SPEC, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		if isSpecContent(SPEC, path) {
			return nil // project-content notes (go-spec-content) load via their own readers
		}
		if filepath.Base(path) == archiveName && loadArchiveNodes(path, nodes) {
			return nil // a compacted iteration's container (go-compact)
		}
		raw, e := os.ReadFile(path)
		if e != nil || !nodeFence(raw) {
			return nil // only recognized node candidates load — the guard checked exactly this set
		}
		n := ParseNodeBytes(path, raw)
		if n.Module == "" {
			n.Module = cfg.moduleDefault()
		}
		if n.Statement != "" && !strings.HasPrefix(n.ID, "TASK-") && !strings.HasPrefix(n.ID, "MARK-") {
			nodes[n.ID] = n
		}
		return nil
	})
	for id, d := range scanCodeDesigns() {
		if d.Module == "" {
			d.Module = cfg.moduleDefault()
		}
		nodes[id] = d
	}
	// design: go-conn-lane-root  implements: req-connections-lanes.7
	// Each edges.jsonl joins the identity root as one synthetic lane node whose RegionBody is the file's bytes. An edge-line edit moves the root exactly like a frontmatter edit always did. Lane nodes are content, off the graph whitelist.
	if kdirs, err := os.ReadDir(filepath.Join(SPEC, "connections")); err == nil {
		for _, kd := range kdirs {
			if !kd.IsDir() {
				continue
			}
			jp := filepath.Join(SPEC, "connections", kd.Name(), "edges.jsonl")
			raw, rerr := os.ReadFile(jp)
			if rerr != nil {
				continue
			}
			id := "con-lane-" + kd.Name()
			nodes[id] = Node{ID: id, Type: "connection", Class: "review",
				Module:    cfg.moduleDefault(),
				Statement: "the " + kd.Name() + " bulk lane (edges.jsonl)",
				Path:      jp, RegionBody: strings.ReplaceAll(string(raw), "\r\n", "\n")}
		}
	}
	// enddesign
	// connection-stored edges fold into node adjacency, hash-neutrally (go-conn-loader)
	if edges, cerr := LoadConnections(SPEC); cerr == nil {
		applyConnEdges(nodes, edges)
	}
	return nodes
}

// enddesign

// scanDesignsUnder walks one base dir for marked design regions and returns them keyed by id.
// It sits outside every region by constraint: its string literals spell the closing marker,
// and any region containing them would terminate at the first literal.
func scanDesignsUnder(base string) map[string]Node {
	out := map[string]Node{}
	filepath.Walk(base, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}
		if !(strings.HasSuffix(path, ".py") || strings.HasSuffix(path, ".md") || strings.HasSuffix(path, ".go")) {
			return nil
		}
		raw, _ := os.ReadFile(path)
		content := strings.ReplaceAll(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\r", "\n")
		lines := strings.Split(content, "\n")
		if k := len(lines); k > 0 && lines[k-1] == "" { // match Python splitlines (no trailing empty)
			lines = lines[:k-1]
		}
		for i := 0; i < len(lines); i++ {
			m := designRe.FindStringSubmatch(lines[i])
			if m == nil || strings.Contains(lines[i], "enddesign") || strings.Contains(m[1], "<") {
				continue
			}
			did := m[1]
			impl := strings.TrimRight(strings.ReplaceAll(m[2], "-->", ""), "- ")
			inline := ""
			if k := strings.Index(impl, "::"); k >= 0 {
				inline, impl = strings.TrimSpace(impl[k+2:]), impl[:k]
			}
			reqs := []string{}
			for _, x := range strings.Split(impl, ",") {
				if x = strings.TrimSpace(x); x != "" {
					reqs = append(reqs, x)
				}
			}
			desc := []string{}
			if inline != "" {
				desc = append(desc, inline)
			}
			j := i + 1
			for j < len(lines) {
				lt := strings.TrimLeft(lines[j], " \t")
				if !(strings.HasPrefix(lt, "#") || strings.HasPrefix(lt, "//")) || strings.Contains(lines[j], "enddesign") ||
					descScanStops(lines[j]) { // go-marker-scan-stop: never absorb a neighboring marker
					break
				}
				desc = append(desc, strings.TrimRight(strings.TrimLeft(lt, "#/ "), " \t\r"))
				j++
			}
			end := j
			for end < len(lines) && !strings.Contains(lines[end], "enddesign") {
				end++
			}
			stmt := strings.Join(desc, " ")
			if stmt == "" {
				stmt = did
			}
			out[did] = Node{ID: did, Statement: stmt, Type: "design", Implements: reqs,
				Class: "review", Path: path, Line: i + 1, RegionBody: strings.Join(lines[i+1:end], "\n")}
		}
		return nil
	})
	return out
}

// design: go-evidence-hash  implements: req-evidence-ledger.1
// A milestone gate folds its evidence doc set (M<n>-*.md in the iteration dir) into its full hash (adr-evidence-hash). Editing blessed evidence flips the gate SUSPECT, so the verdict referent can never mutate silently under its report link. It is content-hashed through normWS: reformat churn moves nothing, content edits always do. This is gate-only by the ADR, since subtasks never fold docs. No docs means no seed component, so doc-less history stays stable.
var evidenceBaseOverride string // test seam: redirects where the docs are read from

// evidenceDocSeed returns the seed component for milestone ms of iteration iter ("" if no docs).
func evidenceDocSeed(iter string, ms int) string {
	base := evidenceBaseOverride
	if base == "" {
		base = filepath.Join(SPEC, "iterations")
	}
	m, _ := filepath.Glob(filepath.Join(base, iter, "M"+strconv.Itoa(ms)+"-*.md"))
	if len(m) == 0 {
		return ""
	}
	sort.Strings(m)
	parts := make([]string, 0, len(m))
	for _, p := range m {
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		parts = append(parts, filepath.Base(p)+":"+h12(normWS(string(raw))))
	}
	return "|evidence:" + h12(strings.Join(parts, ";"))
}

// enddesign

var traceContent = map[string]bool{"need": true, "usecase": true, "requirement": true, "design": true, "adr": true, "test": true, "manifest": true,
	// the item types (go-items) and the connection-lane kinds
	// (go-conn-lanes): content, never gates
	"candidate": true, "stakeholder": true, "raid": true, "rationale": true, "record": true,
	"connection": true, "rule": true, "budget": true, "criterion": true, "guide": true, "neighbour": true,
	// structural models: content that ripples via its extracted graph, never a gate
	"model": true,
	// open unknowns (go-question-nodes, adr-question-nodes-provenance): first-class trace
	// content with a decision state and provenance, never a gate
	"question": true}

// design: go-no-trace-gate  implements: req-gate-eval-integrity.1
// Trace-typed nodes (need/usecase/requirement/design/test/adr) are content, never task gates. isGate excludes them. selftest:no-trace-gate guards the invariant so it cannot regress.
// enddesign
func isGate(n Node) bool {
	// Trace work-products are content, never task-tree gates — even tests, which are executed but
	// belong to the trace (they verify requirements). The verification gate rolls the tests up.
	if traceContent[n.Type] {
		return false
	}
	if n.Class == "executed" {
		return true
	}
	return true
}

func iterOf(path string) string {
	rel, _ := filepath.Rel(SPEC, path)
	parts := strings.Split(filepath.ToSlash(rel), "/")
	if len(parts) > 1 && parts[0] == "iterations" {
		return parts[1]
	}
	return "i0000_baseline"
}

// --- attestation (append-only bless event log) ---

type Event struct {
	Check         string            `json:"check"`
	Action        string            `json:"action"`
	Actor         string            `json:"actor,omitempty"`
	FilledBy      string            `json:"filled_by,omitempty"`
	TS            interface{}       `json:"ts"`
	Hash          string            `json:"hash"`
	StatementHash string            `json:"statement_hash"`
	Deps          map[string]string `json:"deps"`
	PrevHash      *string           `json:"prev_hash"`
	Count         int               `json:"count,omitempty"`   // migrate-actors audit: events rewritten (go-stamp-user)
	Channel       string            `json:"channel,omitempty"` // a mobile answer notes its channel (req-ask-loop.9)
	Grant         string            `json:"grant,omitempty"`   // a covered agent bless stamps its grant (go-grant-store)
	Scope         string            `json:"scope,omitempty"`   // grant-open: which check ids the grant covers
	Expiry        string            `json:"expiry,omitempty"`  // grant-open: RFC3339 end of the stretch
}

func attestEvents() []Event {
	raw, err := os.ReadFile(ATTEST)
	if err != nil {
		return nil
	}
	var ev []Event
	json.Unmarshal(raw, &ev)
	return ev
}

type attestState struct {
	Hash, StatementHash string
	Deps                map[string]string
}

func attestLoad() map[string]attestState {
	st := map[string]attestState{}
	for _, e := range attestEvents() {
		if e.Action == "bless" {
			st[e.Check] = attestState{e.Hash, e.StatementHash, e.Deps}
		}
	}
	return st
}

// latestBless maps each check to its most recent bless event (actor/hash) — the report verdict source.
func latestBless() map[string]Event {
	m := map[string]Event{}
	for _, e := range attestEvents() {
		if e.Action == "bless" {
			m[e.Check] = e
		}
	}
	return m
}

// redObservedFrom maps each check to the hash at which it was last observed FAILING (tests-red).
// Split from redObserved so the rule is hermetically testable without touching the real attest log.
func redObservedFrom(events []Event) map[string]string {
	m := map[string]string{}
	for _, e := range events {
		if e.Action == "red-observed" {
			m[e.Check] = e.Hash
		}
	}
	return m
}

func redObserved() map[string]string { return redObservedFrom(attestEvents()) }

// GateState: CONTENT for trace work-products, else DONE/SUSPECT/OPEN. Executed checks
// compute live (coverage rule or cached run); review checks compare the blessed hash.
func gateState(id string, nodes map[string]Node, a map[string]attestState, memo map[string]string) string {
	n := nodes[id]
	if !isGate(n) {
		return "CONTENT"
	}
	h := fullHash(id, nodes, memo)
	if n.Class == "executed" {
		if strings.HasPrefix(n.Verify, "coverage:") {
			if coverageRule(nodes, strings.TrimSpace(n.Verify[len("coverage:"):]), iterOf(n.Path)) {
				return "DONE"
			}
			return "OPEN"
		}
		if strings.HasPrefix(n.Verify, "selftest:") {
			if runSelftestCached(id, strings.TrimSpace(n.Verify[len("selftest:"):]), h) {
				return "DONE"
			}
			return "OPEN"
		}
		if runExecuted(n, h) == "pass" {
			return "DONE"
		}
		return "OPEN"
	}
	s, ok := a[id]
	if !ok {
		return "OPEN"
	}
	if s.Hash == h {
		return "DONE"
	}
	return "SUSPECT"
}

// stateSatisfies reports whether a dependency in state s releases its dependents: DONE does,
// and so do DEFER/RETIRED - a check pushed out of the iteration (or dropped with its reason)
// must not hold the walk hostage (i0020 minimal defer/retire port).
func stateSatisfies(s string) bool { return s == "DONE" || s == "DEFER" || s == "RETIRED" }

// deferOverride maps a stamped check to its board state ("" when unstamped or content).
func deferOverride(n Node, raw string) string {
	if raw == "CONTENT" {
		return ""
	}
	if n.Retired != "" {
		return "RETIRED"
	}
	if n.Deferred != "" {
		return "DEFER"
	}
	return ""
}

// StatusMap resolves effective states: a DONE gate whose dependency gates are not DONE is SUSPECT.
func StatusMap(nodes map[string]Node) map[string]string {
	a := attestLoad()
	memo := map[string]string{}
	raw := map[string]string{}
	for id := range nodes {
		raw[id] = gateState(id, nodes, a, memo)
		if ov := deferOverride(nodes[id], raw[id]); ov != "" {
			raw[id] = ov
		}
	}
	eff := map[string]string{}
	var resolve func(id string, stack map[string]bool) string
	resolve = func(id string, stack map[string]bool) string {
		if v, ok := eff[id]; ok {
			return v
		}
		s := raw[id]
		if s == "DONE" && !stack[id] {
			for _, d := range parents(nodes[id]) {
				if _, ok := nodes[d]; ok && raw[d] != "CONTENT" {
					st2 := map[string]bool{id: true}
					for k := range stack {
						st2[k] = true
					}
					if !stateSatisfies(resolve(d, st2)) {
						s = "SUSPECT"
						break
					}
				}
			}
		}
		eff[id] = s
		return s
	}
	for id := range nodes {
		resolve(id, map[string]bool{})
	}
	return eff
}

// enddesign

// design: go-suspect-root  implements: req-suspicion-attribution.1
// A PROPAGATED suspect, raw DONE but effective SUSPECT because some upstream drags the cone, is a different fact than a DIRECT one, where its own inputs changed. The board must say so with the ROOT named. One OPEN executed check can read as dozens of anonymous suspects and cost wasted re-blesses. Roots are the minimal upstream culprits: checks whose RAW state is not DONE and whose own upstreams are all raw-DONE. RawStates exposes the pre-propagation pass. SuspectRoots walks to the culprits.
func RawStates(nodes map[string]Node) map[string]string {
	a := attestLoad()
	memo := map[string]string{}
	raw := map[string]string{}
	for id := range nodes {
		raw[id] = gateState(id, nodes, a, memo)
	}
	return raw
}

// suspectSuffix renders the propagation tail for a SUSPECT row: empty for a direct suspect (its
// own inputs changed), else the named roots dragging the cone.
func suspectSuffix(id string, nodes map[string]Node, raw map[string]string) string {
	if raw[id] != "DONE" {
		return "" // direct: the check itself is not clean at its recorded hash
	}
	roots := SuspectRoots(id, nodes, raw)
	if len(roots) == 0 {
		return ""
	}
	return "  <- propagated from: " + strings.Join(roots, ", ")
}

// SuspectRoots returns the minimal upstream culprits for id, given the raw state map.
func SuspectRoots(id string, nodes map[string]Node, raw map[string]string) []string {
	seen := map[string]bool{}
	rootSet := map[string]bool{}
	var walk func(string)
	walk = func(cur string) {
		if seen[cur] {
			return
		}
		seen[cur] = true
		for _, d := range parents(nodes[cur]) {
			n, ok := nodes[d]
			if !ok || raw[d] == "CONTENT" {
				continue
			}
			_ = n
			if raw[d] != "DONE" {
				deeper := false
				for _, dd := range parents(nodes[d]) {
					if _, ok := nodes[dd]; ok && raw[dd] != "CONTENT" && raw[dd] != "DONE" {
						deeper = true
						break
					}
				}
				if deeper {
					walk(d) // the culprit has its own culprit — keep walking up
				} else {
					rootSet[d] = true
				}
			} else {
				walk(d) // clean link; the drag may come from further up
			}
		}
	}
	walk(id)
	var roots []string
	for r := range rootSet {
		roots = append(roots, r)
	}
	sort.Strings(roots)
	return roots
}

// enddesign

// The report always recomputes StatusMap live (no cached snapshot) — a stale snapshot could show a
// cached pass. See RenderReport and go-report-watch.
