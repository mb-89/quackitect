package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
)

// se pull: the agent's one verb for receiving work.

func runPull(c *call) int {
	fs := flag.NewFlagSet("pull", flag.ContinueOnError)
	fs.SetOutput(c.out)
	fs.Usage = func() {
		fmt.Fprintln(c.out, "se pull - ask the engine what to do. Prints the answer as JSON.")
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  se pull --actor main               get work")
		fmt.Fprintln(c.out, "  echo '{\"id\":\"wk-..\",...}' | se pull --actor main")
		fmt.Fprintln(c.out, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is pulling")
	if code, stop := c.parse(fs, "pull"); stop {
		return code
	}

	roots := c.roots

	var p Payload
	// A pull with nothing on standard input is a pull for work. The client
	// reads a piped payload and sends it whole, and a terminal sends none.
	if b, _ := io.ReadAll(c.in); len(b) > 0 {
		if err := json.Unmarshal(b, &p); err != nil {
			c.answerJSON(Answer{Pull: AnswerRefused, Notice: "the payload will not read",
				Findings: []Rejection{{Clause: "the payload", Wrong: err.Error(),
					Satisfies: "one JSON object"}}})
			return 1
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
	c.answerJSON(a)
	return 0
}
