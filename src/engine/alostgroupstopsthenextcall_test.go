package main

import (
	"strings"
	"testing"
	"time"
)

// LOSING TELLS YOU.
//
// Where the entry names somebody else the old holder stops at its next call.
// Without that it carries on pushing into a branch another box owns, which is
// the state the hold exists to prevent.
func TestABoxThatLostItsGroupStopsAtTheNextCall(t *testing.T) {
	r := aTreeToWriteIn(t)

	// THE CLEAN CASE: a box still holding its own group is not stopped.
	sayTheGroupHere(r, GroupHere{Name: "group/voice", By: "this-box"})
	if ok := runVerbInside(t.Context(), r, verbAsk{Verb: "claim", Args: []string{"--whoami"}}); ok.Code != 0 {
		t.Fatalf("a box that still holds its group was refused: %d %s", ok.Code, ok.Err)
	}

	// THE PLANTED CASE: the entry names another box.
	sayTheGroupHere(r, GroupHere{Name: "group/voice", By: "this-box", Lost: "another-box"})
	got := runVerbInside(t.Context(), r, verbAsk{Verb: "claim", Args: []string{"--whoami"}})
	if got.Code == 0 {
		t.Fatal("a box went on working a group it had lost")
	}
	if !strings.Contains(got.Err, "another-box") {
		t.Errorf("the refusal does not name who holds it now: %s", got.Err)
	}
	if got.Out != "" {
		t.Errorf("the refusal put %d bytes where a reader parses the answer: %s", len(got.Out), got.Out)
	}

	// AND ASKING FOR ANOTHER GROUP IS STILL ALLOWED, because that is what a box
	// that lost one is told to do rather than fight.
	if asked := runVerbInside(t.Context(), r, verbAsk{Verb: "group", Args: []string{"--next"}}); asked.Code != 0 {
		t.Errorf("a box that lost its group cannot ask for another: %d %s", asked.Code, asked.Err)
	}
}

// AND THE ENGINE NOTICES THE LOSS ITSELF, off the file every box can read.
func TestTheWatchNoticesAGroupThisBoxLost(t *testing.T) {
	r := aBoxOverGroups(t)
	other := anotherBoxOverTheSameTree(t, r)
	now := time.Now().UTC()

	// THE CLEAN CASE: this box holds the group, so nothing stops it.
	mine := ClaimTheGroup(t.Context(), r, "voice", now)
	if mine.Refused != "" {
		t.Fatalf("the group could not be taken: %s", mine.Refused)
	}
	RenewTheGroup(t.Context(), r, nil, now)
	if why := WhyTheGroupIsLost(r); why != "" {
		t.Fatalf("a box holding its own group was told it had lost it: %s", why)
	}

	// THE PLANTED CASE: the lease runs out and another box takes the branch.
	later := now.Add(4 * time.Hour)
	if got := ClaimTheGroup(t.Context(), other, "voice", later); got.Refused != "" {
		t.Fatalf("the other box could not take the lapsed group: %s", got.Refused)
	}
	// THE FIRST BOX STILL BELIEVES IT IS WORKING THE GROUP, which is exactly the
	// box this rule is about: its checkout is on that branch and it means to push.
	//
	// IT FETCHES FIRST, BECAUSE A LIVE BOX HAS. RenewTheGroup reads the refs and
	// does not fetch them: its comment says the fetch that reads the loss has
	// already happened, and on a running box that is the claim sync every
	// claim_sync_seconds. A test that skips it reads a ref still naming this box
	// and proves a stale cache rather than the notice.
	if err := fetchTheRemoteClaims(t.Context(), r, ""); err != nil {
		t.Fatalf("the first box could not read what the other published: %v", err)
	}
	// TWO BOXES OVER ONE TREE SHARE THE REGISTER, AND TWO CLONES WOULD NOT. The
	// other box's claim wrote its own name into the here-file this box reads, so
	// theGroupThisBoxIsWorking answers nothing and RenewTheGroup returns before
	// it ever asks who holds the group. MEASURED: box(r)=84c3ff4b, and the file
	// this box read said By=238428fd, which is the other box.
	//
	// The belief this rule is about is put back, because a box with its own .se
	// would still be holding it.
	sayTheGroupHere(r, GroupHere{Name: "group/voice", By: Box(r), Lapses: mine.Lapses})

	RenewTheGroup(t.Context(), r, nil, later)
	why := WhyTheGroupIsLost(r)
	if why == "" {
		t.Fatal("the box was never told it had lost the group")
	}
	if !strings.Contains(why, Box(other)) {
		t.Errorf("the sentence does not name who holds it now: %s", why)
	}
}
