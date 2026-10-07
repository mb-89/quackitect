// The cage verb: the event and its input on stdin, answered with a deny where
// the call stays guarded while the hooks door stands down.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package main

import (
	"encoding/json"
	"fmt"
	"io"

	"quackitect/src/modules/hooks"
)

// What the bridgehead hands the verb: the event, and the call it guards. [[spec/tickets/level0-hooks-hold-no-rule]]
type caged struct {
	Event string         `json:"event"`
	E     map[string]any `json:"e"`
}

func init() { register("cage", cageVerb(stdin)) }

// The verb over the input it reads: one deny line where the call stays guarded, and nothing where it passes. An input reading as no JSON exits 1, and the bridgehead passes the call. [[spec/tickets/level0-hooks-hold-no-rule]]
func cageVerb(input io.Reader) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		var said caged
		if err := json.NewDecoder(input).Decode(&said); err != nil {
			fmt.Fprintf(errs, "the cage reads no event: %v\n", err)
			return 1
		}
		if !hooks.Guarded(said.Event, said.E) {
			return 0
		}
		line, err := json.Marshal(map[string]string{"deny": hooks.RefusedText(said.E)})
		if err != nil {
			fmt.Fprintf(errs, "the cage writes no deny: %v\n", err)
			return 1
		}
		fmt.Fprintf(out, "%s\n", line)
		return 0
	}
}
