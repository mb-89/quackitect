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
usage: ` + b + ` status [id] | next | start <id> [--plan] | why <id> | bless [--all|<id>]
       | note "..." | gather <ver> | report [--out F] | ship | build | lint | verify <id>
       | progress [--pager <gate>]`
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
var okFlags = map[string]bool{"--all": true, "--plan": true}

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
	if bad, isBad := badIDArg(cmd, rest); isBad {
		fmt.Println("error: id cannot start with '-': " + bad)
		os.Exit(2)
	}
	switch cmd {
	case "status":
		cmdStatus(rest)
	case "why":
		cmdWhy(rest)
	case "lint":
		cmdLint()
	case "bless":
		cmdBless(rest)
	case "next":
		cmdNext(rest)
	case "start":
		cmdStart(rest)
	case "note":
		cmdNote(rest)
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
		if hasFlag(rest, "--watch") {
			serveWatch(flagVal(rest, "--port"))
			return
		}
		out := flagVal(rest, "--out")
		if err := RenderReport(out); err != nil {
			fmt.Fprintln(os.Stderr, "report error:", err)
			os.Exit(1)
		}
		rp := out
		if rp == "" {
			rp = filepath.Join(QUACK, "out", "report.html")
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
			os.Exit(1)
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
	case "selftest":
		os.Exit(RunSelftestCLI(rest))
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
	susp := 0
	for _, g := range gates {
		if g.st == "SUSPECT" {
			susp++
		}
		fmt.Println(mark[g.st] + " " + ljust(g.st, 8) + " " + g.id + "  (" + g.cls + ")")
	}
	fmt.Printf("\n%d gates | %d suspect | %d trace-content\n", len(gates), susp, len(nodes)-len(gates))
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
		if strings.HasPrefix(n.Verify, "coverage:") {
			return []string{"derived gate - computed live from the trace (" + n.Verify + ")"}
		}
		return []string{"executed check - its run decides; see .quack/evidence/" + id}
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
		return []string{"fresh - nothing changed"}
	}
	return reasons
}

func cmdLint() {
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
	holes := CoverageHoles(LoadAll(), "")
	if len(holes) == 0 {
		fmt.Println("coverage: clean (no holes)")
	} else {
		fmt.Printf("coverage: %d hole(s):\n", len(holes))
		for _, h := range holes {
			fmt.Println("  - " + h)
		}
	}
	if len(dups) > 0 {
		os.Exit(1)
	}
}
