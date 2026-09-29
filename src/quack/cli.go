// The command tree quack builds off the registry over /v1: each action a
// command of run, with help from its q.Doc and each field's doc tag.
// [[spec/design_input/the-index-holds-the-model#the-registry-builds-each-surface]]
package main

import "io"

// Runs one command of the tree against the /v1 base, and answers its exit code. [[spec/tickets/the-quack-cli-gets-generated]]
func cli(out, errs io.Writer, base string, argv []string) int {
	return 2
}
