package main

import (
	"os"
	"path/filepath"
	"testing"
)

// THE METHOD ROOT IS FOUND, NOT GUESSED FROM WHERE THE PROGRAM SITS.
//
// It was derived as the folder two above the executable, which is only true
// when the program was run out of <method>/.bin. A build run from anywhere else
// derived every path wrong and filed findings against innocent files, because
// nothing checked the guess. The marker is what the method root actually holds:
// the processes the engine loads out of it.
func TestTheMethodRootIsFoundByItsMarker(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "src", "processes"), 0o755); err != nil {
		t.Fatal(err)
	}

	// From the folder the installed program sits in, and from deeper still.
	for _, from := range []string{
		filepath.Join(root, ".bin"),
		filepath.Join(root, "src", "engine"),
		root,
	} {
		if got := methodRootFrom(from); got != root {
			t.Errorf("walking up from %s gave %q, not the method root %s", from, got, root)
		}
	}
}

// A PROGRAM SOMEWHERE ELSE HAS NO METHOD, AND SAYS SO. The old guess always
// answered a folder, so a copy run from outside the method got a confident
// wrong answer and worked from it.
func TestNoMarkerMeansNoMethodRoot(t *testing.T) {
	t.Parallel()
	stray := filepath.Join(t.TempDir(), "a", "b")
	if err := os.MkdirAll(stray, 0o755); err != nil {
		t.Fatal(err)
	}
	if got := methodRootFrom(stray); got != "" {
		t.Fatalf("a folder with no marker answered the method root %q", got)
	}
}

// EVERY VERB READS THE TWO ROOTS OFF ITS OWN ARGUMENTS. The client scanned for
// --work and never for --method, so the nine verbs took the guess whatever the
// caller typed.
func TestAVerbReadsBothRootsFromItsArguments(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		name string
		args []string
		want string
		of   string
	}{
		{"two words", []string{"pull", "--method", "/m"}, "/m", "--method"},
		{"one word", []string{"pull", "--method=/m"}, "/m", "--method"},
		{"work too", []string{"pull", "--work", "/w"}, "/w", "--work"},
		{"work joined", []string{"pull", "--work=/w"}, "/w", "--work"},
		{"absent", []string{"pull", "--work", "/w"}, "", "--method"},
		{"not a prefix match", []string{"pull", "--workspace", "/w"}, "", "--work"},
	} {
		t.Run(c.name, func(t *testing.T) {
			if got := argValue(c.args, c.of); got != c.want {
				t.Errorf("%s off %v gave %q, want %q", c.of, c.args, got, c.want)
			}
		})
	}
}
