package main

import (
	"os"
	"path/filepath"
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

// A CRITERION WITH A QUOTED PATTERN IS MET. This is the shape that refused
// wk-d898634fd3, driven through the gate the submission runs.
func TestACriterionWithAQuotedPatternIsMet(t *testing.T) {
	r := lane(t)
	held := "a phrase with spaces in it"
	if err := os.WriteFile(filepath.Join(r.Work, "held.md"), []byte(held+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	// IT CARRIES AN OBSERVATION, because a criterion nobody has watched fail is
	// reported unmet whatever its command answers, and this fixture is about
	// the command rather than about that gate.
	one := Criterion{
		Says:    "the file holds the phrase",
		Runs:    `rg -q "` + held + `" held.md`,
		Without: "the file",
		Red:     "rg found nothing",
	}
	tok := Token{Criteria: []Criterion{one}}
	if unmet := UnmetCriteria(r, tok, Payload{}); len(unmet) > 0 {
		t.Errorf("a criterion whose pattern has spaces was reported unmet:\n%s",
			strings.Join(unmet, "\n"))
	}
}

// AND AN UNQUOTED SCRIPT IS UNCHANGED, which is what stops the fix breaking
// every command already in the tree.
func TestAnUnquotedScriptIsUnchanged(t *testing.T) {
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
