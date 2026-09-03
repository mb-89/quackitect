package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"maps"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3" // the real SQLite, through cgo, which the installer's compiler builds
)

// os.DirEntry AND os.FileInfo RATHER THAN THE io/fs SPELLING, because this
// package already has a function called fs: the one that reads a frontmatter
// field. One name, one thing.

// THE INDEX. A database over the tree, and never a second truth.
//
// The markdown files are the truth. This is an index rebuilt from them, kept
// in step by the resident engine's watcher and by every writer this program
// has, and deleted whole when its schema or its root disagrees with the tree
// it sits under. Nothing reads it as the truth: a reader that finds it stale
// or absent reads the files, the way it did before the index existed.
//
// WHAT IT BUYS. The guard compared every write against every private file by
// walking the private folder, and that walk grew with the work: measured at
// tens of milliseconds today and seconds at the size the tree is heading for.
// Against an index the same question is one lookup by size and hash. The
// links between notes become rows, so what links here, what dangles and what
// a word appears in are queries rather than walks. Every one of those is a
// question an agent can ask through the lane.
//
// IT LIVES UNDER .se, where it never travels, beside the record.

// indexSchema is the shape of the tables. A database carrying another number
// is dropped and rebuilt, so a change here needs no migration.
const indexSchema = 2

// indexFileLimit is the largest file that is hashed. A file above it is
// recorded with no hash, so it matches nothing: a write that large is not
// the copy of a private note this guards against.
const indexFileLimit = 16 << 20

// indexFresh is how old the daemon's beat may be before a reader stops
// trusting the index and reads the files instead.
const indexFresh = 30 * time.Second

func indexPath(r Roots) string { return r.Private("index.db") }

// THE TABLES. file is every regular file the walk covers. note is the
// markdown files among them that carry frontmatter. link is every link in a
// note, from the frontmatter with the field as its key, and from the body
// with no key. note_text is the full-text index over the bodies.
const indexTables = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS file (
  path  TEXT PRIMARY KEY,
  size  INTEGER NOT NULL,
  mtime INTEGER NOT NULL,
  hash  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS file_size_hash ON file (size, hash);
CREATE TABLE IF NOT EXISTS note (
  path  TEXT PRIMARY KEY,
  id    TEXT NOT NULL,
  kind  TEXT NOT NULL,
  front TEXT NOT NULL,
  body  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS note_id ON note (id);
CREATE TABLE IF NOT EXISTS link (
  from_path TEXT NOT NULL,
  key       TEXT NOT NULL,
  target    TEXT NOT NULL,
  to_path   TEXT,
  line      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS link_from ON link (from_path);
CREATE INDEX IF NOT EXISTS link_target ON link (target);
CREATE INDEX IF NOT EXISTS link_to ON link (to_path);
CREATE TABLE IF NOT EXISTS passage (
  hash TEXT NOT NULL,
  path TEXT NOT NULL,
  line INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS passage_hash ON passage (hash);
CREATE INDEX IF NOT EXISTS passage_path ON passage (path);
CREATE VIRTUAL TABLE IF NOT EXISTS note_text USING fts5 (path UNINDEXED, id, body);
`

// A PASSAGE IS A RUN OF LINES COPIED WHOLE. The private folder holds notes
// nobody cleaned up, and what must not cross into the shareable side is a
// passage of them, not a word or a sentence: quoting is allowed, pasting is
// not. Every run of passageLines consecutive lines, each at least
// passageWidth characters once trimmed, is hashed for every private file,
// and a write outside the private folder that carries one is refused with
// the file and line it came from.
const (
	passageLines = 3
	passageWidth = 40
)

// passagesIn answers the hash of every passage in a text, with the line the
// passage starts on. Blank lines are skipped over, so a paragraph broken by
// a blank line is still one passage; short lines end one, because a table
// row or a heading is what every note carries.
func passagesIn(text string) map[string]int {
	out := map[string]int{}
	var run []string
	var starts []int
	for i, raw := range strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		if len(line) < passageWidth {
			run, starts = nil, nil
			continue
		}
		run = append(run, line)
		starts = append(starts, i+1)
		if len(run) > passageLines {
			run, starts = run[1:], starts[1:]
		}
		if len(run) == passageLines {
			sum := sha256.Sum256([]byte(strings.Join(run, "\n")))
			key := hex.EncodeToString(sum[:16])
			if _, seen := out[key]; !seen {
				out[key] = starts[0]
			}
		}
	}
	return out
}

// THE FULL-TEXT INDEX IS FTS5, which ranks, takes prefix and phrase queries,
// and answers a snippet with the matched words marked. The driver builds it
// only under the sqlite_fts5 tag, and the installer puts that tag into
// GOFLAGS in cgo.env beside the compiler, so every build the tree makes
// carries it. A build without it fails here, loudly, on the first open.
const ftsMissing = "no such module: fts5"

// openIndex opens the database, making it when it is absent and remaking
// it when it was made for another schema or another tree.
//
// WAL, SO A READER NEVER WAITS ON THE WRITER. The guard reads while the
// daemon writes, and a busy timeout covers the moment two writers meet.
func openIndex(r Roots) (*sql.DB, error) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return nil, err
	}
	db, err := sql.Open("sqlite3", indexDSN(indexPath(r), false))
	if err != nil {
		return nil, err
	}
	if err := ensureIndexShape(db, r); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func indexDSN(p string, readOnly bool) string {
	dsn := "file:" + filepath.ToSlash(p) + "?_busy_timeout=5000&_journal_mode=WAL"
	if readOnly {
		dsn += "&mode=ro&_query_only=1"
	}
	return dsn
}

func ensureIndexShape(db *sql.DB, r Roots) error {
	if _, err := db.Exec(indexTables); err != nil {
		if strings.Contains(err.Error(), ftsMissing) {
			return fmt.Errorf("this engine was built without the sqlite_fts5 tag, so the index cannot be made. " +
				"Build with the environment in the installer's cgo.env, which sets GOFLAGS")
		}
		return fmt.Errorf("the index tables could not be made: %w", err)
	}
	schema, _ := metaOf(db, "schema")
	root, _ := metaOf(db, "root")
	want := fmt.Sprint(indexSchema)
	if schema == want && root == r.Work {
		return nil
	}
	// A DATABASE FROM ANOTHER SHAPE OR ANOTHER TREE IS DROPPED, NOT MIGRATED.
	// It is a cache, so the cost of being wrong is a rebuild and nothing else.
	for _, t := range []string{"file", "note", "link", "note_text", "passage", "meta"} {
		if _, err := db.Exec("DROP TABLE IF EXISTS " + t); err != nil {
			return err
		}
	}
	if _, err := db.Exec(indexTables); err != nil {
		return err
	}
	if err := setMeta(db, "schema", want); err != nil {
		return err
	}
	return setMeta(db, "root", r.Work)
}

func metaOf(db *sql.DB, key string) (string, bool) {
	var v string
	if err := db.QueryRow("SELECT value FROM meta WHERE key = ?", key).Scan(&v); err != nil {
		return "", false
	}
	return v, true
}

func setMeta(db *sql.DB, key, value string) error {
	_, err := db.Exec("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
		key, value)
	return err
}

// Indexed is what a full scan did.
type Indexed struct {
	Seen    int `json:"seen"`
	Written int `json:"written"`
	Dropped int `json:"dropped"`
}

// Reindex walks the tree once and brings every row into step with it. Files
// whose size and time are unchanged are not read again; files that went are
// dropped.
//
// IT IS THE ONLY WALK. It runs when the daemon starts and when the watcher
// says it lost events, and at no other time, because a walk on a timer costs
// the same and says nothing the watcher did not.
func Reindex(r Roots, db *sql.DB) (Indexed, error) {
	var out Indexed
	known := map[string][2]int64{}
	rows, err := db.Query("SELECT path, size, mtime FROM file")
	if err != nil {
		return out, err
	}
	for rows.Next() {
		var p string
		var size, mtime int64
		if err := rows.Scan(&p, &size, &mtime); err != nil {
			rows.Close()
			return out, err
		}
		known[p] = [2]int64{size, mtime}
	}
	rows.Close()

	seen := map[string]bool{}
	err = filepath.WalkDir(r.Work, func(abs string, d os.DirEntry, err error) error {
		if err != nil {
			return nil // a folder that cannot be read is a folder with nothing to index
		}
		rel, skip := indexRel(r, abs, d.IsDir())
		if skip {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		if d.IsDir() {
			return nil
		}
		info, err := d.Info()
		if err != nil {
			return nil
		}
		out.Seen++
		seen[rel] = true
		if was, ok := known[rel]; ok && was[0] == info.Size() && was[1] == info.ModTime().UnixNano() {
			return nil
		}
		if err := indexOne(db, r, abs, rel, info); err != nil {
			return err
		}
		out.Written++
		return nil
	})
	if err != nil {
		return out, err
	}
	for p := range known {
		if !seen[p] {
			if err := dropOne(db, p); err != nil {
				return out, err
			}
			out.Dropped++
		}
	}
	return out, resolveLinks(db)
}

// indexRel answers the root-relative slash path of a file, and whether the
// walk skips it.
//
// WHAT IS NOT INDEXED. Version control's own store, built programs, node's
// dependencies, the record, kept command outputs, and the database itself
// and its lock and temporary files. The record is left out because the
// design says it is not material: comparing against it would refuse a
// quotation from it.
func indexRel(r Roots, abs string, isDir bool) (string, bool) {
	rel, err := filepath.Rel(r.Work, abs)
	if err != nil || rel == "." {
		return "", isDir && rel != "."
	}
	rel = filepath.ToSlash(rel)
	name := path.Base(rel)
	if isDir {
		switch name {
		case ".git", ".bin", "node_modules", "log", "out":
			return rel, true
		}
		return rel, false
	}
	if strings.HasPrefix(name, "index.db") || strings.HasSuffix(name, ".lock") || strings.HasSuffix(name, ".tmp") {
		return rel, true
	}
	return rel, false
}

// IndexFile brings one file's rows into step with the disk, whether it was
// written, changed or removed. It is the sync call every writer makes after
// its write, so a writer never sees its own write missing from the index.
//
// A WRITER THAT CANNOT SYNC HAS STILL WRITTEN. The file is the truth, so the
// error is answered and the write stands; the daemon's watcher catches up.
func IndexFile(r Roots, abs string) error {
	rel, skip := indexRel(r, abs, false)
	if skip || rel == "" {
		return nil
	}
	db, err := openIndex(r)
	if err != nil {
		return err
	}
	defer db.Close()
	info, err := os.Stat(abs)
	if errors.Is(err, os.ErrNotExist) {
		return dropOne(db, rel)
	}
	if err != nil {
		return err
	}
	if info.IsDir() {
		return nil
	}
	if err := indexOne(db, r, abs, rel, info); err != nil {
		return err
	}
	return resolveLinks(db)
}

// indexOne writes the rows for one file: its size, time and hash, and when
// it is a note, its frontmatter, body and links.
func indexOne(db *sql.DB, r Roots, abs, rel string, info os.FileInfo) error {
	hash := ""
	var text []byte
	if info.Size() <= indexFileLimit {
		b, err := os.ReadFile(abs)
		if err != nil {
			return nil // gone or unreadable between the stat and the read, and the watcher says so again
		}
		sum := sha256.Sum256(b)
		hash = hex.EncodeToString(sum[:])
		text = b
	}
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec("INSERT INTO file (path, size, mtime, hash) VALUES (?, ?, ?, ?) "+
		"ON CONFLICT(path) DO UPDATE SET size = excluded.size, mtime = excluded.mtime, hash = excluded.hash",
		rel, info.Size(), info.ModTime().UnixNano(), hash); err != nil {
		return err
	}
	for _, q := range []string{"DELETE FROM note WHERE path = ?", "DELETE FROM link WHERE from_path = ?",
		"DELETE FROM note_text WHERE path = ?", "DELETE FROM passage WHERE path = ?"} {
		if _, err := tx.Exec(q, rel); err != nil {
			return err
		}
	}
	if strings.HasSuffix(rel, ".md") && text != nil {
		if err := indexNote(tx, rel, string(text)); err != nil {
			return err
		}
	}
	// THE PRIVATE FOLDER'S PASSAGES, and only its. What is already on the
	// shareable side needs no guarding against itself.
	if isPrivateMaterial(rel) && text != nil && isText(text) {
		for hash, line := range passagesIn(string(text)) {
			if _, err := tx.Exec("INSERT INTO passage (hash, path, line) VALUES (?, ?, ?)", hash, rel, line); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

// isPrivateMaterial says whether a root-relative path is material under the
// private folder: not the record, and not the index's own files.
func isPrivateMaterial(rel string) bool {
	return strings.HasPrefix(rel, ".se/") && !strings.HasPrefix(rel, ".se/log/")
}

// isText says whether bytes read as prose rather than a program's output.
// A byte that no text file holds decides it.
func isText(b []byte) bool {
	n := min(len(b), 4096)
	for _, c := range b[:n] {
		if c == 0 {
			return false
		}
	}
	return true
}

func dropOne(db *sql.DB, rel string) error {
	for _, q := range []string{"DELETE FROM file WHERE path = ?", "DELETE FROM note WHERE path = ?",
		"DELETE FROM link WHERE from_path = ?", "DELETE FROM note_text WHERE path = ?",
		"DELETE FROM passage WHERE path = ?"} {
		if _, err := db.Exec(q, rel); err != nil {
			return err
		}
	}
	// A note that went is a target that dangles now.
	_, err := db.Exec("UPDATE link SET to_path = NULL WHERE to_path = ?", rel)
	return err
}

// indexNote writes the rows a markdown note has beyond its file row. A file
// with no frontmatter is prose and gets none: it is indexed for the copy
// check and nothing else.
func indexNote(tx *sql.Tx, rel, text string) error {
	front, body := SplitNote(text)
	if front == "" {
		return nil
	}
	f, err := ParseFront(front)
	if err != nil {
		return nil // a note that will not read is said out loud where it is read, and has no rows here
	}
	id := strings.TrimSuffix(path.Base(rel), ".md")
	kind := unlink(fs(f, "kind"))
	if _, err := tx.Exec("INSERT INTO note (path, id, kind, front, body) VALUES (?, ?, ?, ?, ?)",
		rel, id, kind, frontJSON(f), body); err != nil {
		return err
	}
	if _, err := tx.Exec("INSERT INTO note_text (path, id, body) VALUES (?, ?, ?)", rel, id, body); err != nil {
		return err
	}
	for _, l := range linksIn(f, body) {
		if _, err := tx.Exec("INSERT INTO link (from_path, key, target, line) VALUES (?, ?, ?, ?)",
			rel, l.key, l.target, l.line); err != nil {
			return err
		}
	}
	return nil
}

// frontJSON writes the frontmatter as JSON with the brackets taken off every
// link, so a query reads a field with json_extract rather than parsing YAML,
// and reads a linked value as the name inside it.
func frontJSON(f Front) string {
	plain := map[string]any{}
	for k, v := range f {
		switch v := v.(type) {
		case []string:
			names := make([]string, len(v))
			for i, s := range v {
				names[i] = unlink(s)
			}
			plain[k] = names
		default:
			plain[k] = unlink(fmt.Sprint(v))
		}
	}
	b, err := json.Marshal(plain)
	if err != nil {
		return "{}"
	}
	return string(b)
}

func sortedFront(f Front) []string { return slices.Sorted(maps.Keys(f)) }

// linkAt is one link in a note: the field it sits under, or no field for a
// link in the body, and the line it is on.
type linkAt struct {
	key    string
	target string
	line   int
}

var linkPattern = regexp.MustCompile(`\[\[([^\]\n]+)\]\]`)

// linksIn reads every link out of a note. A frontmatter value in brackets is
// a typed link and the field is its type. A link in the body is a mention.
//
// THE FRONTMATTER IS SEARCHED FOR BRACKETS, NOT PARSED FOR THEM. A list is
// written in the block form by this program and in the flow form by a
// person, and a flow list reads as one string. The brackets are the link
// either way, so they are what is looked for.
func linksIn(f Front, body string) []linkAt {
	var out []linkAt
	for _, k := range sortedFront(f) {
		var values []string
		switch v := f[k].(type) {
		case []string:
			values = v
		default:
			values = []string{fmt.Sprint(v)}
		}
		for _, s := range values {
			for _, m := range linkPattern.FindAllStringSubmatch(s, -1) {
				out = append(out, linkAt{key: k, target: strings.TrimSpace(m[1])})
			}
		}
	}
	for i, line := range strings.Split(body, "\n") {
		for _, m := range linkPattern.FindAllStringSubmatch(line, -1) {
			target := strings.TrimSpace(m[1])
			// A link may carry a title after a bar, which is not the target.
			if at := strings.IndexByte(target, '|'); at >= 0 {
				target = strings.TrimSpace(target[:at])
			}
			out = append(out, linkAt{target: target, line: i + 1})
		}
	}
	return out
}

// resolveLinks fills in where every link points, the way the editor resolves
// one: a path from the root first, with or without .md, then a note by its
// name, then any file by its stem, which is how kind: [[work-token]] reaches
// the schema file. A link that reaches nothing keeps a null, which is what
// the dangling query reads.
//
// THE INDEX COVERS THE TREE BEING WORKED ON. A driven project's links into
// the method's own schemas and processes reach files outside that tree, and
// those dangle here until the method's files are notes of their own.
func resolveLinks(db *sql.DB) error {
	_, err := db.Exec(`
UPDATE link SET to_path = COALESCE(
  (SELECT path FROM file WHERE file.path = link.target),
  (SELECT path FROM file WHERE file.path = link.target || '.md'),
  (SELECT path FROM note WHERE note.id = link.target ORDER BY path LIMIT 1),
  (SELECT path FROM file WHERE file.path LIKE '%/' || link.target || '.%' ORDER BY path LIMIT 1)
)`)
	return err
}

// privateCopyInIndex asks the index whether content is a copy of a private
// file. The third answer says whether the index could be trusted at all: a
// reader that gets false there reads the files instead.
func privateCopyInIndex(r Roots, content string) (from string, found, trusted bool) {
	if _, err := os.Stat(indexPath(r)); err != nil {
		return "", false, false
	}
	db, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		return "", false, false
	}
	defer db.Close()
	if !indexIsFresh(db) {
		return "", false, false
	}
	sum := sha256.Sum256([]byte(content))
	hash := hex.EncodeToString(sum[:])
	var p string
	err = db.QueryRow("SELECT path FROM file WHERE size = ? AND hash = ? AND path LIKE '.se/%' "+
		"AND path NOT LIKE '.se/log/%' LIMIT 1", len(content), hash).Scan(&p)
	if errors.Is(err, sql.ErrNoRows) {
		return "", false, true
	}
	if err != nil {
		return "", false, false
	}
	return filepath.Join(r.Work, filepath.FromSlash(p)), true, true
}

// copiedPassage answers the first passage of content that a private file
// holds, as the file and the line it starts on. The third answer says
// whether the index could be trusted at all.
func copiedPassage(db *sql.DB, content string) (from string, line int, found bool) {
	for hash, at := range passagesIn(content) {
		var p string
		var l int
		if err := db.QueryRow("SELECT path, line FROM passage WHERE hash = ? ORDER BY path, line LIMIT 1", hash).Scan(&p, &l); err == nil {
			_ = at
			return p, l, true
		}
	}
	return "", 0, false
}

// copiedPassageInIndex is copiedPassage over the index file, trusted only
// while the daemon keeps it fresh.
func copiedPassageInIndex(r Roots, content string) (from string, line int, found, trusted bool) {
	if _, err := os.Stat(indexPath(r)); err != nil {
		return "", 0, false, false
	}
	db, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		return "", 0, false, false
	}
	defer db.Close()
	if !indexIsFresh(db) {
		return "", 0, false, false
	}
	from, line, found = copiedPassage(db, content)
	return from, line, found, true
}

// indexIsFresh says whether the daemon is watching and has said so lately.
// Liveness is not freshness: a daemon whose watcher went deaf beats on, so
// both are asked.
func indexIsFresh(db *sql.DB) bool {
	watching, _ := metaOf(db, "watching")
	if watching != "yes" {
		return false
	}
	beat, ok := metaOf(db, "beat")
	if !ok {
		return false
	}
	at, err := strconv.ParseInt(beat, 10, 64)
	return err == nil && time.Since(time.Unix(0, at)) < indexFresh
}

// beatAt spells a beat the way the meta table holds it: nanoseconds since
// the epoch, as an integer, so a reader compares numbers.
func beatAt(t time.Time) string { return strconv.FormatInt(t.UnixNano(), 10) }
