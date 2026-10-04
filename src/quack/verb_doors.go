// The doors verb: every door, and the contract test that holds it.
// [[spec/guidance/code/testing]]
package main

import "io"

// [[spec/tickets/config-verbs-port-to-go]]
func doorsVerb(root func() (string, error)) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return exitFailed }
}
