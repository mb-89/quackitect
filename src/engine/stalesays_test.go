package main

import (
	"os"
	"strings"
	"testing"
	"time"
)

// AN ENGINE OLDER THAN ITS SOURCE SAYS SO IN THE ANSWER ITSELF.
//
// Measured 2026-09-06: a box answered from a binary built before the source
// moved, and two defects were reported to the owner that were the binary's
// age. The card at session start warns once, at the top. The answer that
// misleads arrives an hour later, so the sentence goes where the reader is
// looking, which is the answer.
//
// THE SOURCE IS MOVED, NOT THE BINARY. The program answering here is the test
// binary, built when the suite was built, and a test cannot rebuild it. So the
// tree's source is dated an hour either side of it, which drives the same
// comparison from both ends.

func TestAStaleEngineSaysSoInItsAnswer(t *testing.T) {
	t.Parallel()
	f := aTree(t)
	src := f.write("src/engine/pull.go", "package main\n")
	later := time.Now().Add(time.Hour)
	if err := os.Chtimes(src, later, later); err != nil {
		t.Fatal(err)
	}
	var out, errs strings.Builder
	c := &call{roots: f.Roots, out: &out, err: &errs}

	c.answerJSON(map[string]any{"pull": "work"})

	said := out.String()
	// THE LINE NAMES THE NEWER FILE AND THE AGE, so a reader knows what to
	// rebuild, and the answer it was carried on is still whole.
	for _, want := range []string{"\"stale\"", "pull.go", "newer than", "built", "\"pull\": \"work\""} {
		if !strings.Contains(said, want) {
			t.Fatalf("the source is newer than the engine and the answer does not carry %q:\n%s", want, said)
		}
	}
}

func TestAnEngineAsNewAsItsSourceSaysNothing(t *testing.T) {
	t.Parallel()
	f := aTree(t)
	src := f.write("src/engine/pull.go", "package main\n")
	earlier := time.Now().Add(-time.Hour)
	if err := os.Chtimes(src, earlier, earlier); err != nil {
		t.Fatal(err)
	}
	var out, errs strings.Builder
	c := &call{roots: f.Roots, out: &out, err: &errs}

	c.answerJSON(map[string]any{"pull": "work"})

	if strings.Contains(out.String(), "stale") {
		t.Fatalf("the engine is newer than its source and the answer calls itself stale:\n%s", out.String())
	}
}
