package main

import "testing"

// AND THE CALL se_work MAKES CARRIES THE FLAG A HELD AGENT IS TOLD TO SET.
//
// The refusal over a box full of notes names three answers, and the third is
// the note nobody here can decide: mint it with your best attempt and set
// needs_human, so a person reads it first. The door offers the field. A door
// that offers a field while the call built behind it drops it is the half with
// no output of its own, which is the shape se_claim was in over take, and
// nothing read this call at all.
func TestTheLaneCallCarriesNeedsHuman(t *testing.T) {
	t.Parallel()
	flagged := workArgv(workArgs{Title: "one a person reads", Actor: "worker-one", NeedsHuman: true})
	if !carries(flagged, "--needs-human") {
		t.Errorf("the call drops the needs_human the door offers: %v", flagged)
	}
	if !carries(flagged, "--title") || !carries(flagged, "one a person reads") {
		t.Errorf("the call does not say what the token is: %v", flagged)
	}

	// AND NOTHING ELSE GAINS IT. A token nobody flagged must not land where a
	// person is asked to read it first, or the flag says nothing.
	plain := workArgv(workArgs{Title: "an ordinary token", Actor: "worker-one"})
	if carries(plain, "--needs-human") {
		t.Errorf("a mint that asked for no flag flags the token anyway: %v", plain)
	}
}
