package main

import "testing"

// EVERY AGENT TAKES EVERY OPEN TOKEN, AND THE ENGINE DECIDES WHICH.
//
// THE OWNER'S RULING: because there is a lot of open that you do not touch, you
// can also touch those who are assigned to a coworker. It does not matter.
// Every agent can take every open token.
//
// WHAT IT WAS. The worker pick skipped any token whose assignee was not the
// puller, so a name a person typed once was a lock. MEASURED: four fresh agents
// pulled and each was told no token is assigned to you, while the work view
// answered 26 rows under here.
//
// THE SET IS ASKED FOR RATHER THAN TYPED. HandedOut(RoleWorker) is where the
// engine says which states a worker is handed, so a twelfth state joining it
// arrives in this test without anybody remembering it.
func TestAnyAgentIsHandedAnyOpenToken(t *testing.T) {
	for _, status := range HandedOut(RoleWorker) {
		r := lane(t)
		one := mint(t, r, Token{Title: "somebody else's", Status: status,
			Assignee: "work-a", MintedBy: "work-a"})

		got := Pull(r, "imp-1", RoleWorker, Payload{})
		if got.Pull != AnswerWork {
			t.Fatalf("a token in %s assigned to work-a was not handed to imp-1: the pull "+
				"answered %q, so an agent is told there is no work while open work sits "+
				"there", status, got.Pull)
		}
		if got.Token == nil || got.Token.ID != one.ID {
			t.Fatalf("a token in %s was handed out and it was not the one that was open", status)
		}
		if got.Token.Holder != "imp-1" {
			t.Errorf("imp-1 was handed a token in %s and does not hold it: %q",
				status, got.Token.Holder)
		}
	}
}

// AND WHAT SOMEBODY ELSE IS ALREADY HOLDING IS STILL THEIRS, which is the half
// that stops this being a free-for-all. Handing out open work is one question.
// Taking work out of a live agent's hands is another, and the answer to it did
// not change.
func TestWorkInSomebodyElsesHandsStaysThere(t *testing.T) {
	for _, status := range HeldBy(RoleWorker) {
		r := lane(t)
		one := mint(t, r, Token{Title: "in somebody's hands", Status: status,
			Assignee: "work-a", MintedBy: "work-a", Holder: "work-a"})

		got := Pull(r, "imp-1", RoleWorker, Payload{})
		if got.Pull == AnswerWork && got.Token != nil && got.Token.ID == one.ID {
			t.Errorf("a token in %s held by work-a was handed to imp-1, so a pull takes "+
				"work out of a live agent's hands", status)
		}
	}
}

// A PERMISSION IS A ROAD, NOT A DOOR. A widened handout has to run end to end:
// picked up, and then submitted by the hand that picked it up. Stopping at the
// handout proves the door opened and nothing more, and behind that door the
// submit still asked the assignee, so every widened handout was work that
// could be started and never finished.
func TestAWidenedHandoutCanBeSubmitted(t *testing.T) {
	for _, status := range HandedOut(RoleWorker) {
		r := lane(t)
		one := mint(t, r, Token{Title: "somebody else's", Status: status,
			Assignee: "work-a", MintedBy: "work-a",
			Detail:   "a problem worth a token",
			Criteria: []Criterion{{Says: "it is done"}}})

		got := Pull(r, "imp-1", RoleWorker, Payload{})
		if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != one.ID {
			t.Fatalf("a token in %s assigned to work-a was not handed to imp-1: %s", status, got.Pull)
		}

		sub := Payload{ID: one.ID}
		if !status.Drafting() {
			sub.Disposition = string(Done)
			sub.Evidence = map[string]string{"it is done": "it is, and this says how"}
		}
		back := Pull(r, "imp-1", RoleWorker, sub)
		if back.Pull == AnswerRefused {
			t.Fatalf("imp-1 was handed a token in %s and refused when it handed the work "+
				"back: %+v", status, back.Findings)
		}
		// The submitted state is asked of the engine: it is the state a reviewer
		// is handed, in the same half the token was picked up from.
		after, err := LoadToken(r, one.ID)
		if err != nil {
			t.Fatal(err)
		}
		var want Status
		for _, s := range HandedOut(RoleReviewer) {
			if s.Drafting() == status.Drafting() {
				want = s
			}
		}
		if after.Status != want {
			t.Errorf("a widened handout in %s was submitted and sits in %s, not %s",
				status, after.Status, want)
		}
	}
}

// AN AGENT THAT PULLED, WAS INTERRUPTED, AND PULLED AGAIN GETS THE SAME TOKEN,
// and the widening did not repeal that. The reclaim asked the assignee as well
// as the holder, so a widened handout matched for nobody and a second pull
// handed out a second token instead of the one in hand.
func TestASecondPullHandsBackTheWidenedToken(t *testing.T) {
	for _, status := range HandedOut(RoleWorker) {
		r := lane(t)
		mint(t, r, Token{Title: "the first", Status: status,
			Assignee: "work-a", MintedBy: "work-a"})
		mint(t, r, Token{Title: "the second", Status: status,
			Assignee: "work-a", MintedBy: "work-a"})

		first := Pull(r, "imp-1", RoleWorker, Payload{})
		if first.Pull != AnswerWork || first.Token == nil {
			t.Fatalf("the first pull in %s answered %s", status, first.Pull)
		}
		again := Pull(r, "imp-1", RoleWorker, Payload{})
		if again.Pull != AnswerWork || again.Token == nil || again.Token.ID != first.Token.ID {
			t.Errorf("in %s the second pull handed out %v, not the token imp-1 already "+
				"holds, so an interrupted agent works two things at once", status, again.Token)
		}
	}
}

// A TOKEN WHOSE HOLDER WENT AWAY IS REACHABLE AGAIN. The arrival reclaim asked
// the assignee, so a widened handout whose holder died was matched by nobody:
// the assignee failed the holder test, the holder failed the assignee test,
// and the token sat in work while the queue answered wait.
func TestATokenWhoseHolderWentAwayIsReachableAgain(t *testing.T) {
	for _, status := range HandedOut(RoleWorker) {
		r := lane(t)
		one := mint(t, r, Token{Title: "somebody else's", Status: status,
			Assignee: "work-a", MintedBy: "work-a"})
		got := Pull(r, "imp-1", RoleWorker, Payload{})
		if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != one.ID {
			t.Fatalf("a token in %s was not handed to imp-1: %s", status, got.Pull)
		}

		// The holder goes away and comes back, which is when Reclaim runs.
		back := Reclaim(r, "imp-1", RoleWorker)
		found := false
		for _, id := range back {
			found = found || id == one.ID
		}
		if !found {
			t.Fatalf("imp-1 came back and its reclaim returned %v, not the token it was "+
				"holding in %s, so the token is stranded in work", back, status)
		}
		after, err := LoadToken(r, one.ID)
		if err != nil {
			t.Fatal(err)
		}
		if after.Status != status || after.Holder != "" {
			t.Errorf("a reclaimed token sits in %s held by %q, not back in %s for "+
				"whoever pulls next", after.Status, after.Holder, status)
		}
	}
}
