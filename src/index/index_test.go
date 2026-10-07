// The index, driven over a tree a case writes. Every question here is one a
// verb asks, so what the door answers stands proven with no door running.
// [[spec/guidance/code/testing]]
package index // level0: InPackageTest - it declares the shared tree helpers, and drives the unexported folders, rooted and stands

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fsnotify/fsnotify"
)

func tree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	if err := plantTree(root); err != nil {
		t.Fatal(err)
	}
	return root
}

func write(t *testing.T, root, rel, text string) {
	t.Helper()
	if err := plantFile(root, rel, text); err != nil {
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

// level0: FixtureOutsideHome - the case writes its own tree
func TestTheWalkSkipsTheRuntimeHalfAndNothingElseUnderThePrivateFolder(t *testing.T) {
	t.Parallel()
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

// A dot folder under the private one stands outside the walk, the change and the watch, and every other folder there stands inside. [[spec/design_output/index#the-rows-the-walk-writes]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestADotFolderUnderThePrivateFolderStandsOutsideTheWalkAndTheWatch(t *testing.T) {
	t.Parallel()
	root := tree(t)
	write(t, root, ".se/.log/session.jsonl", "{\"said\":\"a line a door call\"}\n")
	write(t, root, ".se/notes/kept.md", "A note git ignores, and the walk reads all the same.\n")
	db := opened(t, root)

	if n := counted(t, db, `SELECT count(*) FROM file WHERE path LIKE '.se/.%'`); n != 0 {
		t.Fatalf("the walk reads %d file(s) under a dot folder of the private one", n)
	}
	if n := counted(t, db, `SELECT count(*) FROM file WHERE path IN ('.se/tickets/parked.md', '.se/notes/kept.md')`); n != 2 {
		t.Fatalf("the walk reads %d of the two private notes", n)
	}
	for _, rel := range []string{".se/.log", ".se/.log/session.jsonl", ".se/.runtime/index.db", ".se/.retro/one/input"} {
		if !outside(rel) {
			t.Fatalf("a change naming %s moves rows", rel)
		}
	}
	if outside(".se/tickets/parked.md") || outside(".se/notes") {
		t.Fatal("a change under a plain folder of the private one moves nothing")
	}

	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		t.Fatal(err)
	}
	defer eyes.Close()
	if err := folders(root, root, eyes); err != nil {
		t.Fatal(err)
	}
	watched := map[string]bool{}
	for _, abs := range eyes.WatchList() {
		if rel, ok := relOf(root, abs); ok {
			watched[rel] = true
		}
	}
	if watched[".se/.log"] || watched[".se/.runtime"] || !watched[".se/tickets"] || !watched[".se/notes"] {
		t.Fatalf("the watch stands on %v", watched)
	}
}

// A folder below the root carrying its own .git, a worktree's file or a clone's folder, stands off the walk and the watch whole; the root's own .git stays as it is today. [[spec/design_output/index#the-rows-the-walk-writes]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestAFolderCarryingItsOwnGitStandsOffTheWalkAndTheWatch(t *testing.T) {
	t.Parallel()
	root := tree(t)
	write(t, root, ".se/wt/drawing/.git", "gitdir: ../../../.git/worktrees/drawing\n")
	write(t, root, ".se/wt/drawing/spec/tickets/dup.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA duplicate off a leftover worktree.\n")
	write(t, root, "vendor/other/.git/HEAD", "ref: refs/heads/main\n")
	write(t, root, "vendor/other/README.md", "Another checkout entirely.\n")
	db := opened(t, root)

	if n := counted(t, db, `SELECT count(*) FROM file WHERE path LIKE '.se/wt/%' OR path LIKE 'vendor/%'`); n != 0 {
		t.Fatalf("the walk reached a nested checkout: %d file(s)", n)
	}

	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		t.Fatal(err)
	}
	defer eyes.Close()
	if err := folders(root, root, eyes); err != nil {
		t.Fatal(err)
	}
	for _, abs := range eyes.WatchList() {
		if rel, ok := relOf(root, abs); ok && (strings.HasPrefix(rel, ".se/wt/") || strings.HasPrefix(rel, "vendor/")) {
			t.Fatalf("the watch stands on the nested checkout at %s", rel)
		}
	}
}

// A hook hands the drive letter lower case and a shell upper case, and both name one tree. [[spec/design_output/index#a-door-comes-back]]
// level0: FixtureOutsideHome - the case opens and writes its own index
func TestTwoRootsDifferingInTheDriveLettersCaseReadAsOneTree(t *testing.T) {
	t.Parallel()
	root := tree(t)
	if rooted(root+string(filepath.Separator)) != rooted(root) {
		t.Fatal("a trailing separator reads as another tree")
	}
	volume := filepath.VolumeName(root)
	if len(volume) != 2 || volume[1] != ':' {
		t.Skip("a drive letter stands on Windows alone")
	}
	other := strings.ToLower(volume) + root[2:]
	if other == root {
		other = strings.ToUpper(volume) + root[2:]
	}

	self, _ := os.Executable()
	if !stands(Standing{Root: other, Stamp: stampOf(self), Bin: self}, root) {
		t.Fatal("the door stands aside for its own tree under the other drive case")
	}
	at := filepath.Join(t.TempDir(), "index.db")
	db, err := Open(other, at)
	if err != nil {
		t.Fatal(err)
	}
	if _, _, err := Sweep(db, other); err != nil {
		t.Fatal(err)
	}
	db.Close()
	db, err = Open(root, at)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if n := counted(t, db, `SELECT count(*) FROM file`); n == 0 {
		t.Fatal("the other drive case dropped the index")
	}
}

func TestAWordStandingInAPrivateNoteAloneComesBackFromAFind(t *testing.T) {
	t.Parallel()
	db := sweptDB(t)

	rows, err := Find(db, "marzipan", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Path != ".se/tickets/parked.md" {
		t.Fatalf("the search answers %+v", rows)
	}
}

// [[spec/design_output/index#the-rank-is-bm25]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestANoteNamingTheWordOutranksOneSayingItInItsBody(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
	db := sweptDB(t)

	var id, kind string
	if err := db.QueryRow(`SELECT id, kind FROM note WHERE path = 'spec/one.md'`).Scan(&id, &kind); err != nil {
		t.Fatal(err)
	}
	if id != "one" || kind != "note" {
		t.Fatalf("the note answers id %q and kind %q", id, kind)
	}
}

func TestALinkNamesTheNoteItReaches(t *testing.T) {
	t.Parallel()
	db := sweptDB(t)

	var to string
	if err := db.QueryRow(
		`SELECT to_path FROM link WHERE from_path = 'spec/one.md' AND target = 'two'`).Scan(&to); err != nil {
		t.Fatal(err)
	}
	if to != "spec/two.md" {
		t.Fatalf("the link reaches %q", to)
	}
}

// A ticket names its process with the ending off, and the link reaches the yaml file. [[spec/design_output/index#a-note-and-its-links]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestAPointerWithTheEndingOffReachesAProcessFile(t *testing.T) {
	t.Parallel()
	root := tree(t)
	write(t, root, "spec/processes/trivial.yaml", "kind: process\nsteps: []\n")
	write(t, root, "spec/tickets/one.md", "---\nkind: ticket\nprocess: [[spec/processes/trivial]]\n---\n\n# Ask\n")
	db := opened(t, root)

	var to string
	if err := db.QueryRow(
		`SELECT to_path FROM link WHERE from_path = 'spec/tickets/one.md' AND target = 'spec/processes/trivial'`).Scan(&to); err != nil {
		t.Fatal(err)
	}
	if to != "spec/processes/trivial.yaml" {
		t.Fatalf("the process pointer reaches %q", to)
	}
	rows, err := Dangling(db)
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range rows {
		if one.Target == "spec/processes/trivial" {
			t.Fatal("the links verb names the process pointer dead")
		}
	}
}

func TestALinkNamingNothingDangles(t *testing.T) {
	t.Parallel()
	db := sweptDB(t)

	rows, err := Dangling(db)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Target != "nobody" {
		t.Fatalf("dangling answers %+v", rows)
	}
}

func TestTheSearchFindsAWordInAnyFile(t *testing.T) {
	t.Parallel()
	db := sweptDB(t)

	rows, err := Find(db, "search", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Path != "src/plain.js" {
		t.Fatalf("the search answers %+v", rows)
	}
}

// level0: FixtureOutsideHome - the case opens and writes its own index
func TestAnIndexUnderAnotherRootIsDropped(t *testing.T) {
	t.Parallel()
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

// The sweep writes a row for every line holding text, under the line's own number, across two files of one sweep. [[spec/tickets/the-sweep-prepares-once]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestTheSweepWritesEveryLineHoldingTextUnderItsNumber(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	write(t, root, "src/a.js", "one\n\n  \nfour\nfive\n")
	write(t, root, "src/b.js", "\nsecond\n")
	db := opened(t, root)
	rows, err := db.Query(`SELECT path, n, text FROM line_text ORDER BY path, n`)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	var said []string
	for rows.Next() {
		var path, text string
		var n int
		if err := rows.Scan(&path, &n, &text); err != nil {
			t.Fatal(err)
		}
		said = append(said, fmt.Sprintf("%s:%d:%s", path, n, text))
	}
	want := []string{"src/a.js:1:one", "src/a.js:4:four", "src/a.js:5:five", "src/b.js:2:second"}
	if strings.Join(said, " ") != strings.Join(want, " ") {
		t.Fatalf("the sweep writes the rows %v, and wants %v", said, want)
	}
}
