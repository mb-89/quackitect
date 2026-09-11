// Wrapping a detail so nothing is cut off. A continuation lines up under the
// value, and a word wider than the pane breaks where it stands.
// [[spec/design_output/viewer#the-details]]

package main

import "strings"

func Wrap(said string, width int) string {
	width = max(width, 8)
	var out []string
	for _, line := range strings.Split(said, "\n") {
		out = append(out, wrapLine(line, width, hang(line))...)
	}
	return strings.Join(out, "\n")
}

func hang(line string) string {
	body := strings.TrimLeft(line, " ")
	lead := line[:len(line)-len(body)]
	if gap := strings.Index(body, "  "); gap > 0 {
		value := strings.TrimLeft(body[gap:], " ")
		if value != "" {
			return strings.Repeat(" ", len(line)-len(value))
		}
	}
	return lead
}

func wrapLine(line string, width int, indent string) []string {
	if len([]rune(line)) <= width {
		return []string{line}
	}
	if len(indent) > width-8 {
		indent = ""
	}
	var out []string
	cur := []rune{}
	room := width
	flush := func() {
		out = append(out, strings.TrimRight(string(cur), " "))
		cur = []rune(indent)
		room = width - len(indent)
	}
	put := func(word []rune) {
		for len(word) > room {
			cur = append(cur, word[:room]...)
			word = word[room:]
			flush()
		}
		cur = append(cur, word...)
		room -= len(word)
	}
	for at, seg := range segments(line) {
		word := []rune(seg.text)
		if seg.space {
			if len(word) <= room {
				cur = append(cur, word...)
				room -= len(word)
			} else {
				flush()
			}
			continue
		}
		if at > 0 && len(word) > room && len(word) <= width-len(indent) &&
			strings.TrimSpace(string(cur)) != "" {
			flush()
		}
		put(word)
	}
	return append(out, strings.TrimRight(string(cur), " "))
}

type segment struct {
	text  string
	space bool
}

func segments(line string) []segment {
	var out []segment
	for at := 0; at < len(line); {
		end, isSpace := at, line[at] == ' '
		for end < len(line) && (line[end] == ' ') == isSpace {
			end++
		}
		out = append(out, segment{text: line[at:end], space: isSpace})
		at = end
	}
	return out
}
