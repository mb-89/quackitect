// The push verb: pushes the branch you stand on, once the check answers green
// on the commit you stand on.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import "io"

// [[spec/tickets/landing-verbs-port-to-go]]
func pushVerb(d landingDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return -1 }
}
