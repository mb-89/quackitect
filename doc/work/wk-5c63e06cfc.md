---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: closing guard or sweep
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T15:32:29Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 8e8dc7c2371e5a432513e3f33ec2c9b6e194f3b2
  - 71a3a7c6e0314bff4a77d0f7296ba532517aa9a2
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 11f4dc73d994cad07b1f45eea8b379de8016a555
---

## detail

From the verdict on wk-887e9a126a, the engine archives.

Two entry points reach Archive with two different rules for when a token may come off the disk.

src/engine/store.go SaveToken archives on t.Ended() && ClosingState(r, t). src/engine/archive.go SweepClosed archives on t.Ended() alone. One of them is wrong.

If ClosingState is load-bearing, se archive --sweep is missing it, and a sweep takes a token off the disk that its process can still move, which is the exact stranding ClosingState was written to prevent.

If it is not, it is dead weight, and its comment states a premise the code disproves. The comment says a standard token carries done while a reviewer still has a step to take on it. It does not. src/engine/pull.go sets a disposition only when ends = proc.Ends(a.To), and the MEASURED comment above that line records the stranding bug that already fixed. A standard token at done carries no disposition, so Ended() is false and the guard never fires. Checked against doc/work/wk-887e9a126a.md itself, which stands at done with no disposition line.

ClosingState is also Process.Ends written a second time. The bodies are the same loop, differing only in ClosingState's a.From != "" test, which makes the two disagree for a process with an activity that declares no from, and standard's ask is one. This tree already ruled on that shape: dirFor's comment says a second answer that can disagree with the first is not wanted.

## done when

- one rule decides whether a token may come off the disk and both doors ask it: a test closes a token whose process still declares a step from where it stands and asserts se archive --sweep leaves it alone, seen red first
- ClosingState is gone or is Process.Ends: se find for ClosingState answers one definition at most

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

