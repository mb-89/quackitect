package main

import (
	"os"

	"testing"
)

// THE TOKEN FOLDERS ARE READ ONCE PER PROCESS.
//
// A pull asked for every token several times and once more for every token
// it looked at, which is the shape v3 had. Roots that carry a snapshot read
// the folder the first time anything asks and not again until this process
// writes, and a write is followed by a read of what was written.
func TestTheTokenFoldersAreReadOncePerProcess(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t).ReadOnce()
	one := mintTask(t, r, "the first", "")
	two := mintTask(t, r, "the second", "")

	if got := len(Tokens(r)); got != 2 {
		t.Fatalf("the first read answered %d tokens", got)
	}

	// THE FILE GOES AND THE ANSWER STAYS, which is what proves the folder was
	// not read again. A Roots built without a snapshot sees the change.
	if err := os.Remove(noteAt(Roots{Method: r.Method, Work: r.Work}, one.ID)); err != nil {
		t.Fatal(err)
	}
	if got := len(Tokens(r)); got != 2 {
		t.Fatalf("the folder was read again: %d tokens", got)
	}
	if _, err := LoadToken(r, one.ID); err != nil {
		t.Fatalf("one token was opened again rather than read from the snapshot: %v", err)
	}
	cold := Roots{Method: r.Method, Work: r.Work}
	if got := len(Tokens(cold)); got != 1 {
		t.Fatalf("roots with no snapshot answered %d tokens", got)
	}

	// A WRITE DROPS THE SNAPSHOT, so the next ask reads what is there now:
	// the one that was written, and not the one that went.
	two.Detail = "changed"
	if err := SaveToken(r, two); err != nil {
		t.Fatal(err)
	}
	got := Tokens(r)
	if len(got) != 1 || got[0].ID != two.ID || got[0].Detail != "changed" {
		t.Fatalf("after a write the read answered %+v", got)
	}
}
