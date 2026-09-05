---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: declared group vanishes empty
# where the token stands. The process owns these values.
status: open
---

## detail

util/views/work.base opens by ruling that a declared group is always drawn, with nothing in it if nothing matches, because a heading that comes and goes is a heading nobody can aim at. The engine does not do that, and render-check goes red the moment the last matching token closes.

Measured on 2026-09-05. The base declares yours, urgent, parked, in work and noted. The pane answer carries parked, in work and the group the bucket made, plus yours as pinned. urgent and noted are absent, and no token on the board is urgent or has status noted. So the two declared groups with nothing in them were dropped.

render-check asserted one of them by name: a declared group pins by its name looked for class="pin" data-pin="noted" on the live page. It passed while some token was noted and failed once none was, so the battery went red for the data rather than for the program. That half is already mended: another hand moved the assertion onto a fixture the same afternoon, so the check no longer swings. What is left is the engine.

THE DAMAGE THAT REMAINS. A person loses the heading they drop work onto at the moment it empties, which is when they most want somewhere to drop onto. And the base states the rule as a decision at the top of the file, so the file and the program disagree in writing.

## proposed action

Decide it in the engine, not in the check. The base already states the rule and the check already reads it, so what is missing is the renderer keeping a declared group whose filter matches nothing.

Watch the Go test go red first: a view declaring a group nothing matches, rendered, and the group looked for in the answer. Then keep declared groups whatever their count, and let the group the data made go on disappearing when it empties, which is the other half of the same sentence.

If the owner would rather an empty group were hidden, then the ruling at the top of util/views/work.base is what changes and render-check stops naming a group by name. A person picks, because the base states the rule as a decision.

## done when

- a declared group with nothing matching is still in the pane answer: a Go test renders a view declaring a group no row matches and finds it, with a count of zero, seen red first
- the check that names one by name goes green on data where nothing matches it: node util/checks/render-check.mjs from the root exits 0 on a board carrying no noted and no urgent token
- the ruling and the program agree, so the sentence at the top of util/views/work.base is true of what the engine answers

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

