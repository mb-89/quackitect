---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-the-paint-tells-three-greens-apart
type: "[[test-spec]]"
statement: The three kinds of green — submitted, blessed and law-proven — are painted differently from each other and from an unproven claim.
method: test
verifies:
  - req-the-panel-s-paint-says-which-kind-of-green-it-is
files:
  - deliverable/tests/paint-rules.test.ts
---

## Scope

The paint decision itself, as a pure function of what is known about a state.

WHY THIS LEVEL AND NOT THE SERVED PAGE. The rules are about MEANING, and the
meaning is decided before any markup exists. A case reading the served SVG
would pass or fail on the drawing's geometry as much as on the rule.

WHY ONE FILE FOR THREE RULES. They fail together the moment two paints
collide, and they are enforced today by scattered cases in drift.test.ts,
reopen.test.ts and claimops.test.ts — which is why nobody can say which of the
three are actually covered. That is the gap this spec closes.

## Approach

TEST-FIRST, AND ALL FIVE CASES ARE RED at authoring time. The count is from the
run of 2026-08-19.

THAT IS NOT THE SAME AS ALL THREE RULES BEING BROKEN. Two of them are already
enforced in the drawing; what does not exist is the single decider the cases
ask for, so every case fails on its absence before it can reach its own claim.
The first two go green as soon as one function answers, and only the third
needs a paint that is not drawn today.

Two rules are met today and one is not.

- GREEN MEANS SUBMITTED, and A BLESSED STATE CARRIES THE THUMB. Both already
  paint distinctly. Their cases are regression guards.
- A LAW-PROVEN GREEN IS ITS OWN THING. It paints identically to a submitted
  claim today, so a check that RAN and a claim somebody stamped are the same
  colour. That is the one distinction a reader most needs, and the panel does
  not draw it.

THE CASES DEMAND ONE DECIDER. Three rules spread over three files is the shape
this row exists to end, so the file asserts that one exported function answers
all three and fails with that sentence when it does not.

## Steps

1. `green means submitted` — GREEN in meaning, RED until the decider exists.
2. `the thumb is blessed` — the thumb rides the green rather than replacing it.
3. `a law-proven green is told apart from a claim somebody stamped` — the
   demand.
4. `none of the three is painted the same as an unproven state` — the three
   greens differ from each other AND from an open claim.
5. `standing on moved ground beats every green` — suspect wins over blessed,
   because a colour standing on moved ground is no longer earned.
