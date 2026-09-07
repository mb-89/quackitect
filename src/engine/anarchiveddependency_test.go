package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A DEPENDENCY THAT ENDED BLOCKS NOTHING, AND THE ARCHIVE IS WHERE IT WENT.
//
// Blocked read depends_on with LoadToken alone. A close archives the note and
// takes it off the disk, so the load then failed and the dependency was
// reported as one that does not exist. A token whose dependency was finished
// was blocked for ever, and the queue passed over it in silence.
//
// MEASURED in bucket tests. A token waited on one the archive carries as done,
// and the queue called the group empty with that token open.
//
// AN ID IN NEITHER PLACE IS A REAL ABSENCE. That is a token nobody minted, or
// one whose id was mistyped, and it goes on blocking with the wording it had.
func TestAnArchivedDependencyBlocksNothing(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const ended, never = "wk-1111111111", "wk-2222222222"
	theArchiveSays(t, r, ended)

	// THE ONE THE ARCHIVE CARRIES BLOCKS NOTHING.
	done := aLocalToken(t, r, "waits on the archived")
	done.DependsOn = []string{ended}
	if err := SaveToken(r, done); err != nil {
		t.Fatal(err)
	}
	if why := Blocked(r, done); why != "" {
		t.Errorf("a dependency the archive carries as done blocked it: %s", why)
	}

	// AND THE ONE IN NEITHER PLACE STILL BLOCKS, SAYING WHAT IT IS.
	absent := aLocalToken(t, r, "waits on nothing")
	absent.DependsOn = []string{never}
	if err := SaveToken(r, absent); err != nil {
		t.Fatal(err)
	}
	why := Blocked(r, absent)
	if why == "" {
		t.Fatal("a dependency in neither doc/work nor the archive blocked nothing")
	}
	if !strings.Contains(why, never) || !strings.Contains(why, "does not exist") {
		t.Errorf("the refusal does not say which id is absent, or that it is: %s", why)
	}
}

// theArchiveSays writes one done row into the archive list this tree reads.
func theArchiveSays(t *testing.T, r Roots, id string) {
	t.Helper()
	path := ArchiveList(r)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	row := `{"id":"` + id + `","title":"one that ended","process":"trivial","disposition":"done"}` + "\n"
	if err := os.WriteFile(path, []byte(row), 0o644); err != nil {
		t.Fatal(err)
	}
}
