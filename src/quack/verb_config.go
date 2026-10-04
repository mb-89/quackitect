// The config verb: every key, its value, and the layer answering it, or a
// write of one key into the local layer.
// [[spec/design_output/config#the-verb-names-the-layer]]
package main

import (
	"io"
	"time"
)

// [[spec/tickets/config-verbs-port-to-go]]
func configVerb(root func() (string, error), now func() time.Time) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int { return exitFailed }
}
