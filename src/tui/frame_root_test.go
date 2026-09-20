// One frame of the window, drawn with no terminal, off a log a case writes.
// [[spec/design_output/tui#one-frame]]

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

func TestAFrameDrawsTheWindowWithNoTerminal(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "a.jsonl")
	put(t, path, one+two+three)
	said, err := Frame(path, 100, 8, "details", "", "", time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"session start", "prompt", "reply", "│", "hello", "hi"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the frame shows %q, and drew:\n%s", want, said)
		}
	}
}
