// The rows move with the files, and nothing clears them. A change rewrites the
// rows of the paths it names, a git index change marks the tracked rows again,
// and a sweep compares every file against its row to catch what the events miss.
// [[spec/design_output/index#a-change-moves-its-rows]]
package main

import (
	"database/sql"
	"io/fs"
	"path/filepath"
	"sort"
	"strings"
)

// What a row says of its file, which a sweep compares against the disk. [[spec/design_output/index#a-change-moves-its-rows]]
type stamped struct {
	size    int64
	mtime   int64
	tracked bool
}

// Every file the walk finds against its row: a file whose size or time moved writes again, and a row whose file stands nowhere goes. It answers the files it counts, and the paths whose rows moved. [[spec/design_output/index#a-change-moves-its-rows]]
func Sweep(db *sql.DB, root string) (int, int, error) {
	return sweep(db, root, trackedIn(root))
}

// The sweep against git's list a caller holds, which marks the rows a reader of the tracked tree takes. [[spec/design_output/index#the-rows-the-walk-writes]]
func sweep(db *sql.DB, root string, tracked func(rel string) bool) (int, int, error) {
	tx, err := db.Begin()
	if err != nil {
		return 0, 0, err
	}
	defer tx.Rollback()

	held, err := stampsIn(tx, "")
	if err != nil {
		return 0, 0, err
	}
	seen := map[string]bool{}
	count, moved := 0, 0
	err = filepath.Walk(root, func(abs string, info fs.FileInfo, err error) error {
		if err != nil {
			return nil // a file that went while the walk ran is no fault of the walk
		}
		if info.IsDir() {
			if skips(root, abs, info) {
				return filepath.SkipDir
			}
			return nil
		}
		rel, ok := relOf(root, abs)
		if !ok {
			return nil
		}
		seen[rel] = true
		count++
		was, known := held[rel]
		wrote, err := refresh(tx, abs, rel, info, tracked(rel), was, known)
		if wrote {
			moved++
		}
		return err
	})
	if err != nil {
		return 0, 0, err
	}
	for path := range held {
		if !seen[path] {
			if err := dropsUnder(tx, path); err != nil {
				return 0, 0, err
			}
			moved++
		}
	}
	// A whole sweep resolves every link, so a resolver that learns an ending reaches the rows no file moved. [[spec/design_output/index#a-change-moves-its-rows]]
	if err := resolve(tx); err != nil {
		return 0, 0, err
	}
	return count, moved, tx.Commit()
}

// The rows of the paths a change names: a file writes again, a path standing nowhere takes every row under it along, and a new folder walks. It answers the paths whose rows moved. [[spec/design_output/index#a-change-moves-its-rows]]
func Touches(db *sql.DB, root string, paths []string) (int, error) {
	return touches(db, root, paths, trackedIn(root))
}

// The change against git's list the door holds, so a saved file spawns no git. [[spec/design_output/index#a-change-moves-its-rows]]
func touches(db *sql.DB, root string, paths []string, tracked func(rel string) bool) (int, error) {
	tx, err := db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	moved := 0
	for _, rel := range paths {
		if outside(rel) {
			continue
		}
		abs := filepath.Join(root, filepath.FromSlash(rel))
		if _, err := statOf(abs); err != nil {
			if err := dropsUnder(tx, rel); err != nil {
				return 0, err
			}
			moved++
			continue
		}
		held, err := stampsIn(tx, rel)
		if err != nil {
			return 0, err
		}
		err = filepath.Walk(abs, func(at string, one fs.FileInfo, err error) error {
			if err != nil {
				return nil
			}
			if one.IsDir() {
				if skips(root, at, one) {
					return filepath.SkipDir
				}
				return nil
			}
			path, ok := relOf(root, at)
			if !ok {
				return nil
			}
			was, known := held[path]
			wrote, err := refresh(tx, at, path, one, tracked(path), was, known)
			if wrote {
				moved++
			}
			return err
		})
		if err != nil {
			return 0, err
		}
	}
	return moved, closes(tx, moved)
}

// Git's list again, and the flag on every row it turns. The index git keeps changes with no file of the tree changing, so the watch names it apart. [[spec/design_output/index#a-change-moves-its-rows]]
func Retracks(db *sql.DB, root string) (int, error) {
	return retracks(db, trackedIn(root))
}

// The flags against a list git answers once, which the door then holds for every change. [[spec/design_output/index#a-change-moves-its-rows]]
func retracks(db *sql.DB, tracked func(rel string) bool) (int, error) {
	tx, err := db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	held, err := stampsIn(tx, "")
	if err != nil {
		return 0, err
	}
	moved := 0
	for path, was := range held {
		if now := tracked(path); now != was.tracked {
			if _, err := tx.Exec(`UPDATE file SET tracked = ? WHERE path = ?`, now, path); err != nil {
				return 0, err
			}
			moved++
		}
	}
	return moved, tx.Commit()
}

// One file against its row. A size and a time both standing write nothing but a turned tracked flag, and a moved file drops what it wrote and writes again. [[spec/design_output/index#a-change-moves-its-rows]]
func refresh(tx *sql.Tx, abs, rel string, info fs.FileInfo, tracked bool, was stamped, known bool) (bool, error) {
	if known && was.size == info.Size() && was.mtime == info.ModTime().UnixNano() {
		if was.tracked == tracked {
			return false, nil
		}
		_, err := tx.Exec(`UPDATE file SET tracked = ? WHERE path = ?`, tracked, rel)
		return err == nil, err
	}
	if known {
		if err := dropsOf(tx, rel); err != nil {
			return false, err
		}
	}
	return true, one(tx, abs, rel, info, tracked)
}

// The rows a file writes beside its own: the note, its links, its body and its lines. [[spec/design_output/index#a-change-moves-its-rows]]
func dropsOf(tx *sql.Tx, rel string) error {
	for _, one := range []string{
		`DELETE FROM note WHERE path = ?`,
		`DELETE FROM link WHERE from_path = ?`,
		`DELETE FROM note_text WHERE path = ?`,
		`DELETE FROM line_text WHERE path = ?`,
	} {
		if _, err := tx.Exec(one, rel); err != nil {
			return err
		}
	}
	return nil
}

// Every row of a path and of each path under it, because a path standing nowhere names a file or a folder alike. [[spec/design_output/index#a-change-moves-its-rows]]
func dropsUnder(tx *sql.Tx, rel string) error {
	rows, err := tx.Query(`SELECT path FROM file WHERE path = ? OR substr(path, 1, ?) = ?`, rel, len(rel)+1, rel+"/")
	if err != nil {
		return err
	}
	paths := []string{}
	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			rows.Close()
			return err
		}
		paths = append(paths, path)
	}
	rows.Close()
	for _, path := range paths {
		if err := dropsOf(tx, path); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM file WHERE path = ?`, path); err != nil {
			return err
		}
	}
	return rows.Err()
}

// The rows of every path, or of the ones under a path named. [[spec/design_output/index#a-change-moves-its-rows]]
func stampsIn(tx *sql.Tx, under string) (map[string]stamped, error) {
	query, args := `SELECT path, size, mtime, tracked FROM file`, []any{}
	if under != "" {
		query += ` WHERE path = ? OR substr(path, 1, ?) = ?`
		args = append(args, under, len(under)+1, under+"/")
	}
	rows, err := tx.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]stamped{}
	for rows.Next() {
		var path string
		var one stamped
		if err := rows.Scan(&path, &one.size, &one.mtime, &one.tracked); err != nil {
			return nil, err
		}
		out[path] = one
	}
	return out, rows.Err()
}

// A path under a folder the walk stands off, which a change names and the rows keep nothing of. [[spec/design_output/index#the-rows-the-walk-writes]]
func outside(rel string) bool {
	if rel == "" || strings.HasPrefix(rel, "..") {
		return true
	}
	for _, part := range strings.Split(rel, "/") {
		if skipped[part] {
			return true
		}
	}
	return machinery(rel)
}

// The links resolve again where a row moved, because a path coming or going turns what a link reaches, and the whole answer lands at once. [[spec/design_output/index#a-change-moves-its-rows]]
func closes(tx *sql.Tx, moved int) error {
	if moved > 0 {
		if err := resolve(tx); err != nil {
			return err
		}
	}
	return tx.Commit()
}

// The paths a change names, once each and in order. [[spec/design_output/index#a-change-moves-its-rows]]
func named(paths map[string]bool) []string {
	out := []string{}
	for path := range paths {
		out = append(out, path)
	}
	sort.Strings(out)
	return out
}
