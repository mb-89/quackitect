package main

import (
	"testing"
)

// AN ABORT IS AN ENDING, AND AN ENDING READS CLOSED. The abort wrote the
// disposition and the reason but left the status where it stood, so an
// aborted token showed as open in every list and query.

func TestAnAbortedTokenReadsClosed(t *testing.T) {
	t.Parallel()
	r := aTreeThatClosesAt(t)
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "task", Title: "soon aborted", Status: "open",
		Detail: "minted by the test"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Abort(r, Aborting{ID: tok.ID, By: "person", Why: "obsolete"}); err != nil {
		t.Fatal(err)
	}
	got, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != "closed" {
		t.Fatalf("an aborted token reads status %q, not closed", got.Status)
	}
	if got.Disposition != Dropped || got.Reason == "" {
		t.Fatalf("the ending lost its disposition or reason: %q %q", got.Disposition, got.Reason)
	}
}

// TWO STRINGS SIDE BY SIDE COULD SWAP, AND ONCE THEY DID. The caller passed
// (id, by, why) into (id, why, by) and every abort recorded reason: person.
// A named struct makes the mistake unwritable.
func TestAnAbortKeepsItsReason(t *testing.T) {
	t.Parallel()
	r := aTreeThatClosesAt(t)
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "task", Title: "soon aborted", Status: "open",
		Detail: "minted by the test"})
	if err != nil {
		t.Fatal(err)
	}
	const why = "obsolete: superseded by a later ask"
	if _, err := Abort(r, Aborting{ID: tok.ID, By: "person", Why: why}); err != nil {
		t.Fatal(err)
	}
	got, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Reason != why {
		t.Fatalf("the abort recorded reason %q, not the why it was given", got.Reason)
	}
}
