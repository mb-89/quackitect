// The Go twins of the verbs cli.js answers, each a read the index holds. The
// road runs each beside cli.js in shadow, and alone under new.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// The state a row stands open at, as OPEN in src/engine/group.js names it. [[spec/tickets/ticket-verbs-become-actions]]
const openRow = "open"

// The name spec/wiring.yaml binds the work module's yours port under. [[spec/tickets/ticket-verbs-become-actions]]
const yoursName = "work/" + work.YoursPort

// ticket yours off work/yours over the base v1 answers, one JSON object as ticket-yours.js prints it. [[spec/tickets/ticket-verbs-become-actions]]
func ticketYours(v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		base, err := v1()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		var said struct {
			Value []work.YoursRow `json:"value"`
		}
		if err := reads(base+"/values/"+yoursName, &said); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if !slices.Contains(argv, "--next") {
			return printsLine(out, errs, map[string]any{"tickets": orEmpty(said.Value)})
		}
		for _, one := range said.Value {
			if one.Person && one.Path != "" && one.State == openRow {
				return printsLine(out, errs, struct {
					Ticket string `json:"ticket"`
					Path   string `json:"path"`
					Step   string `json:"step"`
				}{one.Ticket, one.Path, one.Step})
			}
		}
		return printsLine(out, errs, map[string]any{"ticket": nil})
	}
}

// A list JSON writes as [] where it holds nothing, as JSON.stringify does. [[spec/tickets/ticket-verbs-become-actions]]
func orEmpty(rows []work.YoursRow) []work.YoursRow {
	if rows == nil {
		return []work.YoursRow{}
	}
	return rows
}

// One JSON line as JSON.stringify writes it, with no escape of the HTML characters. [[spec/tickets/ticket-verbs-become-actions]]
func printsLine(out, errs io.Writer, value any) int {
	var text bytes.Buffer
	writes := json.NewEncoder(&text)
	writes.SetEscapeHTML(false)
	if err := writes.Encode(value); err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	_, _ = out.Write(text.Bytes())
	return 0
}

// retro notes off tickets/all over the base v1 answers: every note under .se/tickets standing open. [[spec/tickets/retro-verbs-become-actions]]
func retroNotes(v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return exitUsage
	}
}

// branch list --queue off work/yours over the base v1 answers: each placed row off the cloud, place then name then step. [[spec/tickets/work-verbs-become-actions]]
func branchQueue(v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return exitUsage
	}
}

// The node module: runs cli.js under the root with the request's words, and answers its output. [[spec/tickets/ticket-verbs-become-actions]]
func nodeAccept(root string) func(q.Request) (any, error) {
	cli := filepath.Join(root, "src", "scripts", "cli.js")
	return func(asked q.Request) (any, error) {
		args, err := wordsOf(asked.Args)
		if err != nil {
			return nil, err
		}
		run := exec.Command("node", append([]string{cli}, args...)...)
		run.Dir = root
		said, err := run.CombinedOutput()
		text := strings.TrimRight(string(said), "\n")
		if err != nil {
			return nil, fmt.Errorf("%s answers %v: %s", strings.Join(args, " "), err, text)
		}
		return text, nil
	}
}

// The words a request carries, as a list of strings or as the list JSON decodes. [[spec/tickets/ticket-verbs-become-actions]]
func wordsOf(args any) ([]string, error) {
	switch held := args.(type) {
	case []string:
		return held, nil
	case []any:
		out := make([]string, 0, len(held))
		for _, one := range held {
			word, ok := one.(string)
			if !ok {
				return nil, fmt.Errorf("the node module takes words, and reads %v", one)
			}
			out = append(out, word)
		}
		return out, nil
	}
	return nil, fmt.Errorf("the node module takes words, and reads %T", args)
}
