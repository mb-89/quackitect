// The rows move with the files and nothing clears them: a sweep rewrites what
// moved alone, a change names its own paths, and git's list turns the flags.
// [[spec/design_output/index#a-change-moves-its-rows]]
package index // level0: InPackageTest - it drives the unexported door, and declares the counted helper other cases share

import (
	"bytes"
	"database/sql"
	"path/filepath"
	"testing"

	"quackitect/src/q"
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

// level0: FixtureOutsideHome - the case writes its own tree
func TestASweepAfterOneChangeRewritesThatFileAloneAndDropsAGoneOne(t *testing.T) {
	t.Parallel()
	root := tree(t)
	db := opened(t, root)
	kept := rowidOf(t, db, `SELECT rowid FROM link WHERE from_path = 'spec/one.md'`)

	write(t, root, "spec/two.md", "---\nkind: note\nid: two\n---\n\nThe second note says marzipan now, and names [[one]].\n")
	if err := removeFile(filepath.Join(root, "src", "plain.js")); err != nil {
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

// level0: FixtureOutsideHome - the case writes its own tree
func TestAChangeMovesThePathsItNamesAlone(t *testing.T) {
	t.Parallel()
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
// level0: FixtureOutsideHome - the case writes its own tree
func TestAGoneFolderTakesItsRowsAndItsLinksTurnDead(t *testing.T) {
	t.Parallel()
	root := tree(t)
	db := opened(t, root)
	if counted(t, db, `SELECT count(*) FROM link WHERE from_path = 'spec/one.md' AND to_path = 'spec/two.md'`) != 1 {
		t.Fatal("the fixture's link reaches nothing to begin with")
	}

	for _, rel := range []string{"spec/one.md", "spec/two.md", "spec"} {
		if err := removeFile(filepath.Join(root, filepath.FromSlash(rel))); err != nil {
			t.Fatal(err)
		}
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

func doorOver(t *testing.T, root string, db *sql.DB) *door {
	t.Helper()
	catalog := q.New()
	return &door{db: db, root: root, dirty: make(chan struct{}, 1), wake: make(chan struct{}),
		touched: map[string]bool{}, tracked: func(string) bool { return true },
		store: q.NewStore(catalog)}
}

// A change reads git's list off the door, so a saved file spawns no git. [[spec/design_output/index#a-change-moves-its-rows]]
// level0: FixtureOutsideHome - the case runs git in its own tree
func TestAChangeReadsTheListTheDoorHolds(t *testing.T) {
	t.Parallel()
	root := tree(t)
	db := openedWith(t, root, func(string) bool { return false })
	one := doorOver(t, root, db)

	write(t, root, "spec/one.md", "---\nkind: note\nid: one\n---\n\nThe first note moves.\n")
	one.Touched("spec/one.md")
	one.settles()
	if counted(t, db, `SELECT count(*) FROM file WHERE path = 'spec/one.md' AND tracked = 1`) != 1 {
		t.Fatal("the change read git in place of the list the door holds")
	}
}

// A settle that fails keeps what it heard, and says so. [[spec/design_output/index#a-change-moves-its-rows]]
// level0: RunsAlone - it swaps the package's stderr, which every settle beside it writes
// level0: FixtureOutsideHome - the case closes its own index under its own door
func TestAFailedSettleKeepsThePathsItHeard(t *testing.T) {
	root := tree(t)
	db := opened(t, root)
	db.Close()
	one := doorOver(t, root, db)
	said := &bytes.Buffer{}
	was := stderr
	stderr = said
	defer func() { stderr = was }()

	one.Touched("spec/one.md")
	one.Touched(gitIndex)
	one.settles()
	if !one.touched["spec/one.md"] || !one.retrack || !one.pending.Load() {
		t.Fatalf("a failed settle drops what it heard: %v, retrack %v", one.touched, one.retrack)
	}
	if said.Len() == 0 {
		t.Fatal("a failed settle says nothing")
	}
}
