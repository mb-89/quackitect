---
id: wk-890febfb99
seq: 1000211
type: work
title: the reviewer waits
status: imp_in_work
assignee: main
scope: single-step
traced: true
holder: main
disposition: done
rounds: 1
minted_by: cowork
submitted_by: cowork
---

## detail

Reviewers despawn the moment the queue is empty, because the reviewer branch in src/engine/pull.go with nothing waiting answers: Nothing is waiting for review. Say so and stop. Owner wants a reviewer on every submission as soon as it lands. One: a reviewer that pulls with nothing waiting is told to stay and pull again. Two: a submission landing with no reviewer live by deadReads and StillPulling tells the submitter to spawn one now. With a live reviewer it carries no spawn ask. Related: wk-d51f434d37.

## done when

- A reviewer with nothing waiting is told to stay: the notice carries stay and not the sentence Say so and stop.
  `rg -q func.TestAReviewerWithNothingWaitingIsToldToStay src/engine && go test -C src/engine -count=1 -run TestAReviewerWithNothingWaitingIsToldToStay$ .`
- A staying reviewer is handed the next submission on its next pull.
  `rg -q func.TestAStayingReviewerGetsTheNextSubmission src/engine && go test -C src/engine -count=1 -run TestAStayingReviewerGetsTheNextSubmission$ .`
- The spawn ask is keyed on the readers count of deadReads, both directions in one fixture: no reviewer pulled asks by name, a live reviewer gets no ask.
  `rg -q func.TestTheSpawnAskIsKeyedOnLiveness src/engine && go test -C src/engine -count=1 -run TestTheSpawnAskIsKeyedOnLiveness$ .`
- The despawn sentence is gone from the engine sources, tests excepted.
  `rg -q "Say so and stop" src/engine -g "!*_test.go" && exit 1 || rg -q "func reviewerMissing" src/engine/pull.go`
- Every commanded criterion above was watched red before the work and green after, per criterion, and the whole engine suite was watched green on the platform the cage runs on.
