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

// Aborting names what an abort carries. THE ARGUMENTS ARE NAMED FIELDS, and
// they were not.
//
// MEASURED. The signature read (id, why, by) and the one caller passed
// (id, by, why), so an abort wrote the actor's name into the reason: a token
// dropped with a paragraph explaining why recorded reason: person. Two strings
// side by side, and nothing could tell them apart. A field has a name, so the
// mistake is unwritable.
type Aborting struct {
	ID  string // the token that is ending
	By  string // who is ending it
	Why string // the reason it is ending

	// HOW IT ENDS, WHICH WAS dropped AND NOTHING ELSE. A token that turned out
	// larger and was split into others is what became describes, and the only
	// door that ends a token from wherever it stands could not write it, so a
	// split went into the record as work nobody wanted. Empty is dropped, which
	// is what every abort written before this meant.
	As Disposition

	// WHAT IT BECAME, which became names and no other ending has. They have to
	// exist, because a successor nobody can open is the vanishing the three
	// dispositions are there to prevent.
	Successors []string
}

// Abort ends a token, from wherever it stands, with the reason it is ending.
func Abort(r Roots, a Aborting) (Token, error) {
	t, err := LoadToken(r, a.ID)
	if err != nil {
		return t, err
	}
	if trimmed(a.Why) == "" {
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
	as := a.As
	if as == "" {
		as = Dropped
	}
	// THE ENDING IS THE ONE RULE, ASKED WHEREVER A TOKEN ENDS. Which endings
	// exist is the process's, which of them need a reason is the process's, and
	// that a became names successors the record holds is the engine's. A door
	// that decided any of it for itself would be a second answer.
	proc, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return t, err
	}
	if bad := theEnding(r, proc, string(as), a.Why, a.Successors); bad != nil {
		return t, fmt.Errorf("%s: %s. Give it %s", bad.Clause, bad.Wrong, bad.Satisfies)
	}
	from := t.Status
	t.Holder = ""
	t.Disposition, t.Reason = as, a.Why
	t.Successors = a.Successors
	// AN ENDING READS AS ONE. The abort wrote the disposition and left the
	// status standing, so an aborted token showed as open in every list and
	// query. It stops where the process stops.
	if end := proc.EndsAt(); end != "" {
		t.Status = Status(end)
	}
	t = closeStretch(r, t) // what was done before the drop is still a change somebody may read
	// AN ARCHIVE THE SAVE COULD NOT WRITE IS NOT A STOP THAT DID NOT HAPPEN.
	// The record carries what was left over, and the token is closed.
	if err := SaveToken(r, t); err != nil && !TheCloseStood(err) {
		return t, err
	}
	inSession(r, "work", a.By, t.ID+" aborted from "+string(from)+" as "+string(as)+": "+a.Why, Yes(),
		map[string]any{"id": t.ID, "from": string(from), "disposition": string(as),
			"successors": a.Successors, "reason": a.Why})
	return t, nil
}
