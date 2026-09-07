---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: one agent per role
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

THE OWNER'S RULING, 2026-09-07. The default for parallel agents moves from three to one. One means one of each role: one worker, one reviewer, one scribe. The parameter's own text gains a warning that separate instances are preferred to more agents on one.

WHY. Agents on one instance contend for one working tree, one git index, one engine and one archive file. The battery replaces the running engine, so one hand runs it at a time whatever the number says.

MEASURED on this box at ten agents. The branch head did not compile for about an hour, because one hand landed a test without its source half. Six open tokens carry a ready_when naming the busy tree as the blocker, so the parallelism made them unworkable rather than slow. Two of those six are being unparked now that the box is quiet.

Separate instances share nothing but the branch. The claims branch already exists to keep boxes off each other's tokens, so that shape is the designed one and this is not.

## proposed action

Set the floor in config.go to one and the default in util/parameters.json to one, and put the warning and the measurement in the parameter's help text where a person reading the console sees it.

## done when

- the floor answers one, decided by the Go tests over config and staffing being green
- util/parameters.json reads default 1 for limits.parallel_agents
- the parameter's help text warns that separate instances are preferred, and says why

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The default stops steering sessions into the shape that made six tokens unworkable, and the console says where the throughput actually is. | the help text |
| [x] | what breaks if it is never done, and not only that it stays undone | Every session keeps spawning three hands onto one tree, and keeps paying the contention that parked those six. | their ready_when lines |
| [x] | the ask is small enough to review whole, or it is split first | — | one number in two files, and one help text |
| [x] | every done-when line is decidable, and names the command where one decides it | One is the Go tests, one is a field in the file, one is the text beside it. | RUNME.sh test |
| [x] | the basics it stands on exist, or are minted first | — | the knob and its help text already stood |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — | trivial process |
| [x] | one test was written first and seen red for the reason expected | No test was written. This is a default, and the tests that read it set their own value, so none could redden on the number. Said rather than faked. | nolegalmove_test.go, standard_test.go |
| [x] | the same test was seen green after the change, and named | 162 tests reaching config and staffing ran green, which is what proves the change breaks nothing. | RUNME.sh test --propose TestTheQueueIsStaffed |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | — | config.go and util/parameters.json |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The prose that said three went with the number, in the same change. | config.go |

