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

## ONE CONCERN PER NODE — AND THE DETAIL RIDES IN TABLES

requirements
written by and for agents need DETAIL, and a thousand atomic rows for the
smallest thing is the failure, not the discipline. A node carries ONE
CONCERN; its `## Detail` section may carry tables, lists and limit sets,
and they BIND as part of the demand.

The statement stays the one EARS-shaped headline over that detail.

The split rule that remains: detail that VERIFIES DIFFERENTLY is a sibling
row.

One node carries one verify_method and one pass line. A table whose rows would
fail independently under different methods is several requirements.

THE FAN-OUT HEURISTIC (owner, 2026-08-06). A use case refined by MORE THAN
FIVE rows is a clustering candidate. Look for facet families: rows sharing
one kind, one verify_method and one concern, differing only in which facet
they pin. Fold such a family into ONE row — the statement names the family's
demand, the Detail table carries each facet as a binding line.

THE CHECK ALWAYS RUNS; the fold is judgment. Count the fan-out on every
register pass. Every use case past five gets LOOKED AT, and where the family
will not read as one concern it STAYS split — record that look, never skip
it. Five is a smell threshold, not a rule. The win is a trace graph a person
can follow.

(ISO 29148 "singular" is deliberately relaxed here; the trace and verify
unit is the NODE, not the sentence.)

## EVERY VALUE CARRIES ITS UNIT AND TOLERANCE

A bare number is unverifiable. A naked target ("fast", "reliable") is a
mood. Write the unit and the bound: `in no more than 2 mm`, `within 200 ms
for 95 % of pulls`.

For a hard-to-measure quality, use a population measure: more than 2/3 of
first-time readers find the door within 30 seconds.

Why it binds: verification is done by people without the author's domain
knowledge. The number is the only thing they can check. (INCOSE R33; the
corpus's field practice.)

## THE STATEMENT LEADS — FREE PROSE IS A DEFECT

Structured detail binds; loose paragraphs do not belong in a row.

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
(An in-house rule; its nearest kin in the standards is 29148's "necessary".)

## PRIORITY — MOSCOW, THE HOUSE SCALE

`must | should | could`, defaulting to could — the same scale everything
else here uses. The consumer is M4: the must rows GATE every candidate
pass/fail, and the should and could rows become the scored criteria. A
won't-have is a non-goal, never a register row. Priority inflation defeats
the consumer: if most rows are must, no candidate can differ.

## TRACE — REFINES AND SOURCE_REFS ARE DIFFERENT EDGES

- `refines` names the uc- ids whose steps demand this row. The engine
  checks both directions against the use-case corpus.
- A CROSS-CUTTING QUALITY serves no single pass. It names every use case
  whose pass it protects — the must stories' cases at minimum. A quality refining
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

## EVERY RULE HERE IS BACKED BY A CHECK

A rule that lives in prose and not in a check will not be followed. These
rules are backed by the register's refs coverage, the per-item criteria form
and the gate's evidence fields. The ones that are not yet mechanical say so
where they stand.

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
