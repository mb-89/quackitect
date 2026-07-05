package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func saveEvents(events []Event) {
	os.MkdirAll(filepath.Dir(ATTEST), 0o755)
	out, _ := json.MarshalIndent(events, "", "  ")
	os.WriteFile(ATTEST, out, 0o644)
}

// design: go-bless  implements: fill-adjudicate, suspect-bless, state-model
// bless appends an attestation event (adjudicated_by actor + filled_by, recorded separately). Only
// gates are blessable; content and executed checks are never blessed. The event stores the full_hash
// and dep hashes, so any later input change makes the check SUSPECT (the suspect/bless mechanism).
// The actor is stamped per channel with a --by override (go-actor-channels); QUACK_ACTOR is retired.
func cmdBless(args []string) {
	nodes := LoadAll()
	memo := map[string]string{}
	actor, filler := resolveActor(args, channelInteractive()), env("QUACK_FILLER", "agent")
	target := "--all"
	for i := 0; i < len(args); i++ {
		if args[i] == "--by" {
			i++ // skip the actor value
			continue
		}
		target = args[i]
		break
	}
	var ids []string
	if target == "--all" {
		for id := range nodes {
			ids = append(ids, id)
		}
		sort.Strings(ids)
	} else {
		ids = []string{target}
	}
	events := attestEvents()
	cur := attestLoad()
	ts := time.Now().Format(time.RFC3339)
	for _, nid := range ids {
		n, ok := nodes[nid]
		if !ok || n.Class == "executed" || !isGate(n) {
			continue
		}
		var prev *string
		if s, ok := cur[nid]; ok {
			h := s.Hash
			prev = &h
		}
		deps := map[string]string{}
		for _, d := range parents(n) {
			if _, ok := nodes[d]; ok {
				deps[d] = fullHash(d, nodes, memo)
			}
		}
		events = append(events, Event{Check: nid, Action: "bless", Actor: actor, FilledBy: filler,
			TS: ts, Hash: fullHash(nid, nodes, memo), StatementHash: stmtHash(n), Deps: deps, PrevHash: prev})
	}
	saveEvents(events)
	fmt.Println("blessed", target)
	// trigger (go-report-live-reload): refresh the report after a killer or milestone bless so the
	// board — and any open --watch page — reflects the adjudication without a manual re-render.
	for _, nid := range ids {
		if n, ok := nodes[nid]; ok && (n.Killer || n.Milestone > 0) {
			if RenderReport("") == nil {
				fmt.Println("report refreshed")
			}
			break
		}
	}
}

// enddesign

// design: go-tests-red  implements: req-tdd-sequence
// tests-red enforces test-first: `observe-red <test>` RUNS the test and records that it was seen
// FAILING at its CURRENT full-hash — a run-once attestation on the Event log, mirroring a bless.
// The tool enforces the observation (i10 defect fix): a passing test is REFUSED, so a fabricated
// red can never enter the ledger — the record is machine evidence, not an honor system. The
// coverage:tests-red rule is satisfied only when every NEW test of the CHECK'S OWN iteration
// carries a red-observed attestation at its current hash, so a test never run-red, or edited
// since (hash changed), fails the rule until re-observed. A recorded observation stays valid
// while the hash stands — a now-green test needs no re-run to prove it was once red.
func cmdObserveRed(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: observe-red <test-id>")
		return
	}
	nodes := LoadAll()
	memo := map[string]string{}
	id := ""
	for i := 0; i < len(args); i++ {
		if args[i] == "--by" {
			i++
			continue
		}
		id = args[i]
		break
	}
	n, ok := nodes[id]
	if !ok {
		fmt.Println("no such check:", id)
		return
	}
	h := fullHash(id, nodes, memo)
	if strings.HasPrefix(n.Verify, "selftest:") {
		if runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):])) {
			fmt.Println("refused:", id, "PASSES at", h[:8], "— a red observation records a watched failure; run the test red first")
			quackExit(1)
		}
	}
	actor := "tester" // channel-independent default; --by overrides (QUACK_ACTOR retired)
	if by := flagVal(args, "--by"); by != "" {
		actor = by
	}
	events := append(attestEvents(), Event{Check: id, Action: "red-observed", Actor: actor,
		TS: time.Now().Format(time.RFC3339), Hash: h, StatementHash: stmtHash(n)})
	saveEvents(events)
	fmt.Println("red-observed", id, "@", h[:8])
}

// enddesign

// design: go-walk  implements: command-surface
// next walks the determinizer: pick the version (named, else latest-not-done, else earliest planned),
// then the next ready gate whose upstream gates are all DONE. The trace is content and never blocks.
func versions() []string {
	d := filepath.Join(SPEC, "iterations")
	var out []string
	if es, err := os.ReadDir(d); err == nil {
		for _, e := range es {
			if e.IsDir() {
				out = append(out, e.Name())
			}
		}
	}
	sort.Strings(out)
	return out
}

func pickVersion(nodes map[string]Node, st map[string]string, prefer string) string {
	vers := versions()
	for _, v := range vers {
		if v == prefer {
			return prefer
		}
	}
	gatesOf := func(v string) []string {
		var g []string
		for id := range nodes {
			if st[id] != "CONTENT" && iterOf(nodes[id].Path) == v {
				g = append(g, id)
			}
		}
		return g
	}
	for i := len(vers) - 1; i >= 0; i-- {
		g := gatesOf(vers[i])
		if len(g) == 0 {
			continue
		}
		notDone := false
		for _, id := range g {
			if st[id] != "DONE" {
				notDone = true
			}
		}
		if notDone {
			return vers[i]
		}
	}
	for _, v := range vers {
		if len(gatesOf(v)) == 0 {
			return v
		}
	}
	if len(vers) > 0 {
		return vers[len(vers)-1]
	}
	return ""
}

func cmdNext(args []string) {
	nodes := LoadAll()
	st := StatusMap(nodes)
	prefer := ""
	if len(args) > 0 && !strings.HasPrefix(args[0], "-") {
		prefer = args[0]
	}
	v := pickVersion(nodes, st, prefer)
	fmt.Println("version:", v)
	gates := map[string]bool{}
	for id := range nodes {
		if st[id] != "CONTENT" {
			gates[id] = true
		}
	}
	var ready []string
	for id := range gates {
		if iterOf(nodes[id].Path) != v || (st[id] != "OPEN" && st[id] != "SUSPECT") {
			continue
		}
		ok := true
		for _, d := range parents(nodes[id]) {
			if gates[d] && st[d] != "DONE" {
				ok = false
				break
			}
		}
		if ok {
			ready = append(ready, id)
		}
	}
	if len(ready) == 0 {
		done := true
		for id := range gates {
			if iterOf(nodes[id].Path) == v && st[id] != "DONE" {
				done = false
			}
		}
		if done {
			fmt.Println("done")
		} else {
			fmt.Println("blocked")
		}
		return
	}
	sort.Strings(ready)
	n := nodes[ready[0]]
	kind := "review"
	if n.Class == "executed" {
		kind = "executed"
	}
	fmt.Printf("NEXT: %s  (%s%s)\n  %s\n", n.ID, kind, map[bool]string{true: ", GATE (user-adjudicated)"}[isGate(n) && n.Class != "executed"], n.Statement)
	if n.Class == "executed" {
		fmt.Println("  verify:", n.Verify)
		fmt.Println("  -> fill it; executed -> passes on re-run")
	} else {
		fmt.Println("  -> fill it; gate -> ask the user to `" + brand() + " bless " + n.ID + "`")
	}
}

// enddesign

// design: go-start  implements: req-version-mgmt
// Version ops: `quack start <id> [--plan] [motivation]` activates a version (writes iteration.md,
// points config at it) or, with --plan, registers a future one. Ids are i_NNNN_name; only start mints
// versions. Rejects an id starting with '-' (the help-flag bug).
func setConfigVersion(vid string) {
	p := projectTomlPath() // truth pointer (go-truth-in-spec); legacy config until migrated
	if _, err := os.Stat(p); err != nil {
		p = filepath.Join(QUACK, "config.toml")
	}
	raw, _ := os.ReadFile(p)
	lines := strings.Split(string(raw), "\n")
	seen := false
	for i, ln := range lines {
		if strings.HasPrefix(strings.TrimSpace(ln), "version") {
			lines[i] = "version = \"" + vid + "\""
			seen = true
		}
	}
	if !seen {
		lines = append(lines, "version = \""+vid+"\"")
	}
	os.WriteFile(p, []byte(strings.Join(lines, "\n")), 0o644)
}

func cmdStart(args []string) {
	if len(args) > 0 && args[0] == "init" {
		cmdStartInit(args[1:])
		return
	}
	if len(args) > 0 && args[0] == "stubs" {
		cmdStartStubs(args[1:])
		return
	}
	plan := false
	var rest []string
	for _, a := range args {
		if a == "--plan" {
			plan = true
		} else {
			rest = append(rest, a)
		}
	}
	if len(rest) == 0 {
		fmt.Println("usage: " + brand() + " start <id> [--plan] [motivation...]")
		return
	}
	vid := rest[0]
	motivation := strings.Join(rest[1:], " ")
	d := filepath.Join(SPEC, "iterations", vid)
	os.MkdirAll(d, 0o755)
	p := filepath.Join(d, "iteration.md")
	cfg := readProjectConfig()
	status := "active"
	if plan {
		status = "planned"
	}
	fm := []string{"---", "iteration: " + vid, "status: " + status}
	if !plan {
		fm = append(fm, "type: "+cfg.Type, "rigor: "+cfg.Rigor)
	}
	if motivation == "" {
		motivation = "(motivation: TBD)"
	}
	fm = append(fm, "---", "", motivation, "")
	os.WriteFile(p, []byte(strings.Join(fm, "\n")), 0o644)
	if plan {
		fmt.Println("planned " + vid + " - a future version (roadmap).")
	} else {
		setConfigVersion(vid)
		fmt.Println("started " + vid + " - active. Now compose its checklist (/engage start), then bless.")
	}
}

// enddesign

// design: go-note  implements: notes-pipeline
// One-file-per-note capture under .quack/notes/inbox, recording provenance (origin, timestamp, status).
// design: go-notes-out  implements: req-notes-out, req-note-lane
// Notes live OUTSIDE the repository (adr-no-quack-data-home): the capture lane writes beneath the
// workspace's notes home in the user data dir — raw notes carry personal data and never belong in a
// published checkout. The lane is the ONLY minting path (adr-deterministic-mint): a multi-line body
// arrives via --file <path> or --file - (stdin), so the note skill CALLS the engine instead of
// hand-writing files; id, timestamp, slug and frontmatter stay engine-stamped.
func notesHome() string { return dataDirFor("notes") }

func cmdNote(args []string) {
	text := ""
	origin := "commandline"
	for i := 0; i < len(args); i++ {
		if args[i] == "--origin" && i+1 < len(args) {
			origin = args[i+1]
			i++
		} else if args[i] == "--file" && i+1 < len(args) {
			var raw []byte
			var err error
			if args[i+1] == "-" {
				raw, err = io.ReadAll(os.Stdin)
			} else {
				raw, err = os.ReadFile(args[i+1])
			}
			if err != nil {
				fmt.Fprintln(os.Stderr, "note:", err)
				quackExit(1)
			}
			text = strings.TrimSpace(string(raw))
			i++
		} else if !strings.HasPrefix(args[i], "--") && text == "" {
			text = args[i]
		}
	}
	if text == "" {
		fmt.Println("usage: " + brand() + " note \"...\" | note --file <path|-> [--origin X]")
		return
	}
	ts := time.Now().Format("20060102-150405")
	firstLine := text
	if i := strings.IndexByte(firstLine, '\n'); i >= 0 {
		firstLine = firstLine[:i]
	}
	slug := regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(strings.ToLower(firstLine), "-")
	if len(slug) > 32 {
		slug = slug[:32]
	}
	slug = strings.Trim(slug, "-")
	nid := "NOTE-" + ts + "-" + slug
	dir := filepath.Join(notesHome(), "inbox")
	os.MkdirAll(dir, 0o755)
	body := "---\nid: " + nid + "\ncreated: " + time.Now().Format(time.RFC3339) +
		"\norigin: " + origin + "\nstatus: inbox\n---\n\n" + text + "\n"
	os.WriteFile(filepath.Join(dir, nid+".md"), []byte(body), 0o644)
	fmt.Println("captured", nid+".md")
}

// enddesign

// design: go-gather  implements: composition
// gather collects the rigor floors (vibe<lean<systematic) and the project-type guides for the active
// version into one bundle the agent composes the iteration checklist from. Resolved via the overlay.
func cmdGather(args []string) {
	cfg := readProjectConfig()
	ver := cfg.Version
	if len(args) > 0 {
		ver = args[0]
	}
	var chains []string
	addFromLayers := func(rel string) { // route through the overlay chain (vehicle overlay -> engine defaults)
		for _, layer := range overlayLayers() {
			d := filepath.Join(layer, filepath.FromSlash(rel))
			if st, err := os.Stat(d); err == nil && st.IsDir() {
				chains = append(chains, d)
			}
		}
	}
	ladder := []string{"vibe", "lean", "systematic"}
	for _, r := range ladder {
		addFromLayers("method/rigor/" + r)
		if r == cfg.Rigor {
			break
		}
	}
	addFromLayers("method/rigor/_shared") // the shared implementation fragment, imported by lean+systematic
	addFromLayers("method/roles")         // the pluggable role seam (bindings default to inline)
	cur := "project_types"
	for _, part := range strings.Split(cfg.Type, "/") {
		cur = cur + "/" + part
		addFromLayers(cur)
	}
	out := []string{"# Source bundle for iteration " + ver,
		"_type=" + cfg.Type + " | rigor=" + cfg.Rigor + " - compose the checklist from ALL of this._", ""}
	n := 0
	for _, base := range chains {
		if st, err := os.Stat(base); err != nil || !st.IsDir() {
			continue
		}
		n++
		filepath.Walk(base, func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() {
				return nil
			}
			rel, _ := filepath.Rel(ROOT, p)
			raw, _ := os.ReadFile(p)
			out = append(out, "\n## "+filepath.ToSlash(rel)+"\n\n"+string(raw))
			return nil
		})
	}
	dest := filepath.Join(dataDirFor("gather"), ver)
	os.MkdirAll(dest, 0o755)
	path := filepath.Join(dest, "source.md")
	os.WriteFile(path, []byte(strings.Join(out, "\n")), 0o644)
	rel, _ := filepath.Rel(ROOT, path)
	fmt.Printf("gathered %d source folder(s) -> %s\n", n, filepath.ToSlash(rel))
	fmt.Println("  read it, then compose the checklist in spec/iterations/" + ver + "/ and bless.")
}

// enddesign

// design: go-ship  implements: req-tooling
// ship packages product/ into a versioned zip under .quack/out/. The zip is ephemeral output.
func cmdShip(args []string) {
	cfg := readProjectConfig()
	dest := dataDirFor("out")
	os.MkdirAll(dest, 0o755)
	zp := filepath.Join(dest, brand()+"-"+cfg.Version+".zip")
	f, err := os.Create(zp)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ship error:", err)
		quackExit(1)
	}
	defer f.Close()
	zw := zip.NewWriter(f)
	base := filepath.Join(ROOT, "product")
	filepath.Walk(base, func(p string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}
		rel, _ := filepath.Rel(ROOT, p)
		w, _ := zw.Create(filepath.ToSlash(rel))
		src, _ := os.Open(p)
		defer src.Close()
		io.Copy(w, src)
		return nil
	})
	zw.Close()
	rel, _ := filepath.Rel(ROOT, zp)
	fmt.Println("shipped ->", filepath.ToSlash(rel))
}

// enddesign

// design: go-build  implements: req-quack-build
// quack build compiles the engine from its source (EngineSrc: vendored, else dogfood) to
// .quack/engine/<brand>.exe AND re-baselines the determinism golden in one step — closing the
// stale-golden footgun where a hand-run build forgot to re-baseline and produced false milestone FAILs.
func cmdBuild(args []string) {
	src := EngineSrc()
	out := globalBinPath() // the canonical home (go-global-ratchet); one binary serves every workspace
	os.MkdirAll(filepath.Dir(out), 0o755)
	stamp := time.Now().Format(time.RFC3339)
	os.WriteFile(stampFile(src), []byte(stamp+"\n"), 0o644) // committed build-time stamp (go-ratchet-stamp)
	staged := out + ".staged"
	cmd := exec.Command("go", "build", "-o", staged, ".")
	cmd.Dir = src
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "build error:", err, "(need the Go toolchain — see dependencies.md)")
		quackExit(1)
	}
	if err := replaceExe(out, staged); err != nil {
		if os.Rename(staged, out) != nil { // fresh install: nothing to swap
			fmt.Fprintln(os.Stderr, "build: swap blocked ("+err.Error()+") — staged; it lands on the next launch")
		}
	}
	os.WriteFile(out+".stamp", []byte(stamp+"\n"), 0o644) // the binary mirrors its source's stamp
	root := MerkleRoot(LoadAll())
	gp := goldenRootPath()
	os.WriteFile(gp, []byte(root+"\n"), 0o644)
	fmt.Println("built ->", filepath.ToSlash(out), "| golden re-baselined to", root[:12])
}

// enddesign

// design: go-start-init  implements: req-integrate, req-vehicle-scaffold, req-claude-vendor, req-scaffold-modern
// `quack start init <target>` is run FROM a quackitect checkout and sets up a NEW vehicle at <target>
// in the CURRENT world (i10 modernization; adr-no-quack-data-home, adr-entry-chain, adr-ratchet-stamp):
// it vendors the engine (product/ -> tools/vendor/, stamp included), writes spec/project.toml as the
// root marker, a global-bin bootstrap launcher, and the pointer-chain entry files (CLAUDE.md ->
// AGENTS.md -> the vendored contract). No .quack anywhere. It deliberately does NOT mint an iteration
// or write any spec — the user drives that. Only meaningful from a quackitect checkout.
const vehicleLauncherTmpl = `@echo off
rem {{PROJ}} launcher: forwards to the ONE global engine binary; bootstraps it from the vendored source when absent.
setlocal
set "QBIN=%LOCALAPPDATA%\quackitect\bin\{{PROJ}}.exe"
if exist "%QBIN%" goto run
if defined QUACK_ENGINE set "QBIN=%QUACK_ENGINE%" & goto run
echo {{PROJ}}: no global engine at %QBIN% - bootstrapping from vendored source...
if not exist "%LOCALAPPDATA%\quackitect\bin" mkdir "%LOCALAPPDATA%\quackitect\bin"
pushd "%~dp0tools\vendor\engine-go"
go build -o "%QBIN%" .
popd
if not exist "%QBIN%" (
  echo {{PROJ}}: bootstrap failed - install the Go toolchain, see tools/vendor/quackitect/method/prompts/dependencies.md
  exit /b 1
)
:run
"%QBIN%" %*
`

const vehicleAgentsTmpl = `# AGENTS.md — {{PROJ}}

> Hand-authored entry hub. Every harness pointer file routes here (CLAUDE.md,
> .github/copilot-instructions.md). The binding contract lives in ONE place:
> tools/vendor/quackitect/method/prompts/contract.md.

## FIRST — the ritual, in this exact order

1. **READ** tools/vendor/quackitect/method/prompts/contract.md. The whole file, with your file-reading tool. No skimming. No summaries.
2. **UNDERSTAND** it. It is binding. It overrides your defaults.
3. **RECITE** it. Paraphrase its specifics back to the adjudicator. Use a standalone visible message. Name rule 3's actor=agent killer-bless exception. Confirm you will obey.
4. **HONOR** every instruction in it. No exceptions. To the letter of each statement.
5. **READ** product/brand/voice.md next. Every output follows it.

Re-read the contract at the start of every engage.
No recital means the rules never loaded. The adjudicator should stop you.

---

Drive {{PROJ}} from inside this folder: .\{{PROJ}} <cmd>
(status | next | start | bless | note | notes | gather | report | lint | ship | selftest).
Load method prompts path-free: .\{{PROJ}} resolve method/prompts/engage.md (start with integrate.md).
product/ and spec/ are {{PROJ}}'s own. The user adjudicates gates; never bless on their behalf.
`

const vehicleClaudeTmpl = `# CLAUDE.md — entry for the Claude Code harness

Claude Code auto-loads this file, not AGENTS.md.
**Follow every instruction in AGENTS.md. No exceptions. To the letter of each statement.**
It opens with the ritual. That ritual is your first action.
The line below imports it.

@AGENTS.md
`

const vehicleCopilotTmpl = `# GitHub Copilot instructions — {{PROJ}}

Copilot auto-loads this file.
The single source of the harness instructions is AGENTS.md at the repository root.

1. **READ** AGENTS.md at the repository root. The whole file. Before anything else.
2. **FOLLOW** every instruction in it. No exceptions. To the letter of each statement. It opens with the ritual: read the contract, understand it, recite it (paraphrase its specifics back to the adjudicator), honor it.
`

// initVehicleFiles is the silent emission core (selftest-drivable); cmdStartInit wraps it with guidance.
func initVehicleFiles(target string) error {
	src := filepath.Join(ROOT, "product")
	proj := filepath.Base(target)
	sub := func(s string) string { return strings.ReplaceAll(s, "{{PROJ}}", proj) }

	// 1. vendor the engine: product/ -> <target>/tools/vendor/ (engine-go with its stamp + quackitect).
	if err := copyTree(src, filepath.Join(target, "tools", "vendor")); err != nil {
		return err
	}
	// 2. root marker + iteration breadcrumb — the no-.quack world's single committed config.
	writeIfAbsent(filepath.Join(target, "spec", "project.toml"),
		"# the workspace root marker + iteration breadcrumb (adr-no-quack-data-home).\n[iteration]\ntype    = \"default\"\nrigor   = \"systematic\"\nversion = \"\"\n")
	// 3. the vehicle's own empty product/ + brand seeds from the engine's generic design templates.
	os.MkdirAll(filepath.Join(target, "product"), 0o755)
	bsrc := filepath.Join(src, "quackitect", "design")
	bdst := filepath.Join(target, "product", "brand")
	os.MkdirAll(bdst, 0o755)
	filepath.Walk(bsrc, func(p string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || filepath.Base(p) == "design-language.md" {
			return nil
		}
		if raw, e := os.ReadFile(p); e == nil {
			writeIfAbsent(filepath.Join(bdst, filepath.Base(p)), string(raw))
		}
		return nil
	})
	// 4. launcher + the pointer-chain entry files + gitignore.
	writeIfAbsent(filepath.Join(target, proj+".cmd"), strings.ReplaceAll(sub(vehicleLauncherTmpl), "\n", "\r\n"))
	writeIfAbsent(filepath.Join(target, "AGENTS.md"), sub(vehicleAgentsTmpl))
	writeIfAbsent(filepath.Join(target, "CLAUDE.md"), sub(vehicleClaudeTmpl))
	writeIfAbsent(filepath.Join(target, ".github", "copilot-instructions.md"), sub(vehicleCopilotTmpl))
	writeIfAbsent(filepath.Join(target, ".gitignore"),
		"# binaries never live in the repo (the engine is a global binary); caches live in the user data home.\n*.exe\n# commit tools/vendor/ — it IS this project's engine.\n")

	// 5. vendor the .claude slash commands so the agent drives the vehicle the same way; rewrite the
	//    dogfood method path to the vendored one so the pointers resolve.
	claudeSrc := filepath.Join(ROOT, ".claude")
	if cmds := filepath.Join(claudeSrc, "commands"); dirExists(cmds) {
		filepath.Walk(cmds, func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() || !strings.HasSuffix(p, ".md") {
				return nil
			}
			if raw, e := os.ReadFile(p); e == nil {
				rel, _ := filepath.Rel(claudeSrc, p)
				writeIfAbsent(filepath.Join(target, ".claude", rel), rewriteVendorPath(string(raw)))
			}
			return nil
		})
		if raw, err := os.ReadFile(filepath.Join(claudeSrc, "settings.json")); err == nil {
			writeIfAbsent(filepath.Join(target, ".claude", "settings.json"), rewriteVendorPath(string(raw)))
		}
	}
	return nil
}

func cmdStartInit(args []string) {
	if st, err := os.Stat(filepath.Join(ROOT, "product", "quackitect", "method")); err != nil || !st.IsDir() {
		fmt.Println("start init must be run from a quackitect checkout (no product/quackitect here).")
		return
	}
	if len(args) == 0 || strings.TrimSpace(args[0]) == "" {
		fmt.Println("usage: " + brand() + " start init <target-dir>")
		fmt.Println("  where <target-dir> is the path of the new vehicle to create. Provide a path.")
		return
	}
	target := args[0]
	if abs, err := filepath.Abs(target); err == nil {
		target = abs
	}
	for _, marker := range []string{filepath.Join(target, "spec", "project.toml"), filepath.Join(target, ".quack", "vendor")} {
		if _, err := os.Stat(marker); err == nil {
			fmt.Println("refusing: " + target + " is already a vehicle (" + marker + " exists).")
			return
		}
	}
	proj := filepath.Base(target)
	if err := initVehicleFiles(target); err != nil {
		fmt.Println("vendor error:", err)
		return
	}
	fmt.Println(proj + " scaffolded -> " + target)
	fmt.Println("  vendored the engine -> tools/vendor/ ; wrote spec/project.toml, " + proj + ".cmd, the entry chain (CLAUDE.md -> AGENTS.md -> contract), .claude/ commands, empty product/.")
	fmt.Println("  next: cd into it and run `.\\" + proj + " status` — the launcher bootstraps the global binary when absent.")
	fmt.Println("        Then set [iteration].version and `.\\" + proj + " start <version>` to compose your spec.")
}

// --- drive-from-inside stubs (i0005): make a bare workspace drivable from within, engine linked at runtime ---

// design: go-inside-launcher  implements: req-inside-launcher, req-engine-loc-untracked
// The committed root launcher for a bare workspace. It resolves an engine at runtime — the global
// binary, then the env var — and forwards; with neither present it fails clearly. No engine binary
// and no engine path is ever committed, so a clone carries no machine-local state (the .quack
// internal/pointer lanes retired at i11, adr-retire-legacy-lanes).
const insideLauncherTmpl = `@echo off
rem {{PROJ}} launcher: resolve an engine (global binary -> env) and forward. No engine path committed.
setlocal enabledelayedexpansion
if exist "%LOCALAPPDATA%\quackitect\bin\quack.exe" set "ENGINE=%LOCALAPPDATA%\quackitect\bin\quack.exe" & goto run
if defined QUACK_ENGINE set "ENGINE=%QUACK_ENGINE%" & goto run
echo no engine found: install the global engine or set QUACK_ENGINE 1>&2
exit /b 1
:run
"%ENGINE%" %*
exit /b %errorlevel%
`

// enddesign

// design: go-inside-agents  implements: req-inside-entry-surface
// The committed AGENTS.md entry surface for a bare workspace: tells an AI to drive via the launcher and
// load method prompts path-free through `quack resolve` / `quack guides`. Self-contained — no hard link
// to a quackitect checkout.
const insideAgentsTmpl = `# AGENTS.md — {{PROJ}}

{{PROJ}} is a quackitect workspace with no engine of its own. Drive it from INSIDE this folder:

    .\{{PROJ}} <cmd>        (status | next | start | bless | note | gather | report | lint | ship)

The launcher resolves an engine at runtime (the global binary, then %QUACK_ENGINE%). The engine's
location is never committed.

FIRST — the ritual: resolve and READ the contract in full, RECITE it back to the adjudicator in a
standalone visible message, and HONOR it to the letter of each statement:

    .\{{PROJ}} resolve method/prompts/contract.md  # the binding contract — read THAT file first

Load the method prompts path-free through the linked engine — do NOT hard-code a quackitect path:

    .\{{PROJ}} guides                              # list the available guides
    .\{{PROJ}} resolve method/prompts/engage.md    # resolve a prompt to drive the loop

The user adjudicates gates; never bless on their behalf.
`

// enddesign

// design: go-inside-claude  implements: req-scaffold-modern
// The stub CLAUDE.md pointer: Claude Code auto-loads CLAUDE.md only (field-proven at i10), so a bare
// workspace carries the same pointer chain as a full vehicle — CLAUDE.md commands AGENTS.md to the letter.
const insideClaudeTmpl = `# CLAUDE.md — entry for the Claude Code harness

Claude Code auto-loads this file, not AGENTS.md.
**Follow every instruction in AGENTS.md. No exceptions. To the letter of each statement.**
The line below imports it.

@AGENTS.md
`

// enddesign

// insideStubFiles returns the drive-from-inside stub set (relative path -> content) for project name
// proj. The launcher is named <proj>.cmd (CRLF for cmd.exe). Consumed by the emit step (cmdInitStubs).
// The .gitignore stub retired with the .quack lanes (adr-retire-legacy-lanes): the stubs commit no
// machine-local state, so there is nothing to ignore.
func insideStubFiles(proj string) map[string]string {
	sub := func(s string) string { return strings.ReplaceAll(s, "{{PROJ}}", proj) }
	return map[string]string{
		proj + ".cmd": strings.ReplaceAll(sub(insideLauncherTmpl), "\n", "\r\n"),
		"AGENTS.md":   sub(insideAgentsTmpl),
		"CLAUDE.md":   sub(insideClaudeTmpl),
		filepath.Join("spec", "project.toml"): "# the workspace root marker + iteration breadcrumb (adr-no-quack-data-home).\n[iteration]\ntype    = \"default\"\nrigor   = \"systematic\"\nversion = \"\"\n",
	}
}

// design: go-init-stubs  implements: req-drive-from-inside
// `quack start stubs [target]` makes a workspace drivable from INSIDE: it writes the launcher,
// AGENTS.md/CLAUDE.md, and spec/project.toml stubs (insideStubFiles) into target (default: the
// current workspace ROOT). The launcher resolves an engine at runtime with no engine path
// committed. Idempotent — existing files are kept.
func cmdStartStubs(args []string) {
	target := ROOT
	if len(args) > 0 && strings.TrimSpace(args[0]) != "" {
		if abs, err := filepath.Abs(args[0]); err == nil {
			target = abs
		}
	}
	proj := filepath.Base(target)
	for rel, content := range insideStubFiles(proj) {
		dst := filepath.Join(target, rel)
		writeIfAbsent(dst, content)
	}
	fmt.Println("stubs -> " + target)
	fmt.Println("  wrote " + proj + ".cmd, AGENTS.md, CLAUDE.md, spec/project.toml (kept any existing).")
	fmt.Println("  the launcher resolves the global engine binary, or set QUACK_ENGINE.")
}

// enddesign

// copyTree recursively copies src -> dst, skipping build junk (caches, binaries, __pycache__).
func copyTree(src, dst string) error {
	return filepath.Walk(src, func(p string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		base := filepath.Base(p)
		if fi.IsDir() {
			if base == ".gotmp" || base == "__pycache__" {
				return filepath.SkipDir
			}
			return os.MkdirAll(filepath.Join(dst, rel), 0o755)
		}
		if strings.HasSuffix(base, ".exe") || strings.HasSuffix(base, ".pyc") {
			return nil
		}
		raw, e := os.ReadFile(p)
		if e != nil {
			return e
		}
		return os.WriteFile(filepath.Join(dst, rel), raw, 0o644)
	})
}

// rewriteVendorPath rewrites a dogfood method path to the vendored one (used vendoring .claude commands).
func rewriteVendorPath(s string) string {
	return strings.ReplaceAll(s, "product/quackitect/", "tools/vendor/quackitect/")
}

// dirExists reports whether path is an existing directory.
func dirExists(path string) bool {
	st, err := os.Stat(path)
	return err == nil && st.IsDir()
}

// writeIfAbsent writes content only if the file does not already exist (idempotent scaffolding).
func writeIfAbsent(path, content string) {
	if _, err := os.Stat(path); err == nil {
		return
	}
	os.MkdirAll(filepath.Dir(path), 0o755)
	os.WriteFile(path, []byte(content), 0o644)
}

// design: go-metrics  implements: req-metrics
// Health metrics from the append-only attest log: rework, reversal, self-cert. Gates only.
// Self-cert counts agent versus non-agent, so it spans the human and user actor eras as one
// (go-stamp-user). metricsFrom is the pure core, fixture-testable without the real ledger.
func metricsReport() map[string][2]int {
	return metricsFrom(LoadAll(), attestEvents())
}

func metricsFrom(nodes map[string]Node, events []Event) map[string][2]int {
	gates := map[string]bool{}
	for id, n := range nodes {
		if isGate(n) {
			gates[id] = true
		}
	}
	var blesses []Event
	for _, e := range events {
		if e.Action == "bless" && gates[e.Check] {
			blesses = append(blesses, e)
		}
	}
	counts := map[string]int{}
	latest := map[string]Event{}
	reversals := 0
	for _, e := range blesses {
		counts[e.Check]++
		latest[e.Check] = e
		if e.PrevHash != nil && *e.PrevHash != e.Hash {
			reversals++
		}
	}
	reworked := 0
	for _, c := range counts {
		if c > 1 {
			reworked++
		}
	}
	killers, selfcert := 0, 0
	for id := range gates {
		if nodes[id].Killer {
			killers++
			if e, ok := latest[id]; ok && e.Actor == "agent" {
				selfcert++
			}
		}
	}
	return map[string][2]int{"rework": {reworked, len(counts)}, "reversal": {reversals, len(blesses)}, "selfcert": {selfcert, killers}}
}

// design: go-stamp-user  implements: req-stamp-user
// The ledger says `user` (adr-actor-user-migration). New records write user (resolveActor);
// `quack migrate-actors` rewrites historical human stamps to user in ONE audited pass — the
// migration event records the count and timestamp, bless hashes and the prev_hash chain stay
// untouched, and a second run is a no-op. Readers treat human and user as one value forever
// (normActor), so an unmigrated clone still computes; the self-cert metric counts agent versus
// non-agent and therefore spans both eras unchanged.

// normActor folds the pre-i11 recorded vocabulary into the current one: human IS user.
func normActor(a string) string {
	if a == "human" || a == "" {
		return "user"
	}
	return a
}

// migrateActorsFrom is the pure one-pass rewrite: every human actor/filler stamp becomes user;
// when anything changed, ONE audit event (action migrate-actors) records how many events moved.
func migrateActorsFrom(events []Event, ts string) ([]Event, int) {
	n := 0
	for i := range events {
		touched := false
		if events[i].Actor == "human" {
			events[i].Actor = "user"
			touched = true
		}
		if events[i].FilledBy == "human" {
			events[i].FilledBy = "user"
			touched = true
		}
		if touched {
			n++
		}
	}
	if n > 0 {
		events = append(events, Event{Check: "ledger", Action: "migrate-actors", Actor: "user", TS: ts, Count: n})
	}
	return events, n
}

func cmdMigrateActors() {
	events, n := migrateActorsFrom(attestEvents(), time.Now().Format(time.RFC3339))
	if n == 0 {
		fmt.Println("migrate-actors: nothing to migrate — the ledger already says user")
		return
	}
	saveEvents(events)
	fmt.Printf("migrate-actors: %d event(s) rewritten human -> user, audited in the ledger\n", n)
}

// enddesign

func cmdVerify(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: " + brand() + " verify <id>")
		return
	}
	nodes := LoadAll()
	n, ok := nodes[args[0]]
	if !ok || n.Class != "executed" {
		fmt.Println("verify: " + args[0] + " is not an executed check")
		return
	}
	memo := map[string]string{}
	if strings.HasPrefix(n.Verify, "coverage:") {
		ok := coverageRule(nodes, strings.TrimSpace(n.Verify[len("coverage:"):]), iterOf(n.Path))
		fmt.Println(n.ID, "->", map[bool]string{true: "pass", false: "fail"}[ok], "(derived:", n.Verify+")")
	} else if strings.HasPrefix(n.Verify, "selftest:") {
		ok := runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):]))
		fmt.Println(n.ID, "->", map[bool]string{true: "pass", false: "fail"}[ok])
	} else {
		fmt.Println(n.ID, "->", runExecuted(n, fullHash(n.ID, nodes, memo)))
	}
}
