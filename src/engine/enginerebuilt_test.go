package main

import (
	"os"
	"quackitect/engine/internal/version"
	"strings"
	"testing"
	"time"
)

// A REBUILD REPLACES THE FILE AND NOT THE PROCESS, AND THE ANSWER SAYS SO.
//
// stalesays_test.go drives the source against the program answering, and
// residentStale drives the source against .bin/se. Neither drives the program
// answering against .bin/se, which is exactly what a rebuild leaves behind:
// the file on disk is new and the engine that lives is the one it replaced.
//
// Measured 2026-09-06: .se/engine.json named pid 28920, started 11:37:16,
// build 0e09b4b.113702, while .bin/se had been rebuilt at 11:47 and again at
// 11:58. Every call that day was answered by a process that predated the file
// it was started from, and nothing in any answer said so.
//
// THE FILE IS MOVED, NOT THE PROGRAM. The program answering here is the test
// binary, built when the suite was built, and a test cannot rebuild it. So
// .bin/se in the fixture tree is dated an hour either side of it, which drives
// the same comparison from both ends.
func TestAnEngineOlderThanTheBinItRanFromSaysSo(t *testing.T) {
	t.Parallel()
	f := aTree(t)
	bin := f.write(".bin/"+exeName("se"), "an engine")
	later := time.Now().Add(time.Hour)
	if err := os.Chtimes(bin, later, later); err != nil {
		t.Fatal(err)
	}

	var out, errs strings.Builder
	c := &call{roots: f.Roots, out: &out, err: &errs}
	c.answerJSON(map[string]any{"pull": "work"})
	said := out.String()

	// IT NAMES THE BUILD IT IS RUNNING, so a reader can tell the process from
	// the file, and the answer it was carried on is still whole.
	for _, want := range []string{"\"stale\"", ".bin", "newer", version.Build, "\"pull\": \"work\""} {
		if !strings.Contains(said, want) {
			t.Fatalf("the binary on disk is newer than the engine answering and the answer does not carry %q:\n%s", want, said)
		}
	}
	// AND IT NAMES THE WAY OUT, WHICH IS A RESTART. Building again writes the
	// same file over the same process, so advice to rebuild is advice to
	// repeat what already happened.
	if !strings.Contains(said, "restart the engine") {
		t.Fatalf("the answer does not say to restart the engine, which is the only thing that replaces the process:\n%s", said)
	}
	if strings.Contains(said, "rebuild") {
		t.Fatalf("the answer sends the reader to rebuild, and the rebuild is what left the old process answering:\n%s", said)
	}

	// AND AN ENGINE NO OLDER THAN THE FILE SAYS NOTHING.
	earlier := time.Now().Add(-time.Hour)
	if err := os.Chtimes(bin, earlier, earlier); err != nil {
		t.Fatal(err)
	}
	var fresh, freshErrs strings.Builder
	second := &call{roots: f.Roots, out: &fresh, err: &freshErrs}
	second.answerJSON(map[string]any{"pull": "work"})
	if strings.Contains(fresh.String(), "stale") {
		t.Fatalf("the engine is newer than the binary on disk and the answer calls itself stale:\n%s", fresh.String())
	}
}
