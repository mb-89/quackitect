package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"
)

// ONE BUILDER ANSWERS THE ROOTS, AND EVERY FIXTURE IS BUILT ON IT.
//
// Each test file carried a builder of its own. Thirty-two of them made a
// temporary folder, wrote files into it and answered the roots, under thirty-two
// names. A fixture written in that many places cannot have its backing changed,
// so the question of whether a fixture should be rows rather than files could
// not be asked. Two tests failed their own TempDir cleanup during earlier work,
// because a handle was still open, and that defect had thirty-two places to
// hide in.
//
// So the builders live here, on one root maker. The backing does not move: the
// builder writes files exactly as the helpers did.
//
// THE GUARD READS THE SUITE'S OWN SOURCE, because that is where the rule can be
// broken. A new test file declaring a fixture of its own is the shape this is
// about, and it fails here rather than at a reader's discretion.
func TestOneFileCarriesTheFixtureBuilders(t *testing.T) {
	t.Parallel()
	var stray []string
	for _, name := range testFilesHere(t) {
		if name == "fixture_test.go" {
			continue
		}
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatalf("parsing %s: %v", name, err)
		}
		for _, d := range file.Decls {
			fn, ok := d.(*ast.FuncDecl)
			if !ok || fn.Type.Results == nil {
				continue
			}
			for _, res := range fn.Type.Results.List {
				if id, ok := res.Type.(*ast.Ident); ok && id.Name == "Roots" {
					stray = append(stray, name+": "+fn.Name.Name)
				}
			}
		}
	}
	sort.Strings(stray)
	if len(stray) > 0 {
		t.Fatalf("%d fixture builders live outside fixture_test.go: %s",
			len(stray), strings.Join(stray, ", "))
	}
}

// testFilesHere answers the package's own test files, and refuses to report on
// none, because a walk that finds nothing passes the guard above for free.
func testFilesHere(t *testing.T) []string {
	t.Helper()
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), "_test.go") {
			names = append(names, filepath.Base(e.Name()))
		}
	}
	if len(names) < 100 {
		t.Fatalf("the walk found %d test files, so it is not reading the suite", len(names))
	}
	return names
}

// ---- the builder ----

// tree is the builder. aTree makes the folder a fixture lives in, write puts a
// file in it, and the embedded Roots is what a test takes away. The backing is
// behind this one type, so a fixture kept as rows rather than as files is a
// change here and nowhere else.
type tree struct {
	t testing.TB
	Roots
}

// aTree answers a tree whose method and work are one folder, which is what a
// fixture wants unless it is about the two being apart.
func aTree(t testing.TB) *tree {
	t.Helper()
	root := t.TempDir()
	return &tree{t: t, Roots: Roots{Method: root, Work: root}}
}

// apart moves the method into a second folder, for the fixtures that are about
// the two roots being different places.
func (f *tree) apart() *tree {
	f.Method = f.t.TempDir()
	return f
}

// write puts one file in the tree and answers its path, making the folders
// above it. It writes the way the helpers below wrote before they moved here:
// a folder at 0755 and a file at 0644, and a failure ends the test.
func (f *tree) write(rel, text string) string {
	f.t.Helper()
	p := filepath.Join(f.Work, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		f.t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
		f.t.Fatal(err)
	}
	return p
}

// writeMethod is write, into the method root, for a fixture whose two roots are
// apart and whose file belongs to the method.
func (f *tree) writeMethod(rel, text string) string {
	f.t.Helper()
	p := filepath.Join(f.Method, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		f.t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
		f.t.Fatal(err)
	}
	return p
}

// ---- the fixtures, each on the builder above ----

// ---- from abort_test.go ----

// aTreeThatClosesAt writes a process whose terminal state is named closed,
// the way the shipped processes name theirs.
func aTreeThatClosesAt(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	withHistory(t, root)
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: task
description: one step the queue hands out
sections:
  required:
    - detail
states:
  - name: open
    description: waiting
  - name: closed
    description: finished
activities:
  - name: mint
    does: write it down
    to: open
  - name: do
    does: do it
    from: open
    to: closed
dispositions:
  - name: done
    description: it was done
  - name: dropped
    description: it was not
    reason: required
`
	if err := os.WriteFile(filepath.Join(dir, "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from apply_test.go ----

func aTreeToWriteIn(t *testing.T) Roots {
	t.Helper()
	return aTree(t).Roots
}

// ---- from archive_test.go ----

// aTreeWithHistory is a work tree git will write into.
func aTreeWithHistory(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	for _, name := range []string{"note", "standard", "trivial"} {
		writeProcess(t, root, name)
	}
	withHistory(t, root)
	return r
}

// ---- from battery_test.go ----

// A battery that answers the way the real one does: a verdict on its last line.
func aTreeWithABattery(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	checks := filepath.Join(root, "util", "checks")
	if err := os.MkdirAll(checks, 0o755); err != nil {
		t.Fatal(err)
	}
	script := "#!/bin/sh\necho 'go build         ok    1s'\necho '0 failed, 1s wall clock'\n"
	if err := os.WriteFile(filepath.Join(checks, "battery.sh"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	if sh, _ := batteryShell(r); sh == "" {
		t.Skip("no shell on this machine, so the battery cannot be started here")
	}
	return r
}

// ---- from bench_test.go ----

// aTreeToIndexB is aTreeToIndex for a benchmark.
func aTreeToIndexB(b *testing.B) Roots {
	b.Helper()
	f := aTree(b)
	r, root := f.Roots, f.Work
	work := filepath.Join(root, ".se", "work")
	if err := os.MkdirAll(work, 0o755); err != nil {
		b.Fatal(err)
	}
	for _, name := range []string{"wk-one", "wk-two", "wk-three"} {
		text := "---\nkind: [[work-token]]\ntitle: " + name + "\n---\n\n## detail\n\nA note the benchmark wrote, long enough to be a passage of its own.\n"
		if err := os.WriteFile(filepath.Join(work, name+".md"), []byte(text), 0o644); err != nil {
			b.Fatal(err)
		}
	}
	return r
}

// ---- from cage_test.go ----

// root2 is the self-hosting pair, which is the case a cage travels in.
func root2(root string) Roots { return Roots{Method: root, Work: root} }

// ---- from checkengine_test.go ----

// aTreeWithAnEchoingCheck is a method root with engine source in it and one
// check that writes the engine it was handed where the test can read it.
func aTreeWithAnEchoingCheck(t *testing.T) (Roots, string) {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	for _, dir := range []string{filepath.Join("src", "engine"), filepath.Join("util", "checks"), ".se"} {
		if err := os.MkdirAll(filepath.Join(root, dir), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(filepath.Join(root, "src", "engine", "a.go"), []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	seen := filepath.Join(root, ".se", "engine-seen.txt")
	// The runner hands a check its method root as the one argument, so the
	// script writes beside it.
	script := "import { writeFileSync } from \"node:fs\";\nimport { join } from \"node:path\";\n" +
		"writeFileSync(join(process.argv[2], \".se\", \"engine-seen.txt\"), process.env.SE_ENGINE ?? \"\");\n"
	if err := os.WriteFile(filepath.Join(root, "util", "checks", "echo-engine.mjs"), []byte(script), 0o644); err != nil {
		t.Fatal(err)
	}
	return r, seen
}

// ---- from engineload_test.go ----

// aModelServed serves a model over an indexed tree on its socket, and answers
// the roots and the socket's address.
func aModelServed(t *testing.T) (Roots, string) {
	t.Helper()
	r := aTreeToIndex(t)
	openTheIndex(t, r)
	ro, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ro.Close() })
	m := &model{ctx: t.Context(), db: ro, roots: r, askedToStop: make(chan struct{}, 1), askedToSwap: make(chan swapPlan, 1)}
	ln, addr, err := listenModel(r)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	go serveModel(t.Context(), ln, m)
	return r, addr
}

// ---- from guards_test.go ----

// aGuardedTree is a method tree with a session open, so the guard has a
// record to write and a session to key its state by.
func aGuardedTree(t *testing.T) (string, Roots) {
	t.Helper()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()
	return exe, r
}

// ---- from holdstore_test.go ----

// heldTokenRoots is the setup the hold tests share: a tree, a workable process
// and an open log, so the session has a name to write arrivals against.
func heldTokenRoots(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	writeProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	return r
}

// ---- from index_test.go ----

// aTreeToIndex writes two private notes and one public note that links to
// them, and answers the roots with the index built.
func aTreeToIndex(t *testing.T) Roots {
	t.Helper()
	f := aTree(t).apart()
	write := f.write
	write(".se/work/wk-one.md", "---\nkind: [[work-token]]\ntitle: the first\ndepends_on: [\"[[wk-two]]\"]\n---\n\n## detail\n\nIt names [[wk-two]] and [[nowhere]].\n")
	write(".se/work/wk-two.md", "---\nkind: [[work-token]]\ntitle: the second\n---\n\n## detail\n\nA heredoc ate a file.\n")
	write("doc/plain.md", "no frontmatter here, so prose and nothing else\n")
	// The kind every note names resolves to the schema file by its stem.
	write("src/schemas/work-token.schema.yaml", "kind: work-token\n")
	write(".se/log/session.jsonl", "{}\n")
	return f.Roots
}

// ---- from investigate_test.go ----

// aHeldTokenInASession is one token in one pair of hands, inside a real session,
// because whether a holder has gone is answered from the record that session
// writes. It was the session's pull count, and a worker on one long token pulls
// once: the count read a busy room as a stopped holder.
func aHeldTokenInASession(t *testing.T, holder string) (Roots, Token) {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "a long token", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, holder); err != nil {
		t.Fatal(err)
	}
	return r, tok
}

// ---- from lintwalk_test.go ----

// aTreeOfGuidance writes notes at three depths, one parked file and one parked
// folder. Every note names no kind, so each one this walk reaches is a finding
// and the test can ask which were reached.
func aTreeOfGuidance(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	root := f.Work
	dir := GuidanceDir(root)
	for _, name := range []string{
		"top.md",
		"_alone.md",
		filepath.Join("lane", "deep.md"),
		filepath.Join("lane", "deeper", "deepest.md"),
		filepath.Join("_parked", "hidden.md"),
	} {
		path := filepath.Join(dir, name)
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte("# A note naming no kind\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return f.Roots
}

// ---- from mint_test.go ----

// aTreeDescribingFields is aTreeRequiringDoneWhen with a schema that
// describes each field, so a mint has descriptions to carry.
func aTreeDescribingFields(t *testing.T) Roots {
	t.Helper()
	r := aTreeRequiringDoneWhen(t)
	dir := SchemasDir(r.Method)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const schema = `kind: work-token
frontmatter:
  type: object
  required:
    - kind
    - process
    - title
    - status
  properties:
    kind:
      const: work-token
      description: which schema reads this note
    process:
      description: which process shapes it
    title:
      description: the name it is known by
    status:
      description: where it stands
body:
  headingLevel: 2
  sections:
    - header: detail
      maxWords: 20
    - header: done when
      list: true
`
	if err := os.WriteFile(filepath.Join(dir, "work-token.schema.yaml"), []byte(schema), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// aTreeRequiringDoneWhen writes a process whose tokens must say what done
// means before they exist.
func aTreeRequiringDoneWhen(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: small
description: a small change with criteria up front
sections:
  required:
    - detail
    - done when
states:
  - name: open
    description: waiting
  - name: closed
    description: finished
activities:
  - name: do
    does: do it
    to: open
dispositions:
  - name: done
    description: it was done
`
	if err := os.WriteFile(filepath.Join(dir, "small.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from notekeeps_test.go ----

// aTreeWithAChecklist writes a two-step process whose steps carry criteria, so
// a submission is about the checklist and not only about the disposition. The
// second step's wording is a parameter, because a criterion renamed after a
// token was minted is one of the things under test.
func aTreeWithAChecklist(t *testing.T, secondSays string) Roots {
	t.Helper()
	return aChecklistOver(t, aTree(t).Roots, secondSays)
}

// aChecklistOver writes that process over a tree that is already there, which
// is how a test renames a criterion after a token has been minted against it.
func aChecklistOver(t *testing.T, r Roots, secondSays string) Roots {
	t.Helper()
	root := r.Work
	withHistory(t, root)
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	proc := `name: task
description: two steps, each with something to tick
sections:
  required:
    - detail
states:
  - name: open
    description: waiting
  - name: closed
    description: finished
activities:
  - name: ask
    does: say what is asked
    to: open
    criteria:
      - says: the ask is small enough to review whole
  - name: do
    does: do it
    from: open
    to: closed
    criteria:
      - says: ` + secondSays + `
dispositions:
  - name: done
    description: it was done
  - name: dropped
    description: it was not
    reason: required
`
	if err := os.WriteFile(filepath.Join(dir, "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from project_test.go ----

func guidanceTree(t *testing.T) Roots {
	t.Helper()
	f := aTree(t).apart()
	f.writeMethod("doc/guidance/voice.md", "# Voice\n\nAnswer first.\n")
	f.writeMethod("doc/guidance/behaviour.md", "# Behaviour\n\nDo what was asked.\n")
	// The methods that ride on an answer. The fixture declares its own, so a
	// test reads the mechanism rather than the product's wording.
	f.writeMethod("doc/guidance/reviewing.md", "# Reviewing\n\nVerify, do not read.\n")
	f.writeMethod("doc/guidance/work-token.md", "# Work token\n\nA criterion that can be a command is one.\n")
	// What is projected where is data. The test declares its own, so it tests
	// the mechanism rather than the product's list.
	f.writeMethod("util/projections.json", `{"projections":[
	  {"name":"protocol","target":"AGENTS.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"copilot","target":".github/copilot-instructions.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"style","target":".claude/output-styles/quackitect.md","sources":["doc/guidance/voice.md","doc/guidance/behaviour.md"],"wrap":"frontmatter","frontmatter":{"name":"quackitect"}}
	]}`)
	// The icon table. The fixture declares its own for the same reason it
	// declares its own tree: the mechanism is the thing under test.
	f.writeMethod("util/icons.json", `{
	  "$comment": "the fixture's own",
	  "power": {"glyph": "⏻", "at": "U+23FB"},
	  "hand": {"glyph": "✋", "at": "U+270B"}
	}`)
	// One tree. The fixture declares its own, so the tests exercise the
	// mechanism rather than the product's list.
	f.writeMethod("util/parameters.json", `{
	  "name":"quackitect","type":"group","children":[
	    {"name":"limits","type":"group","shown":true,"children":[
	      {"name":"heartbeat_seconds","type":"int","default":5,"min":1,"max":60,"narrow":"smaller"},
	      {"name":"ready_budget_ms","type":"int","default":15000,"min":1000,"max":15000,"narrow":"smaller"}]},
	    {"name":"guards","type":"group","shown":true,"children":[
	      {"name":"guard_projections","type":"bool","default":true,"narrow":"on"},
	      {"name":"stop_needs_claim","type":"bool","default":true,"narrow":"on"}]}]}`)
	// The rules the guard checks against are data, so the fixture carries a
	// copy of the ones the product ships.
	if b, err := os.ReadFile(filepath.Join("..", "..", "util", "voice-rules.json")); err == nil {
		f.writeMethod("util/voice-rules.json", string(b))
	}
	return f.Roots
}

// ---- from pull_test.go ----

func lane(t *testing.T) Roots {
	t.Helper()
	return aTree(t).apart().Roots
}

// ---- from removal_test.go ----

// removalTree answers a tree and the two doors this guard is asked through:
// one that registers a read the way the harness does, and one that puts a
// shell command to the engine before it runs.
//
// BOTH HALVES GO THROUGH answerHook. The read is registered by the same
// PostToolUse the harness fires rather than by calling NoteReadPage here, so
// the test cannot pass on evidence the running engine would never have.
func removalTree(t *testing.T) (Roots, func(command string) string, func(path string)) {
	t.Helper()
	r := guidanceTree(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })

	say := func(event, tool string, input map[string]any) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": event, "cwd": r.Work,
			"tool_name": tool, "tool_input": input, "agent_id": "helper-1"})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	run := func(command string) string {
		return say("PreToolUse", "Bash", map[string]any{"command": command})
	}
	readIt := func(path string) {
		t.Helper()
		say("PostToolUse", "Read", map[string]any{"file_path": path})
	}
	return r, run, readIt
}

// ---- from results_test.go ----

// countingTree is a tree with a session to count in.
func countingTree(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	t.Cleanup(func() { l.Close() })
	return r
}

// ---- from retro_test.go ----

// A tree with a log, a scratchpad and one token, the way a session leaves one.
func aWorkedTree(t *testing.T) Roots {
	t.Helper()
	r := lane(t)
	logs := r.Private("log")
	if err := os.MkdirAll(logs, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"session-20260101-000000.jsonl", "session-20260102-000000.jsonl"} {
		if err := os.WriteFile(filepath.Join(logs, name), []byte("{}"+nl), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	// The one that is running, which the retro rotates before it drains.
	running := `{"running":true}` + nl
	if err := os.WriteFile(filepath.Join(logs, Current), []byte(running), 0o644); err != nil {
		t.Fatal(err)
	}
	// THE FOLDER BELONGS TO THE ACTOR THAT RUNS THE RETRO, so these fixtures
	// are about a folder moving whole. Another actor's folder is left where
	// it is now, and the test that decides that makes its own.
	pad := r.Private("scratchpad")
	if err := os.MkdirAll(filepath.Join(pad, "main"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "one-off.py"), []byte("print(1)"+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "main", "probe.sh"), []byte("echo"+nl), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from retrovoice_test.go ----

// aSessionWithVoiceBreaks lays down one retired session whose records break
// known rules a known number of times.
func aSessionWithVoiceBreaks(t *testing.T) Roots {
	t.Helper()
	r := lane(t)

	// THE RULES ARE DATA, and the fixture declares its own, so this test is
	// about the counting and not about the list the product happens to ship.
	if err := os.MkdirAll(filepath.Join(r.Method, "util"), 0o755); err != nil {
		t.Fatal(err)
	}
	const rules = `{
  "source": "the fixture's own",
  "limits": {"sentence_words": 25},
  "rules": [
    {"name": "no semicolon", "pattern": ";", "says": "a semicolon joins two sentences that should be two"},
    {"name": "no contraction", "pattern": "(?i)\\b\\w+n't\\b", "says": "write both words"}
  ]
}`
	if err := os.WriteFile(filepath.Join(r.Method, "util", "voice-rules.json"), []byte(rules), 0o644); err != nil {
		t.Fatal(err)
	}

	logs := r.Private("log")
	if err := os.MkdirAll(logs, 0o755); err != nil {
		t.Fatal(err)
	}
	records := []Record{
		// The agent, breaking one rule each, and once breaking none.
		{Seq: 1, Src: "agent", Kind: "answer", Actor: "main", Msg: "I looked; it was there."},
		{Seq: 2, Src: "agent", Kind: "answer", Actor: "main", Msg: "It doesn't build yet."},
		{Seq: 3, Src: "agent", Kind: "answer", Actor: "main", Msg: "Nothing is wrong with this line."},
		// The person, breaking both. Their words are not the agent's to fix.
		{Seq: 4, Src: "user", Kind: "prompt", Actor: "main", Msg: "why doesn't it work; tell me"},
		// The engine, breaking one. Not prose anybody is asked to improve.
		{Seq: 5, Src: "engine", Kind: "refusal", Actor: "main", Msg: "write refused; voice"},
	}
	var b strings.Builder
	for _, rec := range records {
		line, err := json.Marshal(rec)
		if err != nil {
			t.Fatal(err)
		}
		b.Write(line)
		b.WriteString(nl)
	}
	if err := os.WriteFile(filepath.Join(logs, "session-20260101-000000.jsonl"),
		[]byte(b.String()), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from run_test.go ----

func aTreeToRunIn(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	root := f.Work
	// The command runs in the work root, so it must be a real folder.
	if err := os.MkdirAll(filepath.Join(root, ".se"), 0o755); err != nil {
		t.Fatal(err)
	}
	return f.Roots
}

// ---- from scope_test.go ----

// aTreeWithOneStep writes a process the queue hands out: one step from open
// to done, with nothing to tick, so a submission is about the scope and not
// about the checklist.
func aTreeWithOneStep(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	withHistory(t, root)
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: task
description: one step the queue hands out
sections:
  required:
    - detail
states:
  - name: open
    description: waiting
  - name: done
    description: finished
activities:
  - name: mint
    does: write it down
    to: open
  - name: do
    does: do it
    from: open
    to: done
dispositions:
  - name: done
    description: it was done
  - name: dropped
    description: it was not
    reason: required
`
	if err := os.WriteFile(filepath.Join(dir, "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from standard_test.go ----

// aTreeWithTheProcesses is a tree carrying the shipped processes and schemas.
func aTreeWithTheProcesses(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	withHistory(t, root)
	for _, dir := range []string{"processes", "schemas"} {
		from := filepath.Join("..", "..", "src", dir)
		to := filepath.Join(root, "src", dir)
		if err := os.MkdirAll(to, 0o755); err != nil {
			t.Fatal(err)
		}
		entries, err := os.ReadDir(from)
		if err != nil {
			t.Fatal(err)
		}
		for _, e := range entries {
			b, err := os.ReadFile(filepath.Join(from, e.Name()))
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(filepath.Join(to, e.Name()), b, 0o644); err != nil {
				t.Fatal(err)
			}
		}
	}
	return r
}

// ---- from standing_test.go ----

// aTreeWithGuidance is a method root with two guidance files: one the
// projection puts in the prompt, and one it does not.
func aTreeWithGuidance(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	dir := GuidanceDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("standing.md", "# Actionables\n\n1. A rule every agent is handed.\n")
	write("lane.md", "# Actionables\n\n1. A rule only this lane has.\n")

	// The projection carries the top-level folder, which is where standing.md
	// is. lane.md sits in a subfolder, which the standing layer never reaches.
	sub := filepath.Join(dir, "software-development")
	if err := os.MkdirAll(sub, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(filepath.Join(dir, "lane.md"), filepath.Join(sub, "lane.md")); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(root, "util"), 0o755); err != nil {
		t.Fatal(err)
	}
	const projections = `{"projections":[
	  {"name":"prompt","target":"prompt.md","wrap":"markdown",
	   "section":"Actionables","sources_from":"doc/guidance"}]}`
	if err := os.WriteFile(filepath.Join(root, "util", "projections.json"),
		[]byte(projections), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from stays_test.go ----

// aLaneWithASession is a lane the engine has started in, because absence is
// answered from the session's own pull count and a lane with no session answers
// nothing.
func aLaneWithASession(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()
	if !Named(currentSession(r)) {
		t.Fatal("the fixture has no session, so nothing here can ask whether a reviewer is gone")
	}
	return r
}

// ---- from tests_test.go ----

// aTreeWithTests is a git repository holding a Go module with lib.go and
// lib_test.go, committed, indexed, and with every test mapped. It costs a
// cover build and a run per test, so a test takes it once.
func aTreeWithTests(t *testing.T) (Roots, string) {
	t.Helper()
	// THE COMPILER IS FED, NOT RUN. What these tests are about is which tests
	// the engine chooses from a delta, and the toolchain answers the same thing
	// every time and takes ten seconds to say it. TestTheMapIsBuiltByTheRealGo
	// drives the real one, once. See toolchainfed_test.go.
	reaches := map[string][]string{
		"TestA": {"lib.go:3.13,5.2 1 1"},
		"TestB": {"lib.go:7.13,9.2 1 1"},
	}
	// THE PADDING REACHES B, the way the padding written below does, so the
	// suite is as big here as it is there and the whole-battery rule sees the
	// share it is about.
	for i := 1; i <= padTests; i++ {
		reaches[fmt.Sprintf("TestPad%d", i)] = []string{"lib.go:7.13,9.2 1 1"}
	}
	aFedToolchain(t, "example.com/lib", reaches)
	f := aTree(t)
	r, dir := f.Roots, f.Work
	lib := "package lib\n\n" +
		"func A() int {\n\treturn 1\n}\n\n" +
		"func B() int {\n\treturn 2\n}\n"
	test := "package lib\n\nimport \"testing\"\n\n" +
		"func TestA(t *testing.T) {\n\tif A() != 1 {\n\t\tt.Fatal(\"A\")\n\t}\n}\n\n" +
		"func TestB(t *testing.T) {\n\tif B() != 2 {\n\t\tt.Fatal(\"B\")\n\t}\n}\n"
	for i := 1; i <= padTests; i++ {
		test += fmt.Sprintf("\nfunc TestPad%d(t *testing.T) {\n\tif B() != 2 {\n\t\tt.Fatal(\"B\")\n\t}\n}\n", i)
	}
	for name, text := range map[string]string{"go.mod": "module example.com/lib\n\ngo 1.27\n", "lib.go": lib, "lib_test.go": test} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	git := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = dir
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	git("init", "-q")
	git("add", "-A")
	git("commit", "-q", "-m", "the tree as it was")
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	mapped, failed, err := mapMissing(r, db, nil)
	if err != nil || failed != 0 || mapped != 2+padTests {
		t.Fatalf("mapping the tests: mapped %d, failed %d, %v", mapped, failed, err)
	}
	return r, dir
}

// ---- from tidy_test.go ----

// aTidyTree is a tree with one thing for each part to find: a token that has
// closed and never been archived, and a claim that has lapsed.
func aTidyTree(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithHistory(t)

	closed, err := Mint(r, Token{Process: "trivial", Title: "already closed",
		Status: "first", Tracked: local()})
	if err != nil {
		t.Fatal(err)
	}
	closed.Disposition = Done
	closed.Status = "closed"
	if err := SaveToken(r, closed); err != nil {
		t.Fatal(err)
	}

	stale, err := Mint(r, Token{Process: "trivial", Title: "held too long",
		Status: "first", Tracked: local()})
	if err != nil {
		t.Fatal(err)
	}
	long := time.Duration(LoadConfig(r).ClaimHours+1) * time.Hour
	stale.ClaimedBy = "aaaaaaaa/worker-gone"
	stale.ClaimedAt = time.Now().UTC().Add(-long).Format(ClaimStamp)
	if err := SaveToken(r, stale); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from timeline_test.go ----

// aTreeToWeave is a tree carrying two log files and one transcript, timed so
// that the right answer alternates between the two sources. A reader can tell a
// merge from a concatenation only when the sources interleave.
func aTreeToWeave(t *testing.T) (Roots, string, []byte) {
	t.Helper()
	r := lane(t)
	logs := r.Private("log")
	if err := os.MkdirAll(logs, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(logs, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("session-20260101-000000.jsonl",
		`{"t":"2026-01-01T00:00:01Z","seq":1,"src":"engine","kind":"pull","actor":"main","msg":"one"}`+nl)
	write("session-20260101-000100.jsonl",
		`{"t":"2026-01-01T00:00:03Z","seq":1,"src":"engine","kind":"pull","actor":"worker-two","msg":"three"}`+nl)

	// The middle turn carries no timestamp, which is the case the transcripts
	// actually show, and it sits between two that do.
	turns := `{"timestamp":"2026-01-01T00:00:00Z","type":"user"}` + nl +
		`{"type":"assistant"}` + nl +
		`{"timestamp":"2026-01-01T00:00:04Z","type":"assistant"}` + nl
	path := filepath.Join(t.TempDir(), "claude.jsonl")
	if err := os.WriteFile(path, []byte(turns), 0o644); err != nil {
		t.Fatal(err)
	}
	return r, path, []byte(turns)
}

// ---- from tools_test.go ----

// The candidates are data, so the fixture declares its own. One that is
// certainly here, the engine this suite built and holds as a fixture, named
// by its path so nothing on the machine's PATH decides the answer, and one
// that is certainly not.
//
// IT WAS go, BY NAME. Under the battery's load go version took longer than
// the probe's bound and the test read a machine's busy afternoon as a defect.
// A fixture answers the same on every machine and under any load.
func probeTree(t *testing.T) Roots {
	t.Helper()
	r := aTree(t).apart().Roots
	os.MkdirAll(filepath.Join(r.Method, "util"), 0o755)
	engine, _ := json.Marshal(theEngine(t))
	os.WriteFile(filepath.Join(r.Method, "util", "tools.json"), []byte(`{"tools":[
	  {"name":`+string(engine)+`,"args":["--version"],"for":"the engine itself"},
	  {"name":"nothing-is-called-this","args":["--version"],"for":"nothing"}
	]}`), 0o644)
	return r
}

// ---- from toosoon_test.go ----

// aTreeWithThreeSteps writes a process of three steps and two of the files
// every token needs, in a tree of its own.
func aTreeWithThreeSteps(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	r, root := f.Roots, f.Work
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("making %s: %v", dir, err)
	}
	const proc = `name: three
description: three steps, so there is a step after the one in hand
sections:
  required:
    - detail
  optional:
    - "evidence: "
states:
  - name: first
    description: after the first step
  - name: second
    description: after the second
  - name: third
    description: after the third
activities:
  - name: one
    does: the first thing
    to: first
    criteria:
      - says: the first thing was done
  - name: two
    does: the second thing
    from: first
    to: second
    criteria:
      - says: the second thing was done
  - name: three
    does: the third thing
    from: second
    to: third
    criteria:
      - says: the third thing was done
dispositions:
  - name: done
    description: it was done
`
	path := filepath.Join(dir, "three.process.yaml")
	if err := os.WriteFile(path, []byte(proc), 0o644); err != nil {
		t.Fatalf("writing %s: %v", path, err)
	}
	return r
}
