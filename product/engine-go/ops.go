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
	os.MkdirAll(QUACK, 0o755)
	out, _ := json.MarshalIndent(events, "", "  ")
	os.WriteFile(ATTEST, out, 0o644)
}

// design: go-bless  implements: fill-adjudicate, suspect-bless, state-model
// bless appends an attestation event (adjudicated_by actor + filled_by, recorded separately). Only
// gates are blessable; content and executed checks are never blessed. The event stores the full_hash
// and dep hashes, so any later input change makes the check SUSPECT (the suspect/bless mechanism).
func cmdBless(args []string) {
	nodes := LoadAll()
	memo := map[string]string{}
	actor, filler := env("QUACK_ACTOR", "human"), env("QUACK_FILLER", "agent")
	target := "--all"
	if len(args) > 0 {
		target = args[0]
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
	fmt.Printf("NEXT: %s  (%s%s)\n  %s\n", n.ID, kind, map[bool]string{true: ", GATE (human-adjudicated)"}[isGate(n) && n.Class != "executed"], n.Statement)
	if n.Class == "executed" {
		fmt.Println("  verify:", n.Verify)
		fmt.Println("  -> fill it; executed -> passes on re-run")
	} else {
		fmt.Println("  -> fill it; gate -> ask the human to `" + brand() + " bless " + n.ID + "`")
	}
}

// enddesign

// design: go-start  implements: req-version-mgmt
// Version ops: `quack start <id> [--plan] [motivation]` activates a version (writes iteration.md,
// points config at it) or, with --plan, registers a future one. Ids are i_NNNN_name; only start mints
// versions. Rejects an id starting with '-' (the help-flag bug).
func setConfigVersion(vid string) {
	p := filepath.Join(QUACK, "config.toml")
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
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))
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
func cmdNote(args []string) {
	text := ""
	origin := "commandline"
	for i := 0; i < len(args); i++ {
		if args[i] == "--origin" && i+1 < len(args) {
			origin = args[i+1]
			i++
		} else if !strings.HasPrefix(args[i], "--") && text == "" {
			text = args[i]
		}
	}
	if text == "" {
		fmt.Println("usage: " + brand() + " note \"...\" [--origin X]")
		return
	}
	ts := time.Now().Format("20060102-150405")
	slug := regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(strings.ToLower(text), "-")
	if len(slug) > 32 {
		slug = slug[:32]
	}
	slug = strings.Trim(slug, "-")
	nid := "NOTE-" + ts + "-" + slug
	dir := filepath.Join(NOTES, "inbox")
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
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))
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
	dest := filepath.Join(QUACK, "gather", ver)
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
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))
	dest := filepath.Join(QUACK, "out")
	os.MkdirAll(dest, 0o755)
	zp := filepath.Join(dest, brand()+"-"+cfg.Version+".zip")
	f, err := os.Create(zp)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ship error:", err)
		os.Exit(1)
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
	out := filepath.Join(QUACK, "engine", brand()+".exe")
	os.MkdirAll(filepath.Dir(out), 0o755)
	cmd := exec.Command("go", "build", "-o", out, ".")
	cmd.Dir = src
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "build error:", err, "(need the Go toolchain — see dependencies.md)")
		os.Exit(1)
	}
	root := MerkleRoot(LoadAll())
	gp := filepath.Join(QUACK, "engine", "golden-root.txt")
	os.WriteFile(gp, []byte(root+"\n"), 0o644)
	rel, _ := filepath.Rel(ROOT, out)
	fmt.Println("built ->", filepath.ToSlash(rel), "| golden re-baselined to", root[:12])
}

// enddesign

// design: go-start-init  implements: req-integrate, req-vehicle-scaffold, req-claude-vendor
// `quack start init <target>` is run FROM a quackitect checkout and sets up a NEW vehicle at <target>:
// it vendors the engine (this repo's product/ -> the vehicle's .quack/vendor/, mirroring the layout, so
// EngineDir/EngineSrc resolve it), writes the config + launcher + an AGENTS pointer, and lays down the
// vehicle's own empty product/ + spec/. It deliberately does NOT mint an iteration or write any spec —
// the human drives that. Only meaningful from a quackitect checkout (where product/quackitect exists).
func cmdStartInit(args []string) {
	src := filepath.Join(ROOT, "product")
	if st, err := os.Stat(filepath.Join(src, "quackitect", "method")); err != nil || !st.IsDir() {
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
	if _, err := os.Stat(filepath.Join(target, ".quack", "vendor")); err == nil {
		fmt.Println("refusing: " + target + " already has .quack/vendor (already a vehicle).")
		return
	}

	// 1. vendor the engine: product/ -> <target>/.quack/vendor/ (engine-go + quackitect resources).
	vendor := filepath.Join(target, ".quack", "vendor")
	if err := copyTree(src, vendor); err != nil {
		fmt.Println("vendor error:", err)
		return
	}
	// the vehicle is branded after its directory name — its launcher and binary take that name, so
	// nothing user-facing says "quack". The engine self-identifies from the invoked name (see brand()).
	proj := filepath.Base(target)
	exe := proj + ".exe" // the vendored binary's name in this vehicle

	// 2. best-effort: copy the already-built binary, named after the project, so it runs immediately.
	binDir := filepath.Join(target, ".quack", "engine")
	os.MkdirAll(binDir, 0o755)
	if raw, err := os.ReadFile(filepath.Join(QUACK, "engine", "quack.exe")); err == nil {
		os.WriteFile(filepath.Join(binDir, exe), raw, 0o755)
	}
	// 3. config, launcher (project-named), AGENTS, the vehicle's own EMPTY product/ + spec/, gitignore.
	os.MkdirAll(filepath.Join(target, "product"), 0o755)
	os.MkdirAll(filepath.Join(target, "spec"), 0o755)
	// seed the vehicle's brand from the engine's generic design-language templates (placeholders +
	// generic voice/palette). The vehicle replaces these by name; the design-language spec stays in the engine.
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
	os.MkdirAll(filepath.Join(target, ".quack", "overlay"), 0o755)
	writeIfAbsent(filepath.Join(target, ".quack", "config.toml"),
		"# iteration breadcrumb — type/rigor/version for this project\n[iteration]\ntype    = \"default\"\nrigor   = \"systematic\"\nversion = \"\"\n")
	writeIfAbsent(filepath.Join(target, proj+".cmd"),
		"@echo off\r\nrem "+proj+" launcher: forwards to the vendored engine binary.\r\nrem Rebuild if missing: cd .quack\\vendor\\engine-go ^&^& go build -o ..\\..\\engine\\"+exe+" .\r\n\"%~dp0.quack\\engine\\"+exe+"\" %*\r\n")
	writeIfAbsent(filepath.Join(target, "AGENTS.md"),
		"# AGENTS.md — "+proj+"\n"+
			proj+" is built with a vendored engine (under .quack/). Drive it with `.\\"+proj+" <cmd>`\n"+
			"(status | next | start | bless | gather | report | lint | ship | selftest).\n"+
			"To author the spec, load the method prompts under `.quack/vendor/quackitect/method/prompts/`\n"+
			"(start with integrate.md, then engage.md). `product/` and `spec/` are "+proj+"'s own — your tool.\n"+
			"The human adjudicates gates; never bless on their behalf.\n")
	writeIfAbsent(filepath.Join(target, ".gitignore"),
		"# built binary + caches — rebuildable, not the source of truth\n.quack/engine/\n.quack/evidence/\n.quack/out/\n.quack/gather/\n.quack/state.json\n.quack/index*\n.quack/vendor/engine-go/.gotmp/\n.quack/vendor/engine-go/*.exe\n# commit .quack/vendor/ — it IS this project's engine.\n")

	// 4. vendor the .claude slash commands (/engage, /note, /review) so the agent drives the vehicle
	//    the same way. Rewrite the dogfood method path to the vendored one so the pointers resolve.
	claudeSrc := filepath.Join(ROOT, ".claude")
	rewrite := rewriteVendorPath
	if cmds := filepath.Join(claudeSrc, "commands"); dirExists(cmds) {
		filepath.Walk(cmds, func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() || !strings.HasSuffix(p, ".md") {
				return nil
			}
			if raw, e := os.ReadFile(p); e == nil {
				rel, _ := filepath.Rel(claudeSrc, p)
				writeIfAbsent(filepath.Join(target, ".claude", rel), rewrite(string(raw)))
			}
			return nil
		})
		if raw, err := os.ReadFile(filepath.Join(claudeSrc, "settings.json")); err == nil {
			writeIfAbsent(filepath.Join(target, ".claude", "settings.json"), rewrite(string(raw)))
		}
	}

	fmt.Println(proj + " scaffolded -> " + target)
	fmt.Println("  vendored the engine -> .quack/vendor/ ; .claude/ commands ; wrote config.toml, " + proj + ".cmd, AGENTS.md, empty product/ + spec/.")
	fmt.Println("  next: cd into it, rebuild (cd .quack/vendor/engine-go && go build -o ../../engine/" + exe + " .),")
	fmt.Println("        set [iteration].version, then `." + string(filepath.Separator) + proj + " start <version>` and compose your spec.")
}

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
	return strings.ReplaceAll(s, "product/quackitect/", ".quack/vendor/quackitect/")
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
func metricsReport() map[string][2]int {
	nodes := LoadAll()
	gates := map[string]bool{}
	for id, n := range nodes {
		if isGate(n) {
			gates[id] = true
		}
	}
	var blesses []Event
	for _, e := range attestEvents() {
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
