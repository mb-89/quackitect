package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// ONE LINE THAT WILL NOT READ DOES NOT EMPTY THE CLAIMS.
//
// parseClaimLines answered nothing for the whole file the moment one line was
// not three fields, and readClaimsIn then read the commit as the old shape and
// listed its tree for notes. The ref carries the one claims file and no notes,
// so that walk found nothing and answered an empty set with no error. Every
// box reads that as nobody having claimed anything, and two boxes take one
// token with nothing anywhere saying why.
func TestOneUnreadableLineDoesNotEmptyTheClaims(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["rev-parse"] = "cafe1234"
	fed.says["show"] = "wk-one 0badc0de/worker-far 2026-09-04T06:00:00Z\n" +
		"this line is not three fields at all\n" +
		"wk-two 0badc0de/worker-near 2026-09-04T07:00:00Z\n"

	got := SyncClaims(t.Context(), r)
	for _, want := range []string{"wk-one", "wk-two"} {
		if _, held := got.Claims[want]; !held {
			t.Errorf("the claim on %s was dropped by a line beside it: %+v", want, got.Claims)
		}
	}
	// AND THE READER CAN TELL AN EMPTY REF FROM A DAMAGED ONE.
	if got.Says == "" {
		t.Error("a line that would not read was passed over in silence")
	}
	// A FILE THAT IS THERE IS THE FILE. The old shape is what a commit carrying
	// no such file is read as, and reading this one that way is what walked a
	// tree of no notes and called the ref empty.
	if fed.asked("ls-tree") {
		t.Error("a claims file that is there was read as the old shape")
	}
}

// AND A PARENT THAT WILL NOT READ AT ALL IS NOT WRITTEN OVER.
//
// writeTheClaims discarded the error from readClaimsIn, so a parent that
// answered nothing was written over with this box's claims alone, and every
// other box's live claim left the ref.
func TestAClaimsWriteOverAnUnreadableParentIsRefused(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["rev-parse"] = "cafe1234" // there is a parent
	fed.fails["show"] = "fatal: bad object"
	fed.fails["ls-tree"] = "fatal: not a tree object"

	index := filepath.Join(t.TempDir(), "claims.index")
	_, err := writeTheClaims(t.Context(), r, index, []string{"doc/work/wk-1.md"}, "a claim")
	if err == nil {
		t.Fatal("the claims were written over a parent whose own claims could not be read")
	}
	if !strings.Contains(err.Error(), "parent") {
		t.Errorf("the refusal does not say the parent would not read: %v", err)
	}
	if fed.asked("update-ref") {
		t.Error("the ref was moved onto a commit written over a parent nobody could read")
	}
}
