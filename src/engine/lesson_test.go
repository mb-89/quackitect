package main

import (
	"strings"
	"testing"
)

// A REJECTION NAMES THE TOKEN THE REVIEWER MINTED FOR THE LESSON.
//
// A lesson is a judgment. Which class a finding belongs to, whether a second
// round is a new class or the one already written down, and whether it goes to
// the backlog or straight into what is open, are all things somebody reading
// the two decides. The engine cannot, and matching on the words would be a
// word list fitted to the cases already seen.
//
// SO THE ENGINE'S PART IS THE REFUSAL. A rejection carries the id, the engine
// checks that the id is a token, and one naming none is refused the way one
// with no finding is.
func TestARejectionNamesTheLessonsToken(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})

	const class = "a check built from the fix, which cannot go red"
	lesson := Lesson{Class: class, Avoid: "write the check first and watch it go red"}
	findings := []Rejection{{Clause: "the check", Wrong: "it cannot fail",
		Satisfies: "one that was watched failing"}}

	// NAMING NOTHING IS REFUSED.
	//
	// EACH REFUSAL IS ASSERTED ON WHAT ONLY IT CAN SAY. Both of these were once
	// matched on the word mint, which the neighbouring refusal also carries, so
	// either case would have passed for the other and neither was guarded.
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson})
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection that minted nothing was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "names no token") {
		t.Fatalf("the refusal does not say the lesson names no token: %+v", a.Findings)
	}

	// AND A REJECTION WITH NO FINDING AT ALL IS REFUSED, which nothing drove:
	// deleting that refusal left the whole suite green. It is the first of the
	// three and the one a worker meets most, because a reviewer with a class in
	// mind and nothing concrete is exactly the round this queue exists to stop.
	a = Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Lesson: lesson, Learned: tok.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection with a lesson and no finding was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "no finding") {
		t.Fatalf("the refusal does not say there is no finding: %+v", a.Findings)
	}

	// AND SO IS NAMING SOMETHING THAT IS NOT A TOKEN. This one names the id it
	// was handed, which the refusal above cannot do because there is no id.
	a = Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: "wk-nothing"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection naming a token nobody minted was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "wk-nothing") {
		t.Fatalf("the refusal does not name the id it was handed: %+v", a.Findings)
	}

	// A REJECTION THAT NAMES ONE IS ACCEPTED, and the id is on the lesson.
	learned := mint(t, r, Token{Title: "learned: a check", Status: Backlogged,
		Detail: "THE CLASS: " + class})
	a = Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: learned.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a whole rejection was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if n := len(back.Lessons); n != 1 {
		t.Fatalf("the token carries %d lessons", n)
	}
	if back.Lessons[0].Learned != learned.ID {
		t.Fatalf("the lesson names %q rather than the token that was minted", back.Lessons[0].Learned)
	}
	// AND THE REVIEWER DECIDED WHERE IT GOES. The engine did not touch it.
	still, _ := LoadToken(r, learned.ID)
	if still.Status != Backlogged {
		t.Fatalf("the engine moved the reviewer's token to %s", still.Status)
	}
}

// learnedFrom mints the token a reviewer would mint for a lesson, so a test
// sending a rejection sends a whole one.
func learnedFrom(t *testing.T, r Roots, l Lesson) string {
	t.Helper()
	made, err := Mint(r, Token{Title: "learned: a class", Status: Backlogged,
		Detail: "THE CLASS: " + l.Class, Assignee: "main", MintedBy: "rev"})
	if err != nil {
		t.Fatal(err)
	}
	return made.ID
}

// A DRAFT SENT BACK IS SENT BACK THE SAME WAY.
//
// rejectionIsWhole guards two doors, the spec's and the implementation's, and
// only one of them was driven. A rule enforced in one place and checked in the
// other is a rule that lasts until somebody edits the one nobody watches.
func TestASpecRejectionNamesTheLessonsTokenToo(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	Pull(r, "reviewer", RoleReviewer, Payload{})

	const class = "a criterion whose command does not decide its sentence"
	lesson := Lesson{Class: class, Avoid: "read the command and ask what file it names"}
	findings := []Rejection{{Clause: "the criteria", Wrong: "the command is borrowed",
		Satisfies: "one that decides the sentence above it"}}

	a := Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson})
	if a.Pull != AnswerRefused {
		t.Fatalf("a spec rejection that minted nothing was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "names no token") {
		t.Fatalf("the refusal does not say the lesson names no token: %+v", a.Findings)
	}

	a = Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: "wk-nothing"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a spec rejection naming a token nobody minted was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "wk-nothing") {
		t.Fatalf("the refusal does not name the id it was handed: %+v", a.Findings)
	}

	// A DRAFT SENT BACK WITH NO FINDING IS REFUSED THE SAME WAY.
	a = Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Lesson: lesson, Learned: tok.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a spec rejection with no finding was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "no finding") {
		t.Fatalf("the refusal does not say there is no finding: %+v", a.Findings)
	}

	// AND ONE THAT NAMES A TOKEN SENDS THE DRAFT BACK TO ITS DRAFTER.
	learned := mint(t, r, Token{Title: "learned: a criterion", Status: Backlogged,
		Detail: "THE CLASS: " + class})
	a = Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: learned.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a whole spec rejection was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != SpecOpen {
		t.Fatalf("a rejected draft is %s", back.Status)
	}
	if n := len(back.Lessons); n != 1 || back.Lessons[0].Learned != learned.ID {
		t.Fatalf("the lesson did not land with its token: %+v", back.Lessons)
	}
}

// THE REST OF THE REFUSALS ON THE REVIEWER'S PATH.
//
// NINE REFUSALS STAND ON THAT PATH. rejectionIsWhole carries four and each of
// those is watched. The five beside them, in judge and judgeSpec, were watched
// by nothing: each could be deleted with the whole suite green.
//
// EACH CASE ASSERTS ON WHAT ONLY ITS REFUSAL CAN SAY. Three of the five stand
// in sequence in judge, so a case that asked only whether the call was refused
// would pass with any one of them deleted, which is the class this token is
// about.
func TestAReviewerMayNotJudgeWhatItSubmitted(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})

	// THE FOUR-EYES RULE, which reviewing.md states as its own section and
	// nothing watched. main submitted it, so main may not judge it.
	a := Pull(r, "main", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("the submitter judged its own token: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "cannot judge it") {
		t.Fatalf("the refusal does not say the submitter cannot judge it: %+v", a.Findings)
	}
}

func TestAVerdictOnATokenInAnotherStatusIsRefused(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})

	// IT IS IN WORK AND NOT IN REVIEW, so there is nothing to judge. The
	// refusal names the status and not the reviewer.
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a token that is not in review was judged: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "not with you") {
		t.Fatalf("the refusal does not say the token is not with you: %+v", a.Findings)
	}
	if a.Findings[0].Clause != "status" {
		t.Fatalf("the refusal is not about the status: %q", a.Findings[0].Clause)
	}
}

func TestASecondReviewerOnAHeldSphereIsRefused(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})

	// ONE SPHERE HAS ONE REVIEWER. rev holds it, so a second reviewer is
	// told whose it is rather than merely refused.
	a := Pull(r, "rev2", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a second reviewer judged a held token: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "newer reviewer holds this sphere") {
		t.Fatalf("the refusal does not say another reviewer holds it: %+v", a.Findings)
	}
}

func TestADrafterMayNotAgreeItsOwnSpec(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	Pull(r, "rev", RoleReviewer, Payload{})

	// THE SAME RULE ON THE OTHER HALF. main drafted it, so main may not
	// agree it, and the refusal says agree rather than judge.
	a := Pull(r, "main", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("the drafter agreed its own spec: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "cannot agree it") {
		t.Fatalf("the refusal does not say the drafter cannot agree it: %+v", a.Findings)
	}
}

func TestASpecNotWithThisReviewerIsRefused(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	Pull(r, "rev", RoleReviewer, Payload{})

	// rev holds the draft, so rev2 is told it is not theirs. This refusal
	// stands behind the drafter refusal, and rev2 is not the drafter, so it
	// is the only one that can answer here.
	a := Pull(r, "rev2", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a spec held by another reviewer was judged: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "not with you") {
		t.Fatalf("the refusal does not say the spec is not with you: %+v", a.Findings)
	}
}
