// The JavaScript values a projection reads, held the way node holds them: an
// object keeps its key order, null stands apart from a missing key, and a
// number prints and converts as String and Number do. Every shape reads its
// sources through these, so a Go target matches the node one byte for byte.
// [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"unicode/utf8"
)

// JSON null and a YAML key with nothing under it, apart from a missing key, which reads as nil. [[spec/tickets/config-verbs-port-to-go]]
type Null struct{}

// An object as node keeps one: the keys in the order the text writes them. [[spec/tickets/config-verbs-port-to-go]]
type Object struct {
	order []string
	at    map[string]any
}

// The bounds JavaScript prints a number inside without an exponent. [[spec/tickets/config-verbs-port-to-go]]
const (
	exponentAbove = 1e21
	exponentBelow = 1e-6
	// The largest array index, as the spec bounds one. [[spec/tickets/config-verbs-port-to-go]]
	largestIndex = 1<<32 - 2
	// A rune past this takes two UTF-16 units, as a JavaScript length counts it. [[spec/tickets/config-verbs-port-to-go]]
	lastSingleUnit = 0xFFFF
	// The bits of one hex digit, for a \u00XX escape. [[spec/tickets/config-verbs-port-to-go]]
	nibble     = 4
	nibbleMask = 0xF
	hexBase    = 16
	// The other bases a number text names, and the bit size it parses in. [[spec/tickets/config-verbs-port-to-go]]
	decimalBase = 10
	octalBase   = 8
	bitSize     = 64
	// The length of a base prefix such as 0x. [[spec/tickets/config-verbs-port-to-go]]
	prefixLength = 2
)

// An empty object. [[spec/tickets/config-verbs-port-to-go]]
func newObject() *Object { return &Object{at: map[string]any{}} }

// Sets a key, and keeps the place it first took, as a JavaScript assignment does. [[spec/tickets/config-verbs-port-to-go]]
func (one *Object) Set(key string, said any) {
	if _, held := one.at[key]; !held {
		one.order = append(one.order, key)
	}
	one.at[key] = said
}

// The value under a key, or nil where the object holds none. [[spec/tickets/config-verbs-port-to-go]]
func (one *Object) Get(key string) any {
	if one == nil {
		return nil
	}
	return one.at[key]
}

// Whether the object holds the key, as the in operator reads it. [[spec/tickets/config-verbs-port-to-go]]
func (one *Object) Has(key string) bool {
	if one == nil {
		return false
	}
	_, held := one.at[key]
	return held
}

// The keys in Object.keys order: the array indices ascending, then the rest as written. [[spec/tickets/config-verbs-port-to-go]]
func (one *Object) Keys() []string {
	if one == nil {
		return nil
	}
	var indices, rest []string
	for _, key := range one.order {
		if isIndex(key) {
			indices = append(indices, key)
			continue
		}
		rest = append(rest, key)
	}
	sort.SliceStable(indices, func(a, b int) bool {
		left, _ := strconv.ParseUint(indices[a], decimalBase, bitSize)
		right, _ := strconv.ParseUint(indices[b], decimalBase, bitSize)
		return left < right
	})
	return append(indices, rest...)
}

// A copy of the object with others laid over it, as the spread operator writes one. [[spec/tickets/config-verbs-port-to-go]]
func (one *Object) spread(more ...*Object) *Object {
	out := newObject()
	for _, each := range append([]*Object{one}, more...) {
		for _, key := range each.Keys() {
			out.Set(key, each.Get(key))
		}
	}
	return out
}

// Whether a key reads as an array index, which an object lists first. [[spec/tickets/config-verbs-port-to-go]]
func isIndex(key string) bool {
	n, err := strconv.ParseUint(key, decimalBase, bitSize)
	return err == nil && n <= largestIndex && strconv.FormatUint(n, decimalBase) == key
}

// The object a value holds, or nil where it holds another kind. [[spec/tickets/config-verbs-port-to-go]]
func asObject(said any) *Object {
	one, _ := said.(*Object)
	return one
}

// The value at a path of keys, as optional chaining reads it: nil where a step holds no object. [[spec/tickets/config-verbs-port-to-go]]
func dig(said any, keys ...string) any {
	for _, key := range keys {
		one := asObject(said)
		if one == nil {
			return nil
		}
		said = one.Get(key)
	}
	return said
}

// The object at a path, or an empty one, as `?? {}` reads it. [[spec/tickets/config-verbs-port-to-go]]
func objectAt(said any, keys ...string) *Object {
	if one := asObject(dig(said, keys...)); one != nil {
		return one
	}
	return newObject()
}

// The list a value holds, or none, as `Array.isArray(x) ? x : []` reads it. [[spec/tickets/config-verbs-port-to-go]]
func listOf(said any) []any {
	one, _ := said.([]any)
	return one
}

// Whether a value stands missing or null, the two `??` passes over. [[spec/tickets/config-verbs-port-to-go]]
func absent(said any) bool {
	if said == nil {
		return true
	}
	_, null := said.(Null)
	return null
}

// Whether a value reads true in a condition. [[spec/tickets/config-verbs-port-to-go]]
func truthy(said any) bool {
	switch one := said.(type) {
	case nil, Null:
		return false
	case bool:
		return one
	case float64:
		return one != 0 && !math.IsNaN(one)
	case string:
		return one != ""
	}
	return true
}

// A value as String writes it. [[spec/tickets/config-verbs-port-to-go]]
func jsString(said any) string {
	switch one := said.(type) {
	case nil:
		return "undefined"
	case Null:
		return "null"
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case float64:
		return numberString(one)
	case []any:
		parts := make([]string, len(one))
		for i, each := range one {
			parts[i] = joinString(each)
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// A value as a join writes it, where a missing one and null write nothing. [[spec/tickets/config-verbs-port-to-go]]
func joinString(said any) string {
	if absent(said) {
		return ""
	}
	return jsString(said)
}

// A number as JavaScript prints it. [[spec/tickets/config-verbs-port-to-go]]
func numberString(n float64) string {
	switch {
	case math.IsNaN(n):
		return "NaN"
	case math.IsInf(n, 1):
		return "Infinity"
	case math.IsInf(n, -1):
		return "-Infinity"
	case n == 0:
		return "0"
	}
	size := math.Abs(n)
	if size < exponentAbove && size >= exponentBelow {
		return strconv.FormatFloat(n, 'f', -1, bitSize)
	}
	said := strconv.FormatFloat(n, 'e', -1, bitSize)
	mantissa, power, _ := strings.Cut(said, "e")
	return mantissa + "e" + power[:1] + strings.TrimLeft(power[1:], "0")
}

var decimalAt = regexp.MustCompile(`^[+-]?(?:\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)$`)

// The bases a JavaScript number text names by its prefix. [[spec/tickets/config-verbs-port-to-go]]
var prefixes = map[string]int{"0x": hexBase, "0X": hexBase, "0o": octalBase, "0O": octalBase, "0b": 2, "0B": 2}

// A value as Number converts it. [[spec/tickets/config-verbs-port-to-go]]
func jsNumber(said any) float64 {
	switch one := said.(type) {
	case nil:
		return math.NaN()
	case Null:
		return 0
	case bool:
		if one {
			return 1
		}
		return 0
	case float64:
		return one
	case string:
		return numberOfText(one)
	case []any:
		return numberOfText(jsString(one))
	}
	return math.NaN()
}

// A text as Number converts it. [[spec/tickets/config-verbs-port-to-go]]
func numberOfText(said string) float64 {
	text := jsTrim(said)
	switch text {
	case "":
		return 0
	case "Infinity", "+Infinity":
		return math.Inf(1)
	case "-Infinity":
		return math.Inf(-1)
	}
	if decimalAt.MatchString(text) {
		n, _ := strconv.ParseFloat(text, bitSize)
		return n
	}
	if len(text) > prefixLength {
		if base, held := prefixes[text[:prefixLength]]; held {
			if n, err := strconv.ParseUint(text[prefixLength:], base, bitSize); err == nil {
				return float64(n)
			}
		}
	}
	return math.NaN()
}

// A number a value names, printed: the `${Number(x)}` a rule writes. [[spec/tickets/config-verbs-port-to-go]]
func numberOf(said any) string { return numberString(jsNumber(said)) }

// Whether a rune is whitespace, as trim and the `\s` class read it. [[spec/tickets/config-verbs-port-to-go]]
func jsSpace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', ' ', 0xA0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF:
		return true
	}
	return r >= 0x2000 && r <= 0x200A
}

// A text with the whitespace at both ends cut, as trim cuts it. [[spec/tickets/config-verbs-port-to-go]]
func jsTrim(said string) string { return strings.TrimFunc(said, jsSpace) }

// A text with the whitespace at its end cut, as trimEnd cuts it. [[spec/tickets/config-verbs-port-to-go]]
func jsTrimEnd(said string) string { return strings.TrimRightFunc(said, jsSpace) }

// The words of a text, as `split(/\s+/).filter(Boolean)` reads them. [[spec/tickets/config-verbs-port-to-go]]
func jsFields(said string) []string { return strings.FieldsFunc(said, jsSpace) }

// The length of a text in UTF-16 units, as a JavaScript length counts it. [[spec/tickets/config-verbs-port-to-go]]
func jsLength(said string) int {
	n := 0
	for _, r := range said {
		n++
		if r > lastSingleUnit {
			n++
		}
	}
	return n
}

// A text as JSON.stringify quotes it. [[spec/tickets/config-verbs-port-to-go]]
func quoted(said string) string {
	var out strings.Builder
	out.WriteByte('"')
	for len(said) > 0 {
		r, size := utf8.DecodeRuneInString(said)
		said = said[size:]
		switch r {
		case '"':
			out.WriteString(`\"`)
		case '\\':
			out.WriteString(`\\`)
		case '\b':
			out.WriteString(`\b`)
		case '\f':
			out.WriteString(`\f`)
		case '\n':
			out.WriteString(`\n`)
		case '\r':
			out.WriteString(`\r`)
		case '\t':
			out.WriteString(`\t`)
		default:
			if r < ' ' {
				out.WriteString(`\u00`)
				out.WriteString(strconv.FormatInt(int64(r)>>nibble, hexBase))
				out.WriteString(strconv.FormatInt(int64(r)&nibbleMask, hexBase))
				continue
			}
			out.WriteRune(r)
		}
	}
	out.WriteByte('"')
	return out.String()
}

// Texts in JavaScript's default sort order, which a UTF-8 byte order matches below the surrogates. [[spec/tickets/config-verbs-port-to-go]]
func sorted(said []string) []string {
	out := append([]string(nil), said...)
	sort.Strings(out)
	return out
}
