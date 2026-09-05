---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a pull payload needs
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-213e782f8b, refusal names absent flag.

src/engine/pullverb.go:35 reads the submission payload from standard input and from nowhere else. Its own usage at pullverb.go:19 prints the door as a pipe:

    echo '{"id":"wk-..",...}' | se pull --actor main

The Bash guard refuses a pipe. So a session whose tool lane never came up can ask for work with se pull --actor main, and cannot submit anything at all.

run and apply already met this and were fixed. src/engine/payloadfrom.go says why: --command and --edits carry a payload inline, and --from reads a file under .se/scratchpad, which is the one path a write with nothing in hand may reach. pull got neither.

THE DAMAGE. Submitting is the only way a token moves. A lane-less box can take work and never put it down, so its tokens sit held by an agent that cannot let go, and a walker has to rule each one dead.

IT WAS FOUND writing a refusal for notesgohome.go. Closing a note as became is a pull payload, so the refusal wanted to name the shell door for one, and there is none to name.

## proposed action

Give se pull the --from that run and apply have, reading the payload from a file under the scratchpad. Print that door in its usage instead of the pipe.

## done when

- se pull --from names a file under .se/scratchpad and submits its content, decided by a Go test in src/engine that writes a payload there and drives the verb
- runPull's usage prints no pipe, decided by that same test reading the usage the verb writes

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

