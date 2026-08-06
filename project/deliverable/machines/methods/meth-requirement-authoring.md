---
kind: method
statement: "Writing one requirement: a single EARS claim carrying its measure — with every duty around it filled, from kind to trace."
---

## Situation

M3: the requirements derive from the use-case steps and extensions. Each one
becomes a req- node shaped by [[requirement]]. The statement shapes are
[[meth-ears]] and the quality scenarios [[meth-quality-scenarios]] — this
card does not restate them. It says everything AROUND the statement: what
makes one row good, and what the field, the corpus and two prior products
learned the hard way.

## ONE CLAIM PER ROW

A requirement states exactly one thought. No `and`-joined behaviors. No
combined conditions. No numbered sub-claims inside one node — v1 allowed
`req-x.<n>` sub-statements and quietly lost the one-claim rule to them.

The test: if two different tests could fail independently, it is two
requirements. Split it.

Why it binds: a compound row cannot be traced, weighted, or verified as a
unit. (ISO 29148 "singular"; INCOSE GTWR singularity rules.)

## EVERY VALUE CARRIES ITS UNIT AND TOLERANCE

A bare number is unverifiable. A naked target ("fast", "reliable") is a
mood. Write the unit and the bound: `in no more than 2 mm`, `within 200 ms
for 95 % of pulls`.

For a hard-to-measure quality, use a population measure: more than 2/3 of
first-time readers find the door within 30 seconds.

Why it binds: verification is done by people without the author's domain
knowledge. The number is the only thing they can check. (INCOSE R33; the
corpus's field practice.)

## THE STATEMENT IS THE SPEC — PROSE IS A DEFECT

The node carries no rationale paragraph, no test design, no design detail.

- A rationale is a LINK in `source_refs` — to the stakeholder, the norm
  clause, the decision. A changed rationale then never forces re-review of
  the demand itself.
- Test design belongs to the verification work, not the spec. Write the row
  testable by standard methods instead.
- A named mechanism ("shall use a queue") is design frozen as obligation.
  Name the outcome; the mechanism is M4's to choose.

(The corpus's costliest review lesson, one organisation, noted as
single-source — and it held across every review round they ran.)

## THE KINDS, AND WHERE THE COMMON CASES LAND

- functional — what the system does. A functional WITH a measure stays
  functional: performance is not a fifth kind.
- quality — how well, when the demand needs its context spelled out. The
  six-part scenario per [[meth-quality-scenarios]] carries it; the response
  MEASURE is the pass line. Write scenarios only for qualities that
  matter — walking the whole ISO 25010 tree into scenarios produces
  confusion, not coverage.
- constraint — imposed from outside; `source_refs` names the binding norm
  clause.
- interface — a boundary both sides must honor. Name BOTH sides and who
  owns each; an interface row only one side knows about is a future
  integration failure.

## VERIFY_METHOD, NAMED NOW

Naming it is the verifiability check. Pick the cheapest method that would
actually catch the row failing:

- test — measured under controlled conditions.
- analysis — model or calculation, where testing is impossible or
  destructive.
- inspection — a static attribute, examined directly.
- demonstration — observed working end to end, without instrumented capture.

Unnameable means the row is not a requirement yet: rewrite or drop.

## BREAKS_IF_REMOVED — THE REMOVAL TEST

One line: what concretely fails without this row. Six ways to find it: what
agent failure it prevents; what person mistake it catches; what trace gap
turns invisible; what decision loses support; what evidence becomes
unproducible; what projection starts to mislead.

Unfillable means deletion candidate — never a keeper with a TODO.

Editing this line later is patch-class: it rewords the why, not the demand.
(In-house rule, v2 owner ruling 2026-07-21 — no external standard names it;
its nearest kin is 29148's "necessary".)

## WEIGHT — THREE STEPS, ONE CONSUMER

`key | important | unimportant`, defaulting to unimportant. Only the key
rows become M4's criteria and owe a scoring definition there. Weight
inflation defeats the consumer: if most rows are key, none is.

## TRACE — REFINES AND SOURCE_REFS ARE DIFFERENT EDGES

- `refines` names the uc- ids whose steps demand this row. The engine
  checks both directions against the use-case corpus.
- A CROSS-CUTTING QUALITY serves no single pass. It names every use case
  whose pass it protects — the killer set at minimum. A quality refining
  nothing fails traced, and honestly so.
- `source_refs` carries everything else: stk- ids, norm clauses, recorded
  decisions, field evidence. It is the rationale's home, as links.

## NO TBD SURVIVES — AND THE CHECK IS A COUNT

Detail now: requirements are design input, never build-time afterthoughts.
The register is swept for the literal markers TBD | TBC | TBR | `???`, and
the gate refuses on a nonzero count. A prohibition nobody counts is a wish
(v1 counted; v2 prohibited without counting; both are needed).

## WRITING WITH A MODEL IN THE LOOP

The 2024-2026 failure modes, all seen in the field literature:

- plausible-but-unverifiable statements — fluent rows no method can verify.
- fabricated precision — a tolerance inferred from co-occurrence reads
  exactly like a measured one.
- design restated as requirement.

The rule: every number, unit and domain fact traces to a named source
before the row is accepted. A value with no source is a guess wearing a
tolerance's clothes.

## WHAT THE LAST PRODUCTS GOT WRONG

v1 declared ~13 fields per row and its schema enforced one; the unchecked
fields silently went unfilled. v2 wrote "mandatory" in guidance and its own
agent-drafted node shipped without breaks_if_removed, kind, or must_wish.
The lesson both times: a rule that lives in prose and not in a check will
not be followed. This card's rules are backed by the register's refs
coverage, the per-item criteria form, and the gate's evidence fields — the
ones that are not yet mechanical say so where they stand.

## Sources

- ISO/IEC/IEEE 29148:2018.
- INCOSE Guide to Writing Requirements — rules R1, R2, R7-9, R18-23, R33.
- Mavin's EARS (RE'09), via [[meth-ears]].
- SEI scenario form, via [[meth-quality-scenarios]].
- The SyA corpus at @ai/sya_kb — the characteristics, the pitfalls, and the
  EPH functional-spec learnings.
- v1's requirement template and compose reference, at ref main.
- v2's §20 spike and §8f removal test, in @ai/se-v2-design.md.
- The 2024-2026 LLM-in-RE literature — directional, preprint-grade.
- The full research digest with per-claim attribution:
  .se/research-m3-requirements.md.
