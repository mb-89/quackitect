---
id: wk-40ae28cd1a
seq: 1000020
type: work
title: a reclaim strands specs
status: spec_submitted
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

TWO BUGS, ONE DEAD END, AND THE QUEUE CANNOT MOVE UNTIL BOTH ARE FIXED. MEASURED NOW: wk-2b78b911b1 is spec_in_review, held by reviewer9, which was stopped and will not come back. Nothing in the engine can return it. FIRST, THE RECLAIM KNOWS ONE HALF OF THE MACHINE. Reclaim in src/engine/arrival.go answers only two states: for a reviewer it takes imp_in_review back to imp_submitted, and for a worker it takes imp_in_work back to imp_open. spec_in_review and spec_in_work are not there. The eleven states were built as two halves with the same four verbs, so that somebody who has learned one half has learned the other, and the reclaim learned one half. A drafter or a spec reviewer that dies holding a token strands it for good. SECOND, THE NOTICE NAMES A REMEDY THE ENGINE FORBIDS. The investigate notice reads: if it is gone, take the token back with se work --set wk-... --field status --to spec_open, or judge it yourself. Running that answers status is moved by a pull, not by a keystroke. So the engine tells an agent to do something and then refuses it, which is a wall rather than a gate, and the agent is left with judging a token it drafted, which the four-eyes refusal also forbids. THE SHAPE. Reclaim covers all four holdable states, spec_in_work back to spec_open and spec_in_review back to spec_submitted beside the two it already knows, and it takes them from a table beside the states rather than from four names typed into the function. Then the notice says what actually works, which is pulling. AND THE NOTICE IS THE TELL FOR A CLASS. A message that names a command is a claim about that command, and nothing checks it. The check that belongs here reads every remedy a notice names and requires the engine to answer it.

AND THE NOTICE'S OWN STATE TABLE WAS A SECOND COPY THAT DISAGREED. freeAgain in
investigate.go answered spec_open for a spec in review, where the reclaim sends
it to spec_submitted, so even a working remedy would have named the wrong place.
It reads the reclaim's table now, because the reclaim is what actually moves it.

## done when

- A reclaim reaches every state somebody holds, and it takes them from one table rather than from names typed into the function: spec_in_work to spec_open, spec_in_review to spec_submitted, imp_in_work to imp_open, imp_in_review to imp_submitted
  `rg -q func.TestAReclaimReachesEveryHeldState src/engine && go test -C src/engine -count=1 -run TestAReclaimReachesEveryHeldState$ .`
  **red without** the two spec states taken out of the table the reclaim walks
  **red said** TestAReclaimReachesEveryHeldState: a token left at spec_in_work came back as spec_in_work, and it should be spec_open, and the same for spec_in_review
- Every command a notice names is a command this engine answers, driven through the built binary rather than read. The check takes each one out of the notice the way a reader does, everything after se up to the punctuation that ends the clause, runs it, and refuses a notice that names no command at all rather than passing by having nothing to run
  `rg -q func.TestEveryCommandANoticeNamesIsAnswered src/engine && go test -C src/engine -count=1 -run TestEveryCommandANoticeNamesIsAnswered$ .`
  **red without** the notice put back as it stood, naming se work --set --field status
  **red said** TestEveryCommandANoticeNamesIsAnswered: the notice says to run se work --set --field status --to imp_submitted and the engine answers that nothing read it
- The notice and the reclaim agree about where every held state goes back to, over the reclaim's own table rather than over a list typed beside it, and the check refuses when no state is held at all
  `rg -q func.TestTheNoticeAndTheReclaimAgree src/engine && go test -C src/engine -count=1 -run TestTheNoticeAndTheReclaimAgree$ .`
  **red without** freeAgain answering a place of its own instead of reading the reclaim
  **red said** TestTheNoticeAndTheReclaimAgree: the notice says a token at spec_in_review goes back to spec_open, and the reclaim sends it to spec_submitted
- The whole battery is green afterwards
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. The evidence names the test and what it said rather than a line number

