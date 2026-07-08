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

const version = "0.0.1-go"

// design: go-brand  implements: req-white-label
// brand is the invoked program name (argv[0] without dir or extension). A vehicle launched via its
// own <project>.exe reads as "<project>"; the dogfood quack.exe reads as "quack". This is the
// white-label hook — the engine never hardcodes its own name in user-facing output. Defaults to "quack".
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
       | note "..." | notes [--all] | gather <ver> | report [book] [--out F] | ship | build
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

// idCmds take an id positionally; a '-'-prefixed value there is an error (not a flag).
var idCmds = map[string]bool{"why": true, "bless": true, "start": true, "verify": true, "status": true}
var okFlags = map[string]bool{"--all": true, "--plan": true, "--by": true}

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

// design: go-cli-help  implements: req-cli-help
// One command surface with a shared help preamble. Every subcommand answers -h, --help,
// and -? with usage and NO side effect, and an id that starts with '-' is rejected — the
// structural fix for 'quack start --help' once activating a stray version named '--help'.
func Dispatch(args []string) {
	if len(args) == 0 || helpRequested(args) {
		fmt.Println(usageText())
		return
	}
	cmd, rest := args[0], args[1:]
	callLogStart(cmd, rest)       // one redacted line per dispatch (go-call-log)
	defer func() { callLogWrite(0) }()
	rest = attestGuard(cmd, rest) // the contract gate: agent-channel ledger commands need a key
	if bad, isBad := badIDArg(cmd, rest); isBad {
		fmt.Println("error: id cannot start with '-': " + bad)
		quackExit(2)
	}
	switch cmd {
	case "attest":
		cmdAttest(rest)
	case "decisions":
		cmdDecisions(rest)
	case "mint":
		cmdMint(rest)
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
	case "report":
		// `report book` renders the BOOK projection (owner ruling 2026-07-08: the book is a
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
		if out == "" && !hasFlag(rest, "--no-open") { // bare `quack report` opens; --out renders only
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
		fmt.Println(MerkleRoot(LoadAll()))
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
		if sm[id] != "CONTENT" {
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
	mark := map[string]string{"DONE": "[x]", "SUSPECT": "[~]", "OPEN": "[ ]"}
	raw := RawStates(nodes)
	susp := 0
	for _, g := range gates {
		tail := ""
		if g.st == "SUSPECT" {
			susp++
			tail = suspectSuffix(g.id, nodes, raw) // propagated cones name their root (go-suspect-root)
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
		fmt.Println(m + " " + ljust(st, 8) + " " + n.ID + "  (standalone)")
	}
	fmt.Printf("\n%d gates | %d suspect | %d trace-content\n", len(gates), susp, len(nodes)-len(gates))
}

// standaloneChecks returns the suite: standalone tests, ID-sorted (go-standalone-suite).
func standaloneChecks(nodes map[string]Node) []Node {
	var out []Node
	for _, n := range nodes {
		if n.Suite == "standalone" && n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") {
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

func cmdLint(rest []string) {
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
	metaQ := metaQuarantineFindings(nodes, readGlossary())
	if len(metaQ) > 0 {
		fmt.Printf("book: %d meta-quarantine finding(s):\n", len(metaQ))
		for _, f := range metaQ {
			fmt.Println("  - " + f)
		}
	}
	// book drift (go-book-drift): the committed book equals a fresh render, or it flags.
	drift := bookDriftFindingAt(committedBookPath(), nodes)
	for _, f := range drift {
		fmt.Println("book: " + f)
	}
	// spec-content lints (go-spec-lints): external links, slot residue, dangling anchors.
	external, residue, anchors := specLintFindings(nodes)
	for _, group := range [][]string{external, residue, anchors} {
		for _, f := range group {
			fmt.Println("spec: " + f)
		}
	}
	if len(dups) > 0 || earsBad > 0 || len(mono) > 0 || len(placement) > 0 || len(orphans) > 0 || len(metaQ) > 0 || len(drift) > 0 ||
		len(external) > 0 || len(residue) > 0 || len(anchors) > 0 {
		quackExit(1)
	}
}
