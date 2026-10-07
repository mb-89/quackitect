// quack tui: the log rows the plain road prints, each one as asRow in
// .claude/skills/level0/lib/log.js prints it, the JSON values read in the
// order JavaScript enumerates them.
// [[spec/design_output/log#what-one-line-looks-like]]
package main

import (
	"bytes"
	"cmp"
	"encoding/json"
	"fmt"
	"math"
	"slices"
	"strconv"
	"strings"
	"unicode/utf16"
)

// The fields asRow in .claude/skills/level0/lib/log.js prints first, its column widths, and the indent of the rest. [[spec/design_output/log#what-one-line-looks-like]]
const (
	tuiStampFrom  = 11
	tuiStampTo    = 23
	tuiLevelWidth = 5
	tuiKindWidth  = 6
	tuiIndent     = tuiStampTo - tuiStampFrom + 1
)

// The bounds a number prints plain between, as String in JavaScript reads them. [[spec/design_output/log#what-one-line-looks-like]]
const (
	tuiPlainLeast = 1e-6
	tuiPlainMost  = 1e21
)

var tuiOwnFields = []string{"at", "level", "kind", "said"}

// A JSON object with its keys in the order JavaScript enumerates them. [[spec/design_output/log#what-one-line-looks-like]]
type tuiObject struct {
	keys []string
	vals map[string]any
}

// The value a missing field reads as. [[spec/design_output/log#what-one-line-looks-like]]
type tuiUndefined struct{}

// Each row a log text holds, printed as asRow prints it. A torn line drops alone, and the rows around it stand. [[spec/design_output/log#every-writer-appends]]
func tuiRowsIn(text string) []string {
	var out []string
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" || !json.Valid([]byte(line)) {
			continue
		}
		dec := json.NewDecoder(bytes.NewReader([]byte(line)))
		dec.UseNumber()
		row, err := tuiParse(dec)
		if err != nil || row == nil {
			continue
		}
		out = append(out, tuiAsRow(row))
	}
	return out
}

// One JSON value, an object keeping its key order. [[spec/design_output/log#what-one-line-looks-like]]
func tuiParse(dec *json.Decoder) (any, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch tok {
	case json.Delim('{'):
		obj := &tuiObject{vals: map[string]any{}}
		for dec.More() {
			key, err := dec.Token()
			if err != nil {
				return nil, err
			}
			value, err := tuiParse(dec)
			if err != nil {
				return nil, err
			}
			name := key.(string)
			if _, held := obj.vals[name]; !held {
				obj.keys = append(obj.keys, name)
			}
			obj.vals[name] = value
		}
		_, err := dec.Token()
		return obj, err
	case json.Delim('['):
		list := []any{}
		for dec.More() {
			value, err := tuiParse(dec)
			if err != nil {
				return nil, err
			}
			list = append(list, value)
		}
		_, err := dec.Token()
		return list, err
	}
	return tok, nil
}

// One row as asRow prints it: the time, the level, the kind and the line, and every other field below. [[spec/design_output/log#what-one-line-looks-like]]
func tuiAsRow(row any) string {
	keys, field := tuiEntries(row)
	said := fmt.Sprintf("%s %s %s %s",
		tuiSlice(tuiString(field("at")), tuiStampFrom, tuiStampTo),
		tuiPad(tuiString(field("level")), tuiLevelWidth),
		tuiPad(tuiString(field("kind")), tuiKindWidth),
		tuiString(field("said")))
	var rest []string
	for _, key := range keys {
		if !slices.Contains(tuiOwnFields, key) {
			rest = append(rest, key+"="+tuiString(field(key)))
		}
	}
	if len(rest) == 0 {
		return said
	}
	return said + "\n" + strings.Repeat(" ", tuiIndent) + strings.Join(rest, " ")
}

// The keys Object.entries walks, integer keys first, and a field's value, undefined where none stands. [[spec/design_output/log#what-one-line-looks-like]]
func tuiEntries(row any) ([]string, func(string) any) {
	switch one := row.(type) {
	case *tuiObject:
		var numbered, named []string
		for _, key := range one.keys {
			if tuiIndexKey(key) {
				numbered = append(numbered, key)
			} else {
				named = append(named, key)
			}
		}
		slices.SortFunc(numbered, func(a, b string) int {
			left, _ := strconv.ParseUint(a, decimal, numberBits)
			right, _ := strconv.ParseUint(b, decimal, numberBits)
			return cmp.Compare(left, right)
		})
		return append(numbered, named...), func(key string) any {
			if value, held := one.vals[key]; held {
				return value
			}
			return tuiUndefined{}
		}
	case []any:
		keys := make([]string, len(one))
		for at := range one {
			keys[at] = strconv.Itoa(at)
		}
		return keys, func(key string) any {
			if at, err := strconv.Atoi(key); err == nil && at >= 0 && at < len(one) && tuiIndexKey(key) {
				return one[at]
			}
			return tuiUndefined{}
		}
	}
	return nil, func(string) any { return tuiUndefined{} }
}

// Whether a key is an array index, which JavaScript enumerates first and in number order. [[spec/design_output/log#what-one-line-looks-like]]
func tuiIndexKey(key string) bool {
	at, err := strconv.ParseUint(key, decimal, numberBits)
	return err == nil && at < math.MaxUint32 && strconv.FormatUint(at, decimal) == key
}

// A value as String in JavaScript prints it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiString(value any) string {
	switch one := value.(type) {
	case tuiUndefined:
		return "undefined"
	case nil:
		return "null"
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case json.Number:
		number, _ := strconv.ParseFloat(one.String(), numberBits)
		return tuiJSNumber(number)
	case []any:
		parts := make([]string, len(one))
		for at, item := range one {
			if item != nil {
				parts[at] = tuiString(item)
			}
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// A number as JavaScript prints it: plain between a millionth and 1e21, and in exponent form past them. [[spec/design_output/log#what-one-line-looks-like]]
func tuiJSNumber(number float64) string {
	switch {
	case math.IsNaN(number):
		return "NaN"
	case math.IsInf(number, 1):
		return "Infinity"
	case math.IsInf(number, -1):
		return "-Infinity"
	case number == 0:
		return "0"
	}
	if size := math.Abs(number); size >= tuiPlainLeast && size < tuiPlainMost {
		return strconv.FormatFloat(number, 'f', -1, numberBits)
	}
	mantissa, power, _ := strings.Cut(strconv.FormatFloat(number, 'e', -1, numberBits), "e")
	sign, digits := power[:1], strings.TrimLeft(power[1:], "0")
	return mantissa + "e" + sign + digits
}

// A text's UTF-16 units from one place to another, as slice in JavaScript cuts it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiSlice(text string, from, to int) string {
	units := utf16.Encode([]rune(text))
	from, to = min(from, len(units)), min(to, len(units))
	return string(utf16.Decode(units[from:to]))
}

// A text padded with spaces to a width counted in UTF-16 units, as padEnd pads it. [[spec/design_output/log#what-one-line-looks-like]]
func tuiPad(text string, width int) string {
	if short := width - len(utf16.Encode([]rune(text))); short > 0 {
		return text + strings.Repeat(" ", short)
	}
	return text
}
