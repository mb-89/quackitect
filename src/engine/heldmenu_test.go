package main

import (
	"strings"
	"testing"
)

// A REFUSAL TELLS AN AGENT WITH A HAND FULL SOMETHING DIFFERENT FROM ONE WITH
// NOTHING IN IT.
//
// The old shape of this was a ticket: se work --on armed one write and the
// write spent it, so the second write of a pair was refused with a menu that
// listed only UNHELD tokens. The id the agent had to name was the one already
// in its hand, and that was the one line the menu left out. It read as though
// the fix were to mint a second token.
//
// THE TICKET IS GONE AND THE DISTINCTION IS NOT. se run and se apply take the
// name on the call, so nothing is armed and nothing is spent, but a refusal
// still has to say which work the caller is already on rather than send it off
// to mint another.
func TestTheMenuSaysWhatIsAlreadyInYourHands(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "held work", "")
	tok.Holder = "worker-x"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}

	// WITH A HAND: the refusal names the token that hand is on, and says so as
	// a hand rather than as one more thing that could be picked up.
	why, refused := WriteNeedsAToken(r, "worker-x", "Bash", "", "")
	if !refused {
		t.Fatal("a shell command was let past the write gate")
	}
	if !strings.Contains(why, tok.ID) {
		t.Errorf("the refusal does not name the token the caller is already on, so "+
			"the id it has to type is the one line missing from the menu: %s", why)
	}
	if !strings.Contains(why, "in your hands as worker-x") {
		t.Errorf("the refusal lists the held token without saying it is held, so it "+
			"reads as one more token to pick up: %s", why)
	}

	// WITH NO HAND: the same menu says nothing about hands. This is the half
	// that keeps the first from being satisfied by printing the phrase always.
	why, refused = WriteNeedsAToken(r, "worker-y", "Bash", "", "")
	if !refused {
		t.Fatal("a shell command from an actor holding nothing was let past the write gate")
	}
	if strings.Contains(why, "in your hands") {
		t.Errorf("an actor holding nothing was told something is in its hands, so the "+
			"line says nothing about whether a hand is full: %s", why)
	}
	if strings.Contains(why, tok.ID) {
		t.Errorf("a token another actor holds was offered as open, so two agents are "+
			"invited onto one token: %s", why)
	}
}
