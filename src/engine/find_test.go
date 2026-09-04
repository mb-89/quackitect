package main

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/fsnotify/fsnotify"
)

// EVERY LINE OF EVERY TEXT FILE IS IN THE INDEX, AND A SEARCH ANSWERS OFF IT.
//
// THE OWNER'S WORDS: the database doesn't include the code. Deal was,
// everything that's in the system is in the database, and the tools are
// rerouted through the database.
//
// Measured before this: 549 files in the index, 197 of them Go, and not one
// line of code searchable. A search for a Go symbol answered nothing.
func TestTheIndexHoldsEveryLineAndFindAnswersOffIt(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	code := filepath.Join(r.Work, "src", "engine")
	if err := os.MkdirAll(code, 0o755); err != nil {
		t.Fatal(err)
	}
	program := "package main\n\n// LoadConfig reads the tree.\nfunc LoadConfig(roots Roots) Config {\n\treturn TheFloor()\n}\n"
	if err := os.WriteFile(filepath.Join(code, "config.go"), []byte(program), 0o644); err != nil {
		t.Fatal(err)
	}
	fed, _ := aFedDaemon(t, r, true)

	// WORDS FIND THE SYMBOL, with the path and the line a person opens the
	// file at.
	got, err := Find(r, FindParams{Words: "LoadConfig"})
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Hits) != 2 || got.Hits[0].Path != "src/engine/config.go" {
		t.Fatalf("words answered %+v", got.Hits)
	}
	lines := map[int]bool{}
	for _, h := range got.Hits {
		lines[h.Line] = true
	}
	if !lines[3] || !lines[4] {
		t.Fatalf("the hits are on lines %v, want 3 and 4", lines)
	}

	// A REGEX FINDS WHAT WORDS CANNOT, and it runs over the stored lines.
	got, err = Find(r, FindParams{Regex: `^func \w+\(roots Roots\)`})
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Hits) != 1 || got.Hits[0].Line != 4 || got.Hits[0].Text != "func LoadConfig(roots Roots) Config {" {
		t.Fatalf("the regex answered %+v", got.Hits)
	}

	// A PATH NARROWS, and on its own it lists files.
	if got, _ = Find(r, FindParams{Words: "LoadConfig", Path: ".se/**"}); len(got.Hits) != 0 {
		t.Fatalf("a glob over the private folder found code: %+v", got.Hits)
	}
	got, err = Find(r, FindParams{Path: "src/**/*.go"})
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Files) != 1 || got.Files[0] != "src/engine/config.go" || len(got.Hits) != 0 {
		t.Fatalf("the glob answered %+v", got)
	}

	// A FILE WRITTEN BY SOMEBODY ELSE ARRIVES BY EVENT, line by line, and one
	// that goes, goes.
	more := filepath.Join(code, "more.go")
	if err := os.WriteFile(more, []byte("package main\n\nvar theAnswer = 42\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	fed.feed(more, fsnotify.Create)
	if got, _ = Find(r, FindParams{Words: "theAnswer"}); len(got.Hits) != 1 || got.Hits[0].Line != 3 {
		t.Fatalf("the new file's line is not found: %+v", got.Hits)
	}
	if err := os.Remove(more); err != nil {
		t.Fatal(err)
	}
	fed.feed(more, fsnotify.Remove)
	if got, _ = Find(r, FindParams{Words: "theAnswer"}); len(got.Hits) != 0 {
		t.Fatalf("a removed file's lines are still found: %+v", got.Hits)
	}

	// A SEARCH THAT ASKS NOTHING, OR ASKS IT BADLY, IS REFUSED BEFORE ANY
	// ROW IS LOOKED AT.
	if _, err := Find(r, FindParams{}); err == nil {
		t.Fatal("a search asking nothing was answered")
	}
	if _, err := Find(r, FindParams{Regex: "("}); err == nil {
		t.Fatal("a regex that will not read was answered")
	}
}

// A GLOB READS THE WAY A PERSON WRITES ONE.
func TestAPathGlobReadsAsWritten(t *testing.T) {
	t.Parallel()
	cases := []struct {
		glob, path string
		want       bool
	}{
		{"src/**/*.go", "src/engine/config.go", true},
		{"src/**/*.go", "src/config.go", true},
		{"src/*.go", "src/engine/config.go", false},
		{"**/*.md", "doc/guidance/voice.md", true},
		{"util/checks/*.mjs", "util/checks/liveness.mjs", true},
		{"util/checks/*.mjs", "util/checks/lib/engine.mjs", false},
		{"doc/g?idance/voice.md", "doc/guidance/voice.md", true},
	}
	for _, c := range cases {
		re, err := globRegexp(c.glob)
		if err != nil {
			t.Fatal(err)
		}
		if got := re.MatchString(c.path); got != c.want {
			t.Errorf("%s against %s: got %v, want %v", c.glob, c.path, got, c.want)
		}
	}
	if literalPrefix("src/**/*.go") != "src/" || literalPrefix("voice.md") != "voice.md" {
		t.Fatal("the literal prefix is not the part before the first wildcard")
	}
}
