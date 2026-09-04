package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"regexp"
	"strings"
)

// A SEARCH OVER THE TREE GOES THROUGH THE INDEX.
//
// THE OWNER'S WORDS: everything that's in the system is in the database, and
// the tools are rerouted through the database. Whenever we go into the
// database, wouldn't it make more sense to go over the index instead of doing
// it on disk? Wasn't that the whole point?
//
// IT WAS, AND THE INDEX DID NOT HOLD THE CODE. Every file was there as a path
// and a hash, and only a note's body could be searched, so a search for a Go
// symbol answered nothing and every agent went on reading the disk. Now every
// text file is in the index line by line, and this is the door: words for
// what the full-text index answers, a regex for what it cannot, a path glob
// to narrow either or to list files on its own. Every hit is a path, a line
// and the line itself, which is the shape a search is read in.
//
// THE REGEX RUNS OVER THE STORED LINES, NOT THE DISK. A full-text index
// matches terms and a regex matches characters, and the second cannot be
// had from the first. So a regex is a scan, over the text the index already
// holds, narrowed by the path's literal prefix where the glob has one.

// FindParams is one search, in whichever of its forms it was asked.
type FindParams struct {
	Words string `json:"words,omitempty"`
	Regex string `json:"regex,omitempty"`
	Path  string `json:"path,omitempty"`
	Limit int    `json:"limit,omitempty"`
}

// Hit is one line that matched.
type Hit struct {
	Path string `json:"path"`
	Line int    `json:"line"`
	Text string `json:"text"`
}

// Found is what a search answered.
type Found struct {
	Hits      []Hit    `json:"hits"`
	Files     []string `json:"files,omitempty"`
	Count     int      `json:"count"`
	Truncated bool     `json:"truncated,omitempty"`
	Fresh     bool     `json:"fresh"`
}

// findLimit is how many hits a search answers unless told otherwise.
const findLimit = 200

func runFind(c *call) int {
	fs := flag.NewFlagSet("find", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se find - search the tree through the index. Prints hits as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se find --words \"LoadConfig\"              lines holding the words, best first")
		fmt.Fprintln(c.err, "  se find --words \"\\\"one phrase\\\" pre*\"     FTS5 syntax: phrases, prefixes, AND OR NOT")
		fmt.Fprintln(c.err, "  se find --regex \"func \\(c \\*call\\)\"       a Go regular expression over every line")
		fmt.Fprintln(c.err, "  se find --regex \"TODO\" --path \"src/**/*.go\"   narrowed to a file glob")
		fmt.Fprintln(c.err, "  se find --path \"util/checks/*.mjs\"       the files a glob names, and nothing else")
		fmt.Fprintln(c.err, "  se find --archive --regex \"gooseberry\"  the same, over what has been archived")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  Every hit is a path, a line number and the line. fresh says whether")
		fmt.Fprintln(c.err, "  the engine is watching the tree; when it is not, hits may be behind the files.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	words := fs.String("words", "", "words to find, in FTS5 syntax")
	regex := fs.String("regex", "", "a regular expression, Go syntax, matched against each line")
	path := fs.String("path", "", "a glob over paths: * within a folder, ** across folders")
	limit := fs.Int("limit", findLimit, "how many hits to answer at most")
	archive := fs.Bool("archive", false, "search what has been archived rather than the tree")
	if code, stop := c.parse(fs, "find"); stop {
		return code
	}
	// THE ARCHIVE IS NOT IN THE INDEX, because it is not in the tree. It is
	// read where it lives, which is the tags, so closed work still answers.
	if *archive {
		// THE PATH IS HANDED OVER RATHER THAN LEFT BEHIND. Built from three of
		// the four fields, this dropped --path on the floor and the archive
		// answered unnarrowed, which is the one answer a narrowed search must
		// never give. FindArchived is the half that decides what it can read.
		got, err := FindArchived(c.roots, FindParams{Words: *words, Regex: *regex, Path: *path, Limit: *limit})
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(got)
		return 0
	}
	got, err := Find(c.roots, FindParams{Words: *words, Regex: *regex, Path: *path, Limit: *limit})
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(got)
	return 0
}

// Find puts one search to the engine that lives, and answers its hits.
//
// THE ENGINE ANSWERS, OR NOBODY DOES, for the reason Ask gives: the index is
// the running engine's, and a search off a file no engine is keeping may be
// behind the tree.
func Find(r Roots, p FindParams) (Found, error) {
	if err := p.check(); err != nil {
		return Found{}, err
	}
	raw, _, ok := askModel(r, "find", p)
	if !ok {
		return Found{}, fmt.Errorf("no engine is running over %s, so there is nothing to search. Start it: se --work %s", r.Work, r.Work)
	}
	var got Found
	if err := json.Unmarshal(raw, &got); err != nil {
		return Found{}, fmt.Errorf("the engine's answer will not read: %w", err)
	}
	return got, nil
}

// check says whether the search asks anything, and whether its regex and
// its glob read, before anything is looked at.
func (p FindParams) check() error {
	if p.Words == "" && p.Regex == "" && p.Path == "" {
		return fmt.Errorf("say what to find: --words, --regex, or --path")
	}
	if p.Regex != "" {
		if _, err := regexp.Compile(p.Regex); err != nil {
			return fmt.Errorf("the regex will not read: %w", err)
		}
	}
	if p.Path != "" {
		if _, err := globRegexp(p.Path); err != nil {
			return err
		}
	}
	return nil
}

// findDB runs one search over an open index. The connection is read-only.
func findDB(db *sql.DB, p FindParams) (Found, error) {
	if err := p.check(); err != nil {
		return Found{}, err
	}
	limit := p.Limit
	if limit <= 0 {
		limit = findLimit
	}
	out := Found{Hits: []Hit{}}
	var within *regexp.Regexp
	prefix := ""
	if p.Path != "" {
		within, _ = globRegexp(p.Path)
		prefix = literalPrefix(p.Path)
	}
	keep := func(path string) bool { return within == nil || within.MatchString(path) }

	// A PATH ALONE LISTS FILES, which is what a glob over the tree is for.
	if p.Words == "" && p.Regex == "" {
		rows, err := db.Query(`SELECT path FROM file WHERE path LIKE ? ESCAPE '\' ORDER BY path`, likePrefix(prefix))
		if err != nil {
			return out, err
		}
		defer rows.Close()
		for rows.Next() {
			var path string
			if err := rows.Scan(&path); err != nil {
				return out, err
			}
			if !keep(path) {
				continue
			}
			out.Count++
			if len(out.Files) < limit {
				out.Files = append(out.Files, path)
			} else {
				out.Truncated = true
			}
		}
		return out, rows.Err()
	}

	var rows *sql.Rows
	var err error
	if p.Words != "" {
		// THE FULL-TEXT INDEX ANSWERS TERMS, BEST FIRST. rank is FTS5's own
		// relevance, and the path narrows it in SQL where the glob has a
		// literal prefix, in Go for the rest.
		rows, err = db.Query("SELECT path, n, text FROM line_text WHERE line_text MATCH ? "+
			`AND path LIKE ? ESCAPE '\' ORDER BY rank`, p.Words, likePrefix(prefix))
	} else {
		rows, err = db.Query(`SELECT path, n, text FROM line_text WHERE path LIKE ? ESCAPE '\' `+
			"ORDER BY path, n", likePrefix(prefix))
	}
	if err != nil {
		return out, err
	}
	defer rows.Close()
	var re *regexp.Regexp
	if p.Regex != "" {
		re = regexp.MustCompile(p.Regex) // check compiled it already
	}
	for rows.Next() {
		var h Hit
		if err := rows.Scan(&h.Path, &h.Line, &h.Text); err != nil {
			return out, err
		}
		if !keep(h.Path) || (re != nil && !re.MatchString(h.Text)) {
			continue
		}
		out.Count++
		if len(out.Hits) < limit {
			out.Hits = append(out.Hits, h)
		} else {
			out.Truncated = true
		}
	}
	return out, rows.Err()
}

// globRegexp turns a path glob into the expression that decides it: * is
// anything within a folder, ** is anything across folders, ? is one
// character, and everything else is itself.
func globRegexp(glob string) (*regexp.Regexp, error) {
	var b strings.Builder
	b.WriteString("^")
	for i := 0; i < len(glob); i++ {
		switch {
		case strings.HasPrefix(glob[i:], "**/"):
			b.WriteString("(?:.*/)?")
			i += 2
		case strings.HasPrefix(glob[i:], "**"):
			b.WriteString(".*")
			i++
		case glob[i] == '*':
			b.WriteString("[^/]*")
		case glob[i] == '?':
			b.WriteString("[^/]")
		default:
			b.WriteString(regexp.QuoteMeta(glob[i : i+1]))
		}
	}
	b.WriteString("$")
	re, err := regexp.Compile(b.String())
	if err != nil {
		return nil, fmt.Errorf("the path glob will not read: %w", err)
	}
	return re, nil
}

// literalPrefix is the part of a glob before its first wildcard, which is
// what SQL can narrow by before Go decides the rest.
func literalPrefix(glob string) string {
	if i := strings.IndexAny(glob, "*?["); i >= 0 {
		return glob[:i]
	}
	return glob
}

// likePrefix is a LIKE pattern for everything under a literal prefix, with
// the characters LIKE would read as wildcards escaped.
//
// EVERY QUERY USING IT DECLARES ESCAPE '\'. SQLite has no default escape
// character, so a backslash written here without one is matched as a backslash:
// dev_guide/ became dev\_guide/% and matched nothing at all. Every path holding
// an underscore answered zero hits, and an answer of zero reads exactly like an
// empty folder. Three agents read one that way in a night and acted on it.
func likePrefix(prefix string) string {
	r := strings.NewReplacer("\\", "\\\\", "%", "\\%", "_", "\\_")
	return r.Replace(prefix) + "%"
}
