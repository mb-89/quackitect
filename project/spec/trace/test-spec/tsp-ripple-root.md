---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-ripple-root
type: "[[test-spec]]"
statement: The chain walk past a fallen claim reaches the state with no fallen input of its own, returns the path root first, and terminates on a cycle without naming one.
method: "test"
verifies:
  - "req-a-ripple-names-its-root"
files:
  - "tests/ripple-root.test.ts"
---

## Scope

The walk up the claim graph. Which verb the refusal then names is
`fallenRemedy`'s, and it is exercised through the walk rather than
specified here.

## Approach

UNIT LEVEL, OVER HAND-BUILT MACHINES. The demand is graph arithmetic: a
state, its claim-bearing feeders, and which of them are standing. A
fixture states each shape in three lines, where a booted session would
state it in fifty and prove less.

THAT IS WHY THE WALK MOVED OUT OF THE SESSION. It began as a private
method and now sits in `machine.ts` as a pure function, which is both the
better home and what makes these cases possible.

THE CASES THAT MUST NOT FIRE CARRY THE WEIGHT. A walk of this shape goes
wrong by naming something that cannot be fixed — a transparent state, or
a state inside a cycle — and by spinning instead of answering.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- THE CHAIN WALKS PAST THE FIRST HOP. Over a four-state chain with
  nothing standing, the answer is the far end rather than the near one.
- THE PATH COMES BACK ROOT FIRST, so a reader sees how far away the work
  is without asking again.
- A ROOT THAT ALREADY STANDS IS NOT A ROOT. The chain starts at the first
  state above the standing ground.
- NOTHING FALLEN UPSTREAM LEAVES NO ROOT. The work is at the state that
  asked, and saying so is the honest answer.
- TWO INDEPENDENT BRANCHES EACH NAME THEIR OWN ROOT. Reporting only the
  first found would send half the work back unstated.
- A CYCLE RETURNS NO ROOT AND TERMINATES. The caller falls back to the
  first hop, which beats both spinning and silence.
- A TRANSPARENT STATE IS NEVER THE ROOT. `start` carries no claim, so
  naming it points the reader at a state with nothing to fix.

## What is deliberately not here

THE VERB CHOICE. `fallenRemedy` picks amend, reopen or aim by asking the
root whether it has a standing claim and whether that claim still passes.
That is three branches over one state, and it is covered where the
refusal is exercised rather than duplicated here.

## The measurement behind the row

2026-08-16, in this iteration's own walk: a value outside its vocabulary
trapped the walk for ELEVEN calls, four states later. Three repairs were
aimed at states that were fine. `se_why` found it in two calls, because
`se_why` already walked the chain and the refusal did not.
