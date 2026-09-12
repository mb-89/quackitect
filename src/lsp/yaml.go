// The YAML subset a schema reads. A schema file holds maps, lists and one-line
// scalars, and this reads exactly that and nothing past it. A map keeps the
// order its file writes, so a finding names the fields in the order a person
// sees them.
// [[spec/design_output/schema#the-yaml-a-schema-reads]]
package main

import (
	"regexp"
	"strconv"
	"strings"
)

// Doc is a map that keeps the order its file writes.
type Doc struct {
	order []string
	at    map[string]any
}

func newDoc() *Doc { return &Doc{at: map[string]any{}} }

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
	pairAt    = regexp.MustCompile(`^([^:\s][^:]*):\s*(.*)$`)
	linkAt    = regexp.MustCompile(`^\[\[(.+)\]\]$`)
	wholeAt   = regexp.MustCompile(`^-?\d+$`)
	commentAt = regexp.MustCompile(`^\s*#`)
	firstWord = regexp.MustCompile(`\S`)
)

type row struct {
	indent int
	said   string
}

type cursor struct{ at int }

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
func readYaml(text string) any {
	rows := []row{}
	for _, raw := range splitLines(text) {
		line := strings.TrimRight(raw, " \t")
		if strings.TrimSpace(line) == "" || commentAt.MatchString(line) {
			continue
		}
		where := firstWord.FindStringIndex(line)
		rows = append(rows, row{indent: where[0], said: strings.TrimSpace(line)})
	}
	if len(rows) == 0 {
		return newDoc()
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
	out := newDoc()
	for one.at < len(rows) {
		held := rows[one.at]
		if held.indent != indent {
			break
		}
		pair := pairAt.FindStringSubmatch(held.said)
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
		pair := pairAt.FindStringSubmatch(rest)
		if pair == nil {
			out = append(out, scalar(rest))
			continue
		}

		item := newDoc()
		key := strings.TrimSpace(pair[1])
		if said := strings.TrimSpace(pair[2]); said != "" {
			item.Set(key, scalar(said))
		} else {
			item.Set(key, under(rows, one, held.indent+2))
		}
		for one.at < len(rows) && rows[one.at].indent > held.indent {
			next := rows[one.at]
			more := pairAt.FindStringSubmatch(next.said)
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
	flat := unquote(said)
	if linkAt.MatchString(flat) {
		return flat
	}
	if strings.HasPrefix(flat, "[") && strings.HasSuffix(flat, "]") {
		out := []any{}
		for _, part := range strings.Split(flat[1:len(flat)-1], ",") {
			each := unquote(strings.TrimSpace(part))
			if each != "" {
				out = append(out, each)
			}
		}
		return out
	}
	if flat == "true" {
		return true
	}
	if flat == "false" {
		return false
	}
	if wholeAt.MatchString(flat) {
		whole, _ := strconv.Atoi(flat)
		return whole
	}
	return flat
}

func unquote(said string) string {
	flat := strings.TrimSpace(said)
	quoted := (strings.HasPrefix(flat, `"`) && strings.HasSuffix(flat, `"`)) ||
		(strings.HasPrefix(flat, `'`) && strings.HasSuffix(flat, `'`))
	if quoted && len(flat) > 1 {
		return flat[1 : len(flat)-1]
	}
	return flat
}

func splitLines(text string) []string {
	return strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
}
