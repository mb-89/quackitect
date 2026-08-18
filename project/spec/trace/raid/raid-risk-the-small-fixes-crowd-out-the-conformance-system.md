---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-risk-the-small-fixes-crowd-out-the-conformance-system
type: "[[raid]]"
kind: risk
statement: Seven of this iteration's fourteen items are small mechanisation fixes with no shared design, and they can absorb the walk while the conformance system stays a sketch.
owner: the driving agent
trigger: at gate-implementation, and at any build chunk that lands a fix before a check exists
status: open
impact: The iteration ships a pile of hygiene and calls it conformance. The goal reads satisfied because fourteen items closed, and the one thing the goal names was the part that did not get built.
breaks_how_badly: crippling
how_likely: plausible
mitigation: The build order puts the conformance system first, and the write-budget probe first within it. A fix may land only after the check it neighbours, or in the sweep at the end. gate-implementation checks the order rather than the count.
source_refs:
  - i6 gate-kickoff — round 2, the second attack on scope
  - i6 gate-kickoff — pulled_in, fourteen items
  - "owner ruling 2026-08-16: go ahead with minor, one iteration"
---

## The risk

THE SCOPE IS TWO THINGS. The gate's own red team named it and the owner
took it as one iteration anyway, which is a legitimate call and does not
make the shape go away.

ITEMS ONE TO SEVEN ARE THE CONFORMANCE SYSTEM. Checks bound to elements
and design specs, running at the write. One design, one architecture,
one unmeasured assumption underneath it.

ITEMS EIGHT TO FOURTEEN ARE FIXES. Assertion-red, the trap check, the
route after a bless, `shipped` landing at the desk, the engine picking
the test scope, the cloud start's branch check, and a dead-code
deletion. They share a thesis and share no design.

## Why it is plausible rather than unlikely

THE FIXES ARE EASIER AND EACH ONE FEELS LIKE PROGRESS. Every one of
them is a known defect with a known repair. None needs a measurement
first, and none can fail in a way that re-opens the size.

THE CONFORMANCE SYSTEM IS THE OPPOSITE. It starts with a number nobody
has taken, and that number can send the architecture somewhere else.

THAT ASYMMETRY IS THE MECHANISM. Work flows to what is easy to close.

## What it looks like when it happens

FOURTEEN ITEMS CLOSED. Thirteen of them fixes and hygiene, one of them a
check nobody bound to anything real.

The goal reads satisfied because the checklist is green, and the
checklist was never the goal.

That is the same failure the record's own thesis names one level up:
a question a LISTING can satisfy is not yet mechanical.

## Mitigation

THE BUILD ORDER IS THE MITIGATION, and it is set here rather than
discovered later.

- The write-budget probe runs first, in the first build chunk.
- The conformance system's chunks come before the fixes.
- A fix may land only after the check it neighbours, or in the sweep at
  the end.

GATE-IMPLEMENTATION CHECKS THE ORDER, not the count. A brief that
reports fourteen closed items without saying which came first has not
answered this.

## Trigger

At gate-implementation.

And at any build chunk that lands a fix before a check exists — that is
the first observation that the order slipped, and it is cheap to catch
there.
