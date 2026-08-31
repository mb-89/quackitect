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

	// READING FALLS BACK TO THE METHOD, and that is right: a project that ships
	// no view of its own should be looked at through the one the method ships.
	// What must not fall back is a WRITE, and that is a different function now,
	// which is why this assertion can say what it means.
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

// READING FALLS BACK TO THE METHOD. WRITING DOES NOT.
//
// The fallback was writable, so a command told to work on one folder wrote into
// another whenever the work folder carried no copy of its own, which is exactly
// what isolating yourself with a fresh folder looks like. A reviewer working in
// a temporary folder changed the owner's board twice.
func TestAnEditNeverWritesIntoTheMethod(t *testing.T) {
	method, work := t.TempDir(), t.TempDir()
	r := Roots{Method: method, Work: work}

	shipped := filepath.Join(method, "util", "views", "work.base")
	os.MkdirAll(filepath.Dir(shipped), 0o755)
	const text = `
groups:
  - name: backlogged
    filter: status == "backlogged"

views:
  - type: table
    name: left
    order:
      - title
`
	if err := os.WriteFile(shipped, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	was, err := os.ReadFile(shipped)
	if err != nil {
		t.Fatal(err)
	}

	// EVERY EDIT, not the one that was caught. The list is the verb's own.
	path, ok := ViewPathToWrite(r, "work")
	if !ok {
		t.Fatal("an edit could not find a file to write")
	}
	if !strings.HasPrefix(path, work) {
		t.Fatalf("an edit was pointed at %q, outside the folder being worked on", path)
	}
	edits := map[string]func() error{
		"width":  func() error { return SetWidth(path, "left", "title", 320) },
		"order":  func() error { return SetOrder(path, "left", []string{"title", "status"}) },
		"sort":   func() error { return SetSort(path, "left", "status", "DESC") },
		"group":  func() error { return SetGroup(path, "left", "bucket", "ASC") },
		"filter": func() error { return SetFilter(path, "left", `status == "open"`) },
		"pin":    func() error { return AddPin(path, "left", "backlogged", "") },
		"unpin":  func() error { return DropPinNamed(path, "left", "backlogged") },
	}
	for name, edit := range edits {
		if err := edit(); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
	}
	if len(edits) == 0 {
		t.Fatal("no edit was made, so this guards nothing")
	}

	now, err := os.ReadFile(shipped)
	if err != nil {
		t.Fatal(err)
	}
	if string(now) != string(was) {
		t.Fatalf("%d edits in a folder of its own changed the method's file", len(edits))
	}
	// And what it wrote is what the work folder now reads.
	found, _ := ViewPath(r, "work")
	if !strings.HasPrefix(found, work) {
		t.Fatalf("after an edit the work folder still reads %q", found)
	}
}

// A NEIGHBOUR IS NOT A CHILD.
//
// The guard that keeps an edit inside the work folder was a string prefix, so a
// folder merely NAMED like the work folder passed it. This machine has the
// pair: quackitect and quackitect-v4, side by side. An edit told to work on the
// first found the second's view file and wrote into it, which is the owner's
// live board.
//
// THE FIXTURE IS BUILT BY HAND, because two t.TempDir() folders come back as
// 001 and 002 and neither can ever be a prefix of the other. A fixture that
// cannot produce the state is a fixture that can only exercise the case that
// works.
func TestANeighbourIsNotAChild(t *testing.T) {
	here := t.TempDir()
	work := filepath.Join(here, "proj")
	method := filepath.Join(here, "proj-v4")
	if !strings.HasPrefix(method, work) {
		t.Fatalf("this fixture cannot produce the state it is about: %s, %s", work, method)
	}
	r := Roots{Method: method, Work: work}

	shipped := filepath.Join(method, "util", "views", "work.base")
	os.MkdirAll(filepath.Dir(shipped), 0o755)
	os.MkdirAll(work, 0o755)
	const text = `
groups:
  - name: backlogged
    filter: status == "backlogged"

views:
  - type: table
    name: left
    order:
      - title
`
	if err := os.WriteFile(shipped, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	was, _ := os.ReadFile(shipped)

	// THE PROPERTY IS ON THE PATH, not only on the file, so this still catches
	// the class if the copying changes shape.
	path, ok := ViewPathToWrite(r, "work")
	if !ok {
		t.Fatal("an edit could not find a file to write")
	}
	if !under(work, path) {
		t.Fatalf("an edit was pointed at %q, which is a neighbour of %q rather than inside it",
			path, work)
	}
	for name, edit := range map[string]func() error{
		"width":  func() error { return SetWidth(path, "left", "title", 320) },
		"order":  func() error { return SetOrder(path, "left", []string{"title", "status"}) },
		"sort":   func() error { return SetSort(path, "left", "status", "DESC") },
		"group":  func() error { return SetGroup(path, "left", "bucket", "ASC") },
		"filter": func() error { return SetFilter(path, "left", `status == "open"`) },
		"pin":    func() error { return AddPin(path, "left", "backlogged", "") },
		"unpin":  func() error { return DropPinNamed(path, "left", "backlogged") },
	} {
		if err := edit(); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
	}
	if now, _ := os.ReadFile(shipped); string(now) != string(was) {
		t.Fatal("seven edits in a neighbouring folder changed the method's file")
	}
}
