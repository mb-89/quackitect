// The questions the index answers. Each one stands in place of a walk, and
// the door hands them to a verb and to the write door alike.
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
