// The YAML subset a schema reads. A schema file holds maps, lists and one-line
// scalars, and this reads exactly that and nothing past it. A map keeps the
// order its file writes, so a finding names the fields in the order a person
// sees them.
// [[spec/design_output/schema#the-yaml-a-schema-reads]]
package yaml

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
type Doc struct {
	order []string
	at    map[string]any
}

func New() *Doc { return &Doc{at: map[string]any{}} }

// The fence a note's front opens and closes on. [[spec/design_output/schema#what-a-note-reads-as]]
const frontFence = "---"

// The front a note opens with, or nil where none stands. [[spec/tickets/shared-helpers-stand-once]]
func FrontOf(text string) *Doc {
	rows := SplitLines(text)
	if strings.TrimSpace(rows[0]) != frontFence {
		return nil
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) == frontFence {
			return AsDoc(Read(strings.Join(rows[1:at], "\n")))
		}
	}
	return nil
}

// The items of a flow list, for every package that splits one. [[spec/tickets/shared-helpers-stand-once]]
var FlowItems = flowItems

func (one *Doc) Set(key string, said any) {
	if one.at == nil {
		one.at = map[string]any{}
	}
	if _, held := one.at[key]; !held {
		one.order = append(one.order, key)
	}
	one.at[key] = said
}

func (one *Doc) Get(key string) any {
	if one == nil {
		return nil
	}
	return one.at[key]
}

func (one *Doc) Has(key string) bool {
	if one == nil {
		return false
	}
	_, held := one.at[key]
	return held
}

func (one *Doc) Keys() []string {
	if one == nil {
		return nil
	}
	return one.order
}

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func (one *Doc) MarshalJSON() ([]byte, error) {
	var out bytes.Buffer
	out.WriteByte('{')
	for at, key := range one.Keys() {
		if at > 0 {
			out.WriteByte(',')
		}
		writes := json.NewEncoder(&out)
		writes.SetEscapeHTML(false)
		if err := writes.Encode(key); err != nil {
			return nil, err
		}
		out.Truncate(out.Len() - 1)
		out.WriteByte(':')
		if err := writes.Encode(one.at[key]); err != nil {
			return nil, err
		}
		out.Truncate(out.Len() - 1)
	}
	out.WriteByte('}')
	return out.Bytes(), nil
}

var (
	PairAt    = regexp.MustCompile(`^([^:\s][^:]*):\s*(.*)$`)
	LinkAt    = regexp.MustCompile(`^\[\[(.+)\]\]$`)
	wholeAt   = regexp.MustCompile(`^-?\d+$`)
	commentAt = regexp.MustCompile(`^\s*#`)
	FirstWord = regexp.MustCompile(`\S`)
)

type row struct {
	indent int
	said   string
	line   int
}

type cursor struct {
	at    int
	lines map[string]int
}

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func Read(text string) any {
	said, _ := readWith(text, nil)
	return said
}

// [[spec/design_output/schema#a-line-per-nested-key]]
func ReadLines(text string) (any, map[string]int) {
	return readWith(text, map[string]int{})
}

func readWith(text string, lines map[string]int) (any, map[string]int) {
	rows := []row{}
	for at, raw := range SplitLines(text) {
		line := strings.TrimRight(raw, " \t")
		if strings.TrimSpace(line) == "" || commentAt.MatchString(line) {
			continue
		}
		where := FirstWord.FindStringIndex(line)
		rows = append(rows, row{indent: where[0], said: strings.TrimSpace(line), line: at + 1})
	}
	if len(rows) == 0 {
		return New(), lines
	}
	one := &cursor{lines: lines}
	return block(rows, one, rows[0].indent, ""), lines
}

// [[spec/design_output/schema#a-line-per-nested-key]]
func (one *cursor) mark(path string, line int) {
	if one.lines == nil || path == "" {
		return
	}
	if _, held := one.lines[path]; !held {
		one.lines[path] = line
	}
}

// [[spec/design_output/schema#a-line-per-nested-key]]
func Keyed(path, key string) string {
	if path == "" {
		return key
	}
	return path + "." + key
}

func block(rows []row, one *cursor, indent int, path string) any {
	if strings.HasPrefix(rows[one.at].said, "- ") {
		return listAt(rows, one, indent, path)
	}
	return mapAt(rows, one, indent, path)
}

func mapAt(rows []row, one *cursor, indent int, path string) any {
	out := New()
	for one.at < len(rows) {
		held := rows[one.at]
		if held.indent != indent {
			break
		}
		pair := PairAt.FindStringSubmatch(held.said)
		if pair == nil {
			break
		}
		one.at++
		key := strings.TrimSpace(pair[1])
		at := Keyed(path, key)
		one.mark(at, held.line)
		if rest := strings.TrimSpace(pair[2]); rest != "" {
			out.Set(key, scalar(rest))
			continue
		}
		out.Set(key, under(rows, one, held.indent, at))
	}
	return out
}

func listAt(rows []row, one *cursor, indent int, path string) any {
	out := []any{}
	for one.at < len(rows) {
		held := rows[one.at]
		if held.indent != indent || !strings.HasPrefix(held.said, "- ") {
			break
		}
		one.at++

		at := fmt.Sprintf("%s[%d]", path, len(out))
		one.mark(at, held.line)
		rest := strings.TrimSpace(held.said[2:])
		var pair []string
		if !QuotedWhole(rest) {
			pair = PairAt.FindStringSubmatch(rest)
		}
		if pair == nil {
			out = append(out, scalar(rest))
			continue
		}

		item := New()
		key := strings.TrimSpace(pair[1])
		first := Keyed(at, key)
		one.mark(first, held.line)
		if said := strings.TrimSpace(pair[2]); said != "" {
			item.Set(key, scalar(said))
		} else {
			item.Set(key, under(rows, one, held.indent+2, first))
		}
		for one.at < len(rows) && rows[one.at].indent > held.indent {
			next := rows[one.at]
			more := PairAt.FindStringSubmatch(next.said)
			if more == nil {
				break
			}
			one.at++
			deeper := strings.TrimSpace(more[1])
			deeperAt := Keyed(at, deeper)
			one.mark(deeperAt, next.line)
			if said := strings.TrimSpace(more[2]); said != "" {
				item.Set(deeper, scalar(said))
				continue
			}
			item.Set(deeper, under(rows, one, next.indent, deeperAt))
		}
		out = append(out, item)
	}
	return out
}

func under(rows []row, one *cursor, indent int, path string) any {
	if one.at >= len(rows) {
		return nil
	}
	next := rows[one.at]
	if next.indent > indent {
		return block(rows, one, next.indent, path)
	}
	if next.indent == indent && strings.HasPrefix(next.said, "- ") {
		return listAt(rows, one, indent, path)
	}
	return nil
}

func scalar(said string) any {
	bare := unquote(said)
	if LinkAt.MatchString(bare) {
		return bare
	}
	if strings.HasPrefix(bare, "[") && strings.HasSuffix(bare, "]") {
		out := []any{}
		for _, part := range flowItems(bare[1 : len(bare)-1]) {
			each := unquote(strings.TrimSpace(part))
			if each != "" {
				out = append(out, each)
			}
		}
		return out
	}
	if bare == "true" {
		return true
	}
	if bare == "false" {
		return false
	}
	if wholeAt.MatchString(bare) {
		whole, _ := strconv.Atoi(bare)
		return whole
	}
	return bare
}

// An item reads as quoted text where its closing quote stands last, so a colon inside stays text, and "a": "b" stays a pair. [[spec/tickets/the-quoted-pair-stays-paired]]
func QuotedWhole(said string) bool {
	if said == "" || (said[0] != '"' && said[0] != '\'') {
		return false
	}
	quote := said[0]
	for at := 1; at < len(said); at++ {
		if quote == '"' && said[at] == '\\' {
			at++
			continue
		}
		if said[at] != quote {
			continue
		}
		if quote == '\'' && at+1 < len(said) && said[at+1] == '\'' {
			at++
			continue
		}
		return at == len(said)-1
	}
	return false
}

// The items of a flow list, split at each comma outside a quote. [[spec/design_output/pull#the-fields-hold-their-forms]]
func flowItems(inside string) []string {
	out := []string{}
	var held strings.Builder
	var quote rune
	for _, char := range inside {
		switch {
		case quote != 0:
			held.WriteRune(char)
			if char == quote {
				quote = 0
			}
		case char == '"' || char == '\'':
			quote = char
			held.WriteRune(char)
		case char == ',':
			out = append(out, held.String())
			held.Reset()
		default:
			held.WriteRune(char)
		}
	}
	return append(out, held.String())
}

func unquote(said string) string {
	bare := strings.TrimSpace(said)
	quoted := (strings.HasPrefix(bare, `"`) && strings.HasSuffix(bare, `"`)) ||
		(strings.HasPrefix(bare, `'`) && strings.HasSuffix(bare, `'`))
	if quoted && len(bare) > 1 {
		return bare[1 : len(bare)-1]
	}
	return bare
}

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func SplitLines(text string) []string {
	return strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
}
