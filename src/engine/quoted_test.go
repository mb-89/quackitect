package main

import (
	"strings"
	"testing"
)

const thePhrase = `"the gate is built"`

// A QUOTED SCRIPT REACHES THE SHELL WHOLE.
//
// THE ASSERTION IS AN EQUALITY AND NOT A CONTAINMENT. Go's re-quoting ESCAPES
// the inner quotes rather than eating them, so the phrase comes back whole with
// the defect still in place and a Contains is green both ways.
func TestAQuotedScriptReachesTheShellWhole(t *testing.T) {
	t.Parallel()
	r := lane(t)
	said, err := runEvidence(r, "echo "+thePhrase)
	if err != nil {
		t.Fatalf("the echo would not run: %v, %s", err, said)
	}
	got := strings.TrimSpace(said)
	if got != thePhrase {
		t.Errorf("the runner answered %q and the script echoed %q", got, thePhrase)
	}
	if strings.Contains(got, `\`) {
		t.Errorf("the answer carries a backslash, so the quotes were escaped on the way: %q", got)
	}
}

// AND AN UNQUOTED SCRIPT IS UNCHANGED, which is what stops the fix breaking
// every command already in the tree.
func TestAnUnquotedScriptIsUnchanged(t *testing.T) {
	t.Parallel()
	r := lane(t)
	if said, err := runEvidence(r, "exit 0"); err != nil {
		t.Errorf("a script that exits zero answered %v, %s", err, said)
	}
	if _, err := runEvidence(r, "exit 3"); err == nil {
		t.Error("a script that exits three answered no error")
	}
	said, err := runEvidence(r, "echo plain")
	if err != nil {
		t.Fatalf("an unquoted echo would not run: %v", err)
	}
	if strings.TrimSpace(said) != "plain" {
		t.Errorf("an unquoted echo answered %q", strings.TrimSpace(said))
	}
}
