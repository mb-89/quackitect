package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// loadLinesIn answers what the record holds about the engine's load.
func loadLinesIn(t *testing.T, r Roots) []string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, l := range strings.Split(string(b), "\n") {
		var rec struct {
			Kind string `json:"kind"`
			Msg  string `json:"msg"`
		}
		if json.Unmarshal([]byte(l), &rec) == nil && rec.Kind == "load" {
			out = append(out, rec.Msg)
		}
	}
	return out
}

// THE HEADLINE SAYS WHICH BOUND TRIPPED.
//
// Three bounds put a line in the record: a deep queue, a long wait, and a long
// answer. The first two say other work is piling up behind the guard, which is
// what a bottleneck is. The third says one hook took a while, with nobody
// behind it, which is a different fact.
//
// MEASURED. The owner read "the guard is the bottleneck: 1 queued, waited 0 ms"
// and asked how that is a bottleneck. It is not, and the numbers beside the
// headline said so while the headline said otherwise.
func TestTheLoadLineSaysWhichBoundTripped(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	var load engineLoad

	// A slow answer with nobody queued. The rate limit is reset between the
	// two, because it allows one line a minute and this wants both.
	load.lastSaid.Store(0)
	load.noteHook(log, 1, 0, hookTookBound+100*time.Millisecond)
	load.lastSaid.Store(0)
	load.noteHook(log, hookQueueBound+1, hookWaitBound+50*time.Millisecond, time.Millisecond)

	said := loadLinesIn(t, r)
	if len(said) != 2 {
		t.Fatalf("the record holds %d load lines, want 2: %v", len(said), said)
	}
	if strings.Contains(said[0], "bottleneck") {
		t.Errorf("a slow answer with an empty queue is called a bottleneck: %q", said[0])
	}
	if !strings.Contains(said[1], "bottleneck") {
		t.Errorf("a deep queue is not called a bottleneck: %q", said[1])
	}
	// BOTH HALVES CARRY EVERY NUMBER, so a reader who doubts the headline can
	// check it against the line it sits on.
	for _, line := range said {
		for _, want := range []string{"queued", "waited", "answered in"} {
			if !strings.Contains(line, want) {
				t.Errorf("a load line does not say %s: %q", want, line)
			}
		}
	}
}
