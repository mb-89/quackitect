package main

import "testing"

// UNCOVERED IS A SENTENCE ABOUT A MISSING TEST, and it can only be one where a
// test could have been mapped to the file at all. The reach it is read off is
// test_region, which is filled from Go coverage profiles, so no shell script
// is ever in it and naming one uncovered says nothing about the change.
//
// Both halves are here, because the gate that quiets the script would quiet
// the Go file too if it were written a shade wider.
func TestUncoveredNamesOnlyWhatCoverageCanReach(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)

	writeIn(t, dir, "helper.sh", "#!/bin/sh\necho one\n")
	writeIn(t, dir, "orphan.go", "package lib\n\nfunc Orphan() int {\n\treturn 3\n}\n")

	got, err := TestTheDelta(t.Context(), r, db, "", nil, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	named := map[string]bool{}
	for _, p := range got.Uncovered {
		named[p] = true
	}
	if named["helper.sh"] {
		t.Fatalf("a shell script is named uncovered, and no profile can ever reach one: %v", got.Uncovered)
	}
	if !named["orphan.go"] {
		t.Fatalf("a Go file no test reaches is not named uncovered: %v", got.Uncovered)
	}
}
