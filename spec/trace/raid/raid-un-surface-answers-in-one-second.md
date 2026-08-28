---
unreachable_citations:
  - tests/latency.test.ts
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-un-surface-answers-in-one-second
type: "[[raid]]"
kind: issue
statement: The architecture does not address req-surface-answers-in-one-second — no element budgets, caps, defers or degrades a render to stay inside the bound.
owner: the adjudicator
trigger: standing until an element on the chart owns the bound, or the requirement is rewritten to demand what the mirror actually does
status: open
impact: a person opening a surface while an agent is mid-pull waits seconds, and the measure is recorded broken on the requirement's own node
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-surface-answers-in-one-second
  - el-mirror
  - raid-asm-slow-surface-is-not-self-contention
place: i23-judgment-the-ui-sitting-cut-the-html-mir
---

## The measure is recorded broken on the requirement itself

`req-surface-answers-in-one-second` LINES 55 TO 59 carry the numbers:
`/widget/details` at 3468 ms with 7 of 7 requests over the line,
`/widget/machine` at 3966 ms, `/` at 4026 ms.

STILL BREACHED TWO MONTHS OF WORK LATER. i33's `fix-what-the-numbers-name` line
15 counts 181 breaches at the one-second line, of which `mirror_slow` is 82 —
the mirror timing its own request.

## The element measures rather than delivers

`engine/mirror.ts` LINES 886 TO 892 LOG A `mirror_slow` RECORD when the render
passes the threshold. NOTHING BUDGETS, CAPS, DEFERS OR DEGRADES the render to
stay inside 1000 ms.

AND THE ELEMENT NODE CLAIMS NO LATENCY PROPERTY. `el-mirror` line 19 says it
renders what the engine holds and never advances the walk. That is a faithful
description and it does not reach this requirement.

## The check that would verify it does not exist

`tsp-engine-lifecycle` LINE 21 NAMES `tests/latency.test.ts`. That file is not
in the tree. The test spec says so itself at line 33: it is the planned home for
the one-second line and the case is expected RED.

## The cause is not established either

[[raid-asm-slow-surface-is-not-self-contention]] IS SCHEDULED AND NEEDS A SPIKE.
Its own words: if the render is fast on an idle engine, the defect is
single-threaded contention rather than render cost, and a fix aimed at rendering
lands nowhere.

SO THE FIX CANNOT BE DESIGNED YET. That is why this is an issue rather than a
risk with a mitigation.

## What makes it fire

A PERSON OPENS A SURFACE WHILE AN AGENT IS MID-PULL. `engine/trace.ts` lines 536
to 537: the server answers nothing while that runs, because the MCP endpoint
shares the event loop. The render waits behind the call and the measure fails by
seconds rather than milliseconds.

## The cheapest fitness check on the deck

BOOT THE ENGINE, REQUEST EACH SURFACE, COUNT REQUESTS AT OR ABOVE 1000 ms. The
mirror already stamps that number.

ONE CAVEAT ON THE INSTRUMENT. `if-agent-harness-to-entrypoint` line 42 says
every count quoted for that boundary is a FLOOR, so aggregating from the log
undercounts. A direct-timing harness avoids the broken instrument.
