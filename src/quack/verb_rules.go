// The rules verb: the mechanical rules Vale holds, each with its message.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import "io"

// [[spec/tickets/config-verbs-port-to-go]]
func rulesVerb(root func() (string, error)) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return exitFailed }
}
