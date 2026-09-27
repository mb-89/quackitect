// A whole front off an ordered map, and a front rewritten in the writer's form.
// [[spec/tickets/go-writes-the-frontmatter]]
package front

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

// A value off JSON: an object keeps the order of its keys, and a number keeps its digits. [[spec/tickets/go-writes-the-frontmatter]]
type Pair struct {
	Key   string
	Value any
}

type Ordered []Pair

func (one *Ordered) UnmarshalJSON(said []byte) error {
	read := json.NewDecoder(bytes.NewReader(said))
	read.UseNumber()
	value, err := decoded(read)
	if err != nil {
		return err
	}
	fields, ok := value.(Ordered)
	if !ok {
		return fmt.Errorf("a front reads off a JSON object, not %s", said)
	}
	*one = fields
	return nil
}

func decoded(read *json.Decoder) (any, error) {
	token, err := read.Token()
	if err != nil {
		return nil, err
	}
	switch token {
	case json.Delim('{'):
		out := Ordered{}
		for read.More() {
			key, err := read.Token()
			if err != nil {
				return nil, err
			}
			value, err := decoded(read)
			if err != nil {
				return nil, err
			}
			out = append(out, Pair{Key: fmt.Sprint(key), Value: value})
		}
		_, err := read.Token()
		return out, err
	case json.Delim('['):
		out := []any{}
		for read.More() {
			value, err := decoded(read)
			if err != nil {
				return nil, err
			}
			out = append(out, value)
		}
		_, err := read.Token()
		return out, err
	}
	return token, nil
}

func scalar(value any) string {
	switch said := value.(type) {
	case nil:
		return ""
	case string:
		return Quote(said)
	case bool:
		return fmt.Sprint(said)
	case json.Number:
		return said.String()
	}
	return Quote(fmt.Sprint(value))
}

// [[spec/tickets/go-writes-the-frontmatter]]
func Mint(fields Ordered) string {
	rows := []string{fence}
	for _, pair := range fields {
		rows = append(rows, keyRows(pair.Key, pair.Value, 0)...)
	}
	return strings.Join(append(rows, fence), "\n") + "\n"
}

func keyRows(key string, value any, pad int) []string {
	gap := strings.Repeat(" ", pad)
	switch said := value.(type) {
	case Ordered:
		return append([]string{gap + key + ":"}, blockRows(said, pad+2)...)
	case []any:
		if holdsObject(said) {
			return append([]string{gap + key + ":"}, blockRows(said, pad+2)...)
		}
		return []string{gap + key + ": " + flow(said)}
	case nil:
		return []string{gap + key + ":"}
	}
	return []string{gap + key + ": " + scalar(value)}
}

func blockRows(value any, pad int) []string {
	gap := strings.Repeat(" ", pad)
	var out []string
	switch said := value.(type) {
	case Ordered:
		for _, pair := range said {
			out = append(out, keyRows(pair.Key, pair.Value, pad)...)
		}
	case []any:
		for _, each := range said {
			fields, isObject := each.(Ordered)
			if !isObject {
				out = append(out, gap+"- "+scalar(each))
				continue
			}
			var rows []string
			for _, pair := range fields {
				rows = append(rows, keyRows(pair.Key, pair.Value, pad+2)...)
			}
			if len(rows) == 0 {
				continue
			}
			out = append(out, gap+"- "+strings.TrimLeft(rows[0], " "))
			out = append(out, rows[1:]...)
		}
	}
	return out
}

func holdsObject(list []any) bool {
	for _, each := range list {
		if _, ok := each.(Ordered); ok {
			return true
		}
	}
	return false
}

// A list of scalars stands on one line, each item in double quotes. [[spec/tickets/go-writes-the-frontmatter]]
func flow(list []any) string {
	items := make([]string, len(list))
	for i, each := range list {
		text := fmt.Sprint(each)
		if each == nil {
			text = ""
		}
		items[i] = `"` + strings.NewReplacer(`\`, `\\`, `"`, `\"`).Replace(text) + `"`
	}
	return "[" + strings.Join(items, ", ") + "]"
}

// A row carrying a key and a value, or a list item carrying a value alone. [[spec/tickets/go-writes-the-frontmatter]]
var (
	keyed = regexp.MustCompile(`^(\s*(?:- )?)([A-Za-z0-9_.-]+):(?:\s+(.*))?$`)
	item  = regexp.MustCompile(`^(\s*- )(.*)$`)
)

// The front rewritten in the writer's form, row by row, and the body left byte for byte. [[spec/tickets/go-writes-the-frontmatter]]
func Normalise(text string) (string, error) {
	one, err := split(text)
	if err != nil {
		return text, err
	}
	for at := 0; at < len(one.rows); at++ {
		row := one.rows[at]
		if found := keyed.FindStringSubmatch(row); found != nil {
			value := strings.TrimRight(found[3], " \t")
			if strings.HasPrefix(value, "|") || strings.HasPrefix(value, ">") {
				at = one.blockScalarEnd(at) - 1
				continue
			}
			if value == "" {
				one.rows[at] = found[1] + found[2] + ":"
				continue
			}
			one.rows[at] = found[1] + found[2] + ": " + canonical(value)
			continue
		}
		if found := item.FindStringSubmatch(row); found != nil && strings.TrimSpace(found[2]) != "" {
			one.rows[at] = found[1] + canonical(strings.TrimRight(found[2], " \t"))
		}
	}
	return one.String(), nil
}

func (one note) blockScalarEnd(opens int) int {
	indent := len(one.rows[opens]) - len(strings.TrimLeft(one.rows[opens], " "))
	at := opens + 1
	for at < len(one.rows) {
		row := one.rows[at]
		if strings.TrimSpace(row) != "" && len(row)-len(strings.TrimLeft(row, " ")) <= indent {
			break
		}
		at++
	}
	return at
}

// A value in the writer's form. A flow list, a flow map and a plain value carrying a comment stand as written. [[spec/tickets/go-writes-the-frontmatter]]
func canonical(value string) string {
	switch {
	case link.MatchString(value):
		return value
	case strings.HasPrefix(value, `"`):
		if said, ok := unescaped(value); ok {
			return Quote(said)
		}
		return value
	case strings.HasPrefix(value, "'"):
		if len(value) > 1 && strings.HasSuffix(value, "'") && !strings.Contains(strings.ReplaceAll(value[1:len(value)-1], "''", ""), "'") {
			return Quote(strings.ReplaceAll(value[1:len(value)-1], "''", "'"))
		}
		return value
	case strings.HasPrefix(value, "["), strings.HasPrefix(value, "{"), strings.Contains(value, " #"):
		return value
	}
	return Quote(value)
}

// The text inside a double-quoted value, where the value is one whole quote holding no escape past the four the writer writes. [[spec/tickets/go-writes-the-frontmatter]]
func unescaped(value string) (string, bool) {
	if len(value) < 2 || !strings.HasSuffix(value, `"`) {
		return "", false
	}
	var out strings.Builder
	inside := value[1 : len(value)-1]
	for at := 0; at < len(inside); at++ {
		switch inside[at] {
		case '"':
			return "", false
		case '\\':
			if at+1 >= len(inside) {
				return "", false
			}
			at++
			switch inside[at] {
			case '\\', '"':
				out.WriteByte(inside[at])
			case 'n':
				out.WriteByte('\n')
			case 'r':
				out.WriteByte('\r')
			default:
				return "", false
			}
		default:
			out.WriteByte(inside[at])
		}
	}
	return out.String(), true
}
