package main

import (
	"fmt"
	"strconv"
	"strings"
)

// ONE FRAME, FOR A READER WITH NO TERMINAL.
//
// The window decides how the record looks, and it is the only thing that
// does. A second renderer would be a second decision, and the two would drift
// the first time either changed. So a reader who cannot open a terminal is
// given the window's own frame, drawn once and printed.
//
// Everything anybody builds into the window shows up here, because this is
// the window. The size is given rather than asked for, and that is the whole
// difference.

// Frame draws the window once, at the size given, and returns what it drew.
func Frame(path string, w, h int, filter string) (string, error) {
	m := newModel(path)
	m.w, m.h = w, h
	m.input.Width = max(10, m.listWidth()-12)
	m.detail.Width = max(10, m.w-m.listWidth()-3)
	m.detail.Height = max(3, m.h-4)

	if filter != "" {
		f, err := ParseFilter(filter)
		if err != nil {
			return "", err
		}
		m.filter = f
		m.input.SetValue(filter)
	}

	recs, _, err := m.tailer.read()
	if err != nil {
		return "", err
	}
	m.all = recs
	m.rebuild()
	return settle(m.View()), nil
}

// A screen is padded to its height because a screen has one. A pipe does
// not, so the padding is dropped and nothing else is.
func settle(s string) string {
	lines := strings.Split(s, "\n")
	for i, l := range lines {
		lines[i] = strings.TrimRight(l, " ")
	}
	last := len(lines)
	for last > 0 && lines[last-1] == "" {
		last--
	}
	return strings.Join(lines[:last], "\n")
}

// ParseSize reads WxH, which is how a person writes a size everywhere else.
func ParseSize(s string) (int, int, error) {
	wide, high, ok := strings.Cut(strings.ToLower(strings.TrimSpace(s)), "x")
	if !ok {
		return 0, 0, fmt.Errorf("a size is written WxH, as in 120x40: %q", s)
	}
	w, err := strconv.Atoi(strings.TrimSpace(wide))
	if err != nil || w < 20 {
		return 0, 0, fmt.Errorf("the width is a number of at least 20: %q", wide)
	}
	h, err := strconv.Atoi(strings.TrimSpace(high))
	if err != nil || h < 5 {
		return 0, 0, fmt.Errorf("the height is a number of at least 5: %q", high)
	}
	return w, h, nil
}
