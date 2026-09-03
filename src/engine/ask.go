package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"strings"
)

// se ask: a question to the index, answered as rows.
//
// THE AGENT GETS THE DATABASE, READ-ONLY. Every walk this program makes over
// the tree is a query an agent could make too, and a query it can write is
// worth more than a verb somebody thought of in advance. So the lane hands
// over SQL against the tables, with the shape printed by --schema, and three
// questions asked so often they have a flag of their own: a word in the
// bodies, what links to a note, and what dangles.
//
// IT CANNOT WRITE. The connection is opened read-only and query-only, and a
// statement that does not begin with SELECT or WITH is refused before it is
// sent, so the refusal names the rule rather than the driver.

// askLimit is how many rows come back unless the caller says otherwise, and
// askCeiling is the most it may say. A query that wants more pages with
// LIMIT and OFFSET, which the answer says.
const (
	askLimit   = 200
	askCeiling = 5000
)

// Asked is what a query answered.
type Asked struct {
	Columns   []string `json:"columns"`
	Rows      [][]any  `json:"rows"`
	Count     int      `json:"count"`
	Truncated bool     `json:"truncated,omitempty"`
	Fresh     bool     `json:"fresh"`
}

func runAsk(c *call) int {
	fs := flag.NewFlagSet("ask", flag.ContinueOnError)
	fs.SetOutput(c.out)
	fs.Usage = func() {
		fmt.Fprintln(c.out, "se ask - ask the index a question. Prints rows as JSON.")
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  se ask --sql \"SELECT id, json_extract(front, '$.status') FROM note WHERE kind = 'work-token'\"")
		fmt.Fprintln(c.out, "  se ask --search \"heredoc\"        notes whose body holds the words")
		fmt.Fprintln(c.out, "  se ask --links wk-1234567890     what links to it, what it links to")
		fmt.Fprintln(c.out, "  se ask --dangling                links that reach nothing")
		fmt.Fprintln(c.out, "  se ask --schema                  the tables, as they are made")
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  The index is read-only here. fresh says whether the engine is")
		fmt.Fprintln(c.out, "  watching the tree; when it is not, the rows may be behind the files.")
		fmt.Fprintln(c.out, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	sqlText := fs.String("sql", "", "a SELECT over the index")
	search := fs.String("search", "", "words to find in note bodies")
	links := fs.String("links", "", "a note id or path: what links to it and what it links to")
	dangling := fs.Bool("dangling", false, "every link that reaches nothing")
	schema := fs.Bool("schema", false, "print the tables and exit")
	limit := fs.Int("limit", askLimit, "how many rows to answer at most")
	if code, stop := c.parse(fs, "ask"); stop {
		return code
	}

	if *schema {
		fmt.Fprint(c.out, strings.TrimSpace(indexTables)+"\n")
		return 0
	}
	roots := c.roots
	got, err := Ask(roots, AskParams{SQL: *sqlText, Search: *search, Links: *links, Dangling: *dangling, Limit: *limit})
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(got)
	return 0
}

// AskParams is one question, in whichever of its forms it was asked.
type AskParams struct {
	SQL      string `json:"sql,omitempty"`
	Search   string `json:"search,omitempty"`
	Links    string `json:"links,omitempty"`
	Dangling bool   `json:"dangling,omitempty"`
	Limit    int    `json:"limit,omitempty"`
}

// query answers the SQL a question stands for. The three shaped questions
// are written here, once, so the verb and the model ask the same thing.
func (p AskParams) query() (string, error) {
	switch {
	case p.SQL != "":
		return p.SQL, nil
	case p.Search != "":
		// The body is the third column of the text table, and the snippet
		// marks the matched words. rank is FTS5's own relevance, best first.
		return "SELECT id, path, snippet(note_text, 2, '[', ']', '...', 24) AS snippet " +
			"FROM note_text WHERE note_text MATCH " + sqlString(p.Search) + " ORDER BY rank", nil
	case p.Links != "":
		return linksQuery(p.Links), nil
	case p.Dangling:
		return "SELECT from_path, key, target, line FROM link WHERE to_path IS NULL ORDER BY from_path, line", nil
	}
	return "", fmt.Errorf("say what to ask: --sql, --search, --links, --dangling or --schema")
}

// Ask puts one question to the engine that lives, and answers its rows.
//
// THE ENGINE ANSWERS, OR NOBODY DOES. The index is the running engine's, held
// open and kept in step by its watcher, and a question is put to it over its
// socket. With no engine over this folder the question is refused and the
// refusal says to start one: an answer read off a file no engine is keeping
// is an answer that may be behind the tree, and nobody asked for that.
func Ask(r Roots, p AskParams) (Asked, error) {
	query, err := p.query()
	if err != nil {
		return Asked{}, err
	}
	if err := readsOnly(query); err != nil {
		return Asked{}, err
	}
	raw, _, ok := askModel(r, "ask", p)
	if !ok {
		return Asked{}, fmt.Errorf("no engine is running over %s, so there is nothing to ask. Start it: se --work %s", r.Work, r.Work)
	}
	var got Asked
	if err := json.Unmarshal(raw, &got); err != nil {
		return Asked{}, fmt.Errorf("the engine's answer will not read: %w", err)
	}
	return got, nil
}

// askDB runs one query over an open index and answers its rows. The
// connection it is handed is read-only, and the first word is checked
// again, so a question that reaches here from any door cannot write.
func askDB(db *sql.DB, query string, limit int) (Asked, error) {
	if err := readsOnly(query); err != nil {
		return Asked{}, err
	}
	if limit <= 0 || limit > askCeiling {
		limit = askCeiling
	}
	var out Asked
	rows, err := db.Query(query)
	if err != nil {
		return out, fmt.Errorf("the query was refused: %w", err)
	}
	defer rows.Close()
	out.Columns, err = rows.Columns()
	if err != nil {
		return out, err
	}
	out.Rows = [][]any{}
	for rows.Next() {
		if out.Count == limit {
			out.Truncated = true
			break
		}
		cells := make([]any, len(out.Columns))
		refs := make([]any, len(out.Columns))
		for i := range cells {
			refs[i] = &cells[i]
		}
		if err := rows.Scan(refs...); err != nil {
			return out, err
		}
		for i, c := range cells {
			if b, ok := c.([]byte); ok {
				cells[i] = string(b)
			}
		}
		out.Rows = append(out.Rows, cells)
		out.Count++
	}
	return out, rows.Err()
}

// readsOnly refuses a statement that could write, by its first word. The
// connection refuses too, and this refusal says why in the caller's words.
func readsOnly(query string) error {
	words := strings.Fields(query)
	if len(words) == 0 {
		return fmt.Errorf("the query is empty")
	}
	first := strings.ToLower(words[0])
	switch first {
	case "select", "with", "explain":
		return nil
	}
	return fmt.Errorf("the index is read-only through this door, and %q is not a question. Begin with SELECT or WITH", first)
}

// linksQuery answers both directions of the links a note has, by id or path.
func linksQuery(name string) string {
	n := sqlString(name)
	return `SELECT 'in' AS direction, from_path AS path, key, target, line FROM link
 WHERE to_path = ` + n + ` OR to_path = ` + n + ` || '.md' OR target = ` + n + `
 OR to_path IN (SELECT path FROM note WHERE id = ` + n + `)
UNION ALL
SELECT 'out', COALESCE(to_path, '') AS path, key, target, line FROM link
 WHERE from_path = ` + n + ` OR from_path = ` + n + ` || '.md'
 OR from_path IN (SELECT path FROM note WHERE id = ` + n + `)
ORDER BY direction, path, line`
}

// sqlString quotes a value for SQL, the one way SQLite reads: the quote
// doubled and nothing else.
func sqlString(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}
