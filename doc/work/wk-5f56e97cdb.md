---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: main is never swept
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-fir
claimed_by: 547b9365/worker-fir
claimed_at: "2026-09-05T15:37:54Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 9db8f4b89320e6b5e9c0aac1ce58664a04b0899c
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - dd41aca93d062baf71ac7feae7519a37cdf9a7e8
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

Found reviewing wk-1c9dc4ef28 (stops hand work back). src/engine/goneputsdown.go:72 exempts the main agent from the sweep by comparing the token's holder against the literal "main", and the comment above it says why: "THE MAIN AGENT IS NEVER SWEPT. It holds its work across a restart on purpose, and that is a decision rather than a silence."

A token is held under the name its holder pulls with, never under the harness name. gate.go:334 says so, and .se/holds.json on this box holds wk-a46c014566 under "worker-relay-trial" while .se/actors.json maps main to worker-relay-trial. So the one holder the sweep means to protect is the one holder it never recognises.

What reaches: main is silent whenever the person is away, and HasGone judges a holder gone after limits.heartbeat_seconds times 120, ten minutes at the default pulse, reading the retired record too so the silence carries across a restart. The sweep runs at every engine start, main.go:596. A restart after a ten-minute pause therefore puts main's open token back in the queue, and a released hold is one another worker can take mid-change, which is the dvorak case gone.go was written to end.

The same file already knows the answer: TheyHold at goneputsdown.go:39 walks everyNameOf because "releasing by the id alone would release nothing at all". This one line does not.

## proposed action

SweepWorkHeldByTheGone skips a holder that is any name main acts as, everyNameOf(r, "main"), instead of the literal string, so the exemption reaches the name the token is actually held under.

## done when

- a token held under the name main pulls with survives the sweep after a silence past the window, decided by: se test --propose 'TestTheSweepLeavesMainsWorkUnderEveryNameItActsAs' answers ok
- a helper gone past the window is still swept, decided by: se test --propose 'TestWorkHeldByASilentHolderGoesBack' answers ok
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: battery

the third done-when, sh util/checks/battery.sh with no new failure, is owed. This tree carries several other sessions' half-landed work and would not compile twice within the last hour, so a battery answer taken now would not be about this change.

## evidence: change

src/engine/goneputsdown.go. SweepWorkHeldByTheGone builds the set of names main acts as, everyNameOf(r, "main"), and skips a holder in it, instead of comparing the holder against the word main. TheyHold in the same file already asked the question that way, and the comment now says why.

## evidence: criterion_note

the second done-when names TestWorkHeldByASilentHolderGoesBack, which no tree carried. Rather than let a command decide nothing, the test was written under that name and asserts what the line says. The nearest existing test, TestAHolderNothingHasBeenHeardFromIsGone, drives the notice as well and is still green.

## evidence: green

se test --on wk-5f56e97cdb: both new tests ok true, with TestAHolderNothingHasBeenHeardFromIsGone, TestAHolderThatCallsWithoutPullingIsNeitherSweptNorCalledGone and TestAnAgentThatGoesPutsDownItsWork ok true beside them.

## evidence: red

the sweep put back the main agent's own work, and named the token it released. The helper row was green from the first run, so the exemption is what changed and not the sweep.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one condition in SweepWorkHeldByTheGone and two tests | none owed |
| [x] | every done-when line is decidable, and names the command where one decides it | the first two fall to se test --on wk-5f56e97cdb naming each test. The second named a test no tree had, so it was written under that name and asserts what the line says | ok true |
| [x] | the basics it stands on exist, or are minted first | everyNameOf, HasGone and the fixtures in gonebysilence_test.go were all there. Nothing was minted | none owed |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | rule 12: the exemption and the sweep are driven together, so a guard switched off shows as one going green while the other stays red | none owed |
| [x] | one test was written first and seen red for the reason expected | the sweep put back the main agent's own work, naming the token it released. The other row was green from the first run | red, one row |
| [x] | the same test was seen green after the change, and named | TestTheSweepLeavesMainsWorkUnderEveryNameItActsAs and TestWorkHeldByASilentHolderGoesBack, beside the two silence tests | 5 ok |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | one condition in src/engine/goneputsdown.go, and the new src/engine/sweepleavesmain_test.go | none owed |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none revealed. TheyHold in the same file already asked the question this way, and now both do | none owed |

## evidence: test

src/engine/sweepleavesmain_test.go. TestTheSweepLeavesMainsWorkUnderEveryNameItActsAs holds a token under worker-relay, links main to that name, and lets the record go silent for half an hour, first asserting HasGone says the holder is gone so the exemption is what the test reads. TestWorkHeldByASilentHolderGoesBack does the same for a helper and asserts the hold is released.

