// The record rows the cases write.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it declares the unexported entryRow the in-package done and desk tests use

import "quackitect/src/front"

// A record row closing a step: the step, its hash before and its hash after. [[spec/tickets/work-verbs-port-to-go]]
func entryRow(step, before, after string) front.Ordered {
	return front.Ordered{{Key: "step", Value: step}, {Key: "hand", Value: "box"}, {Key: "hash_before", Value: before}, {Key: "hash_after", Value: after}}
}
