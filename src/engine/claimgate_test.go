package main

import (
	"bytes"
	"strings"
	"testing"
	"time"
)

// TRACKED WORK IS CLAIMED BEFORE IT IS WORKED.
//
// CLAIMING WAS OPT-IN AND WORK WAS NOT. A box took a tracked token, worked it
// and closed it with nothing in git saying so, and another box reading the
// tree saw an open token and took the same one. Measured on this tree: one
// token carried a claim, and every other tracked one was open to whoever
// pulled first, on any box.
//
// THE CLAIM IS THE BOX'S AND NOT THE AGENT'S. What a claim keeps out is
// another machine. Two agents here already have the holder between them.
func TestATrackedTokenNeedsAClaimFromThisBox(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	now := time.Now().UTC()
	tok := mintUnclaimed(t, r, "work another box sees")

	_, err := TakeUp(r, tok.ID, "worker-one")
	if err == nil {
		t.Fatal("a tracked token with no claim was taken up")
	}
	if !strings.Contains(err.Error(), "se claim") {
		t.Fatalf("the refusal does not name the door: %v", err)
	}

	if _, err := Claim(r, Claimant(r, "worker-one"), []string{tok.ID}, now); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "worker-one"); err != nil {
		t.Fatalf("a token this box claimed was refused: %v", err)
	}

	other := mintUnclaimed(t, r, "claimed here, worked here")
	if _, err := Claim(r, Claimant(r, "worker-one"), []string{other.ID}, now); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, other.ID, "worker-two"); err != nil {
		t.Fatalf("a second agent on this box was refused: %v", err)
	}
}

// A LOCAL TOKEN IS EXEMPT, because .se/work is not in git and no other box can
// see it or take it. A claim there would buy nothing and cost a call.
func TestALocalTokenIsTakenWithNoClaim(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	note, err := Mint(r, Token{Process: "note", Title: "a private observation",
		Status: "noted", Detail: "something seen, and nobody has decided what it is yet"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, note.ID, "worker-one"); err != nil {
		t.Fatalf("a local token was refused: %v", err)
	}
}

// CLAIMING AND TAKING ARE ONE CALL, because an agent refused for want of a
// claim is one call away from the work and should not need two.
func TestAClaimCanTakeTheTokenUp(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "claimed and taken once")

	var out, errs bytes.Buffer
	code := run["claim"](&call{ctx: t.Context(), roots: r,
		args: []string{"--these", tok.ID, "--actor", "worker-one", "--take", "--no-publish"},
		in:   strings.NewReader(""), out: &out, err: &errs})
	said := out.String() + errs.String()
	if code != 0 {
		t.Fatalf("the claim answered %d: %s", code, said)
	}

	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.ClaimedBy == "" {
		t.Fatalf("the claim was not written: %s", said)
	}
	inHand := InWorkFor(r, "worker-one")
	if len(inHand) != 1 || inHand[0].ID != tok.ID {
		t.Fatalf("worker-one holds %d tokens after a claim that takes up: %s", len(inHand), said)
	}

	// AND A REFUSED TAKE-UP IS NOT A CLAIM THAT WORKED. The reason went into the
	// notice and the verb answered zero anyway, so a caller reading the code was
	// told the work was in its hands, and its next write was refused for holding
	// no token.
	elsewhere := mintUnclaimed(t, r, "claimed, another hand holds")
	if _, err := Claim(r, Claimant(r, "worker-one"), []string{elsewhere.ID}, time.Now().UTC()); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, elsewhere.ID, "worker-two"); err != nil {
		t.Fatal(err)
	}
	out.Reset()
	errs.Reset()
	code = run["claim"](&call{ctx: t.Context(), roots: r,
		args: []string{"--these", elsewhere.ID, "--actor", "worker-one", "--take", "--no-publish"},
		in:   strings.NewReader(""), out: &out, err: &errs})
	said = out.String() + errs.String()
	if code == 0 {
		t.Errorf("a refused take-up answered 0, so the caller is told it holds %s: %s", elsewhere.ID, said)
	}
	if !strings.Contains(said, "refused") {
		t.Errorf("the answer does not say the take-up was refused: %s", said)
	}

	// AND TAKE WITH TWO IDS SAYS THE FLAG DID NOTHING. A take-up is one token at
	// a time, so the block was skipped, and skipped in silence: the flag was
	// accepted and ignored.
	one, two := mintUnclaimed(t, r, "one of a pair"), mintUnclaimed(t, r, "two of a pair")
	out.Reset()
	errs.Reset()
	code = run["claim"](&call{ctx: t.Context(), roots: r,
		args: []string{"--these", one.ID + "," + two.ID, "--actor", "worker-three", "--take", "--no-publish"},
		in:   strings.NewReader(""), out: &out, err: &errs})
	said = out.String() + errs.String()
	if !strings.Contains(said, "take was not applied") {
		t.Errorf("two ids with take said nothing about the flag: %s", said)
	}
	if took := InWorkFor(r, "worker-three"); len(took) != 0 {
		t.Errorf("take with two ids put %d token(s) in worker-three's hands", len(took))
	}
}
