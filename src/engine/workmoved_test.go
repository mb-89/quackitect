package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A NAMED WORK FOLDER THAT MOVES IS SAID.
//
// projectRoot walks up to the nearest folder carrying .se, which is what lets
// a verb run from a subdirectory. So --work naming a folder inside a project
// answers the project, not the folder.
//
// MEASURED. A mint aimed at a scratch folder under the tree landed in the real
// backlog, under a real id, and nothing said so. The only sign was that it was
// not where it had been asked for.
//
// The walk is right and the silence is the defect, so this is about what is
// said rather than about where it lands.
func TestANamedWorkFolderThatMovesIsSaid(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, ".se"), 0o755); err != nil {
		t.Fatal(err)
	}
	inside := filepath.Join(root, "scratch", "probe")
	if err := os.MkdirAll(inside, 0o755); err != nil {
		t.Fatal(err)
	}

	// A FOLDER INSIDE A PROJECT ANSWERS THE PROJECT, and that is said.
	asked, got, moved := WorkMoved(inside)
	if !moved {
		t.Fatalf("a folder inside a project answered %q and nothing said it moved", got)
	}
	if asked != inside {
		t.Errorf("it says the caller asked for %q", asked)
	}
	if got != root {
		t.Errorf("it answers %q rather than the project it resolved to", got)
	}

	// THE PROJECT ITSELF HAS NOT MOVED, so nothing is said about it.
	if _, _, moved := WorkMoved(root); moved {
		t.Error("naming the project itself was reported as a move")
	}

	// AND A FOLDER IN NO PROJECT IS ITS OWN, so nothing is said there either.
	lone := filepath.Join(t.TempDir(), "alone")
	if err := os.MkdirAll(lone, 0o755); err != nil {
		t.Fatal(err)
	}
	if _, _, moved := WorkMoved(lone); moved {
		t.Error("a folder in no project was reported as a move")
	}
}
