package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// UC-34. Every call is in the log, and each line names who wrote it.
func TestEveryWriteReachesTheFileAndNamesItsWriter(t *testing.T) {
	dir := t.TempDir()
	l, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "one", Yes(), nil)
	l.Write("agent", "call", "helper-1", "two", nil, map[string]any{"path": "x"})
	l.Close()

	b, err := os.ReadFile(filepath.Join(dir, Current))
	if err != nil {
		t.Fatal(err)
	}
	lines := strings.Split(strings.TrimSpace(string(b)), "\n")
	if len(lines) != 2 {
		t.Fatalf("expected two records, got %d", len(lines))
	}
	var r Record
	if err := json.Unmarshal([]byte(lines[1]), &r); err != nil {
		t.Fatal(err)
	}
	if r.Actor != "helper-1" || r.Src != "agent" || r.Seq != 2 {
		t.Fatalf("the record does not name its writer: %+v", r)
	}
}

// A long session is unbounded. The file is not, and the session stays one
// scope across the parts.
func TestTheFileRotatesAndTheSessionDoesNot(t *testing.T) {
	dir := t.TempDir()
	l, _ := OpenLog(dir)
	l.limit = 400
	for i := 0; i < 40; i++ {
		l.Write("engine", "note", "engine", strings.Repeat("x", 40), nil, nil)
	}
	l.Close()
	names, _ := filepath.Glob(filepath.Join(dir, "session*.jsonl"))
	if len(names) < 2 {
		t.Fatalf("expected the file to rotate, found %v", names)
	}
	// The current file keeps its name through every rotation, so a window
	// open on it keeps working.
	if _, err := os.Stat(filepath.Join(dir, Current)); err != nil {
		t.Fatal("the current file lost its name when it rotated")
	}
	want := l.Session()
	for _, n := range names {
		b, _ := os.ReadFile(n)
		for _, line := range strings.Split(strings.TrimSpace(string(b)), "\n") {
			var r Record
			if json.Unmarshal([]byte(line), &r) == nil && r.Session != want {
				t.Fatalf("a part carries a different session: %q", r.Session)
			}
		}
	}
}

// The log is private material. It holds prompts, so it lives where private
// material lives and never travels.
func TestTheLogLivesInThePrivateFolder(t *testing.T) {
	r := Roots{Method: "/m", Work: "/w"}
	got := r.Private("log")
	if filepath.ToSlash(got) != "/w/.se/log" {
		t.Fatalf("the log should be private, got %s", got)
	}
}

// The session that was current is set aside under a stamped name, never
// deleted, and the new session starts on a clean file with the same name.
func TestAnEarlierSessionIsSetAsideNotOverwritten(t *testing.T) {
	dir := t.TempDir()
	first, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	first.Write("engine", "start", "engine", "the first session", Yes(), nil)
	first.Close()

	second, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	second.Write("engine", "start", "engine", "the second session", Yes(), nil)
	second.Close()

	b, _ := os.ReadFile(filepath.Join(dir, Current))
	if strings.Contains(string(b), "the first session") {
		t.Fatal("the earlier session was written over")
	}
	if !strings.Contains(string(b), "the second session") {
		t.Fatal("the current file does not hold the current session")
	}
	stamped, _ := filepath.Glob(filepath.Join(dir, "session-*.jsonl"))
	if len(stamped) != 1 {
		t.Fatalf("expected one file set aside, found %v", stamped)
	}
	b, _ = os.ReadFile(stamped[0])
	if !strings.Contains(string(b), "the first session") {
		t.Fatal("the file set aside is not the earlier session")
	}
}

// Opening a window before any engine must not show the last session. The
// editor sets the current log aside when a window opens, and nothing is lost.
func TestRotatingWithoutAnEngineKeepsWhatWasThere(t *testing.T) {
	dir := t.TempDir()
	l, _ := OpenLog(dir)
	l.Write("engine", "start", "engine", "the session before", Yes(), nil)
	l.Close()

	if err := RetireCurrent(dir); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(dir, Current)); err == nil {
		t.Fatal("the current file should be gone, not empty")
	}
	stamped, _ := filepath.Glob(filepath.Join(dir, "session-*.jsonl"))
	if len(stamped) != 1 {
		t.Fatalf("expected the session to be kept, found %v", stamped)
	}
	// Twice in a row does nothing the second time.
	if err := RetireCurrent(dir); err != nil {
		t.Fatal(err)
	}
	stamped, _ = filepath.Glob(filepath.Join(dir, "session-*.jsonl"))
	if len(stamped) != 1 {
		t.Fatalf("a second rotation invented a file: %v", stamped)
	}
}
