package main

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
)

// A Record is one line of the log. The log is JSON Lines, so a line that does
// not parse is still shown: an unreadable record is a fact about the log, and
// hiding it would make the viewer lie about what is on disk.
type Record struct {
	Time    time.Time      `json:"-"`
	Seq     int64          `json:"seq"`
	Session string         `json:"session"`
	Src     string         `json:"src"`
	Kind    string         `json:"kind"`
	Actor   string         `json:"actor"`
	Msg     string         `json:"msg"`
	OK      *bool          `json:"ok"`
	Data    map[string]any `json:"data"`

	Raw     string // the line as it was on disk
	Broken  bool   // the line did not parse
	LineNo  int64  // position in the file, used when Seq is absent
}

type wire struct {
	T       string         `json:"t"`
	Seq     int64          `json:"seq"`
	Session string         `json:"session"`
	Src     string         `json:"src"`
	Kind    string         `json:"kind"`
	Actor   string         `json:"actor"`
	Msg     string         `json:"msg"`
	OK      *bool          `json:"ok"`
	Data    map[string]any `json:"data"`
}

func ParseRecord(line string, lineNo int64) Record {
	r := Record{Raw: line, LineNo: lineNo}
	var w wire
	if err := json.Unmarshal([]byte(line), &w); err != nil {
		r.Broken = true
		r.Kind = "unparsed"
		r.Src = "?"
		r.Msg = strings.TrimSpace(line)
		r.Seq = lineNo
		return r
	}
	if t, err := time.Parse(time.RFC3339Nano, w.T); err == nil {
		r.Time = t
	}
	r.Seq, r.Session, r.Src, r.Kind = w.Seq, w.Session, w.Src, w.Kind
	r.Actor, r.Msg, r.OK, r.Data = w.Actor, w.Msg, w.OK, w.Data
	if r.Seq == 0 {
		r.Seq = lineNo
	}
	return r
}

// Field gives the value a column filter compares against. The names here are
// the ones a person types, so they are short and they are the same names the
// detail pane prints.
func (r Record) Field(name string) (string, bool) {
	switch strings.ToLower(name) {
	case "time", "t":
		return r.Stamp(), true
	case "src", "source":
		return r.Src, true
	case "kind", "k":
		return r.Kind, true
	case "actor", "who":
		return r.Actor, true
	case "msg", "message", "m":
		return r.Msg, true
	case "session", "s":
		return r.Session, true
	case "ok":
		return r.Mark(), true
	}
	if r.Data != nil {
		if v, found := r.Data[name]; found {
			return fmt.Sprint(v), true
		}
	}
	return "", false
}

func (r Record) Stamp() string {
	if r.Time.IsZero() {
		return "--:--:--"
	}
	return r.Time.Format("15:04:05")
}

func (r Record) Day() string {
	if r.Time.IsZero() {
		return "-----"
	}
	return r.Time.Format("01-02")
}

func (r Record) Mark() string {
	if r.OK == nil {
		return " "
	}
	if *r.OK {
		return "✓"
	}
	return "✗"
}

// Haystack is what a bare term searches. Everything a person can see, plus the
// detail values, because a search that misses what is one keystroke away is a
// search people stop trusting.
func (r Record) Haystack() string {
	var b strings.Builder
	b.WriteString(r.Stamp())
	b.WriteByte(' ')
	b.WriteString(r.Src)
	b.WriteByte(' ')
	b.WriteString(r.Kind)
	b.WriteByte(' ')
	b.WriteString(r.Actor)
	b.WriteByte(' ')
	b.WriteString(r.Msg)
	if r.Data != nil {
		for _, k := range sortedKeys(r.Data) {
			b.WriteByte(' ')
			b.WriteString(k)
			b.WriteByte(' ')
			fmt.Fprint(&b, r.Data[k])
		}
	}
	return b.String()
}

func sortedKeys(m map[string]any) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// Detail is the right pane. It prints every field, so opening a line answers
// the question completely and never sends the reader to the file.
func (r Record) Detail() string {
	var b strings.Builder
	add := func(k, v string) {
		if v == "" {
			return
		}
		fmt.Fprintf(&b, "%-10s %s\n", k, v)
	}
	if r.Broken {
		b.WriteString("this line did not parse\n\n")
		b.WriteString(r.Raw)
		return b.String()
	}
	add("time", r.Time.Format(time.RFC3339))
	add("seq", fmt.Sprint(r.Seq))
	add("session", r.Session)
	add("src", r.Src)
	add("kind", r.Kind)
	add("actor", r.Actor)
	if r.OK != nil {
		add("ok", fmt.Sprint(*r.OK))
	}
	b.WriteString("\n")
	b.WriteString(r.Msg)
	b.WriteString("\n")
	if len(r.Data) > 0 {
		b.WriteString("\n")
		for _, k := range sortedKeys(r.Data) {
			v := r.Data[k]
			if s, err := json.MarshalIndent(v, "           ", "  "); err == nil && looksNested(v) {
				fmt.Fprintf(&b, "%-10s %s\n", k, string(s))
			} else {
				fmt.Fprintf(&b, "%-10s %v\n", k, v)
			}
		}
	}
	return b.String()
}

func looksNested(v any) bool {
	switch v.(type) {
	case map[string]any, []any:
		return true
	}
	return false
}
