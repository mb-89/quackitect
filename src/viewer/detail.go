// What the right pane shows for one row: its kind and time, the fields its writer
// added, and the whole text. A prompt shows the reply ending its turn, and a
// reply shows every prompt of that turn.
// [[spec/design_output/viewer#the-details]]

package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

type part struct {
	style lipgloss.Style
	text  string
	drawn bool
}

func pairsOf(all []Record, at int) []Record {
	if at < 0 || at >= len(all) {
		return nil
	}
	switch all[at].Kind {
	case "prompt":
		var out []Record
		answered := false
		for next := at + 1; next < len(all); next++ {
			switch all[next].Kind {
			case "prompt":
				answered = true
			case "answer":
				if !answered {
					out = append(out, all[next])
					answered = true
				}
			case "reply":
				return append(out, all[next])
			}
		}
		return out
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

func detailOf(all []Record, at int, zone *time.Location) []part {
	if at < 0 || at >= len(all) {
		return []part{{style: dimStyle, text: "nothing is written yet"}}
	}
	r := all[at]
	if r.Broken {
		return []part{{style: levelStyle("error"), text: "this line does not parse"}, {}, {text: r.Raw}}
	}
	out := append(heading(r, zone), fields(r)...)
	out = append(out, part{}, part{style: saidStyle(r), text: r.Body()})
	for _, pair := range pairsOf(all, at) {
		out = append(out, part{})
		out = append(out, heading(pair, zone)...)
		out = append(out, part{}, part{style: saidStyle(pair), text: pair.Body()})
	}
	return out
}

func heading(r Record, zone *time.Location) []part {
	head := fmt.Sprintf(" %s ", r.Label())
	when := r.At.In(zone).Format("15:04:05.000")
	if r.At.IsZero() {
		when = "--:--:--"
	}
	line := kindStyle(r.Label()).Bold(true).Render(head) + "  " + dimStyle.Render(when)
	if level := strings.ToLower(r.Level); level != "" && level != "info" {
		line += "  " + levelStyle(level).Render(level)
	}
	return []part{{text: line, drawn: true}}
}

func fields(r Record) []part {
	keys := r.Keys()
	wide := 0
	for _, key := range keys {
		wide = max(wide, len(key))
	}
	out := []part{}
	for _, key := range keys {
		out = append(out, part{style: dimStyle, text: fmt.Sprintf("%-*s  %s", wide, key, r.Extra[key])})
	}
	return out
}

func renderParts(parts []part, width int) string {
	lines := []string{}
	for _, one := range parts {
		if one.drawn {
			lines = append(lines, one.text)
			continue
		}
		for _, line := range strings.Split(Wrap(one.text, width), "\n") {
			lines = append(lines, one.style.Render(line))
		}
	}
	return strings.Join(lines, "\n")
}
