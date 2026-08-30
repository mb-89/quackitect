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
	flag.Parse()
	if *help {
		fmt.Println(FilterHelp)
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
	if _, err := os.Stat(path); err != nil {
		fmt.Fprintf(os.Stderr, "cannot read %s: %v\n", path, err)
		os.Exit(1)
	}
	run(path)
}

func run(path string) {
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
