// JSON as JavaScript reads and writes it: an object keeps its key order, an
// index key stands first, and a write is JSON.stringify(value, null, 2), so a
// file the Go verbs write matches the one the JavaScript verbs wrote byte for byte.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]
package vehicle

import (
	"encoding/json"
	"errors"
	"io"
	"math"
	"slices"
	"strconv"
	"strings"
	"unicode/utf8"
)

// The base and bit size a number text parses in, the shift to a byte's high hex digit, and the bounds JavaScript prints a number inside without an exponent. [[spec/design_output/vehicle#what-a-vehicle-needs]]
const (
	decimalBase   = 10
	bitSize       = 64
	nibble        = 4
	exponentAbove = 1e21
	exponentBelow = 1e-6
)

// Object is a JSON object holding its keys in the order they came. [[spec/design_output/vehicle#what-a-vehicle-needs]]
type Object struct {
	keys []string
	vals map[string]any
}

// NewObject answers an empty object. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func NewObject() *Object { return &Object{vals: map[string]any{}} }

// Set writes a key, in its place where it stands and last where it is new, as a JavaScript assignment does. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func (o *Object) Set(key string, value any) {
	if _, held := o.vals[key]; !held {
		o.keys = append(o.keys, key)
	}
	o.vals[key] = value
}

// Keys answers the keys in the order JavaScript walks them: the index keys ascending, then the rest as they came. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func (o *Object) Keys() []string {
	indexes, rest := []string{}, []string{}
	for _, key := range o.keys {
		if isIndex(key) {
			indexes = append(indexes, key)
		} else {
			rest = append(rest, key)
		}
	}
	slices.SortFunc(indexes, func(a, b string) int {
		x, _ := strconv.ParseUint(a, decimalBase, bitSize)
		y, _ := strconv.ParseUint(b, decimalBase, bitSize)
		return int(int64(x) - int64(y))
	})
	return append(indexes, rest...)
}

// Whether a key reads as an array index, which a JavaScript object orders first. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func isIndex(key string) bool {
	if key == "" || (len(key) > 1 && key[0] == '0') {
		return false
	}
	said, err := strconv.ParseUint(key, decimalBase, bitSize)
	return err == nil && said < math.MaxUint32
}

// Clone answers a shallow copy, as a spread writes it. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func (o *Object) Clone() *Object {
	out := NewObject()
	for _, key := range o.Keys() {
		out.Set(key, o.vals[key])
	}
	return out
}

// Get reads a key off a value, and answers false where the value is no object or holds no such key, as undefined. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Get(value any, key string) (any, bool) {
	object, ok := value.(*Object)
	if !ok || object == nil {
		return nil, false
	}
	said, held := object.vals[key]
	return said, held
}

// Parse reads a text as JSON.parse does, and answers false where it throws. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Parse(text string) (any, bool) {
	reads := json.NewDecoder(strings.NewReader(text))
	reads.UseNumber()
	said, err := valueOf(reads)
	if err != nil {
		return nil, false
	}
	if _, err := reads.Token(); !errors.Is(err, io.EOF) {
		return nil, false
	}
	return said, true
}

func valueOf(reads *json.Decoder) (any, error) {
	token, err := reads.Token()
	if err != nil {
		return nil, err
	}
	switch said := token.(type) {
	case json.Delim:
		if said == '[' {
			out := []any{}
			for reads.More() {
				one, err := valueOf(reads)
				if err != nil {
					return nil, err
				}
				out = append(out, one)
			}
			_, err := reads.Token()
			return out, err
		}
		out := NewObject()
		for reads.More() {
			key, err := reads.Token()
			if err != nil {
				return nil, err
			}
			one, err := valueOf(reads)
			if err != nil {
				return nil, err
			}
			out.Set(key.(string), one)
		}
		_, err := reads.Token()
		return out, err
	case json.Number:
		number, err := strconv.ParseFloat(string(said), bitSize)
		if err != nil && !errors.Is(err, strconv.ErrRange) {
			return nil, err
		}
		return number, nil
	default:
		return said, nil
	}
}

// Stringify writes a value as JSON.stringify(value, null, 2) does. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Stringify(value any) string {
	var out strings.Builder
	write(&out, value, "")
	return out.String()
}

// Doc writes a value as a file the JavaScript writes it: the text and a newline. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Doc(value any) string { return Stringify(value) + "\n" }

func write(out *strings.Builder, value any, indent string) {
	inner := indent + "  "
	switch said := value.(type) {
	case nil:
		out.WriteString("null")
	case bool:
		out.WriteString(strconv.FormatBool(said))
	case float64:
		if math.IsNaN(said) || math.IsInf(said, 0) {
			out.WriteString("null")
		} else {
			out.WriteString(Number(said))
		}
	case int:
		out.WriteString(strconv.Itoa(said))
	case string:
		quote(out, said)
	case []string:
		list := make([]any, len(said))
		for at, one := range said {
			list[at] = one
		}
		write(out, list, indent)
	case []*Object:
		list := make([]any, len(said))
		for at, one := range said {
			list[at] = one
		}
		write(out, list, indent)
	case []any:
		if len(said) == 0 {
			out.WriteString("[]")
			return
		}
		out.WriteString("[\n")
		for at, one := range said {
			out.WriteString(inner)
			write(out, one, inner)
			if at < len(said)-1 {
				out.WriteString(",")
			}
			out.WriteString("\n")
		}
		out.WriteString(indent + "]")
	case *Object:
		keys := said.Keys()
		if len(keys) == 0 {
			out.WriteString("{}")
			return
		}
		out.WriteString("{\n")
		for at, key := range keys {
			out.WriteString(inner)
			quote(out, key)
			out.WriteString(": ")
			write(out, said.vals[key], inner)
			if at < len(keys)-1 {
				out.WriteString(",")
			}
			out.WriteString("\n")
		}
		out.WriteString(indent + "}")
	default:
		out.WriteString("null")
	}
}

// Writes a string as JSON.stringify quotes it: no HTML escape, and a control character as its short escape or \u00xx. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func quote(out *strings.Builder, said string) {
	const hex = "0123456789abcdef"
	out.WriteByte('"')
	for at := 0; at < len(said); {
		one, size := utf8.DecodeRuneInString(said[at:])
		switch {
		case one == '"':
			out.WriteString(`\"`)
		case one == '\\':
			out.WriteString(`\\`)
		case one == '\b':
			out.WriteString(`\b`)
		case one == '\f':
			out.WriteString(`\f`)
		case one == '\n':
			out.WriteString(`\n`)
		case one == '\r':
			out.WriteString(`\r`)
		case one == '\t':
			out.WriteString(`\t`)
		case one < 0x20:
			out.WriteString(`\u00`)
			out.WriteByte(hex[one>>nibble])
			out.WriteByte(hex[one&0xf])
		default:
			out.WriteString(said[at : at+size])
		}
		at += size
	}
	out.WriteByte('"')
}

// Number writes a number as JavaScript's String does: fixed between 1e-6 and 1e21, an exponent outside. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Number(said float64) string {
	if said == 0 {
		return "0"
	}
	if size := math.Abs(said); size >= exponentAbove || size < exponentBelow {
		text := strconv.FormatFloat(said, 'e', -1, bitSize)
		mantissa, exponent, _ := strings.Cut(text, "e")
		sign, digits := exponent[:1], strings.TrimLeft(exponent[1:], "0")
		return mantissa + "e" + sign + digits
	}
	return strconv.FormatFloat(said, 'f', -1, bitSize)
}

// JSString writes a value as JavaScript's String does. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func JSString(value any) string {
	switch said := value.(type) {
	case nil:
		return "null"
	case string:
		return said
	case bool:
		return strconv.FormatBool(said)
	case float64:
		if math.IsNaN(said) {
			return "NaN"
		}
		if math.IsInf(said, 1) {
			return "Infinity"
		}
		if math.IsInf(said, -1) {
			return "-Infinity"
		}
		return Number(said)
	case []any:
		parts := make([]string, len(said))
		for at, one := range said {
			if one != nil {
				parts[at] = JSString(one)
			}
		}
		return strings.Join(parts, ",")
	default:
		return "[object Object]"
	}
}

// Shown writes a value a template string holds, where a missing one reads undefined. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func Shown(value any, held bool) string {
	if !held {
		return "undefined"
	}
	return JSString(value)
}

// ToNumber reads a value as JavaScript's Number does. [[spec/design_output/vehicle#the-register-holds-the-port]]
func ToNumber(value any) float64 {
	switch said := value.(type) {
	case nil:
		return 0
	case bool:
		if said {
			return 1
		}
		return 0
	case float64:
		return said
	case string:
		text := strings.TrimSpace(said)
		if text == "" {
			return 0
		}
		if number, err := strconv.ParseFloat(text, bitSize); err == nil && !strings.ContainsAny(text, "_xXpPnN") {
			return number
		}
		if text == "Infinity" || text == "+Infinity" {
			return math.Inf(1)
		}
		if text == "-Infinity" {
			return math.Inf(-1)
		}
		if number, err := strconv.ParseInt(text, 0, bitSize); err == nil && len(text) > 2 && text[0] == '0' && strings.ContainsAny(text[1:2], "xXoObB") {
			return float64(number)
		}
		return math.NaN()
	case []any:
		return ToNumber(JSString(said))
	}
	return math.NaN()
}

// Whether two values stand strictly equal, as === reads a primitive. [[spec/design_output/vehicle#the-register-places-an-identity]]
func strictEqual(one, other any) bool {
	switch said := one.(type) {
	case nil, bool, string:
		return one == other
	case float64:
		that, ok := other.(float64)
		return ok && said == that
	case *Object:
		that, ok := other.(*Object)
		return ok && said == that
	}
	return false
}
