// The reader's verb: every owner prompt, fault and command a chapter holds,
// each with the file and line it stands on, so no reader writes a parser.
// [[spec/tickets/the-retro-finishes-its-asks]]
package main

import "io"

// One row a line earns: its kind, and its text. [[spec/tickets/the-retro-finishes-its-asks]]
type retroRow struct {
	kind string
	text string
}

func init() { register("retro read", retroReadVerb(retroRoot)) }

// Every row one line earns: a fault, an owner prompt, or a shell command. [[spec/tickets/the-retro-finishes-its-asks]]
func retroRowsOf(path, line string) []retroRow {
	return nil
}

// The verb: prints each row of the chapter's lines as `path:line  kind  text`. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReadVerb(root func() string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return 0 }
}
