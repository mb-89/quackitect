---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-the-drift-ceiling-s-per-state-term-is-chosen-not-measured
type: "[[raid]]"
kind: assumption
statement: The corpus-access ceiling now scales with the claimful-state count, and the per-state term in it was chosen to keep an existing margin rather than measured from the cost it bounds.
owner: the maintainer
status: open
trigger: the next time the rigor matrix changes its claimful-state count, or the first time this guard goes red again
impact: A term chosen rather than measured can be too loose to catch the regression it guards, and nothing in the suite would say so. The guard would keep passing while the defect it names walked in.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - deliverable/tests/drift.test.ts - the ceiling and the reasoning above it
weighs_with: none
weighs_against: none
---

## What is assumed

The ceiling was `FILLERS * 4`, a constant calibrated when the rigor matrix yielded 25 claimful states. The matrix grew to 35, the honest cost grew with it, and the constant did not.

So the guard went red on a tree where nothing was wrong. Its sibling assertion — that the corpus is asked exactly ONCE — passed on every run the ceiling failed, which is the requirement's actual claim.

A PROXY FAILING WHILE THE THING IT PROXIES PASSES IS THE PROXY'S DEFECT.

## Why the new term is not evidence

Two measurements exist: 245 accesses at 25 claimful states, and 898 at 35. Two points do not determine a curve, and fitting a line through them yields a negative fixed part, which is impossible.

So the per-state term of 40 was CHOSEN to preserve the band the original comment argued for: roughly twice the honest cost, and several times below a per-state sweep. That is a defensible band and it is not a measurement.

## What would settle it

Three or more measurements at different claimful-state counts, taken deliberately rather than collected as the matrix happens to grow. The fixture can seed any count, so the experiment is cheap and nobody has run it.

Until then the guard discriminates a per-state sweep from one sweep, which is what it is for, and it does not bound the honest cost tightly.

## Probe

The fixture already seeds a fresh iteration from the rigor matrix and counts door accesses, so the experiment is cheap and nobody has run it.

RUN IT AT THREE OR MORE CLAIMFUL-STATE COUNTS, deliberately, rather than collecting points as the matrix happens to grow. Vary the count in the seeded declaration and hold the filler count fixed, so the only thing moving is the term in question.

THEN LOOK AT THE SHAPE BEFORE FITTING ANYTHING. Two points already yield a negative fixed part, which is impossible, so the relationship is not the linear one the current term assumes. Three points say whether it is superlinear, whether the fixed part is real, or whether something other than the state count is moving.

IT IS SETTLED WHEN THE TERM IS ANCHORED TO A MEASUREMENT and the comment above it says which measurements, at which counts. It is FALSIFIED if the honest cost turns out not to scale with the claimful-state count at all, in which case the constant was right and something else grew.
