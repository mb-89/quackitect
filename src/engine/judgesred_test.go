package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE ENGINE JUDGES WHY A RED IS RED. A crash and a dead pattern assert
// nothing about the work, so the gate that already refuses a green refuses
// them too, naming the criterion and the cause, before a reviewer spends
// anything. IT ASKS THE GATE RATHER THAN READING THE CLASSIFIER.

// aDraftWith sends one draft carrying the given criteria to the gate and
// answers the refusal, or nothing where it went through.
func aDraftWith(t *testing.T, crits []Criterion) (Answer, Token) {
	t.Helper()
	r := lane(t)
	tok := mint(t, r, Token{Title: "the probe", Assignee: "main", Status: SpecOpen,
		Detail: "a problem worth stating", Criteria: crits})
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID})
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	return a, back
}

// EACH OF THE THREE CRASH CAUSES IN ITS OWN FIXTURE: rg handed a bad pattern
// so it exits two, a go command over a package that does not compile, and a
// go test that panics. The last two exit the way a failing assertion exits,
// so the classifier reads the output for build failed and for panic, and
// this check fails naming which cause slipped through.
func TestACrashRedRefusesTheDraft(t *testing.T) {
	broken := t.TempDir()
	must(t, os.WriteFile(filepath.Join(broken, "go.mod"), []byte("module broken\n\ngo 1.21\n"), 0o644))
	must(t, os.WriteFile(filepath.Join(broken, "x.go"), []byte("package broken\n\nfunc oops( {\n"), 0o644))
	panics := t.TempDir()
	must(t, os.WriteFile(filepath.Join(panics, "go.mod"), []byte("module panics\n\ngo 1.21\n"), 0o644))
	must(t, os.WriteFile(filepath.Join(panics, "x_test.go"),
		[]byte("package panics\n\nimport \"testing\"\n\nfunc TestBoom(t *testing.T) { panic(\"boom\") }\n"), 0o644))

	cases := map[string]string{
		"rg exits two":  `rg -q "[unclosed" go.mod`,
		"build failed":  fmt.Sprintf("go test -C %s .", broken),
		"a test panics": fmt.Sprintf("go test -C %s -count=1 .", panics),
	}
	for cause, runs := range cases {
		a, back := aDraftWith(t, []Criterion{{Says: "it holds", Runs: runs}})
		if a.Pull != AnswerRefused || len(a.Findings) == 0 {
			t.Fatalf("%s slipped through the gate: %s", cause, a.Pull)
		}
		if !strings.Contains(a.Findings[0].Wrong, "red by crash") {
			t.Fatalf("%s was refused for something else: %s", cause, a.Findings[0].Wrong)
		}
		if back.Status != SpecOpen && back.Status != SpecInWork {
			t.Fatalf("%s moved the draft anyway: %s", cause, back.Status)
		}
	}
}

// A MUST-BE-GONE SEARCH WHOSE FINDING HALF MATCHES NOTHING TODAY IS REFUSED
// naming the pattern. The canonical spelling is judged; the halves reordered
// are not, and a presence guard is not, which is the narrowing driven rather
// than declared.
func TestADeadPatternRefusesTheDraft(t *testing.T) {
	dead := `rg -q "a sentence nowhere in this file" go.mod && exit 1 || rg -q "module" go.mod`
	a, _ := aDraftWith(t, []Criterion{{Says: "the sentence is gone", Runs: dead}})
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "dead pattern") {
		t.Fatalf("a dead pattern reached review: %s %+v", a.Pull, a.Findings)
	}

	// THE VARIANT SPELLING IS UNJUDGED BY THE PROBE: halves reordered, still
	// red, and the refusal must not call it a dead pattern.
	variant := `rg -q "module" go.mod || exit 1 && rg -q "a sentence nowhere in this file" go.mod`
	a, back := aDraftWith(t, []Criterion{{Says: "the sentence is gone", Runs: variant}})
	if a.Pull == AnswerRefused && len(a.Findings) > 0 &&
		strings.Contains(a.Findings[0].Wrong, "dead pattern") {
		t.Fatalf("the probe judged a variant spelling: %s", a.Findings[0].Wrong)
	}
	_ = back

	// AND A PRESENCE GUARD IS UNJUDGED, the shape this tree carries in
	// quantity: rg -q joined by && with no exit 1 branch and no quoted
	// pattern. Red today because the test is absent, and it reaches review.
	guard := "rg -q func.TestNothingOfThisName src/engine && go test -C src/engine -run TestNothingOfThisName$ ."
	a, back = aDraftWith(t, []Criterion{{Says: "the test passes", Runs: guard}})
	if a.Pull == AnswerRefused {
		t.Fatalf("a presence guard was refused: %+v", a.Findings)
	}
	if back.Status != SpecSubmitted {
		t.Fatalf("the presence guard draft did not reach review: %s", back.Status)
	}
}

// THE DOOR STAYS OPEN, which is the half that stops this gate being a wall.
// Assertion reds go through: a failing test, a clean not-found, a check the
// work will create answering Cannot find module, a check that throws the way
// checks fail. And a criterion carrying its watched red is skipped by all
// three judgements.
func TestAnAssertionRedGoesThrough(t *testing.T) {
	throwing := filepath.Join(t.TempDir(), "throws.mjs")
	must(t, os.WriteFile(throwing, []byte("throw new Error('the check failed the way checks fail')\n"), 0o644))

	crits := []Criterion{
		{Says: "a clean not-found", Runs: `rg -q "a sentence nowhere in this file" go.mod`},
		{Says: "a failing assertion", Runs: "exit 1"},
		{Says: "a check nothing has written", Runs: "node util/checks/not-written-yet.mjs"},
		{Says: "a check that throws mid-run", Runs: "node " + throwing},
		{Says: "a watched red, skipped by all three", Runs: `rg -q "[unclosed" go.mod`,
			Without: "the thing itself", Red: "it exited two, watched"},
	}
	a, back := aDraftWith(t, crits)
	if a.Pull == AnswerRefused {
		t.Fatalf("an assertion red was refused: %+v", a.Findings)
	}
	if back.Status != SpecSubmitted {
		t.Fatalf("the draft did not reach review: %s", back.Status)
	}
}

func must(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}
