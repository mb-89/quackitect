// The log viewer. It shows the session log it is handed, follows every line
// that lands, and starts again when a new session rotates the file.
// [[spec/design_output/viewer]]

package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

func main() {
	frame := flag.Bool("frame", false, "draw the window once, print it, and exit")
	size := flag.String("size", "120x40", "with --frame: the window, as WxH")
	opened := flag.String("pane", "", "with --frame: the pane to open, as details, help or filter")
	narrow := flag.String("filter", "", "with --frame: the filter to hold")
	flag.Parse()
	if flag.NArg() != 1 {
		fmt.Fprintln(os.Stderr, "usage: logview [--frame --size WxH --pane details|help|filter --filter text] <session.jsonl>")
		os.Exit(2)
	}
	path := flag.Arg(0)

	if *frame {
		w, h, err := ParseSize(*size)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(2)
		}
		out, err := Frame(path, w, h, *opened, *narrow, time.Local)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		fmt.Println(out)
		return
	}

	if _, err := tea.NewProgram(newModel(path, time.Local), tea.WithAltScreen()).Run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// [[spec/design_output/viewer#one-frame]]
func Frame(path string, w, h int, opened, narrow string, zone *time.Location) (string, error) {
	m := newModel(path, zone)
	m.w, m.h = w, h
	recs, _, err := m.tailer.read()
	if err != nil {
		return "", err
	}
	m.all = recs
	if narrow != "" {
		f, err := ParseFilter(narrow)
		if err != nil {
			return "", err
		}
		m.filter = f
		m.input.SetValue(narrow)
	}
	m.rebuild()
	switch opened {
	case "details":
		m.open(paneDetails)
	case "help":
		m.open(paneHelp)
	case "filter":
		m.open(paneFilter)
	}
	m.resize()
	return settle(m.View()), nil
}

func settle(said string) string {
	lines := strings.Split(said, "\n")
	for at, line := range lines {
		lines[at] = strings.TrimRight(line, " ")
	}
	last := len(lines)
	for last > 0 && lines[last-1] == "" {
		last--
	}
	return strings.Join(lines[:last], "\n")
}

func ParseSize(said string) (int, int, error) {
	wide, high, found := strings.Cut(strings.ToLower(strings.TrimSpace(said)), "x")
	if !found {
		return 0, 0, fmt.Errorf("a size reads WxH, as in 120x40: %q", said)
	}
	w, err := strconv.Atoi(strings.TrimSpace(wide))
	if err != nil || w < 20 {
		return 0, 0, fmt.Errorf("the width is a number of 20 or more: %q", wide)
	}
	h, err := strconv.Atoi(strings.TrimSpace(high))
	if err != nil || h < 3 {
		return 0, 0, fmt.Errorf("the height is a number of 3 or more: %q", high)
	}
	return w, h, nil
}
