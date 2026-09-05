package main

import (
	"runtime"
	"strings"
	"testing"
)

const thePhrase = `"the gate is built"`

// A QUOTED SCRIPT REACHES THE SHELL WHOLE.
//
// THE ASSERTION IS AN EQUALITY AND NOT A CONTAINMENT. Go's re-quoting ESCAPES
// the inner quotes rather than eating them, so the phrase comes back whole with
// the defect still in place and a Contains is green both ways.
//
// AND THE EQUALITY IS AGAINST WHAT THE SHELL IN PLAY SHOULD SAY. It was against
// the phrase still quoted, which is cmd's answer and only cmd's: cmd hands echo
// the quotes and prints them, sh eats them and prints the bare words. So this
// was red on every POSIX box the battery runs on while the runner was doing
// exactly the right thing, and the shell was blamed for obeying its own rules.
//
// THE DEFECT IS STILL CAUGHT ON BOTH, which is why this is a shell's answer and
// not a skip. Under sh a script Go re-quoted arrives as \"the gate is built\"
// and echoes the phrase WITH its quotes; verbatim it echoes the bare words.
// Under cmd it is the other way about. Each shell's two answers differ, so on
// each of them the equality is the whole test.
func TestAQuotedScriptReachesTheShellWhole(t *testing.T) {
	t.Parallel()
	r := lane(t)

	// evidenceCommand picks cmd on Windows and sh everywhere else, so the
	// answer owed here is picked the same way and cannot drift from it.
	want, shell := strings.Trim(thePhrase, `"`), "sh"
	if runtime.GOOS == "windows" {
		want, shell = thePhrase, "cmd"
	}

	said, err := runEvidence(r, "echo "+thePhrase)
	if err != nil {
		t.Fatalf("the echo would not run: %v, %s", err, said)
	}
	got := strings.TrimSpace(said)
	if got != want {
		t.Errorf("the runner answered %q where %s echoing %s says %q", got, shell, thePhrase, want)
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
