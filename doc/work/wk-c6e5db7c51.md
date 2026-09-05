---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: lint reads work tokens
# where the token stands. The process owns these values.
status: open
---

## detail

se lint says of itself that it reads every work token and names what breaks a rule. It does not.

The verb runs six lints, and the token one checks only the title and that no time is written. No work token is ever read against its schema. So a token whose chapters break the work-token schema is clean to se lint, and red only in the editor.

The machinery exists and needs nothing new. LintNotes walks a folder, reads each note kind, loads its schema and validates. Guidance and rationales already go through it. The work token folder is the one corpus never passed to it.

## proposed action

Pass the work token folder through LintNotes, the way guidance and rationales already are.

Measure before wiring it in. This validates every token in the tree at once, none of which has been checked this way. Count the findings and report the count first, because turning it on blind could bury the verb in output.

## done when

- se lint reads every work token against its own schema, through LintNotes
- the finding count over the tree is measured and written on this token before the check is turned on
- the help line and what the verb does agree: a test reads both
- a test covers a token that breaks its schema and one that does not

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

