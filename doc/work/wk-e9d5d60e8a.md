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
---

## detail

util/checks/render-check.mjs asserted `a declared group pins by its name` against the LIVE page, as /class="pin" data-pin="noted" title=/. "noted" is a group util/views/work.base declares with filter status == "noted", unpinned. Render draws an unpinned declared group only while it holds a row (src/engine/view.go, the `if len(mine) == 0 { continue }` in the declared loop), so that pin span reaches the page only while some open token carries that status. None does, so the check was red with nothing wrong: `render-check FAIL editor: a declared group pins by its name` in every battery from .se/tests/battery-20260905-145044.out to battery-20260905-160529.out.

The mapping it is about does not depend on the data. A declared group's filter is in the .base file, so its pin carries a name and no filter; a group the data made carries its own in data-matching. src/extension/editor.ts:436-439 is the whole of it.

The file already knows this hazard. The comment above the line says a sibling assertion moved into Go because a check whose red depends on the data goes quiet as the data changes, and the fixture block at the foot moved "an unpinned group pins on a filter" off the live page for the same reason.</detail>
<parameter name="proposed_action">Move it onto a fixture beside the ones already there: a pane whose one group is declared and unpinned, rendered with editorHtml, asserting the pin carries the name and no data-matching. Minting a token with status noted would be arranging the data to suit the check.

## done when

- render-check answers ok for `a declared group pins by its name` on a tree where no open token has status noted
- the assertion still fails if a declared group's pin gains a data-matching attribute

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

