package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func put(t *testing.T, root, rel, text string) string {
	t.Helper()
	p := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func readBack(t *testing.T, root, rel string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

// TWO FORMS OF REFERENCE. A path as written, and a wiki link with the
// extension dropped. Prose takes both. Source takes the path form only.
func TestAMoveFixesEveryReference(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing itself\n")
	put(t, r.Work, "doc/reader.md", "see doc/old.md and also [[doc/old]] for more\n")
	put(t, r.Work, "source/app.go", "const path = \"doc/old.md\" // and [[doc/old]] stays\n")

	out, err := MoveFile(r, "doc/old.md", "doc/new.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.Moved.From != "doc/old.md" || out.Moved.To != "doc/new.md" {
		t.Fatalf("it says it moved %s to %s", out.Moved.From, out.Moved.To)
	}
	if _, err := os.Stat(filepath.Join(r.Work, "doc", "old.md")); err == nil {
		t.Fatal("the old file is still there")
	}

	prose := readBack(t, r.Work, "doc/reader.md")
	if !strings.Contains(prose, "doc/new.md") || !strings.Contains(prose, "[[doc/new]]") {
		t.Fatalf("prose kept an old reference: %q", prose)
	}

	// A WIKI SPELLING IN SOURCE IS LEFT ALONE, because it would hit
	// identifiers that mean something else.
	code := readBack(t, r.Work, "source/app.go")
	if !strings.Contains(code, `"doc/new.md"`) {
		t.Fatalf("source kept the old path: %q", code)
	}
	if !strings.Contains(code, "[[doc/old]]") {
		t.Fatalf("source had its wiki form rewritten: %q", code)
	}
}

// WHAT IT COULD NOT REWRITE IS REPORTED. An empty rewritten list must never be
// the only thing separating no references from references left dangling.
func TestAMoveReportsWhatItCouldNotRewrite(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "notes.rst", "a format nobody listed points at doc/old.md here\n")

	out, err := MoveFile(r, "doc/old.md", "doc/new.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.UnrewritN != 1 || len(out.Unrewrit) != 1 {
		t.Fatalf("it reported %d residual hits: %v", out.UnrewritN, out.Unrewrit)
	}
	got := out.Unrewrit[0]
	if got.Path != "notes.rst" || got.Line != 1 {
		t.Fatalf("it points at %s line %d", got.Path, got.Line)
	}
	if !strings.Contains(got.Text, "doc/old.md") {
		t.Fatalf("the report does not carry the line: %q", got.Text)
	}
	// The file it could not repair keeps its text exactly.
	if !strings.Contains(readBack(t, r.Work, "notes.rst"), "doc/old.md") {
		t.Fatal("it rewrote a format it does not know")
	}
}

// A MOVE INTO A SUBDIRECTORY leaves the old path as a substring of every path
// it just rewrote. Reporting those would make the report useless.
func TestAMoveIntoASubdirectoryReportsNothing(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "doc/reader.md", "see doc/old.md\n")

	out, err := MoveFile(r, "doc/old.md", "doc/old/old.md")
	if err != nil {
		t.Fatal(err)
	}
	if out.UnrewritN != 0 {
		t.Fatalf("it reported %d residual hits: %v", out.UnrewritN, out.Unrewrit)
	}
	if !strings.Contains(readBack(t, r.Work, "doc/reader.md"), "doc/old/old.md") {
		t.Fatal("the reference was not rewritten")
	}
}

// A LONGER NAME THAT MERELY ENDS WITH THE OLD ONE is a different file, and so
// is a deeper path that ends with it.
//
// THE REWRITER IS WHAT THIS ASKS. The earlier version of this test moved
// doc/old.md with a doc/very-old.md beside it, and doc/old.md is not a
// substring of doc/very-old.md, so the rewriter was never asked the question.
// These names make it a substring, twice.
func TestALongerNameIsADifferentFile(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "old.md", "the one being moved\n")
	put(t, r.Work, "very-old.md", "a different file\n")
	put(t, r.Work, "vendor/old.md", "another project's file\n")
	put(t, r.Work, "reader.md",
		"ours is old.md, theirs is very-old.md, and vendored is vendor/old.md\n")
	put(t, r.Work, "app.go",
		"const a = \"old.md\"\nconst b = \"very-old.md\"\nconst c = \"vendor/old.md\"\n")

	out, err := MoveFile(r, "old.md", "new.md")
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range []string{"reader.md", "app.go"} {
		got := readBack(t, r.Work, f)
		if !strings.Contains(got, "very-old.md") {
			t.Fatalf("%s had very-old.md rewritten: %q", f, got)
		}
		if !strings.Contains(got, "vendor/old.md") {
			t.Fatalf("%s had vendor/old.md rewritten: %q", f, got)
		}
		if strings.Contains(got, "very-new.md") || strings.Contains(got, "vendor/new.md") {
			t.Fatalf("%s points at a file that does not exist: %q", f, got)
		}
	}
	// One reference in each file, and only one.
	for _, w := range out.Rewritten {
		if w.Count != 1 {
			t.Fatalf("%s had %d references rewritten", w.Path, w.Count)
		}
	}
	// THE FILES IT DID NOT MOVE ARE STILL THERE.
	for _, f := range []string{"very-old.md", "vendor/old.md"} {
		if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(f))); err != nil {
			t.Fatalf("%s is gone", f)
		}
	}
	if out.UnrewritN != 0 {
		t.Fatalf("it called a different file a dangling reference: %v", out.Unrewrit)
	}
}

// A CASE CORRECTION IS A RENAME. On a case-insensitive filesystem the new
// spelling stats as the old file, and the verb refused one of the commonest
// renames there is.
func TestACaseCorrectionIsARename(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "doc/Readme.md", "the file\n")
	put(t, r.Work, "reader.md", "see doc/Readme.md\n")

	out, err := MoveFile(r, "doc/Readme.md", "doc/readme.md")
	if err != nil {
		t.Fatalf("a case correction was refused: %v", err)
	}
	if out.Moved.To != "doc/readme.md" {
		t.Fatalf("it says it moved to %s", out.Moved.To)
	}
	if got := readBack(t, r.Work, "reader.md"); !strings.Contains(got, "doc/readme.md") {
		t.Fatalf("the reference was not rewritten: %q", got)
	}
}

// THREE REFUSALS, and each one says what would satisfy it.
func TestAMoveRefusesWhatItMustNotDo(t *testing.T) {
	r := guidanceTree(t)
	put(t, r.Work, "doc/old.md", "the thing\n")
	put(t, r.Work, "doc/taken.md", "somebody else\n")
	if err := os.MkdirAll(filepath.Join(r.Work, "doc", "folder"), 0o755); err != nil {
		t.Fatal(err)
	}

	for _, c := range []struct{ from, to, says string }{
		{"doc/missing.md", "doc/new.md", "no such file"},
		{"doc/old.md", "doc/taken.md", "already exists"},
		{"doc/folder", "doc/elsewhere", "is a directory"},
		{"doc/old.md", "../outside.md", "outside the folder"},
	} {
		_, err := MoveFile(r, c.from, c.to)
		if err == nil {
			t.Fatalf("moving %s to %s was allowed", c.from, c.to)
		}
		if !strings.Contains(err.Error(), c.says) {
			t.Fatalf("moving %s said %q rather than %q", c.from, err, c.says)
		}
	}
	// NOTHING IS WRITTEN UNLESS THE MOVE ITSELF SUCCEEDS.
	if readBack(t, r.Work, "doc/taken.md") != "somebody else\n" {
		t.Fatal("a refused move still wrote")
	}
}
