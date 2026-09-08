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
	"quackitect/engine/internal/sessionlog"
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

// ---- from g_no_parallel_seam_helper_hop_test.go ----

func theRootsPlantedForTheHop(t *testing.T) Roots {
	t.Helper()
	work := t.TempDir()
	at := filepath.Join(work, "pkg")
	if err := os.MkdirAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(at, "clock.go"), []byte(thePackagePlantedForTheHop), 0o644); err != nil {
		t.Fatal(err)
	}
	return Roots{Work: work, Method: work}
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

// ---- from boxbranch_test.go ----

// aTreeOnTrunk is a work tree with one commit on a branch called trunk, which
// is where a box stands before it takes a branch of its own.
func aTreeOnTrunk(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	withHistory(t, f.Work)
	f.write("README.md", "a tree to branch off\n")
	gitAt(t, f.Work, "add", "--", "README.md")
	gitAt(t, f.Work, "commit", "--quiet", "-m", "the trunk as it stands")
	gitAt(t, f.Work, "branch", "-M", "trunk")
	return f.Roots
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
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
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
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", sessionlog.Yes(), nil)
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
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", sessionlog.Yes(), nil)
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
	f.writeMethod("spec/guidance/voice.md", "# Voice\n\nAnswer first.\n")
	f.writeMethod("spec/guidance/behaviour.md", "# Behaviour\n\nDo what was asked.\n")
	// The methods that ride on an answer. The fixture declares its own, so a
	// test reads the mechanism rather than the product's wording.
	f.writeMethod("spec/guidance/reviewing.md", "# Reviewing\n\nVerify, do not read.\n")
	f.writeMethod("spec/guidance/work-token.md", "# Work token\n\nA criterion that can be a command is one.\n")
	// What is projected where is data. The test declares its own, so it tests
	// the mechanism rather than the product's list.
	f.writeMethod("src/config/projections.json", `{"projections":[
	  {"name":"protocol","target":"AGENTS.md","sources":["spec/guidance/voice.md","spec/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"copilot","target":".github/copilot-instructions.md","sources":["spec/guidance/voice.md","spec/guidance/behaviour.md"],"wrap":"markdown"},
	  {"name":"style","target":".claude/output-styles/quackitect.md","sources":["spec/guidance/voice.md","spec/guidance/behaviour.md"],"wrap":"frontmatter","frontmatter":{"name":"quackitect"}}
	]}`)
	// The icon table. The fixture declares its own for the same reason it
	// declares its own tree: the mechanism is the thing under test.
	f.writeMethod("src/config/icons.json", `{
	  "$comment": "the fixture's own",
	  "power": {"glyph": "⏻", "at": "U+23FB"},
	  "hand": {"glyph": "✋", "at": "U+270B"}
	}`)
	// One tree. The fixture declares its own, so the tests exercise the
	// mechanism rather than the product's list.
	f.writeMethod("src/config/parameters.json", `{
	  "name":"quackitect","type":"group","children":[
	    {"name":"limits","type":"group","shown":true,"children":[
	      {"name":"heartbeat_seconds","type":"int","default":5,"min":1,"max":60,"narrow":"smaller"},
	      {"name":"ready_budget_ms","type":"int","default":15000,"min":1000,"max":15000,"narrow":"smaller"}]},
	    {"name":"guards","type":"group","shown":true,"children":[
	      {"name":"guard_projections","type":"bool","default":true,"narrow":"on"},
	      {"name":"stop_needs_claim","type":"bool","default":true,"narrow":"on"}]}]}`)
	// The rules the guard checks against are data, so the fixture carries a
	// copy of the ones the product ships.
	if b, err := os.ReadFile(DeclaredAt(filepath.Join("..", ".."), "voice-rules.json")); err == nil {
		f.writeMethod("src/config/voice-rules.json", string(b))
	}
	return f.Roots
}

// ---- from pull_test.go ----

func lane(t *testing.T) Roots {
	t.Helper()
	return aTree(t).apart().Roots
}

// ---- from pullbehindthebranch_test.go ----

// aCloneBehindTheClose hands back a clone whose working tree still carries a
// token the branch it tracks has archived, with that close already fetched.
func aCloneBehindTheClose(t *testing.T) (Roots, Token) {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "behind the branch")
	// THE TREE IS ON THE BRANCH BEFORE THE CLONE IS TAKEN, processes and all,
	// so the clone is a box that could work the token.
	gitAt(t, r.Work, "add", "--", "doc", "src")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)

	// THE BRANCH CLOSES IT AND COMMITS THE CLOSE, while the clone stands still.
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "spec/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the close")

	// THE CLONE FETCHES, WHICH IS WHAT EVERY BOX DOES BEFORE IT WORKS, and its
	// working tree stays where it was: the note is still open on its disk.
	gitAt(t, clone, "fetch", "--quiet", "origin")
	behind := Roots{Method: clone, Work: clone}
	if at := noteAt(behind, tok.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so it is not behind the branch", tok.ID)
	}
	return behind, tok
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
	log, err := sessionlog.Open(r.Private("log"))
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
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "for the session name", sessionlog.Yes(), nil)
	t.Cleanup(func() { l.Close() })
	return r
}

// ---- from retro_test.go ----

// A tree with a log, a scratchpad and one token, the way a session leaves one.
//
// ITS METHOD ROOT IS ITS WORK ROOT, AND IT CARRIES THE MARKER THAT SAYS SO.
//
// Five of these tests spawn the built engine as a client. That binary is built
// into a temporary folder, so a lookup from where it stands finds no
// src/processes, and it then looks up from the folder --work names. This
// fixture took its roots from lane, which puts the method in a third folder
// that no spawned call can name, so the lookup found nothing either way and
// all five were refused before the verb ran. See methodRootFrom in roots.go.
//
// Nothing here reads the two roots apart, and the marker is what every other
// fixture that spawns this binary carries.
func aWorkedTree(t *testing.T) Roots {
	t.Helper()
	r := aTree(t).Roots
	if err := os.MkdirAll(ProcessesDir(r.Method), 0o755); err != nil {
		t.Fatal(err)
	}
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
	if err := os.WriteFile(filepath.Join(logs, sessionlog.Current), []byte(running), 0o644); err != nil {
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
	if err := os.MkdirAll(filepath.Join(r.Method, "src", "config"), 0o755); err != nil {
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
	if err := os.WriteFile(filepath.Join(r.Method, "src", "config", "voice-rules.json"), []byte(rules), 0o644); err != nil {
		t.Fatal(err)
	}

	logs := r.Private("log")
	if err := os.MkdirAll(logs, 0o755); err != nil {
		t.Fatal(err)
	}
	records := []sessionlog.Record{
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
		// THE FIXTURE ASKS WHERE THE DECLARATIONS LIVE RATHER THAN WRITING IT
		// DOWN. They moved from src to spec, and a path built by joining the old
		// name copied nothing, so every test standing on this fixture failed
		// with a folder that is not there. SpecAt answers the new place first.
		from := SpecAt(filepath.Join("..", ".."), dir)
		to := SpecAt(root, dir)
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
	if err := os.MkdirAll(filepath.Join(root, "src", "config"), 0o755); err != nil {
		t.Fatal(err)
	}
	const projections = `{"projections":[
	  {"name":"prompt","target":"prompt.md","wrap":"markdown",
	   "section":"Actionables","sources_from":"spec/guidance"}]}`
	if err := os.WriteFile(filepath.Join(root, "src", "config", "projections.json"),
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
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "started", sessionlog.Yes(), nil)
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
	os.MkdirAll(filepath.Join(r.Method, "src", "config"), 0o755)
	engine, _ := json.Marshal(theEngine(t))
	os.WriteFile(filepath.Join(r.Method, "src", "config", "tools.json"), []byte(`{"tools":[
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

// ---- from amergereverts_test.go ----

func aMergeTree(t *testing.T) (Roots, func(...string) string) {
	t.Helper()
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	git := func(args ...string) string {
		t.Helper()
		out, _ := gitHere(r, args...) // a conflicting merge exits non-zero on purpose
		return out
	}
	write := func(name, text string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(r.Work, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	git("init", "--quiet", "--initial-branch", "main")
	git("config", "user.email", "a@b.c")
	git("config", "user.name", "a box")
	write("shared.txt", "the base\n")
	write("other.txt", "untouched\n")
	git("add", "shared.txt", "other.txt")
	git("commit", "--quiet", "-m", "the base")
	return r, git
}

// ---- from anemptygroupcloses_test.go ----

// aGroupBoxWithWork is a tree the queue understands, standing on a group branch.
func aGroupBoxWithWork(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	for _, args := range [][]string{
		{"init", "--initial-branch", "main"},
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "a box"},
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", "group/archive"},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	if got := theGroupOnTheBranch(r); got != "archive" {
		t.Fatalf("the tree stands on group %q, and this needs archive", got)
	}
	return r
}

// ---- from branchcarriesthegroup_test.go ----

// aBoxOnBranch is a work root that is a repository standing on one branch.
func aBoxOnBranch(t *testing.T, branch string) Roots {
	t.Helper()
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	for _, args := range [][]string{
		{"init", "--initial-branch", "main"},
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "a box"},
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", branch},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	return r
}

// ---- from claimfar_test.go ----

// aBoxHolding is a work tree with git in it, a remote, and one note that says
// it is claimed. The note is written by hand, so this stands up without the
// processes and the schemas a mint would want.
func aBoxHolding(t *testing.T, remote, id, by string) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	gitAt(t, root, "init", "--quiet")
	if remote != "" {
		gitAt(t, root, "remote", "add", "origin", remote)
	}
	at := filepath.Join(root, "spec", "work", id+".md")
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	// THE STAMP IS NOW, because a claim past its hours is dropped from the file
	// on the next write, which is a different rule from the one under test.
	note := "---\nkind: [[work-token]]\ntitle: " + id + "\nstatus: open\nclaimed_by: " + by +
		"\nclaimed_at: \"" + time.Now().UTC().Format(time.RFC3339) + "\"\n---\n\n## detail\n\na claim.\n"
	if err := os.WriteFile(at, []byte(note), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from g_archive_rows_travel_test.go ----

// archiveRowsTravelFixture writes a list holding one good row and answers the
// roots, the path of the list and the line it holds.
func archiveRowsTravelFixture(t *testing.T) (Roots, string, string) {
	t.Helper()
	dir := t.TempDir()
	rel := TheTrackedFolder + "/archive.jsonl"
	if err := os.MkdirAll(filepath.Join(dir, filepath.FromSlash(TheTrackedFolder)), 0o755); err != nil {
		t.Fatal(err)
	}
	held := `{"id":"tok-one","title":"a token that closed","process":"trivial","disposition":"done","on_branch":"` +
		strings.Repeat("a", 40) + `"}` + "\n"
	if err := os.WriteFile(filepath.Join(dir, filepath.FromSlash(rel)), []byte(held), 0o644); err != nil {
		t.Fatal(err)
	}
	return Roots{Work: dir, Method: dir}, rel, held
}

// ---- from g_commands_mirror_the_keywords_test.go ----

// aDeclaredTreeWithTwoConsoleControls is the smallest declaration that answers
// both shapes of line: a rung, which is sendable whole, and a number, which is
// not. The third control is reachable from no console and answers no line.
const aDeclaredTreeWithTwoConsoleControls = `{
  "name": "quackitect",
  "type": "group",
  "children": [
    {
      "name": "control",
      "type": "group",
      "children": [
        { "name": "ideation", "type": "bool", "console": true },
        { "name": "parallel_agents", "type": "int", "console": true, "min": 0, "max": 20 },
        { "name": "hidden", "type": "bool" }
      ]
    }
  ]
}
`

// aPlantedMethodRoot writes that declaration into a temporary folder and
// answers roots pointed at it. The icon table is there because reading a tree
// resolves the marks, and an empty table resolves every name to itself.
func aPlantedMethodRoot(t *testing.T) Roots {
	t.Helper()
	dir := t.TempDir()
	config := filepath.Join(dir, "spec", "config")
	if err := os.MkdirAll(config, 0o755); err != nil {
		t.Fatalf("the planted config folder could not be made: %v", err)
	}
	for name, text := range map[string]string{
		"parameters.json": aDeclaredTreeWithTwoConsoleControls,
		"icons.json":      "{}\n",
	} {
		if err := os.WriteFile(filepath.Join(config, name), []byte(text), 0o644); err != nil {
			t.Fatalf("the planted %s could not be written: %v", name, err)
		}
	}
	return Roots{Work: dir, Method: dir}
}

// ---- from g_projections_carry_chapters_test.go ----

// THE TREE IS PLANTED HERE RATHER THAN READ OFF THE WORK FOLDER. A test that
// judges whatever the real method happens to hold answers that nobody has
// broken the rule yet, which is not the same answer as the rule holding. Every
// case below builds its own method root, its own sources and its own
// projection map.
func aPlantedProjectionTree(t *testing.T) Roots {
	t.Helper()
	dir := t.TempDir()
	write := func(rel, text string) {
		at := filepath.Join(dir, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("spec/config/projections.json", `{"projections":[
	  {"name":"a chaptered projection","target":".made/rules.md","wrap":"markdown",
	   "section":"Actionables","sources_from":"spec/guidance","preamble":"src/cage/how-to-read.md"},
	  {"name":"a whole copy","target":".made/whole.json","wrap":"none",
	   "sources":["src/cage/whole.json"]}
	]}`)
	write("src/cage/how-to-read.md", "# How to read this\n\nWhat you are looking at.\n")
	write("src/cage/whole.json", "{}\n")
	write("spec/guidance/one-rule.md", theGuidanceSource("one"))
	write("spec/guidance/two-rules.md", theGuidanceSource("two"))
	return Roots{Method: dir, Work: dir}
}

// ---- from g_the_cage_cites_what_is_here_test.go ----

// cageCitesFixture builds a tree carrying one note in the record, one row in the
// archive, one note in the folder that never travels, and one file worth citing.
func cageCitesFixture(t *testing.T) Roots {
	t.Helper()
	dir := t.TempDir()
	write := func(rel, text string) {
		at := filepath.Join(dir, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(TheTrackedFolder+"/"+cageCitesAHeldToken+".md", "kind: [[work-token]]\n")
	write(TheTrackedFolder+"/archive.jsonl",
		`{"id":"`+cageCitesAClosedToken+`","title":"a token that closed"}`+"\n")
	write(cageCitesThePrivateFolder+"/"+cageCitesAPrivateToken+".md", "kind: [[work-token]]\n")
	write("src/cage/hooks-the-harness-fires.md", "the table the spike measured\n")
	return Roots{Work: dir, Method: dir}
}

// ---- from g_the_cards_reach_their_box_test.go ----

// cardsReachRoots is a tree with nothing in it, because the rule is decided off
// the bytes going in and never off what the tree happens to hold.
func cardsReachRoots(t *testing.T) Roots {
	t.Helper()
	dir := t.TempDir()
	return Roots{Work: dir, Method: dir}
}

// ---- from g_the_travelling_cage_cannot_block_test.go ----

// cageCannotBlockRoots is a tree with nothing in it. The rule is decided off the
// bytes going in, so the door reads no folder, and a root is built anyway so
// that a later reading has one and no case ever reaches the live tree.
func cageCannotBlockRoots(t *testing.T) Roots {
	t.Helper()
	dir := t.TempDir()
	return Roots{Work: dir, Method: dir}
}

// ---- from keywordsaid_test.go ----

// A CONTROL A CONSOLE CAN REACH, AND ONE IT CANNOT.
func aConsoleTree(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	os.WriteFile(filepath.Join(r.Method, "src", "config", "parameters.json"), []byte(`{
	  "name":"quackitect","type":"group","children":[
	    {"name":"guards","type":"group","shown":true,"children":[
	      {"name":"search_via_index","type":"bool","default":true,"console":true,
	       "help":"Every search goes through the index."},
	      {"name":"stop_needs_claim","type":"bool","default":true}]}]}`), 0o644)
	return r
}

// ---- from landbeforeworking_test.go ----

// aBoxBehindItsOrigin builds an origin, clones it, moves origin on by one
// commit, and fetches. The clone is then one behind and knows it.
func aBoxBehindItsOrigin(t *testing.T, branch string) Roots {
	t.Helper()
	origin := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	for _, args := range [][]string{
		{"init", "--initial-branch", branch},
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "an origin"},
		{"commit", "--allow-empty", "-m", "one"},
	} {
		if _, err := gitHere(origin, args...); err != nil {
			t.Fatalf("origin git %v: %v", args, err)
		}
	}
	box := Roots{Method: origin.Method, Work: t.TempDir()}
	if _, err := gitHere(origin, "clone", "--quiet", origin.Work, box.Work); err != nil {
		t.Fatalf("the clone failed: %v", err)
	}
	for _, args := range [][]string{
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "a box"},
	} {
		if _, err := gitHere(box, args...); err != nil {
			t.Fatalf("the box could not be named: %v", err)
		}
	}
	if _, err := gitHere(origin, "commit", "--allow-empty", "-m", "two"); err != nil {
		t.Fatalf("origin could not move on: %v", err)
	}
	if _, err := gitHere(box, "fetch", "--quiet"); err != nil {
		t.Fatalf("the box could not fetch: %v", err)
	}
	return box
}

// ---- from linttoolsrunonce_test.go ----

// aTreeTheLintFindsNothingIn is a tree the lint has nothing to say about, so a
// clean of false in it is about one thing.
//
// THE PROCESSES ALONE ARE NOT ENOUGH. The lint also reads the icons, the
// parameter declaration and the guidance, and a tree missing any of the three
// carries a finding for it, which would answer this test's question for it.
func aTreeTheLintFindsNothingIn(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	if err := os.MkdirAll(filepath.Join(r.Method, "src", "config"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"icons.json", "parameters.json"} {
		b, err := os.ReadFile(filepath.Join("..", "..", "src", "config", name))
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(r.Method, "src", "config", name), b, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	from := filepath.Join("..", "..", "spec", "guidance")
	if err := os.CopyFS(filepath.Join(r.Method, "spec", "guidance"), os.DirFS(from)); err != nil {
		t.Fatal(err)
	}
	return r
}

// ---- from mintapproach_test.go ----

// aTreeRequiringAnApproach is a tree whose one process wants a detail and an
// approach, which is the shape the standard process has.
func aTreeRequiringAnApproach(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	dir := ProcessesDir(f.Work)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: shaped
description: a change that wants a shape a reader can disagree with
sections:
  required:
    - detail
    - approach
states:
  - name: open
    description: written with its approach, and waiting to be taken
activities:
  - name: ask
    does: write it with its approach
    to: open
dispositions:
  - name: done
    description: it was done
`
	if err := os.WriteFile(filepath.Join(dir, "shaped.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return f.Roots
}

// ---- from passovernamesthefile_test.go ----

// aCloneWithBothKindsOfPassOver hands back a clone carrying two tokens the
// branch has archived. One is a note under spec/work that the branch has moved
// on from, so a fetch really would bring it into step. The other is a private
// note under .se/work, which no fetch reaches at all.
func aCloneWithBothKindsOfPassOver(t *testing.T) (Roots, Token, Token) {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "behind the branch")
	gitAt(t, r.Work, "add", "--", "doc", "src")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)
	behind := Roots{Method: clone, Work: clone}

	// THE PRIVATE COPY IS MINTED IN THE CLONE, so it is under .se/work there
	// and the branch has never carried it.
	private, err := Mint(behind, Token{Tracked: local(), Process: "trivial", Title: "a private copy",
		Detail:   "a copy of work the branch has already archived",
		Criteria: []Criterion{{Says: "the notice names the file it means"}}})
	if err != nil {
		t.Fatalf("minting the private copy: %v", err)
	}

	// THE BRANCH CLOSES THE TRACKED ONE AND ARCHIVES BOTH IDS.
	tok.Disposition, tok.Status = Done, "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}
	list := filepath.Join(r.Work, "spec", "work", "archive.jsonl")
	was, _ := os.ReadFile(list)
	rows := string(was) +
		`{"id":"` + tok.ID + `","title":"behind the branch","disposition":"done"}` + "\n" +
		`{"id":"` + private.ID + `","title":"a private copy","disposition":"done"}` + "\n"
	if err := os.WriteFile(list, []byte(rows), 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "spec/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the close and the rows")

	gitAt(t, clone, "fetch", "--quiet", "origin")
	if at := noteAt(behind, tok.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so it is not behind the branch", tok.ID)
	}
	if at := noteAt(behind, private.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so there is no private copy to name", private.ID)
	}
	return behind, tok, private
}

// ---- from thebranchdisagrees_test.go ----

// aCloneWhoseBranchDisagrees hands back a clone whose note is on the fetched
// branch byte for byte as it is here, while that same branch archives the id.
//
// THE ARCHIVE ROW IS WRITTEN AND THE NOTE IS NOT TOUCHED, which is the shape
// the record was actually found in: a close that wrote its row and left the
// note standing.
func aCloneWhoseBranchDisagrees(t *testing.T) (Roots, Token) {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "the record disagrees")
	gitAt(t, r.Work, "add", "--", "doc", "src")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)

	// THE BRANCH ARCHIVES THE ID AND LEAVES THE NOTE ALONE.
	list := filepath.Join(r.Work, "spec", "work", "archive.jsonl")
	was, _ := os.ReadFile(list)
	row := string(was) + `{"id":"` + tok.ID + `","title":"` + tok.Title + `","disposition":"done"}` + "\n"
	if err := os.WriteFile(list, []byte(row), 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "spec/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the row and not the note")

	gitAt(t, clone, "fetch", "--quiet", "origin")
	behind := Roots{Method: clone, Work: clone}
	if at := noteAt(behind, tok.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so there is nothing to disagree about", tok.ID)
	}
	return behind, tok
}

// ---- from thedigestseesitall_test.go ----

func aTreeToProject(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	if _, err := GuidanceDigest(r.Method); err != nil {
		t.Skipf("this fixture carries no projections to digest: %v", err)
	}
	return r
}
