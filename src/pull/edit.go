// The edit helpers the ticket verbs share: the schema's weighing of a value,
// the place a row takes, the plan file a place writes, and the front writes.
// [[spec/tickets/view-actions-run-through-verbs]]
package pull

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The words a flag and a place write. [[spec/design_output/pull#a-todo-forces-a-place]]
const (
	FlagOn     = "true"
	FlagOff    = "false"
	lastPlace  = "last"
	firstPlace = 1
	placesKey  = "places"
)

// The bases a radix prefix names, and the bits a number reads in, as Number reads a word. [[spec/tickets/view-actions-run-through-verbs]]
const (
	hexBase    = 16
	octalBase  = 8
	binaryBase = 2
	numberBits = 64
)

// The bare ticket new writes: a kind, an empty process the completion offers, and an ask to fill. [[spec/tickets/the-sidebar-writes-through-actions]]
const NewTicket = "---\nkind: [[ticket]]\nprocess: \"\"\n---\n\n# Ask\n"

var newTicketName = regexp.MustCompile(`^[a-z0-9-]+\.md$`)

// Whether the path names a ticket new writes: a lower-case name under one of the two ticket folders. [[spec/tickets/the-sidebar-writes-through-actions]]
func NewTicketPath(path string) bool {
	parts := strings.Split(path, "/")
	folder := strings.Join(parts[:len(parts)-1], "/")
	return (folder == Notes || folder == Tickets) && newTicketName.MatchString(parts[len(parts)-1])
}

// One field written through the front writer, and a note with no front comes back as it stands, as se-front answers it. [[spec/tickets/go-writes-the-frontmatter]]
func WithField(text, key, value string) (string, error) {
	return noFrontStands(front.Set(text, key, value))
}

// One field dropped through the front writer. [[spec/tickets/go-writes-the-frontmatter]]
func WithoutField(text, key string) (string, error) {
	return noFrontStands(front.Drop(text, key))
}

func noFrontStands(text string, err error) (string, error) {
	if errors.Is(err, front.ErrNoFront) {
		return text, nil
	}
	return text, err
}

// Why the field refuses the value, and nothing where the schema takes it. Weighs in src/tui/work/workedit.go holds the tab's twin, whose words differ, so this port stands apart from it. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func Weighs(schema, key, said string) string {
	frontmatter := yaml.AsDoc(yaml.AsDoc(yaml.Read(schema)).Get("frontmatter"))
	var rule *yaml.Doc
	needed := false
	if frontmatter != nil {
		rule = yaml.AsDoc(yaml.AsDoc(frontmatter.Get("properties")).Get(key))
		needed = slices.Contains(yaml.StringsOf(frontmatter.Get("required")), key)
	}
	if rule != nil && yaml.AsBool(rule.Get("x-engine")) {
		return key + " is the verbs' to write, so ./RUNME.sh ticket moves it and the door refuses the edit."
	}
	if rule == nil {
		return key + " stands in no ticket's front, so set writes it nowhere."
	}
	values := jsStrings(rule.Get("enum"))
	if rule.Has("const") {
		values = append(values, jsStrings([]any{rule.Get("const")})...)
	}
	types := jsStrings(rule.Get("type"))
	switch {
	case said == "" && needed:
		return key + " stands in every ticket, so it takes no empty value."
	case said == "":
		return ""
	case len(values) > 0 && !slices.Contains(values, said):
		return fmt.Sprintf("%s takes %s alone, and \"%s\" is none of them.", key, strings.Join(values, ", "), said)
	case len(values) > 0 || len(types) == 0:
		return ""
	}
	for _, kind := range types {
		if typeTakes(kind, said) {
			return ""
		}
	}
	return fmt.Sprintf("%s takes a %s, and \"%s\" reads as none.", key, strings.Join(types, " or "), said)
}

// Each value of a list or a lone value as String writes it, a null among them. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func jsStrings(said any) []string {
	out := []string{}
	if said == nil {
		return out
	}
	for _, one := range yaml.Flat(said) {
		if one == nil {
			out = append(out, "null")
			continue
		}
		out = append(out, yaml.AsString(one))
	}
	return out
}

var jsInteger = regexp.MustCompile(`^-?\d+$`)

// Whether one JSON Schema type takes the value. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func typeTakes(kind, said string) bool {
	switch kind {
	case "string":
		return true
	case "boolean":
		return said == FlagOn || said == FlagOff
	case "integer":
		return jsInteger.MatchString(said)
	case "number":
		_, ok := JSNumber(said)
		return strings.TrimSpace(said) != "" && ok
	}
	return false
}

var (
	jsDecimal = regexp.MustCompile(`^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$`)
	jsRadix   = regexp.MustCompile(`^0([xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)$`)
)

// A word as Number reads it, and whether that reads as a finite number. [[spec/tickets/view-actions-run-through-verbs]]
func JSNumber(said string) (float64, bool) {
	said = strings.TrimSpace(said)
	switch {
	case said == "":
		return 0, true
	case jsRadix.MatchString(said):
		base := map[byte]int{'x': hexBase, 'o': octalBase, 'b': binaryBase}[strings.ToLower(said[1:2])[0]]
		read, err := strconv.ParseUint(said[len("0x"):], base, numberBits)
		return float64(read), err == nil
	case jsDecimal.MatchString(said):
		read, err := strconv.ParseFloat(said, numberBits)
		return read, err == nil && !math.IsInf(read, 0)
	}
	return 0, false
}

// A row at one level of the queue. [[spec/tickets/view-actions-run-through-verbs]]
type PlaceRow struct {
	Name  string `json:"name"`
	Queue string `json:"queue"`
	Todo  string `json:"todo"`
}

var placeDigits = regexp.MustCompile(`^\d+$`)

// The number a place ends on, and nothing for a place a person's step or no place holds. [[spec/tickets/view-actions-run-through-verbs]]
func placeNumber(place string) int {
	last := place[strings.LastIndex(place, ".")+1:]
	if !placeDigits.MatchString(last) || strings.HasPrefix(place, "-") {
		return 0
	}
	n, _ := strconv.Atoi(last)
	return n
}

// The value a place writes for the row at n, or the notice saying why it writes none. [[spec/tickets/view-actions-run-through-verbs]]
func PlaceValue(rows []PlaceRow, name string, n int) (string, string) {
	one := PlaceRow{Name: name}
	if at := slices.IndexFunc(rows, func(row PlaceRow) bool { return row.Name == name }); at >= 0 {
		one = rows[at]
	}
	others := slices.DeleteFunc(slices.Clone(rows), func(row PlaceRow) bool { return row.Name == name })
	at := func(k int) string {
		for _, row := range others {
			if placeNumber(row.Queue) == k {
				return row.Name
			}
		}
		return ""
	}
	last := 0
	for _, row := range others {
		last = max(last, placeNumber(row.Queue))
	}
	mine := placeNumber(one.Queue)
	switch {
	case one.Todo != "" && one.Todo != FlagOff && mine == n:
		return FlagOff, ""
	case mine == n:
		return "", fmt.Sprintf("%s stands at %d already", name, n)
	case n == firstPlace:
		return FlagOn, ""
	}
	value := at(n)
	if mine != 0 && n >= mine {
		value = at(n + 1)
		if value == "" && last >= n {
			value = lastPlace
		}
	}
	if value != "" {
		return value, ""
	}
	return "", fmt.Sprintf("the places at this level end at %d, so no row stands at %d", last, n)
}

// One key of a JSON object, its value as the file holds it. [[spec/design_output/pull#a-todo-forces-a-place]]
type rawPair struct {
	key string
	raw json.RawMessage
}

// The pairs of a JSON object in their order, and nothing where the text reads as no object. [[spec/design_output/pull#a-todo-forces-a-place]]
func pairsOf(text []byte) []rawPair {
	read := json.NewDecoder(bytes.NewReader(text))
	if open, err := read.Token(); err != nil || open != json.Delim('{') {
		return nil
	}
	out := []rawPair{}
	for read.More() {
		key, err := read.Token()
		name, ok := key.(string)
		var raw json.RawMessage
		if err != nil || !ok || read.Decode(&raw) != nil {
			return nil
		}
		if at := slices.IndexFunc(out, func(one rawPair) bool { return one.key == name }); at >= 0 {
			out[at].raw = raw
			continue
		}
		out = append(out, rawPair{key: name, raw: raw})
	}
	return out
}

// The plan file with the override under places, and the false word takes it out, two spaces deep with a closing newline, as writePlace writes it. [[spec/design_output/pull#a-todo-forces-a-place]]
func PlacesWritten(plan, name, value string) string {
	pairs := pairsOf([]byte(plan))
	places := []rawPair{}
	at := slices.IndexFunc(pairs, func(one rawPair) bool { return one.key == placesKey })
	if at >= 0 {
		places = pairsOf(pairs[at].raw)
	}
	places = slices.DeleteFunc(places, func(one rawPair) bool { return value == FlagOff && one.key == name })
	if value != FlagOff {
		if held := slices.IndexFunc(places, func(one rawPair) bool { return one.key == name }); held >= 0 {
			places[held].raw = jsonOf(value)
		} else {
			places = append(places, rawPair{key: name, raw: jsonOf(value)})
		}
	}
	if at >= 0 {
		pairs[at].raw = objectOf(places)
	} else {
		pairs = append(pairs, rawPair{key: placesKey, raw: objectOf(places)})
	}
	var out bytes.Buffer
	if err := json.Indent(&out, objectOf(pairs), "", "  "); err != nil {
		return ""
	}
	return out.String() + "\n"
}

func objectOf(pairs []rawPair) json.RawMessage {
	var flat bytes.Buffer
	flat.WriteByte('{')
	for at, one := range pairs {
		if at > 0 {
			flat.WriteByte(',')
		}
		flat.Write(jsonOf(one.key))
		flat.WriteByte(':')
		flat.Write(one.raw)
	}
	flat.WriteByte('}')
	return flat.Bytes()
}

// A word as JSON with no HTML escape, as JSON.stringify writes it. [[spec/design_output/pull#a-todo-forces-a-place]]
func jsonOf(said string) json.RawMessage {
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(said)
	return bytes.TrimRight(out.Bytes(), "\n")
}
