// What the right pane shows for one row: its kind and time, the fields its writer
// added, and the whole text. A prompt shows the reply ending its turn, and a
// reply shows every prompt of that turn.
// [[spec/design_output/tui#the-details]]

package log

import (
	"fmt"
	"strings"
	"time"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
)

func pairsOf(all []Record, at int) []Record {
	if at < 0 || at >= len(all) {
		return nil
	}
	switch all[at].Kind {
	case "prompt":
		var out []Record
		answered := false
		mine := true
		for next := at + 1; next < len(all); next++ {
			switch all[next].Kind {
			case "prompt":
				answered = true
				mine = false
			case "answer":
				if !answered {
					out = append(out, all[next])
					answered = true
				}
			// Every note between this prompt and the next one shows under it, ahead of the answer and after it. [[spec/design_output/tui#the-details]]
			case "note":
				if mine {
					out = append(out, all[next])
				}
			case "reply":
				return append(out, all[next])
			}
		}
		return out
	// A note stands independent of the prompt that asked for it, so it borrows no pair. [[spec/design_output/tui#the-details]]
	case "answer":
		for back := at - 1; back >= 0; back-- {
			if all[back].Kind == "prompt" {
				return []Record{all[back]}
			}
		}
	case "reply":
		var out []Record
		for back := at - 1; back >= 0 && all[back].Kind != "reply"; back-- {
			if all[back].Kind == "prompt" {
				out = append([]Record{all[back]}, out...)
			}
		}
		return out
	}
	return nil
}

func DetailOf(all []Record, at int, zone *time.Location) []frame.Part {
	if at < 0 || at >= len(all) {
		return []frame.Part{{Style: draw.Dim, Text: "nothing is written yet"}}
	}
	r := all[at]
	if r.Broken {
		return []frame.Part{{Style: draw.LevelStyle("error"), Text: "this line does not parse"}, {}, {Text: r.Raw}}
	}
	out := append(heading(r, zone), fields(r)...)
	out = append(out, frame.Part{}, frame.Part{Style: saidStyle(r), Text: r.Body()})
	for _, pair := range pairsOf(all, at) {
		out = append(out, frame.Part{})
		out = append(out, heading(pair, zone)...)
		out = append(out, frame.Part{}, frame.Part{Style: saidStyle(pair), Text: pair.Body()})
	}
	return out
}

func heading(r Record, zone *time.Location) []frame.Part {
	head := fmt.Sprintf(" %s ", r.Label())
	when := r.At.In(zone).Format("15:04:05.000")
	if r.At.IsZero() {
		when = "--:--:--"
	}
	line := draw.KindStyle(r.Label()).Bold(true).Render(head) + "  " + draw.Dim.Render(when)
	if level := strings.ToLower(r.Level); level != "" && level != "info" {
		line += "  " + draw.LevelStyle(level).Render(level)
	}
	return []frame.Part{{Text: line, Drawn: true}}
}

func fields(r Record) []frame.Part {
	keys := r.Keys()
	wide := 0
	for _, key := range keys {
		wide = max(wide, len(key))
	}
	out := []frame.Part{}
	for _, key := range keys {
		out = append(out, frame.Part{Style: draw.Dim, Text: fmt.Sprintf("%-*s  %s", wide, key, r.Extra[key])})
	}
	return out
}
