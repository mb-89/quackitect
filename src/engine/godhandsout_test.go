package main

import "testing"

// GOD IS NOT UNBOUND, AND THE QUEUE MUST NOT TREAT IT AS IF IT WERE.
//
// Unleashed answers true for Unbound and for God alike, because both take the
// process rules off. The queue's hand-out asked Unleashed, so a God tree was
// handed nothing and told it was unbound, which is a rung it is not on.
//
// GOD IS EVERY REFUSAL OFF. A queue that refuses there is a new refusal in the
// one state that exists for working without the engine in the way. unbound.go
// says so, and pull.go said the opposite seventy lines above it.
//
// THE FIX IS A DELETION. whatComesNext already asks LoadBinding for Unbound
// alone, so the guard in answerFor was a second writer of one rule as well as
// a wrong one.
func TestGodIsHandedWorkAndUnboundIsNot(t *testing.T) {
	t.Parallel()

	for _, c := range []struct {
		name  string
		rung  TheBinding
		hands bool
	}{
		{"bound", Bound, true},
		{"unbound", Unbound, false},
		{"god", God, true},
	} {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			r := aTreeWithTheProcesses(t)
			mintStandard(t, r, "work for whoever asks")
			if c.rung != Bound {
				if _, err := SetBinding(r, c.rung, "the owner"); err != nil {
					t.Fatal(err)
				}
			}
			got := Pull(r, "worker-1", RoleWorker, Payload{})
			if handed := got.Pull == AnswerWork; handed != c.hands {
				t.Errorf("on %s the queue handed out %v, wanted %v: %s",
					c.name, handed, c.hands, got.Notice)
			}
		})
	}
}
