package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A STEP TICKED BEFORE THE TOKEN GETS THERE IS REFUSED.
//
// THE OWNER ASKED FOR IT BY NAME: every step goes in the note from the
// beginning, so a reader sees the whole process rather than the part that has
// happened, and the engine refuses if somebody checks boxes too early.
//
// THE LIVE WALK CANNOT ASK THIS. The note process has two steps and a token
// standing at its one middle state is doing the second, so there is no step
// after the one in hand to tick. A fixture with three steps is where the
// question exists.
func TestAStepTickedTooEarlyIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithThreeSteps(t)

	tok := Token{
		Process: "three", Tracked: local(), Title: "a token to walk", Status: "first",
		Detail: "walked by the test", Submission: map[string]string{},
	}
	p, err := LoadProcess(r.Method, "three")
	if err != nil {
		t.Fatalf("loading the process: %v", err)
	}
	tok.Submission = Checklists(p)
	tok, err = Mint(r, tok)
	if err != nil {
		t.Fatalf("minting: %v", err)
	}

	// STEP ONE IS ANSWERED, WHICH IS THE STEP THIS TOKEN IS ON. Standing at
	// first, the step that leaves that state is the second, so steps one and
	// two are reached and the third is not.
	tick := func(step string) {
		tok.Submission[step] = strings.ReplaceAll(tok.Submission[step], "| [ ] |", "| [x] |")
	}
	tick("step 1. one")
	tick("step 2. two")
	tick("step 3. three")

	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f == nil {
		t.Fatal("a third step ticked while the token stands at the second was taken")
	} else if !strings.Contains(f.Wrong, "step 3") {
		t.Fatalf("it was refused for something else: %s", f.Wrong)
	}

	// AND WITH THE THIRD LEFT ALONE IT IS TAKEN, so the refusal is about the
	// step being early and not about ticking at all.
	tok.Submission["step 3. three"] = Checklists(p)["step 3. three"]
	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f != nil {
		t.Fatalf("the same submission without the early tick was refused: %s", f.Wrong)
	}
}

// aTreeWithThreeSteps writes a process of three steps and two of the files
// every token needs, in a tree of its own.
func aTreeWithThreeSteps(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("making %s: %v", dir, err)
	}
	const proc = `name: three
description: three steps, so there is a step after the one in hand
sections:
  required:
    - detail
  optional:
    - "evidence: "
states:
  - name: first
    description: after the first step
  - name: second
    description: after the second
  - name: third
    description: after the third
activities:
  - name: one
    does: the first thing
    to: first
    criteria:
      - says: the first thing was done
  - name: two
    does: the second thing
    from: first
    to: second
    criteria:
      - says: the second thing was done
  - name: three
    does: the third thing
    from: second
    to: third
    criteria:
      - says: the third thing was done
dispositions:
  - name: done
    description: it was done
`
	path := filepath.Join(dir, "three.process.yaml")
	if err := os.WriteFile(path, []byte(proc), 0o644); err != nil {
		t.Fatalf("writing %s: %v", path, err)
	}
	return r
}
