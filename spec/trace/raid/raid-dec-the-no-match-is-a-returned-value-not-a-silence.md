---
unreachable_refs:
  - cand-whoever-holds-the-hands-decides
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-dec-the-no-match-is-a-returned-value-not-a-silence
type: "[[raid]]"
kind: decision
statement: When no rung matches, the block returns an explicit no-match value carrying the difficulty that found none, rather than publishing nothing.
owner: the owner
trigger: the first difficulty the mapping does not cover, and the first receiver that has to tell a silence from a crash
status: decided
impact: An absence on the wire is indistinguishable from a crash and from never having run. A receiver that cannot tell those apart either treats every silence as a failure or treats every failure as a silence, and both are wrong in the expensive direction.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-an-unmatched-rung-names-itself-and-publishes-no-driver
  - req-a-wrong-act-never-passes-silently
  - opt-the-no-match-is-a-returned-value-not-an-absence
  - cand-whoever-holds-the-hands-decides
weighs_with: raid-dec-a-record-without-a-driver-or-a-reason-is-not-a-record
weighs_against: none
---

## The choice

VERIFIED AT THE PRIMARY THROUGH THE LANE, 2026-08-20:
docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html, OASIS Standard, 22
January 2013. An authorization decision is "a function that evaluates to Permit,
Deny, Indeterminate or NotApplicable", and the two we care about are kept apart
on purpose: "if no policy or policy set applies, then the result is
NotApplicable, but if more than one policy or policy set is applicable, then the
result is Indeterminate."

Our unmatched case published an absence where a standard settled on a value.

## Rejected options

- PUBLISHING NOTHING, which is what `req-an-unmatched-rung-names-itself-and-publishes-no-driver`
  says as written. The requirement's INTENT survives — fail loud rather than guess
  a driver — and its mechanism does not. This decision amends the mechanism and
  keeps the intent.
- CHECKING THE MAPPING FOR TOTALITY AT COMPILE TIME,
  `opt-the-mapping-is-checked-for-totality-when-the-machine-compiles`. NOT
  rejected on merit: the two compose, and the option's own note says taking both
  is belt and braces. It is not on this line because the chart put the two cells
  on one axis, which is a drawing artefact recorded three times in this record.
  Whoever builds this should take both.

## Consequences

THE RECEIVER SWITCHES ON A VALUE IT ALWAYS HAS rather than on a timeout, and the
no-match becomes something a log can count and an alert can fire on.

THE VOCABULARY IS NOW THREE KINDS OF THING — a rung, a no-match, and whatever
stands for an evaluation that failed. A fourth value that is almost never seen is
the classic way a fourth value ends up unhandled, and that is the standing cost.
