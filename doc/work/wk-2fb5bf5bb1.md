---
id: wk-2fb5bf5bb1
seq: 1000015
type: work
title: a lesson prevents
status: spec_submitted
assignee: main
scope: single-step
traced: true
minted_by: person
---

## detail

THE OWNER'S WORDS: I do not only want the reviewer to tell us how we can find the mistakes in the future. I want the reviewer to write guidance on how to avoid them in the first place. What would have helped to just not make that mistake? Is there a best practice that would help if we adhere to it? Bake that into the guidance for the reviewer. WHAT A LESSON CARRIES TODAY. Two fields, the class and the instead. The class names what went wrong as a kind rather than as an instance, and the instead says what to do about it. Read the lessons in this record and the instead is nearly always a way to CATCH the mistake: run the sweep, follow the citation, put the defect back. That is detection, and it is worth having. WHAT IS MISSING IS THE HALF BEFORE. A practice that would have stopped the mistake being made, which is a different sentence and often a shorter one. Catching a typed list means sweeping for it. Not making one means asking, before writing a command over a set, where that set is declared and whether the tree already walks it. THE TWO ARE NOT THE SAME AND ONE DOES NOT IMPLY THE OTHER. A detection rule is read by somebody already suspicious. A prevention rule is read by somebody who has not started, and it has to be short enough to be remembered at the moment of writing rather than at the moment of reviewing. WHERE IT GOES. doc/guidance/reviewing.md, which is what a reviewer is handed on a review pull, and the engine's refusal on a rejection is where it can be required. WHAT WANTS DECIDING, AND IT IS THE OWNER'S. Whether a third field is added to a lesson, or whether the instead is required to carry both halves and a reviewer is told to write both. A third field is checkable and a required half is not, and this project has learned that a rule the engine can refuse is a rule that holds. MEASURED, SO THE FIRST DRAFT HAS A NUMBER: 61 tokens have reached a review and 106 rejections stand across them, a failure rate of 174 per cent, and the commonest class by a wide margin is a criterion saying every about a set the drafter described instead of asked.

THE CHOICE TAKEN, AND THE OWNER MAY OVERRULE IT. A third field on a lesson,
called prevents, rather than a longer instead. The reason is this project's own
history: a rule the engine can refuse is a rule that holds, and a rule a
reviewer is told to remember is a rule that lasts until the round somebody is
tired. Lesson already carries class and avoid, and avoid is nearly always
detection, so asking for both halves in one field would leave the engine unable
to tell which half is missing.

AND IT IS THE ELEVENTH FIELD, which is a cross-check rather than a coincidence.
wk-24be1c06ae exists because the note's parser loses a field nobody thought
about, and its walk goes red on a string field the shape table does not answer
for. Adding prevents to Lesson is exactly the commit that token is waiting for,
so this one puts the field in the table as a block by design and the walk stays
green for a reason rather than by luck.

## done when

- A lesson carries a third field, prevents, which says the practice that would have stopped the mistake being made rather than the one that would have caught it, and it is written to the note and read back whole
  `rg -q func.TestALessonCarriesWhatWouldHavePreventedIt src/engine && go test -C src/engine -count=1 -run TestALessonCarriesWhatWouldHavePreventedIt$ .`
- A rejection whose lesson leaves prevents empty is refused, and the refusal names the field and says what belongs in it, so a reviewer who has written a way to catch the mistake can tell that a way to avoid it is what is wanted
  `rg -q func.TestARejectionWithoutAPreventionIsRefused src/engine && go test -C src/engine -count=1 -run TestARejectionWithoutAPreventionIsRefused$ .`
- The refusal is asserted on what only it can say, because it stands in a line with the refusals for a missing finding, a missing lesson and a lesson naming no token, and a case asking only whether the call was refused passes with any of them deleted
  `rg -q func.TestARejectionWithoutAPreventionIsRefused src/engine && go test -C src/engine -count=1 -run TestARejectionWithoutAPreventionIsRefused$ .`
- prevents is in the shape table on wk-24be1c06ae as a block by design, so the reflective walk over the record answers for it rather than going red on a field nobody classified
  `rg -q prevents doc/work/wk-24be1c06ae.md`
- The method says what the two halves are and how they differ, in doc/guidance/reviewing.md under the section about every rejection carrying a lesson, and the check reads that section rather than the whole file
  `rg -q func.TestTheReviewMethodAsksForBothHalves src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodAsksForBothHalves$ .`
- It carries the measurement it came from rather than the claim alone: that 61 tokens have reached a review with 106 rejections across them, a rate of 174 per cent, and that the commonest class is a criterion saying every about a set the drafter described instead of asked
  `rg -q func.TestTheReviewMethodCarriesItsMeasurement src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodCarriesItsMeasurement$ .`
- The method rides with a review pull, so a reviewer reads the new half without being told: the answer to a review pull carries reviewing.md and the check reads it out of the answer rather than off disk
  `rg -q func.TestTheReviewMethodRidesWithAReview src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodRidesWithAReview$ .`
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. For the refusal the change taken away is the refusal itself, deleted on its own with the others left standing. The evidence says what was seen and what was taken away each time

