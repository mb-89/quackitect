---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: cand-the-receiver-decides
name: "The receiver decides"
statement: "Publish a two-part difficulty and a rung name and never a model, make the no-match a value rather than a silence, and leave the mapping from rung to worker entirely to whoever holds the fleet."
type: "[[candidate]]"
picks:
  - "[[opt-the-difficulty-is-declared-by-hand-on-the-cell]]"
  - "[[opt-difficulty-splits-into-judgement-and-reading]]"
  - "[[opt-name-the-driver-per-state-not-per-milestone]]"
  - "[[opt-the-block-names-a-rung-and-never-a-model]]"
  - "[[opt-the-no-match-is-a-returned-value-not-an-absence]]"
  - "[[opt-publish-the-difficulty-and-let-consumers-choose-their-own-hand]]"
  - "[[opt-a-driver-claim-cannot-be-made-without-a-driver-or-a-reason]]"
  - "[[opt-name-the-acceptable-over-driving-rate-in-advance]]"
---

## What it leans on

IT TRADES OUR ASSUMPTIONS FOR SOMEBODY ELSE'S CAPABILITY.

- Two assumptions stop being needed rather than being weakened.
  raid-asm-one-model-list-serves-every-host-the-engine-supports and
  raid-asm-the-model-ladder-is-a-total-order both concern a roster this line does
  not hold.
- A receiver exists that can read a rung and act on it. IT DOES NOT.
  nbr-the-driver-that-performs-the-spawn was rewritten in this record after the
  first version claimed otherwise: the receiver reads and cannot act. This line
  is the furthest of the four from anything shippable alone.
- The judgement and reading figures are separable in practice. Argued from two
  worked examples in the corpus and never measured.

AND ITS ACCOUNTABILITY IS HALF A MECHANISM, WHICH IT SHOULD BE READ AS ADMITTING. It names an acceptable over-driving rate in advance because that is the only half of measuring that lives on our side of the boundary. We can state the tolerance; we cannot observe what actually answered, because under this line nothing of ours ever knew which model the rung resolved to. Every other candidate can reconcile a named driver against a real one, and this one is asking a receiver it does not control to report against a number it did not choose.

THE ONE THING IT LEANS ON THAT IS SETTLED is the shape of the no-match value,
verified at the primary — OASIS XACML 3.0, 22 January 2013 — where NotApplicable
and Indeterminate are distinct returned results.

## Why this one

IT STOPS ASSERTING THINGS WE CANNOT KNOW. A roster of models is a claim about
somebody else's fleet, and it ages every time a vendor ships.
raid-asm-one-model-list-serves-every-host-the-engine-supports and
raid-asm-the-model-ladder-is-a-total-order are both unproven and both become
unnecessary rather than merely weakened — nothing in our tree names a model, so
there is nothing to be wrong about.

THE STANDARD ALREADY SETTLED THE EDGE CASE. Verified at the primary,
docs.oasis-open.org/xacml/3.0, OASIS Standard 22 January 2013: an authorization
decision evaluates to Permit, Deny, Indeterminate or NotApplicable, and the last
two are kept apart on purpose — no policy matched is a different result from the
evaluation failing. Our unmatched case publishes an absence, which is
indistinguishable on the wire from a crash and from never having run.

THE TWO-PART DIFFICULTY IS WHAT MAKES THE PUBLICATION WORTH READING. How hard
the judgement is and how much has to be read are independent, and the corpus
holds both extremes — a finder state reads one method card and asks for deep
original judgement, a partition state reads forty-nine function nodes and
renders a table. One scalar tells a receiver both are `major` and lets it
choose wrongly with confidence.

## How it works

obtain-a-step-s-difficulty produces a judgement figure and a reading figure per
state. Nothing reduces over a milestone, because nothing needs one number.
resolve-a-difficulty-to-a-driver names a rung and stops; there is no roster.
publish-the-driver-outward publishes the pair and the rung, or the explicit
no-match value carrying the difficulty that found none.

A RECORD CARRYING NEITHER A NAMED DRIVER NOR A STATED REASON IS NOT A VALID
RECORD, which closes the silence in the design's only safety rule by making the
invalid case unrepresentable rather than merely checked.

## What it costs

IT DOES NOT ANSWER THE QUESTION THE RECORD WAS OPENED FOR. Somebody still maps a
rung to a hand, and under this candidate that somebody is outside our tree,
unaudited and unreachable — which is exactly what nbr-the-driver-that-performs-the-spawn
says we cannot make act anyway.

AND THE RUNG VOCABULARY BECOMES A PUBLIC INTERFACE. It has to be stable enough
for a receiver to implement against, which is a smaller version of the roster
problem rather than its absence.
