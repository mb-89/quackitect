---
id: wk-2fb5bf5bb1
seq: 1000015
type: work
title: a lesson prevents
status: imp_done
assignee: cowork
scope: single-step
traced: true
disposition: done
depends_on:
  - wk-24be1c06ae
rounds: 3
minted_by: person
submitted_by: cowork
evidence:
  - outcome
---

## detail

Give a lesson a third field, prevents, saying what would have stopped the mistake, beside avoid, which says what would have caught it. The engine refuses a rejection whose lesson leaves it empty. No rate goes into the method, only the case, wk-2b78b911b1. prevents goes into the shape table of wk-24be1c06ae as a block by design.

## done when

- A lesson carries prevents, written to the note and read back whole
  `rg -q func.TestALessonCarriesWhatWouldHavePreventedIt src/engine && go test -C src/engine -count=1 -run TestALessonCarriesWhatWouldHavePreventedIt$ .`
- A rejection whose lesson leaves prevents empty is refused, naming the field and what belongs in it
  `rg -q func.TestARejectionWithoutAPreventionIsRefused src/engine && go test -C src/engine -count=1 -run TestARejectionWithoutAPreventionIsRefused$ .`
- Deleting that one refusal with the other three standing gets the rejection accepted, so it is asserted on what only it can say
  `rg -q func.TestOnlyThePreventionRefusalCanSayIt src/engine && go test -C src/engine -count=1 -run TestOnlyThePreventionRefusalCanSayIt$ .`
- The lesson section of doc/guidance/reviewing.md says what the two halves are, and the check reads that section only
  `rg -q func.TestTheReviewMethodAsksForBothHalves src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodAsksForBothHalves$ .`
- The same section carries the measured case and one lost round, and no rate
  `rg -q func.TestTheReviewMethodCarriesItsMeasurement src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodCarriesItsMeasurement$ .`
- A review pull answer carries reviewing.md, and the check reads it from the answer
  `rg -q func.TestTheReviewMethodRidesWithAReview src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodRidesWithAReview$ .`
- Every test above was watched failing with its change absent, and the evidence says what was seen and taken away

## evidence: outcome

Lesson carries prevents, store.go reads it back, and rejectionIsWhole in pull.go refuses without it. reviewing.md names both halves and the case, and the review answer carries it. All six tests were watched red, then green.
