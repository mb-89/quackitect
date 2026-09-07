---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a ruling nobody keeps
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: queue
---

## detail

The investigate notice says a token "stays there until you rule on it, because a timeout guesses and a person looking does not". Then it keeps nothing of the ruling, so the next puller is asked the same question.

In .se/log/session.jsonl, session 20260904-164423: at 17:29:32 worker-grieg ruled that worker-ada was still working and wk-32c0df8d1c should keep its hold. At 17:30:28, eighty seconds later, the same notice on the same token was handed to worker-elgar, with no mention that anyone had looked. Both of us read the same log and reached the same answer.

The same hand was dealt three times inside forty minutes, on wk-37bfa974e3, wk-b42c0e9a53 and wk-32c0df8d1c. Every one was a live holder. Two of the three had already moved by the time the notice was read, and the engine said so only after the ruling was submitted.

A ruling that changes nothing about what the queue says next is a ruling nobody keeps, and the cost is a turn per worker per notice. What is missing is a place to write "looked at, holder alive, at this time, by this actor", and a rule that does not ask again until the holder has moved or that record is stale.

## proposed action

Write the ruling on the hold, and stop raising the notice for a hold somebody has already looked at and cleared.

## done when

- a ruling that the holder is alive is written where the queue reads it, with the actor and the time
- the notice is not raised again for a hold whose ruling is younger than the staleness window: a test raises it, rules alive, pulls again and gets work rather than the same notice
- the notice is not raised at all for a token that has already ended, which is what the engine now answers only after the ruling is submitted

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

