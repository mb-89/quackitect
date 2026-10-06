// The doors verb in Go: every door under src/doors against the contract test
// that holds it.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

func doorsRan(root string) (int, string, string) {
	var out, errs strings.Builder
	code := doorsVerb(func() (string, error) { return root, nil })([]string{"doors"}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestDoorsCountsWhereEveryDoorHoldsATest(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/doors/disk.js", "")
	seedFile(t, root, "src/doors/fake/disk.js", "")
	seedFile(t, root, "test/contract/disk.test.js", "")
	if code, out, _ := doorsRan(root); code != 0 || out != "1 doors, and a contract test holds each one.\n" {
		t.Fatalf("doors answers %d and %q", code, out)
	}
}

func TestDoorsNamesADoorWithNoContract(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/doors/disk.js", "")
	seedFile(t, root, "src/doors/git.js", "")
	seedFile(t, root, "test/contract/disk.test.js", "")
	code, _, errs := doorsRan(root)
	want := "src/doors/git.js has no test/contract/git.test.js.\nA door with no contract test lets its fake drift. Write one.\n"
	if code != exitFailed || errs != want {
		t.Fatalf("doors answers %d and %q, and wants %q", code, errs, want)
	}
}
