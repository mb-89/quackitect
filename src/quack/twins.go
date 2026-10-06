// The Go twins of the verbs a program answers, each a read the index holds.
// The road runs each beside the program in shadow, and alone under new.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/index"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/work"
	"quackitect/src/proc"
	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The state a row stands open at, as OPEN in src/engine/group.js names it. [[spec/tickets/ticket-verbs-become-actions]]
const openRow = "open"

// The state a note stands closed at, the folder NOTES in src/scripts/ticket.js names, and the name the tickets module answers every ticket under. [[spec/tickets/retro-verbs-become-actions]]
const (
	closedRow   = "closed"
	notesFolder = ".se/tickets"
	allTickets  = "tickets/all"
)

// The name spec/wiring.yaml binds the work module's yours port under. [[spec/tickets/ticket-verbs-become-actions]]
const yoursName = "work/" + work.YoursPort

// The columns and the empty line queueOnly in src/scripts/work-list.js prints. [[spec/tickets/work-verbs-become-actions]]
const (
	queuePlaceWidth = 6
	queueNameWidth  = 34
	noQueue         = "No ticket stands in the queue."
)

func init() { register("ticket yours", ticketYours(index.V1)) }

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

func init() { register("retro notes", retroNotes(index.V1)) }

// retro notes off tickets/all over the base v1 answers: every note under .se/tickets standing open. [[spec/tickets/retro-verbs-become-actions]]
func retroNotes(v1 func() (string, error)) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		base, err := v1()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		var said struct {
			Value []ticket.Ticket `json:"value"`
		}
		if err := reads(base+"/values/"+allTickets, &said); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		open := []string{}
		for _, one := range said.Value {
			if strings.HasPrefix(one.Path, notesFolder+"/") && one.State != closedRow {
				open = append(open, one.Name)
			}
		}
		if len(open) == 0 {
			fmt.Fprintf(out, "%s holds no open note, so the box leaves nothing behind.\n", notesFolder)
			return 0
		}
		slices.Sort(open)
		fmt.Fprintf(out, "%d note(s) stand open under %s. Decide each one, then run this again:\n", len(open), notesFolder)
		for _, name := range open {
			fmt.Fprintf(out, "  %s\n", name)
		}
		return exitFailed
	}
}

func init() { register("branch list --queue", branchQueue(index.V1)) }

// branch list --queue off work/yours over the base v1 answers: each placed row off the cloud, place then name then step. [[spec/tickets/work-verbs-become-actions]]
func branchQueue(v1 func() (string, error)) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
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
		if len(said.Value) == 0 {
			fmt.Fprintln(out, noQueue)
			return 0
		}
		for _, one := range said.Value {
			fmt.Fprintf(out, "%*s  %-*s %s\n", queuePlaceWidth, one.Queue, queueNameWidth, one.Ticket, one.Step)
		}
		return 0
	}
}

// The node module over the real process door and this binary. [[spec/tickets/program-of-drops-node]]
func nodeAccept(root string) func(q.Request) (any, error) {
	return nodeAcceptOver(proc.Real, os.Executable, root)
}

// The node module: answers a registered verb's words, in process or as a person's child road under the root through the process door, and refuses a word nothing registers. [[spec/tickets/quack-spawns-meet-fake-process]]
func nodeAcceptOver(run proc.Runner, self func() (string, error), root string) func(q.Request) (any, error) {
	scripts := filepath.Join(root, "src", "scripts")
	return func(asked q.Request) (any, error) {
		words, person := asked.Args, false
		if marked, ok := asked.Args.(map[string]any); ok {
			words, person = marked[verbsmodule.WordsField], marked[verbsmodule.PersonField] == true
		}
		args, err := wordsOf(words)
		if err != nil {
			return nil, err
		}
		if len(args) == 0 {
			return nil, fmt.Errorf("the node module takes a verb, and reads no words")
		}
		// [[spec/tickets/quack-registers-each-verb]]
		_, one := twinOf(args, registry)
		if one == nil {
			return nil, fmt.Errorf("there is no verb called %s", strings.Join(args, " "))
		}
		if !person {
			return goAnswer(args, one)
		}
		// A person's call reads the person's environment, which the index's own process holds not, so the road runs in a child under it. [[spec/design_output/pull#the-hand-rule]]
		binary, err := self()
		if err != nil {
			return nil, err
		}
		said := run(proc.Command{
			Argv: append([]string{binary, "verb", scripts}, args...),
			Dir:  root,
			Drop: harness,
			Env:  []string{workRoot + "=" + root},
		})
		if said.Code != 0 {
			return nil, fmt.Errorf("%s answers exit %d: %s", strings.Join(args, " "), said.Code, strings.TrimRight(said.Out+said.Err, "\n"))
		}
		return strings.TrimRight(said.Out, "\n"), nil
	}
}

// The variables a harness sets, which HARNESS in src/extension/lib/lens.js owns, and the root a person's run names, which WORK_ROOT there owns. [[spec/design_output/pull#the-hand-rule]]
var harness = []string{"CLAUDECODE", "CLAUDE_CODE_REMOTE", "SE_CLOUD"}

const workRoot = "SE_WORK_ROOT"


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
