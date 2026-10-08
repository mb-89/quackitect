// The hash a process carries onto a ticket: hashText over the canonical JSON
// of its ask and its steps, keys sorted and every scalar a string.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package pull

import (
	"fmt"
	"math/bits"
	"sort"
	"strings"
	"unicode/utf16"

	"quackitect/src/yaml"
)

// The constants of HashText, which src/index/files.go spells again. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const (
	fnvOffset = 0x811c9dc5
	fnvPrime  = 0x01000193
	mixSeed   = 0x9e3779b9
	mixPrime  = 0x85ebca6b
	mixRotate = 13
)

// The hash hashText answers, over the UTF-16 units JavaScript reads. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func HashText(text string) string {
	low, high := uint32(fnvOffset), uint32(mixSeed)
	for _, code := range utf16.Encode([]rune(text)) {
		low = (low ^ uint32(code)) * fnvPrime
		high = (high + uint32(code) + 1) * mixPrime
		high = bits.RotateLeft32(high, mixRotate)
	}
	return fmt.Sprintf("%08x%08x", low, high)
}

// The hash of a value read off YAML, over its canonical JSON. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func HashOf(value any) string {
	var said strings.Builder
	canonical(&said, value)
	return HashText(said.String())
}

// The hash of a process: its ask and its steps, each a list where it holds none. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ProcessHash(held *yaml.Doc) string {
	one := yaml.New()
	one.Set("ask", orList(held.Get("ask")))
	one.Set("steps", orList(held.Get("steps")))
	return HashOf(one)
}

func orList(said any) any {
	if said == nil {
		return []any{}
	}
	return said
}

// JSON.stringify over canonicalOf: a mapping's keys sorted, a list kept, and every scalar its string. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func canonical(out *strings.Builder, value any) {
	switch one := value.(type) {
	case []any:
		out.WriteByte('[')
		for at, each := range one {
			if at > 0 {
				out.WriteByte(',')
			}
			canonical(out, each)
		}
		out.WriteByte(']')
	case *yaml.Doc:
		keys := append([]string(nil), one.Keys()...)
		sort.Strings(keys)
		out.WriteByte('{')
		for at, key := range keys {
			if at > 0 {
				out.WriteByte(',')
			}
			out.WriteString(jsQuote(key))
			out.WriteByte(':')
			canonical(out, one.Get(key))
		}
		out.WriteByte('}')
	default:
		out.WriteString(jsQuote(yaml.AsString(value)))
	}
}

// A string as JSON.stringify quotes it: the quote, the backslash and the control characters escaped, and nothing else. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func jsQuote(said string) string {
	var out strings.Builder
	out.WriteByte('"')
	for _, r := range said {
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
			if r < 0x20 {
				fmt.Fprintf(&out, `\u%04x`, r)
			} else {
				out.WriteRune(r)
			}
		}
	}
	out.WriteByte('"')
	return out.String()
}

func sortStrings(said []string) { sort.Strings(said) }

// The canonical JSON of a value, which a script sets beside canonicalOf. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func Canonical(value any) string {
	var said strings.Builder
	canonical(&said, value)
	return said.String()
}
