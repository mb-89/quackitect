// The shape, the walk, and the rows it writes. The files stay the truth, and
// every row here comes out of them.
// [[spec/design_output/index#the-rows-the-walk-writes]]
package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"io/fs"
	"path/filepath"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3" // the real SQLite, through cgo, so FTS5 answers
	"quackitect/pointer"
)

const shape = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS file (
  path  TEXT PRIMARY KEY,
  size  INTEGER NOT NULL,
  mtime INTEGER NOT NULL,
  hash  TEXT NOT NULL,
  text  TEXT NOT NULL,
  tracked INTEGER NOT NULL DEFAULT 0
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
CREATE VIRTUAL TABLE IF NOT EXISTS note_text USING fts5 (path UNINDEXED, id, body);
CREATE VIRTUAL TABLE IF NOT EXISTS line_text USING fts5 (path UNINDEXED, n UNINDEXED, text);
`

const version = "3"

const textSniffBytes = 8000

// A plugin folder holds a tracked manifest, so the walk reads it like any other. [[spec/design_output/index#the-rows-the-walk-writes]]
var skipped = map[string]bool{
	".git": true, "node_modules": true,
}

// The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned by folders.js and spelled again here because a Go module imports no JavaScript.
const Runtime = ".se/.runtime"

// The private folder folders.js owns, spelled again here because a Go module imports no JavaScript. [[spec/design_output/index#the-rows-the-walk-writes]]
const Private = ".se"

func skips(root, abs string, info fs.FileInfo) bool {
	if skipped[info.Name()] {
		return true
	}
	rel, ok := relOf(root, abs)
	return ok && machinery(rel)
}

// A dot folder under the private one holds what a tool writes: the runtime, the retro, the log. The walk and the watch stand off it, and read every other folder there. [[spec/design_output/index#the-rows-the-walk-writes]]
func machinery(rel string) bool {
	under, ok := strings.CutPrefix(rel, Private+"/")
	return ok && strings.HasPrefix(under, ".")
}

func Open(root, at string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dsn(at))
	if err != nil {
		return nil, err
	}
	if fresh(db, root) {
		if _, err := db.Exec(shape); err != nil {
			return nil, err
		}
		return db, setMeta(db, root)
	}

	db.Close()
	if err := removeFile(at); err != nil && !errors.Is(err, fs.ErrNotExist) {
		return nil, err
	}
	db, err = sql.Open("sqlite3", dsn(at))
	if err != nil {
		return nil, err
	}
	if _, err := db.Exec(shape); err != nil {
		return nil, err
	}
	return db, setMeta(db, root)
}

func dsn(at string) string {
	return "file:" + at + "?_journal_mode=WAL&_busy_timeout=5000&_synchronous=NORMAL"
}

func fresh(db *sql.DB, root string) bool {
	var held string
	if err := db.QueryRow(`SELECT value FROM meta WHERE key = 'version'`).Scan(&held); err != nil {
		return true // a file with no meta is a file this builds
	}
	if held != version {
		return false
	}
	var where string
	if err := db.QueryRow(`SELECT value FROM meta WHERE key = 'root'`).Scan(&where); err != nil {
		return false
	}
	return rooted(where) == rooted(root)
}

func setMeta(db *sql.DB, root string) error {
	for key, value := range map[string]string{"version": version, "root": rooted(root)} {
		if _, err := db.Exec(
			`INSERT INTO meta (key, value) VALUES (?, ?)
			 ON CONFLICT (key) DO UPDATE SET value = excluded.value`, key, value); err != nil {
			return err
		}
	}
	return nil
}

func relOf(root, abs string) (string, bool) {
	rel, err := filepath.Rel(root, abs)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "", false
	}
	return filepath.ToSlash(rel), true
}

func one(tx *sql.Tx, abs, rel string, info fs.FileInfo, tracked bool) error {
	body, err := readFile(abs)
	if err != nil {
		return nil // unreadable here is absent, and the next walk answers again
	}

	sum := sha256.Sum256(body)
	text := ""
	if isText(body) {
		text = string(body)
	}
	if _, err := tx.Exec(
		`INSERT INTO file (path, size, mtime, hash, text, tracked) VALUES (?, ?, ?, ?, ?, ?)
		 ON CONFLICT (path) DO UPDATE SET size = excluded.size,
		   mtime = excluded.mtime, hash = excluded.hash, text = excluded.text, tracked = excluded.tracked`,
		rel, info.Size(), info.ModTime().UnixNano(), hex.EncodeToString(sum[:]), text, tracked); err != nil {
		return err
	}

	if text == "" {
		return nil
	}
	if err := lines(tx, rel, text); err != nil {
		return err
	}
	if !strings.HasSuffix(rel, ".md") {
		return nil
	}
	return note(tx, rel, text)
}

func lines(tx *sql.Tx, rel, text string) error {
	for n, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT INTO line_text (path, n, text) VALUES (?, ?, ?)`, rel, n+1, line); err != nil {
			return err
		}
	}
	return nil
}

func isText(b []byte) bool {
	if len(b) > textSniffBytes {
		b = b[:textSniffBytes]
	}
	for _, one := range b {
		if one == 0 {
			return false
		}
	}
	return true
}

func note(tx *sql.Tx, rel, text string) error {
	front, body := frontOf(text)
	if len(front) == 0 {
		return nil
	}

	id := front["id"]
	if id == "" {
		id = strings.TrimSuffix(filepath.Base(rel), ".md")
	}
	if _, err := tx.Exec(
		`INSERT INTO note (path, id, kind, front, body) VALUES (?, ?, ?, ?, ?)
		 ON CONFLICT (path) DO UPDATE SET id = excluded.id, kind = excluded.kind,
		   front = excluded.front, body = excluded.body`,
		rel, id, front["kind"], asJSON(front), body); err != nil {
		return err
	}
	if _, err := tx.Exec(
		`INSERT INTO note_text (path, id, body) VALUES (?, ?, ?)`, rel, id, body); err != nil {
		return err
	}

	for _, at := range linksIn(front, body) {
		if _, err := tx.Exec(
			`INSERT INTO link (from_path, key, target, to_path, line) VALUES (?, ?, ?, NULL, ?)`,
			rel, at.key, at.target, at.line); err != nil {
			return err
		}
	}
	return nil
}

// Every link against the path it reaches now. A row whose target turns writes again, so a link to a file gone reaches nothing, and the rest stand. [[spec/design_output/index#a-change-moves-its-rows]]
func resolve(tx *sql.Tx) error {
	ids, paths, folders, err := known(tx)
	if err != nil {
		return err
	}

	rows, err := tx.Query(`SELECT rowid, target, coalesce(to_path, '') FROM link`)
	if err != nil {
		return err
	}
	turned := map[int64]string{}
	for rows.Next() {
		var id int64
		var target, held string
		if err := rows.Scan(&id, &target, &held); err != nil {
			rows.Close()
			return err
		}
		if at := pointsAt(target, ids, paths, folders); at != held {
			turned[id] = at
		}
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for id, at := range turned {
		var to any = at
		if at == "" {
			to = nil
		}
		if _, err := tx.Exec(`UPDATE link SET to_path = ? WHERE rowid = ?`, to, id); err != nil {
			return err
		}
	}
	return nil
}

// [[spec/design_output/index#a-note-and-its-links]]
func pointsAt(target string, ids, paths, folders map[string]string) string {
	name := strings.TrimSpace(target)
	if at := strings.IndexByte(name, '#'); at >= 0 {
		name = strings.TrimSpace(name[:at])
	}
	name = strings.Trim(name, "/")
	if name == "" {
		return ""
	}

	// A ticket names its process with the ending off, so the resolver tries the endings the language server tries. [[spec/design_output/index#a-note-and-its-links]]
	for _, ending := range pointer.Endings {
		if at, ok := paths[name+ending]; ok {
			return at
		}
	}
	if at, ok := ids[name]; ok {
		return at
	}
	if at, ok := folders[name]; ok {
		return at
	}
	return ""
}

func known(tx *sql.Tx) (ids, paths, folders map[string]string, err error) {
	ids, paths, folders = map[string]string{}, map[string]string{}, map[string]string{}

	rows, err := tx.Query(`SELECT path FROM file`)
	if err != nil {
		return nil, nil, nil, err
	}
	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			rows.Close()
			return nil, nil, nil, err
		}
		paths[path] = path
		for at := strings.LastIndexByte(path, '/'); at > 0; at = strings.LastIndexByte(path[:at], '/') {
			folders[path[:at]] = path[:at]
		}
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return nil, nil, nil, err
	}

	notes, err := tx.Query(`SELECT id, path FROM note`)
	if err != nil {
		return nil, nil, nil, err
	}
	defer notes.Close()
	for notes.Next() {
		var id, path string
		if err := notes.Scan(&id, &path); err != nil {
			return nil, nil, nil, err
		}
		ids[id] = path
	}
	return ids, paths, folders, notes.Err()
}

func asJSON(front map[string]string) string {
	out := make([]string, 0, len(front))
	for _, key := range sorted(front) {
		out = append(out, strconv.Quote(key)+":"+strconv.Quote(front[key]))
	}
	return "{" + strings.Join(out, ",") + "}"
}

func sorted(front map[string]string) []string {
	out := make([]string, 0, len(front))
	for key := range front {
		out = append(out, key)
	}
	for i := 1; i < len(out); i++ {
		for j := i; j > 0 && out[j] < out[j-1]; j-- {
			out[j], out[j-1] = out[j-1], out[j]
		}
	}
	return out
}
