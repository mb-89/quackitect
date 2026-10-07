// The search module: the find tool off the rows the index ranks, and a
// function's body off the disk. It stands off the
// wiring until the flip.
// [[spec/tickets/find-and-wait-in-go]]
package search

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/q"
)

// The module a find action lists its request to, its verb, and the tool it answers as. [[spec/tickets/find-and-wait-in-go]]
const (
	Module   = "search"
	findVerb = "find"
	readOnly = "a find reads the index and the disk, and writes nothing"
)

// A find: the words to look for, or a function name whose body it reads. [[spec/tickets/find-and-wait-in-go]]
type Find struct {
	Words    string `json:"words,omitempty" doc:"the words to look for"`
	Function string `json:"function,omitempty" doc:"a function name, whose body the find answers"`
}

// One row the index ranks: the path, the line and its text. [[spec/tickets/find-and-wait-in-go]]
type Row struct {
	Path string
	Line int
	Text string
}

// What the module reads: the tree, and the rows the index ranks for the words. [[spec/tickets/find-and-wait-in-go]]
type Outside struct {
	Root string
	Find func(words string) ([]Row, error)
}

// [[spec/tickets/find-and-wait-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, Module+"/"+findVerb, func(in Find) []q.Request {
			return []q.Request{{Module: Module, Verb: findVerb, Args: in, NoUndo: readOnly}}
		}, q.Doc("Finds the lines in this tree carrying the words, ranked by the index, or the body of a function by its name."), q.ToolName(findVerb), q.IO()),
	)
}

// The IO side of the module: it answers each request a find action lists. [[spec/tickets/find-and-wait-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(asked q.Request) (any, error) {
		in, ok := asked.Args.(Find)
		if !ok {
			return nil, fmt.Errorf("%s.%s takes no %T", asked.Module, asked.Verb, asked.Args)
		}
		return from.finds(in), nil
	}
}

// [[spec/design_output/index#the-rank-is-bm25]]
func (from Outside) finds(in Find) string {
	if name := strings.TrimSpace(in.Function); name != "" {
		return from.bodyFound(name)
	}
	words := strings.TrimSpace(in.Words)
	if words == "" {
		return findVerb + " takes the words to look for, or a function name."
	}
	rows, err := from.Find(words)
	if err != nil {
		return deadIndexLine(err)
	}
	return findSaid(rows)
}

// The index finds the line defining the name, and the disk hands the body to its matching close. [[spec/design_output/index#find-reads-a-body]]
func (from Outside) bodyFound(name string) string {
	rows, err := from.Find(name)
	if err != nil {
		return deadIndexLine(err)
	}
	defines := definitionOf(name)
	for _, row := range rows {
		if !defines.MatchString(row.Text) {
			continue
		}
		text, err := os.ReadFile(filepath.Join(from.Root, filepath.FromSlash(row.Path)))
		if err != nil {
			return row.Path + " stands in the index, and the disk holds it no more."
		}
		body := bodyFrom(strings.Split(string(text), "\n"), row.Line-1)
		return strings.Join(append([]string{row.Path + ":" + strconv.Itoa(row.Line)}, body...), "\n")
	}
	return "Nothing in the index defines " + name + "."
}

// [[spec/design_output/index#a-dead-index-speaks]]
func deadIndexLine(why error) string {
	return "The index is dead: " + why.Error() + ". Run ./RUNME.sh, which builds it, and Grep reads the disk until then."
}

func findSaid(rows []Row) string {
	if len(rows) == 0 {
		return "Nothing carries those words."
	}
	lines := make([]string, 0, len(rows))
	for _, one := range rows {
		lines = append(lines, fmt.Sprintf("%s:%d: %s", one.Path, one.Line, strings.TrimSpace(one.Text)))
	}
	return strings.Join(lines, "\n")
}

// A JavaScript function, a const holding an arrow, a method, or a Go func and method. [[spec/design_output/index#find-reads-a-body]]
func definitionOf(name string) *regexp.Regexp {
	it := regexp.QuoteMeta(name)
	return regexp.MustCompile(strings.Join([]string{
		`\bfunction\*?\s+` + it + `\s*\(`,
		`\b(const|let|var)\s+` + it + `\s*=`,
		`^\s*(async\s+)?` + it + `\s*\([^)]*\)\s*\{`,
		`^func\s+(\([^)]*\)\s*)?` + it + `\s*[(\[]`,
	}, "|"))
}

// The lines from the definition to the close that balances its first open, strings and comments read as text. [[spec/design_output/index#find-reads-a-body]]
func bodyFrom(lines []string, from int) []string {
	if from < 0 || from >= len(lines) {
		return nil
	}
	depth, opened := 0, false
	for at := from; at < len(lines); at++ {
		for _, mark := range bracesOf(lines[at]) {
			if mark == '{' {
				depth++
				opened = true
			} else {
				depth--
			}
		}
		if opened && depth <= 0 {
			return lines[from : at+1]
		}
	}
	return lines[from:]
}

// The braces of a line past its strings and its `//` comment: Go regexp has no backreference, so a scanner skips each quote to its close. [[spec/design_output/index#find-reads-a-body]]
func bracesOf(line string) []rune {
	var out []rune
	runes := []rune(line)
	for at := 0; at < len(runes); at++ {
		switch one := runes[at]; one {
		case '"', '\'', '`':
			at = closeOf(runes, at, one)
		case '/':
			if at+1 < len(runes) && runes[at+1] == '/' {
				return out
			}
		case '{', '}':
			out = append(out, one)
		}
	}
	return out
}

// The place of the quote closing the one at from, or from itself where none closes it, so the quote reads as text. [[spec/design_output/index#find-reads-a-body]]
func closeOf(runes []rune, from int, quote rune) int {
	for at := from + 1; at < len(runes); at++ {
		switch runes[at] {
		case '\\':
			at++
		case quote:
			return at
		}
	}
	return from
}
