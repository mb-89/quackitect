package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func flagVal(args []string, flag string) string {
	for i := 0; i < len(args)-1; i++ {
		if args[i] == flag {
			return args[i+1]
		}
	}
	return ""
}

func hasFlag(args []string, flag string) bool {
	for _, a := range args {
		if a == flag {
			return true
		}
	}
	return false
}

// cmdRender emits ONE model as a standalone, self-contained HTML review page with
// change-marks. Plumbing only — the render transform is go-model-standalone. Auto-
// marks the model's planned (unrealized) elements; --mark adds changed-but-existing
// ids on top.
func cmdRender(args []string) {
	if len(args) == 0 {
		fmt.Fprintln(os.Stderr, "usage: quack render <model-id> --out <file> [--mark <id,id,...>]")
		quackExit(2)
	}
	modelID := args[0]
	var marked []string
	if m := flagVal(args, "--mark"); m != "" {
		marked = strings.Split(m, ",")
	}
	html, err := renderStandaloneModel(modelID, marked)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		quackExit(1)
	}
	out := flagVal(args, "--out")
	if out == "" {
		fmt.Print(html)
		return
	}
	if err := os.WriteFile(out, []byte(html), 0o644); err != nil {
		fmt.Fprintln(os.Stderr, "render error:", err)
		quackExit(1)
	}
	fmt.Println("render ->", out)
}

const version = "0.0.1-go"

// design: go-brand  implements: req-vendor-workspace.4
// brand is the invoked program name, argv[0] without dir or extension. A vehicle launched via its own <project>.exe reads as "<project>". The dogfood quack.exe reads as "quack". This is the white-label hook: the engine never hardcodes its own name in user-facing output. It defaults to "quack".
func brand() string { return brandOf(os.Args[0]) }

// brandOf derives the brand from a program path (testable; brand() applies it to os.Args[0]).
func brandOf(arg0 string) string {
	b := filepath.Base(arg0)
	b = strings.TrimSuffix(b, filepath.Ext(b))
	if b == "" || strings.HasPrefix(b, ".") {
		return "quack"
	}
	return b
}

// usageText is the command surface, branded to the invoked name.
func usageText() string {
	b := brand()
	return b + ` — the determinizer lane (deterministic; no judgment).
usage: ` + b + ` status [id] | next | start <id> [--plan] | why <id> | bless [--all|<id>] [--by A]
       | note "..." | notes [--all] | query "<expr>" | gather <ver> | report [book] [--out F] | ship | build
       | pair [ntfy] | ask <gate> [--timeout s] | await [--timeout s] | triage | compact <iter>
       | apply <manifest> | mcp [--child] | grant open|close|review
       | lint | verify <id> | progress [--pager <gate>] | migrate-actors | migrate-layout | version`
}

// enddesign

// helpRequested reports whether any argument asks for help.
func helpRequested(args []string) bool {
	for _, a := range args {
		if a == "-h" || a == "--help" || a == "-?" {
			return true
		}
	}
	return false
}

// registeredCmds are late-bound verbs a feature file wires in via init
// (go-cone-triage's `triage` is one). Dispatch consults the registry before
// the unknown-command fallback; probes like triageAvailable read it, so a
// removed registration breaks its selftest with it.
var registeredCmds = map[string]func([]string){}

func registerCmd(name string, fn func([]string)) { registeredCmds[name] = fn }

// idCmds take an id positionally; a '-'-prefixed value there is an error (not a flag).
var idCmds = map[string]bool{"why": true, "bless": true, "start": true, "verify": true, "status": true}
var okFlags = map[string]bool{"--all": true, "--plan": true, "--by": true}
var selectedModule string

func selectModuleArg(args []string, cfg Config) (string, []string) {
	if len(args) == 0 || len(cfg.Modules) <= 1 {
		return "", args
	}
	if _, ok := cfg.Modules[args[0]]; ok {
		return args[0], args[1:]
	}
	return "", args
}

func moduleSelected(n Node) bool { return moduleMatches(n.Module, selectedModule) }

// badIDArg returns the offending arg if a command that expects an id got a '-'-prefixed one.
func badIDArg(cmd string, rest []string) (string, bool) {
	if !idCmds[cmd] || len(rest) == 0 {
		return "", false
	}
	if strings.HasPrefix(rest[0], "-") && !okFlags[rest[0]] {
		return rest[0], true
	}
	return "", false
}

// design: go-module-command-selector  implements: req-module-command-selector
// A leading module id selects that module subtree for module-aware commands. Single-module workspaces hide the feature by leaving the command line unchanged.
// design: go-cli-help  implements: req-go-port.4
// One command surface has a shared help preamble. Every subcommand answers -h, --help, and -? with usage and NO side effect. An id that starts with '-' is rejected. This is the structural fix for 'quack start --help' once activating a stray version named '--help'.
func Dispatch(args []string) {
	if len(args) == 0 || helpRequested(args) {
		fmt.Println(usageText())
		return
	}
	selectedModule, args = selectModuleArg(args, readProjectConfig())
	if len(args) == 0 {
		fmt.Println(usageText())
		return
	}
	cmd, rest := args[0], args[1:]
	callLogStart(cmd, rest) // one redacted line per dispatch (go-call-log)
	defer func() { callLogWrite(0) }()
	// design: go-lazy-verdicts  implements: req-lazy-verdicts
	// Verdicts stay lazy everywhere except the EXPLICIT verification surfaces. Only selftest and verify re-run tests on a cache miss. The battery belongs to V&V, once per iteration (owner ruling). Every other command, renders included, answers from the cache. It reads a moved hash as unverified.
	verdictLazyMode = !map[string]bool{
		"selftest": true, "verify": true,
	}[cmd]
	// enddesign
	walkGuard(cmd, rest)          // the walk-law layer: battery gating + the declared agent lane (go-guard-selftest, go-guard-cli)
	rest = attestGuard(cmd, rest) // the contract gate: agent-channel ledger commands need a key
	askDrainMaybe()               // the fallback lane: every run applies answers already on the channel (go-ask-loop)
	if bad, isBad := badIDArg(cmd, rest); isBad {
		fmt.Println("error: id cannot start with '-': " + bad)
		quackExit(2)
	}
	switch cmd {
	case "attest":
		cmdAttest(rest)
	case "mcp", "serve":
		cmdMCP(rest)
	case "pair":
		if err := cmdPair(rest); err != nil {
			fmt.Println("pair:", err)
			quackExit(1)
		}
	case "ask":
		cmdAsk(rest)
	case "await":
		cmdAwait(rest)
	case "decisions":
		cmdDecisions(rest)
	case "mint":
		cmdMint(rest)
	case "module":
		cmdModule(rest)
	case "cluster":
		cmdCluster(rest)
	case "status":
		cmdStatus(rest)
	case "why":
		cmdWhy(rest)
	case "lint":
		cmdLint(rest)
	case "bless":
		cmdBless(rest)
	case "next":
		cmdNext(rest)
	case "start":
		cmdStart(rest)
	case "note":
		cmdNote(rest)
	case "notes":
		cmdNotes(rest)
	case "query":
		cmdQuery(rest)
	case "connections":
		cmdConnections(rest)
	case "promote":
		if len(rest) >= 4 && rest[0] == "connection" {
			out, err := promoteConnection(SPEC, rest[1], rest[2], rest[3], flagVal(rest, "--q"))
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				quackExit(1)
			}
			fmt.Println("promoted ->", out)
		} else {
			fmt.Println("usage: promote connection <kind> <src> <dst> [--q qualifier]")
		}
	case "grant":
		cmdGrant(rest)
	case "observe-red":
		cmdObserveRed(rest)
	case "migrate-edges":
		cmdMigrateEdges(rest)
	case "migrate-actors":
		cmdMigrateActors()
	case "migrate-layout":
		cmdMigrateLayout()
	case "gather":
		cmdGather(rest)
	case "ship":
		cmdShip(rest)
	case "build":
		cmdBuild(rest)
	case "verify":
		cmdVerify(rest)
	case "progress":
		cmdProgress(rest)
	case "render":
		cmdRender(rest)
	case "report":
		// `report book` renders the BOOK projection (the book is a
		// report sub-op, never a top-level command - one render surface, two projections).
		if len(rest) > 0 && rest[0] == "book" {
			cmdBook(rest[1:])
			return
		}
		if hasFlag(rest, "--watch") {
			serveWatch(flagVal(rest, "--port"))
			return
		}
		out := flagVal(rest, "--out")
		if err := RenderReport(out); err != nil {
			fmt.Fprintln(os.Stderr, "report error:", err)
			quackExit(1)
		}
		rp := out
		if rp == "" {
			rp = filepath.Join(dataDirFor("out"), "report.html")
		}
		fmt.Println("report ->", rp)
		if out == "" && hasFlag(rest, "--open") { // report renders only; --open also opens (no auto-open)
			openFile(rp)
		}
	case "resolve":
		if len(rest) == 0 {
			fmt.Println(usageText())
			return
		}
		if p := Resolve(rest[0]); p != "" {
			fmt.Println(p)
		} else {
			fmt.Fprintln(os.Stderr, "unresolved:", rest[0])
			quackExit(1)
		}
	case "guides":
		g := ResolveGuides()
		keys := make([]string, 0, len(g))
		for k := range g {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			fmt.Println(k + "\t" + g[k])
		}
	case "calls":
		cmdCalls(rest)
	case "selftest":
		quackExit(RunSelftestCLI(rest))
	case "root":
		fmt.Println(workspaceRoot(LoadAll()))
	case "dump":
		nodes := LoadAll()
		memo := map[string]string{}
		ids := make([]string, 0, len(nodes))
		for id := range nodes {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		for _, id := range ids {
			fmt.Println(id + "\t" + fullHash(id, nodes, memo))
		}
	case "version", "--version":
		fmt.Println(brand(), version)
		// the canonical, engine-owned log location (go-logs-dir) — discoverable from the binary
		fmt.Println("logs:", logsDir(readProjectConfig()))
	default:
		if fn, ok := registeredCmds[cmd]; ok {
			fn(rest)
			return
		}
		fmt.Println(brand() + ": '" + cmd + "' is not ported to the Go engine yet")
		fmt.Println(usageText())
	}
}

// enddesign

func ljust(s string, n int) string {
	for len(s) < n {
		s += " "
	}
	return s
}

func cmdStatus(rest []string) {
	nodes := LoadAll()
	sm := StatusMap(nodes)
	if len(rest) > 0 && !strings.HasPrefix(rest[0], "-") {
		for _, r := range why(nodes, rest[0]) {
			fmt.Println(" -", r)
		}
		return
	}
	type row struct{ id, st, cls string }
	var gates []row
	for id, n := range nodes {
		if sm[id] != "CONTENT" && moduleSelected(n) {
			gates = append(gates, row{id, sm[id], n.Class})
		}
	}
	sort.Slice(gates, func(i, j int) bool {
		si, sj := gates[i].st == "SUSPECT", gates[j].st == "SUSPECT"
		if si != sj {
			return si
		}
		return gates[i].id < gates[j].id
	})
	mark := map[string]string{"DONE": "[x]", "SUSPECT": "[~]", "OPEN": "[ ]", "DEFER": "[>]", "RETIRED": "[-]"}
	raw := RawStates(nodes)
	susp, done := 0, 0
	all := hasFlag(rest, "--all")
	for _, g := range gates {
		tail := ""
		if g.st == "SUSPECT" {
			susp++
			tail = suspectSuffix(g.id, nodes, raw) // propagated cones name their root (go-suspect-root)
		}
		if g.st == "DONE" {
			done++
			if !all {
				continue // the board shows EXCEPTIONS by default; --all restores every row
			}
		}
		fmt.Println(mark[g.st] + " " + ljust(g.st, 8) + " " + g.id + "  (" + g.cls + ")" + tail)
	}
	// standalone checks: workspace-state watchers outside every verification suite (adr-standalone-suite).
	// Evaluated LIVE, never cached: their subject is workspace state, which no input hash captures —
	// a cached verdict would freeze the tripwire.
	for _, n := range standaloneChecks(nodes) {
		m, st := "[x]", "OK"
		if !runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):])) {
			m, st = "[!]", "RED"
		}
		fmt.Println(m + " " + ljust(st, 8) + " " + n.ID + "  (never-cached)")
	}
	fmt.Printf("\n%d gates | %d done | %d suspect | %d trace-content\n", len(gates), done, susp, len(nodes)-len(gates))
}

// standaloneChecks returns the suite: never-cached tests, ID-sorted (go-standalone-suite).
func standaloneChecks(nodes map[string]Node) []Node {
	var out []Node
	for _, n := range nodes {
		if n.Suite == "never-cached" && n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") {
			out = append(out, n)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}

func cmdWhy(rest []string) {
	if len(rest) == 0 {
		fmt.Println(usageText())
		return
	}
	for _, r := range why(LoadAll(), rest[0]) {
		fmt.Println(" -", r)
	}
}

func why(nodes map[string]Node, id string) []string {
	n, ok := nodes[id]
	if !ok {
		return []string{"unknown id"}
	}
	if !isGate(n) {
		return []string{"content (trace work-product) - not a gate; it ripples change but is never blessed"}
	}
	memo := map[string]string{}
	if n.Class == "executed" {
		if strings.HasPrefix(n.Verify, "coverage:") { // named rule + delta (go-why-derived)
			return whyCoverage(nodes, strings.TrimSpace(n.Verify[len("coverage:"):]), iterOf(n.Path))
		}
		return []string{"executed check - its run decides; evidence lives in the workspace data home"}
	}
	a := attestLoad()
	s, ok := a[id]
	if !ok {
		return []string{"OPEN - never blessed"}
	}
	var reasons []string
	if stmtHash(n) != s.StatementHash {
		reasons = append(reasons, "own statement changed")
	}
	for _, d := range parents(n) {
		if _, ok := nodes[d]; ok && s.Deps[d] != fullHash(d, nodes, memo) {
			reasons = append(reasons, "upstream '"+d+"' changed")
		}
	}
	if len(reasons) == 0 && fullHash(id, nodes, memo) != s.Hash {
		reasons = append(reasons, "definition changed - re-bless")
	}
	if len(reasons) == 0 {
		raw := RawStates(nodes)
		if StatusMap(nodes)[id] == "SUSPECT" && raw[id] == "DONE" { // propagated, not fresh (go-suspect-root)
			roots := SuspectRoots(id, nodes, raw)
			if len(roots) > 0 {
				return []string{"propagated suspect - own inputs unchanged; the cone is dragged by: " + strings.Join(roots, ", "),
					"clear the root(s) and this check returns to DONE by itself"}
			}
		}
		return []string{"fresh - nothing changed"}
	}
	return reasons
}

// design: go-lint-exit  implements: req-lint-exit-honest
// The lint command carries a three-code exit contract (req-lint-exit-honest). Exit 0 means clean OR advisory-only: coverage holes, adoption advisories, model/field/schema notes, nothing build-blocking. Exit 1 means one or more BLOCKING findings are present. Exit 2 means the graph was refused at load, such as a malformed node detected before any finding is computed. It is a pure mapping, so the contract is stated once and gated by selftest:lint-exit-honest.
func lintExitCode(refused bool, findings int) int {
	switch {
	case refused:
		return 2
	case findings > 0:
		return 1
	default:
		return 0
	}
}

// enddesign

func cmdLint(rest []string) {
	// three-code contract (go-lint-exit): a refused graph exits 2 BEFORE any finding is computed —
	// checked here so lint reports the refusal itself rather than dying inside LoadAll's strict guard.
	if issues := StrictIssues(SPEC); len(issues) > 0 {
		fmt.Fprintf(os.Stderr, "STRICT: %d issue(s) — graph refused:\n", len(issues))
		for _, is := range issues {
			rel, _ := filepath.Rel(ROOT, is.Path)
			fmt.Fprintf(os.Stderr, "  - %s [%s] %s\n", filepath.ToSlash(rel), is.Key, is.Msg)
		}
		quackExit(lintExitCode(true, 0))
	}
	dups := DuplicateIDs()
	if len(dups) > 0 {
		fmt.Printf("DUPLICATE IDS - %d (a reused id silently shadows another file; fix first):\n", len(dups))
		ids := make([]string, 0, len(dups))
		for id := range dups {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		for _, id := range ids {
			fmt.Println("  - " + id + ": " + strings.Join(dups[id], ", "))
		}
	}
	nodes := LoadAll()
	holes := CoverageHoles(nodes, "")
	if len(holes) == 0 {
		fmt.Println("coverage: clean (no holes)")
	} else {
		fmt.Printf("coverage: %d hole(s):\n", len(holes))
		for _, h := range holes {
			fmt.Println("  - " + h)
		}
	}
	// EARS enforcement (go-ears-lint): at systematic rigor every requirement statement is checked;
	// historical grandfathers carry explicit exempt markers (adr-grandfathers-historical), counted.
	earsBad := 0
	if cfg := readProjectConfig(); cfg.Rigor == "systematic" {
		findings, exempt := earsFindings(nodes)
		earsBad = len(findings)
		if earsBad == 0 {
			fmt.Printf("ears: clean (%d exemption(s))\n", exempt)
		} else {
			fmt.Printf("ears: %d finding(s), %d exemption(s):\n", earsBad, exempt)
			for _, f := range findings {
				fmt.Println("  - " + f)
			}
		}
	}
	// question hygiene (go-question-nodes): state vocabulary + decision provenance.
	qf := questionFindings(nodes)
	if len(qf) > 0 {
		fmt.Printf("questions: %d finding(s):\n", len(qf))
		for _, f := range qf {
			fmt.Println("  - " + f)
		}
	}
	// milestone-monotonic wiring (go-monotonic-lint): a subtask must chain through the prior gate.
	mono := monotonicFindings(nodes)
	if len(mono) > 0 {
		fmt.Printf("monotonic: %d finding(s):\n", len(mono))
		for _, f := range mono {
			fmt.Println("  - " + f)
		}
	}
	// id charset (go-id-charset): the separator and case rules, shipped before any migration.
	if idf := idCharsetFindings(nodes); len(idf) > 0 {
		fmt.Printf("ids: %d charset finding(s):\n", len(idf))
		for _, f := range idf {
			fmt.Println("  - " + f)
		}
	}
	// structural models (go-model-lints): extraction ambiguity per model, dangling
	// cross-model references, views-chosen coverage, unauthored models.
	np := map[string]*Node{}
	for id := range nodes {
		n := nodes[id]
		np[id] = &n
	}
	graphs := map[string]modelGraph{}
	var modelFinds []string
	for id, n := range nodes {
		if n.Type != "model" {
			continue
		}
		raw, rerr := os.ReadFile(n.Path)
		if rerr != nil {
			continue
		}
		g, lf := extractModelGraph(string(raw))
		graphs[id] = g
		for _, f := range lf {
			modelFinds = append(modelFinds, id+": "+f)
		}
	}
	if len(graphs) > 0 {
		modelFinds = append(modelFinds, modelConsistencyFindings(graphs)...)
	}
	if eng, ok := graphs["model-engine-layers"]; ok {
		// the dogfood reflexion diff (go-model-asbuilt): the engine's code vs its
		// declared onion, on every lint
		modelFinds = append(modelFinds, engineConformanceFindings(eng)...)
	}
	modelFinds = append(modelFinds, viewsChosenFindings(np)...)
	modelFinds = append(modelFinds, modelsGateFindings(np)...)
	// dangling model targets (go-informed-by-edges): an addresses edge to an element no model declares.
	modelFinds = append(modelFinds, informedByDanglingFindings(nodes)...)
	if len(modelFinds) > 0 {
		fmt.Printf("models: %d finding(s):\n", len(modelFinds))
		for _, f := range modelFinds {
			fmt.Println("  - " + f)
		}
	}
	// double-claimed candidates (go-verdict-order): two decisions claiming one candidate.
	if claims := candidateClaimFindings(nodes); len(claims) > 0 {
		fmt.Printf("candidates: %d double claim(s):\n", len(claims))
		for _, f := range claims {
			fmt.Println("  - " + f)
		}
	}
	// decision hygiene (go-decisions): forward-only placement (fatal) + unrealized adoptions (advisory).
	placement, unrealized := decisionFindings(nodes)
	if len(placement) > 0 {
		fmt.Printf("decisions: %d placement finding(s):\n", len(placement))
		for _, f := range placement {
			fmt.Println("  - " + f)
		}
	}
	if len(unrealized) > 0 {
		fmt.Printf("decisions: %d adoption(s) not yet realized (advisory):\n", len(unrealized))
		for _, f := range unrealized {
			fmt.Println("  - " + f)
		}
	}
	// book curation (go-book-manifests): every content node reaches a manifest or its exclusion record.
	orphans := bookOrphanFindings(nodes)
	if len(orphans) > 0 {
		fmt.Printf("book: %d orphan(s):\n", len(orphans))
		for _, f := range orphans {
			fmt.Println("  - " + f)
		}
	}
	// meta quarantine (go-book-glossary): meta vocabulary stays out of the reader chapters.
	gloss := readGlossary() // ONE glossary source for every term lane (adr-terms-source-glossary)
	metaQ := metaQuarantineFindings(nodes, gloss)
	if len(metaQ) > 0 {
		fmt.Printf("book: %d meta-quarantine finding(s):\n", len(metaQ))
		for _, f := range metaQ {
			fmt.Println("  - " + f)
		}
	}
	// book drift (go-book-drift): every published book copy equals a fresh render, or it flags.
	drift := bookDriftFindings(nodes)
	for _, f := range drift {
		fmt.Println("book: " + f)
	}
	// field-schema shapes (go-field-schemas): a node field value breaking its per-field
	// schema, named by node/field/rule. Field-shape only — referential integrity stays the
	// referee's job. Report-only: the starter set is scoped to the current graph.
	if fsf := fieldSchemaFindings(nodes); len(fsf) > 0 {
		fmt.Printf("fields: %d finding(s):\n", len(fsf))
		for _, f := range fsf {
			fmt.Println("  - " + f)
		}
	}
	// vehicle-misuse guard (go-vehicle-misuse-guard, i0020): a VEHICLE whose spec/ holds
	// iterations while its product/ is still empty is the signature of a driven project
	// composed inside the vehicle's own spec (a recorded field failure - Benjamin lived in
	// zwiftbot's spec). The vehicle's spec is for the VEHICLE's tool; a driven project gets
	// its own workspace via `start stubs`.
	if f := vehicleMisuseFinding(); f != "" {
		fmt.Println("vehicle: " + f)
	}
	// schema-set contract (go-schema-tester): the schema files themselves are well-formed.
	if ssf := schemaSetFindings(schemaConfigDir()); len(ssf) > 0 {
		fmt.Printf("schemas: %d finding(s):\n", len(ssf))
		for _, f := range ssf {
			fmt.Println("  - " + f)
		}
	}
	// spec-content lints (go-spec-lints): external links, slot residue, dangling anchors.
	external, residue, anchors := specLintFindings(nodes)
	for _, group := range [][]string{external, residue, anchors} {
		for _, f := range group {
			fmt.Println("spec: " + f)
		}
	}
	// terms before use (go-terms-order-lint): ADVISORY — reading order is judgment; the
	// lane's blocking contribution is pinned zero (termOrderBlocking), it never blocks.
	tof := termOrderFindings(nodes, gloss)
	if len(tof) > 0 {
		fmt.Printf("terms: %d before-use finding(s) (advisory):\n", len(tof))
		for _, f := range tof {
			fmt.Println("  - " + f)
		}
	}
	// the README joins the reading order first (go-readme-terms): bare uses only, advisory.
	if rtf := readmeTermFindings(filepath.Join(filepath.Dir(SPEC), "README.md"), gloss); len(rtf) > 0 {
		fmt.Printf("terms: %d README finding(s) (advisory):\n", len(rtf))
		for _, f := range rtf {
			fmt.Println("  - " + f)
		}
	}
	// unregistered acronyms in reader prose (go-jargon-advisory): advisory.
	var jf []string
	if chs, _ := readerChapters(nodes); len(chs) > 0 {
		var bodies []string
		for _, ch := range chs {
			for _, u := range parseManifestUnits(manifestBody(ch.Path)) {
				bodies = append(bodies, u.Body)
			}
		}
		vocab := jargonVocab(bodies) // the book's own prose filters emphasis caps
		for _, ch := range chs {
			for ui, u := range parseManifestUnits(manifestBody(ch.Path)) {
				jf = append(jf, jargonFindings(u.Body, ch.ID+"-u"+itoa(ui+1), gloss, vocab)...)
			}
		}
	}
	if len(jf) > 0 {
		fmt.Printf("jargon: %d advisory finding(s):\n", len(jf))
		for _, f := range jf {
			fmt.Println("  - " + f)
		}
	}
	// rigor-fit (go-rigor-fit): the composed size against the rigor band, advisory.
	for _, f := range rigorFitFindings(nodes) {
		fmt.Println("  - " + f)
	}
	// voice over authored statements (go-voice-lint): ARMED at zero debt (adr-voice-ratchet,
	// go-voice-gate) - since the i24 drain, a voice finding fails lint like the EARS lane.
	vf := voiceStatementFindings(nodes)
	if voiceLaneVerdict(len(vf)) {
		fmt.Printf("voice: %d finding(s) - the lane is armed, a voice flaw fails lint:\n", len(vf))
		for i, f := range vf {
			if i == 20 {
				fmt.Printf("  ... and %d more\n", len(vf)-20)
				break
			}
			fmt.Println("  - " + f)
		}
	}
	// prose over evidence docs (go-voice-prose): ARMED at zero debt (req-voice-prose.3,
	// drained 2026-07-17) - a prose finding fails lint like the voice lane.
	pf := voiceProseFindings()
	if len(pf) > 0 {
		fmt.Printf("prose: %d finding(s) - the lane is armed, a prose flaw fails lint:\n", len(pf))
		for i, f := range pf {
			if i == 12 {
				fmt.Printf("  ... and %d more\n", len(pf)-12)
				break
			}
			fmt.Println("  - " + f)
		}
	}
	// the BLOCKING set (the three-code contract, go-lint-exit): structural findings that must not
	// ship. Advisories — coverage holes, adoption advisories, model/field/schema notes — stay exit 0.
	blocking := len(dups) + earsBad + len(qf) + len(mono) + len(placement) + len(orphans) +
		len(metaQ) + len(drift) + len(external) + len(residue) + len(anchors) + termOrderBlocking(tof) + len(vf) + len(pf)
	quackExit(lintExitCode(false, blocking))
}
