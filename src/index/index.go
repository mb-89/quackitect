// The shape, the walk, and the rows it writes. The files stay the truth, and
// every row here comes out of them.
// [[spec/design_output/index#the-rows-the-walk-writes]]
package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3" // the real SQLite, through cgo, so FTS5 answers
)

const shape = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS file (
  path  TEXT PRIMARY KEY,
  size  INTEGER NOT NULL,
  mtime INTEGER NOT NULL,
  hash  TEXT NOT NULL,
  text  TEXT NOT NULL
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

const version = "2"

var skipped = map[string]bool{
	".git": true, ".se": true, "node_modules": true, ".claude-plugin": true,
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
	if err := os.Remove(at); err != nil && !os.IsNotExist(err) {
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
	return where == root
}

func setMeta(db *sql.DB, root string) error {
	for key, value := range map[string]string{"version": version, "root": root} {
		if _, err := db.Exec(
			`INSERT INTO meta (key, value) VALUES (?, ?)
			 ON CONFLICT (key) DO UPDATE SET value = excluded.value`, key, value); err != nil {
			return err
		}
	}
	return nil
}

func Reindex(db *sql.DB, root string) (int, error) {
	tx, err := db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	for _, one := range []string{
		`DELETE FROM file`, `DELETE FROM note`, `DELETE FROM link`,
		`DELETE FROM note_text`, `DELETE FROM line_text`,
	} {
		if _, err := tx.Exec(one); err != nil {
			return 0, err
		}
	}

	count := 0
	err = filepath.Walk(root, func(abs string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // a file that went while the walk ran is no fault of the walk
		}
		if info.IsDir() {
			if skipped[info.Name()] {
				return filepath.SkipDir
			}
			return nil
		}
		rel, ok := relOf(root, abs)
		if !ok {
			return nil
		}
		if err := one(tx, abs, rel, info); err != nil {
			return err
		}
		count++
		return nil
	})
	if err != nil {
		return 0, err
	}
	if err := resolve(tx); err != nil {
		return 0, err
	}
	return count, tx.Commit()
}

func relOf(root, abs string) (string, bool) {
	rel, err := filepath.Rel(root, abs)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "", false
	}
	return filepath.ToSlash(rel), true
}

func one(tx *sql.Tx, abs, rel string, info os.FileInfo) error {
	body, err := os.ReadFile(abs)
	if err != nil {
		return nil // unreadable here is absent, and the next walk answers again
	}

	sum := sha256.Sum256(body)
	text := ""
	if isText(body) {
		text = string(body)
	}
	if _, err := tx.Exec(
		`INSERT INTO file (path, size, mtime, hash, text) VALUES (?, ?, ?, ?, ?)
		 ON CONFLICT (path) DO UPDATE SET size = excluded.size,
		   mtime = excluded.mtime, hash = excluded.hash, text = excluded.text`,
		rel, info.Size(), info.ModTime().UnixNano(), hex.EncodeToString(sum[:]), text); err != nil {
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
	if len(b) > 8000 {
		b = b[:8000]
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

func resolve(tx *sql.Tx) error {
	ids, paths, folders, err := known(tx)
	if err != nil {
		return err
	}

	rows, err := tx.Query(`SELECT rowid, target FROM link`)
	if err != nil {
		return err
	}
	found := map[int64]string{}
	for rows.Next() {
		var id int64
		var target string
		if err := rows.Scan(&id, &target); err != nil {
			rows.Close()
			return err
		}
		if at := pointsAt(target, ids, paths, folders); at != "" {
			found[id] = at
		}
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for id, at := range found {
		if _, err := tx.Exec(`UPDATE link SET to_path = ? WHERE rowid = ?`, at, id); err != nil {
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

	for _, said := range []string{name, name + ".md"} {
		if at, ok := paths[said]; ok {
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
