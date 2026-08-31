package main

import (
	"flag"
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
)

// A general program that reads log files. It knows nothing about what wrote
// them. Give it a file and it shows the lines, narrows them, and opens the
// details beside them.
func main() {
	help := flag.Bool("help", false, "print the keys and the filter language")
	demo := flag.Bool("demo", false, "write a made-up log twice a second and view it")
	keys := flag.Bool("keys", false, "print every key this terminal sends, and nothing else")
	version := flag.Bool("version", false, "print which build this is and exit")
	frame := flag.Bool("frame", false, "draw the window once, print it, and exit")
	size := flag.String("size", "120x40", "with --frame: how big the window is, WxH")
	narrow := flag.String("filter", "", "with --frame: narrow it, in the language --help prints")
	flag.Parse()
	if *help {
		fmt.Println(FilterHelp)
		return
	}
	// What a terminal actually sends. Run it where a key does not work and
	// the answer is on the screen rather than in a guess.
	// A terminal keeps the process it started, so a window can outlive the
	// build it was started from. The stamp is on screen and in --version, so
	// nobody has to wonder which one is running.
	if *version {
		fmt.Println(Build)
		return
	}

	if *keys {
		showKeys()
		return
	}

	if *demo {
		path, err := runDemo()
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		run(path)
		return
	}
	args := flag.Args()
	if len(args) != 1 {
		fmt.Fprintln(os.Stderr, "usage: logview <file>")
		fmt.Fprintln(os.Stderr, "       logview --help")
		os.Exit(2)
	}
	path := args[0]

	// A READER WITH NO TERMINAL still gets the window. The frame is drawn by
	// the same code that draws it on a screen, so the two never disagree.
	if *frame {
		w, h, err := ParseSize(*size)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(2)
		}
		out, err := Frame(path, w, h, *narrow)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		fmt.Println(out)
		return
	}

	// A file that is not there yet is not an error. The window can be opened
	// before the engine writes anything, and it fills when it does.
	run(path)
}

func run(path string) {
	// EVERY MARK COMES FROM util/icons.json, the same table the sidebar and the
	// editor read. It is found by walking up from the log this window watches.
	ReadIcons(path)
	// The alternate screen keeps the log out of the shell's scrollback. No
	// mouse option is requested anywhere: mouse tracking takes selection and
	// copy away from the terminal, and a log nobody can copy from has a hole
	// in it.
	p := tea.NewProgram(newModel(path), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
