// The hook verb: a Copilot hook's input off stdin, posted to the hooks door
// as the protocol reads it, with the old path's answer beside it in shadow.
// [[spec/tickets/copilot-meets-the-hooks-door]]
package main

import (
	"io"

	"quackitect/src/modules/hooks"
)

// The post a Copilot hook input makes. [[spec/tickets/copilot-meets-the-hooks-door]]
func copilotPost(event string, input map[string]any) hooks.Post { return hooks.Post{} }

// Posts stdin to the hooks door the root's standing file names, and prints its answer. [[spec/tickets/copilot-meets-the-hooks-door]]
func hookVerb(root, event string, in io.Reader, out io.Writer) int { return 0 }
