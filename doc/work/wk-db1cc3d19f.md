---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: benchmark the battery
# where the token stands. The process owns these values.
status: open
---

## detail

The benchmark measures what one turn costs and is run at the retro. It does not measure the battery.

The retro asks for the battery lanes to be ranked, and no command answers that. The ranking was done by reading a report by hand in one session, and the numbers moved by five seconds between runs, which is enough to draw a wrong conclusion from.

The standing hotspot check ranks single tests off the index and says nothing about lanes.

## proposed action

Give the benchmark the battery. Run it, and keep each lane seconds and the wall clock.

Answer them against the last run, so the retro reads a difference rather than a number. Then the retro rule names a command instead of asking somebody to read a report.

## done when

- the benchmark runs the battery and records each lane seconds and the wall clock
- a second run answers the difference against the first, not only its own numbers
- the retro rule names the command that answers it

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

