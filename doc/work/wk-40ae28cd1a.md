---
id: wk-40ae28cd1a
seq: 1000020
type: work
title: a reclaim strands specs
status: spec_open
assignee: main
scope: single-step
traced: true
rounds: 4
minted_by: main
submitted_by: main
spec_seen: 70b5ae291eb0d80b63c4985c21de9cd587406dec154994b6dce6b49800500976
---

## detail

Reclaim in src/engine/arrival.go knows only imp_in_review and imp_in_work, so a drafter or spec reviewer that dies holding a token strands it. Cover all four held states from one table, and make freeAgain in investigate.go read that table instead of its own copy. The investigate notice names se work --set --field status, which the engine refuses, so every command a notice names must be one the engine answers. Take the notice set from every construction site of an Answer carrying a Notice, 18 today, not from function names. The pull-again reclaim, TestPullingAgainTakesBackWhatTheDeadHolderHeld, is already built, and so are the four tests below. Criterion 3 still needs a red taken on its own test, and criterion 5 needs a fresh observation or removal.

## done when

- A reclaim reaches every held state from one table: spec_in_work to spec_open, spec_in_review to spec_submitted, imp_in_work to imp_open, imp_in_review to imp_submitted.
  `rg -q func.TestAReclaimReachesEveryHeldState src/engine && go test -C src/engine -count=1 -run TestAReclaimReachesEveryHeldState$ .`
- Every command any notice the engine builds names is one the engine answers, driven through the built binary, read by exit code, and the check refuses when the walk finds no builder.
  `rg -q func.TestEveryCommandANoticeNamesIsAnswered src/engine && go test -C src/engine -count=1 -run TestEveryCommandANoticeNamesIsAnswered$ .`
- An unread call exits with a code of its own: zero for an answer, one for a refusal about content, two for a call nothing read.
  `rg -q func.TestAnUnreadCallExitsWithItsOwnCode src/engine && go test -C src/engine -count=1 -run TestAnUnreadCallExitsWithItsOwnCode$ .`
- The notice and the reclaim agree where every held state goes back to, over the reclaim table, and the check refuses when no state is held.
  `rg -q func.TestTheNoticeAndTheReclaimAgree src/engine && go test -C src/engine -count=1 -run TestTheNoticeAndTheReclaimAgree$ .`
- The whole battery is green afterwards, as a standing rule over the project.
  `sh util/checks/battery.sh`
- Every test named above was watched failing on its own assertion with the change absent before it was watched passing.
