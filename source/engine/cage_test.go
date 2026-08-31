package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A PROJECTION THAT NAMES A MACHINE IS DEAD ON EVERY OTHER ONE.
//
// Some projections are in version control, because a fresh clone is caged
// before anything has run in it. So the cage travels, and an absolute path in
// a travelling file was right where it was written and wrong everywhere else.
// That is how a Windows path reached a Linux box and the tool lane failed to
// connect on the first session.
//
// This reads the product's own list, and not a fixture's. The mechanism was
// never the thing that broke. The list was: one of three cage files was
// missed, and nothing said so.
func TestNoCagedFileNamesTheMachineItWasWrittenOn(t *testing.T) {
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, "util", "projections.json")); err != nil {
		t.Skip("this test reads the product's own list, and it is not here")
	}

	// SELF-HOSTING, which is the case that travels. A driven project keeps
	// absolute paths, because the method lives somewhere it cannot name from
	// where it stands.
	r := Roots{Method: root, Work: root}
	list, err := LoadProjections(root)
	if err != nil {
		t.Fatal(err)
	}
	vars, err := variables(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(list) == 0 {
		t.Fatal("the list is empty, so this test proves nothing")
	}

	for _, p := range list {
		body, err := assemble(root, p.Sources, vars)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		out, err := wrap(p, body)
		if err != nil {
			t.Fatalf("%s: %v", p.Name, err)
		}
		for i, line := range strings.Split(out, "\n") {
			if strings.Contains(line, root) {
				t.Errorf("%s (%s) line %d names this machine: %s",
					p.Name, p.Target, i+1, strings.TrimSpace(line))
			}
		}
	}
}

// AND THE ONES ON DISK SAY THE SAME. The check above reads what would be
// written. This reads what is committed, because an engine from an older
// build re-projects too, and it writes what its own build knew how to write.
func TestNoCommittedProjectionNamesTheMachine(t *testing.T) {
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	list, err := LoadProjections(root)
	if err != nil || len(list) == 0 {
		t.Skip("this test reads the product's own list, and it is not here")
	}
	for _, p := range list {
		path := filepath.Join(root, filepath.FromSlash(p.Target))
		b, err := os.ReadFile(path)
		if err != nil {
			continue // not written yet, which the check above already covers
		}
		if strings.Contains(string(b), root) {
			t.Errorf("%s names this machine. Run the engine to write it again", p.Target)
		}
	}
}
