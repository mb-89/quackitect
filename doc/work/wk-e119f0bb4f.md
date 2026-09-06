---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: keywords the floor refuses
# where the token stands. The process owns these values.
status: open
---

## detail

Found reviewing wk-71ca9e0b46, which flagged six controls console true.

Four of those six carry narrow on with a default of true. KeywordSaid toggles, so it always asks for false. The floor refuses that move every time, and the control never shifts. The four are answer_first, guard_projections, stop_needs_claim and build_via_engine in util/parameters.json. Only search_via_index and tests_via_engine can move.

The tree already proves it. TestSettingAValueIsValidatedByTheEngine in src/engine/config_test.go asserts that SetValue on guards.guard_projections with false answers an error. So a person in the cloud types the word and watches nothing happen. The token counts the six console flags as what it gained, and four of them gain nothing.

## proposed action

Decide each of the four. Either drop console true from the controls their own floor pins, or give KeywordSaid a move the floor allows. Then add a check, so the next flag on a pinned control goes red.

## done when

- no control flagged console is pinned by its own floor, decided by: a check that walks util/parameters.json and tries the toggle against narrow on each console bool
- the check goes red when a pinned control carries the flag, decided by: put console true on a narrow on control and run the check

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

