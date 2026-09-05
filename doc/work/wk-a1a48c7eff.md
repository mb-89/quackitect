---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: cancel tests cannot vanish
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T20:25:57Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ae315b4f35065c9907e38d516d82329e53724d64
---

## detail

A FINDING ON THE VERDICT OF wk-30821724fc. It is not a child of that token, which closes on its verdict.

The first done-when line of wk-30821724fc reads: a cancelled context ends a git call and a probe, decided by go test -C src/engine -run 'ACancelledContextEndsAGitCall|ACancelledContextEndsTheProbe' ./... answers ok.

go test answers ok and exits 0 when no test matches the pattern. Measured on this box at 674ac0e4, a tree that carries neither test: the command answered "ok quackitect/engine 3.551s [no tests to run]", exit 0. So the command is green on a tree where the thing it decides does not exist, and a rename or a delete of either test leaves the criterion answering ok for ever.

This is the class work-token names in Red first: a check that will not go red is the finding. It reaches every done-when line in the tree written as go test -run over a name, not this token alone.

## proposed action

Decide the shape once and write it where done-when lines are written. Either the command counts what ran, as in go test -run ... -v and a grep for two PASS lines, or the engine's test answer names the tests it ran and the criterion reads that. Then say so in the guidance on writing a criterion, so the next one is written that way rather than found by a reviewer.

## done when

- the shape a done-when line uses to name a go test is written down in doc/guidance, decided by reading the file it lands in
- the written shape answers not-ok on a tree where the named test does not exist, decided by running it against a tree with the test renamed

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

