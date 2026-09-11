// The search the agent runs, answered out of the rows. Every text file keeps
// its whole body here, so a pattern meets the tree in one warm process.
// [[spec/design_output/index#the-search-reads-the-rows]]
package main

import (
	"database/sql"
	"regexp"
	"strings"
)

type GrepAsk struct {
	Pattern     string `json:"pattern"`
	Path        string `json:"path"`
	Glob        string `json:"glob"`
	Insensitive bool   `json:"insensitive"`
	Multiline   bool   `json:"multiline"`
	Only        bool   `json:"only"`
	Before      int    `json:"before"`
	After       int    `json:"after"`
	Limit       int    `json:"limit"`
	Offset      int    `json:"offset"`
}

type Found struct {
	Line  int    `json:"line"`
	Text  string `json:"text"`
	Match bool   `json:"match"`
}

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

func Grep(db *sql.DB, ask GrepAsk) (GrepSaid, error) {
	said := GrepSaid{Files: []FileHits{}}
	if strings.TrimSpace(ask.Pattern) == "" {
		return said, errorOf("a search takes a pattern")
	}

	pattern := ask.Pattern
	if ask.Multiline {
		pattern = "(?s)" + pattern
	}
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
	skipped := 0
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
		if skipped < ask.Offset {
			skipped++
			continue
		}
		if len(said.Files) >= limit {
			said.Cut = true
			continue
		}
		said.Files = append(said.Files, one)
	}
	return said, rows.Err()
}

func hitsIn(path, text string, shape *regexp.Regexp, ask GrepAsk) FileHits {
	one := FileHits{Path: path, Lines: []Found{}}
	body := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if ask.Multiline {
		return acrossLines(path, text, shape, ask)
	}

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
		said := body[n]
		if ask.Only && hit[n] {
			said = strings.Join(shape.FindAllString(body[n], -1), "\n")
		}
		one.Lines = append(one.Lines, Found{Line: n + 1, Text: said, Match: hit[n]})
	}
	return one
}

// [[spec/design_output/index#a-match-may-span-lines]]
func acrossLines(path, text string, shape *regexp.Regexp, ask GrepAsk) FileHits {
	one := FileHits{Path: path, Lines: []Found{}}
	said := strings.ReplaceAll(text, "\r\n", "\n")

	for _, at := range shape.FindAllStringIndex(said, -1) {
		one.Count++
		line := strings.Count(said[:at[0]], "\n") + 1
		held := said[at[0]:at[1]]
		if !ask.Only {
			held = wholeLines(said, at[0], at[1])
		}
		one.Lines = append(one.Lines, Found{Line: line, Text: held, Match: true})
	}
	return one
}

// [[spec/design_output/index#a-match-may-span-lines]]
func wholeLines(said string, from, to int) string {
	start := strings.LastIndexByte(said[:from], '\n') + 1
	end := strings.IndexByte(said[to:], '\n')
	if end < 0 {
		return said[start:]
	}
	return said[start : to+end]
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
