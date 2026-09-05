package main

import (
	"os"
	"quackitect/engine/internal/frontmatter"
	"testing"
)

// ONE RULE SAYS WHEN A TOKEN MAY COME OFF THE DISK, AND BOTH DOORS ASK IT.
//
// SaveToken archived on the disposition and the closing state together, and
// the sweep on the disposition alone. A token that has ended where its process
// still declares a step is the shape the closing state was written to keep on
// the disk, and the sweep took it off anyway.
func TestTheSweepLeavesATokenItsProcessCanStillMove(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a verdict still owed")

	// THE SHAPE, WRITTEN STRAIGHT TO THE DISK. SaveToken settles it, so the
	// file is written the way a hand edit or an older engine left it: ended,
	// and standing at done, which the verdict still leaves.
	tok.Status = "done"
	tok.Disposition = Disposition("done")
	text := frontmatter.Write(tok.front(), frontOrder, describeFields(narrowedSchema(r, tok))) + "\n" + tok.body()
	if err := os.WriteFile(noteAt(r, tok.ID), []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	r.forget()
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !back.Ended() || ClosingState(r, back) {
		t.Fatalf("the fixture is not the shape this test is about: status %q, disposition %q", back.Status, back.Disposition)
	}

	if _, _, err := SweepClosed(r); err != nil {
		t.Fatalf("the sweep: %v", err)
	}
	if noteAt(r, tok.ID) == "" {
		t.Fatal("the sweep took a token off the disk while its process still declares a step from where it stands")
	}
}
