// The graph verb: a process or a ticket, drawn as the graph the editor reads,
// off drawing in src/scripts/mint-verb.js.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/tickets"
)

func init() { register("graph", graphVerb(index.Root, realDisk())) }

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func graphVerb(rootOf func() (string, error), disk diskDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		path := firstWord(argv[1:])
		if path == "" {
			fmt.Fprint(errs, "Usage: ./RUNME.sh graph <process or ticket>\n\n")
			fmt.Fprintln(errs, "It answers the nodes and the edges as JSON, and draws nothing.")
			return exitUsage
		}
		root, err := rootOf()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		text, err := disk.read(filepath.Join(root, path))
		if err != nil {
			fmt.Fprintf(errs, "%s stands nowhere.\n", path)
			return exitUsage
		}
		return printsIndented(out, errs, tickets.GraphIn(string(text)))
	}
}

// The first word standing outside a flag. [[spec/tickets/ticket-verbs-port-to-go]]
func firstWord(said []string) string {
	for _, one := range said {
		if !strings.HasPrefix(one, "-") {
			return one
		}
	}
	return ""
}

// One value as JSON.stringify writes it indented by two, with no escape of the HTML characters. [[spec/tickets/ticket-verbs-port-to-go]]
func printsIndented(out, errs io.Writer, value any) int {
	var text strings.Builder
	writes := json.NewEncoder(&text)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	if err := writes.Encode(value); err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	fmt.Fprint(out, text.String())
	return 0
}
