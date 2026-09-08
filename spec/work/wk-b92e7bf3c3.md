---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the passive is measured
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: voice
# tokens that have to close before this can start
depends_on:
  - "[[wk-f2b58d1c04]]"
---

## detail

Voice rule 5 asks for the active voice and names who acts. Nothing checks it, because no pattern can tell a passive from an active sentence.

Measured in September 2026 with a part-of-speech rule over `vale-cli/vale`. Two tokens, a be-verb then a past participle. For details, see [[spec/design_input/the-prose-toolchain]].

| tree | passive |
|---|---|
| `spec/guidance` | 180 |
| `spec/rationale` | 265 |

445 breaks across the two trees a reader goes to most.

The rule passed `The engine writes the file` and a sentence with no participle, so the reading is not noise.

This is the largest unmeasured rule in the guidance, and it went unmeasured because the tool that finds it was never here.

## done when

- the style folder carries a passive rule of two tokens, a be-verb then a `VBN`, decided by reading it
- it refuses `the file was written by the engine` and passes `the engine writes the file`, decided by running `se lint` over a fixture holding both
- the count over `spec/guidance` and `spec/rationale` is written on this token before and after, decided by the same command
- a sentence whose actor is unknown carries an exemption naming its reason, decided by reading one

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

