package main

// i13_red.go — the i0013_comments RED battery: tests first, stubs compile-but-fail.
// Each case carries its trace line: test-<id> -> selftest:<name>.

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// i13Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i13Tests = []namedTest{
	{"comment-island", selftestCommentIsland},
	{"comment-suggest", selftestCommentSuggest},
	{"comment-privacy", selftestCommentPrivacy},
	{"comment-readback", selftestCommentReadback},
	{"comment-premark", selftestCommentPremark},
	{"comment-escape", selftestCommentEscape},
	{"comment-dom-static", selftestCommentDomStatic},
	{"note-collision", selftestNoteCollision},
	{"mint-edge-mode", selftestMintEdgeMode},
	{"prose-marks-comments", selftestProseMarksComments},
	{"orphan-render-refs", selftestOrphanRenderRefs},
	{"conn-code-designs", selftestConnCodeDesigns},
	{"launcher-single-dispatch", selftestLauncherSingleDispatch},
	{"build-fast-path", selftestBuildFastPath},
	{"verdict-surgical", selftestVerdictSurgical},
	{"calls-summary", selftestCallsSummary},
	{"selftest-home-sweep", selftestSelftestHomeSweep},
	{"log-retention", selftestLogRetention},
	{"observe-red-refresh", selftestObserveRedRefresh},
}

// ---------- stub seams (implemented during the i13 build; stubs FAIL) ----------

// design: go-annotator-static-checks  implements: req-comment-layer.3
// bookAnnotatorFindings statically checks the emitted book: exactly one island slot and the
// annotator script, BOTH outside the content region; no markup injection anywhere in the
// layer's source. Empty findings = the layer holds the dom-static and escape rules.
func bookAnnotatorFindings() []string {
	// renderBookHTML computes StatusMap, whose coverage evaluation runs THIS test again —
	// the same self-recursion class statusFastBusy guards (an unguarded run
	// balloons to 10 GB, one book render per recursion lap). The
	// shared memo carries the guard: a nested probe reads ("", false) and reports
	// vacuously clean; the outer run decides.
	html, live := bookOnceHTML()
	if !live {
		return nil
	}
	var f []string
	if strings.Count(html, `id="quack-comments"`) != 1 {
		f = append(f, "island slot: want exactly one")
	}
	mainStart := strings.Index(html, "<main")
	mainEnd := strings.Index(html, "</main>")
	if mainStart < 0 || mainEnd < mainStart {
		return append(f, "no main content region")
	}
	content := html[mainStart:mainEnd]
	// artifact SIGNATURES, not vocabulary: design statements rendered in the reading flow
	// may legitimately NAME the island and the script (they document the layer).
	if strings.Contains(content, `id="quack-comments"`) || strings.Contains(content, "/* quack-annotator") {
		f = append(f, "comment-layer artifacts inside the content region")
	}
	tail := html[mainEnd:]
	i := strings.Index(tail, "quack-annotator")
	if i < 0 {
		return append(f, "annotator script missing")
	}
	src := tail[i:]
	if j := strings.Index(src, "</script>"); j >= 0 {
		src = src[:j]
	}
	if strings.Contains(src, ".innerHTML") || strings.Contains(src, "document.write") {
		f = append(f, "the annotator injects markup - comment text renders via textContent only")
	}
	return f
}

// enddesign

// design: go-note-dedup  implements: req-note-collision
// dedupNotePath returns a non-colliding path for a note capture: the plain name when free,
// else -2, -3, … — a same-second, same-prefix capture never overwrites an earlier note
// (a note was LOST live at the i13 retro; silent overwrite is the one unforgivable failure
// of a capture lane).
func dedupNotePath(dir, base string) string {
	p := filepath.Join(dir, base+".md")
	if _, err := os.Stat(p); err != nil {
		return p
	}
	for i := 2; ; i++ {
		p = filepath.Join(dir, fmt.Sprintf("%s-%d.md", base, i))
		if _, err := os.Stat(p); err != nil {
			return p
		}
	}
}

// enddesign

// design: go-home-sweep  implements: req-selftest-home-sweep
// sweepOrphanHomes removes data homes whose recorded workspace no longer exists (fixture
// leftovers). A markerless home is removed only when it holds NO file at all — a real
// pre-marker home always has content and is never touched. The live home is always kept.
func sweepOrphanHomes() int {
	base := filepath.Join(userDataBase(), "quackitect")
	ents, err := os.ReadDir(base)
	if err != nil {
		return 0
	}
	live := dataHome()
	removed := 0
	for _, e := range ents {
		if !e.IsDir() || e.Name() == "bin" {
			continue
		}
		home := filepath.Join(base, e.Name())
		if home == live {
			continue
		}
		if raw, err := os.ReadFile(filepath.Join(home, "workspace.txt")); err == nil {
			ws := strings.TrimSpace(string(raw))
			if _, err := os.Stat(ws); err == nil {
				continue // the workspace lives; so does its home
			}
		} else {
			hasFile := false
			filepath.Walk(home, func(p string, info os.FileInfo, werr error) error {
				if werr == nil && info != nil && !info.IsDir() {
					hasFile = true
				}
				return nil
			})
			if hasFile {
				continue // markerless with content: never touch
			}
		}
		if os.RemoveAll(home) == nil {
			removed++
		}
	}
	return removed
}

// enddesign

// design: go-call-log-cap  implements: req-call-log-lifecycle.2
// capCallLog trims the call log to capBytes, dropping the OLDEST lines. Retention stays
// retro-bound (adr-call-log deletes at every retro); the cap is the safety net for the case
// the retro never comes — the real project's logs dir had grown to 122 MB before i13.
const callLogCapBytes = 8 << 20 // ~50k calls; one retro cycle fits with room to spare

func capCallLog(path string, capBytes int64) {
	st, err := os.Stat(path)
	if err != nil || st.Size() <= capBytes {
		return
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return
	}
	lines := strings.Split(strings.TrimRight(string(raw), "\n"), "\n")
	size, keepFrom := int64(0), len(lines)
	for i := len(lines) - 1; i >= 0; i-- {
		size += int64(len(lines[i]) + 1)
		if size > capBytes {
			break
		}
		keepFrom = i
	}
	os.WriteFile(path, []byte(strings.Join(lines[keepFrom:], "\n")+"\n"), 0o644)
}

// enddesign

// design: go-observe-red-refresh  implements: req-observe-red-refresh
// refreshRed builds the re-observation event for an AMENDED, still-failing test: the original
// red was watched at the old hash; amending the statement moved the hash and stranded the record
// (the i12 method lead). The refresh re-runs the test and re-attests at the CURRENT hash — a
// passing test errors, exactly like a first observation: no fabricated red enters the ledger.
// The caller (observe-red --refresh) appends the event; this seam never writes the log itself.
func refreshRed(nodes map[string]Node, id string) (Event, error) {
	n, ok := nodes[id]
	if !ok {
		return Event{}, fmt.Errorf("no such check: %s", id)
	}
	if strings.HasPrefix(n.Verify, "selftest:") {
		if runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):])) {
			return Event{}, fmt.Errorf("refused: %s passes — nothing red to refresh", id)
		}
	}
	h := fullHash(id, nodes, map[string]string{})
	return Event{Check: id, Action: "red-observed", Actor: "tester",
		TS: time.Now().Format(time.RFC3339), Hash: h, StatementHash: stmtHash(n)}, nil
}

// enddesign

// ---------- fixtures ----------

// i13FixtureCopy writes a minimal commented book copy and returns its path.
func i13FixtureCopy(dir string, extraAnn string) string {
	ann := `{"id":"c1","target":{"unit":"man-ch1-u1","quote":"the goal","prefix":"state ","suffix":" here"},"author":"Alice","status":"open","thread":[{"author":"Alice","mark":"neutral","text":"unclear sentence"},{"author":"Bob","mark":"agree","text":"yes"}]}`
	if extraAnn != "" {
		ann += "," + extraAnn
	}
	html := `<!doctype html><html><head><title>fixture</title></head><body><main><h1 id="man-ch1-u1">state the goal here</h1></main>` +
		`<script type="application/json" id="quack-comments">{"version":1,"annotations":[` + ann + `]}</script></body></html>`
	p := filepath.Join(dir, "copy.html")
	os.WriteFile(p, []byte(html), 0o644)
	return p
}

// i13StubWS creates a stub workspace and returns its path.
func i13StubWS(prefix string) string {
	dir, _ := os.MkdirTemp("", prefix)
	cmdStartStubs([]string{dir})
	return dir
}

// i13Exec runs the current binary against a base workspace and returns combined output + exit code.
func i13Exec(base string, args ...string) (string, int) {
	full := append([]string{"--base", base}, args...)
	cmd := exec.Command(os.Args[0], full...)
	var buf bytes.Buffer
	cmd.Stdout, cmd.Stderr = &buf, &buf
	err := cmd.Run()
	code := 0
	if ee, ok := err.(*exec.ExitError); ok {
		code = ee.ExitCode()
	} else if err != nil {
		code = -1
	}
	return buf.String(), code
}

// ---------- comment family ----------

// test-comment-island -> selftest:comment-island
func selftestCommentIsland() bool {
	dir, _ := os.MkdirTemp("", "q13isl")
	defer os.RemoveAll(dir)
	p := i13FixtureCopy(dir, "")
	out, err := file2list(p)
	if err != nil || !strings.Contains(out, "c1") || !strings.Contains(out, "man-ch1-u1") {
		return false // the island parses and the entry is listed
	}
	// two islands are a malformed copy: refused, never guessed
	raw, _ := os.ReadFile(p)
	twice := strings.Replace(string(raw), "</body>", `<script type="application/json" id="quack-comments">{}</script></body>`, 1)
	p2 := filepath.Join(dir, "twice.html")
	os.WriteFile(p2, []byte(twice), 0o644)
	if _, err := file2list(p2); err == nil {
		return false
	}
	return true
}

// test-comment-suggest -> selftest:comment-suggest
func selftestCommentSuggest() bool {
	dir, _ := os.MkdirTemp("", "q13sug")
	defer os.RemoveAll(dir)
	extra := `{"id":"c2","target":{"unit":"man-ch1-u1","quote":"the goal"},"author":"Bob","status":"open","suggest":{"original":"the goal","proposed":"the objective"},"thread":[]}`
	p := i13FixtureCopy(dir, extra)
	out, err := file2list(p)
	return err == nil && strings.Contains(out, "the objective") && strings.Contains(out, "suggest")
}

// test-comment-privacy -> selftest:comment-privacy
func selftestCommentPrivacy() bool {
	dir, _ := os.MkdirTemp("", "q13prv")
	defer os.RemoveAll(dir)
	p := i13FixtureCopy(dir, "")
	out, err := file2list(p)
	if err != nil {
		return false
	}
	return strings.Contains(out, "reader") && !strings.Contains(out, "Alice") && !strings.Contains(out, "Bob")
}

// test-comment-readback -> selftest:comment-readback
func selftestCommentReadback() bool {
	dir, _ := os.MkdirTemp("", "q13rdb")
	defer os.RemoveAll(dir)
	p := i13FixtureCopy(dir, "")
	a, err1 := file2list(p)
	b, err2 := file2list(p)
	if err1 != nil || err2 != nil || a != b || a == "" {
		return false // byte-identical across runs
	}
	// the listing carries anchor, marks, and status
	return strings.Contains(a, "quote") && strings.Contains(a, "agree") && strings.Contains(a, "open")
}

// test-comment-premark -> selftest:comment-premark
func selftestCommentPremark() bool {
	dir, _ := os.MkdirTemp("", "q13pmk")
	defer os.RemoveAll(dir)
	extra := `{"id":"c3","target":{"unit":"man-ch1-u1"},"author":"","status":"open","thread":[]}`
	p := i13FixtureCopy(dir, extra)
	out, err := file2list(p)
	return err == nil && strings.Contains(out, "c3")
}

// test-comment-escape -> selftest:comment-escape
func selftestCommentEscape() bool {
	payload := []byte(`{"version":1,"annotations":[{"id":"cx","thread":[{"text":"</script><script>alert(1)</script>"}]}]}`)
	out, err := islandSerialize(payload)
	if err != nil || strings.Contains(out, "</script>") {
		return false // the serialized island must never close its own script tag
	}
	var back map[string]any
	if json.Unmarshal([]byte(strings.ReplaceAll(out, `<\/`, `</`)), &back) != nil {
		return false // the escape stays reversible JSON
	}
	return true
}

// test-comment-dom-static -> selftest:comment-dom-static
func selftestCommentDomStatic() bool {
	return len(bookAnnotatorFindings()) == 0
}

// ---------- engine workshop family ----------

// test-note-collision -> selftest:note-collision
func selftestNoteCollision() bool {
	dir, _ := os.MkdirTemp("", "q13col")
	defer os.RemoveAll(dir)
	base := "NOTE-20260707-120000-same-prefix"
	p1 := dedupNotePath(dir, base)
	os.WriteFile(p1, []byte("first"), 0o644)
	p2 := dedupNotePath(dir, base)
	if p1 == p2 {
		return false // the second capture must get a distinct path
	}
	os.WriteFile(p2, []byte("second"), 0o644)
	a, _ := os.ReadFile(p1)
	return string(a) == "first" // the first note survives
}

// test-mint-edge-mode -> selftest:mint-edge-mode
func selftestMintEdgeMode() bool {
	dir, _ := os.MkdirTemp("", "q13mnt")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(sp, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"),
		[]byte("[iteration]\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	p, err := mintNodeAtX(filepath.Join(sp, "trace"), "requirement", "fix",
		map[string]string{"of": "uc-x", "statement": "The system shall fix."})
	if err != nil {
		return false
	}
	// the minted node carries NO frontmatter edge key; the lane carries the edge
	body, _ := os.ReadFile(p)
	if regexp.MustCompile(`(?m)^refines:`).Match(body) {
		return false
	}
	lane, _ := os.ReadFile(filepath.Join(sp, "connections", "refines", "edges.jsonl"))
	if !strings.Contains(string(lane), `"req-fix"`) || !strings.Contains(string(lane), `"uc-x"`) {
		return false
	}
	// a test mints its verifies edge the same way
	tp, err := mintNodeAtX(filepath.Join(sp, "trace"), "test", "fix",
		map[string]string{"of": "req-fix", "statement": "fix is verified"})
	if err != nil {
		return false
	}
	tbody, _ := os.ReadFile(tp)
	if regexp.MustCompile(`(?m)^verifies:`).Match(tbody) {
		return false
	}
	vlane, _ := os.ReadFile(filepath.Join(sp, "connections", "verifies", "edges.jsonl"))
	if !strings.Contains(string(vlane), `"test-fix"`) {
		return false
	}
	// frontmatter mode is untouched: a bare dir with no project.toml keeps the edge key
	bare, _ := os.MkdirTemp("", "q13bare")
	defer os.RemoveAll(bare)
	bp, err := mintNodeAtX(bare, "requirement", "fm", map[string]string{"of": "uc-y"})
	if err != nil {
		return false
	}
	bbody, _ := os.ReadFile(bp)
	return regexp.MustCompile(`(?m)^refines: \[uc-y\]`).Match(bbody)
}

// test-prose-marks-comments -> selftest:prose-marks-comments
func selftestProseMarksComments() bool {
	// the only unmarked text lives inside a multi-line HTML comment: the unit passes
	body := "<!-- ai:3 -->\nmarked prose paragraph.\n\n<!-- PERMANENT fill comment\nspanning lines, plain guidance that must not count as prose -->\n\n<!-- ai:2 -->\nmore marked prose.\n"
	if !proseUnitsMarked(body) {
		return false
	}
	// unmarked prose OUTSIDE a comment still fails
	return !proseUnitsMarked("<!-- ai:3 -->\nmarked prose.\n\nplain unmarked prose outside any comment.\n")
}

// test-orphan-render-refs -> selftest:orphan-render-refs
func selftestOrphanRenderRefs() bool {
	nodes := LoadAll()
	for _, f := range bookOrphanFindings(nodes) {
		if strings.Contains(f, "uc-book-") {
			return false // view-rendered nodes are not orphans
		}
	}
	// a node no manifest and no view reaches still flags. The ucfn
	// board blanket-reaches every need and use case, so the synthetic is a REQUIREMENT:
	// no file on disk, no view row returns it, the orphan lint must flag it.
	syn := map[string]Node{}
	for k, v := range nodes {
		syn[k] = v
	}
	syn["req-i13-truly-unreachable"] = Node{ID: "req-i13-truly-unreachable", Type: "requirement",
		Path: filepath.Join(SPEC, "iterations", "i0001_syn", "u.md"), Statement: "synthetic orphan"}
	found := false
	for _, f := range bookOrphanFindings(syn) {
		if strings.Contains(f, "req-i13-truly-unreachable") {
			found = true
		}
	}
	return found
}

// test-conn-code-designs -> selftest:conn-code-designs
func selftestConnCodeDesigns() bool {
	dir, _ := os.MkdirTemp("", "q13ccd")
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	kdir := filepath.Join(sp, "connections", "interface")
	os.MkdirAll(kdir, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"),
		[]byte("[iteration]\nversion = \"\"\nedges = \"connections\"\n"), 0o644)
	// an interface note between two REAL code-derived designs (the i12 dogfood case)
	id := connID("interface", "go-verdict-cache", "go-walk", "", true)
	note := "---\nid: " + id + "\nkind: interface\nsrc: go-verdict-cache\ndst: go-walk\nstatement: the cache serves the walk\n---\n"
	os.WriteFile(filepath.Join(kdir, id+".md"), []byte(note), 0o644)
	for _, is := range StrictIssues(sp) {
		if strings.Contains(is.Msg, "dangling") {
			return false // code-design endpoints must resolve
		}
	}
	// a truly unknown endpoint still refuses
	bad := connID("interface", "go-walk", "no-such-design", "", true)
	os.WriteFile(filepath.Join(kdir, bad+".md"),
		[]byte("---\nid: "+bad+"\nkind: interface\nsrc: go-walk\ndst: no-such-design\nstatement: bogus\n---\n"), 0o644)
	for _, is := range StrictIssues(sp) {
		if strings.Contains(is.Msg, "no-such-design") {
			return true
		}
	}
	return false
}

// test-launcher-single-dispatch -> selftest:launcher-single-dispatch
func selftestLauncherSingleDispatch() bool {
	ws := i13StubWS("q13lnc")
	defer os.RemoveAll(ws)
	out, code := i13Exec(ws, "version")
	if code != 0 {
		return false
	}
	// exactly ONE engine dispatch per CLI call: the fixture's call log holds one line
	logsLine := regexp.MustCompile(`logs: (.+)`).FindStringSubmatch(out)
	if logsLine == nil {
		return false
	}
	raw, err := os.ReadFile(filepath.Join(strings.TrimSpace(logsLine[1]), "calls.jsonl"))
	if err != nil {
		return false // the one call must be logged
	}
	lines := strings.Count(strings.TrimSpace(string(raw)), "\n") + 1
	return lines == 1
}

// test-build-fast-path -> selftest:build-fast-path
func selftestBuildFastPath() bool {
	// capture cmdBuild output; second build with an unchanged source stamp skips the compile
	run := func() string {
		old := os.Stdout
		r, w, _ := os.Pipe()
		os.Stdout = w
		cmdBuild(nil)
		w.Close()
		os.Stdout = old
		raw, _ := io.ReadAll(r)
		return string(raw)
	}
	run()
	second := run()
	return strings.Contains(second, "compile skipped")
}

// test-verdict-surgical -> selftest:verdict-surgical
func selftestVerdictSurgical() bool {
	dir, _ := os.MkdirTemp("", "q13vrd")
	defer os.RemoveAll(dir)
	oldPath, oldMemo := verdictPathOverride, verdictsMemo
	verdictPathOverride = filepath.Join(dir, "verdicts.json")
	verdictsMemo = nil
	defer func() { verdictPathOverride, verdictsMemo = oldPath, oldMemo }()
	// seed one green and one red verdict, then re-baseline with unchanged content:
	// the green survives (self-validating on input+build); the red dies (the i11 wedge class)
	seed := map[string]verdictRec{
		"test-green-kept":  {Input: "h1", Build: buildID(), Result: true, Ms: 5},
		"test-red-dropped": {Input: "h2", Build: buildID(), Result: false, Ms: 5},
	}
	b, _ := json.MarshalIndent(seed, "", " ")
	os.WriteFile(verdictPathOverride, b, 0o644)
	buildRebaseline(globalBinPath())
	raw, err := os.ReadFile(verdictPathOverride)
	if err != nil || !strings.Contains(string(raw), "test-green-kept") {
		return false // the green verdict was wiped
	}
	return !strings.Contains(string(raw), "test-red-dropped")
}

// test-calls-summary -> selftest:calls-summary
func selftestCallsSummary() bool {
	ws := i13StubWS("q13cls")
	defer os.RemoveAll(ws)
	out, _ := i13Exec(ws, "version")
	logsLine := regexp.MustCompile(`logs: (.+)`).FindStringSubmatch(out)
	if logsLine == nil {
		return false
	}
	logDir := strings.TrimSpace(logsLine[1])
	os.MkdirAll(logDir, 0o755)
	seed := `{"ts":"2026-07-07T10:00:00+01:00","cmd":"status","args":[],"channel":"agent","exit":0,"ms":100}` + "\n" +
		`{"ts":"2026-07-07T10:00:01+01:00","cmd":"lint","args":[],"channel":"agent","exit":1,"ms":2500}` + "\n"
	logPath := filepath.Join(logDir, "calls.jsonl")
	os.WriteFile(logPath, []byte(seed), 0o644)
	sum, code := i13Exec(ws, "calls", "--summary")
	if code != 0 || !strings.Contains(sum, "status") || !strings.Contains(sum, "lint") {
		return false // the aggregate prints per command
	}
	if _, err := os.Stat(logPath); err == nil {
		return false // the log dies with the summary (retro-bound retention)
	}
	return true
}

// test-selftest-home-sweep -> selftest:selftest-home-sweep
func selftestSelftestHomeSweep() bool {
	root := filepath.Dir(filepath.Dir(globalBinPath())) // LOCALAPPDATA/quackitect
	fake := filepath.Join(root, "duckpond-i13sweepfixture")
	os.MkdirAll(fake, 0o755)
	defer os.RemoveAll(fake)
	sweepOrphanHomes()
	_, err := os.Stat(fake)
	return os.IsNotExist(err) // the orphaned fixture home is gone
}

// test-log-retention -> selftest:log-retention
func selftestLogRetention() bool {
	dir, _ := os.MkdirTemp("", "q13cap")
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "calls.jsonl")
	var b strings.Builder
	for i := 0; i < 5000; i++ {
		fmt.Fprintf(&b, `{"ts":"2026-07-07T10:00:00+01:00","cmd":"c%d","args":[],"channel":"agent","exit":0,"ms":1}`+"\n", i)
	}
	os.WriteFile(p, []byte(b.String()), 0o644)
	capCallLog(p, 64*1024)
	st, err := os.Stat(p)
	if err != nil || st.Size() > 64*1024 {
		return false // trimmed to the cap
	}
	raw, _ := os.ReadFile(p)
	return strings.Contains(string(raw), "c4999") && !strings.Contains(string(raw), `"c0"`) // newest kept, oldest dropped
}

// test-observe-red-refresh -> selftest:observe-red-refresh
func selftestObserveRedRefresh() bool {
	iterPath := filepath.Join(SPEC, "iterations", "i0001_syn", "t.md")
	nodes := map[string]Node{
		"test-amended": {ID: "test-amended", Type: "test", Class: "executed",
			Verify: "selftest:no-such-check", Path: iterPath, Statement: "amended statement"},
		"test-passing": {ID: "test-passing", Type: "test", Class: "executed",
			Verify: "selftest:ids", Path: iterPath, Statement: "green test"},
	}
	ev, err := refreshRed(nodes, "test-amended")
	if err != nil || ev.Action != "red-observed" || ev.Check != "test-amended" {
		return false // a still-failing amended test re-records at its new hash
	}
	if ev.Hash != fullHash("test-amended", nodes, map[string]string{}) {
		return false // the record binds to the CURRENT hash
	}
	if _, err := refreshRed(nodes, "test-passing"); err == nil {
		return false // a passing test is refused
	}
	return true
}
