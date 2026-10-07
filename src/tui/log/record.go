// One row of the log, read from the JSON line a writer appends. A line that does
// not parse still stands as a row, because the viewer shows what the file holds.
// [[spec/design_output/tui#one-row]]

package log

import (
	"encoding/json"
	"sort"
	"strings"
	"time"

	"quackitect/src/yaml"
)

var own = map[string]bool{"at": true, "level": true, "kind": true, "door": true, "said": true, "text": true}

type Record struct {
	At     time.Time
	Level  string
	Kind   string
	Said   string
	Text   string
	Extra  map[string]string
	Raw    string
	Broken bool
}

func ParseRecord(line string) Record {
	r := Record{Raw: line}
	var fields map[string]any
	decoder := json.NewDecoder(strings.NewReader(line))
	decoder.UseNumber()
	if err := decoder.Decode(&fields); err != nil || fields == nil {
		r.Broken = true
		r.Level = "error"
		r.Kind = "unparsed"
		r.Said = strings.TrimSpace(line)
		return r
	}
	if at, err := time.Parse(time.RFC3339Nano, yaml.FieldText(fields["at"])); err == nil {
		r.At = at
	}
	r.Level = yaml.FieldText(fields["level"])
	if r.Level == "" {
		r.Level = "info"
	}
	r.Kind = yaml.FieldText(fields["kind"])
	if r.Kind == "" {
		r.Kind = yaml.FieldText(fields["door"])
	}
	r.Said = yaml.FieldText(fields["said"])
	r.Text = yaml.FieldText(fields["text"])
	for key, value := range fields {
		if own[key] {
			continue
		}
		if r.Extra == nil {
			r.Extra = map[string]string{}
		}
		r.Extra[key] = yaml.FieldText(value)
	}
	return r
}

// The ladder Python's logging climbs. A level nobody knows stands as info. [[spec/design_output/tui#alt-l-raises-the-floor]]
var ladder = []string{"debug", "info", "warn", "error", "fatal"}

func Rank(level string) int {
	for at, one := range ladder {
		if strings.EqualFold(one, level) {
			return at
		}
	}
	return 1
}

// [[spec/design_output/tui#one-row]]
func (r Record) Label() string {
	if tool := r.Extra["tool"]; r.Kind == "tool" && tool != "" {
		return tool
	}
	return r.Kind
}

func (r Record) Body() string {
	if r.Text != "" {
		return r.Text
	}
	return r.Said
}

// [[spec/design_output/tui#the-filter-language]]
func (r Record) Field(name string) (string, bool) {
	switch strings.ToLower(name) {
	case "time", "t":
		return r.Stamp(time.Local), true
	case "level", "l":
		return r.Level, true
	case "kind", "k":
		return r.Kind, true
	case "tool":
		return r.Extra["tool"], true
	case "said", "s", "msg", "m":
		return r.Said, true
	case "text":
		return r.Body(), true
	}
	for key, value := range r.Extra {
		if strings.EqualFold(key, name) {
			return value, true
		}
	}
	return "", false
}

func (r Record) Haystack() string {
	parts := []string{r.Level, r.Label(), r.Said, r.Text}
	for _, key := range r.Keys() {
		parts = append(parts, key, r.Extra[key])
	}
	return strings.Join(parts, " ")
}

func (r Record) Detail() string {
	parts := []string{r.Label(), r.Body()}
	for _, key := range r.Keys() {
		parts = append(parts, key+"  "+r.Extra[key])
	}
	return strings.Join(parts, "\n")
}

func (r Record) Stamp(zone *time.Location) string {
	if r.At.IsZero() {
		return "--:--:--"
	}
	return r.At.In(zone).Format("15:04:05")
}

func (r Record) Keys() []string {
	out := make([]string, 0, len(r.Extra))
	for key := range r.Extra {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}
