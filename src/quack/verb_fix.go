// The fix verb: the fixes a program can make, over the paths or the tree.
// [[spec/tickets/the-small-faults-land]]
package main

import "io"

// The glob Vale reads past, as OURS in src/bridge/findings.js names it. [[spec/design_output/lsp]]
const valeParked = "--glob=!{{.se,node_modules,.git,.claude/types,.claude/worktrees}/**,**/_*}"

// A tool run under a folder, writing to the streams, which answers its exit code. [[spec/tickets/config-verbs-port-to-go]]
type fixRunner func(dir string, out, errs io.Writer, argv ...string) int

// [[spec/tickets/config-verbs-port-to-go]]
func fixVerb(root func() (string, error), run fixRunner) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return exitFailed }
}
