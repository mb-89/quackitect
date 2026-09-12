// The tail against real files in a folder the test owns. The hook rewrites the
// whole file on every line, so these tests write it the same way.

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

const (
	one   = `{"at":"2026-09-11T15:00:01Z","level":"info","kind":"level0","said":"session start"}` + "\n"
	two   = `{"at":"2026-09-11T15:00:02Z","level":"info","kind":"prompt","said":"hi"}` + "\n"
	three = `{"at":"2026-09-11T15:00:03Z","level":"info","kind":"reply","said":"hello"}` + "\n"
)

func put(t *testing.T, path, text string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestARewrittenFileHandsOverOnlyTheNewLines(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one)
	tail := newTailer(path)
	recs, restarted, _ := tail.read()
	if len(recs) != 1 || restarted {
		t.Fatalf("the first read hands over one row, and handed %d restarted %v", len(recs), restarted)
	}
	put(t, path, one+two)
	recs, restarted, _ = tail.read()
	if len(recs) != 1 || recs[0].Kind != "prompt" || restarted {
		t.Fatalf("the rewrite hands over the prompt alone, and handed %d restarted %v", len(recs), restarted)
	}
}

func TestAFileCaughtMidRewriteHandsOverNothingAndRestartsNothing(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one+two)
	tail := newTailer(path)
	tail.read()
	put(t, path, one[:10])
	recs, restarted, _ := tail.read()
	if len(recs) != 0 || restarted {
		t.Fatalf("a half-written file hands over nothing and restarts nothing, and handed %d restarted %v", len(recs), restarted)
	}
	put(t, path, one+two+three)
	recs, restarted, _ = tail.read()
	if len(recs) != 1 || recs[0].Kind != "reply" || restarted {
		t.Fatalf("the finished rewrite hands over the reply alone, and handed %d restarted %v", len(recs), restarted)
	}
}

func TestAFileWithOtherLinesRestartsTheRead(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one+two)
	tail := newTailer(path)
	tail.read()
	put(t, path, three)
	recs, restarted, _ := tail.read()
	if len(recs) != 1 || !restarted {
		t.Fatalf("different lines restart the read with one row, and handed %d restarted %v", len(recs), restarted)
	}
}

func TestAHalfLineWaitsForItsEnd(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one+two[:20])
	tail := newTailer(path)
	recs, _, _ := tail.read()
	if len(recs) != 1 {
		t.Fatalf("the half line waits, so one row comes over, and %d came", len(recs))
	}
	put(t, path, one+two)
	recs, _, _ = tail.read()
	if len(recs) != 1 || recs[0].Said != "hi" {
		t.Fatalf("the finished line comes over whole, and %d came", len(recs))
	}
}

// [[spec/design_output/viewer#a-rotation-starts-it-again]]
func TestARotatedSessionStartsTheReadAgainOnItsOwnLines(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	put(t, path, one+two+three)
	tail := newTailer(path)
	tail.read()
	put(t, path, "")
	recs, restarted, _ := tail.read()
	if len(recs) != 0 || restarted {
		t.Fatalf("the emptied file waits for its first line, and handed %d restarted %v", len(recs), restarted)
	}
	fresh := `{"at":"2026-09-12T08:00:00Z","level":"info","kind":"level0","said":"session start"}` + "\n"
	put(t, path, fresh)
	recs, restarted, _ = tail.read()
	if len(recs) != 1 || !restarted || recs[0].At.Day() != 12 {
		t.Fatalf("the new session starts the read on its first line, and handed %d restarted %v", len(recs), restarted)
	}
}

func TestAnOlderLineNamingItsDoorStillReadsItsKind(t *testing.T) {
	t.Parallel()
	r := ParseRecord(`{"at":"2026-09-11T15:00:01Z","level":"info","door":"tool","said":"x","tool":"Read"}`)
	if r.Kind != "tool" || r.Label() != "Read" || len(r.Extra) != 1 {
		t.Fatalf("a line from before the rename reads door as its kind, and read %+v", r)
	}
}

func TestAFrameDrawsTheWindowWithNoTerminal(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one+two+three)
	said, err := Frame(path, 100, 8, "details", "", time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"session start", "prompt", "reply", "│", "hello", "hi"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the frame shows %q, and drew:\n%s", want, said)
		}
	}
}
