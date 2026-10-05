// A word nothing registers reaches no program: the node module names it as
// no verb, and starts nothing.
// [[spec/tickets/program-of-drops-node]]
package main

import (
	"io"
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestTheRoadRefusesAWordNothingRegistersThroughTheUsageDoor(t *testing.T) {
	var out, errs strings.Builder
	argv := []string{"unclaimed"}
	doors := verbDoors{old: usageDoor(argv, &errs), twins: map[string]twin{}, log: func(map[string]any) error { return nil }, out: &out, errs: io.Discard}
	if code := verbs(doors, argv); code != exitUsage || !strings.Contains(errs.String(), "there is no verb called unclaimed") {
		t.Fatalf("the road answers %d, %q", code, errs.String())
	}
}

func TestTheNodeModuleRefusesAWordNothingRegisters(t *testing.T) {
	_, err := nodeAccept(t.TempDir())(q.Request{Args: []any{"registry", "unclaimed"}})
	if err == nil || !strings.Contains(err.Error(), "there is no verb called registry unclaimed") {
		t.Fatalf("the node module answers %v, and wants no verb named", err)
	}
}
