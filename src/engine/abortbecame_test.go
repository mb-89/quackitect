package main

import (
	"bytes"
	"context"
	"strings"
	"testing"
)

// A SPLIT ENDS AS became, AND THE DOOR THAT ENDS A TOKEN WROTE dropped WHATEVER
// HAD HAPPENED.
//
// The processes declare became, "it turned out larger, and the successors carry
// it", and nothing could write it but a verdict. A token split into two others
// could only be ended as dropped, "it is not wanted after all", so the record
// could not tell work abandoned from work carried on by somebody else.
func TestAbortCarriesBecame(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	one := mintStandard(t, r, "the first half")
	two := mintStandard(t, r, "the second half")
	split := mintStandard(t, r, "two refactors in one")

	// BECAME NAMES WHAT THE WORK BECAME, and the ids stay on the token.
	if code, said := theWorkVerb(t, r, "--abort", split.ID, "--why", "two refactors in two packages",
		"--disposition", "became", "--successors", one.ID+","+two.ID, "--by", "person"); code != 0 {
		t.Fatalf("the abort was refused: %s", said)
	}
	back, err := LoadToken(r, split.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Disposition != Became {
		t.Errorf("%s ended as %q, and it became two tokens", back.ID, back.Disposition)
	}
	if len(back.Successors) != 2 || back.Successors[0] != one.ID || back.Successors[1] != two.ID {
		t.Errorf("the token names successors %v, and it became %s and %s", back.Successors, one.ID, two.ID)
	}
	if !back.Ended() {
		t.Errorf("%s is not ended, and an abort ends a token", back.ID)
	}

	// AND A became THAT NAMES NOTHING IS REFUSED, because a split nobody can
	// follow is the vanishing the three dispositions exist to prevent.
	alone := mintStandard(t, r, "became names nothing")
	code, said := theWorkVerb(t, r, "--abort", alone.ID, "--why", "it turned out larger",
		"--disposition", "became", "--by", "person")
	if code == 0 {
		t.Fatal("became with no successor was allowed, so the record can carry a split nobody can follow")
	}
	if !strings.Contains(said, "successor") {
		t.Errorf("the refusal does not say what is missing: %s", said)
	}
	if stood, err := LoadToken(r, alone.ID); err == nil && stood.Ended() {
		t.Errorf("%s was ended by an abort that was refused", alone.ID)
	}

	// AND AN ABORT THAT SAYS NOTHING ABOUT THE ENDING IS STILL A DROP, which is
	// what every abort written so far means.
	dropped := mintStandard(t, r, "work nobody wants")
	if code, said := theWorkVerb(t, r, "--abort", dropped.ID, "--why", "it is obsolete",
		"--by", "person"); code != 0 {
		t.Fatalf("the plain abort was refused: %s", said)
	}
	if stood, err := LoadToken(r, dropped.ID); err != nil {
		t.Fatal(err)
	} else if stood.Disposition != Dropped {
		t.Errorf("an abort naming no ending wrote %q, and it has always written dropped", stood.Disposition)
	}
}

// theWorkVerb runs se work in this process and answers its code and what it
// said, on either stream, because a refusal is a reason and an answer is JSON.
func theWorkVerb(t *testing.T, r Roots, args ...string) (int, string) {
	t.Helper()
	var out, said bytes.Buffer
	c := &call{ctx: context.Background(), roots: r, args: args, out: &out, err: &said}
	return runWork(c), said.String() + out.String()
}
