package main

import "testing"

// A STOP CLAIM IS FOUND UNDER EVERY NAME THE AGENT ACTS AS.
//
// The lane stores a claim under the name the agent pulls with, and the stop
// hook asks under the name the harness gives it. An agent that pulled as
// fable-cloud and is called main by the harness claimed five times in one
// session and was refused five times with NO CLAIM IS STANDING, because the
// claim sat under the one name and the lookup used the other.
func TestAStopClaimIsFoundUnderTheHarnessName(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	NoteTheNameItActsAs(r, "main", "fable-cloud")
	if err := ClaimStop(r, "fable-cloud", "decision", "only the person can choose"); err != nil {
		t.Fatal(err)
	}
	c, ok := StandingClaim(r, "main")
	if !ok {
		t.Fatal("a claim under the pulled name was not found under the harness name")
	}
	if c.Actor != "fable-cloud" || c.Because != "decision" {
		t.Fatalf("the claim found is %+v", c)
	}
}

// A NAME NO ALIAS LINKS FINDS ONLY ITS OWN. Another agent's claim is not this
// one's to stop on.
//
// IT HAS A NAME OF ITS OWN BECAUSE A CRITERION NAMES A PATTERN TO DECIDE IT BY.
// This case was the tail of the test above, so the pattern written to decide it
// reached no test at all: go test -run TestAClaimUnderAnUnlinkedName answered
// ok having run nothing, and a reader believed the case was guarded by the
// command named for it. A case a criterion points at is a test the pattern
// finds.
func TestAClaimUnderAnUnlinkedNameIsFoundUnderThatNameAlone(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	NoteTheNameItActsAs(r, "main", "fable-cloud")
	if err := ClaimStop(r, "fable-cloud", "decision", "only the person can choose"); err != nil {
		t.Fatal(err)
	}
	if _, ok := StandingClaim(r, "worker-bach"); ok {
		t.Fatal("a claim was found under a name that never pulled with it")
	}
}

// AND A CALL UNDER THE HARNESS NAME SPENDS IT, so carrying on after claiming
// still ends the claim whichever name the call carries.
func TestACallUnderTheHarnessNameSpendsThePulledClaim(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	NoteTheNameItActsAs(r, "main", "fable-cloud")
	if err := ClaimStop(r, "fable-cloud", "decision", "only the person can choose"); err != nil {
		t.Fatal(err)
	}
	SpendClaim(r, "main")
	if _, ok := StandingClaim(r, "fable-cloud"); ok {
		t.Fatal("a call under the harness name left the pulled name's claim standing")
	}
}
