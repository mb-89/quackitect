package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// buildEngine answers the engine the package built once, in enginebin_test.go.
//
// It used to build its own into t.TempDir(), and so did every other helper
// like it. Windows will not run a file with no extension, so the fixture
// builds to the name the engine computes for itself.
func buildEngine(t *testing.T) string {
	t.Helper()
	return theEngine(t)
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

// UC-34. Every call is in the log, written by a separate process, appended to
// the session that is already running.
func TestTheGuardAppendsToTheRunningSession(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()

	// ONE LINE PER CALL, and it is written when the call comes back. A call and
	// an answer are one thing, so two lines say it twice.
	call := map[string]any{
		"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1", "tool_use_id": "t1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	}
	hookSays(t, exe, r.Method, "PreToolUse", call)
	if n := len(logLines(t, r)); n != 1 {
		t.Fatalf("asking wrote %d records, and asking on its own writes none", n-1)
	}
	hookSays(t, exe, r.Method, "PostToolUse", call)

	lines := logLines(t, r)
	if len(lines) != 2 {
		t.Fatalf("expected one record for the call, got %d", len(lines)-1)
	}
	var rec Record
	json.Unmarshal([]byte(lines[1]), &rec)
	if rec.Actor != "helper-1" {
		t.Fatalf("the record does not name who acted: %+v", rec)
	}
	// THE SOURCE IS WHOEVER ASKED, and the line says what was asked.
	if rec.Src != "agent" || rec.Kind != "call" {
		t.Fatalf("the line is %s/%s, and the agent asked", rec.Src, rec.Kind)
	}
	if !strings.Contains(rec.Msg, "notes.md") {
		t.Fatalf("the line does not say what was asked: %q", rec.Msg)
	}
	if rec.OK == nil || !*rec.OK {
		t.Fatal("a call that came back is not marked as having come back")
	}
}

func logLines(t *testing.T, r Roots) []string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	return strings.Split(strings.TrimSpace(string(b)), "\n")
}

// Read evidence is kept, and a compaction throws it away: the agent no longer
// holds what it read, so the record of having read it is no longer true.
func TestReadEvidenceIsResetByCompaction(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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

// UC-1 and UC-2. A folder with nothing in it can be driven, and two copies
// are two entries that both resolve.
func TestAnEmptyFolderCanBeDrivenAndTwoCopiesBothResolve(t *testing.T) {
	// NOT PARALLEL: t.Setenv sets a process-wide value, and Go
	// refuses the two together.
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
	// NOT PARALLEL: t.Setenv sets a process-wide value, and Go
	// refuses the two together.
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
	t.Parallel()
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

// A MULTI-LINE COMMAND IS RECORDED AS ITS CONTENT AND NOT AS ITS FIRST LINE.
// The owner read a log of `Bash python -c "` repeated forever and asked
// whether the agent was failing: it was the record cutting a multi-line
// program at the newline after the opening quote. The description folds the
// lines to spaces, and the cap still holds.
func TestAMultiLineCommandIsRecordedWhole(t *testing.T) {
	t.Parallel()
	got := describe("Bash", "", "python -c \"\nimport os\nprint(os.getcwd())\n\"")
	if got != `Bash python -c " import os print(os.getcwd()) "` {
		t.Fatalf("the record cut the command: %q", got)
	}
	long := describe("Bash", "", strings.Repeat("x", 300))
	if len(long) > len("Bash ")+200+len("…") || !strings.HasSuffix(long, "…") {
		t.Fatalf("the cap does not hold: %d chars", len(long))
	}
}
