---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: record names the harness
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T18:32:10Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b5cf5b3f8dd0ab588f7b59c31142ec89564e45fd
---

## detail

No record line says which harness posted the event. The hook spike on wk-218e541ec2 had to attribute every line by matching its timestamp against the entrypoint field in the harness's own transcript files under the user's home folder, which a cloud box does not have and which nothing in the tree keeps. So the one question the record cannot answer about itself is which surface a session was driven from.

## proposed action

Write the surface on the session line at SessionStart, read from whatever the event carries, so the record answers it without a second source.

## done when

- a session line in .se/log carries the surface it was started from, and se find over that log names it

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

