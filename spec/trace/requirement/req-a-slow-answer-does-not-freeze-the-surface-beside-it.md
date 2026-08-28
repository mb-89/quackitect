---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: req-a-slow-answer-does-not-freeze-the-surface-beside-it
type: "[[requirement]]"
statement: While the engine is answering a request that runs past its bound, the surfaces a person looks at shall keep answering their own requests, so a slow act never presents as a frozen screen.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: with one engine request held past its bound, the surface's own answering times alongside it are no worse than its answering times when nothing is held, compared over the same number of requests
breaks_if_removed: One slow act takes down every screen at once, and the symptom lands wherever the person happened to be looking, so it always reads as a rendering fault somewhere else.
breaks_how_badly: corrosive
priority: should
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - req-surface-answers-in-one-second
  - "measured 2026-08-24: the surface self-reported 642 slow requests in one window, 16 of them past a minute, including one request at 110 seconds and a page render at 92 seconds"
  - raid-asm-the-slow-tail-and-the-undrawn-route-share-one-cause
weighs_with:
  - req-surface-answers-in-one-second ! — that bounds a surface answering its OWN work, this bounds a surface answering while something ELSE is slow; a surface can satisfy that one alone and fail this one under load
  - req-call-answers-in-one-second ! — that bounds one lane call's own time, this bounds a NEIGHBOUR still answering while a different request runs long; isolation is not latency
  - req-responsiveness ! — that row is the budget table, a duration per kind of work; no duration states whether two requests interfere, which is all this row measures
  - req-a-hop-of-the-walk-carries-its-own-time-budget ! — one bounds a transition inside the engine, this bounds what a second surface sees while that transition runs long
  - req-a-target-that-cannot-be-reached-is-refused-quickly ! — one is about when an answer arrives, this is about whether anything else keeps answering meanwhile
  - req-aiming-returns-before-the-walking-starts ! — one bounds an aim's own time, this bounds interference; a design can make aiming instant and still block every surface beside it
weighs_against:
  - req-tour-outlives-a-missing-highlight < — crippling outranks corrosive on the damage scale, which is the sort key this register declares; a tour that dies on one part teaches nothing further, while a frozen neighbour surface is a wait rather than a loss
---

## Scenario

- Source: a person looking at a surface while an agent works.
- Stimulus: a request elsewhere in the engine that runs past its bound.
- Artifact: the serving surfaces.
- Environment: normal operation, one machine, both served from the same process.
- Response: the surface answers its own requests as usual.
- Response measure: no worse than the same surface's times with nothing held, over an equal number of requests.

## Detail

THIS IS THE COUPLING ROW, and it exists because the two halves are served from
one loop. The craft guidance already states the rule: a rule about showing a
signal is worth nothing when the loop that would render it is frozen.

WHAT MAKES IT ITS OWN ROW rather than part of the surface bound. A surface can
be perfectly fast on its own work and still go dark whenever anything else is
slow. Those are different failures with different fixes, and only one of them
is visible in a measurement of the surface alone.

## Why the symptom is worse than the cost

THE PERSON DOES NOT SEE A SLOW ACT. They see the screen they were looking at
stop responding, which is a different and more alarming event, and it points
them at the wrong part of the system.

MEASURED IN ONE WINDOW: a request at 110 seconds and a page render at 92
seconds. The second is the first, seen from the other side.

## The measure borrowed a bound that admitted the failure

IT READ `within the surface bound`, taken from the resident surface row. That
row's own measure carries an escape: answer within a second, OR show what you
are doing and finish in the background.

SO A SURFACE COULD PAINT THE WORD WORKING IN FORTY MILLISECONDS and then do
nothing for a hundred and ten seconds, and pass this row while the person
watched exactly the frozen screen the statement forbids. The escape hatch in the
borrowed bound ate the demand.

A SECOND FAULT RODE WITH IT. This row was `must` and the row it borrowed from is
`should`. A must whose threshold is defined by a should can never be stronger
than it, and relaxes silently whenever the should relaxes.

AND A THIRD. The borrowed bound would have gone red for reasons this row is not
about. Four fifths of the surface's slow reports coincide with no long engine
call at all, so the surface is slow on its own account and the test could not
tell that apart from the coupling.

ALL THREE ARE FIXED BY MEASURING THE SURFACE AGAINST ITSELF. Its times under
load against its times at rest. That borrows no bound, carries no escape, and
subtracts the surface's own slowness as a matter of arithmetic rather than
judgment.

THE PRIORITY DROPS TO `should` TO MATCH. What this row protects is real and it
is a degradation rather than a break, and nothing is served by grading it above
the row it depends on.

## What this row does not decide

HOW THE SEPARATION IS ACHIEVED is not named here. Moving long work off the
serving path, or serving the surfaces from somewhere else, are both designs and
both belong to the design work rather than to this demand.

NAMING ONE WOULD FREEZE A MECHANISM INTO AN OBLIGATION, which is what this
product's own authoring rule forbids.
