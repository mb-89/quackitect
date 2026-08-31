package main

import "fmt"

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
func Abort(r Roots, id, why, by string) (Token, error) {
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
	if t.Status.Ended() {
		return t, fmt.Errorf("%s already ended as %s, with disposition %q. "+
			"An ending is not written over", t.ID, t.Status, t.Disposition)
	}
	// WHERE IT CAME FROM IS WRITTEN BEFORE IT IS OVERWRITTEN. Aborted on its
	// own says a token stopped without saying what it stopped in the middle of.
	from := t.Status
	t.Status, t.Holder = Aborted, ""
	t.AbortedFrom = from
	t.Disposition, t.Reason = Dropped, why
	if err := SaveToken(r, t); err != nil {
		return t, err
	}
	inSession(r, "work", by, t.ID+" aborted from "+string(from)+": "+why, Yes(),
		map[string]any{"id": t.ID, "from": string(from), "reason": why})
	return t, nil
}
