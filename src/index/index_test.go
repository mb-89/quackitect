// The index, driven over a tree a case writes. Every question here is one a
// verb asks, so what the door answers stands proven with no door running.
// [[spec/guidance/code/testing]]
package main

import (
	"database/sql"
	"io/fs"
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
	write(t, root, ".se/.runtime/skipped.md", "---\nid: skipped\n---\n\nThis never reaches the index.\n")
	write(t, root, ".se/tickets/parked.md", "---\nid: parked\n---\n\nA word standing under the private folder alone: marzipan.\n")
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
	if _, _, err := Sweep(db, root); err != nil {
		t.Fatal(err)
	}
	return db
}

func TestTheWalkSkipsTheRuntimeHalfAndNothingElseUnderThePrivateFolder(t *testing.T) {
	root := tree(t)
	write(t, root, ".se/.retro/one/input/log/a.jsonl", "{}\n")
	db := opened(t, root)

	var count int
	if err := db.QueryRow(`SELECT count(*) FROM file WHERE path LIKE '.se/.runtime/%'`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("the walk reached the runtime half: %d file(s)", count)
	}

	if err := db.QueryRow(`SELECT count(*) FROM file WHERE path LIKE '.se/.retro/%'`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("the walk reached the retro half: %d file(s)", count)
	}

	if err := db.QueryRow(
		`SELECT count(*) FROM file WHERE path = '.se/tickets/parked.md'`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("the walk answers %d row(s) for the private note", count)
	}
}

// The log holds no part of the tree, so the walk, the watch and a change all stand off it. [[spec/design_output/index#the-rows-the-walk-writes]]
func TestTheWalkAndTheWatchStandOffTheLog(t *testing.T) {
	root := tree(t)
	write(t, root, ".se/.log/session.jsonl", "{\"said\":\"a line a door call\"}\n")
	db := opened(t, root)

	folder := func(rel string) fs.FileInfo {
		info, err := os.Stat(filepath.Join(root, filepath.FromSlash(rel)))
		if err != nil {
			t.Fatal(err)
		}
		return info
	}
	if !skips(root, filepath.Join(root, ".se", ".log"), folder(".se/.log")) {
		t.Fatal("the walk stands on the log")
	}
	if skips(root, filepath.Join(root, ".se", "tickets"), folder(".se/tickets")) {
		t.Fatal("the walk stands off the tickets, so a private note reaches no find")
	}
	if !outside(".se/.log/session.jsonl") {
		t.Fatal("a change naming the log moves rows")
	}

	var count int
	if err := db.QueryRow(
		`SELECT count(*) FROM file WHERE path LIKE '.se/.log/%'`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("the walk answers %d row(s) for the log", count)
	}
}

func TestAWordStandingInAPrivateNoteAloneComesBackFromAFind(t *testing.T) {
	root := tree(t)
	db := opened(t, root)

	rows, err := Find(db, "marzipan", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Path != ".se/tickets/parked.md" {
		t.Fatalf("the search answers %+v", rows)
	}
}

// [[spec/design_output/index#the-rank-is-bm25]]
func TestANoteNamingTheWordOutranksOneSayingItInItsBody(t *testing.T) {
	root := t.TempDir()
	write(t, root, "spec/said.md", "---\nid: said\n---\n\nquince quince quince quince, a body full of it.\n")
	write(t, root, "spec/quince.md", "---\nid: quince\n---\n\nA note about something else.\n")
	db := opened(t, root)

	rows, err := Notes(db, "quince", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 2 || rows[0].Path != "spec/quince.md" {
		t.Fatalf("the name ranks under the body: %+v", rows)
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
	if _, _, err := Sweep(db, root); err != nil {
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
