package main

import "testing"

// UNBOUND TAKES THE QUEUE OFF, AND THE QUEUE IS MORE THAN THE STAFFING GUARD.
//
// MEASURED, ON 2026-09-06. A cloud box was unbound. The staffing guard stopped
// refusing, because it asks Unleashed. Then a pull closed one token and handed
// out another, and the stop judge refused a stop twice over that same token.
//
// So an unbound session was handed work it never asked for, then held by the
// work it was handed. Both paths are the queue and neither asked.
//
// THE TWO HALVES ARE DRIVEN TOGETHER. A test that only proved the unbound case
// would pass against a queue that handed out nothing to anybody.
func TestUnboundTakesTheQueueOffEveryPathThatIsTheQueue(t *testing.T) {
	t.Parallel()

	for _, c := range []struct {
		name    string
		unbind  bool
		hands   bool
		refuses bool
	}{
		{"bound", false, true, true},
		{"unbound", true, false, false},
	} {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()

			// THE HAND-OUT. One token stands and one worker asks for it.
			r := aTreeWithTheProcesses(t)
			mintStandard(t, r, "work for whoever asks")
			unbindIf(t, r, c.unbind)
			got := Pull(r, "worker-1", RoleWorker, Payload{})
			if handed := got.Pull == AnswerWork; handed != c.hands {
				t.Errorf("the queue handed out %v and %s wants %v: %s",
					handed, c.name, c.hands, got.Notice)
			}

			// THE STOP JUDGE, over a token the queue put in this hand.
			r2 := aTreeWithTheProcesses(t)
			mintStandard(t, r2, "work in a hand")
			if a := Pull(r2, "worker-1", RoleWorker, Payload{}); a.Pull != AnswerWork {
				t.Fatalf("this half proves nothing: nothing was handed to hold: %s", a.Notice)
			}
			unbindIf(t, r2, c.unbind)
			ruling := AskToStop(r2, "worker-1")
			if refused := ruling.Reason != ""; refused != c.refuses {
				t.Errorf("the stop judge refused %v and %s wants %v: %s",
					refused, c.name, c.refuses, ruling.Reason)
			}
		})
	}
}

// unbindIf takes the queue off where the case asks for it, and leaves a bound
// tree alone.
func unbindIf(t *testing.T, r Roots, unbind bool) {
	t.Helper()
	if !unbind {
		return
	}
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !Unleashed(r) {
		t.Fatal("the tree did not take the unbinding, so this case tests nothing")
	}
}
