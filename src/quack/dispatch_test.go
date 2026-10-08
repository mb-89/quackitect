// The dispatch verb runs the dry plan over its doors.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"errors"
	"strings"
	"testing"

	"quackitect/src/branches"
)

// The verb hands every word past its name to the package, over the send door it holds. [[spec/tickets/dispatch-verbs-port-to-go]]
func TestDispatchVerbRunsTheDryPlanOverTheDoors(t *testing.T) {
	t.Parallel()
	root := func() (string, error) { return t.TempDir(), nil }
	v1 := func() (string, error) { return "", nil }
	sent := false
	send := func(string, branches.Request) (branches.Reply, error) {
		sent = true
		return branches.Reply{}, errors.New("no network")
	}
	var out, errs bytes.Buffer
	if code := dispatchVerb(root, v1, send)([]string{"dispatch", "--dry"}, false, &out, &errs); code != 0 {
		t.Fatalf("the dry run answers %d: %s", code, errs.String())
	}
	if !strings.Contains(out.String(), "ready groups, one worker each:") || sent {
		t.Fatalf("the dry run prints %q, and sends %v", out.String(), sent)
	}
}
