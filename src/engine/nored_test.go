package main

import (
	"strings"
	"testing"
)

// ONE TREE, TWO HANDS, AND A PACKAGE THAT WILL NOT COMPILE.
//
// The method asks every worker for a red before the change, and in Go the
// package is the compilation unit. So one half-finished change takes the build
// down for every hand beside it, and each of them is handed a failure that says
// nothing about its own work.
//
// A RED IS AN ASSERTION THAT FAILED. This drives the two halves of that rule
// through the test door: a build failure comes back as a build and never as a
// test that failed, and the answer names the token whose write the build error
// names rather than the hand that only read it.
func TestABuildFailureIsNoRedAndNamesTheHand(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	mine := aTokenTaking(t, r, head)
	theirs := aTokenTaking(t, r, head)
	wrote(t, r, mine, "mine.md", "# my own work, which compiles nothing\n")
	// THE OTHER HAND PLANTS AN IDENTIFIER NOTHING DEFINES, in the package the
	// test this one proposes is compiled with.
	wrote(t, r, theirs, "half.go", "package lib\n\nfunc C() int {\n\treturn halfWritten()\n}\n")

	got, err := TestTheDelta(t.Context(), r, db, mine, []string{"TestA"}, true, "worker-mine")
	if err != nil {
		t.Fatal(err)
	}
	if got.OK {
		t.Fatalf("a package that will not compile answered ok: %+v", got.Ran)
	}
	if len(got.Ran) != 1 {
		t.Fatalf("one proposed test over a broken package answered %d runs: %+v", len(got.Ran), got.Ran)
	}
	said := got.Ran[0].Said
	if got.Ran[0].Kind != "build" {
		t.Errorf("a build failure came back as kind %q, so a reader takes it for a test that failed",
			got.Ran[0].Kind)
	}
	if !strings.Contains(said, "DID NOT COMPILE") || !strings.Contains(said, "NO RED") {
		t.Errorf("the answer does not refuse it as a red: %s", said)
	}
	if !strings.Contains(said, "half.go") || !strings.Contains(said, theirs) {
		t.Errorf("the answer does not name the hand whose file the build error names: %s", said)
	}
	if strings.Contains(said, mine) {
		t.Errorf("the answer puts a build failure on the hand that only ran the tests: %s", said)
	}
}

// AND EVERY TEST CHOSEN OVER THAT PACKAGE IS TOLD THE SAME THING.
//
// The build runs once a folder and its failure is remembered as an empty
// binary, so the second test chosen there was answered with no compiler
// output at all. filesBuildNamed found no file in an empty answer, and the
// refusal said the record could not say whose write it was.
//
// SO THE ANSWER DEPENDED ON WHICH TEST CAME FIRST. One hand reading the
// second answer is told nothing, and goes looking through a tree many hands
// share for a break that is already named in the answer above it.
//
// This drives two tests over one broken package and asks both for the file
// and the token, because the rule is about the package and not about the
// first test to reach it.
func TestEveryTestOverABrokenPackageNamesTheHand(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	mine := aTokenTaking(t, r, head)
	theirs := aTokenTaking(t, r, head)
	wrote(t, r, mine, "mine.md", "# my own work, which compiles nothing\n")
	// THE OTHER HAND PLANTS AN IDENTIFIER NOTHING DEFINES, in the package both
	// proposed tests are compiled with.
	wrote(t, r, theirs, "half.go", "package lib\n\nfunc C() int {\n\treturn halfWritten()\n}\n")

	got, err := TestTheDelta(t.Context(), r, db, mine, []string{"TestA", "TestB"}, true, "worker-mine")
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Ran) != 2 {
		t.Fatalf("two tests proposed over one broken package answered %d runs: %+v", len(got.Ran), got.Ran)
	}
	for _, x := range got.Ran {
		if x.Kind != "build" {
			t.Errorf("%s came back as kind %q, so a reader takes it for a test that failed", x.ID, x.Kind)
		}
		if !strings.Contains(x.Said, "half.go") {
			t.Errorf("%s does not name the file the build error names: %s", x.ID, x.Said)
		}
		if !strings.Contains(x.Said, theirs) {
			t.Errorf("%s does not name the hand whose write broke the build: %s", x.ID, x.Said)
		}
	}
}
