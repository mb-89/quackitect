package main

import (
	"os"
	"path/filepath"
	"testing"
)

// AN ABORT IS AN ENDING, AND AN ENDING READS CLOSED. The abort wrote the
// disposition and the reason but left the status where it stood, so an
// aborted token showed as open in every list and query.

// aTreeThatClosesAt writes a process whose terminal state is named closed,
// the way the shipped processes name theirs.
func aTreeThatClosesAt(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: task
description: one step the queue hands out
traced: false
sections:
  required:
    - detail
states:
  - name: open
    description: waiting
  - name: closed
    description: finished
activities:
  - name: mint
    does: write it down
    to: open
  - name: do
    does: do it
    from: open
    to: closed
dispositions:
  - name: done
    description: it was done
  - name: dropped
    description: it was not
    reason: required
`
	if err := os.WriteFile(filepath.Join(dir, "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

func TestAnAbortedTokenReadsClosed(t *testing.T) {
	t.Parallel()
	r := aTreeThatClosesAt(t)
	tok, err := Mint(r, Token{Process: "task", Title: "soon aborted", Status: "open",
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
	tok, err := Mint(r, Token{Process: "task", Title: "soon aborted", Status: "open",
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
