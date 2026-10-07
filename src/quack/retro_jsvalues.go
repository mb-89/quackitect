// The values every reading verb reads and writes, as JSON.parse,
// JSON.stringify, String, Number and Date.parse take them.
// [[spec/tickets/retro-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"math/big"
	"os"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"

	"quackitect/src/pull"
	"quackitect/src/yaml"
)

// The bits an array index takes, the base a hex text reads in, and the precision and the tie toFixed rounds at. [[spec/tickets/retro-verbs-port-to-go]]
const (
	retroJSIndexBits = 32
	retroJSHexBase   = 16
	retroJSFixedPrec = 2048
	retroJSHalf      = 0.5
)

// The magnitudes String writes with no exponent, from the smallest up to the largest. [[spec/tickets/retro-verbs-port-to-go]]
const (
	retroJSSmallest = 1e-6
	retroJSLargest  = 1e21
)

// The bounds Date.parse holds an ISO text to: the digits of a fraction, the months, the days, the hours, the last hour and minute, the ends of an offset's hours and of the offset, and the last four-digit year. [[spec/guidance/retro/chapter]]
const (
	retroJSMilliDigits = 3
	retroJSMonths      = 12
	retroJSDays        = 31
	retroJSHours       = 24
	retroJSLastHour    = 23
	retroJSLastMinute  = 59
	retroJSOffsetHours = 3
	retroJSOffsetEnd   = 6
	retroJSYearMost    = 9999
)

// An object as JSON.parse reads one: its keys as set, and their values. [[spec/tickets/retro-verbs-port-to-go]]
type retroJSDict struct {
	keys   []string
	values map[string]any
}

// JavaScript's undefined: what a missing key reads as. [[spec/tickets/retro-verbs-port-to-go]]
type retroJSNone struct{}

// An object holding the keys and values given in pairs. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSObject(pairs ...any) *retroJSDict {
	out := &retroJSDict{values: map[string]any{}}
	for at := 0; at+1 < len(pairs); at += 2 {
		out.set(pairs[at].(string), pairs[at+1])
	}
	return out
}

// Sets a key, keeping its place where it stands already. [[spec/tickets/retro-verbs-port-to-go]]
func (o *retroJSDict) set(key string, value any) {
	if o.values == nil {
		o.values = map[string]any{}
	}
	if _, ok := o.values[key]; !ok {
		o.keys = append(o.keys, key)
	}
	o.values[key] = value
}

// A key's value, or undefined. [[spec/tickets/retro-verbs-port-to-go]]
func (o *retroJSDict) get(key string) any {
	if o == nil {
		return retroJSNone{}
	}
	if value, ok := o.values[key]; ok {
		return value
	}
	return retroJSNone{}
}

// Whether the object holds a key. [[spec/tickets/retro-verbs-port-to-go]]
func (o *retroJSDict) has(key string) bool {
	if o == nil {
		return false
	}
	_, ok := o.values[key]
	return ok
}

// The keys in the order JavaScript walks them: the index keys rising, then the rest as set. [[spec/tickets/retro-verbs-port-to-go]]
func (o *retroJSDict) order() []string {
	if o == nil {
		return nil
	}
	index, rest := []string{}, []string{}
	for _, key := range o.keys {
		if n, err := strconv.ParseUint(key, decimal, retroJSIndexBits); err == nil && n < 1<<retroJSIndexBits-1 && strconv.FormatUint(n, decimal) == key {
			index = append(index, key)
		} else {
			rest = append(rest, key)
		}
	}
	sort.SliceStable(index, func(i, j int) bool {
		a, _ := strconv.ParseUint(index[i], decimal, retroJSIndexBits)
		b, _ := strconv.ParseUint(index[j], decimal, retroJSIndexBits)
		return a < b
	})
	return append(index, rest...)
}

// A text read as JSON.parse reads it, and false where it reads as no JSON. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSParse(text string) (any, bool) {
	decoder := json.NewDecoder(strings.NewReader(text))
	decoder.UseNumber()
	value, err := retroJSValue(decoder)
	if err != nil {
		return nil, false
	}
	if _, err := decoder.Token(); err != io.EOF {
		return nil, false
	}
	return value, true
}

// The next value off the decoder, its objects keeping their order. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSValue(decoder *json.Decoder) (any, error) {
	token, err := decoder.Token()
	if err != nil {
		return nil, err
	}
	switch one := token.(type) {
	case json.Delim:
		if one == '{' {
			out := &retroJSDict{values: map[string]any{}}
			for decoder.More() {
				key, err := decoder.Token()
				if err != nil {
					return nil, err
				}
				value, err := retroJSValue(decoder)
				if err != nil {
					return nil, err
				}
				out.set(fmt.Sprint(key), value)
			}
			_, err := decoder.Token()
			return out, err
		}
		if one == '[' {
			out := []any{}
			for decoder.More() {
				value, err := retroJSValue(decoder)
				if err != nil {
					return nil, err
				}
				out = append(out, value)
			}
			_, err := decoder.Token()
			return out, err
		}
		return nil, fmt.Errorf("retro: a stray %v", one)
	case json.Number:
		value, err := strconv.ParseFloat(string(one), numberBits)
		if err != nil && !math.IsInf(value, 0) {
			return nil, err
		}
		return value, nil
	}
	return token, nil
}

// A value written as JSON.stringify writes it with an indent of two. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSStringify(value any) string {
	return retroJSIndent(value, "")
}

// A value written as JSON at an indent. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSIndent(value any, indent string) string {
	inner := indent + "  "
	switch one := value.(type) {
	case bool:
		return strconv.FormatBool(one)
	case int:
		return strconv.Itoa(one)
	case float64:
		if math.IsNaN(one) || math.IsInf(one, 0) {
			return "null"
		}
		return retroJSNumber(one)
	case string:
		return pull.JSQuote(one)
	case []string:
		list := []any{}
		for _, item := range one {
			list = append(list, item)
		}
		return retroJSIndent(list, indent)
	case []any:
		if len(one) == 0 {
			return "[]"
		}
		items := []string{}
		for _, item := range one {
			if _, none := item.(retroJSNone); none {
				item = nil
			}
			items = append(items, retroJSIndent(item, inner))
		}
		return "[\n" + inner + strings.Join(items, ",\n"+inner) + "\n" + indent + "]"
	case *retroJSDict:
		if one == nil {
			return "null"
		}
		items := []string{}
		for _, key := range one.order() {
			if _, none := one.values[key].(retroJSNone); none {
				continue
			}
			items = append(items, pull.JSQuote(key)+": "+retroJSIndent(one.values[key], inner))
		}
		if len(items) == 0 {
			return "{}"
		}
		return "{\n" + inner + strings.Join(items, ",\n"+inner) + "\n" + indent + "}"
	}
	return "null"
}

// A value written to its file as JSON, two spaces deep, and a newline after. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSWrite(path string, value any) error {
	return os.WriteFile(path, []byte(retroJSStringify(value)+"\n"), 0o666)
}

// A number as JavaScript's String writes it. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSNumber(f float64) string {
	switch {
	case math.IsNaN(f):
		return "NaN"
	case math.IsInf(f, 1):
		return "Infinity"
	case math.IsInf(f, -1):
		return "-Infinity"
	case f == 0:
		return "0"
	}
	if abs := math.Abs(f); abs >= retroJSSmallest && abs < retroJSLargest {
		return strconv.FormatFloat(f, 'f', -1, numberBits)
	}
	mantissa, exponent, _ := strings.Cut(strconv.FormatFloat(f, 'e', -1, numberBits), "e")
	return mantissa + "e" + exponent[:1] + strings.TrimLeft(exponent[1:], "0")
}

// A number rounded as toFixed rounds it, a tie going up, and read back. [[spec/guidance/retro/classify]]
func retroJSFixed(x float64, places int) float64 {
	if math.IsNaN(x) || math.IsInf(x, 0) || x < 0 {
		return x
	}
	scaled := new(big.Float).SetPrec(retroJSFixedPrec).SetFloat64(x)
	scaled.Mul(scaled, new(big.Float).SetPrec(retroJSFixedPrec).SetFloat64(math.Pow(decimal, float64(places))))
	whole, _ := scaled.Int(nil)
	rest := new(big.Float).SetPrec(retroJSFixedPrec).Sub(scaled, new(big.Float).SetPrec(retroJSFixedPrec).SetInt(whole))
	if rest.Cmp(big.NewFloat(retroJSHalf)) >= 0 {
		whole.Add(whole, big.NewInt(1))
	}
	digits := whole.String()
	for len(digits) <= places {
		digits = "0" + digits
	}
	value, _ := strconv.ParseFloat(digits[:len(digits)-places]+"."+digits[len(digits)-places:], numberBits)
	return value
}

// A value as JavaScript's String writes it. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSText(value any) string {
	switch one := value.(type) {
	case nil:
		return "null"
	case retroJSNone:
		return "undefined"
	case bool:
		return strconv.FormatBool(one)
	case int:
		return strconv.Itoa(one)
	case float64:
		return retroJSNumber(one)
	case string:
		return one
	case []any:
		return retroJSJoin(one, ",")
	case []string:
		return strings.Join(one, ",")
	}
	return "[object Object]"
}

// A list joined as Array.join joins it, null and undefined as nothing. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSJoin(value any, by string) string {
	list, ok := value.([]any)
	if !ok {
		return retroJSText(value)
	}
	parts := []string{}
	for _, one := range list {
		parts = append(parts, retroJSOr(one))
	}
	return strings.Join(parts, by)
}

// String(value ?? ""): the text of a value, and none for null or undefined. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSOr(value any) string {
	if retroJSNullish(value) {
		return ""
	}
	return retroJSText(value)
}

// Whether a value is null or undefined. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSNullish(value any) bool {
	if value == nil {
		return true
	}
	_, none := value.(retroJSNone)
	return none
}

// Whether JavaScript reads a value as true. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSTruthy(value any) bool {
	if dict, held := value.(*retroJSDict); held {
		return dict != nil
	}
	return !retroJSNullish(value) && yaml.Truthy(value)
}

// Whether two plain values are strictly equal, as === reads them. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSSame(a, b any) bool {
	switch one := a.(type) {
	case nil:
		return b == nil
	case retroJSNone:
		_, none := b.(retroJSNone)
		return none
	case string:
		other, ok := b.(string)
		return ok && one == other
	case bool:
		other, ok := b.(bool)
		return ok && one == other
	case float64:
		other, ok := b.(float64)
		return ok && one == other
	case *retroJSDict:
		other, ok := b.(*retroJSDict)
		return ok && one == other
	}
	return false
}

// Whether a value is a string the list holds. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSIn(list []string, value any) bool {
	text, ok := value.(string)
	return ok && slices.Contains(list, text)
}

// A key of an object, or undefined where the value is no object. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSField(value any, key string) any {
	if dict, ok := value.(*retroJSDict); ok {
		return dict.get(key)
	}
	return retroJSNone{}
}

// The items of a list, or none where the value is no list. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSList(value any) []any {
	list, _ := value.([]any)
	return list
}

// A value as JavaScript's Number reads it. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSToNumber(value any) float64 {
	switch one := value.(type) {
	case nil:
		return 0
	case bool:
		if one {
			return 1
		}
		return 0
	case int:
		return float64(one)
	case float64:
		return one
	case string:
		text := retroJSTrim(one)
		switch strings.TrimPrefix(strings.TrimPrefix(text, "+"), "-") {
		case "":
			if text == "" {
				return 0
			}
			return math.NaN()
		case "Infinity":
			if strings.HasPrefix(text, "-") {
				return math.Inf(-1)
			}
			return math.Inf(1)
		}
		if strings.ContainsAny(strings.ToLower(text), "abcdfghijklmnopqrstuvwxyz_") {
			if n, err := strconv.ParseUint(strings.ToLower(text)[2:], retroJSHexBase, numberBits); strings.HasPrefix(strings.ToLower(text), "0x") && err == nil {
				return float64(n)
			}
			return math.NaN()
		}
		n, err := strconv.ParseFloat(text, numberBits)
		if err != nil && !math.IsInf(n, 0) {
			return math.NaN()
		}
		return n
	}
	return math.NaN()
}

// A text with JavaScript's white space trimmed off both ends. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSTrim(text string) string {
	return strings.TrimFunc(text, func(r rune) bool {
		switch r {
		case '\t', '\n', '\v', '\f', '\r', ' ', '\u00a0', '\u1680', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff':
			return true
		}
		return r >= '\u2000' && r <= '\u200a'
	})
}

// A text cut to a count of UTF-16 units, as slice cuts it. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSSlice(text string, most int) string {
	units := utf16.Encode([]rune(text))
	if len(units) <= most {
		return text
	}
	return string(utf16.Decode(units[:most]))
}

// Whether a text sorts before another, as sort compares UTF-16 units. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSLess(a, b string) bool {
	return slices.Compare(utf16.Encode([]rune(a)), utf16.Encode([]rune(b))) < 0
}

// The ISO forms Date.parse reads: a date, a time, its fraction and its offset. [[spec/guidance/retro/chapter]]
var retroJSDate = regexp.MustCompile(`^([+-]\d{6}|\d{4})(?:-(\d\d)(?:-(\d\d))?)?(?:T(\d\d):(\d\d)(?::(\d\d)(?:\.(\d+))?)?(Z|[+-]\d\d:\d\d)?)?$`)

// A time as Date.parse reads an ISO text, in milliseconds, and NaN where it reads none. [[spec/guidance/retro/chapter]]
func retroJSMillis(text string) float64 {
	m := retroJSDate.FindStringSubmatch(text)
	if m == nil {
		return math.NaN()
	}
	number := func(said string, none int) int {
		if said == "" {
			return none
		}
		n, _ := strconv.Atoi(said)
		return n
	}
	year, month, day := number(m[1], 0), number(m[2], 1), number(m[3], 1)
	hour, minute, second := number(m[4], 0), number(m[5], 0), number(m[6], 0)
	milli := 0
	if m[7] != "" {
		milli = number((m[7] + "00")[:retroJSMilliDigits], 0)
	}
	if m[1] == "-000000" || month < 1 || month > retroJSMonths || day < 1 || day > retroJSDays || hour > retroJSHours || minute > retroJSLastMinute || second > retroJSLastMinute {
		return math.NaN()
	}
	if hour == retroJSHours && minute+second+milli != 0 {
		return math.NaN()
	}
	place := time.UTC
	if m[4] != "" && m[8] == "" {
		place = time.Local
	}
	at := time.Date(year, time.Month(month), day, hour, minute, second, milli*int(time.Millisecond), place)
	if m[8] != "" && m[8] != "Z" {
		hours, minutes := number(m[8][1:retroJSOffsetHours], 0), number(m[8][4:retroJSOffsetEnd], 0)
		if hours > retroJSLastHour || minutes > retroJSLastMinute {
			return math.NaN()
		}
		shift := time.Duration(hours)*time.Hour + time.Duration(minutes)*time.Minute
		if m[8][0] == '-' {
			shift = -shift
		}
		at = at.Add(-shift)
	}
	return float64(at.UnixMilli())
}

// A time in milliseconds as toISOString writes it. [[spec/guidance/retro/chapter]]
func retroJSISO(ms float64) string {
	at := time.UnixMilli(int64(ms)).UTC()
	text := at.Format("-01-02T15:04:05.000Z")
	if year := at.Year(); year < 0 || year > retroJSYearMost {
		sign := "+"
		if year < 0 {
			sign, year = "-", -year
		}
		return fmt.Sprintf("%s%06d%s", sign, year, text)
	}
	return fmt.Sprintf("%04d%s", at.Year(), text)
}
