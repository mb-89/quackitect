---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the load line names
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

The engine says the guard was slow on one hook, with the queue depth, the wait and the answer time. It does not say which hook.

The owner read one saying 6236 ms, which is twelve times the bound the engine calls slow, and could not tell what had been slow.

The record carries queued, waited_ms, took_ms, behind and verbs_in_flight. Nothing names the event.

So the line is a number without a lead. A reader cannot tell a write being checked from a search being refused from a stop being judged.

Everything needed is in hand where the line is written. The hook handler already holds the event, which carries the tool name and the event kind. It is not passed to what writes the line.

## proposed action

Hand the hook the event it is about, and name it on the line.

The record carries the tool and the event kind beside the numbers, so a query can group by them.

The bottleneck half gets it too, because a deep queue is also worth naming.

## done when

- the slow line names the tool and the event kind: a test drives one and reads both in the message
- the record carries the tool and the event kind as fields: the same test reads them off the log line
- a line with no event to name still says the numbers: a test drives one without an event and reads it

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

