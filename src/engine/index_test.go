package main

import (
	"database/sql"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

// THE INDEX IS BUILT FROM THE TREE, AND THE TREE STAYS THE TRUTH.
//
// A copy of a private file is found by size and hash, a link becomes a row
// that resolves or dangles, and a change to one file changes that file's
// rows and nothing else. An index the daemon is not keeping fresh is not
// trusted, so the guard reads the files the way it did before.

// aTreeToIndex writes two private notes and one public note that links to
// them, and answers the roots with the index built.
func aTreeToIndex(t *testing.T) Roots {
	t.Helper()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	write := func(rel, text string) {
		p := filepath.Join(r.Work, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(".se/work/wk-one.md", "---\nkind: [[work-token]]\ntitle: the first\ndepends_on: [\"[[wk-two]]\"]\n---\n\n## detail\n\nIt names [[wk-two]] and [[nowhere]].\n")
	write(".se/work/wk-two.md", "---\nkind: [[work-token]]\ntitle: the second\n---\n\n## detail\n\nA heredoc ate a file.\n")
	write("doc/plain.md", "no frontmatter here, so prose and nothing else\n")
	// The kind every note names resolves to the schema file by its stem.
	write("src/schemas/work-token.schema.yaml", "kind: work-token\n")
	write(".se/log/session.jsonl", "{}\n")
	return r
}

func TestTheIndexAnswersACopyOfAPrivateFile(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	got, err := Reindex(r, db)
	if err != nil {
		t.Fatal(err)
	}
	// THE RECORD IS NOT MATERIAL, so the log is not a row.
	if got.Seen != 4 || got.Written != 4 {
		t.Fatalf("the scan saw %d and wrote %d, want 4 and 4", got.Seen, got.Written)
	}
	markFresh(t, db)

	two, _ := os.ReadFile(filepath.Join(r.Work, ".se", "work", "wk-two.md"))
	from, found, trusted := privateCopyInIndex(r, string(two))
	if !trusted || !found || !strings.HasSuffix(from, "wk-two.md") {
		t.Fatalf("a copy of a private note answered from=%q found=%v trusted=%v", from, found, trusted)
	}
	if _, found, trusted := privateCopyInIndex(r, "something nobody wrote"); !trusted || found {
		t.Fatalf("new content was answered found=%v trusted=%v", found, trusted)
	}
	// THE PUBLIC NOTE IS NOT PRIVATE, so copying it is not a leak.
	plain, _ := os.ReadFile(filepath.Join(r.Work, "doc", "plain.md"))
	if _, found, _ := privateCopyInIndex(r, string(plain)); found {
		t.Fatal("a public file was answered as a private original")
	}
	// AND THE GUARD'S OWN QUESTION AGREES WITH THE WALK IT REPLACES.
	if from, yes := copyOfAPrivateOriginal(r, string(two)); !yes || !strings.HasSuffix(from, "wk-two.md") {
		t.Fatalf("the guard answered %q %v through the index", from, yes)
	}
}

func TestLinksBecomeRowsThatResolveOrDangle(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	markFresh(t, db)

	rows := func(query string) [][]any {
		t.Helper()
		got, err := askFile(r, query, 100)
		if err != nil {
			t.Fatal(err)
		}
		return got.Rows
	}
	// The frontmatter link is typed by its field, and resolves by note name.
	typed := rows("SELECT key, target, to_path FROM link WHERE from_path = '.se/work/wk-one.md' AND key = 'depends_on'")
	if len(typed) != 1 || typed[0][1] != "wk-two" || typed[0][2] != ".se/work/wk-two.md" {
		t.Fatalf("the typed link came back as %v", typed)
	}
	// The kind reaches the schema file by its stem, the body mention of the
	// other note resolves, and the one to nowhere keeps a null, which is what
	// the dangling question reads.
	kinds := rows("SELECT to_path FROM link WHERE key = 'kind' AND to_path = 'src/schemas/work-token.schema.yaml'")
	if len(kinds) != 2 {
		t.Fatalf("the kind links resolved to the schema %d times, want 2", len(kinds))
	}
	dangling := rows("SELECT target, line FROM link WHERE to_path IS NULL")
	if len(dangling) != 1 || dangling[0][0] != "nowhere" {
		t.Fatalf("the dangling links came back as %v", dangling)
	}
	// The links question answers both directions for a note by its id: the
	// two that reach it, and the one it makes itself, to its kind.
	in, out := 0, 0
	for _, row := range rows(linksQuery("wk-two")) {
		switch row[0] {
		case "in":
			in++
		case "out":
			out++
		}
	}
	if in != 2 || out != 1 {
		t.Fatalf("wk-two has %d links in and %d out, want 2 and 1", in, out)
	}
	// And the words in a body are found.
	hits := rows("SELECT id FROM note_text WHERE note_text MATCH 'heredoc'")
	if len(hits) != 1 || hits[0][0] != "wk-two" {
		t.Fatalf("the search answered %v", hits)
	}
}

func TestOneFileChangesOnlyItsOwnRows(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	markFresh(t, db)
	db.Close()

	// THE WRITER SYNCS ITS OWN WRITE. The note now mentions nothing, so its
	// dangling link goes, and the other note's rows are untouched.
	one := filepath.Join(r.Work, ".se", "work", "wk-one.md")
	if err := os.WriteFile(one, []byte("---\nkind: [[work-token]]\ntitle: the first\n---\n\n## detail\n\nNothing named.\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := IndexFile(r, one); err != nil {
		t.Fatal(err)
	}
	got, err := askFile(r, "SELECT from_path FROM link WHERE key = '' OR key = 'depends_on'", 100)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Rows) != 0 {
		t.Fatalf("links remain after the rewrite: %v", got.Rows)
	}
	// A FILE THAT WENT IS DROPPED, and a link that reached it dangles.
	two := filepath.Join(r.Work, ".se", "work", "wk-two.md")
	if err := os.Remove(two); err != nil {
		t.Fatal(err)
	}
	if err := IndexFile(r, two); err != nil {
		t.Fatal(err)
	}
	got, err = askFile(r, "SELECT path FROM file WHERE path LIKE '.se/work/%'", 100)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Rows) != 1 || got.Rows[0][0] != ".se/work/wk-one.md" {
		t.Fatalf("the files left are %v", got.Rows)
	}
}

func TestAStaleIndexIsNotTrusted(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	two, _ := os.ReadFile(filepath.Join(r.Work, ".se", "work", "wk-two.md"))

	cases := []struct {
		name     string
		watching string
		beat     time.Time
	}{
		{"no beat at all", "yes", time.Time{}},
		{"a beat too old", "yes", time.Now().Add(-2 * indexFresh)},
		{"a fresh beat with the watcher deaf", "no", time.Now()},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if err := setMeta(db, "watching", c.watching); err != nil {
				t.Fatal(err)
			}
			beat := ""
			if !c.beat.IsZero() {
				beat = beatAt(c.beat)
			}
			if err := setMeta(db, "beat", beat); err != nil {
				t.Fatal(err)
			}
			if _, _, trusted := privateCopyInIndex(r, string(two)); trusted {
				t.Fatal("a stale index was trusted")
			}
			// THE GUARD STILL ANSWERS, off the files.
			if _, yes := copyOfAPrivateOriginal(r, string(two)); !yes {
				t.Fatal("the walk did not find the copy when the index was not trusted")
			}
		})
	}
}

func TestAnIndexFromAnotherTreeIsRebuilt(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	db.Close()

	// The same database opened for another root is not that root's index.
	other := Roots{Method: r.Method, Work: t.TempDir()}
	if err := os.MkdirAll(other.Private(), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(indexPath(r), indexPath(other)); err != nil {
		t.Fatal(err)
	}
	db, err = openIndex(other)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	var n int
	if err := db.QueryRow("SELECT count(*) FROM file").Scan(&n); err != nil {
		t.Fatal(err)
	}
	if n != 0 {
		t.Fatalf("the other tree's %d rows survived the open", n)
	}
}

func TestTheWatcherKeepsTheIndexInStep(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	fed, _ := aFedDaemon(t, r, true)

	// THE INDEX IS FRESH ONCE THE DAEMON HAS BUILT IT AND HEARD ITS COOKIE.
	if _, _, trusted := privateCopyInIndex(r, "anything"); !trusted {
		t.Fatal("the index is not trusted after the first scan and a heard cookie")
	}

	// A FILE WRITTEN BY SOMEBODY ELSE, WITH NO SYNC CALL, ARRIVES BY EVENT.
	three := filepath.Join(r.Work, ".se", "work", "wk-three.md")
	text := "---\nkind: [[work-token]]\ntitle: the third\n---\n\n## detail\n\nWritten by hand.\n"
	if err := os.WriteFile(three, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	fed.feed(three, fsnotify.Create)
	if _, found, _ := privateCopyInIndex(r, text); !found {
		t.Fatal("the hand-written note is not in the index after its event")
	}

	// AND A FILE THAT GOES, GOES.
	if err := os.Remove(three); err != nil {
		t.Fatal(err)
	}
	fed.feed(three, fsnotify.Remove)
	if _, found, _ := privateCopyInIndex(r, text); found {
		t.Fatal("the removed note is still in the index after its event")
	}
}

// markFresh says what the daemon says every tick, so a reader trusts the
// index a test built by hand.
func markFresh(t *testing.T, db *sql.DB) {
	t.Helper()
	if err := setMeta(db, "watching", "yes"); err != nil {
		t.Fatal(err)
	}
	if err := setMeta(db, "beat", beatAt(time.Now())); err != nil {
		t.Fatal(err)
	}
}
