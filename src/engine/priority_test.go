package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// FINISH BEFORE STARTING, wk-386169824b. Both queues used to hand out drafting
// before implementation. These tests pin the other order: a submission waiting
// is work already done but not yet counted, and an open implementation is work
// somebody already agreed to, so both come before anything new is started.
//
// EVERY TEST ASKS THE QUEUE RATHER THAN READING THE LOOPS, because the order
// is what the queue does and not what the source looks like.

// A reviewer with a spec and a submission both waiting is handed the
// implementation. The spec is minted first so it carries the lower seq, which
// is the order the old code preferred, so this fails for the right reason
// while the swap is absent.
func TestAReviewerTakesAnImplementationBeforeASpec(t *testing.T) {
	r := lane(t)
	spec := mint(t, r, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	imp := mint(t, r, Token{Title: "the work", Assignee: "main", Status: ImpOpen})
	send(t, r, spec, SpecSubmitted, "main")
	send(t, r, imp, ImpSubmitted, "main")

	got := next(r, "rev", RoleReviewer)
	if got.Pull != AnswerReview || got.Token == nil {
		t.Fatalf("wanted a review, got %s: %s", got.Pull, got.Notice)
	}
	if got.Token.ID != imp.ID {
		t.Fatalf("the reviewer queue handed out %s with an implementation waiting in %s",
			got.Token.ID, imp.ID)
	}
}

// A worker with a draft and an implementation both open is handed the
// implementation. The draft is minted first so it carries the lower seq, for
// the same reason as above.
func TestAWorkerImplementsBeforeItDrafts(t *testing.T) {
	r := lane(t)
	draft := mint(t, r, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	imp := mint(t, r, Token{Title: "the work", Assignee: "main", Status: ImpOpen})

	got := next(r, "main", RoleWorker)
	if got.Pull != AnswerWork || got.Token == nil {
		t.Fatalf("wanted work, got %s: %s", got.Pull, got.Notice)
	}
	if got.Token.ID != imp.ID {
		t.Fatalf("the worker queue handed out %s, not the open implementation %s. The draft is %s",
			got.Token.ID, imp.ID, draft.ID)
	}
}

// A SPEC STILL COMES OUT WHEN NOTHING IS WAITING ON AN IMPLEMENTATION, in both
// queues. This is the half that stops the swap being a way to strand a draft,
// and a failure names which of the two queues stranded it.
func TestASpecStillComesOutWhenNothingIsWaiting(t *testing.T) {
	worker := lane(t)
	draft := mint(t, worker, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	got := next(worker, "main", RoleWorker)
	if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != draft.ID {
		t.Errorf("THE WORKER QUEUE stranded the only waiting draft: got %s %v: %s",
			got.Pull, got.Token, got.Notice)
	}

	reviewer := lane(t)
	spec := mint(t, reviewer, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	send(t, reviewer, spec, SpecSubmitted, "main")
	got = next(reviewer, "rev", RoleReviewer)
	if got.Pull != AnswerReview || got.Token == nil || got.Token.ID != spec.ID {
		t.Errorf("THE REVIEWER QUEUE stranded the only waiting draft: got %s %v: %s",
			got.Pull, got.Token, got.Notice)
	}
}

// A DRAFT THE AGENT ALREADY HOLDS COMES BACK BEFORE AN OPEN IMPLEMENTATION.
// Work already picked up comes back first, unless something open now sits
// ahead of what the agent holds, which only happens because a person put it
// there, and then the held token is put down and the person's choice is
// handed out.
//
// BOTH DIRECTIONS ARE DRIVEN HERE, and the fixture pins the seq order rather
// than leaving it to whichever way the mint happened to fall.
func TestADraftInHandComesBackBeforeAnOpenImplementation(t *testing.T) {
	// THE DRAFT IS MINTED FIRST and carries the lower seq, so nothing open
	// sits ahead of it, the exception does not fire, and the draft in hand is
	// what comes back.
	r := lane(t)
	draft := mint(t, r, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	hold(t, r, draft, SpecInWork, "main")
	mint(t, r, Token{Title: "the work", Assignee: "main", Status: ImpOpen})

	got := next(r, "main", RoleWorker)
	if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != draft.ID {
		t.Fatalf("the draft in hand did not come back: got %s %v: %s",
			got.Pull, got.Token, got.Notice)
	}

	// THE OTHER DIRECTION: the implementation is minted first and carries the
	// lower seq, assigned to the same actor and not blocked, so it sits ahead
	// of the held draft. The exception fires, the draft is put down, and the
	// implementation is handed out, which is the person's order winning.
	//
	// THE ASSERTIONS ARE ON THE NOTE THE PULL REWROTE, not only on which token
	// came back, mirroring TestThePersonsOrderReachesAnAgentThatAlreadyPulled:
	// the draft reads spec_open off disk, its holder is cleared, it carries no
	// disposition, and the record says it was put down.
	r = lane(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()
	imp := mint(t, r, Token{Title: "the work", Assignee: "main", Status: ImpOpen})
	draft = mint(t, r, Token{Title: "the draft", Assignee: "main", Status: SpecOpen})
	hold(t, r, draft, SpecInWork, "main")

	got = next(r, "main", RoleWorker)
	if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != imp.ID {
		t.Fatalf("the implementation a person put ahead was not handed out: got %s %v: %s",
			got.Pull, got.Token, got.Notice)
	}
	back, err := LoadToken(r, draft.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != SpecOpen || back.Holder != "" {
		t.Fatalf("the held draft was not put down to its own open: status %s, holder %q",
			back.Status, back.Holder)
	}
	if back.Disposition != NoDisposition {
		t.Fatalf("putting it down gave it a disposition: %s", back.Disposition)
	}
	b, _ := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if !strings.Contains(string(b), draft.ID+" put down") {
		t.Fatalf("the record does not say %s was put down", draft.ID)
	}
}

// send moves a minted token into a submitted state the way the engine leaves
// it: holder cleared and the sender written down, so sentBy answers the past.
func send(t *testing.T, r Roots, tok Token, status Status, by string) {
	t.Helper()
	after, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Status, after.Holder, after.SubmittedBy = status, "", by
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}
}

// hold puts a minted token into an in-work state with its holder set, which
// is the state a pull leaves behind.
func hold(t *testing.T, r Roots, tok Token, status Status, by string) {
	t.Helper()
	after, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Status, after.Holder = status, by
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}
}
