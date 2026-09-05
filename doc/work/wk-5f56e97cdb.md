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
status: open
claimed_by: 547b9365/worker-fir
claimed_at: "2026-09-05T15:37:54Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 9db8f4b89320e6b5e9c0aac1ce58664a04b0899c
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

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

