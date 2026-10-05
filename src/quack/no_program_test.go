// A word nothing registers reaches no program: the node module names it as
// no verb, and starts nothing.
// [[spec/tickets/program-of-drops-node]]
package main

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestTheNodeModuleRefusesAWordNothingRegisters(t *testing.T) {
	_, err := nodeAccept(t.TempDir())(q.Request{Args: []any{"registry", "unclaimed"}})
	if err == nil || !strings.Contains(err.Error(), "there is no verb called registry unclaimed") {
		t.Fatalf("the node module answers %v, and wants no verb named", err)
	}
}
