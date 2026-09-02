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

	Raw    string // the line as it was on disk
	Broken bool   // the line did not parse
	LineNo int64  // position in the file

	// ID IS THIS PROGRAM'S OWN, and it is what the selection holds on to.
	//
	// The record's own seq cannot be used. A session is written by more than
	// one process: the engine writes its own records, and every guard is a
	// separate process started by the harness for one event. Each carries its
	// own counter, so seq repeats across writers. Two records with the same
	// seq make the selection stick, because moving to the next one lands on a
	// number that still finds the first.
	ID int64
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
	r := Record{Raw: line, LineNo: lineNo, ID: lineNo}
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
	// THE FALLBACK IS WRITTEN HERE ON PURPOSE. A table that will not read must
	// not empty this column: a blank in a terminal reads as a missing record.
	if *r.OK {
		return drawn("ok", "✓") // the tick is named ok, not an icon literal
	}
	return drawn("refused", "✗") // the cross is named refused, not an icon literal
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
	// The label column is as wide as the widest label, so a long field name
	// cannot push its value out of line.
	kw := 8
	for _, k := range sortedKeys(r.Data) {
		if len(k) > kw {
			kw = len(k)
		}
	}
	add := func(k, v string) {
		if v == "" {
			return
		}
		fmt.Fprintf(&b, "%-*s %s\n", kw, k, v)
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
			if s, err := json.MarshalIndent(v, strings.Repeat(" ", kw+1), "  "); err == nil && looksNested(v) {
				fmt.Fprintf(&b, "%-*s %s\n", kw, k, string(s))
			} else {
				fmt.Fprintf(&b, "%-*s %v\n", kw, k, v)
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
