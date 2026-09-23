// The rows a reader of the whole tree takes: every path with its hash and
// whether git tracks it, and the text of the paths it names. A reader holds
// what it pulled, and asks again for the paths whose hash moved.
// [[spec/design_output/index#a-reader-takes-the-tree]]
package main

import (
	"database/sql"
	"strings"
)

// One row of the list: a path, its hash, and whether git tracks it. [[spec/design_output/index#a-reader-takes-the-tree]]
type Held struct {
	Path    string `json:"path"`
	Hash    string `json:"hash"`
	Tracked bool   `json:"tracked"`
}

// [[spec/design_output/index#a-reader-takes-the-tree]]
func Files(db *sql.DB) ([]Held, error) {
	rows, err := db.Query(`SELECT path, hash, tracked FROM file ORDER BY path`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Held{}
	for rows.Next() {
		var one Held
		if err := rows.Scan(&one.Path, &one.Hash, &one.Tracked); err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, rows.Err()
}

// The text of each path named, or of every path where none is named. A binary file answers the empty text. [[spec/design_output/index#a-reader-takes-the-tree]]
func Texts(db *sql.DB, paths []string) (map[string]string, error) {
	query, args := `SELECT path, text FROM file`, []any{}
	if len(paths) > 0 {
		query += ` WHERE path IN (?` + strings.Repeat(`, ?`, len(paths)-1) + `)`
		for _, one := range paths {
			args = append(args, one)
		}
	}
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]string{}
	for rows.Next() {
		var path, text string
		if err := rows.Scan(&path, &text); err != nil {
			return nil, err
		}
		out[path] = text
	}
	return out, rows.Err()
}
