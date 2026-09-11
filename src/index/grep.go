// THE SEARCH THE AGENT RUNS, ANSWERED OUT OF THE ROWS. Every text file keeps
// its whole body here, so a pattern meets the tree in one process holding warm
// memory instead of a thousand reads walking a disk.
// [[spec/design_output/index#the-search-reads-the-rows]]
package main

import (
	"database/sql"
	"regexp"
	"strings"
)

// GrepAsk is one search, shaped the way the tool that asks it is shaped.
type GrepAsk struct {
	Pattern     string `json:"pattern"`
	Path        string `json:"path"`
	Glob        string `json:"glob"`
	Insensitive bool   `json:"insensitive"`
	Before      int    `json:"before"`
	After       int    `json:"after"`
	Limit       int    `json:"limit"`
}

// Found is one line, marked by whether the pattern meets it or it stands
// beside a line the pattern meets.
type Found struct {
	Line  int    `json:"line"`
	Text  string `json:"text"`
	Match bool   `json:"match"`
}

// FileHits gathers what one file answers, so a caller renders paths, counts
// or lines out of the same answer.
type FileHits struct {
	Path  string  `json:"path"`
	Count int     `json:"count"`
	Lines []Found `json:"lines,omitempty"`
}

type GrepSaid struct {
	Files []FileHits `json:"files"`
	Total int        `json:"total"`
	Cut   bool       `json:"cut"`
}

// Grep answers every file carrying the pattern, in path order, with the lines
// each one matches and the lines the caller asks for around them.
func Grep(db *sql.DB, ask GrepAsk) (GrepSaid, error) {
	said := GrepSaid{Files: []FileHits{}}
	if strings.TrimSpace(ask.Pattern) == "" {
		return said, errorOf("a search takes a pattern")
	}

	pattern := ask.Pattern
	if ask.Insensitive {
		pattern = "(?i)" + pattern
	}
	shape, err := regexp.Compile(pattern)
	if err != nil {
		return said, err
	}
	fits, err := matcher(ask.Glob)
	if err != nil {
		return said, err
	}

	rows, err := db.Query(`SELECT path, text FROM file WHERE text <> '' ORDER BY path`)
	if err != nil {
		return said, err
	}
	defer rows.Close()

	limit := ask.Limit
	if limit <= 0 {
		limit = 200
	}
	for rows.Next() {
		var path, text string
		if err := rows.Scan(&path, &text); err != nil {
			return said, err
		}
		if !under(path, ask.Path) || !fits(path) {
			continue
		}
		one := hitsIn(path, text, shape, ask)
		if one.Count == 0 {
			continue
		}
		said.Total += one.Count
		if len(said.Files) >= limit {
			said.Cut = true
			continue
		}
		said.Files = append(said.Files, one)
	}
	return said, rows.Err()
}

// hitsIn reads one body. The lines around a hit come in marked, so a caller
// prints them the way the tool it stands behind prints them.
func hitsIn(path, text string, shape *regexp.Regexp, ask GrepAsk) FileHits {
	one := FileHits{Path: path, Lines: []Found{}}
	body := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")

	wanted := map[int]bool{}
	hit := map[int]bool{}
	for n, line := range body {
		if !shape.MatchString(line) {
			continue
		}
		one.Count++
		hit[n] = true
		for at := n - ask.Before; at <= n+ask.After; at++ {
			if at >= 0 && at < len(body) {
				wanted[at] = true
			}
		}
	}
	if one.Count == 0 {
		return one
	}

	for n := range body {
		if !wanted[n] {
			continue
		}
		one.Lines = append(one.Lines, Found{Line: n + 1, Text: body[n], Match: hit[n]})
	}
	return one
}

type GlobAsk struct {
	Pattern string `json:"pattern"`
	Path    string `json:"path"`
	Limit   int    `json:"limit"`
}

type GlobSaid struct {
	Paths []string `json:"paths"`
	Cut   bool     `json:"cut"`
}

// Glob answers the paths a pattern names, the newest first, which is the
// order the tool it stands behind promises.
func Glob(db *sql.DB, ask GlobAsk) (GlobSaid, error) {
	said := GlobSaid{Paths: []string{}}
	fits, err := matcher(ask.Pattern)
	if err != nil {
		return said, err
	}

	rows, err := db.Query(`SELECT path FROM file ORDER BY mtime DESC, path`)
	if err != nil {
		return said, err
	}
	defer rows.Close()

	limit := ask.Limit
	if limit <= 0 {
		limit = 500
	}
	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			return said, err
		}
		if !under(path, ask.Path) || !fits(path) {
			continue
		}
		if len(said.Paths) >= limit {
			said.Cut = true
			break
		}
		said.Paths = append(said.Paths, path)
	}
	return said, rows.Err()
}
