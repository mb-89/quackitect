package main

import "testing"

// THE STATUS FOLLOWS THE DISPOSITION, BECAUSE ENDED READS THE DISPOSITION.
//
// Three tokens in the tree read noted while carrying dropped. Ended is
// Disposition != "", so the engine held them ended while the file, the editor
// and every view keyed on status read noted. Only the engine knew.
//
// AND NO VERB COULD REPAIR IT. A submission against one was refused as already
// closed, and writeField refuses a status outright as the pull's to write. So
// the two answers stayed apart and nothing but a hand edit could bring them
// together.
//
// AND THE ARCHIVE NEVER TOOK THEM EITHER. ClosingState asks whether any
// activity leaves the state. decide leaves noted, so a token stranded there had
// ended and could never be filed, which is why three of them were still on the
// disk to be found.
func TestTheStatusFollowsTheDisposition(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	// A NOTE THAT ENDED WITHOUT ITS STATUS MOVING, which is the shape found in
	// the tree. The disposition is written and the status is left where it was.
	note, err := Mint(r, Token{Process: "note", Title: "a note to decide", Status: "noted",
		Detail: "something worth writing down, and not yet decided"})
	if err != nil {
		t.Fatal(err)
	}
	if got := string(note.Status); got != "noted" {
		t.Fatalf("a note is minted at %q, so this test is not about the shape it means to be about", got)
	}
	note.Disposition = Disposition("dropped")
	note.Reason = "it is not a problem after all"
	saveSettled(t, r, note)

	back, err := LoadToken(r, note.ID)
	if err != nil {
		t.Fatal(err)
	}
	// THE FILE SAYS WHAT THE ENGINE SAYS. This is the whole defect: a reader of
	// the note and a reader of Ended gave different answers about one token.
	if got := string(back.Status); got != "closed" {
		t.Fatalf("the note carries a disposition and its status reads %q, so the file and the engine still disagree", got)
	}
	if !back.Ended() {
		t.Fatal("the disposition was lost in the settling, so the status followed nothing")
	}
	// AND THE ARCHIVE CAN TAKE IT NOW. A token that has ended and stands where
	// its process can move it no further is one the record can file.
	if !ClosingState(r, back) {
		t.Fatal("it has ended and its process still has a step from where it stands, so nothing can ever file it")
	}

	// AND A TOKEN MID-PROCESS IS NOT TOUCHED. The rule is about a token that has
	// ended, and a standard token at done owes a verdict and has not ended.
	mid := mintStandard(t, r, "a verdict owed")
	mid.Status = "done"
	saveSettled(t, r, mid)
	still, err := LoadToken(r, mid.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got := string(still.Status); got != "done" {
		t.Fatalf("a token owing a verdict was moved to %q, so the rule reaches past the tokens that have ended", got)
	}
}

// saveSettled writes the token and lets an archive that could not be written
// stand. The file is written either way, and this test is about the file.
func saveSettled(t *testing.T, r Roots, tok Token) {
	t.Helper()
	if err := SaveToken(r, tok); err != nil && !TheCloseStood(err) {
		t.Fatal(err)
	}
}
