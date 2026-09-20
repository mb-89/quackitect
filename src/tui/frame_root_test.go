// One frame of the window, drawn with no terminal, off the log the cases share.
// [[spec/design_output/tui#one-frame]]

package main

import (
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestAFrameDrawsTheWindowWithNoTerminal(t *testing.T) {
	t.Parallel()
	said, err := Frame(filepath.Join("testdata", "session.jsonl"), 100, 8, "details", "", "", time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"session start", "prompt", "reply", "│", "hello", "hi"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the frame shows %q, and drew:\n%s", want, said)
		}
	}
}
