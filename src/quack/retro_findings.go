// The retro's findings: the rows every column answers, and the columns the
// readers write, one file a chapter and one for the field feedback; beside them
// the values every reading verb reads and writes, as JSON.parse, JSON.stringify,
// String and Date.parse take them.
// [[spec/guidance/retro/read]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"math/big"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"
)

// The five starfish questions, one row each. [[spec/guidance/retro/read]]
var retroQuestions = []string{"start", "stop", "keep", "more", "less"}

// The improvements, which are also the categories a class fix falls in. [[spec/guidance/retro/classify]]
var retroCategories = []string{"mechanize", "guidance", "process", "code", "tools"}

// The rows of the matrix: the questions, then the improvements. [[spec/guidance/retro/read]]
var retroRows = append(append([]string{}, retroQuestions...), retroCategories...)

// The folder the findings stand in, the field feedback's column, and an auditor's file prefix. [[spec/guidance/retro/audit]]
const (
	retroFindingsFolder = "findings"
	retroFeedback       = "feedback"
	retroAuditPrefix    = "audit-"
)

// The characters JavaScript's \s and trim take as white space. [[spec/guidance/retro/read]]
const retroJSSpaces = `\t\n\v\f\r \x{a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}\x{feff}`

// A section's head, and an item under it. [[spec/guidance/retro/read]]
var (
	retroFindingsHead = regexp.MustCompile(`^##[` + retroJSSpaces + `]+(\w+)`)
	retroFindingsItem = regexp.MustCompile(`^- ([^\n\r\x{2028}\x{2029}]+)$`)
)

// One column of the matrix: a chapter, the field feedback or an auditor, with its findings by row. [[spec/guidance/retro/read]]
type retroColumn struct {
	id       string
	title    string
	findings map[string][]string
}

// One finding, note or memory: its id, and its text. [[spec/guidance/retro/classify]]
type retroItem struct {
	id   string
	text string
}

// One chapter's findings: a section per row, and the items under it in order. A row with no section answers nil. [[spec/guidance/retro/read]]
func retroFindingsOf(text string) map[string][]string {
	out := map[string][]string{}
	for _, row := range retroRows {
		out[row] = nil
	}
	row := ""
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSuffix(line, "\r")
		if head := retroFindingsHead.FindStringSubmatch(line); head != nil {
			row = strings.ToLower(head[1])
			if !slices.Contains(retroRows, row) {
				row = ""
			}
			if row != "" {
				out[row] = []string{}
			}
			continue
		}
		if item := retroFindingsItem.FindStringSubmatch(line); row != "" && item != nil {
			out[row] = append(out[row], retroJSTrim(item[1]))
		}
	}
	return out
}

// A finding's id: its column, its row, and its place in the row, counted from one. [[spec/guidance/retro/read]]
func retroIdOf(column, row string, at int) string {
	return fmt.Sprintf("%s.%s.%d", column, row, at+1)
}

// Every finding of every column, by id. [[spec/guidance/retro/classify]]
func retroItemsOf(columns []retroColumn) []retroItem {
	out := []retroItem{}
	for _, column := range columns {
		for _, row := range retroRows {
			for at, text := range column.findings[row] {
				out = append(out, retroItem{id: retroIdOf(column.id, row, at), text: text})
			}
		}
	}
	return out
}

// The columns a retro's findings fill, and the faults of a column standing incomplete. [[spec/guidance/retro/read]]
func retroColumnsOf(home string) ([]retroColumn, []string) {
	cuts, _ := retroCutsOf(retroFileText(filepath.Join(home, retroCutsFile)))
	wanted := []retroColumn{}
	for _, one := range cuts {
		wanted = append(wanted, retroColumn{id: one.id, title: one.title})
	}
	if retroIsThere(filepath.Join(home, retroFindingsFolder, retroFeedback+".md")) {
		wanted = append(wanted, retroColumn{id: retroFeedback, title: "field feedback"})
	}
	audits := []string{}
	entries, _ := os.ReadDir(filepath.Join(home, retroFindingsFolder))
	for _, one := range entries {
		if strings.HasPrefix(one.Name(), retroAuditPrefix) && strings.HasSuffix(one.Name(), ".md") {
			audits = append(audits, one.Name())
		}
	}
	sort.SliceStable(audits, func(i, j int) bool { return retroJSLess(audits[i], audits[j]) })
	for _, one := range audits {
		id := strings.TrimSuffix(one, ".md")
		wanted = append(wanted, retroColumn{id: id, title: "the checklist, " + id[len(retroAuditPrefix):]})
	}
	faults := []string{}
	columns := []retroColumn{}
	for _, one := range wanted {
		at := filepath.Join(home, retroFindingsFolder, one.id+".md")
		if !retroIsThere(at) {
			faults = append(faults, fmt.Sprintf("%s/%s.md stands nowhere", retroFindingsFolder, one.id))
			columns = append(columns, retroColumn{id: one.id, title: one.title, findings: map[string][]string{}})
			continue
		}
		findings := retroFindingsOf(retroFileText(at))
		for _, row := range retroRows {
			if findings[row] == nil {
				faults = append(faults, fmt.Sprintf("%s/%s.md carries no %s section", retroFindingsFolder, one.id, row))
			}
		}
		columns = append(columns, retroColumn{id: one.id, title: one.title, findings: findings})
	}
	return columns, faults
}

// The word of the verb's line at a place, or none. [[spec/tickets/retro-verbs-port-to-go]]
func retroWordAt(argv []string, at int) string {
	if at < len(argv) {
		return argv[at]
	}
	return ""
}

// Whether a path stands on the disk. [[spec/tickets/retro-verbs-port-to-go]]
func retroIsThere(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// A file's text, or none where it reads as nothing. [[spec/tickets/retro-verbs-port-to-go]]
func retroFileText(path string) string {
	body, _ := os.ReadFile(path)
	return string(body)
}

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
		if n, err := strconv.ParseUint(key, 10, 32); err == nil && n < 1<<32-1 && strconv.FormatUint(n, 10) == key {
			index = append(index, key)
		} else {
			rest = append(rest, key)
		}
	}
	sort.SliceStable(index, func(i, j int) bool {
		a, _ := strconv.ParseUint(index[i], 10, 32)
		b, _ := strconv.ParseUint(index[j], 10, 32)
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
		value, err := strconv.ParseFloat(string(one), 64)
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
		return retroJSQuote(one)
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
			items = append(items, retroJSQuote(key)+": "+retroJSIndent(one.values[key], inner))
		}
		if len(items) == 0 {
			return "{}"
		}
		return "{\n" + inner + strings.Join(items, ",\n"+inner) + "\n" + indent + "}"
	}
	return "null"
}

// A string quoted as JSON.stringify quotes it. [[spec/tickets/retro-verbs-port-to-go]]
func retroJSQuote(text string) string {
	var out strings.Builder
	out.WriteByte('"')
	for _, r := range text {
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
	if abs := math.Abs(f); abs >= 1e-6 && abs < 1e21 {
		return strconv.FormatFloat(f, 'f', -1, 64)
	}
	mantissa, exponent, _ := strings.Cut(strconv.FormatFloat(f, 'e', -1, 64), "e")
	return mantissa + "e" + exponent[:1] + strings.TrimLeft(exponent[1:], "0")
}

// A number rounded as toFixed rounds it, a tie going up, and read back. [[spec/guidance/retro/classify]]
func retroJSFixed(x float64, places int) float64 {
	if math.IsNaN(x) || math.IsInf(x, 0) || x < 0 {
		return x
	}
	scaled := new(big.Float).SetPrec(2048).SetFloat64(x)
	scaled.Mul(scaled, new(big.Float).SetPrec(2048).SetFloat64(math.Pow(10, float64(places))))
	whole, _ := scaled.Int(nil)
	rest := new(big.Float).SetPrec(2048).Sub(scaled, new(big.Float).SetPrec(2048).SetInt(whole))
	if rest.Cmp(big.NewFloat(0.5)) >= 0 {
		whole.Add(whole, big.NewInt(1))
	}
	digits := whole.String()
	for len(digits) <= places {
		digits = "0" + digits
	}
	value, _ := strconv.ParseFloat(digits[:len(digits)-places]+"."+digits[len(digits)-places:], 64)
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
	switch one := value.(type) {
	case nil, retroJSNone:
		return false
	case bool:
		return one
	case int:
		return one != 0
	case float64:
		return one != 0 && !math.IsNaN(one)
	case string:
		return one != ""
	case *retroJSDict:
		return one != nil
	}
	return true
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
			if n, err := strconv.ParseUint(strings.ToLower(text)[2:], 16, 64); strings.HasPrefix(strings.ToLower(text), "0x") && err == nil {
				return float64(n)
			}
			return math.NaN()
		}
		n, err := strconv.ParseFloat(text, 64)
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
		milli = number((m[7] + "00")[:3], 0)
	}
	if m[1] == "-000000" || month < 1 || month > 12 || day < 1 || day > 31 || hour > 24 || minute > 59 || second > 59 {
		return math.NaN()
	}
	if hour == 24 && minute+second+milli != 0 {
		return math.NaN()
	}
	place := time.UTC
	if m[4] != "" && m[8] == "" {
		place = time.Local
	}
	at := time.Date(year, time.Month(month), day, hour, minute, second, milli*int(time.Millisecond), place)
	if m[8] != "" && m[8] != "Z" {
		hours, minutes := number(m[8][1:3], 0), number(m[8][4:6], 0)
		if hours > 23 || minutes > 59 {
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
	if year := at.Year(); year < 0 || year > 9999 {
		sign := "+"
		if year < 0 {
			sign, year = "-", -year
		}
		return fmt.Sprintf("%s%06d%s", sign, year, text)
	}
	return fmt.Sprintf("%04d%s", at.Year(), text)
}
