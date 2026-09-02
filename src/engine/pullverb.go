package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
)

// se pull: the agent's one verb for receiving work.

func runPull(args []string) {
	fs := flag.NewFlagSet("pull", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se pull - ask the engine what to do. Prints the answer as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se pull --actor main               get work")
		fmt.Fprintln(os.Stdout, "  echo '{\"id\":\"wk-..\",...}' | se pull --actor main")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is pulling")
	parse(fs, "pull", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}

	var p Payload
	// A pull with nothing on standard input is a pull for work. A terminal
	// gives no end of file, so only a piped payload is read.
	if st, err := os.Stdin.Stat(); err == nil && st.Mode()&os.ModeCharDevice == 0 {
		if b, _ := io.ReadAll(os.Stdin); len(b) > 0 {
			if err := json.Unmarshal(b, &p); err != nil {
				answerJSON(Answer{Pull: AnswerRefused, Notice: "the payload will not read",
					Findings: []Rejection{{Clause: "the payload", Wrong: err.Error(),
						Satisfies: "one JSON object"}}})
				os.Exit(1)
			}
		}
	}

	a := Pull(roots, *actor, RoleWorker, p)
	id := ""
	if a.Token != nil {
		id = a.Token.ID
	}
	ok := Yes()
	if a.Pull == AnswerRefused {
		ok = No()
	}
	inSession(roots, "pull", *actor, "pull answered "+a.Pull, ok,
		map[string]any{"id": id})
	answerJSON(a)
}
