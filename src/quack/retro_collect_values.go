// The values collect reads and writes: the battery report it keeps, each part
// read as its median, and JSON as JSON.parse, JSON.stringify, String and
// Number take it.
// [[spec/guidance/retro/collect]]
package main

import (
	"bytes"
	"encoding/json"
	"io"
	"math"
	"os"
	"slices"
	"sort"
	"strconv"
	"strings"
)

// An object JSON.parse reads, its keys in the order the text writes them. [[spec/guidance/retro/collect]]
type retroCollectObject struct {
	keys []string
	vals map[string]any
}

// The parts read as their median over the runs the stamp keeps, and the slowest cases and the files stay off the last run. [[spec/guidance/retro/effect]]
func retroKeptReport(stamp string) string {
	parsed, _ := retroCollectParsed(stamp)
	report := retroCollectGet(parsed, "battery")
	if !retroCollectTruthy(report) {
		return ""
	}
	runs, _ := retroCollectGet(parsed, "runs").([]any)
	if len(runs) == 0 {
		parts := retroCollectGet(report, "parts")
		if parts == nil {
			parts = retroCollectNewObject()
		}
		runs = []any{parts}
	}
	parts := retroCollectMedianParts(runs)
	var total float64
	for _, key := range parts.keys {
		total += parts.vals[key].(float64)
	}
	out := retroCollectNewObject()
	if whole, isObject := report.(*retroCollectObject); isObject {
		for _, key := range whole.keys {
			out.set(key, whole.vals[key])
		}
	}
	out.set("parts", parts)
	out.set("total", total)
	out.set("runs", float64(len(runs)))
	return retroCollectPretty(out)
}

// Each part's median over the runs, as medianParts in src/scripts/battery.js reads it. [[spec/guidance/retro/effect]]
func retroCollectMedianParts(runs []any) *retroCollectObject {
	held := retroCollectNewObject()
	for _, run := range runs {
		one, isObject := run.(*retroCollectObject)
		if !isObject {
			continue
		}
		for _, name := range one.keys {
			all, _ := held.vals[name].([]float64)
			held.set(name, append(all, retroCollectNumber(one.vals[name])))
		}
	}
	out := retroCollectNewObject()
	for _, name := range held.keys {
		all := slices.Clone(held.vals[name].([]float64))
		sort.Float64s(all)
		mid := len(all) / 2
		if len(all)%2 == 1 {
			out.set(name, all[mid])
		} else {
			out.set(name, math.Floor((all[mid-1]+all[mid])/2+retroJSHalf))
		}
	}
	return out
}

// An empty object. [[spec/guidance/retro/collect]]
func retroCollectNewObject() *retroCollectObject {
	return &retroCollectObject{vals: map[string]any{}}
}

// Whether the object carries a key. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) has(key string) bool {
	_, found := o.vals[key]
	return found
}

// Sets a key, keeping the place a key it carries already stands at. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) set(key string, said any) {
	if !o.has(key) {
		o.keys = append(o.keys, key)
	}
	o.vals[key] = said
}

// The object as JSON.stringify writes it, its keys in their order. [[spec/guidance/retro/collect]]
func (o *retroCollectObject) MarshalJSON() ([]byte, error) {
	var out bytes.Buffer
	out.WriteByte('{')
	for at, key := range o.keys {
		if at > 0 {
			out.WriteByte(',')
		}
		out.WriteString(retroCollectCompact(key) + ":" + retroCollectCompact(o.vals[key]))
	}
	out.WriteByte('}')
	return out.Bytes(), nil
}

// A JSON text read as JSON.parse reads it, an object keeping its key order, or false where it reads as no JSON. [[spec/guidance/retro/collect]]
func retroCollectParsed(text string) (any, bool) {
	reads := json.NewDecoder(strings.NewReader(text))
	said, err := retroCollectDecode(reads)
	if err != nil {
		return nil, false
	}
	if _, err := reads.Token(); err != io.EOF {
		return nil, false
	}
	return said, true
}

// One JSON value off the decoder. [[spec/guidance/retro/collect]]
func retroCollectDecode(reads *json.Decoder) (any, error) {
	token, err := reads.Token()
	if err != nil {
		return nil, err
	}
	mark, isDelim := token.(json.Delim)
	if !isDelim {
		return token, nil
	}
	if mark == '[' {
		list := []any{}
		for reads.More() {
			one, err := retroCollectDecode(reads)
			if err != nil {
				return nil, err
			}
			list = append(list, one)
		}
		_, err = reads.Token()
		return list, err
	}
	object := retroCollectNewObject()
	for reads.More() {
		key, err := reads.Token()
		if err != nil {
			return nil, err
		}
		one, err := retroCollectDecode(reads)
		if err != nil {
			return nil, err
		}
		object.set(key.(string), one)
	}
	_, err = reads.Token()
	return object, err
}

// A value's key, where the value is an object. [[spec/guidance/retro/collect]]
func retroCollectGet(said any, key string) any {
	if object, isObject := said.(*retroCollectObject); isObject {
		return object.vals[key]
	}
	return nil
}

// Whether a value reads true, as JavaScript reads one. [[spec/guidance/retro/collect]]
func retroCollectTruthy(said any) bool {
	switch one := said.(type) {
	case nil:
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

// A value as String writes it, and nothing for null. [[spec/guidance/retro/collect]]
func retroCollectText(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case float64:
		return strconv.FormatFloat(one, 'f', -1, numberBits)
	case int:
		return strconv.Itoa(one)
	case []any:
		parts := make([]string, len(one))
		for at, each := range one {
			parts[at] = retroCollectText(each)
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// A value as Number reads it, and 0 where it reads as none. [[spec/guidance/retro/effect]]
func retroCollectNumber(said any) float64 {
	switch one := said.(type) {
	case float64:
		if !math.IsNaN(one) {
			return one
		}
	case bool:
		if one {
			return 1
		}
	case string:
		if number, err := strconv.ParseFloat(strings.TrimSpace(one), numberBits); err == nil {
			return number
		}
	}
	return 0
}

// A value as JSON.stringify writes it on one line. [[spec/guidance/retro/collect]]
func retroCollectCompact(said any) string {
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(said)
	return strings.TrimSuffix(out.String(), "\n")
}

// A value as JSON.stringify writes it at two spaces, and a newline after. [[spec/guidance/retro/collect]]
func retroCollectPretty(said any) string {
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	_ = writes.Encode(said)
	return out.String()
}

// The entries of a folder by name, or none where it stands nowhere. [[spec/guidance/retro/collect]]
func retroCollectListed(at string) []os.DirEntry {
	entries, err := os.ReadDir(at)
	if err != nil {
		return nil
	}
	return entries
}

// A file's text, or nothing. [[spec/guidance/retro/collect]]
func retroCollectRead(at string) string {
	text, err := os.ReadFile(at)
	if err != nil {
		return ""
	}
	return string(text)
}

// Whether a path stands. [[spec/guidance/retro/collect]]
func retroCollectExists(at string) bool {
	_, err := os.Stat(at)
	return err == nil
}
