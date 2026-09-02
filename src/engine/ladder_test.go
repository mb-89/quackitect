package main

import (
	"fmt"
	"strings"
	"testing"
)

// THE AUTHORITY LADDER, driven end to end through the pull.
//
// Every fixture here drives the engine the way an agent drives it: the drafter
// sends, the reviewer takes what the queue hands it, and the assertions are on
// what came back or on what the note says afterwards. Nothing reads the source.

// ROUNDS PER RUNG IS A PARAMETER AND ITS DEFAULT IS TWO.
//
// It is asked of the config off a tree with nothing in it, because the config is
// what the engine reads and a constant in the source is not a parameter anybody
// can move.
func TestRoundsPerRungDefaultsToTwo(t *testing.T) {
	if got := LoadConfig(lane(t)).RoundsPerRung; got != 2 {
		t.Fatalf("rounds per rung came back as %d off an empty tree, and the default is two", got)
	}
}

// THE SECOND RUNG GRANTS FULL AUTHORITY AND THE NOTICE PROMISES EXACTLY WHAT
// THE FIXTURES DRIVE.
//
// Both directions on one notice: it names the two powers this token builds, and
// it names no third. An announced power with no verb costs the round it was made
// to save, because the notice is an instruction: the reviewer is told it may
// act, tries, finds nothing, and spends the round the grant existed to save.
//
// IT ASKS THE ANSWER RATHER THAN THE SOURCE, because the notice is what the
// reviewer acts on.
func TestTheSecondRungGrantsFullAuthority(t *testing.T) {
	r := lane(t)
	rpr := LoadConfig(r).RoundsPerRung
	tok := aDraft(t, r)
	for i := 0; i < rpr; i++ {
		oneSpecRound(t, r, tok.ID, "rev-1")
	}

	sendTheDraft(t, r, tok.ID)
	said := strings.ToLower(takeTheReview(t, r, "rev-1").Notice)
	if !strings.Contains(said, "full authority") {
		t.Fatalf("after %d consecutive spec rejections the reviewer was told nothing "+
			"about the authority it holds: %s", rpr, said)
	}
	// THE TWO POWERS THIS TOKEN BUILDS, each named by the notice that grants it.
	if !strings.Contains(said, "repair") {
		t.Errorf("the grant does not name repairing the draft: %s", said)
	}
	if !strings.Contains(said, "specification") {
		t.Errorf("the grant does not name sending the work back to specification: %s", said)
	}
	// AND NO THIRD POWER. Rewriting the note was withdrawn from the grant: no
	// criterion drives it and nothing in the engine does it.
	if strings.Contains(said, "rewrit") {
		t.Errorf("the grant promises rewriting, which no verb behind it does: %s", said)
	}
}

// THE LADDER ENDS AT THE PERSON, after the spent rung plus rounds-per-rung
// further consecutive failures on a half. An agent's verdict is refused then,
// and the refusal says who decides.
func TestTheLadderEndsAtThePerson(t *testing.T) {
	r := lane(t)
	rpr := LoadConfig(r).RoundsPerRung
	tok := aDraft(t, r)
	// The first run takes the grant. The second climbs off it.
	for i := 0; i < 2*rpr; i++ {
		oneSpecRound(t, r, tok.ID, "rev-1")
	}

	sendTheDraft(t, r, tok.ID)
	takeTheReview(t, r, "rev-1")
	a, _ := settle(r, "rev-1", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("an agent ruled on a token past the top of the ladder: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "person") {
		t.Fatalf("the refusal does not name the person as the one who decides: %+v", a.Findings)
	}
}

// THE COUNT IS PER HALF AND AN ACCEPT RESETS IT.
//
// One fixture drives both facts. A spec rejection, an accept that sets the spec
// half back to zero, then a fresh implementation rejection: every count the
// ladder can read is either reset or belongs to the other half, so no grant is
// due. One shared counter that never resets reads two and grants.
func TestTheCountResetsBetweenHalves(t *testing.T) {
	r := lane(t)
	tok := aDraft(t, r)

	oneSpecRound(t, r, tok.ID, "rev-1")
	sendTheDraft(t, r, tok.ID)
	takeTheReview(t, r, "rev-1")
	agree(t, r, tok.ID, "rev-1")

	oneWorkRound(t, r, tok.ID, "rev-1")
	sendTheWork(t, r, tok.ID)
	said := strings.ToLower(takeTheReview(t, r, "rev-1").Notice)
	if strings.Contains(said, "full authority") {
		t.Fatalf("one spec failure that was accepted away and one implementation failure "+
			"added up to a grant: %s", said)
	}
}

// THE OLD READER STILL GUARDS AFTER THE NEW COUNT RUNS.
//
// Token.Rounds is cumulative and never reset, and everyFindingAnswered decides
// which findings a submission owes with f.Round != t.Rounds. The ladder counts
// something else, so it keeps its own counters. Reset Token.Rounds at the accept
// and the gate stops guarding: the implementation round's finding is stamped
// with a number an earlier spec finding already carries.
func TestTheLadderLeavesTheRoundKeyAlone(t *testing.T) {
	r := lane(t)
	tok := aDraft(t, r)

	oneSpecRound(t, r, tok.ID, "rev-1")
	oneSpecRound(t, r, tok.ID, "rev-1")
	sendTheDraft(t, r, tok.ID)
	takeTheReview(t, r, "rev-1")
	agree(t, r, tok.ID, "rev-1")
	oneWorkRound(t, r, tok.ID, "rev-1")

	// THREE FINDINGS STAND, two from the spec half and one from this round.
	// Only this round's is owed.
	now, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(now.Findings) != 3 {
		t.Fatalf("the fixture did not raise three findings: %d", len(now.Findings))
	}
	if a := next(r, "main", RoleWorker); a.Pull != AnswerWork {
		t.Fatalf("the worker was handed nothing: %+v", a)
	}

	// ANSWERING AN EARLIER ROUND'S FINDING IS NOT ANSWERING THIS ROUND'S.
	short, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{theCriterion: "it is", "finding 1": "answered long ago"}})
	if short.Pull != AnswerRefused {
		t.Fatalf("a submission silent about this round's finding was taken: %s", short.Pull)
	}
	if !strings.Contains(short.Findings[0].Wrong, "finding 3") {
		t.Fatalf("the refusal does not name the implementation round's finding: %s",
			short.Findings[0].Wrong)
	}
	// AND THE SPEC HALF'S FINDINGS ARE NOT ASKED FOR AGAIN.
	if strings.Contains(short.Findings[0].Wrong, "finding 2") {
		t.Fatalf("a spec finding closed two rounds ago is owed again: %s", short.Findings[0].Wrong)
	}

	whole, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{theCriterion: "it is", "finding 3": "closed: the check names it"}})
	if whole.Pull == AnswerRefused {
		t.Fatalf("a submission answering this round's finding was refused: %+v", whole.Findings)
	}
}

// RUNG TWO SPENDS ONCE, FOR THE WHOLE TOKEN.
//
// The grant is taken on the spec half. The half is then accepted, which sets its
// count back to zero and never gives the grant back, and the implementation half
// fails rounds-per-rung times. No second grant is due, whatever the counters say.
func TestRungTwoSpendsOnce(t *testing.T) {
	r := lane(t)
	rpr := LoadConfig(r).RoundsPerRung
	tok := aDraft(t, r)
	for i := 0; i < rpr; i++ {
		oneSpecRound(t, r, tok.ID, "rev-1")
	}
	// The grant, taken.
	sendTheDraft(t, r, tok.ID)
	if said := takeTheReview(t, r, "rev-1").Notice; !strings.Contains(strings.ToLower(said), "full authority") {
		t.Fatalf("the fixture never took the grant it is about to spend: %s", said)
	}
	agree(t, r, tok.ID, "rev-1")

	for i := 0; i < rpr; i++ {
		oneWorkRound(t, r, tok.ID, "rev-1")
	}
	sendTheWork(t, r, tok.ID)
	said := strings.ToLower(takeTheReview(t, r, "rev-1").Notice)
	if strings.Contains(said, "full authority") {
		t.Fatalf("the second rung was granted twice on one token: %s", said)
	}
}

// FULL AUTHORITY IS USED END TO END, BOTH VERBS, ASSERTING THE TOKEN'S STATE
// AND NEVER THE NOTICE.
//
// The grant is taken by rounds-per-rung consecutive implementation rejections.
// The verdict that follows uses both powers at once: it sends the work back to
// specification and it repairs the criteria. Both are read back off disk,
// because a power is what changed and not what was announced.
func TestFullAuthorityIsUsedEndToEnd(t *testing.T) {
	r := lane(t)
	rpr := LoadConfig(r).RoundsPerRung
	tok := mint(t, r, Token{Title: "build the thing", Detail: "a problem worth stating",
		Criteria: []Criterion{{Says: theCriterion}}})
	for i := 0; i < rpr; i++ {
		oneWorkRound(t, r, tok.ID, "rev-1")
	}
	sendTheWork(t, r, tok.ID)
	if said := takeTheReview(t, r, "rev-1").Notice; !strings.Contains(strings.ToLower(said), "full authority") {
		t.Fatalf("the fixture never took the grant it is about to use: %s", said)
	}

	repaired := []Criterion{
		{Says: "the ladder ends at the person, and the refusal names them"},
		{Says: "the count is per half and an accept resets it"},
	}
	a, _ := settle(r, "rev-1", RoleReviewer, Payload{ID: tok.ID,
		Verdict: VerdictSpecify, Criteria: repaired})
	if a.Pull == AnswerRefused {
		t.Fatalf("a rung-two verdict was refused: %+v", a.Findings)
	}

	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	// SEND BACK: the token is where done is decided, and nobody holds it.
	if back.Status != SpecOpen {
		t.Errorf("the send-back left the token at %s", back.Status)
	}
	if back.Holder != "" {
		t.Errorf("the send-back left %s holding it", back.Holder)
	}
	// REPAIR: the criteria the reviewer sent are the criteria on the note.
	if len(back.Criteria) != len(repaired) {
		t.Fatalf("the note carries %d criteria, and the reviewer sent %d",
			len(back.Criteria), len(repaired))
	}
	for i, c := range repaired {
		if back.Criteria[i].Says != c.Says {
			t.Errorf("criterion %d on the note is %q, and the reviewer wrote %q",
				i+1, back.Criteria[i].Says, c.Says)
		}
	}
}

// ---- the fixtures ----

// The one criterion these tokens carry. It has no command, so the draft gates
// that judge a command let it through and the implementation submission answers
// it by name.
const theCriterion = "the thing is done"

func aDraft(t *testing.T, r Roots) Token {
	t.Helper()
	return mint(t, r, Token{Title: "say what done means", Status: SpecOpen,
		Detail:   "a problem worth stating",
		Criteria: []Criterion{{Says: theCriterion}}})
}

// theAnswersOwed builds the section per finding this round owes, which is what
// both halves refuse a submission for going without.
func theAnswersOwed(t *testing.T, r Roots, id string) map[string]string {
	t.Helper()
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	said := map[string]string{theCriterion: "it is"}
	for i, f := range tok.Findings {
		if f.Round != tok.Rounds {
			continue
		}
		said[fmt.Sprintf("finding %d", i+1)] = "answered: " + f.Clause
	}
	return said
}

// sendTheDraft redrafts and submits, so a draft is waiting for a reviewer. The
// detail moves because a redraft that changes nothing is refused.
func sendTheDraft(t *testing.T, r Roots, id string) {
	t.Helper()
	if a := next(r, "main", RoleWorker); a.Pull != AnswerWork {
		t.Fatalf("the drafter was handed nothing: %+v", a)
	}
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	tok.Detail += "\n\nand another sentence, because a redraft has to move."
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	a, _ := settle(r, "main", RoleWorker, Payload{ID: id, Evidence: theAnswersOwed(t, r, id)})
	if a.Pull == AnswerRefused {
		t.Fatalf("the draft was refused: %+v", a.Findings)
	}
}

func sendTheWork(t *testing.T, r Roots, id string) {
	t.Helper()
	if a := next(r, "main", RoleWorker); a.Pull != AnswerWork {
		t.Fatalf("the worker was handed nothing: %+v", a)
	}
	a, _ := settle(r, "main", RoleWorker, Payload{ID: id, Disposition: string(Done),
		Evidence: theAnswersOwed(t, r, id)})
	if a.Pull == AnswerRefused {
		t.Fatalf("the submission was refused: %+v", a.Findings)
	}
}

// takeTheReview is the reviewer's pull, and the answer it hands back is what
// every notice assertion here is made against.
func takeTheReview(t *testing.T, r Roots, rev string) Answer {
	t.Helper()
	a := Pull(r, rev, RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer was handed nothing to judge: %s %s", a.Pull, a.Notice)
	}
	return a
}

func rejectIt(t *testing.T, r Roots, id, rev string) {
	t.Helper()
	a, _ := settle(r, rev, RoleReviewer, Payload{ID: id, Verdict: "reject",
		Findings: []Rejection{{Clause: "the check", Wrong: "it cannot fail",
			Satisfies: "one that was watched failing"}},
		Lesson:  Lesson{Class: "a class", Avoid: "catch it", Prevents: "stop it"},
		Learned: mint(t, r, Token{Title: "learned", Status: Backlogged}).ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("the rejection this fixture rests on was refused: %+v", a.Findings)
	}
}

func agree(t *testing.T, r Roots, id, rev string) {
	t.Helper()
	a, _ := settle(r, rev, RoleReviewer, Payload{ID: id, Verdict: "accept"})
	if a.Pull == AnswerRefused {
		t.Fatalf("the acceptance this fixture rests on was refused: %+v", a.Findings)
	}
}

// oneSpecRound is a draft sent, taken and rejected: one failing round on the
// spec half.
func oneSpecRound(t *testing.T, r Roots, id, rev string) {
	t.Helper()
	sendTheDraft(t, r, id)
	takeTheReview(t, r, rev)
	rejectIt(t, r, id, rev)
}

// oneWorkRound is the same on the implementation half.
func oneWorkRound(t *testing.T, r Roots, id, rev string) {
	t.Helper()
	sendTheWork(t, r, id)
	takeTheReview(t, r, rev)
	rejectIt(t, r, id, rev)
}
