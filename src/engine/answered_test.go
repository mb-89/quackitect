package main

import (
	"strings"
	"testing"
)

// EVERY FINDING IS ANSWERED BY NAME, INCLUDING THE ONES NOT BEING FIXED.
//
// A ROUND THAT ANSWERS THE CHEAPEST FINDING AND IS SILENT ABOUT THE REST reads
// exactly like one that answered them all, because the evidence names what it
// did and nothing names what it did not. The gap is invisible until the
// reviewer re-runs its own reproduction, and then it costs a whole round.
//
// MEASURED ON TWO TOKENS: wk-61af3a054e came back closing finding 1 with the
// detail byte-identical and findings 2 and 3 untouched. wk-bb34ab1208 did the
// same one round earlier.
//
// NOT DECLINED WITH A REASON, WHICH IS A LEGAL ANSWER. Simply absent. So the
// refusal asks for a section per finding and does not care which of the two it
// says: closed with what proves it, or not taken with why and what owes it.
func TestASubmissionAnswersEveryFinding(t *testing.T) {
	r := lane(t)
	tok := aTokenWithFindings(t, r, 2)

	// SILENT ABOUT ONE OF THEM IS REFUSED, and the refusal names which.
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{
			"finding 1": "closed: the check now names the file it is short of",
		}})
	if a.Pull != AnswerRefused {
		t.Fatalf("a submission silent about a finding was taken: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "finding 2") {
		t.Fatalf("the refusal does not name the finding that went unanswered: %+v", a.Findings)
	}

	// AND NOT TAKING ONE IS AN ANSWER, because a reason is what a reviewer
	// needs and a silence is what it cannot read.
	a = Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{
			"finding 1": "closed: the check now names the file it is short of",
			"finding 2": "not taken: it belongs to wk-24be1c06ae, which owns the table",
		}})
	if a.Pull == AnswerRefused {
		t.Fatalf("a submission answering both findings was refused: %v", a.Findings)
	}
}

// AND A FINDING FROM AN EARLIER ROUND IS NOT ASKED FOR AGAIN, because it was
// answered when it was raised and asking twice would make every round carry
// every round before it.
func TestOnlyTheLastRoundsFindingsAreOwed(t *testing.T) {
	r := lane(t)
	tok := aTokenWithFindings(t, r, 1)
	// A second round, which raises finding 2 and leaves finding 1 behind.
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{"finding 1": "closed: it is"}})
	Pull(r, "rev", RoleReviewer, Payload{})
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "the second", Wrong: "and this one", Satisfies: "an answer"}},
		Lesson:   Lesson{Class: "a class", Avoid: "catch it", Prevents: "stop it"},
		Learned:  mint(t, r, Token{Title: "learned", Status: Backlogged}).ID})
	Pull(r, "main", RoleWorker, Payload{})

	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{"finding 2": "closed: the second one is answered"}})
	if a.Pull == AnswerRefused {
		t.Fatalf("a submission answering the round's own finding was refused: %v", a.Findings)
	}

	// AND THE SAME RULE ANSWERS THE FIRST SUBMISSION, which owes nothing
	// because nothing has been raised. It is not a special case: a token with
	// no finding from this round has no section to owe.
	fresh := mint(t, r, Token{Title: "write another thing"})
	Pull(r, "main", RoleWorker, Payload{})
	if a := Pull(r, "main", RoleWorker, Payload{ID: fresh.ID,
		Disposition: string(Done)}); a.Pull == AnswerRefused {
		t.Fatalf("a first submission was refused for answering no findings: %v", a.Findings)
	}
}

// aTokenWithFindings answers a token in work carrying n findings from one
// round, built the way the queue builds one.
func aTokenWithFindings(t *testing.T, r Roots, n int) Token {
	t.Helper()
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})
	var found []Rejection
	for i := 0; i < n; i++ {
		found = append(found, Rejection{Clause: "the check", Wrong: "it cannot fail",
			Satisfies: "one that was watched failing"})
	}
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: found,
		Lesson:   Lesson{Class: "a class", Avoid: "catch it", Prevents: "stop it"},
		Learned:  mint(t, r, Token{Title: "learned", Status: Backlogged}).ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("the rejection this rests on was refused: %v", a.Findings)
	}
	Pull(r, "main", RoleWorker, Payload{})
	return tok
}

// THE DEBT AND THE PAYMENT ARE COUNTED OVER ONE SET.
//
// says was filled for EVERY criterion and owed was counted over a subset, so a
// reviewer could satisfy a refusal raised about the subset with a key from the
// superset. On the implementation path the subset is the criteria with a
// command; on the draft path it is those carrying a recorded red as well, which
// the comment above the function calls exactly the set the gate waves through.
//
// IT WAS NOT HYPOTHETICAL. A token carrying one command criterion and one prose
// criterion could be accepted by re-watching the prose one, which nothing can be
// run against, and the criterion the gate was asking about was read by nobody.
//
// AND NO CASE IN THE SUITE COULD SEE IT, because every one drove a token with a
// single criterion, so none had a member inside the filter and one outside.
func TestARewatchNamesACriterionTheGateIsAsking(t *testing.T) {
	withCommand := Criterion{Says: "the command one", Runs: "exit 0"}
	prose := Criterion{Says: "the prose one"}

	for _, half := range []string{"this token", "the draft"} {
		tok := Token{Criteria: []Criterion{withCommand, prose}}
		if half == "the draft" {
			// On the draft path the debt is a criterion carrying a recorded red.
			tok.Criteria[0].Without = "the fix"
			tok.Criteria[0].Red = "it said so"
		}
		// THE PAYMENT FROM OUTSIDE THE SET IS REFUSED, and the refusal says it is
		// outside rather than that it names nothing.
		paid := Payload{Rewatched: map[string]string{prose.Says: "without x, it said y"}}
		// THE REFUSAL IS ABOUT THE DEBT AND NOT ABOUT THE KEY, which is the whole
		// of what round 8 asked for: a key outside the set is kept and counted for
		// nothing rather than refused, so a verdict that pays in full and records
		// more is taken. What must not pass is the debt going unpaid.
		f := somethingWasRewatched(tok, paid, half)
		if f == nil {
			t.Errorf("%s: the debt went unpaid and a key from outside the set settled it", half)
		} else if !strings.Contains(f.Wrong, withCommand.Says) {
			t.Errorf("%s: the refusal does not name what would settle it: %s", half, f.Wrong)
		}
		// AND THE PAYMENT FROM INSIDE THE SET IS STILL TAKEN. A guard that
		// refuses both is a guard nobody can satisfy.
		ok := Payload{Rewatched: map[string]string{withCommand.Says: "without x, it said y"}}
		if f := somethingWasRewatched(tok, ok, half); f != nil {
			t.Errorf("%s: a rewatch keyed to the criterion the gate asks about was refused: %s",
				half, f.Wrong)
		}
	}

	// A KEY NAMING NO CRITERION AT ALL KEEPS ITS OWN MESSAGE. They are different
	// mistakes and a reader has to be able to tell them apart.
	tok := Token{Criteria: []Criterion{withCommand}}
	f := somethingWasRewatched(tok, Payload{Rewatched: map[string]string{"nothing on this token": "x"}}, "this token")
	if f == nil || !strings.Contains(f.Wrong, "no criterion of that name") {
		t.Errorf("a key naming no criterion lost its own message: %+v", f)
	}
}

// A VOLUNTEERED OBSERVATION IS NOT AN OVERPAYMENT.
//
// The fix that held the key against the set the debt was counted over refused a
// key outside that set unconditionally. When a token owes nothing, because no
// criterion carries a recorded red, that set is EMPTY, so every key is outside
// it and a reviewer that volunteers what it watched is refused.
//
// MEASURED, BY THE REVIEWER IT CAUGHT. rev-8 met it on wk-386169824b, accepted
// without an observation because the engine's owed == 0 path intends that, and
// then rejected the token that had introduced it for exactly this.
//
// SO THE REFUSAL IS ABOUT A DEBT AND ONLY ABOUT A DEBT. A key outside the set is
// wrong when there is something to pay, because then it pays the wrong thing.
// With nothing owed there is nothing to pay wrongly, and more of the record is
// better than less.
func TestAVolunteeredObservationIsTaken(t *testing.T) {
	prose := Criterion{Says: "the prose one"}
	// Nothing here carries a command, so the implementation path owes nothing.
	tok := Token{Criteria: []Criterion{prose}}
	paid := Payload{Rewatched: map[string]string{prose.Says: "without x, it said y"}}
	if f := somethingWasRewatched(tok, paid, "this token"); f != nil {
		t.Errorf("a token that owes nothing refused a volunteered observation: %s", f.Wrong)
	}
	// AND A KEY NAMING NO CRITERION IS STILL REFUSED, whatever is owed, because
	// that is a different mistake and it stays wrong when nothing is due.
	off := Payload{Rewatched: map[string]string{"nothing on this token": "x"}}
	if f := somethingWasRewatched(tok, off, "this token"); f == nil {
		t.Error("a key naming no criterion was taken because nothing was owed")
	}
	// AND WITH A DEBT STANDING, paying the wrong one is still refused.
	owing := Token{Criteria: []Criterion{{Says: "the command one", Runs: "exit 0"}, prose}}
	if f := somethingWasRewatched(owing, paid, "this token"); f == nil {
		t.Error("a debt was paid with a criterion outside the set the gate is asking about")
	}
}

// A DRAFT ANSWERS ITS FINDINGS TOO, AND A REDRAFT THAT CHANGES NOTHING IS
// REFUSED.
//
// The refusal stood in submit and not in submitSpec, so a redraft that answered
// none of the round's findings reached a reviewer. The case the token is founded
// on is a draft round, and so is the one measured on this queue: a token arrived
// at round 5 with round 4's findings standing byte-identical.
//
// A DRAFT CARRIES NO EVIDENCE MAP, so what it answers with had to be decided
// rather than copied. IT IS THE NOTE. The drafter writes the answer into the
// detail or the criteria, which is where a draft's whole work is, and the engine
// asks whether either changed since the round was opened. A redraft whose detail
// and every criterion come back byte for byte has answered nothing, whatever it
// says, and that is a thing a program can decide.
func TestARedraftThatChangesNothingIsRefused(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Status: SpecOpen,
		Detail:   "a problem worth stating",
		Criteria: []Criterion{{Says: "it is done", Runs: "exit 1"}}})

	// Drafted, sent, rejected with a finding.
	if _, done := settle(r, "main", RoleWorker, Payload{ID: one.ID}); done {
		t.Fatal("the draft was refused")
	}
	if got := next(r, "rev-1", RoleReviewer); got.Pull != AnswerReview {
		t.Fatalf("the reviewer was handed nothing: %+v", got)
	}
	lesson := mint(t, r, Token{Title: "the lesson", Status: Backlogged})
	a, _ := settle(r, "rev-1", RoleReviewer, Payload{ID: one.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "the criteria", Wrong: "it cannot judge", Satisfies: "one that can"}},
		Lesson:   Lesson{Class: "a class", Avoid: "how to catch it", Prevents: "how to not make it"},
		Learned:  lesson.ID})
	if len(a.Findings) > 0 {
		t.Fatalf("the rejection was refused: %+v", a.Findings)
	}

	// THE REDRAFT CHANGES NOTHING. It is picked up and sent straight back.
	if got := next(r, "main", RoleWorker); got.Pull != AnswerWork {
		t.Fatalf("the drafter was handed nothing: %+v", got)
	}
	back, _ := settle(r, "main", RoleWorker, Payload{ID: one.ID})
	if len(back.Findings) == 0 {
		t.Fatal("a redraft that changed nothing reached a reviewer with a finding standing")
	}
	if !strings.Contains(back.Findings[0].Wrong, "unchanged") {
		t.Errorf("the refusal does not say what is wrong: %+v", back.Findings[0])
	}

	// AND A REDRAFT THAT CHANGES SOMETHING GOES THROUGH. A guard that refuses
	// both is a guard nobody can satisfy.
	tok, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	tok.Detail += "\n\nROUND 1 ANSWERED: the criterion now names its command."
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	// The answer rides the payload now, a section per finding, the way the
	// implementation path already takes it, and it lands on the note.
	if a, _ := settle(r, "main", RoleWorker, Payload{ID: one.ID, Evidence: map[string]string{
		"finding 1": "the criterion now names its command"}}); len(a.Findings) > 0 {
		t.Errorf("a redraft that answered its finding was refused: %+v", a.Findings)
	}
}

// AND A SECTION HEADED finding 10 DOES NOT ANSWER finding 1.
//
// answers matched by substring, so one section could satisfy every finding whose
// number is a prefix of its own. Ten findings and a section for the tenth is
// nine silences the gate reads as answers.
func TestAFindingIsAnsweredByItsOwnNumber(t *testing.T) {
	t.Helper()
	said := map[string]string{"finding 10": "what closed it"}
	if !answers(said, "finding 10") {
		t.Error("a section headed finding 10 does not answer finding 10")
	}
	if answers(said, "finding 1") {
		t.Error("a section headed finding 10 was read as answering finding 1")
	}
}

// TEN FINDINGS AND ONE SECTION FOR THE TENTH IS NINE SILENCES.
//
// The refusal asked whether any evidence key CONTAINED "finding N", so a section
// headed finding 10 answered finding 1, and finding 20 answered finding 2. This
// refusal is the only thing between a silent round and a reviewer, so the whole
// of it rested on a substring. The numbering on this queue already reaches
// double figures.
//
// IT IS DRIVEN AT THE GATE and not only on the helper, because the helper is
// what the gate happens to call today and the claim is about the gate.
func TestASectionForTheTenthDoesNotAnswerTheFirst(t *testing.T) {
	tok := Token{Rounds: 1}
	for i := 0; i < 10; i++ {
		tok.Findings = append(tok.Findings, Rejection{Round: 1,
			Clause: "clause " + itoaFinding(i+1), Wrong: "w", Satisfies: "s"})
	}
	only := Payload{Evidence: map[string]string{"finding 10": "what closed it"}}
	f := everyFindingAnswered(tok, only)
	if f == nil {
		t.Fatal("a round owing ten findings was answered by one section and taken")
	}
	if !strings.Contains(f.Wrong, "finding 1,") && !strings.Contains(f.Wrong, "finding 1 ") {
		t.Errorf("the refusal does not name finding 1: %s", f.Wrong)
	}
	// AND THE ONE THAT IS ANSWERED IS NOT NAMED, so the refusal is about what is
	// missing rather than a list of everything.
	if strings.Contains(f.Wrong, "finding 10,") {
		t.Errorf("the refusal names finding 10, which was answered: %s", f.Wrong)
	}
}

func itoaFinding(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	return string(rune('0'+n/10)) + string(rune('0'+n%10))
}

// THE RULE IS ABOUT THE WHOLE MAP AND THE REFUSAL WAS PER KEY.
//
// A verdict that PAYS THE DEBT IN FULL and carries one observation more was
// refused for the extra one. That is a reviewer punished for recording more than
// it owed, and the record is worse for it.
//
// SO THE QUESTION IS ASKED OF THE MAP: is the debt paid. A key naming no
// criterion at all is still refused per key, because that is a mistake whatever
// else the map carries.
func TestPayingTheDebtAndMoreIsTaken(t *testing.T) {
	owing := Criterion{Says: "the command one", Runs: "exit 0"}
	prose := Criterion{Says: "the prose one"}
	tok := Token{Criteria: []Criterion{owing, prose}}

	// THE DEBT PAID, AND ONE MORE BESIDE IT.
	both := Payload{Rewatched: map[string]string{
		owing.Says: "without the fix, it said no",
		prose.Says: "and I looked at this one too",
	}}
	if f := somethingWasRewatched(tok, both, "this token"); f != nil {
		t.Errorf("a verdict that paid the debt and recorded more was refused: %s", f.Wrong)
	}

	// THE DEBT NOT PAID, and the only key is outside the set the gate asks about.
	only := Payload{Rewatched: map[string]string{prose.Says: "I looked at this one"}}
	if f := somethingWasRewatched(tok, only, "this token"); f == nil {
		t.Error("the debt went unpaid and a key from outside the set settled it")
	}

	// AND A KEY NAMING NO CRITERION IS STILL REFUSED, whatever else is paid.
	odd := Payload{Rewatched: map[string]string{
		owing.Says:              "without the fix, it said no",
		"nothing on this token": "x",
	}}
	f := somethingWasRewatched(tok, odd, "this token")
	if f == nil || !strings.Contains(f.Wrong, "no criterion of that name") {
		t.Errorf("a key naming no criterion was taken because the debt was paid: %+v", f)
	}
}
