// The search and the file question, driven over a tree a case writes. Both
// answer what the tools they stand behind answer, so a caller reads one shape.
// [[spec/design_output/index#the-search-reads-the-rows]]
package main

import "testing"

func TestGrepFindsALineAndItsPath(t *testing.T) {
	db := opened(t, tree(t))

	said, err := Grep(db, GrepAsk{Pattern: "const said"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Total != 1 || len(said.Files) != 1 {
		t.Fatalf("one line stands here, and this says %d in %d file(s)", said.Total, len(said.Files))
	}
	if said.Files[0].Path != "src/plain.js" || said.Files[0].Lines[0].Line != 2 {
		t.Fatalf("the hit lands elsewhere: %+v", said.Files[0])
	}
}

func TestGrepTakesAGlobAndAFolder(t *testing.T) {
	db := opened(t, tree(t))

	said, err := Grep(db, GrepAsk{Pattern: "note", Glob: "*.md"})
	if err != nil {
		t.Fatal(err)
	}
	if len(said.Files) != 2 {
		t.Fatalf("both notes carry the word, and this answers %d", len(said.Files))
	}

	said, err = Grep(db, GrepAsk{Pattern: "note", Path: "src"})
	if err != nil {
		t.Fatal(err)
	}
	if len(said.Files) != 0 {
		t.Fatalf("the folder holds no note, and this answers %d", len(said.Files))
	}
}

func TestGrepReadsCaseAndTheLinesAround(t *testing.T) {
	db := opened(t, tree(t))

	said, err := Grep(db, GrepAsk{Pattern: "THE FIRST NOTE", Insensitive: true, Before: 1})
	if err != nil {
		t.Fatal(err)
	}
	if said.Total != 1 {
		t.Fatalf("the word stands once in any case, and this says %d", said.Total)
	}
	if len(said.Files[0].Lines) != 2 {
		t.Fatalf("one hit and one line above it make two: %+v", said.Files[0].Lines)
	}
	if said.Files[0].Lines[0].Match {
		t.Fatal("the line above a hit stands as context")
	}
}

func TestGrepRefusesAPatternNobodyCompiles(t *testing.T) {
	db := opened(t, tree(t))

	if _, err := Grep(db, GrepAsk{Pattern: "a(b"}); err == nil {
		t.Fatal("a broken pattern answers an error, so the caller falls back")
	}
}

func TestGlobNamesTheFilesAndSkipsTheRest(t *testing.T) {
	db := opened(t, tree(t))

	said, err := Glob(db, GlobAsk{Pattern: "**/*.md"})
	if err != nil {
		t.Fatal(err)
	}
	if len(said.Paths) != 2 {
		t.Fatalf("two notes stand outside the skipped folders, and this answers %v", said.Paths)
	}

	said, err = Glob(db, GlobAsk{Pattern: "*.js"})
	if err != nil {
		t.Fatal(err)
	}
	if len(said.Paths) != 1 || said.Paths[0] != "src/plain.js" {
		t.Fatalf("a bare glob reads as a name at any depth: %v", said.Paths)
	}
}

func TestGlobTranslatesTheShapes(t *testing.T) {
	for _, one := range []struct {
		glob string
		path string
		hits bool
	}{
		{"src/**/*.js", "src/deep/down/here.js", true},
		{"src/**/*.js", "other/here.js", false},
		{"*.{js,go}", "src/one.go", true},
		{"*.{js,go}", "src/one.md", false},
		{"src/?ne.js", "src/one.js", true},
	} {
		fits, err := matcher(one.glob)
		if err != nil {
			t.Fatal(err)
		}
		if fits(one.path) != one.hits {
			t.Fatalf("%s over %s answers %v", one.glob, one.path, !one.hits)
		}
	}
}
