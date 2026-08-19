---
minted_in: i3
id: raid-debt-human-observed-demonstrations
type: "[[raid]]"
kind: debt
statement: Four demonstration specs went unobserved at i3's verification - each needs a person, and this delta touched all four, so none could carry its standing verdict either. Carried here on the owner's ruling rather than blocking the close.
owner: the owner
trigger: the consolidation pass that collects everything needing a person, or any iteration whose delta actually touches one of the four specs
status: open
looked: 2026-08-19
breaks_how_badly: abrasive
how_likely: expected
impact: Verification refuses while any claim box stands open, so four specs nobody at a terminal can observe stop every iteration from closing. The alternative is checking boxes on unobserved claims, which is worse.
source_refs:
  - tsp-first-run
  - tsp-panel-walkthrough
  - tsp-tour-run
  - tsp-desk-and-gates
  - meth-verification-discipline
---

## What is actually owed

The four specs are demonstrations, not tests. Most of their procedure
steps ARE observable from a terminal, and treating the whole spec as
blocked was too coarse. What is left after that sorting is small.

- A FIRST-TIME READER. `tsp-first-run` asks whether a newcomer states
  what the product is, unaided, within the session. It is a population
  measure over real newcomers, 2 of 3, and it accumulates rather than
  being staged once.
- A NEWCOMER AFTER THEIR FIRST TOUR, naming the parts they will use and
  picking a fitting desk offer. Same spec, same reason.
- A HOST SWAP. `tsp-panel-walkthrough` asks that the walk serve from the
  same recorded position under a different supported host, with zero
  repair steps. It needs a second host.
- WHAT A PERSON SEES. The panel sitting beside the editing area is a
  layout observation on a screen. The panel's content is renderable and
  checkable; its placement is not.

## Why the whole spec is owed, not only that residue

The first cut of this row carried only the four items above, on the
reasoning that the rest is terminal-reachable and could carry its
standing verdict. That reasoning was tested and lost.

Several steps ARE terminal-reachable, and the sorting was right as far
as it went. Two iterations in their own worktrees is a fact `git branch
--list` reads, and 24 stand marked. A trace node's claim on click is a
route and a render.

BUT THIS DELTA TOUCHED ALL FOUR SPECS, so no standing verdict carries:

- `guidance/method/tour.md` changed, and `sty-take-the-tour` says the
  tour's stops live there.
- `README.md` changed, and it is the entry document the first-run reader
  opens unaided.
- The six canvases ARE the drawn machines the panel shows, and
  `render.ts` draws the highlight.
- The grey-verb blockers govern which desk doors are walkable, and the
  form-field trim changed the evidence a gate serves.

AND AN OBSERVATION FROM ORDINARY WORK CARRIES NO FINGERPRINT of which
build it saw. This tree moved twice during the verification itself. That
is what defeats reading `tsp-desk-and-gates` loosely: its Approach does
invite verification from daily work, but it assumes the behaviour is
standing, and this iteration moved it.

## Why a debt row rather than a blocked verification

The owner's ruling 2026-08-13: technical debt is the transporter. A
collection pass will gather everything needing a person, once the
consolidation ahead of it has happened. Until then this row carries the
four and names precisely what each needs.

THE FOUR BOXES AT i3's VERIFICATION ARE CHECKED AGAINST THIS ROW, and
the form says in plain words that they were not observed. The card's law
is not bent quietly: it is overridden once, on the record, by the person
whose call it is.

## Swept 2026-08-15, at i12's retro: RE-ACCEPTED, and it got heavier

AT i3'S CLOSE IT WAS FOUR SPECS. At i12's validation gate it was EIGHT of
eight must stories owed, so the entire must column of a validation gate rests
on the battery, and the battery says nothing about a person opening a link.

WHAT CHANGED IN ITS FAVOUR: the owner ruled at this retro that validations
will not be performed every iteration, and that the red team may note this
every time and it is accepted every time. "This is too much effort. So for
now, we're just gonna live with that."

SO THE RE-ACCEPTANCE IS EXPLICIT rather than inherited. What must NOT happen
is the re-adjudication: this entry's own impact line already said so, and
nothing read it. That half is now fixed — M7_50_verification carries a rule
that a spec named here arrives PRE-FILLED as owed, so the debt carries the
claim instead of every iteration answering it again.

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED

THE OWNER'S RE-ACCEPTANCE OF 2026-08-15 STILL GOVERNS, in their own words:
validations will not be performed every iteration, the red team may note this
every time, and it is accepted every time.

THE CONSOLIDATION PASS THE TRIGGER NAMES HAS NOT HAPPENED. What has changed is
that a SECOND row now carries the same shape at a larger size —
raid-debt-ten-checks-wait-on-a-person-or-a-second-machine, minted at i33, lists
ten checks and two boundary timings with what each one needs. The consolidation
this row waits for is now most of that row's content.

WHOEVER RUNS THE CONSOLIDATION SHOULD MERGE THE TWO rather than repay them
separately. They are one backlog seen from two dates.

The trigger stands unchanged.

## Swept 2026-08-19, at i9's onboard-retro: RESCHEDULED, TRIGGER HALF-FIRED

THE CARRIER IT WAS WAITING FOR NOW EXISTS. The trigger names a consolidation
pass collecting everything that needs a person. The work-token pool is built
and person-facing: `engine/pool.ts` line 255 serves standing tokens, and
`engine/survey.ts` line 68 reads them into the survey a person sees.

STILL UNOBSERVED, and the owner's re-acceptance of 2026-08-15 still governs.

THE POOL WAS EMPTY UNTIL TODAY. This retro minted its first tokens, so the
consolidation is now possible rather than merely imagined.

TRIGGER RE-AFFIRMED for its other half: any iteration whose delta touches one
of the four specs.
