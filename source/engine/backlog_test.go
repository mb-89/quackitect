package main

import "testing"

// A NOTE IS WORK THAT NOBODY IS DOING. It exists, it is visible, and it holds
// nothing back. That is what separates writing something down from taking it on.
func TestABackloggedTokenIsNotHandedOutAndHoldsNobody(t *testing.T) {
	r := lane(t)
	note, err := Mint(r, Token{Form: "look at whether a move verb is worth having",
		Assignee: "main", Status: Backlogged})
	if err != nil {
		t.Fatal(err)
	}
	if note.Status != Backlogged {
		t.Fatalf("it was minted %s", note.Status)
	}

	// The queue does not offer it.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWait {
		t.Fatalf("a backlogged token was handed out: %s", a.Pull)
	}
	// And it does not hold the actor from stopping.
	if !AskToStop(r, "main").Permitted {
		t.Fatal("a backlogged token held the worker")
	}
}

// Draining the backlog is a decision somebody makes, not a consequence of
// having written the note down.
func TestOpeningABackloggedTokenPutsItInTheQueue(t *testing.T) {
	r := lane(t)
	note, _ := Mint(r, Token{Form: "the note", Assignee: "main", Status: Backlogged})

	got, err := Activate(r, note.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != Open {
		t.Fatalf("it is %s after being opened", got.Status)
	}
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWork || a.Token.ID != note.ID {
		t.Fatalf("the opened note did not reach the queue: %s", a.Pull)
	}
	// Now it holds, because now somebody is meant to do it.
	if AskToStop(r, "main").Permitted {
		t.Fatal("an opened note does not hold the worker")
	}
}

// Only a backlogged token is opened this way. Anything else is already
// somewhere, and moving it there again would lose where it was.
func TestOnlyABackloggedTokenIsOpenedFromTheBacklog(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Form: "already open"})
	if _, err := Activate(r, tok.ID); err == nil {
		t.Fatal("an open token was opened from the backlog")
	}
	if _, err := Activate(r, "wk-nothing"); err == nil {
		t.Fatal("a token that does not exist was opened")
	}
}
