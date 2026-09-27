// The one writer of frontmatter: each op rewrites the front of a note in one
// form, and leaves the body byte for byte.
// [[spec/tickets/go-writes-the-frontmatter]]
package front

import (
	"errors"
	"regexp"
	"strings"
)

var ErrNoFront = errors.New("the note carries no front")

const (
	fence  = "---"
	entry  = "  - "
	field  = "    "
	nested = "      - "
	deeper = "        "
	record = "record"
	before = "hash_before"
	after  = "hash_after"
)

// A mark a YAML reader takes for something other than text when a value opens on it. [[spec/tickets/go-writes-the-frontmatter]]
const marks = "\"'[{&*!|>%@`#"

var link = regexp.MustCompile(`^\[\[[^\[\]]*\]\]$`)

// One rule for every scalar: a link and a plain word stand bare, and a value a reader takes for a mapping, a comment, a mark or a list goes in double quotes. [[spec/tickets/go-writes-the-frontmatter]]
func Quote(said string) string {
	if link.MatchString(said) {
		return said
	}
	plain := said != "" && !strings.Contains(said, ": ") && !strings.Contains(said, " #") &&
		!strings.ContainsAny(said[:1], marks) && !strings.HasPrefix(said, "- ") &&
		!strings.HasSuffix(said, " ") && !strings.ContainsAny(said, "\n\r")
	if plain {
		return said
	}
	return `"` + strings.NewReplacer(`\`, `\\`, `"`, `\"`, "\n", `\n`, "\r", `\r`).Replace(said) + `"`
}

// A note split at its fences: the rows of the front, its line end, and the text past the closing fence. [[spec/tickets/go-writes-the-frontmatter]]
type note struct {
	rows []string
	eol  string
	rest string
}

func split(text string) (note, error) {
	lines := strings.SplitAfter(text, "\n")
	if len(lines) == 0 || strings.TrimRight(lines[0], "\r\n") != fence {
		return note{}, ErrNoFront
	}
	eol := "\n"
	if strings.HasSuffix(lines[0], "\r\n") {
		eol = "\r\n"
	}
	for at := 1; at < len(lines); at++ {
		if strings.TrimRight(lines[at], "\r\n") == fence {
			rows := make([]string, 0, at-1)
			for _, one := range lines[1:at] {
				rows = append(rows, strings.TrimRight(one, "\r\n"))
			}
			return note{rows: rows, eol: eol, rest: strings.Join(lines[at:], "")}, nil
		}
	}
	return note{}, ErrNoFront
}

func (one note) String() string {
	var out strings.Builder
	out.WriteString(fence + one.eol)
	for _, row := range one.rows {
		out.WriteString(row + one.eol)
	}
	out.WriteString(one.rest)
	return out.String()
}

// The row a top-level key opens on, or -1. [[spec/tickets/go-writes-the-frontmatter]]
func (one note) keyAt(key string) int {
	for at, row := range one.rows {
		if row == key+":" || strings.HasPrefix(row, key+": ") {
			return at
		}
	}
	return -1
}

// The row past the block under a top-level key: every row indented or opening a list item. [[spec/tickets/go-writes-the-frontmatter]]
func (one note) blockEnd(opens int) int {
	at := opens + 1
	for at < len(one.rows) && (strings.HasPrefix(one.rows[at], " ") || strings.HasPrefix(one.rows[at], "\t") || strings.HasPrefix(one.rows[at], "-")) {
		at++
	}
	return at
}

func (one *note) splice(from, to int, rows ...string) {
	one.rows = append(one.rows[:from:from], append(rows, one.rows[to:]...)...)
}

// One top-level scalar, over the key and its block where it stands, and before the closing fence where it stands nowhere. [[spec/tickets/go-writes-the-frontmatter]]
func Set(text, key, value string) (string, error) {
	one, err := split(text)
	if err != nil {
		return text, err
	}
	row := key + ": " + Quote(value)
	if flowish(value) {
		row = key + ": " + value
	}
	if at := one.keyAt(key); at >= 0 {
		one.splice(at, one.blockEnd(at), row)
	} else {
		one.rows = append(one.rows, row)
	}
	return one.String(), nil
}

// A flow list or a flow map stands as written, the way normalise leaves one. [[spec/tickets/go-writes-the-frontmatter]]
func flowish(value string) bool {
	return !link.MatchString(value) && ((strings.HasPrefix(value, "[") && strings.HasSuffix(value, "]")) ||
		(strings.HasPrefix(value, "{") && strings.HasSuffix(value, "}")))
}

// One top-level key and the block under it. [[spec/tickets/go-writes-the-frontmatter]]
func Drop(text, key string) (string, error) {
	one, err := split(text)
	if err != nil {
		return text, err
	}
	if at := one.keyAt(key); at >= 0 {
		one.splice(at, one.blockEnd(at))
	}
	return one.String(), nil
}

// One item at the end of the record, which opens where none stands. A value standing empty writes no row. [[spec/tickets/go-writes-the-frontmatter]]
func Entry(text string, item Ordered) (string, error) {
	one, err := split(text)
	if err != nil {
		return text, err
	}
	rows := itemRows(item)
	if len(rows) == 0 {
		return text, nil
	}
	at := one.keyAt(record)
	if at < 0 {
		one.rows = append(one.rows, append([]string{record + ":"}, rows...)...)
		return one.String(), nil
	}
	ends := one.blockEnd(at)
	one.splice(ends, ends, rows...)
	return one.String(), nil
}

func itemRows(item Ordered) []string {
	var out []string
	for _, pair := range item {
		if empty(pair.Value) {
			continue
		}
		lead := field
		if len(out) == 0 {
			lead = entry
		}
		list, isList := pair.Value.([]any)
		if !isList {
			out = append(out, lead+pair.Key+": "+scalar(pair.Value))
			continue
		}
		out = append(out, lead+pair.Key+":")
		for _, each := range list {
			fields, _ := each.(Ordered)
			first := true
			for _, inner := range fields {
				if inner.Value == nil {
					continue
				}
				pad := deeper
				if first {
					pad, first = nested, false
				}
				out = append(out, pad+inner.Key+": "+scalar(inner.Value))
			}
		}
	}
	return out
}

func empty(value any) bool {
	switch said := value.(type) {
	case nil:
		return true
	case string:
		return said == ""
	case []any:
		return len(said) == 0
	}
	return false
}

// hash_after on the last record item standing open, and over the last item's where none stands open. [[spec/tickets/go-writes-the-frontmatter]]
func After(text, hash string) (string, error) {
	one, err := split(text)
	if err != nil {
		return text, err
	}
	opens := one.keyAt(record)
	if opens < 0 {
		return one.String(), nil
	}
	spans := one.items(opens, one.blockEnd(opens))
	if len(spans) == 0 {
		return one.String(), nil
	}
	row := field + after + ": " + Quote(hash)
	for i := len(spans) - 1; i >= 0; i-- {
		if one.holds(spans[i], before) && !one.holds(spans[i], after) {
			one.splice(spans[i][1], spans[i][1], row)
			return one.String(), nil
		}
	}
	last := spans[len(spans)-1]
	for at := last[0]; at < last[1]; at++ {
		if strings.HasPrefix(strings.TrimLeft(one.rows[at], " "), after+":") {
			one.rows[at] = row
		}
	}
	return one.String(), nil
}

// Where each item of a block opens and ends. [[spec/tickets/go-writes-the-frontmatter]]
func (one note) items(opens, ends int) [][2]int {
	var starts []int
	for at := opens + 1; at < ends; at++ {
		if strings.HasPrefix(one.rows[at], entry) {
			starts = append(starts, at)
		}
	}
	out := make([][2]int, len(starts))
	for i, at := range starts {
		out[i] = [2]int{at, ends}
		if i+1 < len(starts) {
			out[i][1] = starts[i+1]
		}
	}
	return out
}

func (one note) holds(span [2]int, key string) bool {
	for at := span[0]; at < span[1]; at++ {
		if strings.HasPrefix(strings.TrimLeft(strings.TrimPrefix(one.rows[at], entry), " "), key+":") {
			return true
		}
	}
	return false
}
