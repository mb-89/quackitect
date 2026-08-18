---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-changed-copy-owes-a-proposal-back
type: "[[option]]"
cluster: the-bootstrap
question: how upstream's later work reaches a copy
statement: having changed the thing does not excuse a copy from an upstream fix; where the change blocks the given instructions, the copy owes back a described alternative that reaches the same end
found_by: analogy
source: 14 CFR 39.15, 39.17, 39.19 and 39.21, read at ecfr.gov/current/title-14/chapter-I/subchapter-C/part-39 — aviation, where this has been law since the 1920s
---

## Mechanism

THE RULE IS ONE SENTENCE AND IT SAYS THE OPPOSITE OF WHAT SOFTWARE ASSUMES.
§39.15: a directive "applies to each product identified in the airworthiness
directive, even if an individual product has been changed by modifying,
altering, or repairing it in the area addressed by the airworthiness
directive."

MODIFICATION DOES NOT EXEMPT. IT CONVERTS THE DUTY. §39.17 continues: where the
change affects the ability to accomplish the required actions in any way, the
owner MUST request an approved alternative, and unless they can show the change
eliminated the problem, the request must name the specific actions they propose
instead.

SO THERE ARE THREE LEGAL OUTCOMES AND NO FOURTH.

- Apply the fix as given.
- Show your change already removed the problem, and be released.
- Propose something else that reaches the same standard, and have it approved.

SILENCE IS NOT AMONG THEM. In software, silence is the default and the only
outcome.

## What transfers

THE OBLIGATION SURVIVES THE DIVERGENCE. An upstream fix still NAMES a copy that
has changed the affected area. A patch that will not apply produces a demand for
a described alternative, rather than a skipped file and a log line.

THE RELEASE CLAUSE MATTERS AS MUCH AS THE DUTY. §39.17 lets the owner out where
the change eliminated the condition. Divergence sometimes fixes the bug, and the
rule says so rather than treating every deviation as debt.

THE STANDARD IS THE TARGET, NOT THE PROCEDURE. §39.19: anyone may propose an
alternative "if the proposal provides an acceptable level of safety". What is
binding is the end, and the given steps are one way of reaching it. A directive
that mandated only its own steps could not survive a modified unit at all.

APPROVED DEVIATIONS ACCUMULATE. §39.21 has the responsible office publish the
alternatives it has already approved, and each approval must "specifically refer
to" the directive it answers. The second copy with the same divergence finds the
ruling instead of re-arguing it.

AND THE AUTHORITY CAN BE DELEGATED. The live directive read for this option
authorises the manufacturer's own approval organisation to approve alternatives
for repairs and modifications, under a named regulator's authorisation. A
maintainer can be deputised to adjudicate deviations within a stated basis.

## What breaks in translation

THERE IS NO REGULATOR, SO THERE IS NO ADJUDICATOR AND NO SANCTION. The
mechanism works because a named office decides yes or no, and because operating
a non-compliant aircraft is a violation repeated on every flight. Remove that
and "propose an alternative" degrades into an issue nobody closes. The teeth
come from statute, not from the design.

THERE IS NO REGISTRY OF COPIES, AND THIS IS THE LARGEST LOSS. Aviation knows
every airframe. A copy of this product is not registered anywhere, by design,
because the isolation rule forbids it. So the source cannot notify anybody. What
survives is the copy's OWN machinery raising the demand on itself when it takes
an update.

THE UNSAFE-CONDITION THRESHOLD HAS NO ANALOGUE, and the mechanism dies without
one. §39.5 mandates only where a condition is unsafe AND likely to exist in
others of the same design. Medical device rules go further and exempt changes
that merely improve performance. Both regimes refuse in law to mandate
improvements, and their authority comes from exactly that narrowness. A tool
issuing directives for renames and preferences burns the mechanism inside a
month, and nothing in the source domain helps pick the threshold — each of them
inherited it from injury and death.

## One thing improves in the transfer

AVIATION SPENDS ONE WORK-HOUR PER AIRFRAME, across four hundred and
seventy-one airplanes, on a visual inspection whose only purpose is deciding
whether the unit is affected at all.

SOFTWARE CAN SHIP THE APPLICABILITY TEST WITH THE DIRECTIVE and run it in
milliseconds, and can ship a remedy that applies or refuses rather than
illustrated instructions for a human. That is the half of the source system
which would most obviously be improved if the source domain could do it, and it
is free here.
