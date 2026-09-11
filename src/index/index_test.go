// The index, driven over a tree a case writes. Every question here is one a
// verb asks, so what the door answers stands proven with no door running.
// [[spec/design_output/index#the-index-is-warm]]
package main

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"
)

func tree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	write(t, root, "spec/one.md", "---\nkind: note\nid: one\n---\n\nThe first note says [[two]] out loud.\n")
	write(t, root, "spec/two.md", "---\nkind: note\nid: two\n---\n\nThe second note names [[nobody]] at all.\n")
	write(t, root, "src/plain.js", "// a line the search finds\nconst said = 1;\n")
	write(t, root, ".se/skipped.md", "---\nid: skipped\n---\n\nThis never reaches the index.\n")
	return root
}

func write(t *testing.T, root, rel, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func opened(t *testing.T, root string) *sql.DB {
	t.Helper()
	db, err := Open(root, filepath.Join(t.TempDir(), "index.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := Reindex(db, root); err != nil {
		t.Fatal(err)
	}
	return db
}

func TestTheWalkSkipsWhatNobodyWrote(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	var count int
	if err := db.QueryRow(`SELECT count(*) FROM file WHERE path LIKE '.se/%'`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("the walk reached .se: %d file(s)", count)
	}
}

func TestANoteCarriesItsFrontmatter(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	var id, kind string
	if err := db.QueryRow(`SELECT id, kind FROM note WHERE path = 'spec/one.md'`).Scan(&id, &kind); err != nil {
		t.Fatal(err)
	}
	if id != "one" || kind != "note" {
		t.Fatalf("the note answers id %q and kind %q", id, kind)
	}
}

func TestALinkNamesTheNoteItReaches(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	var to string
	if err := db.QueryRow(
		`SELECT to_path FROM link WHERE from_path = 'spec/one.md' AND target = 'two'`).Scan(&to); err != nil {
		t.Fatal(err)
	}
	if to != "spec/two.md" {
		t.Fatalf("the link reaches %q", to)
	}
}

func TestALinkNamingNothingDangles(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	rows, err := Dangling(db)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Target != "nobody" {
		t.Fatalf("dangling answers %+v", rows)
	}
}

func TestTheSearchFindsAWordInAnyFile(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	rows, err := Find(db, "search", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Path != "src/plain.js" {
		t.Fatalf("the search answers %+v", rows)
	}
}

func TestAnIndexUnderAnotherRootIsDropped(t *testing.T) {
	root := tree(t)
	at := filepath.Join(t.TempDir(), "index.db")

	db, err := Open(root, at)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(db, root); err != nil {
		t.Fatal(err)
	}
	db.Close()

	db, err = Open(t.TempDir(), at)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	var count int
	if err := db.QueryRow(`SELECT count(*) FROM file`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("the index kept %d row(s) from the tree before it", count)
	}
}
