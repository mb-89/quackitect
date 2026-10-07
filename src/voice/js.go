// What the voice verbs read as JavaScript reads it: truthiness, String, trim,
// UTF-16 lengths and the root order of localeCompare.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"slices"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf16"
)

// A JSON value as String writes it, a missing one as nothing. [[spec/design_output/projection#the-second-target]]
func jsString(v any) string {
	switch one := v.(type) {
	case nil:
		return ""
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case float64:
		return numberText(one)
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			parts = append(parts, jsString(each))
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// Whether a rune is whitespace to String.prototype.trim. [[spec/design_output/projection#the-second-target]]
func jsSpace(r rune) bool {
	return r != '\u0085' && (unicode.IsSpace(r) || r == 0xFEFF)
}

// A text trimmed at both ends as trim does. [[spec/design_output/projection#the-second-target]]
func jsTrim(said string) string { return strings.TrimFunc(said, jsSpace) }

// A text's length in UTF-16 units, as length counts it. [[spec/design_output/projection#the-second-target]]
func units(said string) int { return len(utf16.Encode([]rune(said))) }

// Two texts compared by UTF-16 units, as the JavaScript operators and the default sort compare. [[spec/design_output/projection#the-second-target]]
func unitsCompare(a, b string) int {
	return slices.Compare(utf16.Encode([]rune(a)), utf16.Encode([]rune(b)))
}

// The printable ASCII in the CLDR root order localeCompare sorts by, a letter's two cases side by side. [[spec/design_output/projection#the-second-target]]
const rootOrder = "\t\n\v\f\r _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ"

// Each ASCII rune's primary weight in the root order, both cases of a letter sharing one. [[spec/design_output/projection#the-second-target]]
var primary = func() map[rune]int {
	out := map[rune]int{}
	for i, r := range rootOrder {
		out[r] = i
		if unicode.IsUpper(r) {
			out[r] = out[unicode.ToLower(r)]
		}
	}
	return out
}()

// The weights localeCompare reads a text by: the primary weight of each rune, and its case, past the control runes it ignores. A rune past ASCII weighs past every ASCII one, by its lower case. [[spec/design_output/projection#the-second-target]]
func weightsOf(said string) (first, cases []int) {
	for _, r := range said {
		weight, ok := primary[r]
		if !ok {
			if r < 0x80 || unicode.IsControl(r) {
				continue
			}
			weight = len(rootOrder) + int(unicode.ToLower(r))
		}
		first = append(first, weight)
		upper := 0
		if unicode.IsUpper(r) {
			upper = 1
		}
		cases = append(cases, upper)
	}
	return first, cases
}

// Two texts compared as localeCompare does under the root locale: the letters first, the case after, lower before upper. [[spec/design_output/projection#the-second-target]]
func localeCompare(a, b string) int {
	firstA, casesA := weightsOf(a)
	firstB, casesB := weightsOf(b)
	if by := slices.Compare(firstA, firstB); by != 0 {
		return by
	}
	return slices.Compare(casesA, casesB)
}
