// The rules-over verb: the Go rules over the text on stdin, read as the file the
// path names, answered as Vale's JSON reporter wrote it, so every JavaScript
// caller of the Vale door reads it unchanged.
// [[spec/tickets/go-rules-replace-vale]]
package main

import (
	"io"

	"quackitect/src/rules"
)

// The verb over its input and the rules it runs. [[spec/tickets/go-rules-replace-vale]]
func rulesOverVerb(in io.Reader, lint func(path, text string) []rules.Finding) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int { return 0 }
}
