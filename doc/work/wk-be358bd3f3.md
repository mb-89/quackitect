---
id: wk-be358bd3f3
seq: 66
type: work
title: answer every finding
status: imp_done
assignee: cowork
scope: single-step
traced: true
disposition: done
rounds: 2
evidence:
  - outcome
minted_by: reviewer4
submitted_by: cowork
---

## detail

Answer every finding by name, one section each, closed with proof or not taken with why. The engine refuses a submission that leaves a standing finding unanswered, on both paths. Found on wk-61af3a054e and wk-bb34ab1208.

## done when

- A redraft that changes nothing is refused, and one that changes something goes through.
  `rg -q func.TestARedraftThatChangesNothingIsRefused src/engine && go test -C src/engine -count=1 -run TestARedraftThatChangesNothingIsRefused$ .`
- A redraft answering none of three findings is refused naming them, and fully answered it reaches review with the answers on the note.
  `rg -q func.TestAPartialRedraftIsRefusedByName src/engine && go test -C src/engine -count=1 -run TestAPartialRedraftIsRefusedByName$ .`
- A finding is answered by its own number and by nothing else.
  `rg -q func.TestAFindingIsAnsweredByItsOwnNumber src/engine && go test -C src/engine -count=1 -run TestAFindingIsAnsweredByItsOwnNumber$ .`
- A section for the tenth does not answer the first.
  `rg -q func.TestASectionForTheTenthDoesNotAnswerTheFirst src/engine && go test -C src/engine -count=1 -run TestASectionForTheTenthDoesNotAnswerTheFirst$ .`
- Silence about a standing finding is refused by name on both paths, and truth stays the reviewer's.

## evidence: outcome

everyFindingAnswered runs at pull.go:306 on the implementation path and at pull.go:387 in submitSpec. answers matches finding N with a digit boundary, and Rejection carries Answer at token.go:187. All four named tests pass.
