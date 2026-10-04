// The standing verb: what level zero hands the agent every session.
// [[spec/design_output/level0#the-standing-layer]]
package main

import "io"

// [[spec/tickets/config-verbs-port-to-go]]
func standingVerb(root func() (string, error), env func(string) string) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return exitFailed }
}
