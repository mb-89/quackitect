package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
)

// se pull: the agent's one verb for receiving work.
//
// AND --from IS HOW A SESSION WITH NO LANE PUTS WORK DOWN. The payload arrived
// on standard input and nowhere else, and the Bash guard refuses a pipe, so a
// lane-less box could take work and never submit any: its tokens sat held by an
// agent that could not let go. run and apply met this first, and this is their
// door, a file under .se/scratchpad read whole. See payloadfrom.go.

func runPull(c *call) int {
	fs := flag.NewFlagSet("pull", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se pull - ask the engine what to do. Prints the answer as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se pull --actor main               get work")
		fmt.Fprintln(c.err, "  se pull --actor main --from .se/scratchpad/submit.json")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  A submission is one JSON object: the id, the disposition, and what")
		fmt.Fprintln(c.err, "  else that step asks for. The tool lane sends it on standard input.")
		fmt.Fprintln(c.err, "  --from reads the same object whole from a file under .se/scratchpad,")
		fmt.Fprintln(c.err, "  which is the one folder a session with nothing in hand may write.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is pulling")
	role := fs.String("role", RoleWorker, "which queue answers: worker, or reviewer")
	from := fs.String("from", "", "a file under .se/scratchpad holding the submission, read whole")
	if code, stop := c.parse(fs, "pull"); stop {
		return code
	}

	roots := c.roots

	var p Payload
	// A pull with no payload at all is a pull for work. The client reads a piped
	// payload and sends it whole, a terminal sends none, and --from names a file
	// for the session that can write one but cannot pipe it.
	piped, _ := io.ReadAll(c.in)
	raw := piped
	if *from != "" {
		if len(piped) > 0 {
			// TWO PAYLOADS ARE ANSWERED, NEVER GUESSED BETWEEN. Reading one of
			// them silently is how the other is lost, so neither is.
			c.answerJSON(Answer{Pull: AnswerRefused, Notice: "the pull carries two payloads",
				Findings: []Rejection{{Clause: "the payload",
					Wrong:     twoPayloads([]string{"--from", "standard input"}).Error(),
					Satisfies: "one payload"}}})
			return 1
		}
		b, err := payloadFrom(roots, *from)
		if err != nil {
			c.answerJSON(Answer{Pull: AnswerRefused, Notice: "the payload was not read",
				Findings: []Rejection{{Clause: "--from", Wrong: err.Error(),
					Satisfies: "a file under .se/scratchpad"}}})
			return 1
		}
		raw = b
	}
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &p); err != nil {
			c.answerJSON(Answer{Pull: AnswerRefused, Notice: "the payload will not read",
				Findings: []Rejection{{Clause: "the payload", Wrong: err.Error(),
					Satisfies: "one JSON object"}}})
			return 1
		}
	}

	a := Pull(roots, *actor, *role, p)
	id := ""
	if a.Token != nil {
		id = a.Token.ID
	}
	ok := Yes()
	if a.Pull == AnswerRefused {
		ok = No()
		c.refused = true // the answer is a result with exit 0, and it is still a refusal
	}
	inSession(roots, "pull", *actor, "pull answered "+a.Pull, ok,
		map[string]any{"id": id})
	c.answerJSON(a)
	return 0
}
