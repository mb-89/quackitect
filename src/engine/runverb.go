package main

import (
	"flag"
	"fmt"
	"io"
)

// se run - run a shell command, naming the token it belongs to.
//
// THE COMMAND COMES IN ON STANDARD INPUT, not as a flag. A command line holds
// quotes, newlines and dollar signs, and passing it as an argument makes every
// layer between the agent and here agree about quoting. They do not.
//
// AND --command IS THERE FOR THE ONE CALLER THAT CANNOT PIPE. A session whose
// tool lane never came up reaches this verb at a shell, and the Bash guard
// refuses a pipe, because a pipe can write and the guard cannot read one and
// know what it writes. So the only form of this call was the one form that
// session could not make: it could read the tree and search it, and it could
// not test, change or commit anything. A flag names the token exactly as the
// piped form does, so the guard gives up nothing by taking it.
func runRun(c *call) int {
	fs := flag.NewFlagSet("run", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se run - run a shell command. Prints what it did as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  echo 'go test ./...' | se run --on wk-1234567890")
		fmt.Fprintln(c.err, "  se run --on wk-1234567890 --command 'go test ./...'")
		fmt.Fprintln(c.err, "  se run --page 20260902-171500.000 --from 40960")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  The command is read from standard input, whole, quotes and all.")
		fmt.Fprintln(c.err, "  It runs in the folder being worked on.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  --command is the same call with no pipe in it, for a session whose")
		fmt.Fprintln(c.err, "  tool lane never came up and whose Bash guard refuses a pipe.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  A long output is kept whole and answered a window at a time. The")
		fmt.Fprintln(c.err, "  answer carries the page to ask for the rest by. --from counts from")
		fmt.Fprintln(c.err, "  the end when it is negative.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token this command belongs to, by id")
	by := fs.String("by", "", "who is running it")
	command := fs.String("command", "", "the command, when there is no pipe to send it down")
	page := fs.String("page", "", "instead of running: read a window of an output that was kept")
	from := fs.Int("from", 0, "with page: where the window starts. Negative counts from the end")
	if code, stop := c.parse(fs, "run"); stop {
		return code
	}

	roots := c.roots
	// READING A PAGE NAMES NO TOKEN. It is looking at what a command already
	// said, and looking is not writing.
	if *page != "" {
		got, err := ReadPage(roots, *page, *from)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(got)
		return 0
	}
	if *on == "" {
		c.answerJSON(map[string]any{"error": "say which token this command is, with --on <id>. " +
			"A shell command names its work because the engine cannot read one and know " +
			"whether it writes"})
		return 1
	}
	// NAMING IT IS TAKING IT UP, the same as on a write. Whatever this actor
	// held goes back, so changing what you work on is one word on the next
	// command.
	if _, err := TakeUp(roots, *on, orElse(*by, "main")); err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}

	// THE FLAG IS READ INSTEAD OF THE PIPE, AND NEVER BESIDE IT. Reading both
	// would make a caller who named one and left the other open wait on a
	// terminal that is never going to end, which is what standard input is at a
	// shell with no pipe in front of it.
	said := *command
	if said == "" {
		b, err := io.ReadAll(c.in)
		if err != nil {
			c.answerJSON(map[string]any{"error": "the command will not read: " + err.Error()})
			return 1
		}
		said = string(b)
	}
	got, err := Run(roots, said)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error(), "on": *on})
		return 1
	}
	got.On = *on
	inSession(roots, "call", orElse(*by, "main"), *on+" ran "+firstLine(got.Command), Yes(),
		map[string]any{"id": *on, "exit": got.Exit})
	c.answerJSON(got)
	return 0
}
