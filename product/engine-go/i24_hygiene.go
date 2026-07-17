package main

// The i24 seams. Stubs first: the hooks in i24_red.go compile against these and
// FAIL until each build step realizes its behavior (test-first).

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// design: go-query  implements: req-query
// The read lane: a pinned Bases-subset expression over the loaded graph returns
// filtered rows with chosen fields; an unknown field refuses with the field list.
type queryGraph struct {
	nodes  map[string]Node
	states map[string]string
	edges  []ConnEdge
	notes  []string
}

type queryRow map[string]string

// queryFields pins the one field set per domain; anything else refuses loudly.
var queryFields = map[string]map[string]bool{
	"nodes": {"id": true, "type": true, "statement": true, "state": true, "class": true,
		"killer": true, "milestone": true, "verify": true, "parent": true},
	"edges": {"edge": true},
	"notes": {"note": true},
}

// queryDomain reads the expression's identifier roots: edge.* queries edges,
// note.* queries notes, everything else queries nodes. One domain per query.
func queryDomain(expr string) (string, error) {
	toks, err := baseLex(expr)
	if err != nil {
		return "", err
	}
	domain := ""
	for _, t := range toks {
		if t.kind != "ident" {
			continue
		}
		root := t.s
		if i := strings.Index(root, "."); i > 0 {
			root = root[:i]
		}
		var d string
		switch root {
		case "edge":
			d = "edges"
		case "note":
			d = "notes"
		default:
			continue
		}
		if domain != "" && domain != d {
			return "", fmt.Errorf("query: one domain per expression (saw %s and %s)", domain, d)
		}
		domain = d
	}
	if domain == "" {
		domain = "nodes"
	}
	return domain, nil
}

// queryCheckFields refuses an unknown identifier, naming the domain's field list.
func queryCheckFields(expr, domain string) error {
	toks, _ := baseLex(expr)
	for _, t := range toks {
		if t.kind != "ident" {
			continue
		}
		name := strings.TrimSuffix(t.s, ".contains")
		if i := strings.Index(name, "."); i > 0 {
			name = name[:i]
		}
		if name == "true" || name == "false" {
			continue
		}
		if !queryFields[domain][name] {
			var fields []string
			for f := range queryFields[domain] {
				fields = append(fields, f)
			}
			sort.Strings(fields)
			return fmt.Errorf("query: unknown field %q for the %s domain - fields: %s",
				name, domain, strings.Join(fields, ", "))
		}
	}
	return nil
}

func queryProps(scalars map[string]string, maps map[string]map[string]string) baseEvalCtx {
	if maps == nil {
		maps = map[string]map[string]string{}
	}
	return baseEvalCtx{p: baseProps{scalars: scalars, lists: map[string][]string{}, maps: maps}}
}

func queryRun(expr string, g queryGraph) ([]queryRow, error) {
	domain, err := queryDomain(expr)
	if err != nil {
		return nil, err
	}
	if err := queryCheckFields(expr, domain); err != nil {
		return nil, err
	}
	var rows []queryRow
	match := func(ctx baseEvalCtx) (bool, error) {
		v, err := baseEvalExpr(expr, ctx)
		if err != nil {
			return false, err
		}
		return baseTruthy(v), nil
	}
	switch domain {
	case "edges":
		for _, e := range g.edges {
			ctx := queryProps(map[string]string{}, map[string]map[string]string{
				"edge": {"kind": e.Kind, "src": e.Src, "dst": e.Dst, "q": e.Q}})
			ok, err := match(ctx)
			if err != nil {
				return nil, err
			}
			if ok {
				rows = append(rows, queryRow{"kind": e.Kind, "src": e.Src, "dst": e.Dst, "q": e.Q})
			}
		}
	case "notes":
		for _, n := range g.notes {
			ok, err := match(queryProps(map[string]string{"note": n}, nil))
			if err != nil {
				return nil, err
			}
			if ok {
				rows = append(rows, queryRow{"note": n})
			}
		}
	default:
		ids := make([]string, 0, len(g.nodes))
		for id := range g.nodes {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		for _, id := range ids {
			n := g.nodes[id]
			scalars := map[string]string{
				"id": n.ID, "type": n.Type, "statement": n.Statement,
				"state": g.states[id], "class": n.Class,
				"killer": strconv.FormatBool(n.Killer), "verify": n.Verify,
				"parent": n.Parent, "milestone": strconv.Itoa(n.Milestone),
			}
			ok, err := match(queryProps(scalars, nil))
			if err != nil {
				return nil, err
			}
			if ok {
				rows = append(rows, queryRow{"id": n.ID, "type": n.Type,
					"state": g.states[id], "statement": n.Statement})
			}
		}
	}
	return rows, nil
}

// liveQueryGraph loads the real workspace: every node, its state, every connection
// edge, and the note files from the data home (name plus body, one string each).
func liveQueryGraph() queryGraph {
	nodes := LoadAll()
	edges, _ := LoadConnections(SPEC)
	var notes []string
	home := notesHomeDir()
	for _, lane := range []string{"inbox", "backlog", "archive"} {
		entries, err := os.ReadDir(filepath.Join(home, lane))
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
				continue
			}
			raw, err := os.ReadFile(filepath.Join(home, lane, e.Name()))
			if err != nil {
				continue
			}
			notes = append(notes, lane+"/"+e.Name()+" "+string(raw))
		}
	}
	return queryGraph{nodes: nodes, states: StatusMap(nodes), edges: edges, notes: notes}
}

// cmdQuery is the console face: one expression in, filtered rows out, tab-separated.
func cmdQuery(args []string) {
	expr := strings.TrimSpace(strings.Join(args, " "))
	if expr == "" || expr == "-h" || expr == "--help" || expr == "-?" {
		fmt.Println("usage: query \"<expression>\"")
		fmt.Println("  nodes:  id, type, statement, state, class, killer, milestone, verify, parent")
		fmt.Println("  edges:  edge.kind, edge.src, edge.dst, edge.q")
		fmt.Println("  notes:  note, note.contains(\"...\")")
		return
	}
	rows, err := queryRun(expr, liveQueryGraph())
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		quackExit(2)
	}
	for _, r := range rows {
		switch {
		case r["note"] != "":
			n := strings.ReplaceAll(r["note"], "\n", " ")
			if len(n) > 200 {
				n = n[:200] + "..."
			}
			fmt.Println(n)
		case r["kind"] != "":
			fmt.Println(r["kind"] + "\t" + r["src"] + "\t" + r["dst"])
		default:
			fmt.Println(r["id"] + "\t" + r["type"] + "\t" + r["state"] + "\t" + r["statement"])
		}
	}
	fmt.Printf("%d row(s)\n", len(rows))
}

// enddesign

// design: go-mcp-reload  implements: req-mcp-reload
// The supervisor cores: drain gating, swap ordering, the notification frame.
// The loop in mcp.go (go-mcp-supervisor) drives them; they stay pure for the battery.
func supSwapReady(inFlight int, swapWanted bool) bool { return swapWanted && inFlight == 0 }

func supNotifyFrame() string {
	return `{"jsonrpc":"2.0","method":"notifications/tools/list_changed"}`
}

// supSequence records swap-relevant events and answers whether the order held:
// drain completes before the spawn, the spawn before the notification.
type supSequence struct{ events []string }

func (s *supSequence) record(ev string) { s.events = append(s.events, ev) }

func (s *supSequence) orderHeld() bool {
	idx := func(ev string) int {
		for i, e := range s.events {
			if e == ev {
				return i
			}
		}
		return -1
	}
	d, sp, n := idx("drain"), idx("spawn"), idx("notify")
	return d >= 0 && sp > d && n > sp
}

func supDrainTimeout() time.Duration { return 10 * time.Second }

// enddesign

// design: go-root-content  implements: req-root-content
// Pooled query files and reference notes fold into the identity root: workspaceRoot
// extends the node merkle with content pairs, so an edited .base or reference flips
// dependents suspect instead of changing every book table silently.
func rootContentFiles(specDir string) []string {
	var out []string
	for _, sub := range []string{"queries", "references"} {
		entries, err := os.ReadDir(filepath.Join(specDir, sub))
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			out = append(out, filepath.ToSlash(filepath.Join(specDir, sub, e.Name())))
		}
	}
	sort.Strings(out)
	return out
}

// rootContentPairs hashes each content file into a stable "relpath:sha" pair.
func rootContentPairs(specDir string) []string {
	files := rootContentFiles(specDir)
	pairs := make([]string, 0, len(files))
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		sum := sha256.Sum256(raw)
		rel := strings.TrimPrefix(filepath.ToSlash(f), filepath.ToSlash(specDir)+"/")
		pairs = append(pairs, rel+":"+hex.EncodeToString(sum[:8]))
	}
	return pairs
}

// workspaceRoot is the LIVE identity root: the node merkle plus the content pairs.
// Fixture callers keep the pure MerkleRoot; every live site answers with this.
func workspaceRoot(nodes map[string]Node) string {
	base := MerkleRoot(nodes)
	pairs := rootContentPairs(SPEC)
	if len(pairs) == 0 {
		return base
	}
	x := sha256.Sum256([]byte(base + ";" + strings.Join(pairs, ";")))
	return hex.EncodeToString(x[:])
}

// enddesign

// design: go-red-edit-guard  implements: req-red-edit-guard
// quack apply refuses a manifest edit that would strand a red-observed test: the
// statement line is the red record's anchor; a body edit stays free.
func applyRedGuardVerdict(edits []manifestEdit, redObservedTests map[string]bool, nodePathToID map[string]string) string {
	for _, e := range edits {
		id := nodePathToID[filepath.ToSlash(e.File)]
		if id == "" || !redObservedTests[id] {
			continue
		}
		if strings.Contains(e.Old, "statement:") || strings.Contains(e.New, "statement:") {
			return "apply refused: " + e.File + " carries a red-observed record anchored at its statement. " +
				"Editing the statement strands the red. The sanctioned path: make the edit, then re-attest " +
				"the still-failing test with `quack observe-red " + id + " --refresh` (req-red-edit-guard)."
		}
	}
	return ""
}

// applyRedGuardLive gathers the live inputs for the guard: which tests carry red
// records, and which file belongs to which node. SCOPED like coverage:tests-red:
// only the ACTIVE iteration's reds anchor at the current hash; a historical test's
// red record is birth evidence, and its statement may be re-stated (the voice wave).
func applyRedGuardLive(edits []manifestEdit) string {
	version := readProjectConfig().Version
	nodes := LoadAll()
	red := map[string]bool{}
	for id := range redObserved() {
		if n, ok := nodes[id]; ok && iterOf(n.Path) == version {
			red[id] = true
		}
	}
	if len(red) == 0 {
		return ""
	}
	paths := make(map[string]string, len(nodes))
	for id, n := range nodes {
		if n.Path != "" {
			rel := filepath.ToSlash(n.Path)
			paths[rel] = id
			if i := strings.Index(rel, "spec/"); i > 0 {
				paths[rel[i:]] = id
			}
		}
	}
	return applyRedGuardVerdict(edits, red, paths)
}

// enddesign

// design: go-mcp-birth  implements: req-mcp-birth
// Scaffolds arm the MCP lane from birth: an explicit-path .mcp.json (a bare launcher
// name breaks under NoDefaultCurrentDirectoryInExePath) and agent_lane mcp in the toml.
func scaffoldMCPFiles(dir string) error { return scaffoldMCPFilesFor(dir, "quack.cmd") }

func scaffoldMCPFilesFor(dir, launcher string) error {
	mcpJSON := "{\n  \"mcpServers\": {\n    \"" + strings.TrimSuffix(launcher, ".cmd") + "\": {\n" +
		"      \"command\": \"cmd\",\n      \"args\": [\"/c\", \".\\\\" + launcher + "\", \"mcp\"]\n    }\n  }\n}\n"
	if err := os.WriteFile(filepath.Join(dir, ".mcp.json"), []byte(mcpJSON), 0o644); err != nil {
		return err
	}
	_, err := selfArmOnAttest(filepath.Join(dir, "spec", "project.toml"))
	return err
}

// enddesign

// design: go-mcp-self-arm  implements: req-mcp-self-arm
// The first attested MCP session arms an existing workspace; path casing is one identity.
func pathIdentityKey(p string) string { return strings.ToLower(filepath.ToSlash(p)) }

func selfArmOnAttest(projectToml string) (armed bool, err error) {
	raw, err := os.ReadFile(projectToml)
	if err != nil {
		return false, err
	}
	txt := strings.ReplaceAll(string(raw), "\r\n", "\n")
	if strings.Contains(txt, "agent_lane") {
		return false, nil // armed already - arming is once
	}
	lines := strings.Split(txt, "\n")
	for i, l := range lines {
		if strings.TrimSpace(l) == "[iteration]" {
			lines = append(lines[:i+1], append([]string{`agent_lane = "mcp"`}, lines[i+1:]...)...)
			return true, os.WriteFile(projectToml, []byte(strings.Join(lines, "\n")), 0o644)
		}
	}
	return false, fmt.Errorf("self-arm: no [iteration] section in %s", projectToml)
}

// enddesign

// design: go-region-delta  implements: req-empty-region-message
// An empty design region's delta message names the region and the fix.
func emptyRegionDelta(regionID string) string {
	return "design region " + regionID + " is empty - write the code between its design and enddesign markers, or remove the dead markers"
}

// enddesign

// design: go-card-guard  implements: req-register-render.2
// The card's selection line is never a bare field dump: with options it names the
// letter; without options it names the authoring defect to fix. The i22 m1 card
// (an empty value after a bare field name) is this guard's fixture.
func cardSelectLine(decidedVia string, redParts []string, hasOptions bool) string {
	if strings.TrimSpace(decidedVia) != "" {
		return selLetter(decidedVia)
	}
	var kept []string
	for _, p := range redParts {
		if i := strings.Index(p, "="); i < 0 || strings.TrimSpace(p[i+1:]) != "" {
			kept = append(kept, p)
		}
	}
	if !hasOptions || len(kept) == 0 {
		return "no ruling renderable yet. Author the node's ## Options section and a decided_via letter, then re-render."
	}
	return strings.Join(kept, "; ")
}

// enddesign

// design: go-voice-gate  implements: req-voice-zero
// The voice lane arms at zero debt: with the debt drained, a finding fails lint.
func voiceLaneVerdict(findings int) (fail bool) { return findings > 0 }

// enddesign

func errNotBuilt(step string) error { return &notBuiltError{step} }

type notBuiltError struct{ step string }

func (e *notBuiltError) Error() string { return "i24: " + e.step + " not built yet" }

// design: go-arg-guards  implements: req-ledger-arg-guards
// Wrong-id refusals: an unknown bless target refuses with near matches; start is
// plan-first (a never-registered version refuses toward --plan) and an active
// re-start refuses as a no-op, leaving iteration.md untouched.
func blessUnknownVerdict(target string, ids []string) string {
	var near []string
	for _, id := range ids {
		if id == target {
			return ""
		}
		if len(near) < 3 && (strings.Contains(id, target) || strings.Contains(target, id) ||
			sharedPrefixLen(id, target) >= 6) {
			near = append(near, id)
		}
	}
	sort.Strings(near)
	msg := "bless refused: unknown check '" + target + "'"
	if len(near) > 0 {
		msg += " - near: " + strings.Join(near, ", ")
	}
	return msg
}

func sharedPrefixLen(a, b string) int {
	n := 0
	for n < len(a) && n < len(b) && a[n] == b[n] {
		n++
	}
	return n
}

func startGuardVerdict(id, activeVersion string, registered, plan bool) string {
	if plan {
		return "" // --plan is the creation lane
	}
	if id == activeVersion {
		return "start refused: " + id + " is already the active version - a re-start would re-seed over live state; nothing to do"
	}
	if !registered {
		return "start refused: unknown version '" + id + "' - register it first with `start --plan " + id + "` (only engage start mints versions)"
	}
	return ""
}

// enddesign

// design: go-adopt-honest  implements: req-adopt-honest
// The ratchet parks displaced binaries under unique names and reports a blocked
// adoption honestly instead of printing a false 'built' line.
func adoptParkName(base string, taken func(string) bool) string {
	if !taken(base) {
		return base
	}
	for i := 2; ; i++ {
		c := fmt.Sprintf("%s.%d", base, i)
		if !taken(c) {
			return c
		}
	}
}

func adoptBlockedMessage(blocker string) string {
	return "staged; adoption pending (" + blocker + ") - the next engine invocation retries the swap"
}

// enddesign

// design: go-binary-budget  implements: req-binary-budget
// quack build checks measures against budget nodes: over target warns, over the
// margin-derived cap refuses.
func budgetVerdict(metric string, measured, target, margin float64) string {
	hardCap := target
	if margin < 1 {
		hardCap = target / (1 - margin)
	}
	switch {
	case measured > hardCap:
		return fmt.Sprintf("budget: %s %.0f exceeds the hard cap %.0f - build refused", metric, measured, hardCap)
	case measured > target:
		return fmt.Sprintf("budget: %s %.0f over target %.0f (hard cap %.0f) - trim before the cap bites", metric, measured, target, hardCap)
	}
	return ""
}

func budgetBestPositive(vals ...float64) float64 {
	best := -1.0
	for _, v := range vals {
		if v < 0 {
			continue
		}
		if best < 0 || v < best {
			best = v
		}
	}
	return best
}

func coldStartMeasure(exe string) float64 {
	measure := func() float64 {
		t0 := time.Now()
		c := exec.Command(exe, "version")
		c.Env = append(os.Environ(), "QUACK_RATCHETED=1")
		c.Dir = ROOT
		if c.Run() == nil {
			return float64(time.Since(t0).Milliseconds())
		}
		return -1
	}
	return budgetBestPositive(measure(), measure())
}

// budgetBuildChecks measures the built binary against every budget node.
// size reads the exe bytes; cold-start times one `version` run of the fresh binary.
func budgetBuildChecks(exe string) (msgs []string, refuse bool) {
	for _, n := range LoadAll() {
		if n.Type != "budget" {
			continue
		}
		target := 0.0
		for _, v := range n.Maps["allocations"] {
			f, err := strconv.ParseFloat(strings.TrimSpace(v), 64)
			if err == nil {
				target += f
			}
		}
		margin, _ := strconv.ParseFloat(strings.TrimSpace(frontmatterMap(n.Path)["margin"]), 64)
		metric := frontmatterMap(n.Path)["metric"]
		measured := -1.0
		switch metric {
		case "size":
			if fi, err := os.Stat(exe); err == nil {
				measured = float64(fi.Size()) / (1024 * 1024)
			}
		case "cold-start":
			measured = coldStartMeasure(exe)
		}
		if measured < 0 || target == 0 {
			continue
		}
		if v := budgetVerdict(metric, measured, target, margin); v != "" {
			msgs = append(msgs, v)
			if strings.Contains(v, "refused") {
				refuse = true
			}
		}
	}
	return msgs, refuse
}

// enddesign
