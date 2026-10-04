// The YAML subset a schema reads. A schema file holds maps, lists and one-line
// scalars, and this reads exactly that and nothing past it. A map keeps the
// order its file writes, so a finding names the fields in the order a person
// sees them.
// [[spec/design_output/schema#the-yaml-a-schema-reads]]
package yaml

import (
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
}

type cursor struct{ at int }

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func Read(text string) any {
	rows := []row{}
	for _, raw := range SplitLines(text) {
		line := strings.TrimRight(raw, " \t")
		if strings.TrimSpace(line) == "" || commentAt.MatchString(line) {
			continue
		}
		where := FirstWord.FindStringIndex(line)
		rows = append(rows, row{indent: where[0], said: strings.TrimSpace(line)})
	}
	if len(rows) == 0 {
		return New()
	}
	one := &cursor{}
	return block(rows, one, rows[0].indent)
}

func block(rows []row, one *cursor, indent int) any {
	if strings.HasPrefix(rows[one.at].said, "- ") {
		return listAt(rows, one, indent)
	}
	return mapAt(rows, one, indent)
}

func mapAt(rows []row, one *cursor, indent int) any {
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
		if rest := strings.TrimSpace(pair[2]); rest != "" {
			out.Set(key, scalar(rest))
			continue
		}
		out.Set(key, under(rows, one, held.indent))
	}
	return out
}

func listAt(rows []row, one *cursor, indent int) any {
	out := []any{}
	for one.at < len(rows) {
		held := rows[one.at]
		if held.indent != indent || !strings.HasPrefix(held.said, "- ") {
			break
		}
		one.at++

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
		if said := strings.TrimSpace(pair[2]); said != "" {
			item.Set(key, scalar(said))
		} else {
			item.Set(key, under(rows, one, held.indent+2))
		}
		for one.at < len(rows) && rows[one.at].indent > held.indent {
			next := rows[one.at]
			more := PairAt.FindStringSubmatch(next.said)
			if more == nil {
				break
			}
			one.at++
			deeper := strings.TrimSpace(more[1])
			if said := strings.TrimSpace(more[2]); said != "" {
				item.Set(deeper, scalar(said))
				continue
			}
			item.Set(deeper, under(rows, one, next.indent))
		}
		out = append(out, item)
	}
	return out
}

func under(rows []row, one *cursor, indent int) any {
	if one.at >= len(rows) {
		return nil
	}
	next := rows[one.at]
	if next.indent > indent {
		return block(rows, one, next.indent)
	}
	if next.indent == indent && strings.HasPrefix(next.said, "- ") {
		return listAt(rows, one, indent)
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

// An item reads as quoted text where its closing quote stands last, so a colon inside stays text, and "a": "b" stays a pair, as quotedWhole in lib/schema-yaml.js reads it. [[spec/tickets/the-quoted-pair-stays-paired]]
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

// The items of a flow list, split at each comma outside a quote, as flowItems in lib/schema-yaml.js splits them. [[spec/design_output/pull#the-fields-hold-their-forms]]
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
