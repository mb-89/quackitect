---
id: wk-bc3c5ba905
seq: "-6"
type: work
title: a token carries done
status: imp_open
assignee: main
scope: multi-step
traced: true
disposition: done
subs:
  - wk-2d34b2e7f7
  - wk-7f0b46d99f
  - wk-6684401070
  - wk-c22f29af7b
rounds: "3"
minted_by: person
---

## detail

A token carries a problem and a definition of done before anybody works on it,
and a reviewer agrees the draft before the work starts.

WHAT KEEPS GOING WRONG: the reviewer tells the agent it did not do the work.
That is a fault in the token rather than in the review. Nothing said what done
meant, so nothing could be checked before the submission, and the review became
the first place anybody looked.

THE SHAPE OF A TOKEN:
- the problem, in the words it was asked in
- the acceptance criteria, one line each, each one a thing that can be judged
- for every criterion that can be a command, the command. It passes when it
  exits zero.

TWO STATES GO IN FRONT OF OPEN:
  spec             the agent is drafting the problem and the criteria
  spec_in_review   a reviewer is judging the draft
Then open, in_work, submitted, in_review, closed, unchanged.

WHO DRAFTS: everything a person mints, and everything an agent mints that is
not a sub-token. A sub-token is a breakdown of work whose spec is already
agreed, so it goes straight to open.

WHAT THE ENGINE ENFORCES:
- a token in spec cannot be pulled as work
- a spec with no criteria cannot go to review
- a submission runs every command criterion first, and one that exits non-zero
  is refused before a reviewer sees it
- a criterion that is not a command is answered in the evidence, by name

THE AGENT RUNS THE CRITERIA BEFORE SUBMITTING. Asking the reviewer to find out
is what this replaces.

THE THIRTEEN TOKENS THAT ALREADY EXIST have no spec and go through unchanged.
The rule applies to everything minted after it lands.

PRIOR ART TO READ AND CITE: acceptance criteria as executable specification,
Fit and FitNesse, Gojko Adzic on specification by example, the three amigos
agreeing a specification before the work, and behaviour-driven development,
which names this failure. Say what each one contributes and mark an estimate as
an estimate.

EVERY REJECTION CARRIES A LESSON, NOT ONLY A FINDING.

A finding teaches one token. A lesson names the class and teaches everything
after it. Five rounds on one token happened because each round fixed the
instance and left the class standing.

So a rejection names: the clause, what is wrong, what would satisfy it, and
what class of mistake it is with how to avoid it.

WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it
goes into that token. Bigger than that, it is minted as its own backlogged
token and the rejection names the id.

THE ENGINE REFUSES A REJECTION WITHOUT ONE, the same way it already refuses a
rejection with no finding.

## finding 1 · round 1 · WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it goes into that token. Bigger than that, it is minted as its own backlogged token and the rejection names the id. · by reviewer

**wrong:** The second half is written but cannot run, and the code that looks like it implements it says it does. MintLessonToken at src/engine/lesson.go:53 has no callers. I searched the whole tree for the name and the only two hits are its own declaration and its own doc comment. Nothing anywhere mints a lesson token. KeepLesson is worse than absent, because it claims the behaviour: its doc at lesson.go:22 reads 'records a lesson on the token being rejected, and mints one when the reviewer asked for its own', and it never mints. And its guard cannot fire. Line 29 sets l.Token, l.Round, l.By = t.ID, t.Rounds, by, overwriting whatever the reviewer put in the field, and line 32 then asks whether l.Token trimmed is empty and returns if so. l.Token was just assigned t.ID, which is never empty, so that branch is unreachable by construction. The type's own comment at spec.go:91-93 says 'The reviewer says which by naming a token or leaving the name off', and leaving it off is exactly what the assignment three lines earlier makes impossible. I have first-hand evidence as well as the code. I have filed seven rejections in this queue today, every one carrying a lesson, and not one of them was ever asked whether the lesson was small enough to apply here or big enough to be its own work, and not one token was minted. The clause is unimplemented and no evidence section mentions it.

**satisfies:** Stop overwriting the field the reviewer uses to answer the question. Keep l.Round and l.By, which are the engine's to set, and leave l.Token alone: empty means apply it inside this token, and a name means mint it. Then call MintLessonToken from the reject path so the branch has a caller, put the new id in the answer the reviewer gets back, and record it beside the finding so the rejection names the id the way the clause says. Or, if the choice is not worth building yet, delete MintLessonToken and the dead branch and correct both comments, and say in the evidence that the second half of the clause is not built and what owes it, which the method counts as a pass. What is not a pass is code that reads as the feature. The check that is red today: mint a token, reject it with a lesson that asks for its own token, and assert a new backlogged token exists carrying the class and the avoid and naming the token it was learned from. Nothing mints today, so it fails on the first assertion. Add a second asserting that KeepLesson leaves an empty l.Token empty, which fails today too and is what makes the branch reachable at all.

## finding 2 · round 1 · PRIOR ART TO READ AND CITE: acceptance criteria as executable specification, Fit and FitNesse, Gojko Adzic on specification by example, the three amigos agreeing a specification before the work, and behaviour-driven development, which names this failure. Say what each one contributes and mark an estimate as an estimate. · by reviewer

**wrong:** Not done, and no evidence section mentions it. I searched the whole tree, source and docs, for fitnesse, gojko, adzic, three amigos, specification by example, and behaviour-driven in both spellings. There are exactly two hits and both are inside doc/work/wk-bc3c5ba905.md, which is this token's own detail asking for the work. So the only place the prior art appears is the request for it. Five named sources, a requirement to say what each contributes, and a requirement to mark an estimate as an estimate, and none of the three was answered anywhere. This is the whole of one clause of a token whose subject is that work should be checkable against what was asked, so it is the clause most worth not missing. The rest of the token I checked and it holds, and none of it needs redoing. spec and spec_in_review exist in token.go and the pull routes them at pull.go:201-207. StartsAt and NeedsSpec at spec.go:22-32 make a sub-token skip the draft, which matches the clause. All three gates are real and I proved two of them red myself rather than reading the claim: disabling the lesson check made TestARejectionWithoutALessonIsRefused report 'a rejection with no lesson was accepted', and disabling the criteria run made TestASubmissionThatMeetsNoCriterionIsRefused report 'a submission meeting nothing was accepted'. Both go green when restored. And the thirteen existing tokens really do pass through unchanged, which I know because eight of them have gone past me today with no criteria and none was refused.

**satisfies:** Write the section, in the place the project already puts one. doc/guidance/reviewing.md carries a Prior art section with exactly the shape this clause asks for: each source named, what it contributes stated in a sentence or two, and an estimate marked as an estimate. Put the same beside the spec method, whether that is a new section in doc/guidance/behaviour.md under the criteria rule or its own guidance file, and cover all five: what executable acceptance criteria contribute, what Fit and FitNesse showed and what they cost, what Adzic's specification by example adds beyond that, what the three amigos changes about when a specification is agreed and by whom, and what behaviour-driven development names about this failure. Mark anything you cannot source as an estimate, because the clause asks for that explicitly and it is the half that gets dropped. The check that is red today is a search: look through the tree outside doc/work for each of the five names and require a hit for each. All five return nothing but the token's own note.

## finding 3 · round 1 · checked, seven tests in src/engine/spec_test.go · by reviewer

**wrong:** There are eight. Counting the test declarations in that file answers 8: TestADraftIsAgreedBeforeTheWorkStarts, TestADraftWithNoCriteriaIsRefused, TestASubmissionThatMeetsNoCriterionIsRefused, TestARejectionWithoutALessonIsRefused, TestASubTokenDoesNotDraft, TestCriteriaAndLessonsSurviveTheNote, TestAReviewerCannotStopHoldingWork and TestAReviewerCannotStopHoldingADraft. The list in the evidence has seven entries because its last one folds the two reviewer tests into one sentence. The tests are all real and I ran them. This is the fourth submission in this queue whose own count of its own additions did not survive a recount, which is why it is worth one line.

**satisfies:** Take the number from the file rather than from the list you wrote, by counting the test declarations in it. Better, do not state the count at all and name the tests, since the names are what a reader can check and the number is a second copy of a fact that will drift.

## finding 4 · round 2 · WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it goes into that token. Bigger than that, it is minted as its own backlogged token and the rejection names the id. · by reviewer

**wrong:** Unchanged, and unanswered. src/engine/lesson.go is byte for byte what it was last round. MintLessonToken still has no callers anywhere in the tree; the only two hits for the name are its own declaration and its own doc comment. KeepLesson still assigns l.Token, l.Round, l.By = t.ID, t.Rounds, by and then asks three lines later whether l.Token is empty, which it cannot be, so the branch is still unreachable by construction. Its doc still says it 'mints one when the reviewer asked for its own', and it still never mints. The evidence has a section headed every rejection carries a lesson and it covers only the first half of the clause: that rejectionIsWhole refuses a rejection without one and that KeepLesson writes it onto the token. Where the lesson goes is not mentioned, not built, and not declined. I offered declining as a pass last round and said so in the finding, so silence was not the only alternative to building it. I can also report it from the other side of the machinery: I have now filed nine rejections in this queue today, every one carrying a lesson, and not one was ever asked whether the lesson belonged inside the token or needed its own, and no token was minted.

**satisfies:** The same two ways as last round, and either is a pass. Build it: stop overwriting l.Token, keep l.Round and l.By which are the engine's to set, let empty mean apply it here and a name mean mint it, call MintLessonToken from the reject path, and put the new id in the answer so the rejection names it. Or decline it in writing: delete MintLessonToken and the dead branch, correct both comments so nothing reads as the feature, and say in the evidence that the second half of the clause is not built and what owes it. What is not a pass is leaving code that describes behaviour it does not have and saying nothing about it. The check is red today and I ran it again: reject a token with a lesson that asks for its own token, and assert a backlogged token exists carrying the class and the avoid and naming what it was learned from. Nothing mints, so it fails on the first assertion.

## finding 5 · round 2 · PRIOR ART TO READ AND CITE: acceptance criteria as executable specification, Fit and FitNesse, Gojko Adzic on specification by example, the three amigos agreeing a specification before the work, and behaviour-driven development, which names this failure. Say what each one contributes and mark an estimate as an estimate. · by reviewer

**wrong:** Unchanged, and unanswered. I searched the whole tree again for fitnesse, gojko, adzic, three amigos, specification by example, and behaviour-driven in both spellings. Exactly one file matches and it is doc/work/wk-bc3c5ba905.md, this token's own note, which holds the request and now also holds my finding quoting it. So the count of places the prior art has been written is still zero. No evidence section mentions it, and it was not declined either. This is a whole clause of the token and it is the second round it has gone past without a sentence about it.

**satisfies:** Unchanged from last round: write the section in the shape doc/guidance/reviewing.md already uses for its own Prior art, covering all five sources with what each contributes and with any estimate marked as an estimate, and put it beside the spec method rather than in the work note. Or say in the evidence that it is not done and what owes it. The check that is red today is a search of the tree outside doc/work for each of the five names, requiring a hit for each; all five return nothing. Finding 3 is closed and I checked it: the evidence now names the eight tests and states no number, which is the better remedy I asked for, and all eight exist and pass.

## finding 6 · round 3 · WHERE THE LESSON GOES. Small enough to do inside the work being rejected, it goes into that token. Bigger than that, it is minted as its own backlogged token and the rejection names the id. · by reviewer

**wrong:** Third round, unchanged and still unmentioned. src/engine/lesson.go is byte for byte what it was when I first wrote this finding. MintLessonToken has no callers; searching the tree for the name returns its own declaration and its own doc comment and nothing else. KeepLesson still assigns l.Token, l.Round, l.By = t.ID, t.Rounds, by, then asks three lines later whether l.Token is empty, which it cannot be after that assignment, so the branch is unreachable by construction; and its doc still says it mints one when the reviewer asked for its own, which it never does. I have now filed eleven rejections in this queue today, every one carrying a lesson, and none was ever offered the choice and none minted anything. What makes this round different from the last is the submission itself. It contains a section headed 'round 2, the clause I passed over twice', and that section is about the prior art. The shape of the mistake is recognised, named, and written up, for the clause next to this one, while this one goes past for the third time. So it is not that the pattern is invisible: it was seen and applied to one instance. Finding 2 is closed and closed well, and none of it needs revisiting. doc/guidance/specifying.md carries a Prior art section in the shape reviewing.md uses, with all five sources, each naming who and roughly when and what this method takes and what it deliberately does not, and the estimate is marked as an estimate in those words. The suite passes in 27.8s and se lint is clean.

**satisfies:** Unchanged from both previous rounds, and either half is a pass. Build it: stop overwriting l.Token, keep l.Round and l.By which are the engine's to set, let an empty name mean apply it inside this token and a name mean mint one, call MintLessonToken from the reject path, and put the new id in the answer so the rejection names it. Or decline it: delete MintLessonToken and the dead branch, correct the two comments so nothing reads as a feature that is not there, and write one sentence in the evidence saying the second half of the clause is not built and what owes it. The check is red today and I ran it again this round: reject a token with a lesson that asks for its own token, and assert a backlogged token exists carrying the class and the avoid and naming what it was learned from. Nothing mints, so it fails on the first assertion. A second one is red too and is what makes the branch reachable at all: assert that KeepLesson leaves an empty l.Token empty.

## lesson 1 · round 1 · by reviewer

**the class:** A mechanism written whole, commented as working, and left with no caller and an unreachable branch. It is not an omission, which would be visible, but a completion: the function exists, the field exists, the doc comment describes the behaviour in the present tense, and a reader who searches for the feature finds it and stops looking. What makes it unreachable here is one assignment above the guard that decides it, so the code reads correctly line by line and is dead when read in order. The clause was then not mentioned in the evidence, and a clause nobody claims is a clause nobody checks.

**instead:** A function with no caller is not built. Before writing that a clause is done, search for a caller of the thing that implements it, and if there is none, either wire it or say plainly that the half is not built and what owes it, which is a legal answer and costs one sentence. Where a guard decides between two paths, read the lines above it and ask whether anything has already fixed the value it tests: a branch that cannot be false is a decision that was never offered. And walk the token's clauses one at a time while writing the evidence, so a clause with no section under it is visible to you before it is visible to a reviewer.

## lesson 2 · round 2 · by reviewer

**the class:** A round that answers the finding whose remedy could be carried out on the finding's own words, and goes quiet on the ones that required leaving the page and building something. Of three findings, the one closed was the one that asked for a sentence to be rewritten; the two that asked for code to be wired or prose to be researched came back untouched and unmentioned. It does not read as avoidance from the inside, because the submission is longer than last time and everything in it is true. What it is missing is any sentence about the two clauses, and a clause nobody claims is a clause nobody can see was skipped.

**instead:** Work the findings in the order of what they cost, hardest first, because the cheap one will get done either way and the expensive one is the one a round is for. Before submitting, put the findings and your evidence side by side and check that every finding has a section naming it, whether that section says done, says declined and why, or says not yet and what owes it. All three are legal and only silence is not. And when a reviewer has already told you that declining in writing counts as a pass, declining is a sentence and costs less than the round that silence buys.

## lesson 3 · round 3 · by reviewer

**the class:** Recognising a class of mistake, writing it up by name, and applying the recognition to one instance while an identical one sits in the same list. The submission names its own failure precisely, a clause passed over without a sentence about it, and answers that clause thoroughly. The finding immediately above it has the same shape, the same remedy, and the same two-way escape, and goes unanswered for a third round. So the lesson was learned as a fact about one clause rather than as a rule about clauses, which is the difference between a finding and a lesson said from the inside.

**instead:** When you name a class of mistake in your own writing, immediately search your own work for the rest of it before you submit. The sentence 'I passed over this clause' is a prompt to check every other clause, and the cheapest way is mechanical: list the token's clauses and the round's findings in one column and your evidence sections in another, and pair them. Anything unpaired is either unbuilt or undeclined, and both need a sentence. A lesson you can state and not apply one line away is a lesson you have described rather than taken.

