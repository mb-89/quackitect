---
id: wk-cae83b6e63
seq: 1000017
type: work
title: a reviewer repairs trivia
status: spec_open
assignee: main
scope: single-step
traced: true
depends_on:
  - wk-24be1c06ae
rounds: 7
minted_by: person
submitted_by: main
spec_seen: 2acacfde174e8d070cb0ebbd4c5684f0da7a501b6f8b2d3c73c7b536b1b61f05
---

## detail

Owner's words: if it does not touch functionality, fix it and tell the agent. A reviewer repairs what changes nothing that runs, records it on the token, and opens no round. Allowed: Criterion.Without, Criterion.Red, Rejection.Wrong, Rejection.Satisfies, Lesson.Class, Lesson.Avoid, Lesson.Prevents, a number or citation in Token.Detail. Refused by member: a file that is not a token note, Criterion.Says, Criterion.Runs, any other Token.Detail change. Round 7 asks each allowed repair read back through LoadToken, and both lists disjoint under one anchor.

## done when

- Each repair on a verdict says what, where and why nothing that runs changes, written to the note in its own section
  `rg -q func.TestARepairIsRecordedOnTheToken src/engine && go test -C src/engine -count=1 -run TestARepairIsRecordedOnTheToken$ .`
- The four forbidden members are refused by name, the eight allowed go through, both lists read from the detail
  `rg -q func.TestARepairOutsideTheRecordIsRefused src/engine && go test -C src/engine -count=1 -run TestARepairOutsideTheRecordIsRefused$ .`
- A repair to Criterion.Red reads back through LoadToken changed, Says and Runs unchanged
  `rg -q func.TestARepairIsApplied src/engine && go test -C src/engine -count=1 -run TestARepairIsApplied$ .`
- Deleting that refusal alone, the other three standing, gives ACCEPTED
  `rg -q func.TestOnlyTheRepairRefusalCanSayIt src/engine && go test -C src/engine -count=1 -run TestOnlyTheRepairRefusalCanSayIt$ .`
- An acceptance may carry repairs and stays one
  `rg -q func.TestAnAcceptanceMayCarryRepairs src/engine && go test -C src/engine -count=1 -run TestAnAcceptanceMayCarryRepairs$ .`
- reviewing.md has its own section on what may be repaired, which the check reads
  `rg -q func.TestTheReviewMethodSaysWhatMayBeRepaired src/engine && go test -C src/engine -count=1 -run TestTheReviewMethodSaysWhatMayBeRepaired$ .`
- That section carries the case, wk-2b78b911b1 and a shifted line, and no rate
  `rg -q func.TestTheRepairRuleCarriesItsMeasurement src/engine && go test -C src/engine -count=1 -run TestTheRepairRuleCarriesItsMeasurement$ .`
- Every test above was watched red first, the refusal deleted alone
