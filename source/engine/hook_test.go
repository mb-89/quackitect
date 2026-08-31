package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func buildEngine(t *testing.T) string {
	t.Helper()
	// Windows will not run a file with no extension, so the name the engine
	// already computes for itself is the name the test must build to.
	exe := filepath.Join(t.TempDir(), exeName("se"))
	out, err := exec.Command("go", "build", "-o", exe, ".").CombinedOutput()
	if err != nil {
		t.Fatalf("building the engine failed: %s", out)
	}
	return exe
}

func hookSays(t *testing.T, exe, method, event string, body map[string]any) string {
	t.Helper()
	body["hook_event_name"] = event
	in, _ := json.Marshal(body)
	cmd := exec.Command(exe, "hook", "--method", method)
	cmd.Stdin = strings.NewReader(string(in))
	out, err := cmd.Output()
	if err != nil {
		t.Fatalf("the guard failed: %v", err)
	}
	return strings.TrimSpace(string(out))
}

// UC-3 and UC-35. The one refusal with no override, and the answer names the
// original. Everything else is allowed and recorded.
func TestTheGuardRefusesAProjectionAndNothingElse(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	deny := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "AGENTS.md")},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a projection write was not refused: %s", deny)
	}
	if !strings.Contains(deny, "voice.md") {
		t.Fatalf("the refusal does not name the original: %s", deny)
	}

	// An ordinary write, and one outside the roots. Neither is guarded.
	for _, p := range []string{filepath.Join(r.Work, "notes.md"), filepath.Join(t.TempDir(), "desktop.txt")} {
		got := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
			"cwd": r.Work, "tool_name": "Write",
			"tool_input": map[string]any{"file_path": p},
		})
		if got != "" {
			t.Fatalf("an ordinary write to %s was not allowed: %s", p, got)
		}
	}
}

// UC-34. Every call is in the log, written by a separate process, appended to
// the session that is already running.
func TestTheGuardAppendsToTheRunningSession(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	})

	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	lines := strings.Split(strings.TrimSpace(string(b)), "\n")
	if len(lines) != 2 {
		t.Fatalf("expected the guard to append one record, got %d", len(lines))
	}
	var rec Record
	json.Unmarshal([]byte(lines[1]), &rec)
	if rec.Actor != "helper-1" {
		t.Fatalf("the record does not name who acted: %+v", rec)
	}
}

// Read evidence is kept, and a compaction throws it away: the agent no longer
// holds what it read, so the record of having read it is no longer true.
func TestReadEvidenceIsResetByCompaction(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	file := filepath.Join(r.Work, "notes.md")
	os.WriteFile(file, []byte("first"), 0o644)

	hookSays(t, exe, r.Method, "PostToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": file},
	})
	if len(LoadEvidence(r).Reads) != 1 {
		t.Fatal("a read was not recorded as evidence")
	}

	// The file changes. What was read is no longer what is there.
	os.WriteFile(file, []byte("second"), 0o644)
	if stale := StaleReads(r); len(stale) != 1 {
		t.Fatalf("a changed file should read as stale, got %v", stale)
	}

	hookSays(t, exe, r.Method, "PreCompact", map[string]any{"cwd": r.Work})
	if n := len(LoadEvidence(r).Reads); n != 0 {
		t.Fatalf("compaction should reset the read evidence, %d left", n)
	}
}

// Every agent has an identity, and the record says which one acted.
func TestAnAgentIdentityIsRecordedWhenTheHarnessStartsIt(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	if KnownAgent(r, "helper-9") {
		t.Fatal("an identity nobody started is not known")
	}
	hookSays(t, exe, r.Method, "SubagentStart", map[string]any{
		"cwd": r.Work, "agent_id": "helper-9", "agent_type": "searcher",
	})
	if !KnownAgent(r, "helper-9") {
		t.Fatal("the identity the harness started was not recorded")
	}
	// main is always known: it is the agent the session belongs to.
	if !KnownAgent(r, "main") {
		t.Fatal("main should be known")
	}
}

// UC-32. A document that breaks a mechanical rule does not reach disk, and
// the refusal names the rule and the place.
func TestAWriteThatBreaksAVoiceRuleIsRefused(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	deny := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "note.md"),
			"content":   "This is one thing; this is another.\n",
		},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a semicolon in prose was not refused: %s", deny)
	}
	if !strings.Contains(deny, "no semicolon") {
		t.Fatalf("the refusal does not name the rule: %s", deny)
	}

	// The same text in a file that is not prose is nobody's business.
	ok := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "main.go"),
			"content":   "a := 1; b := 2\n",
		},
	})
	if ok != "" {
		t.Fatalf("code was checked as prose: %s", ok)
	}
}

// UC-1 and UC-2. A folder with nothing in it can be driven, and two copies
// are two entries that both resolve.
func TestAnEmptyFolderCanBeDrivenAndTwoCopiesBothResolve(t *testing.T) {
	home := t.TempDir()
	t.Setenv("SE_REGISTRY", home)
	a, b := t.TempDir(), t.TempDir()
	idA, err := RegisterCopy(a, "0.1.0")
	if err != nil {
		t.Fatal(err)
	}
	idB, err := RegisterCopy(b, "0.1.0")
	if err != nil {
		t.Fatal(err)
	}
	if idA == idB {
		t.Fatal("two copies share one identity")
	}
	if _, only := TheOnlyCopy(); only {
		t.Fatal("two copies is not one copy")
	}

	// An empty folder, driven by the second.
	work := t.TempDir()
	roots := Roots{Method: b, Work: work}
	if _, err := Attach(roots); err != nil {
		t.Fatal(err)
	}
	found, known, recorded := FindDriver(roots)
	if !recorded || !known || found != b {
		t.Fatalf("the driver did not resolve: %q known=%v recorded=%v", found, known, recorded)
	}

	// UC-1: an entry that no longer resolves is skipped, not an error.
	os.RemoveAll(a)
	if _, known, _ := FindDriver(roots); !known {
		t.Fatal("a gone copy took the good one with it")
	}
}

// The choice is asked once. Running init again clears it, which is how a
// project is moved to another vehicle.
func TestInitClearsTheDriverSoTheChoiceIsAskedAgain(t *testing.T) {
	r := guidanceTree(t)
	t.Setenv("SE_REGISTRY", t.TempDir())
	if _, err := Attach(r); err != nil {
		t.Fatal(err)
	}
	if _, ok := LoadDriven(r); !ok {
		t.Fatal("attach did not record a driver")
	}
	if _, err := Seed(r, AProject); err != nil {
		t.Fatal(err)
	}
	if _, ok := LoadDriven(r); ok {
		t.Fatal("init left a driver recorded, so the question never comes back")
	}
	// A vehicle drives itself, and that is not a choice anybody makes.
	if _, err := Seed(r, AVehicle); err != nil {
		t.Fatal(err)
	}
	if _, ok := LoadDriven(r); !ok {
		t.Fatal("a vehicle should drive itself")
	}
}

// UC-7. A configuration change resets the read evidence, because what was
// read was read under rules that no longer hold.
func TestAConfigurationChangeResetsTheReadEvidence(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()
	file := filepath.Join(r.Work, "notes.md")
	os.WriteFile(file, []byte("x"), 0o644)
	hookSays(t, exe, r.Method, "PostToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Read",
		"tool_input": map[string]any{"file_path": file},
	})
	if len(LoadEvidence(r).Reads) != 1 {
		t.Fatal("the read was not recorded")
	}
	hookSays(t, exe, r.Method, "ConfigChange", map[string]any{"cwd": r.Work})
	if n := len(LoadEvidence(r).Reads); n != 0 {
		t.Fatalf("a configuration change should reset the evidence, %d left", n)
	}
}

// A checker that cannot run says so and allows the write. A broken checker
// must not stop a person from working.
func TestABrokenVoiceCheckerDoesNotStopAWrite(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()
	os.Remove(filepath.Join(r.Method, "util", "voice-rules.json"))

	got := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "note.md"),
			"content":   "This is one thing; this is another.\n",
		},
	})
	if got != "" {
		t.Fatalf("a write was refused by a checker that could not run: %s", got)
	}
	b, _ := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if !strings.Contains(string(b), "voice rules could not be read") {
		t.Fatal("a checker that could not run said nothing about it")
	}
}

// Private originals do not travel. Digests do. A copy is a hash match, so
// nothing here judges what a file says.
func TestACopyOfAPrivateOriginalIsRefused(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	secret := "the whole of a paper that may not leave this machine\n"
	os.MkdirAll(r.Private("sources"), 0o755)
	os.WriteFile(filepath.Join(r.Private("sources"), "paper.txt"), []byte(secret), 0o644)

	deny := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "notes", "paper.txt"),
			"content":   secret,
		},
	})
	if !strings.Contains(deny, `"permissionDecision":"deny"`) {
		t.Fatalf("a copy of a private original was allowed: %s", deny)
	}
	if !strings.Contains(deny, "does not travel") {
		t.Fatalf("the refusal does not say why: %s", deny)
	}

	// A digest is not a copy, so it goes.
	ok := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Work, "notes", "digest.txt"),
			"content":   "A paper about one thing. Two findings. Kept under .se.\n",
		},
	})
	if ok != "" {
		t.Fatalf("a digest was refused: %s", ok)
	}

	// And moving it about INSIDE the private folder is nobody's business.
	inside := hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Write",
		"tool_input": map[string]any{
			"file_path": filepath.Join(r.Private("sources"), "paper-copy.txt"),
			"content":   secret,
		},
	})
	if inside != "" {
		t.Fatalf("a copy inside the private folder was refused: %s", inside)
	}
}
