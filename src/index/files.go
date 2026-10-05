// The rows a reader of the whole tree takes: every path with its hash and
// whether git tracks it, and the text of the paths it names. A reader holds
// what it pulled, and asks again for the paths whose hash moved.
// [[spec/design_output/index#a-reader-takes-the-tree]]
package index

import (
	"database/sql"
	"fmt"
	"math/bits"
	"strings"
	"unicode/utf16"
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

// The constants of hashText in .claude/skills/level0/lib/hash.js, which the two sides share. [[spec/design_output/pull#an-input-marks-its-steps]]
const (
	fnvOffset = 0x811c9dc5
	fnvPrime  = 0x01000193
	mixSeed   = 0x9e3779b9
	mixPrime  = 0x85ebca6b
	mixRotate = 13
)

// One path the hashes read, and the size of the head the caller hashed before. [[spec/design_output/pull#an-input-marks-its-steps]]
type HashAsk struct {
	Path string `json:"path"`
	Size int    `json:"size"`
}

// The hash of a text, its size, and the hash of its head at the size asked. [[spec/design_output/pull#an-input-marks-its-steps]]
type Hash struct {
	Hash string `json:"hash"`
	Size int    `json:"size"`
	Head string `json:"head"`
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
func Hashes(db *sql.DB, asks []HashAsk) (map[string]Hash, error) {
	paths := make([]string, 0, len(asks))
	for _, one := range asks {
		paths = append(paths, one.Path)
	}
	texts, err := Texts(db, paths)
	if err != nil || len(paths) == 0 {
		return map[string]Hash{}, err
	}
	out := map[string]Hash{}
	for _, one := range asks {
		text, ok := texts[one.Path]
		if !ok {
			continue
		}
		units := utf16.Encode([]rune(text))
		said := Hash{Hash: hashUnits(units), Size: len(units)}
		if one.Size > 0 && one.Size <= len(units) {
			said.Head = hashUnits(units[:one.Size])
		}
		out[one.Path] = said
	}
	return out, nil
}

// The hash hashText in .claude/skills/level0/lib/hash.js answers, over the UTF-16 units JavaScript reads. [[spec/design_output/pull#an-input-marks-its-steps]]
func hashUnits(units []uint16) string {
	low, high := uint32(fnvOffset), uint32(mixSeed)
	for _, code := range units {
		low = (low ^ uint32(code)) * fnvPrime
		high = (high + uint32(code) + 1) * mixPrime
		high = bits.RotateLeft32(high, mixRotate)
	}
	return fmt.Sprintf("%08x%08x", low, high)
}

// The hash hashText in .claude/skills/level0/lib/hash.js answers over a text. [[spec/design_output/tui#the-verb-builds-it]]
func HashText(text string) string { return hashUnits(utf16.Encode([]rune(text))) }

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
