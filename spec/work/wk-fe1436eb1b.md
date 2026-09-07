---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: staffing counts idle hands
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

The staffing gate counts hands present rather than hands the queue can hand work to. So it demands agents for work that is all held, and the session spawns for nothing.

This is conflict five of doc/spec/one-box-many-agents.md, measured over sixteen agents on one box. The owner ruled on that spec: one agent per role, and separate instances rather than more agents on one tree. That ruling settles conflicts one to four, because they only bite when several agents share a tree. Five survives it, because a gate that miscounts asks one session to spawn hands it does not need.

The gate lives in src/engine/staffing.go and is AStaffShortfall. It already reads the queue. What it does not ask is whether the open work is reachable: a token another hand holds, a token waiting on a person, and a token the branch has archived are all work no new hand can take.

## proposed action

Count the tokens the queue would actually hand out rather than the tokens that are open. The pull already decides that question, so the gate asks it rather than counting rows. A queue whose open work is all held, parked or archived wants no hands at all.

## done when

- the gate asks for no hands over a tree whose open tokens are all held by somebody, and a Go test drives it
- the gate still asks for hands over a tree with unheld open work, proved by the same test
- a token the branch has archived does not count towards the demand, proved by the same test

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

