package main

import "testing"

// WHAT IS ALREADY IN YOUR HAND IS STILL ASKED WHETHER IT MAY BE HANDED BACK.
//
// MEASURED. A token carrying needs_human was released, and the next pull handed
// it straight back within the minute. The queue walks what this actor already
// holds before anything else, and that walk did not ask Blocked.
//
// THE RULE IS WRITTEN IN ONE PLACE AND ASKED FROM EVERY PATH. Every other path
// in the same function asks both doors, and staffing and the stop judge ask
// them too. The fast path was the one that did not knock.
//
// AND A TOKEN THAT MAY NOT BE HANDED OUT DOES NOT SIT IN A HAND. It is set
// back, so a person can reach it and the queue can offer it once it is free.
func TestAHeldTokenStillKnocksBeforeItIsHandedBack(t *testing.T) {
	t.Parallel()

	// A HELD TOKEN WAITING ON A PERSON IS NOT HANDED BACK, AND IS SET BACK.
	t.Run("one that needs a person", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		tok := mintStandard(t, r, "needs a person")
		tok.NeedsHuman = true
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
		if err := recordHold(r, tok.ID, "worker-1"); err != nil {
			t.Fatal(err)
		}

		if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull == AnswerWork && got.Token.ID == tok.ID {
			t.Fatalf("%s carries needs_human and the queue handed it back to the hand holding it", tok.ID)
		}
		if by := HeldBy(r, tok.ID); by != "" {
			t.Errorf("it was left in %s's hand, and a token waiting on a person sits in nobody's", by)
		}
	})

	// A HELD TOKEN THAT IS BLOCKED IS NOT HANDED BACK EITHER.
	t.Run("one that waits on another token", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		first := mintStandard(t, r, "the one waited on")
		second := mintStandard(t, r, "the one waiting")
		second.DependsOn = []string{first.ID}
		if err := SaveToken(r, second); err != nil {
			t.Fatal(err)
		}
		if err := recordHold(r, second.ID, "worker-1"); err != nil {
			t.Fatal(err)
		}

		if why := Blocked(r, second); why == "" {
			t.Fatal("the fixture is not blocked, so this proves nothing")
		}
		if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull == AnswerWork && got.Token.ID == second.ID {
			t.Fatalf("%s waits on %s and the queue handed it back", second.ID, first.ID)
		}
		if by := HeldBy(r, second.ID); by != "" {
			t.Errorf("it was left in %s's hand, and a blocked token sits in nobody's", by)
		}
	})

	// AND ONE THAT WAITS ON NOTHING IS STILL HANDED STRAIGHT BACK, which is the
	// half this must not cost. An agent that was interrupted gets its own work.
	t.Run("one that waits on nothing", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		tok := mintStandard(t, r, "waiting on nothing")
		if err := recordHold(r, tok.ID, "worker-1"); err != nil {
			t.Fatal(err)
		}

		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != tok.ID {
			t.Fatalf("the queue did not hand back the work already in the hand: %+v", got)
		}
	})
}
