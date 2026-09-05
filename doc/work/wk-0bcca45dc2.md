---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: one answer per rung
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/reviewer-webern
claimed_at: "2026-09-05T14:31:13Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 67764d508a08094269f60e9a44fb5f4e6c3387c7
  - f48690d65556055c351c96ad58df66fc08fd3214
  - 6b6bb778eee66a6183d2f479ceffffe2ff236f32
  - fe734619edc6d2e3c2ced39f5767fc94fb22979e
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 33a27f3a8f3b00fe75226d1097733a68bf28e663
  - 9d4a67f37919ee7f38a48f53441fd70a379e9033
  - 35b1f951fe5a7f0a00942dc684046057bb575a04
---

## detail

The rung is session-scoped on disk now: binding.json carries the session it was set in and LoadBinding answers bound when it belongs to a session that has ended. See wk-7783c03017.

PutTheBindingBack in src/engine/unbound.go is the older answer to the same question. It reads the rung at the start of a session and writes bound over it. With the file scoped, it reads bound already, so it never writes and the log line it guards, "this tree was god and a new session is bound", can no longer be written. It is one function, one call in src/engine/main.go under the Continued check, and two tests in src/engine/unbound_test.go that only exercise it.

Two answers to one question is what wk-7783c03017 was written to end, and this is the second one left standing. The handover case it protects is protected by the session name instead: a swap continues the session, so the rung reads the same on both sides of it, which TestAControlSurvivesAHandover holds.

It was left out of wk-7783c03017 because src/engine/main.go and src/engine/unbound_test.go both carried another agent's uncommitted work at the time.

## proposed action

Remove PutTheBindingBack, its call in main.go and the two tests that only drive it, leaving the session on the file as the one answer.

## done when

- se find --regex PutTheBindingBack --path src/** answers no hits
- se test --propose TestAControlDoesNotOutliveTheSessionThatSetIt TestAControlSurvivesAHandover answers ok, and TestANewSessionIsBoundWhateverTheLastOneLeft is gone with the function it drove

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one function, one call, two tests |  |
| [x] | every done-when line is decidable, and names the command where one decides it | line 1 by `se find --regex PutTheBindingBack --path src/**`. Line 2 by `se test --on wk-0bcca45dc2 --propose TestAControlDoesNotOutliveTheSessionThatSetIt TestAControlSurvivesAHandover` |  |
| [x] | the basics it stands on exist, or are minted first | the session on binding.json exists, from wk-7783c03017, and is what makes the removal safe |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token.md read. Nothing beside the ask: the removal was already in the tree, so this box changed nothing and checked it |  |
| [x] | one test was written first and seen red for the reason expected | the find is the check. Over the working tree it answers 5 hits, in unbound.go, main.go and unbound_test.go |  |
| [x] | the same test was seen green after the change, and named | at HEAD the find answers 0 hits in all three, and both deleted tests are gone. se test answered ok on nine, among them TestAControlDoesNotOutliveTheSessionThatSetIt |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | another hand landed it before this box was handed the step |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. The working tree is 75 files behind HEAD on an uncommitted rollback, so a find over it still shows the function |  |

