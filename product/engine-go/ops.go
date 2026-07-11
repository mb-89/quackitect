package main

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
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
		// the wave filter (go-cone-triage): a wave touches
		// SUSPECT gates only. OPEN gates are refused by name - their first
		// adjudication is their own walk (individual `bless <id>` stays legal).
		var refusedOpen []string
		ids, refusedOpen = waveBlessSelect(nodes, StatusMap(nodes))
		refuseOpenGates(refusedOpen)
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
	// first-wins across lanes (req-ask-loop.7): the pairing read and the feedback
	// print stay HERE at the command surface; the resolution rule lives inward.
	if _, paired := loadPairConfig(); paired {
		if n := blessResolvesAsks(ids); n > 0 {
			fmt.Println("mobile ask(s) superseded by the console answer:", n)
		}
	}
	// trigger (go-report-live-reload): refresh the report after a killer or milestone bless so the
	// board — and any open --watch page — reflects the adjudication. DETACHED
	// (bless never waits on a render) — a fire-and-forget self-exec carries the render.
	for _, nid := range ids {
		if n, ok := nodes[nid]; ok && (n.Killer || n.Milestone > 0) {
			if exe, err := os.Executable(); err == nil {
				c := exec.Command(exe, "report", "--no-open", "--out", filepath.Join(dataDirFor("out"), "report.html"))
				if c.Start() == nil {
					fmt.Println("report refresh started (background)")
				}
			}
			break
		}
	}
}

// enddesign

// design: go-tests-red  implements: req-impl-fragment-tdd.2
// tests-red enforces test-first: `observe-red <test>` RUNS the test and records that it was seen
// FAILING at its CURRENT full-hash — a run-once attestation on the Event log, mirroring a bless.
// The tool enforces the observation: a passing test is REFUSED, so a fabricated
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
		if args[i] == "--refresh" {
			continue
		}
		id = args[i]
		break
	}
	// --refresh: an amended, still-failing test re-attests at its NEW hash (go-observe-red-refresh)
	if hasFlag(args, "--refresh") {
		ev, err := refreshRed(nodes, id)
		if err != nil {
			fmt.Println(err.Error())
			quackExit(1)
		}
		saveEvents(append(attestEvents(), ev))
		fmt.Println("red-refreshed", id, "@", ev.Hash[:8])
		return
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
// One-file-per-note capture, recording provenance (origin, timestamp, status). The capture
// POLICY: the notes home resolution rides here; the file lane itself is go-notes-out.
func notesHome() string { return dataDirFor("notes") }

// enddesign

// design: go-notes-out  implements: req-note-capture-lane.2, req-note-capture-lane.1
// Notes live OUTSIDE the repository (adr-no-quack-data-home): the capture lane writes beneath the
// workspace's notes home in the user data dir — raw notes carry personal data and never belong in a
// published checkout. The lane is the ONLY minting path (adr-deterministic-mint): a multi-line body
// arrives via --file <path> or --file - (stdin), so the note skill CALLS the engine instead of
// hand-writing files; id, timestamp, slug and frontmatter stay engine-stamped.
func cmdNote(args []string) {
	// the read-back lane: a commented copy lists as note candidates (go-file2list)
	for i := 0; i < len(args); i++ {
		if args[i] == "--file2list" && i+1 < len(args) {
			out, err := file2list(args[i+1])
			if err != nil {
				fmt.Fprintln(os.Stderr, "note:", err)
				quackExit(1)
			}
			fmt.Print(out)
			return
		}
	}
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
		fmt.Println("usage: " + brand() + " note \"...\" | note --file <path|-> [--origin X] | note --file2list <copy.html>")
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
	// a colliding capture takes the next free suffix; the id follows the file (go-note-dedup)
	path := dedupNotePath(dir, nid)
	nid = strings.TrimSuffix(filepath.Base(path), ".md")
	body := "---\nid: " + nid + "\ncreated: " + time.Now().Format(time.RFC3339) +
		"\norigin: " + origin + "\nstatus: inbox\n---\n\n" + text + "\n"
	os.WriteFile(path, []byte(body), 0o644)
	fmt.Println("captured", filepath.Base(path))
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
// ship packages product/ into a versioned zip under the data home's out/. The zip is
// ephemeral output. The BOOK and the REPORT regenerate at ship and ride the ZIP
// ROOT - a recipient opens the deliverable and the two reading
// surfaces sit on top; every published book copy (spec/book.html + the Pages copy
// docs/book.html, same bytes) refreshes in the same move, so the
// drift lint is green at the shipped state. This works in ANY workspace, not just the dogfood repo.
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
	nodes := LoadAll()
	if html, findings, _ := renderBookHTML(nodes); len(findings) == 0 {
		if err := writeBookCopies(html, publishedBookPaths()); err != nil {
			fmt.Fprintln(os.Stderr, "ship: book copy failed -", err)
		}
		w, _ := zw.Create("book.html")
		io.Copy(w, strings.NewReader(html))
	} else {
		fmt.Fprintln(os.Stderr, "ship: the book has findings and was NOT packaged - run quack report book")
	}
	rp := filepath.Join(dest, "report.html")
	if err := RenderReport(rp); err == nil {
		if raw, rerr := os.ReadFile(rp); rerr == nil {
			w, _ := zw.Create("report.html")
			io.Copy(w, strings.NewReader(string(raw)))
		}
	}
	zw.Close()
	rel, _ := filepath.Rel(ROOT, zp)
	fmt.Println("shipped ->", filepath.ToSlash(rel), "(book.html + report.html at the zip root)")
}

// writeBookCopies writes ONE rendered book to every published path, byte-identical,
// creating a missing parent folder (docs/) on the way.
func writeBookCopies(html string, paths []string) error {
	for _, p := range paths {
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(p, []byte(html), 0o644); err != nil {
			return err
		}
	}
	return nil
}

// enddesign

// design: go-build  implements: req-gate-eval-integrity.3
// quack build compiles the engine from its source (EngineSrc: vendored, else dogfood) to
// .quack/engine/<brand>.exe AND re-baselines the determinism golden in one step — closing the
// stale-golden footgun where a hand-run build forgot to re-baseline and produced false milestone FAILs.
// enddesign

// design: go-build-fast-path  implements: req-build-cheap.1
// A content-only build never pays the compiler: when the source fingerprint (every .go file +
// go.mod, order-stable) matches the one recorded beside the binary, the compile AND the stamp
// rewrite are skipped (the binary did not change) and the existing binary just re-baselines.
// Any engine-source edit changes the fingerprint and builds exactly as before.
func engineSrcFingerprint(src string) string {
	entries, err := os.ReadDir(src)
	if err != nil {
		return ""
	}
	names := []string{}
	for _, e := range entries {
		if !e.IsDir() && (strings.HasSuffix(e.Name(), ".go") || e.Name() == "go.mod") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)
	h := sha256.New()
	for _, n := range names {
		raw, _ := os.ReadFile(filepath.Join(src, n))
		fmt.Fprintf(h, "%s\x00%d\x00", n, len(raw))
		h.Write(raw)
	}
	return hex.EncodeToString(h.Sum(nil))
}

// enddesign

func cmdBuild(args []string) {
	src := EngineSrc()
	out := globalBinPath() // the canonical home (go-global-ratchet); one binary serves every workspace
	os.MkdirAll(filepath.Dir(out), 0o755)
	// design: go-build-fast-skip  implements: req-build-cheap.1
	// the skip decision: fingerprint unchanged + binary present -> re-baseline only.
	fpFile := out + ".srchash"
	fp := engineSrcFingerprint(src)
	if prev, err := os.ReadFile(fpFile); err == nil && fp != "" && strings.TrimSpace(string(prev)) == fp {
		if _, err := os.Stat(out); err == nil {
			if _, err := os.Stat(out + ".staged"); err != nil { // never skip past a pending swap
				// the pointer beside the binary names THIS repo as the live engine home
				// (req-vendor-workspace.5: external workspaces resolve resources from it)
				if err := recordEngineHome(ENGINE); err != nil {
					fmt.Fprintln(os.Stderr, "build: engine-home record failed —", err)
				}
				root := buildRebaseline(out)
				fmt.Println("compile skipped (source unchanged) | golden re-baselined to", root[:12])
				return
			}
		}
	}
	// enddesign
	// the analysis gate (go-build-analysis, adr-go-analysis-stdlib-first): gofmt,
	// vet, and grab-if-present staticcheck must be clean before the compile
	if finds := buildAnalysisFindings(src); len(finds) > 0 {
		for _, f := range finds {
			fmt.Fprintln(os.Stderr, "analysis: "+f)
		}
		fmt.Fprintln(os.Stderr, "build refused:", len(finds), "static-analysis finding(s)")
		quackExit(1)
	}
	stamp := time.Now().Format(time.RFC3339)
	os.WriteFile(stampFile(src), []byte(stamp+"\n"), 0o644) // committed build-time stamp (go-ratchet-stamp)
	staged := out + ".staged"
	// -s -w strips debugger metadata the shipped binary never uses (panic traces
	// survive); it cuts the exe ~27%, and with it the per-launch AV scan surface.
	cmd := exec.Command("go", "build", "-ldflags", "-s -w", "-o", staged, ".")
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
	os.WriteFile(fpFile, []byte(fp+"\n"), 0o644)          // the fingerprint arms the fast path (go-build-fast-skip)
	// the pointer beside the binary names THIS repo as the live engine home
	// (req-vendor-workspace.5): external workspaces resolve resources from it, never a copy
	if err := recordEngineHome(ENGINE); err != nil {
		fmt.Fprintln(os.Stderr, "build: engine-home record failed —", err)
	}
	fresh := out
	if _, err := os.Stat(staged); err == nil {
		fresh = staged // swap blocked: the NEW code lives in the staged file
	}
	root := buildRebaseline(fresh)
	fmt.Println("built ->", filepath.ToSlash(out), "| golden re-baselined to", root[:12])
}

// enddesign

// design: go-authoring-cheap  implements: req-authoring-cheap
// One build restores an honest board. The re-baseline runs in the FRESHLY BUILT binary — never
// only the old process, which refuses spec keys it predates (the self-wedge: a build dies on
// its own new frontmatter key until run twice). And the verdict cache dies with the old baseline:
// a parity FAIL recorded before the re-baseline shares the old binary's buildID and node hash, so
// it would be served as a stale FAIL forever; flushing at re-baseline kills it.
// buildRebaseline computes the root via the fresh exe, writes the golden, flushes verdicts.
func buildRebaseline(freshExe string) string {
	root := ""
	// design: go-rebaseline-inprocess  implements: req-build-cheap.3
	// The self-exec exists for ONE reason: a JUST-COMPILED binary must read the spec, because the
	// old process refuses keys it predates (the self-wedge). When the binary did not change
	// (the fast path), the running process IS the fresh engine — compute in-process, spawn nothing.
	self, _ := os.Executable()
	if si, err1 := os.Stat(self); err1 == nil {
		if fi, err2 := os.Stat(freshExe); err2 == nil && os.SameFile(si, fi) {
			root = MerkleRoot(LoadAll())
		}
	}
	// enddesign
	if root == "" {
		if outBytes, err := exec.Command(freshExe, "root", "--base", ROOT).Output(); err == nil {
			root = strings.TrimSpace(string(outBytes))
		}
	}
	if len(root) < 12 {
		root = MerkleRoot(LoadAll()) // fallback: the running process (a malformed graph still fails loudly here)
	}
	os.WriteFile(goldenRootPath(), []byte(root+"\n"), 0o644)
	// design: go-verdict-surgical  implements: req-build-cheap.2
	// Surgical, not wholesale: green verdicts survive the re-baseline — they stay self-validating
	// on (input hash, buildID) and can only go stale through a change those keys already catch.
	// Red verdicts die here: a FAIL recorded against the OLD golden shares input+build after a
	// content-only re-baseline and would be served forever (the stale-FAIL wedge).
	kept := map[string]verdictRec{}
	for k, v := range verdictLoad() {
		if v.Result {
			kept[k] = v
		}
	}
	if b, err := json.MarshalIndent(kept, "", " "); err == nil {
		os.WriteFile(verdictPath(), b, 0o644)
	}
	verdictsMemo = nil
	// enddesign
	return root
}

// enddesign

// design: go-start-init  implements: req-engine-vehicle-overlay.3, req-vendor-workspace.2, req-vendor-workspace.1, req-scaffold-modern
// `quack start init <target>` is run FROM a quackitect checkout and sets up a NEW vehicle at <target>
// in the CURRENT world (adr-no-quack-data-home, adr-entry-chain, adr-ratchet-stamp):
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
	// 4. launcher + the pointer-chain entry files + README + gitignore.
	writeIfAbsent(filepath.Join(target, proj+".cmd"), strings.ReplaceAll(sub(vehicleLauncherTmpl), "\n", "\r\n"))
	writeIfAbsent(filepath.Join(target, "README.md"), projectReadme(proj, target))
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
	fmt.Println("  vendored the engine -> tools/vendor/ ; wrote spec/project.toml, " + proj + ".cmd, README.md, the entry chain (CLAUDE.md -> AGENTS.md -> contract), .claude/ commands, empty product/.")
	fmt.Println("  next: cd into it and run `.\\" + proj + " status` — the launcher bootstraps the global binary when absent.")
	fmt.Println("        Then set [iteration].version and `.\\" + proj + " start <version>` to compose your spec.")
}

// enddesign

// --- drive-from-inside stubs: make a bare workspace drivable from within, engine linked at runtime ---

// design: go-inside-launcher  implements: req-workspace-stubs.4, req-workspace-stubs.2
// The committed root launcher for a bare workspace. It resolves an engine at runtime — the global
// binary, then the env var — and forwards; with neither present it fails clearly. No engine binary
// and no engine path is ever committed, so a clone carries no machine-local state (no .quack
// internal/pointer lanes - adr-retire-legacy-lanes).
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

// design: go-inside-agents  implements: req-workspace-stubs.3
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
// The stub CLAUDE.md pointer: Claude Code auto-loads CLAUDE.md only, so a bare
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
		proj + ".cmd":                         strings.ReplaceAll(sub(insideLauncherTmpl), "\n", "\r\n"),
		"AGENTS.md":                           sub(insideAgentsTmpl),
		"CLAUDE.md":                           sub(insideClaudeTmpl),
		filepath.Join("spec", "project.toml"): "# the workspace root marker + iteration breadcrumb (adr-no-quack-data-home).\n[iteration]\ntype    = \"default\"\nrigor   = \"systematic\"\nversion = \"\"\n",
	}
}

// design: go-migrate-layout  implements: req-migrate-layout
// The layout determinizer: the spec MIRRORS the template.
// New workspaces seed the mirrored layout through start stubs; an EXISTING workspace
// converts through this one-shot - manifests (man-*, SPEC-README) to the spec root,
// stakeholders/usecases/raid notes to their item homes. Needs, criteria, and
// rationales stay in spec/trace (their template home). Idempotent; an existing
// destination is KEPT and warned about, never overwritten. Engine-resident on
// purpose: migrations are determinizers in the one zero-dependency binary, never
// shell scripts beside it.
func migrateLayout(spec string) (int, error) {
	trace := filepath.Join(spec, "trace")
	ents, err := os.ReadDir(trace)
	if err != nil {
		if os.IsNotExist(err) {
			return 0, nil
		}
		return 0, err
	}
	dest := func(name string) string {
		switch {
		case strings.HasPrefix(name, "man-") || name == "SPEC-README.md":
			return spec
		case strings.HasPrefix(name, "stk-"):
			return filepath.Join(spec, "stakeholders")
		case strings.HasPrefix(name, "uc-"):
			return filepath.Join(spec, "usecases")
		case strings.HasPrefix(name, "raid-"):
			return filepath.Join(spec, "raid")
		}
		return "" // needs, criteria, rationales, and everything else stay put
	}
	moved := 0
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		d := dest(e.Name())
		if d == "" {
			continue
		}
		dst := filepath.Join(d, e.Name())
		if _, serr := os.Stat(dst); serr == nil {
			fmt.Println("kept both, resolve by hand:", dst, "already exists")
			continue
		}
		if merr := os.MkdirAll(d, 0o755); merr != nil {
			return moved, merr
		}
		if rerr := os.Rename(filepath.Join(trace, e.Name()), dst); rerr != nil {
			return moved, rerr
		}
		fmt.Println("moved " + e.Name() + " -> " + filepath.Base(d))
		moved++
	}
	return moved, nil
}

func cmdMigrateLayout() {
	n, err := migrateLayout(SPEC)
	if err != nil {
		fmt.Fprintln(os.Stderr, "migrate-layout:", err)
		quackExit(1)
	}
	fmt.Printf("migrate-layout: %d file(s) moved\n", n)
}

// enddesign

// design: go-init-stubs  implements: req-workspace-stubs.1
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
	// the project README rides every scaffold: name, one orienting line, further reading.
	writeIfAbsent(filepath.Join(target, "README.md"), projectReadme(proj, target))
	// design: go-stub-spec  implements: req-stub-templates.2, req-stub-templates.1, req-template-home.8
	// The instantiation path: the spec MIRRORS the template -
	// top-level files land at the spec ROOT (README renamed SPEC-README), and EVERY
	// template subfolder mirrored 1:1 under spec/ (queries, references, fundamentals, the
	// global item homes with their ex- example notes, the connections kinds). Existing
	// files are KEPT - a second run refuses to overwrite.
	tplDir := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	if ents, err := os.ReadDir(tplDir); err == nil {
		for _, e := range ents {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
				continue
			}
			raw, rerr := os.ReadFile(filepath.Join(tplDir, e.Name()))
			if rerr != nil {
				continue
			}
			dst := filepath.Join(target, "spec", e.Name())
			if e.Name() == "README.md" {
				dst = filepath.Join(target, "spec", "SPEC-README.md")
			}
			writeIfAbsent(dst, string(raw))
		}
	}
	var stubTree func(src, dst string)
	stubTree = func(src, dst string) {
		ents, err := os.ReadDir(src)
		if err != nil {
			return
		}
		for _, e := range ents {
			if e.IsDir() {
				stubTree(filepath.Join(src, e.Name()), filepath.Join(dst, e.Name()))
				continue
			}
			raw, rerr := os.ReadFile(filepath.Join(src, e.Name()))
			if rerr != nil {
				continue
			}
			writeIfAbsent(filepath.Join(dst, e.Name()), string(raw))
		}
	}
	if ents, err := os.ReadDir(tplDir); err == nil {
		for _, e := range ents {
			if e.IsDir() {
				stubTree(filepath.Join(tplDir, e.Name()), filepath.Join(target, "spec", e.Name()))
			}
		}
	}
	// enddesign
	fmt.Println("stubs -> " + target)
	fmt.Println("  wrote " + proj + ".cmd, README.md, AGENTS.md, CLAUDE.md, spec/project.toml (kept any existing).")
	fmt.Println("  wrote the spec template skeleton (the spec root + every template folder; kept any existing).")
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

// --- the further-reading seam: every scaffolded project READMEs its book ---

// pagesBookURL derives the GitHub Pages URL of the published book from a git remote URL.
// It accepts the github.com forms - https://github.com/owner/repo[.git],
// git@github.com:owner/repo[.git], ssh://git@github.com/owner/repo[.git] - and returns
// https://<owner>.github.io/<repo>/book.html. Any other shape returns ok=false.
func pagesBookURL(remote string) (string, bool) {
	r := strings.TrimSpace(remote)
	var rest string
	switch {
	case strings.HasPrefix(r, "https://github.com/"):
		rest = strings.TrimPrefix(r, "https://github.com/")
	case strings.HasPrefix(r, "http://github.com/"):
		rest = strings.TrimPrefix(r, "http://github.com/")
	case strings.HasPrefix(r, "git@github.com:"):
		rest = strings.TrimPrefix(r, "git@github.com:")
	case strings.HasPrefix(r, "ssh://git@github.com/"):
		rest = strings.TrimPrefix(r, "ssh://git@github.com/")
	default:
		return "", false
	}
	rest = strings.TrimSuffix(rest, "/")
	rest = strings.TrimSuffix(rest, ".git")
	parts := strings.Split(rest, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", false
	}
	return "https://" + parts[0] + ".github.io/" + parts[1] + "/book.html", true
}

// originRemoteURL reads the origin remote URL from dir's .git/config, without running
// git. A worktree's .git FILE (`gitdir: <path>`) is followed one hop. No readable
// origin remote returns "".
func originRemoteURL(dir string) string {
	gitPath := filepath.Join(dir, ".git")
	cfg := filepath.Join(gitPath, "config")
	if st, err := os.Stat(gitPath); err == nil && !st.IsDir() {
		raw, rerr := os.ReadFile(gitPath)
		if rerr != nil {
			return ""
		}
		first := strings.SplitN(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n", 2)[0]
		if !strings.HasPrefix(strings.TrimSpace(first), "gitdir:") {
			return ""
		}
		gd := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(first), "gitdir:"))
		if !filepath.IsAbs(gd) {
			gd = filepath.Join(dir, gd)
		}
		cfg = filepath.Join(gd, "config")
	}
	raw, err := os.ReadFile(cfg)
	if err != nil {
		return ""
	}
	inOrigin := false
	for _, ln := range strings.Split(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\n") {
		t := strings.TrimSpace(ln)
		if strings.HasPrefix(t, "[") {
			inOrigin = t == `[remote "origin"]`
			continue
		}
		if inOrigin && strings.HasPrefix(t, "url") {
			if i := strings.Index(t, "="); i >= 0 {
				return strings.TrimSpace(t[i+1:])
			}
		}
	}
	return ""
}

// furtherReadingSection builds a README's further-reading block: the relative
// spec/book.html link plus the rendered GitHub Pages link. The Pages link derives
// from target's git origin remote; without one, a marked placeholder stands in.
func furtherReadingSection(target string) string {
	pages := "- Rendered book: no git origin remote found yet. Once the project is on GitHub, the link is `https://<owner>.github.io/<repo>/book.html`. The owner enables Pages: Settings > Pages > branch main, folder `/docs`."
	if url, ok := pagesBookURL(originRemoteURL(target)); ok {
		pages = "- [Read the book in the browser](" + url + ") - it renders without cloning. The owner enables Pages once: Settings > Pages > branch main, folder `/docs`."
	}
	return "## Further reading\n\n" +
		"- [The book](spec/book.html) - the whole spec as one page. Works locally and as a file view on GitHub.\n" +
		pages + "\n"
}

// projectReadme is the scaffolded README: the project's name, one orienting line, and
// the further-reading block that links the book (every quackitect project carries both).
func projectReadme(proj, target string) string {
	return "# " + proj + "\n\n" +
		"A quackitect project. The spec is the product's memory: requirements, designs, decisions, and their verification, rendered as one book.\n\n" +
		furtherReadingSection(target)
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

// design: go-metrics-removed  implements: req-metrics-removed
// The attest-log ratio metrics (go-metrics) are removed: never consulted
// (the veto decision records the testimony).
// A removal's design IS its tombstone: this region marks where the computation
// lived, the report cards died with it, and git history is the archive.
// enddesign

// design: go-stamp-user  implements: req-stamp-user
// The ledger says `user` (adr-actor-user-migration). New records write user (resolveActor);
// `quack migrate-actors` rewrites historical human stamps to user in ONE audited pass — the
// migration event records the count and timestamp, bless hashes and the prev_hash chain stay
// untouched, and a second run is a no-op. Readers treat human and user as one value forever
// (normActor, beside resolveActor in go-actor-channels), so an unmigrated clone still computes.

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

// enddesign

// cmdMigrateActors is the console shell over migrateActorsFrom: load, rewrite, report.
func cmdMigrateActors() {
	events, n := migrateActorsFrom(attestEvents(), time.Now().Format(time.RFC3339))
	if n == 0 {
		fmt.Println("migrate-actors: nothing to migrate — the ledger already says user")
		return
	}
	saveEvents(events)
	fmt.Printf("migrate-actors: %d event(s) rewritten human -> user, audited in the ledger\n", n)
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
