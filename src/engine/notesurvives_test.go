package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A NOTE ABOUT A BUILD IS NOT THE BUILD.
//
// coverBinary builds the binary, then writes one row saying which source hash
// it came from, and returned that write's error as its own. The caller reads
// any error from it as a build failure and says the package did not compile.
//
// So a busy index made a binary that is on disk and correct report that it
// will not build, and a hand went looking for a compile error in a healthy
// package. MEASURED in September 2026 across four hands over one tree.
//
// The note is bookkeeping. Losing it costs the next run a rebuild.

// aTinyPackage writes a Go package that compiles, with one test in it, and
// answers its folder relative to the tree.
func aTinyPackage(t *testing.T, r Roots) string {
	t.Helper()
	dir := "tiny"
	abs := filepath.Join(r.Work, dir)
	if err := os.MkdirAll(abs, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(abs, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("go.mod", "module tiny\n\ngo 1.24\n")
	write("tiny.go", "package tiny\n\nfunc Two() int { return 2 }\n")
	write("tiny_test.go", "package tiny\n\nimport \"testing\"\n\n"+
		"func TestTwoIsTwo(t *testing.T) {\n\tif Two() != 2 {\n\t\tt.Fatal(\"no\")\n\t}\n}\n")
	return dir
}

// A BUILD SURVIVES A NOTE IT CANNOT WRITE. The write lock is held by another
// connection, so the note times out and the binary is still answered.
func TestABuildSurvivesANoteItCannotWrite(t *testing.T) {
	r := guidanceTree(t)
	dir := aTinyPackage(t, r)

	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	// ANOTHER CONNECTION HOLDS THE WRITE LOCK, which is what a second engine
	// or a language server does on a shared tree.
	holder, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer holder.Close()
	tx, err := holder.Begin()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tx.Exec("INSERT INTO meta (key, value) VALUES ('holding', '1') " +
		"ON CONFLICT(key) DO UPDATE SET value = excluded.value"); err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback()

	bin, err := coverBinary(r, db, dir)
	if err != nil {
		t.Fatalf("a binary that built was answered as an error: %v", err)
	}
	if bin == "" {
		t.Fatal("no binary was answered")
	}
	if _, err := os.Stat(bin); err != nil {
		t.Fatalf("the binary it named is not there: %v", err)
	}
}

// AND A PACKAGE THAT WILL NOT COMPILE STILL SAYS SO, so the message above is
// narrowed rather than silenced.
func TestAPackageThatWillNotCompileStillSaysSo(t *testing.T) {
	r := guidanceTree(t)
	dir := aTinyPackage(t, r)
	broken := filepath.Join(r.Work, dir, "tiny.go")
	if err := os.WriteFile(broken, []byte("package tiny\n\nfunc Two() int { return \"two\" }\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	if _, err := coverBinary(r, db, dir); err == nil {
		t.Fatal("a package that will not compile was answered as a binary")
	} else if !strings.Contains(err.Error(), "will not build") {
		t.Fatalf("the refusal does not name the build: %v", err)
	}
}
