---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a pull needs from
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nancarrow
claimed_at: "2026-09-05T15:11:12Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 33cb888094bf39ef9fa62b1304c2529a7844ebef
---

## detail

A finding on wk-213e782f8b, refusal names absent flag.

src/engine/pullverb.go:35 reads the submission payload from standard input and from nowhere else. Its own usage at pullverb.go:19 prints the door as a pipe.

    echo '{"id":"wk-..",...}' | se pull --actor main

The Bash guard refuses a pipe. So a session whose tool lane never came up can ask for work, and cannot submit anything at all.

run and apply already met this and were fixed. src/engine/payloadfrom.go says why. --command and --edits carry a payload inline. --from reads a file under .se/scratchpad, which is the one path a write with nothing in hand may reach. pull got neither.

THE DAMAGE. Submitting is the only way a token moves. A lane-less box can take work and never put it down. Its tokens then sit held by an agent that cannot let go, and a walker has to rule each one dead.

IT WAS FOUND writing a refusal for notesgohome.go. Closing a note as became is a pull payload. The refusal wanted to name the shell door for one, and there is none to name.

## proposed action

Give se pull the --from that run and apply have, reading the payload from a file under the scratchpad. Print that door in its usage instead of the pipe.

## done when

- se pull --from names a file under .se/scratchpad and submits its content, decided by a Go test in src/engine that writes a payload there and drives the verb
- runPull's usage prints no pipe, decided by that same test reading the usage the verb writes

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One flag on one verb, the reading behind it, four lines of usage, and one test. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Both are decided by the test the criteria ask for, TestAPullSubmitsAPayloadFromTheScratchpad, which writes a payload under the scratchpad, drives the verb, and reads the usage the verb writes. |  |
| [x] | the basics it stands on exist, or are minted first | payloadFrom and twoPayloads are here already, written for run and apply, and insideTheScratchpad is the gate's own rule. Nothing had to be minted. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. Rule 12 put the red first, and the token's proposed action is what was built. |  |
| [x] | one test was written first and seen red for the reason expected | It said `flag provided but not defined: -from`, the token stayed open, and the usage it printed carried the pipe. Expected, as pull had neither. |  |
| [x] | the same test was seen green after the change, and named | TestAPullSubmitsAPayloadFromTheScratchpad passes. The other pull, payload and scratchpad tests pass with it, bar TestAVerbRuns, which fails without this too. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | src/engine/pullverb.go carries the flag, the reading and the usage. The test is its own file. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None beside it. The flag reuses payloadFrom and twoPayloads rather than opening a second way in. |  |

