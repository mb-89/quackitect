package main

import (
	"fmt"
	"strings"
)

// AN ABORT COMES OFF ANY STATE AND CARRIES WHY.
//
// The owner's words: the same way work tokens can be closed today, deferred or
// closed for other reasons because it is obsolete or a duplicate, and that can
// be done from every state with a reason.
//
// IT IS ONE ENDING AND NOT A FOURTH EXIT. dropped is the disposition that
// already refuses to be without a reason, and aborted is where a dropped token
// stops. So the two terminal states are imp_done and aborted, and what became
// of a token stays on the disposition where it always was.
//
// DEFERRING IS NOT AN ENDING. A deferred token goes back to backlogged, where it
// is visible and nobody is doing it, which is what backlogged already means.

// Abort ends a token, from wherever it stands, with the reason it is ending.
// THE ARGUMENTS ARE NAMED IN THE ORDER THE CALLER HAS THEM, and they were not.
//
// MEASURED. The signature read (id, why, by) and the one caller passed
// (id, by, why), so an abort wrote the actor's name into the reason: a token
// dropped with a paragraph explaining why recorded reason: person. Two strings
// side by side, and nothing could tell them apart.
func Abort(r Roots, id, by, why string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	if trimmed(why) == "" {
		return t, fmt.Errorf(
			"an abort with no reason is a token somebody re-mints six weeks later. " +
				"Say why: obsolete, a duplicate of something, or whatever it is")
	}
	// A TOKEN THAT HAS ALREADY ENDED IS NOT ENDED AGAIN. Doing it twice would
	// write over what the first ending said, and the first one is the true one.
	if t.Ended() {
		return t, fmt.Errorf("%s already ended as %s, with disposition %q. "+
			"An ending is not written over", t.ID, t.Status, t.Disposition)
	}
	// A SCOPE IS NOT LEFT WHILE ANYTHING IN IT IS OPEN, and an abort is a way
	// of leaving. The sub-tokens end first, each with its own reason, or they
	// are moved out from under this one.
	if open := OpenSubTokens(r, t.ID); len(open) > 0 {
		return t, fmt.Errorf("%s holds %d open sub-token(s): %s. A scope cannot close while "+
			"a sub-token is open, so end those first", t.ID, len(open), strings.Join(open, ", "))
	}
	// WHERE IT CAME FROM IS IN THE LOG, NOT ON THE TOKEN. The status it stood
	// in is what the record holds, and a second copy on the note is history in
	// the current surface.
	from := t.Status
	t.Holder = ""
	t.Disposition, t.Reason = Dropped, why
	t = closeStretch(r, t) // what was done before the drop is still a change somebody may read
	if err := SaveToken(r, t); err != nil {
		return t, err
	}
	inSession(r, "work", by, t.ID+" aborted from "+string(from)+": "+why, Yes(),
		map[string]any{"id": t.ID, "from": string(from), "reason": why})
	return t, nil
}
