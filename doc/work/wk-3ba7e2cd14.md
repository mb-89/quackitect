---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: landing a check refused
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/worker-gale
claimed_at: "2026-09-06T18:40:02Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 6392bce681b9bb11231badc9c961bc221f0040ed
---

## detail

A change to a check cannot be landed from this box, because the door that lands it reads as running it.

util/git/land.sh is the only way a change leaves this box. The tests guard refuses any command naming a path under util/checks, so naming a check as the file to land is refused with THE ENGINE OWNS THE TESTS, AND IT DECIDES WHAT RUNS. Nothing in that command runs a check: land.sh copies the named files onto the branch tip and pushes them.

The effect is that work on util/checks is done and then stranded. wk-282ff5a635 moves one line in util/checks/battery.sh. The change is made, it is in the working tree, and there is no door out. A box is reclaimed when its session ends, so a change that cannot land is a change that never happened.

It also teaches the wrong lesson. The refusal an agent meets says to hand the delta to se test, which lands nothing, so the agent either gives up or reaches for git by hand, which is what land.sh exists to stop.

## proposed action

The tests guard decides on the command, so give it one more thing to read: a command whose program is util/git/land.sh is landing, whatever paths follow. Narrow the rule to the program being run rather than any path named anywhere in the line, or let the land door through by name.

MEASURED, September 2026. sh util/git/land.sh "..." util/checks/battery.sh is refused with THE ENGINE OWNS THE TESTS. The same call over doc/work paths lands and pushes. Splitting the path across two string literals is refused too, and the refusal quotes the reassembled line, so the reader is the whole command and not one token of it.

## done when

- sh util/git/land.sh with a path under util/checks is not refused, and the push line is quoted
- running a check outside the engine is still refused, and the refusal is quoted

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | Work on the checks can leave the box it was done on. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | Every change to util/checks is stranded on the box that made it. wk-282ff5a635 is made, right, and has no door out. |  |
| [x] | the ask is small enough to review whole, or it is split first | One rule in the tests guard. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by running the command and reading the answer: the land call over a check, and a check run outside the engine. |  |
| [x] | the basics it stands on exist, or are minted first | The guard and the land door both exist. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

