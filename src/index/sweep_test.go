// The rows move with the files and nothing clears them: a sweep rewrites what
// moved alone, a change names its own paths, and git's list turns the flags.
// [[spec/design_output/index#a-change-moves-its-rows]]
package main

import (
	"database/sql"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

func rowidOf(t *testing.T, db *sql.DB, query string, args ...any) int64 {
	t.Helper()
	var id int64
	if err := db.QueryRow(query, args...).Scan(&id); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return id
}

func counted(t *testing.T, db *sql.DB, query string, args ...any) int {
	t.Helper()
	var n int
	if err := db.QueryRow(query, args...).Scan(&n); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return n
}

func TestASweepAfterOneChangeRewritesThatFileAloneAndDropsAGoneOne(t *testing.T) {
	root := tree(t)
	db := opened(t, root)
	kept := rowidOf(t, db, `SELECT rowid FROM link WHERE from_path = 'spec/one.md'`)

	write(t, root, "spec/two.md", "---\nkind: note\nid: two\n---\n\nThe second note says marzipan now, and names [[one]].\n")
	if err := os.Remove(filepath.Join(root, "src", "plain.js")); err != nil {
		t.Fatal(err)
	}
	count, moved, err := Sweep(db, root)
	if err != nil {
		t.Fatal(err)
	}
	if moved != 2 {
		t.Fatalf("a changed file and a gone one move two paths, and the sweep moves %d of %d", moved, count)
	}
	if rowidOf(t, db, `SELECT rowid FROM link WHERE from_path = 'spec/one.md'`) != kept {
		t.Fatal("a file that stood still wrote its rows again")
	}
	if counted(t, db, `SELECT count(*) FROM file WHERE path = 'src/plain.js'`)+counted(t, db, `SELECT count(*) FROM line_text WHERE path = 'src/plain.js'`) != 0 {
		t.Fatal("a gone file keeps its rows")
	}
	if counted(t, db, `SELECT count(*) FROM line_text WHERE path = 'spec/two.md' AND text MATCH 'marzipan'`) != 1 {
		t.Fatal("the changed file's lines read the old text")
	}
	if _, moved, _ := Sweep(db, root); moved != 0 {
		t.Fatalf("a second sweep over a still tree moves %d", moved)
	}
}

func TestAChangeMovesThePathsItNamesAlone(t *testing.T) {
	root := tree(t)
	db := opened(t, root)
	kept := rowidOf(t, db, `SELECT rowid FROM note WHERE path = 'spec/two.md'`)

	write(t, root, "spec/one.md", "---\nkind: note\nid: one\n---\n\nThe first note names nobody now.\n")
	write(t, root, "spec/fresh/three.md", "---\nkind: note\nid: three\n---\n\nA new folder holds a new note.\n")
	moved, err := Touches(db, root, []string{"spec/one.md", "spec/fresh", ".git/HEAD", ".se/.runtime/skipped.md"})
	if err != nil {
		t.Fatal(err)
	}
	if moved != 2 {
		t.Fatalf("a changed file and a new folder's note move two paths, and the change moves %d", moved)
	}
	if rowidOf(t, db, `SELECT rowid FROM note WHERE path = 'spec/two.md'`) != kept {
		t.Fatal("a path the change names nowhere wrote its rows again")
	}
	if counted(t, db, `SELECT count(*) FROM note WHERE path = 'spec/fresh/three.md'`) != 1 {
		t.Fatal("the note under the new folder stands nowhere")
	}
}

// A path standing nowhere takes every row under it along, and a link to it reaches nothing again. [[spec/design_output/index#a-change-moves-its-rows]]
func TestAGoneFolderTakesItsRowsAndItsLinksTurnDead(t *testing.T) {
	root := tree(t)
	db := opened(t, root)
	if counted(t, db, `SELECT count(*) FROM link WHERE from_path = 'spec/one.md' AND to_path = 'spec/two.md'`) != 1 {
		t.Fatal("the fixture's link reaches nothing to begin with")
	}

	if err := os.RemoveAll(filepath.Join(root, "spec")); err != nil {
		t.Fatal(err)
	}
	write(t, root, "notes/pointer.md", "---\nkind: note\nid: pointer\n---\n\nThis names [[two]].\n")
	if _, err := Touches(db, root, []string{"spec", "notes/pointer.md"}); err != nil {
		t.Fatal(err)
	}
	if counted(t, db, `SELECT count(*) FROM file WHERE path LIKE 'spec/%'`) != 0 {
		t.Fatal("a gone folder keeps rows under it")
	}
	if counted(t, db, `SELECT count(*) FROM link WHERE from_path = 'notes/pointer.md' AND to_path IS NULL`) != 1 {
		t.Fatal("a link to a gone note still reaches it")
	}
}

func TestGitsOwnIndexTurnsTheTrackedFlags(t *testing.T) {
	root := tree(t)
	run := func(argv ...string) {
		one := exec.Command("git", argv...)
		one.Dir = root
		if said, err := one.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %s", argv, said)
		}
	}
	run("init", "-q")
	db := opened(t, root)
	if counted(t, db, `SELECT count(*) FROM file WHERE tracked = 1`) != 0 {
		t.Fatal("a repository tracking nothing marks rows tracked")
	}

	run("add", "spec/one.md")
	moved, err := Retracks(db, root)
	if err != nil {
		t.Fatal(err)
	}
	if moved != 1 || counted(t, db, `SELECT count(*) FROM file WHERE tracked = 1 AND path = 'spec/one.md'`) != 1 {
		t.Fatalf("git's list turns one flag, and it turns %d", moved)
	}
}
