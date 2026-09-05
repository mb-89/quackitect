package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"
)

// A WRITE THAT FAILS LEAVES WHAT WAS THERE, RATHER THAN NOTHING.
//
// This is the property the guard's state needs and os.WriteFile does not have.
// The loaders all swallow a read failure into an empty value, so a truncated
// file is not a wrong obligation, it is no obligation, and nothing says one was
// ever owed.
func TestAWriteThatFailsLeavesTheOldFile(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	path := filepath.Join(dir, "state.json")
	if err := writeAtomic(path, []byte(`{"owed":1}`), 0o644); err != nil {
		t.Fatal(err)
	}

	// A WRITE THAT CANNOT LAND. The target is made a directory, so the rename
	// fails after the bytes are written, which is the shape of the crash this
	// guards: the new content exists and the name does not point at it yet.
	blocked := filepath.Join(dir, "blocked.json")
	if err := os.Mkdir(blocked, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := writeAtomic(blocked, []byte(`{"owed":2}`), 0o644); err == nil {
		t.Error("a write onto a directory answered no error")
	}
	// AND IT LEFT NO RUBBISH BESIDE IT. A temporary file left behind is read by
	// nothing and grows for ever.
	left, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range left {
		if strings.Contains(e.Name(), ".tmp") {
			t.Errorf("a failed write left %s behind", e.Name())
		}
	}

	// The first file is untouched by any of it.
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(b) != `{"owed":1}` {
		t.Errorf("the file that was already there now reads %q", b)
	}
}

// AND A WRITE OVER AN EXISTING FILE REPLACES IT WHOLE.
//
// The rename is the only moment a reader can see a change, so a reader that
// opens the file at any instant reads one complete version or the other.
func TestAWriteReplacesTheWholeFile(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "state.json")
	for _, want := range []string{
		`{"owed":1,"and":"a much longer first version of this file"}`,
		`{"owed":2}`,
	} {
		if err := writeAtomic(path, []byte(want), 0o644); err != nil {
			t.Fatal(err)
		}
		b, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		if string(b) != want {
			t.Errorf("it reads %q where %q was written", b, want)
		}
	}
}

// EVERY TEMPORARY THE ENGINE LEAVES UNDER .se IS SWEPT, AND ONE SUFFIX SAYS
// WHICH ONES THEY ARE.
//
// The sweep took names ending .tmp, which is what writeAtomic makes. Snapshot
// and Publish build a temporary git index with os.CreateTemp under
// "snapshot.*.index" and "claim.*.index", and a process killed before its
// deferred remove left one in .se for ever. A swap kills the engine on purpose,
// so this is the ordinary case and not the rare one.
//
// THE PATTERNS ARE READ OUT OF THE SOURCE, not typed here. A third temporary
// added under a fourth suffix is the same defect coming back, and a list in this
// file would go on passing over it.
func TestEveryTemporaryTheEngineMakesIsSwept(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		t.Fatal(err)
	}
	// EVERY LITERAL PATTERN THIS PACKAGE HANDS os.CreateTemp. writeAtomic builds
	// its own from the file it is replacing, so its suffix is written in beside
	// them rather than read: the sweep has to take that one too.
	patterns := map[string]string{"state.json.*.tmp": "atomic.go"}
	here, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	literal := regexp.MustCompile(`os\.CreateTemp\([^,]+,\s*"([^"]+)"`)
	for _, e := range here {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") {
			continue
		}
		b, err := os.ReadFile(e.Name())
		if err != nil {
			t.Fatal(err)
		}
		for _, m := range literal.FindAllStringSubmatch(string(b), -1) {
			patterns[m[1]] = e.Name()
		}
	}
	if len(patterns) < 3 {
		t.Fatalf("%d temporary patterns were found, and this package writes at least three", len(patterns))
	}
	// EACH ONE IS PUT IN .se AND IN A FOLDER UNDER IT, because a coverage
	// profile is made in .se/tests and a sweep of the top level alone missed it.
	under := r.Private("tests")
	if err := os.MkdirAll(under, 0o755); err != nil {
		t.Fatal(err)
	}
	for pattern, where := range patterns {
		for _, at := range []string{r.Private(), under} {
			f, err := os.CreateTemp(at, pattern)
			if err != nil {
				t.Fatal(err)
			}
			f.Close()
			if SweepOrphanedWrites(r, 0) == 0 {
				t.Errorf("%s makes %q in %s and the sweep left it behind, so a killed "+
					"process leaves it there for ever", where, pattern, at)
			}
			left, err := os.ReadDir(at)
			if err != nil {
				t.Fatal(err)
			}
			for _, e := range left {
				if e.IsDir() {
					continue
				}
				t.Errorf("%s was left in %s after the sweep, from %q", e.Name(), at, pattern)
				_ = os.Remove(filepath.Join(at, e.Name()))
			}
		}
	}
}

// AND A TEMPORARY YOUNGER THAN THE AGE IT IS GIVEN IS LEFT ALONE, because it
// may belong to a write happening now in another process over the same tree.
func TestASweepLeavesAWriteThatMayStillBeGoing(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		t.Fatal(err)
	}
	f, err := os.CreateTemp(r.Private(), "snapshot.*.index.tmp")
	if err != nil {
		t.Fatal(err)
	}
	f.Close()
	if swept := SweepOrphanedWrites(r, time.Minute); swept != 0 {
		t.Errorf("a temporary written a moment ago was swept, and %d went", swept)
	}
}

// THE GUARD'S STATE GOES THROUGH IT, and this is what says so. A new writer
// added with os.WriteFile is the defect coming back, and it would come back
// quietly, because a truncated file reads as an empty one.
func TestTheGuardsStateIsWrittenAtomically(t *testing.T) {
	t.Parallel()
	// Every file the guard rebuilds from scratch on a tool call, named by the
	// function that writes it.
	//
	// A NAME HERE THAT THE TREE NO LONGER DECLARES IS A FAILURE, NOT A SKIP. It
	// listed ticket.go, which went with the ticket, and a list that quietly
	// passes over what is missing is a list nobody notices has gone stale.
	for _, name := range []string{
		"arrival.go", "evidence.go", "gate.go", "heard.go", "hold.go",
		"hook.go", "investigate.go", "owed.go", "stop.go",
		"tools.go", "watch.go",
	} {
		b, err := os.ReadFile(filepath.Join("..", "..", "src", "engine", name))
		if err != nil {
			t.Errorf("%s is named here and this package has no such file. "+
				"Take it off the list, or put back what wrote guard state in it: %v", name, err)
			continue
		}
		if strings.Contains(string(b), "os.WriteFile(") {
			t.Errorf("%s writes guard state with os.WriteFile, which truncates first. "+
				"Use writeAtomic: every loader here reads a failure as an empty value, "+
				"so a half-written file is state that silently disappears", name)
		}
	}
}
