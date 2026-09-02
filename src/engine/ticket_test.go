package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// A NAMED WRITE SPENDS ITS TICKET, and the next one is refused until the actor
// names again.
func TestANamedWriteSpendsItsTicket(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the first", Status: ImpOpen})
	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	file := filepath.Join(r.Work, "src", "thing.go")

	if why, refused := WriteNeedsAToken(r, "main", "Write", file); refused {
		t.Fatalf("the write the name armed was refused: %s", why)
	}
	why, refused := WriteNeedsAToken(r, "main", "Write", file)
	if !refused {
		t.Fatal("a second write went through on one name, so the hand is still standing")
	}
	if !strings.Contains(why, "se work --on") {
		t.Errorf("the refusal does not name the remedy: %s", why)
	}
}

// EVERY WRITE NEEDS ITS OWN NAME, and naming again is the whole remedy.
func TestEveryWriteNeedsItsOwnName(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the first", Status: ImpOpen})
	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	file := filepath.Join(r.Work, "src", "thing.go")
	WriteNeedsAToken(r, "main", "Write", file)
	if _, refused := WriteNeedsAToken(r, "main", "Write", file); !refused {
		t.Fatal("the fixture never reached the refusal it is about")
	}

	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	if why, refused := WriteNeedsAToken(r, "main", "Write", file); refused {
		t.Fatalf("naming again did not reopen the door: %s", why)
	}
}

// THE SCRATCHPAD SPENDS NOTHING, in both directions: allowed with no ticket,
// and it leaves an armed one armed.
func TestTheScratchpadSpendsNothing(t *testing.T) {
	r := lane(t)
	pad := filepath.Join(r.Private("scratchpad"), "thinking.md")
	if why, refused := WriteNeedsAToken(r, "main", "Write", pad); refused {
		t.Fatalf("a scratchpad write with nothing in hand was refused: %s", why)
	}

	one := mint(t, r, Token{Title: "the first", Status: ImpOpen})
	if _, err := WorkOn(r, one.ID, "main"); err != nil {
		t.Fatal(err)
	}
	if _, armed := TicketArmed(r, "main"); !armed {
		t.Fatal("naming a token armed nothing, so this fixture is not about spending")
	}
	WriteNeedsAToken(r, "main", "Write", pad)
	if _, armed := TicketArmed(r, "main"); !armed {
		t.Error("a scratchpad write spent the ticket")
	}
	// AND THE PRODUCT WRITE IT LEFT ARMED STILL PASSES.
	if why, refused := WriteNeedsAToken(r, "main", "Write",
		filepath.Join(r.Work, "src", "thing.go")); refused {
		t.Errorf("the ticket a scratchpad write left armed did not open the door: %s", why)
	}
}

// A REVIEWER'S HOLD WRITES WITHOUT TICKETS, because the queue put that token in
// its hands.
func TestAReviewersHoldWritesWithoutTickets(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "build the thing", Assignee: "main", Status: ImpOpen})
	if a, _ := settle(r, "main", RoleWorker, Payload{ID: one.ID,
		Disposition: string(Done)}); a.Pull == AnswerRefused {
		t.Fatalf("the submission was refused: %+v", a.Findings)
	}
	if a := next(r, "rev-1", RoleReviewer); a.Pull != AnswerReview {
		t.Fatalf("the reviewer was handed nothing: %s", a.Pull)
	}
	if _, armed := TicketArmed(r, "rev-1"); armed {
		t.Fatal("the fixture armed a ticket, so it is not about writing without one")
	}
	file := filepath.Join(r.Work, "src", "thing.go")
	for i := 0; i < 2; i++ {
		if why, refused := WriteNeedsAToken(r, "rev-1", "Write", file); refused {
			t.Fatalf("a reviewer holding a review was refused write %d: %s", i+1, why)
		}
	}
}

// A SHELL KEEPS THE STANDING HAND. It names no file, so it does not spend, and
// it is still refused with no hand at all.
func TestAShellKeepsTheStandingHand(t *testing.T) {
	r := lane(t)
	if _, refused := WriteNeedsAToken(r, "main", "Bash", ""); !refused {
		t.Fatal("a shell with nothing in hand was allowed, so the gate stopped guarding it")
	}

	// A HAND WITHOUT A TICKET, written straight onto the note, because naming a
	// token arms one and this case is about the hand alone.
	one := mint(t, r, Token{Title: "the first", Assignee: "main", Status: ImpOpen})
	one.Status, one.Holder = ImpInWork, "main"
	if err := SaveToken(r, one); err != nil {
		t.Fatal(err)
	}
	if _, armed := TicketArmed(r, "main"); armed {
		t.Fatal("the fixture armed a ticket, so it is not about the standing hand")
	}
	for i := 0; i < 2; i++ {
		if why, refused := WriteNeedsAToken(r, "main", "Bash", ""); refused {
			t.Fatalf("a shell under one hand was refused on call %d: %s", i+1, why)
		}
	}
}
