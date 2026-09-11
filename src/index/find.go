// THE QUESTIONS THE INDEX ANSWERS. Each one is a walk the tree used to take:
// what a word appears in, what links here, and what points at nothing. The
// door hands these to a verb and to the agent, and both ask the same rows.
// [[spec/design_output/index#the-questions-it-answers]]
package main

import (
	"database/sql"
	"strings"
)

type Hit struct {
	Path string `json:"path"`
	Line int    `json:"line"`
	Text string `json:"text"`
}

type Link struct {
	From   string `json:"from"`
	Key    string `json:"key"`
	Target string `json:"target"`
	Line   int    `json:"line"`
}

// Find answers every line carrying the words, newest question first. The words
// go to FTS5, so a phrase in quotes and a trailing star both answer.
func Find(db *sql.DB, words string, limit int) ([]Hit, error) {
	if strings.TrimSpace(words) == "" {
		return []Hit{}, nil
	}
	if limit <= 0 {
		limit = 50
	}

	rows, err := db.Query(
		`SELECT path, n, text FROM line_text WHERE line_text MATCH ? ORDER BY rank LIMIT ?`,
		words, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Hit{}
	for rows.Next() {
		var one Hit
		if err := rows.Scan(&one.Path, &one.Line, &one.Text); err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, rows.Err()
}

// Links answers what reaches a note, which is the question a person asks
// before moving one.
func Links(db *sql.DB, target string) ([]Link, error) {
	rows, err := db.Query(
		`SELECT from_path, key, target, line FROM link
		 WHERE target = ? OR to_path = ? ORDER BY from_path, line`, target, target)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return linksOf(rows)
}

// Dangling answers every link naming nothing this tree holds.
func Dangling(db *sql.DB) ([]Link, error) {
	rows, err := db.Query(
		`SELECT from_path, key, target, line FROM link
		 WHERE to_path IS NULL ORDER BY from_path, line`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return linksOf(rows)
}

func linksOf(rows *sql.Rows) ([]Link, error) {
	out := []Link{}
	for rows.Next() {
		var one Link
		if err := rows.Scan(&one.From, &one.Key, &one.Target, &one.Line); err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, rows.Err()
}

// Same answers every file carrying the size and the hash of another, which is
// the copy question the guard used to walk a folder to answer.
func Same(db *sql.DB, path string) ([]string, error) {
	rows, err := db.Query(
		`SELECT other.path FROM file
		 JOIN file AS other ON other.size = file.size AND other.hash = file.hash
		 WHERE file.path = ? AND other.path <> file.path ORDER BY other.path`, path)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []string{}
	for rows.Next() {
		var one string
		if err := rows.Scan(&one); err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, rows.Err()
}
