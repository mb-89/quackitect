---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: se reads a range
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

There is no read verb. The verb table holds apply, ask, find, test, run, work, pull and lint, and nothing that reads a file. So every read of a line range goes out through a shell, and so does every outline of a markdown file by its headings.

One session was measured: 791 of 1038 shell calls were reading rather than writing. The finding half is already answered by se find. The reading half is not.

The shaping is the point rather than the paging. A range of lines is the least of it. What the engine knows and the agent re-encodes by hand is which files are tests, which are generated and which are parked. Parked is already answered in code and used when the schema walk skips files.

## proposed action

Add a read verb. It answers a named line range without a shell, and outlines a markdown file by its headings.

It knows what is a test, what is generated and what is parked, and can leave them out without the caller re-encoding it.

se find already covers the finding half and is not rebuilt.

## done when

- se read answers a named line range of a file without a shell
- it outlines a markdown file by its headings
- it can leave out tests, generated files and parked ones without the caller naming them
- a test covers a range, an outline and one shaping filter

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

