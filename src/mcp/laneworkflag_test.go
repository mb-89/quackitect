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
	for _, c := range []struct {
		name  string
		args  workArgs
		flags bool
	}{
		{"a token a person reads first", workArgs{Title: "one a person reads", Actor: "worker-one", NeedsHuman: true}, true},

		// AND NOTHING ELSE GAINS IT. A token nobody flagged must not land where
		// a person is asked to read it first, or the flag says nothing.
		{"an ordinary token", workArgs{Title: "an ordinary token", Actor: "worker-one"}, false},
	} {
		t.Run(c.name, func(t *testing.T) {
			argv := workArgv(c.args)
			if carries(argv, "--needs-human") != c.flags {
				t.Errorf("the call carries --needs-human against the %v the door asked: %v", c.flags, argv)
			}
			if !carries(argv, "--title") || !carries(argv, c.args.Title) {
				t.Errorf("the call does not say what the token is: %v", argv)
			}
		})
	}
}
