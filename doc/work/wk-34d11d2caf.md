---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Held skips the gate
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/main
claimed_at: "2026-09-05T19:48:06Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 2ffcf9d79f74a1840f9e0ef52bd5607bd2b06fcc
---

## detail

THE QUEUE HANDS BACK WHAT IS ALREADY IN YOUR HAND WITHOUT ASKING WHETHER IT MAY.

Measured here on 2026-09-05. wk-814acc87a2 carries needs_human. It was released, and se claim --next 3 handed it straight back within the minute.

next in src/engine/pull.go walks the tokens this actor already holds first, and at line 661 answers handed for the first one whose step is theirs. That path asks theStepIsTheirs and it asks about sub-tokens. It does not ask Blocked and it does not ask WaitsForAPerson.

Every other path in the same function asks both, at 674 and 677. staffing.go and stopjudge.go ask WaitsForAPerson too. So the rule is written five times, and the fast path is the one that forgot.

The owner's ruling is that this goes through one door rather than a second copy of the logic. WaitsForAPerson is that door and it already exists. The fast path does not knock.

A token waiting on a person should not sit in an agent's hand, so it is set back the way a step that is not the agent's is set back.</detail>
<proposed_action>In next, before answering handed for a token this actor holds, ask Blocked and WaitsForAPerson. Where either answers, put the token down and record it among what the queue set back, so the notice says why rather than leaving the agent to wonder. A held token that waits on nothing is handed back as now.</proposed_action>

## done when

- a token carrying needs_human is not handed to an agent that already holds it, decided by: a test in src/engine sets needs_human on a held token, calls the queue, and sees it not handed
- that token is set back rather than left in the hand, decided by: the same test reads its holder afterwards and finds it empty
- a held token that waits on nothing is still handed straight back, decided by: the same test with an ordinary token sees it handed
- the test was seen red first on the needs_human case
- the battery reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | An agent stops being handed work it may not do, and hears where the rest went. | 1 door |
| [x] | what breaks if it is never done, and not only that it stays undone | A token nobody may work sits in a hand until the claim lapses, and the queue offers it to nobody else. | 3 hours |
| [x] | the ask is small enough to review whole, or it is split first | One branch of one loop, one helper, one notice. | 3 hunks |
| [x] | every done-when line is decidable, and names the command where one decides it | Four name one test. The fifth names the battery, which no agent may run by hand. | 5 of 5 |
| [x] | the basics it stands on exist, or are minted first | Blocked, WaitsForAPerson and PutDown were all in the tree. | 3 of 3 |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The rule written five times is asked from one place now, so a path cannot ask half of it. | work-token.md |
| [x] | one test was written first and seen red for the reason expected | TestAHeldTokenStillKnocksBeforeItIsHandedBack went red on the blocked case. The needs_human case already passed, so one door was missing rather than two. | 1 of 3 red |
| [x] | the same test was seen green after the change, and named | All three pass. Every Pull, Wait, Queue, Hand and Parked test passes with it, and go vet is clean. | 0 failures |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Three hunks in pull.go and one new test file. | 2 files |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. The set-back holder is cleared in the queue's copy, so the notice stops calling it yours. | 1 line |

