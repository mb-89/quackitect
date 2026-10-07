// The YAML a schema file holds, read as schema-yaml.js reads it: a map, a
// list, a flow list, a flow map and a scalar, each at the line it stands on.
// The shared reader under src/yaml leaves out the flow map the word lists
// write, so the projection keeps this copy.
// [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"strconv"
	"strings"
)

var (
	yamlLink    = regexp.MustCompile(`^\[\[(.+)\]\]$`)
	yamlPair    = regexp.MustCompile(`^([^:\s][^:]*):\s*(.*)$`)
	yamlWhole   = regexp.MustCompile(`^-?\d+$`)
	yamlComment = regexp.MustCompile(`^\s*#`)
	yamlLines   = regexp.MustCompile(`\r?\n`)
)

// The opening of a list item, and the indent its item map stands at. [[spec/tickets/config-verbs-port-to-go]]
const (
	itemMark   = "- "
	itemIndent = 2
)

type yamlRow struct {
	indent int
	said   string
}

type yamlCursor struct{ at int }

// A YAML text read into objects, lists and scalars, or an empty object where it holds no row. [[spec/tickets/config-verbs-port-to-go]]
func readYaml(text string) any {
	rows := []yamlRow{}
	for _, raw := range yamlLines.Split(text, -1) {
		line := jsTrimEnd(raw)
		if jsTrim(line) == "" || yamlComment.MatchString(line) {
			continue
		}
		indent := strings.IndexFunc(line, func(r rune) bool { return !jsSpace(r) })
		rows = append(rows, yamlRow{indent: indent, said: jsTrim(line)})
	}
	if len(rows) == 0 {
		return newObject()
	}
	return yamlBlock(rows, &yamlCursor{}, rows[0].indent)
}

// A list or a map, by the row it opens on. [[spec/tickets/config-verbs-port-to-go]]
func yamlBlock(rows []yamlRow, cursor *yamlCursor, indent int) any {
	if strings.HasPrefix(rows[cursor.at].said, itemMark) {
		return yamlList(rows, cursor, indent)
	}
	return yamlMap(rows, cursor, indent)
}

// The pairs standing at one indent. [[spec/tickets/config-verbs-port-to-go]]
func yamlMap(rows []yamlRow, cursor *yamlCursor, indent int) any {
	out := newObject()
	for cursor.at < len(rows) {
		one := rows[cursor.at]
		if one.indent != indent {
			break
		}
		pair := yamlPair.FindStringSubmatch(one.said)
		if pair == nil {
			break
		}
		cursor.at++
		out.Set(jsTrim(pair[1]), yamlValue(rows, cursor, pair[2], one.indent))
	}
	return out
}

// A pair's value: the scalar beside its key, or the block under it. [[spec/tickets/config-verbs-port-to-go]]
func yamlValue(rows []yamlRow, cursor *yamlCursor, rest string, indent int) any {
	if said := jsTrim(rest); said != "" {
		return yamlScalar(said)
	}
	return yamlUnder(rows, cursor, indent)
}

// The items standing at one indent. [[spec/tickets/config-verbs-port-to-go]]
func yamlList(rows []yamlRow, cursor *yamlCursor, indent int) any {
	out := []any{}
	for cursor.at < len(rows) {
		one := rows[cursor.at]
		if one.indent != indent || !strings.HasPrefix(one.said, itemMark) {
			break
		}
		cursor.at++
		rest := jsTrim(one.said[len(itemMark):])
		if strings.HasPrefix(rest, "{") {
			out = append(out, yamlScalar(rest))
			continue
		}
		var pair []string
		if !quotedWhole(rest) {
			pair = yamlPair.FindStringSubmatch(rest)
		}
		if pair == nil {
			out = append(out, yamlScalar(rest))
			continue
		}
		item := newObject()
		item.Set(jsTrim(pair[1]), yamlValue(rows, cursor, pair[2], one.indent+itemIndent))
		for cursor.at < len(rows) && rows[cursor.at].indent > one.indent {
			next := rows[cursor.at]
			more := yamlPair.FindStringSubmatch(next.said)
			if more == nil {
				break
			}
			cursor.at++
			item.Set(jsTrim(more[1]), yamlValue(rows, cursor, more[2], next.indent))
		}
		out = append(out, item)
	}
	return out
}

// Whether an item reads as quoted text, its closing quote standing last. [[spec/tickets/config-verbs-port-to-go]]
func quotedWhole(said string) bool {
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

// The block under a key, or null where nothing stands under it. [[spec/tickets/config-verbs-port-to-go]]
func yamlUnder(rows []yamlRow, cursor *yamlCursor, indent int) any {
	if cursor.at >= len(rows) {
		return Null{}
	}
	next := rows[cursor.at]
	if next.indent > indent {
		return yamlBlock(rows, cursor, next.indent)
	}
	if next.indent == indent && strings.HasPrefix(next.said, itemMark) {
		return yamlList(rows, cursor, indent)
	}
	return Null{}
}

// One scalar: a link, a flow map, a flow list, a boolean, a whole number or a text. [[spec/tickets/config-verbs-port-to-go]]
func yamlScalar(said string) any {
	flat := unquote(said)
	if yamlLink.MatchString(flat) {
		return flat
	}
	if strings.HasPrefix(flat, "{") && strings.HasSuffix(flat, "}") && len(flat) > 1 {
		return flowMap(flat[1 : len(flat)-1])
	}
	if strings.HasPrefix(flat, "[") && strings.HasSuffix(flat, "]") && len(flat) > 1 {
		out := []any{}
		for _, one := range flowItems(flat[1 : len(flat)-1]) {
			if each := unquote(jsTrim(one)); each != "" {
				out = append(out, each)
			}
		}
		return out
	}
	switch flat {
	case "true":
		return true
	case "false":
		return false
	}
	if yamlWhole.MatchString(flat) {
		n, _ := strconv.ParseFloat(flat, bitSize)
		return n
	}
	return flat
}

// The items of a flow list, split at a comma outside a quote. [[spec/tickets/config-verbs-port-to-go]]
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

// The pairs of a flow map. [[spec/tickets/config-verbs-port-to-go]]
func flowMap(said string) any {
	out := newObject()
	for _, one := range parted(said) {
		pair := yamlPair.FindStringSubmatch(jsTrim(one))
		if pair == nil {
			continue
		}
		out.Set(jsTrim(pair[1]), yamlScalar(jsTrim(pair[2])))
	}
	return out
}

// The parts of a flow map, split at a comma outside a bracket. [[spec/tickets/config-verbs-port-to-go]]
func parted(said string) []string {
	out := []string{}
	depth := 0
	var held strings.Builder
	for _, one := range said {
		if one == '[' || one == '{' {
			depth++
		}
		if one == ']' || one == '}' {
			depth--
		}
		if one == ',' && depth == 0 {
			out = append(out, held.String())
			held.Reset()
			continue
		}
		held.WriteRune(one)
	}
	out = append(out, held.String())
	kept := []string{}
	for _, one := range out {
		if jsTrim(one) != "" {
			kept = append(kept, one)
		}
	}
	return kept
}

// A text with the quotes around it cut. [[spec/tickets/config-verbs-port-to-go]]
func unquote(said string) string {
	flat := jsTrim(said)
	quotedText := (strings.HasPrefix(flat, `"`) && strings.HasSuffix(flat, `"`)) ||
		(strings.HasPrefix(flat, "'") && strings.HasSuffix(flat, "'"))
	if quotedText && len(flat) > 1 {
		return flat[1 : len(flat)-1]
	}
	return flat
}
