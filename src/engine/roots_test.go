package main

import (
	"os"
	"path/filepath"
	"testing"
)

// .se is the marker that a folder is a project this system has worked on.
func markProject(t *testing.T, dir string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Join(dir, ".se"), 0o755); err != nil {
		t.Fatal(err)
	}
}

// THE DEFECT THIS EXISTS FOR, MEASURED 2026-08-31.
//
// A shell moved into src/mcp. The guard was started with that as its
// directory, gave it its own .se, and then could not find the stop claim the
// agent had written at the root. The record split by directory and nobody was
// told.
func TestTheProjectRootIsFoundFromASubfolder(t *testing.T) {
	root := t.TempDir()
	deep := filepath.Join(root, "source", "mcp")
	if err := os.MkdirAll(deep, 0o755); err != nil {
		t.Fatal(err)
	}
	markProject(t, root)

	r, err := FindRoots(deep)
	if err != nil {
		t.Fatal(err)
	}
	if r.Work != root {
		t.Fatalf("standing in src/mcp gave the work root %s, not %s", r.Work, root)
	}
	// And the private folder is the one that already exists.
	if r.Private() != filepath.Join(root, ".se") {
		t.Fatalf("the private folder is %s", r.Private())
	}
}

// A folder being driven for the first time has no marker anywhere, and then
// where somebody is standing is the only answer there is. The register lives
// in a .se under the home directory, and that must not count as one.
func TestAFolderWithNoMarkerIsItsOwnRoot(t *testing.T) {
	root := t.TempDir()
	deep := filepath.Join(root, "a", "b")
	if err := os.MkdirAll(deep, 0o755); err != nil {
		t.Fatal(err)
	}
	r, err := FindRoots(deep)
	if err != nil {
		t.Fatal(err)
	}
	if r.Work != deep {
		t.Fatalf("with no marker the root should be where we stand, got %s", r.Work)
	}
}

// The register lives in a .se under the home directory. It is not a project,
// and a walk that took it for one would swallow every project beneath it.
func TestTheHomeDirectoryIsNeverTheProject(t *testing.T) {
	home, err := os.UserHomeDir()
	if err != nil {
		t.Skip("no home directory on this machine")
	}
	if _, err := os.Stat(filepath.Join(home, ".se")); err != nil {
		t.Skip("no register here, so there is nothing to be tricked by")
	}
	deep := filepath.Join(home, "a-folder-that-is-not-a-project", "deeper")
	if got := projectRoot(deep); got != deep {
		t.Fatalf("the walk climbed to %s", got)
	}
}

// The nearest one wins. A project inside a project is driven by its own
// marker, not by whatever is further up.
func TestTheNearestMarkerWins(t *testing.T) {
	outer := t.TempDir()
	inner := filepath.Join(outer, "nested")
	os.MkdirAll(inner, 0o755)
	markProject(t, outer)
	markProject(t, inner)
	deep := filepath.Join(inner, "src")
	os.MkdirAll(deep, 0o755)

	r, err := FindRoots(deep)
	if err != nil {
		t.Fatal(err)
	}
	if r.Work != inner {
		t.Fatalf("the outer project won: %s", r.Work)
	}
}
