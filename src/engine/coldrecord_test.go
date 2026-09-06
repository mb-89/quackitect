package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// A TREE THAT NEVER HAD AN ENGINE IS ANSWERED AT ONCE.
//
// loadRunning read engine.json twenty times, twenty five milliseconds apart,
// before it would say that no engine is running. The loop is there for the
// instant a beat replaces the file, and a tree with no record met it too. Half
// a second, every time, for an answer that was never in doubt.
//
// EVERY COLD CLIENT PAID IT, and the tests loudest. NoteSession took 507ms,
// NoteAgent 507ms, and StaffingOf 1.017s, which asks twice. A hook firing over
// a tree with no engine pays the same, and so does a command run before the
// engine starts.
//
// writeAtomic renames a temp over the target and never removes it first, so
// the path is empty only where nothing ever wrote one. That is the question
// asked first now.
func TestAColdRecordIsAnsweredAtOnce(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots

	start := time.Now()
	if _, up := LoadRunning(r); up {
		t.Fatal("a tree with no engine.json answered that an engine is running")
	}
	if took := time.Since(start); took > 50*time.Millisecond {
		t.Errorf("a cold read waited %s for an answer that was never in doubt",
			took.Round(time.Millisecond))
	}
}

// AND THE COLD ANSWER IS THE ONE THE READER ALWAYS GOT, word for word.
func TestAColdRecordSaysWhatItAlwaysSaid(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	if _, why := loadRunning(r); why != "record: no readable engine.json" {
		t.Errorf("a tree with no record answers %q", why)
	}
	if _, err := os.Stat(runningPath(r)); !os.IsNotExist(err) {
		t.Errorf("the fixture is not the shape this test is about: %v", err)
	}
}

// AND A RECORD TAKEN AWAY UNDER A READER IS STILL READ AGAIN.
//
// The retry is what stops a reader believing a miss it met mid-write, and a
// guard that believed one went cold for a call in the middle of a session. So
// a record that is there when the read begins keeps every try it had.
func TestARecordTakenAwayBetweenTriesIsReadAgain(t *testing.T) {
	r := aTree(t).Roots
	at := runningPath(r)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	b, err := json.Marshal(Running{PID: os.Getpid(), Beat: time.Now().UTC().Format(time.RFC3339)})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, b, 0o644); err != nil {
		t.Fatal(err)
	}

	// THE FILE GOES AWAY BETWEEN THE FIRST TRY AND THE SECOND, and comes back.
	was := readsRecord
	t.Cleanup(func() { readsRecord = was })
	tries := 0
	readsRecord = func(path string) ([]byte, error) {
		tries++
		if tries == 1 {
			os.Remove(path)
		}
		if tries == 2 {
			if err := os.WriteFile(path, b, 0o644); err != nil {
				t.Error(err)
			}
		}
		return was(path)
	}

	if _, why := loadRunning(r); why != "" {
		t.Fatalf("a record that came back was not read again: %s", why)
	}
	if tries < 2 {
		t.Errorf("the miss was believed on the first try, after %d read", tries)
	}
}
