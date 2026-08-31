package main

import "strings"

// WRAPPING A DETAIL SO NOTHING IS CUT OFF.
//
// A viewport clips at its width. The detail pane holds the whole of a prompt
// and the whole of a notice, and those are the lines worth reading, so
// clipping them hid the part somebody opened the pane for.
//
// A CONTINUATION LINES UP UNDER THE VALUE. A detail is a label column and a
// value column, and a wrapped value that returned to column zero would read as
// a new field with no name.
//
// A run with no spaces in it is broken rather than left long. A path is one
// word, and one word wider than the pane would push the pane sideways.
func Wrap(s string, width int) string {
	if width < 8 {
		width = 8
	}
	var out []string
	for _, line := range strings.Split(s, "\n") {
		out = append(out, wrapLine(line, width, hang(line))...)
	}
	return strings.Join(out, "\n")
}

// hang answers the column a continuation of this line starts at: where the
// value begins on a label line, and the line's own indent on any other.
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

// A line is wrapped by its spaces, and the spaces are kept as they were. The
// label column is spacing, so reflowing a line into single spaces would take
// the columns apart to fix the width.
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
	// A BREAK LEAVES NO SPACE AT THE END OF THE LINE. The spaces that carried
	// the eye to the next word are what the break replaced.
	flush := func() {
		out = append(out, strings.TrimRight(string(cur), " "))
		cur = []rune(indent)
		room = width - len(indent)
	}
	put := func(w []rune) {
		for len(w) > room {
			cur = append(cur, w[:room]...)
			w = w[room:]
			flush()
		}
		cur = append(cur, w...)
		room -= len(w)
	}
	for i, seg := range segments(line) {
		w := []rune(seg.text)
		if seg.space {
			// A RUN OF SPACES AT A BREAK GOES AWAY. Carrying it to the next
			// line would indent past the column the continuation lines up at.
			if len(w) <= room {
				cur = append(cur, w...)
				room -= len(w)
			} else {
				flush()
			}
			continue
		}
		// A WORD MOVES TO THE NEXT LINE ONLY IF IT FITS THERE. One wider than
		// the pane has to be broken wherever it starts, so breaking it here
		// beats leaving a line empty and breaking it there.
		if i > 0 && len(w) > room && len(w) <= width-len(indent) &&
			strings.TrimSpace(string(cur)) != "" {
			flush()
		}
		put(w)
	}
	return append(out, strings.TrimRight(string(cur), " "))
}

type segment struct {
	text  string
	space bool
}

// segments cuts a line into runs of spaces and runs of anything else.
func segments(line string) []segment {
	var out []segment
	for i := 0; i < len(line); {
		j, isSpace := i, line[i] == ' '
		for j < len(line) && (line[j] == ' ') == isSpace {
			j++
		}
		out = append(out, segment{text: line[i:j], space: isSpace})
		i = j
	}
	return out
}
