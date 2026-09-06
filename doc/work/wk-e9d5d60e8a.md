---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: render check reads data
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-hawthorn
claimed_at: "2026-09-05T16:18:31Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b00750e165cacb79c6a9cb2132d2b6d59f470cd4
---

## detail

util/checks/render-check.mjs asserted `a declared group pins by its name` against the LIVE page, as /class="pin" data-pin="noted" title=/. "noted" is a group util/views/work.base declares with filter status == "noted", unpinned. Render draws an unpinned declared group only while it holds a row (src/engine/view.go, the `if len(mine) == 0 { continue }` in the declared loop), so that pin span reaches the page only while some open token carries that status. None does, so the check was red with nothing wrong: `render-check FAIL editor: a declared group pins by its name` in every battery from .se/tests/battery-20260905-145044.out to battery-20260905-160529.out.

The mapping it is about does not depend on the data. A declared group's filter is in the .base file, so its pin carries a name and no filter; a group the data made carries its own in data-matching. src/extension/editor.ts:436-439 is the whole of it.

The file already knows this hazard. The comment above the line says a sibling assertion moved into Go because a check whose red depends on the data goes quiet as the data changes, and the fixture block at the foot moved "an unpinned group pins on a filter" off the live page for the same reason.

## proposed action

Move it onto a fixture beside the ones already there. Build a pane whose one group is declared and unpinned, render it with editorHtml, and assert the pin carries the name and no data-matching. Minting a token with status noted would be arranging the data to suit the check.

## done when

- render-check answers ok for `a declared group pins by its name` on a tree where no open token has status noted
- the assertion still fails if a declared group's pin gains a data-matching attribute

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [x] | the ask is small enough to review whole, or it is split first | one assertion moved from the live page onto a fixture | — |
| [x] | every done-when line is decidable, and names the command where one decides it | the render-check line in a battery run answers ok or FAIL | — |
| [x] | the basics it stands on exist, or are minted first | the fixture block and editorHtml are already in the file | — |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | doc/guidance/work-token.md, in the prompt | — |
| [x] | one test was written first and seen red for the reason expected | render-check FAIL editor: a declared group pins by its name, in eight batteries from battery-20260905-145044.out | — |
| [x] | the same test was seen green after the change, and named | render-check ok 0 failed in battery-20260905-162527.out and again in battery-20260905-164315.out | — |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | pushed as 85c88434 on origin/v4 | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the fixture also asks that a declared pin carries no filter, which the old pattern let through | — |

