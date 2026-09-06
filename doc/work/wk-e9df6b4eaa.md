---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: archive loses the steps
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-36b8ea59dc, the tidy. Its refs part cannot sweep snapshot refs safely, so it reports and deletes nothing. A snapshot lives at refs/se/steps/<hash>, and the only thing naming it is a token's began or ended. An archived row carries id, title, process, disposition, blob, on_branch and tag. It carries neither began nor ended. So once a token closes, nothing on the box can map its snapshots back to it, and a sweep of the unnamed ones would take the very objects a reviewer reads to see the change. Reviewers hit this today: several reported that began..ended named objects this box does not hold. Carrying began and ended on the archived row makes the steps of a closed token findable again, and makes the sweep decidable.

## done when

- an archived row carries began and ended: se archive --id <id> answers both fields for a token that had snapshots
- a snapshot ref named by an archived row is not swept, driven by a case in src/engine/tidy_test.go

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

