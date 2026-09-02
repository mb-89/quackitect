package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TOO BIG TO CONVERGE IS A PROPERTY THE GATE CAN COUNT.
//
// The record holds wk-24be1c06ae, which carried fourteen criteria and ate ten
// rejection rounds, because a token that big always has some criterion left for
// the next reviewer to reject. So the gate counts, at draft submission, before
// any reviewer spends anything.

// A NINTH CRITERION REFUSES THE DRAFT, and the refusal names the count, the
// ceiling and the remedy in one word.
func TestANinthCriterionRefusesTheDraft(t *testing.T) {
	r := lane(t)
	tok := aDraftOf(t, r, 9)
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a draft of nine criteria reached a reviewer: %s", a.Pull)
	}
	said := a.Findings[0].Wrong
	for _, want := range []string{"9", "8", "split"} {
		if !strings.Contains(said, want) {
			t.Errorf("the refusal does not say %q: %s", want, said)
		}
	}
}

// EIGHT GO THROUGH, which is the half that stops the ceiling being a wall.
func TestEightCriteriaGoThrough(t *testing.T) {
	r := lane(t)
	tok := aDraftOf(t, r, 8)
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a draft at the ceiling was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != SpecSubmitted {
		t.Fatalf("a draft at the ceiling is %s rather than waiting for a reviewer", back.Status)
	}
}

// THE CEILING MOVES WITH THE CONFIG, which is what the word config means and
// what a literal in the gate cannot do.
//
// THE FIXTURE'S CEILING IS THREE, WHICH THE FLOOR DOES NOT DECLARE. A test that
// drives the gate at eight is a test of one number, and it cannot tell a
// parameter from a constant: both halves would read the same on the day the work
// lands. Both directions, because a gate that refuses everything moves with the
// config too.
func TestTheCeilingMovesWithTheConfig(t *testing.T) {
	r := aTreeDeclaringTheCeiling(t)
	if _, err := SetValue(r, "limits.criteria_ceiling", 3); err != nil {
		t.Fatal(err)
	}
	if got := LoadConfig(r).CriteriaCeiling; got != 3 {
		t.Fatalf("the fixture wrote three and the config answers %d, so nothing below "+
			"can be about the wire", got)
	}

	over := aDraftOf(t, r, 4)
	a, _ := settle(r, "main", RoleWorker, Payload{ID: over.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("four criteria went through a ceiling of three, so the gate reads a "+
			"number of its own rather than the config: %s", a.Pull)
	}
	if said := a.Findings[0].Wrong; !strings.Contains(said, "3") {
		t.Errorf("the refusal does not name the ceiling the person set: %s", said)
	}

	at := aDraftOf(t, r, 3)
	if a, _ := settle(r, "main", RoleWorker, Payload{ID: at.ID}); a.Pull == AnswerRefused {
		t.Fatalf("a draft at the ceiling the person set was refused: %+v", a.Findings)
	}
}

// ---- the fixtures ----

// aDraftOf is one token waiting to be drafted, carrying n command criteria.
// Every command is red, because a criterion that passes before the work cannot
// report on the work and the same gate refuses one that does.
func aDraftOf(t *testing.T, r Roots, n int) Token {
	t.Helper()
	var says []Criterion
	for i := 0; i < n; i++ {
		says = append(says, Criterion{
			Says: fmt.Sprintf("the thing is done, part %d", i+1),
			Runs: "exit 1",
		})
	}
	tok := mint(t, r, Token{Title: "say what done means", Status: SpecOpen,
		Detail: "a problem worth stating", Criteria: says})
	if a := next(r, "main", RoleWorker); a.Pull != AnswerWork {
		t.Fatalf("the drafter was handed nothing: %+v", a)
	}
	return tok
}

// aTreeDeclaringTheCeiling is a method root with a parameter tree of its own.
// The fixture declares its own tree, the way project_test.go does, so the test
// exercises the mechanism rather than the product's list.
func aTreeDeclaringTheCeiling(t *testing.T) Roots {
	t.Helper()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	if err := os.MkdirAll(filepath.Join(r.Method, "util"), 0o755); err != nil {
		t.Fatal(err)
	}
	// The icon table, because a tree is read through it.
	if err := os.WriteFile(filepath.Join(r.Method, "util", "icons.json"),
		[]byte(`{"$comment": "the fixture's own"}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(r.Method, "util", "parameters.json"), []byte(`{
	  "name":"quackitect","type":"group","children":[
	    {"name":"limits","type":"group","shown":true,"children":[
	      {"name":"criteria_ceiling","type":"int","default":8,"min":1,"max":8,"narrow":"smaller"}]}]}`),
		0o644); err != nil {
		t.Fatal(err)
	}
	// A tree that will not read leaves the floor standing, and then nothing
	// here is about the config at all.
	if got := LoadConfig(r).CriteriaCeiling; got != TheFloor().CriteriaCeiling {
		t.Fatalf("the fixture's tree does not read: the ceiling came back %d", got)
	}
	return r
}
