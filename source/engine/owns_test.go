package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE FOLDER BEING WORKED ON WINS.
//
// A command told to work on one folder wrote into another. A reviewer
// isolating itself with --work still reached the live util/views, because only
// the method root was searched for a shipped view, and the owner saw the
// change on their board.
func TestTheWorkFolderOwnsItsViews(t *testing.T) {
	method, work := t.TempDir(), t.TempDir()
	r := Roots{Method: method, Work: work}

	// The method ships one, and nothing else exists yet.
	os.MkdirAll(filepath.Join(method, "util", "views"), 0o755)
	os.WriteFile(filepath.Join(method, "util", "views", "work.base"),
		[]byte("views:\n  - name: left\n    order:\n      - title\n"), 0o644)

	got, ok := ViewPath(r, "work")
	if !ok || !strings.HasPrefix(got, method) {
		t.Fatalf("with no copy it found %q", got)
	}

	// The folder being worked on carries its own, and its own wins.
	os.MkdirAll(filepath.Join(work, "util", "views"), 0o755)
	os.WriteFile(filepath.Join(work, "util", "views", "work.base"),
		[]byte("views:\n  - name: left\n    order:\n      - status\n"), 0o644)

	got, ok = ViewPath(r, "work")
	if !ok {
		t.Fatal("the view could not be found at all")
	}
	if !strings.HasPrefix(got, work) {
		t.Fatalf("it reached past the work folder to %q", got)
	}
	// And the one it found is the one it reads.
	b, err := LoadBase(got)
	if err != nil {
		t.Fatal(err)
	}
	if b.Views[0].Order[0] != "status" {
		t.Fatalf("it read the method's copy: the order is %v", b.Views[0].Order)
	}
}

// The same for the marks, for the same reason.
func TestTheWorkFolderOwnsItsIcons(t *testing.T) {
	method, work := t.TempDir(), t.TempDir()
	r := Roots{Method: method, Work: work}

	os.MkdirAll(filepath.Join(method, "util"), 0o755)
	os.WriteFile(filepath.Join(method, "util", "icons.json"),
		[]byte(`{"power":{"glyph":"M"}}`), 0o644)
	if icons, err := Icons(r); err != nil || icons["power"].Glyph != "M" {
		t.Fatalf("with no copy it read %v %v", icons, err)
	}

	os.MkdirAll(filepath.Join(work, "util"), 0o755)
	os.WriteFile(filepath.Join(work, "util", "icons.json"),
		[]byte(`{"power":{"glyph":"W"}}`), 0o644)
	icons, err := Icons(r)
	if err != nil {
		t.Fatal(err)
	}
	if icons["power"].Glyph != "W" {
		t.Fatalf("it reached past the work folder and read %q", icons["power"].Glyph)
	}
}

// Every view the engine can name is looked for in the same places, so a listing
// and a lookup never disagree about what exists.
func TestListingAndLookupLookInTheSamePlaces(t *testing.T) {
	method, work := t.TempDir(), t.TempDir()
	r := Roots{Method: method, Work: work}
	os.MkdirAll(filepath.Join(work, "util", "views"), 0o755)
	os.WriteFile(filepath.Join(work, "util", "views", "mine.base"),
		[]byte("views:\n  - name: left\n    order:\n      - title\n"), 0o644)

	names := Views(r)
	if len(names) != 1 || names[0] != "mine" {
		t.Fatalf("the listing answers %v", names)
	}
	if _, ok := ViewPath(r, "mine"); !ok {
		t.Fatal("a view the listing names cannot be found")
	}
}
