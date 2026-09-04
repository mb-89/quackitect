package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A CLAIM HOLDS THE WORK, AND THEN IT LAPSES.
//
// A claim that never ends is why the holder had to come off the note in the
// first place: a name written into a file nothing reopens is a name that stays
// forever. So the token says when it was taken, the engine reads the limit, and
// nothing has to come back to end it.
func TestAClaimHoldsTheWorkAndThenLapses(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "work to be claimed")
	me := Claimant(r, "worker-one")
	now := time.Now().UTC()

	got, err := Claim(r, me, []string{tok.ID}, now)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Taken) != 1 || len(got.Refused) != 0 {
		t.Fatalf("the claim answered %+v", got)
	}

	// IT IS ON THE NOTE, because a claim has to reach a box that is not this
	// one, and the note is what travels.
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.ClaimedBy != me || back.ClaimedAt == "" {
		t.Fatalf("the note says claimed_by %q at %q", back.ClaimedBy, back.ClaimedAt)
	}

	// ANOTHER CLAIMANT IS REFUSED WHILE IT STANDS.
	if bad := WhyNotClaimable(r, back, Claimant(r, "worker-two"), now); bad == nil {
		t.Fatal("a second claimant took a token that was already claimed")
	}

	// AND WHEN IT LAPSES, IT IS BACK IN THE POOL WITH NOBODY DOING ANYTHING.
	later := now.Add(time.Duration(LoadConfig(r).ClaimHours)*time.Hour + time.Minute)
	if by := ClaimedNow(r, back, later); by != "" {
		t.Fatalf("a claim past its hours still reads as held by %q", by)
	}
	if bad := WhyNotClaimable(r, back, Claimant(r, "worker-two"), later); bad != nil {
		t.Fatalf("a lapsed claim still refuses another claimant: %+v", bad)
	}
}

// A RELEASE TAKES BACK ONLY ITS OWN.
//
// Taking somebody's claim away is a person's act, at the note, rather than a
// verb an agent reaches for.
func TestAReleaseTakesBackOnlyItsOwn(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	mine := mintStandard(t, r, "mine")
	theirs := mintStandard(t, r, "theirs")
	me, them := Claimant(r, "worker-one"), Claimant(r, "worker-two")
	now := time.Now().UTC()

	if _, err := Claim(r, me, []string{mine.ID}, now); err != nil {
		t.Fatal(err)
	}
	if _, err := Claim(r, them, []string{theirs.ID}, now); err != nil {
		t.Fatal(err)
	}

	// NAMING NO ID RELEASES EVERYTHING THIS CLAIMANT HOLDS, and nothing else.
	got, err := Release(r, me, nil, now)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Freed) != 1 || got.Freed[0] != mine.ID {
		t.Fatalf("the release freed %v", got.Freed)
	}
	still, _ := LoadToken(r, theirs.ID)
	if still.ClaimedBy != them {
		t.Fatalf("another claimant's token was released: %q", still.ClaimedBy)
	}
	// AND NAMING SOMEBODY ELSE'S IS REFUSED RATHER THAN TAKEN.
	got, _ = Release(r, me, []string{theirs.ID}, now)
	if len(got.Freed) != 0 || len(got.Refused) != 1 {
		t.Fatalf("releasing another claimant's token answered %+v", got)
	}
}

// TWO FOLDERS ON ONE MACHINE ARE TWO BOXES.
//
// Two boxes running one clone both call their agent main. Both write main, both
// read main, and each walks through the other's claims believing they are its
// own. From inside either box the ledger looks right, so nothing would say so.
func TestTwoTreesAreTwoClaimants(t *testing.T) {
	t.Parallel()
	one := Roots{Method: t.TempDir(), Work: t.TempDir()}
	two := Roots{Method: t.TempDir(), Work: t.TempDir()}
	if Box(one) == Box(two) {
		t.Fatal("two folders on one machine answered one box, so each would read the other's claims as its own")
	}
	if Claimant(one, "main") == Claimant(two, "main") {
		t.Fatal("two boxes agreed on what main means")
	}
	// AND THE SAME TREE IS THE SAME BOX, TWICE RUNNING.
	if Box(one) != Box(one) {
		t.Fatal("one tree answered two boxes, so its own claims would read as somebody else's")
	}
	// NOTHING PRIVATE TRAVELS: what goes on the note is a hash and a name.
	if strings.Contains(Claimant(one, "main"), one.Method) {
		t.Fatal("the claimant carries the path of the box it was made on")
	}
}

// THE OTHER BOXES' CLAIMS ARE READ WITHOUT ANYBODY TYPING A GIT COMMAND, AND
// WITHOUT THE PULL TOUCHING THE NETWORK.
//
// THE OWNER'S ASK: every claim lands in git, every pull checks git, and the
// person never uses git. Measured on this tree, a fetch is 1.2 seconds and
// reading a note out of a ref already fetched is 45 milliseconds. So the engine
// fetches on its own clock and the pull reads what is already here.
func TestAClaimFromAnotherBoxIsHonouredWithoutTheNetwork(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "work another box took")
	them := "0badc0de/worker-far"
	now := time.Now().UTC()

	// What the engine's sync writes down when it has read the remote.
	saveFarClaims(r, TheFarClaims{
		Looked: now.Format(ClaimStamp), Ref: "deadbeef",
		Claims: map[string]FarClaim{tok.ID: {By: them, At: now.Format(ClaimStamp)}},
	})

	// THE NOTE SAYS NOTHING, and the claim is honoured all the same.
	back, _ := LoadToken(r, tok.ID)
	if back.ClaimedBy != "" {
		t.Fatal("this test is not testing what it says: the note carries a claim")
	}
	if by := ClaimedNow(r, back, now); by != them {
		t.Fatalf("a claim another box published reads as %q here", by)
	}
	if bad := WhyNotClaimable(r, back, Claimant(r, "worker-one"), now); bad == nil {
		t.Fatal("this box claimed work another box had already taken")
	}

	// AND THE QUEUE PASSES OVER IT, which is the point of the whole mechanism.
	if got := Pull(r, "worker-one", RoleWorker, Payload{}); got.Pull == AnswerWork &&
		got.Token != nil && got.Token.ID == tok.ID {
		t.Fatal("the queue handed out work another box had claimed")
	}

	// IT LAPSES THE SAME WAY A LOCAL ONE DOES, so a box that never came back
	// does not hold the work for ever.
	later := now.Add(time.Duration(LoadConfig(r).ClaimHours)*time.Hour + time.Minute)
	if by := ClaimedNow(r, back, later); by != "" {
		t.Fatalf("another box's claim outlived its hours: %q", by)
	}
}

// A SYNC OVER A FOLDER GIT DOES NOT KNOW SAYS SO AND CHANGES NOTHING. A box
// with no remote goes on working with the claims it has.
func TestASyncWithNoRemoteIsNotFatal(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		t.Fatal(err)
	}
	got := SyncClaims(r)
	if got.Says == "" {
		t.Fatal("a sync that found nothing said nothing about why")
	}
	if len(got.Claims) != 0 {
		t.Fatalf("a tree with no remote answered %d claims", len(got.Claims))
	}
	// AND IT WROTE DOWN THAT IT LOOKED, so the next look is not a surprise.
	if _, err := os.Stat(filepath.Join(r.Private(), "claims.json")); err != nil {
		t.Fatalf("the look was not written down: %v", err)
	}
}
