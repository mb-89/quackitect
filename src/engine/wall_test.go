package main

import (
	"fmt"
	"strings"
	"testing"
)

// THE REVIEWER WALL, REBUILT. One live reviewer used to turn the refusal off
// for good, and eleven submissions piled up behind a green light. The wall
// now counts what is waiting, asked of the engine rather than named, and a
// live reviewer is worth exactly the one token it took.

// aSubmittedLane builds n tokens waiting in the given state, through the
// engine's own verbs, and one open token so a refusal is the only thing
// stopping the next hand-out.
func aSubmittedLane(t *testing.T, r Roots, n int, status Status) {
	t.Helper()
	for i := 0; i < n; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		if status == SpecSubmitted {
			after, err := LoadToken(r, tok.ID)
			if err != nil {
				t.Fatal(err)
			}
			after.Status, after.SubmittedBy = SpecSubmitted, "main"
			if err := SaveToken(r, after); err != nil {
				t.Fatal(err)
			}
			continue
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	if _, err := Mint(r, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"}); err != nil {
		t.Fatal(err)
	}
}

// SPEC_SUBMITTED IS COUNTED, and so is every state the reviewer queue hands
// out, asked of the engine so a state added later is covered without anybody
// remembering this token. The check fails naming the first state that does
// not refuse.
func TestTheRefusalCountsWhatIsWaiting(t *testing.T) {
	limit := TheFloor().UnreviewedBeforeBlocked
	for _, status := range HandedOut(RoleReviewer) {
		r := guidanceTree(t)
		aSubmittedLane(t, r, limit+1, status)
		a := Pull(r, "main", RoleWorker, Payload{})
		if a.Pull != AnswerWait {
			t.Fatalf("%s does not refuse: the queue answered %q with %d waiting",
				status, a.Pull, limit+1)
		}
	}
}

// A LIVE REVIEWER IS WORTH EXACTLY THE ONE TOKEN IT TOOK. More than the limit
// still waiting after it took one is refused, and exactly the limit hands out
// work. The second half is what stops this passing by refusing everybody.
func TestALiveReviewerIsWorthTheOneItTook(t *testing.T) {
	limit := TheFloor().UnreviewedBeforeBlocked

	// MORE THAN THE LIMIT STILL WAITING: limit+2 submitted, the reviewer takes
	// one, limit+1 remain, and the worker is still refused.
	r := guidanceTree(t)
	aSubmittedLane(t, r, limit+2, ImpSubmitted)
	if rev := Pull(r, "reviewer", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q", rev.Pull)
	}
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWait {
		t.Fatalf("a reviewer that took one turned the wall off with %d still waiting: %q",
			limit+1, a.Pull)
	}

	// EXACTLY THE LIMIT STILL WAITING: limit+1 submitted, one taken, work.
	r2 := guidanceTree(t)
	aSubmittedLane(t, r2, limit+1, ImpSubmitted)
	if rev := Pull(r2, "reviewer", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q", rev.Pull)
	}
	if a := Pull(r2, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the wall refuses everybody: %q %s", a.Pull, a.Notice)
	}
}

// THE REFUSAL SAYS HOW MANY ARE WAITING AND HOW MANY ARE READING, because
// saying none is running is false in the case this exists for, and a refusal
// a reader cannot act on is a wall.
func TestTheRefusalSaysHowManyAreReading(t *testing.T) {
	limit := TheFloor().UnreviewedBeforeBlocked
	r := guidanceTree(t)
	aSubmittedLane(t, r, limit+2, ImpSubmitted)
	if rev := Pull(r, "reviewer", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q", rev.Pull)
	}
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("the wall did not refuse: %q", a.Pull)
	}
	if strings.Contains(a.Notice, "NO REVIEWER IS RUNNING") {
		t.Fatalf("the refusal says none is running with one reading: %q", a.Notice)
	}
	if !strings.Contains(a.Notice, fmt.Sprintf("%d PIECES OF WORK ARE WAITING", limit+1)) ||
		!strings.Contains(a.Notice, "1 REVIEWERS ARE READING") {
		t.Fatalf("the refusal does not carry both counts: %q", a.Notice)
	}
}

// THE DEAD-HOLDER DETECTION IS ITS OWN THING WITH ITS OWN NAME. A token in
// review whose holder has stopped pulling is answered by deadReads, and a
// live holder is counted a reader by the same function.
func TestADeadHolderIsCaughtOnItsOwn(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	tok, err := Mint(r, Token{Title: "the held one", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if rev := Pull(r, "the-holder", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q", rev.Pull)
	}

	// STILL PULLING, STILL A READER.
	session := currentSession(r)
	stale := TheFloor().PullsBeforeHoldIsStale
	dead, readers := deadReads(r, session, stale)
	if len(dead) != 0 || readers != 1 {
		t.Fatalf("a holder that just pulled is not a reader: dead %v, readers %d", dead, readers)
	}

	// THE QUEUE MOVES ON WITHOUT IT, AND IT GOES DEAD. Other pulls advance the
	// count past the staleness window while the holder stays silent.
	for i := 0; i <= stale; i++ {
		Pull(r, "main", RoleWorker, Payload{})
	}
	dead, readers = deadReads(r, session, stale)
	if len(dead) != 1 || readers != 0 {
		t.Fatalf("a holder that stopped pulling was not caught: dead %v, readers %d", dead, readers)
	}
	if !strings.Contains(dead[0], "the-holder") || !strings.Contains(dead[0], "stopped pulling") {
		t.Fatalf("the dead read does not name the holder and the why: %q", dead[0])
	}
}

// A REVIEWER IS NEVER REFUSED BY THE QUEUE, whatever it looks like. It is the
// thing that clears this, and refusing it would be a trap nobody can escape.
func TestAReviewerIsNeverRefusedByTheQueue(t *testing.T) {
	limit := TheFloor().UnreviewedBeforeBlocked
	r := guidanceTree(t)
	aSubmittedLane(t, r, limit+3, ImpSubmitted)
	rev := Pull(r, "reviewer", RoleReviewer, Payload{})
	if rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused with the wall up: %q %s", rev.Pull, rev.Notice)
	}
}
