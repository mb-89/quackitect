// The log viewer. It shows the session log it is handed, follows every line
// that lands, and starts again when a new session rotates the file.
// [[spec/design_output/tui]]

package main

import (
	"flag"
	"fmt"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

const (
	leastFrameWidth  = 20
	leastFrameHeight = 3
)

func main() {
	frame := flag.Bool("frame", false, "draw the window once, print it, and exit")
	size := flag.String("size", "120x40", "with --frame: the window, as WxH")
	opened := flag.String("pane", "", "with --frame: the pane to open, as details, help or filter")
	narrow := flag.String("filter", "", "with --frame: the filter to hold")
	floor := flag.String("floor", "", "with --frame: the floor to stand at, as debug, info, warn, error or fatal")
	mouse := flag.Bool("mouse", true, "take the mouse, which costs the terminal's own text selection")
	tab := flag.String("tab", "", "the tab the window opens on, as log or work")
	flag.Parse()
	if flag.NArg() != 1 {
		fmt.Fprintln(stderr, "usage: logview [--frame --size WxH --pane details|help|filter --filter text] [--mouse=false --tab log|work] <session.jsonl>")
		exits(2)
	}
	path := flag.Arg(0)
	// The colours stand in the config, and the window reads them once. [[spec/design_output/tui#colours]]
	loadColours(workRoot(path))

	if *frame {
		w, h, err := ParseSize(*size)
		if err != nil {
			fmt.Fprintln(stderr, err)
			exits(2)
		}
		out, err := Frame(path, w, h, *opened, *narrow, *floor, time.Local)
		if err != nil {
			fmt.Fprintln(stderr, err)
			exits(1)
		}
		fmt.Println(out)
		return
	}

	if err := runWindow(path, *tab, *mouse); err != nil {
		fmt.Fprintln(stderr, err)
		exits(1)
	}
}

// The window, with its door open for as long as it stands. A port already held means a window already stands, so this one hands its tab over and ends. [[spec/design_output/tui#a-second-launch-hands-over]]
func runWindow(path, tab string, mouse bool) error {
	start := newModel(path, time.Local)
	if n := start.tabNamed(tab); n > 0 {
		start.openTab(n)
	}
	program := tea.NewProgram(start, windowOpts(mouse)...)

	door, err := openDoor(windowPort, func(msg any) { program.Send(msg) })
	if err != nil {
		if tellPort(windowPort, tab) {
			fmt.Fprintln(stderr, "A window already stands, and it takes the tab.")
			return nil
		}
		fmt.Fprintf(stderr, "the window's door stays shut: %v\n", err)
	}
	if door != nil {
		defer func() { _ = door.Close() }()
	}

	_, err = program.Run()
	return err
}

// What the window asks the terminal for. The mouse rides a switch, because a window taking it takes the terminal's text selection with it. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func windowOpts(mouse bool) []tea.ProgramOption {
	opts := []tea.ProgramOption{tea.WithAltScreen()}
	if mouse {
		opts = append(opts, tea.WithMouseCellMotion())
	}
	return opts
}

// [[spec/design_output/tui#one-frame]]
func Frame(path string, w, h int, opened, narrow, floor string, zone *time.Location) (string, error) {
	m := newModel(path, zone)
	m.w, m.h = w, h
	recs, _, err := m.tailer.read()
	if err != nil {
		return "", err
	}
	m.all = recs
	if floor != "" {
		m.floor = floor
	}
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
		m.openPane(paneDetails)
	case "help":
		m.openPane(paneHelp)
	case "filter":
		m.openPane(paneFilter)
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
	if err != nil || w < leastFrameWidth {
		return 0, 0, fmt.Errorf("the width is a number of 20 or more: %q", wide)
	}
	h, err := strconv.Atoi(strings.TrimSpace(high))
	if err != nil || h < leastFrameHeight {
		return 0, 0, fmt.Errorf("the height is a number of 3 or more: %q", high)
	}
	return w, h, nil
}
