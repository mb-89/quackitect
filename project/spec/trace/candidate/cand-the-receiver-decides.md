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
  - "[[opt-the-record-carries-both-the-named-driver-and-the-one-that-answered]]"
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


## Grafted at graft-onto-the-winner, 2026-08-20

ONE AXIS WAS WON BY LOSERS AND IT IS THE ONE THIS CANDIDATE IS WORST ON.
req-the-actor-is-recorded-where-the-call-is-served: 0 here, 2 for
cand-the-reader-beside-the-walk, 1 for the two eliminated lines.

HALF THE MECHANISM IS TAKEABLE AND THE HALF IS THE ONE ON OUR SIDE OF THE
BOUNDARY. This candidate can never record what answered — nothing of ours learns
which model the rung resolved to, which is the consequence of the choice that
earns it its host-swap point. It can record what it NAMED: the rung it published
and the state it published it for. Grafted:
opt-the-record-carries-both-the-named-driver-and-the-one-that-answered now sits on
this line for its named half.

IT CLOSES A HOLE IN THIS CANDIDATE OWN SAFETY RULE. A record carrying neither a
named driver nor a stated reason is not a valid record — that was already here,
and it was unenforceable, because nothing recorded the named driver. Now something
does.

THE SCORE IS NOT MOVED. A second hand put this axis at 0 with this file own
sentence as its anchor, and the hand that performs a graft does not re-score it.
The addition is recorded beside the score rather than over it.

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

## The seams, which is what this compose state is for

THE RUNG VOCABULARY IS THE INTERFACE, AND IT IS THE ONLY ONE. Everything this
candidate publishes crosses a boundary we do not control, so the vocabulary has
to be stable, documented and versioned in a way none of the other three need. The
seam is not a function call; it is a published contract, and changing it later
breaks a receiver we cannot see.

THE TWO-PART DIFFICULTY AND THE RUNG NAME ARE REDUNDANT ON PURPOSE. The pair says
what the work is like; the rung says what we would pick. A receiver that
disagrees with our rung can still use the pair, which is what makes the
publication worth reading to somebody whose fleet is not ours. That redundancy is
a cost — two things to keep consistent — and it is the price of not asserting a
roster.

THE NO-MATCH VALUE AND THE RECORD VALIDITY RULE CLOSE THE SAME HOLE FROM TWO
SIDES. NotApplicable makes the absence legible on the wire; a record carrying
neither a driver nor a reason being invalid makes it legible in the log. Taking
one without the other leaves the hole open in whichever place was not covered.

THE MEASUREMENT SEAM IS BROKEN AND THE CANDIDATE ADMITS IT. Naming an acceptable
over-driving rate needs somebody to report against it, and under this line
nothing of ours ever learns which model the rung resolved to.

## What it costs

THE BUILD COST IS THE SMALLEST OF THE THREE THAT TOUCH THE WALK and the adoption
cost is the largest. Publishing a pair and a rung is less code than resolving a
roster. What it needs instead is a receiver that reads the rung and acts, and
nbr-the-driver-that-performs-the-spawn was rewritten in this record because the
first version claimed one existed: the receiver reads and cannot act.

THE TWO-PART DIFFICULTY DOUBLES THE DECLARATION OR THE DERIVATION. Every one of
the 154 active cells probe 1 counted now carries two figures rather than one,
whichever way they are arrived at.

AND THE MAPPING ONTO A ONE-DIMENSIONAL LADDER NEEDS A RULE FOR THE CORNER where
the two axes disagree. raid-asm-the-model-ladder-is-a-total-order was already
unproven; this makes the disagreement explicit rather than creating it.

IT DOES NOT ANSWER THE QUESTION THE RECORD WAS OPENED FOR. Somebody still maps a
rung to a hand, and under this candidate that somebody is outside our tree,
unaudited and unreachable — which is exactly what nbr-the-driver-that-performs-the-spawn
says we cannot make act anyway.

AND THE RUNG VOCABULARY BECOMES A PUBLIC INTERFACE. It has to be stable enough
for a receiver to implement against, which is a smaller version of the roster
problem rather than its absence.
