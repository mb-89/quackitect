package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// se run - run a shell command, naming the token it belongs to.
//
// THE COMMAND COMES IN ON STANDARD INPUT, not as a flag. A command line holds
// quotes, newlines and dollar signs, and passing it as an argument makes every
// layer between the agent and here agree about quoting. They do not.
func runRun(args []string) {
	fs := flag.NewFlagSet("run", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se run - run a shell command. Prints what it did as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  echo 'go test ./...' | se run --on wk-1234567890")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  The command is read from standard input, whole, quotes and all.")
		fmt.Fprintln(os.Stdout, "  It runs in the folder being worked on.")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token this command belongs to, by id")
	by := fs.String("by", "", "who is running it")
	parse(fs, "run", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	if *on == "" {
		answerJSON(map[string]any{"error": "say which token this command is, with --on <id>. " +
			"A shell command names its work because the engine cannot read one and know " +
			"whether it writes"})
		os.Exit(1)
	}
	// NAMING IT IS TAKING IT UP, the same as on a write. Whatever this actor
	// held goes back, so changing what you work on is one word on the next
	// command.
	if _, err := TakeUp(roots, *on, orElse(*by, "main")); err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}

	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		answerJSON(map[string]any{"error": "the command will not read: " + err.Error()})
		os.Exit(1)
	}
	got, err := Run(roots, string(b))
	if err != nil {
		answerJSON(map[string]any{"error": err.Error(), "on": *on})
		os.Exit(1)
	}
	got.On = *on
	inSession(roots, "call", orElse(*by, "main"), *on+" ran "+firstLine(got.Command), Yes(),
		map[string]any{"id": *on, "exit": got.Exit})
	answerJSON(got)
}
