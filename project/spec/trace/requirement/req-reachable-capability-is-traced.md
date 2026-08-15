---
minted_in: i1
id: req-reachable-capability-is-traced
type: "[[requirement]]"
statement: The engine shall leave zero capabilities a person can reach from the live offer without a use case and at least one requirement covering them.
kind: quality
characteristic: functional-suitability
verify_method: analysis
breaks_if_removed: The register drifts behind the product, and the trace stops answering what the system actually does.
breaks_how_badly: crippling
measure: 0 live doors, lane verbs or panel actions with no use case, walked against the live offer at each design-input gate.
refines:
  - uc-quality-functional-suitability
source_refs:
  - "evidence/write-stories.md: the gate's second run found three reachable capabilities with no journey"
  - "evidence/write-stories.md: the gate's first run found four, listed them, and recommended pass anyway"
  - owner ruling 2026-08-06 — naming a gap does not close it
priority: should
weighs_against:
  - req-entry-speaks-plainly >
---

## Scenario

SOURCE. A person at the front desk, reading the doors idle actually offers,
or an agent reading the tool list the lane actually grants.

STIMULUS. Picking any one of them and asking what it is for.

ENVIRONMENT. The product mid-life, after several iterations have added
capabilities that the register was not re-walked against.

ARTIFACT. The live offer — the doors, the lane verbs, the panel's actions —
against the use-case and requirement corpus.

RESPONSE. Every reachable capability has a use case describing what somebody
does with it, and at least one requirement demanding it.

RESPONSE MEASURE. Zero reachable capabilities with no use case, walked
against the live offer at each design-input gate.

## Detail

WHY THIS IS FUNCTIONAL SUITABILITY AND NOT A PROCESS RULE. The
sub-characteristic is FUNCTIONAL COMPLETENESS: the set of functions covers
the specified tasks. Here the failure runs the other way — the product grew
functions the specification never covered — and completeness is the property
either way.

IT HAS FAILED TWICE, MEASURED. The requirements gate's first run found four
reachable capabilities with no story and no use case. Its second run, walking
the live tool list and the live doors by hand, found three more. Both counts
are on the write-stories evidence form.

WHY IT IS A QUALITY AND NOT A FUNCTIONAL ROW. Nothing here says what the
system does. It says how COMPLETE the register is against what the system
does, which is a property of the set rather than a member of it.

PART OF IT IS NOW MECHANICAL (i3). The offer has three parts, and they are
not alike:

- THE LANE VERBS are declared in one file, in one shape. A regex finds every
  one, and `tests/trace-coverage.test.ts` fails when ANY ONE of them is
  missing — from the trace at all, or from the use-case layer specifically.
- THE DOORS are drawn from the machine and depend on where the walk stands.
- THE PANEL ACTIONS are code, in no single shape.

The last two are still walked by hand and compared, and calling that analysis
is the honest answer.

WHY THE VERB THIRD WAS PROMOTED. This row was first committed 2026-08-09.
Four days later the i3 tester counted 14 of 35 lane verbs named nowhere in
the trace at all.

THE MECHANICAL CHECK IS A FLOOR, AND THE ROW STILL FAILS ABOVE IT. The check
asks only that the trace name the verb somewhere. This row asks for a use
case saying what somebody does with the capability, AND at least one
requirement demanding it.

THE USE-CASE HALF IS CLOSED AND CHECKED. All 35 verbs sit in a use case
saying what somebody does with them, and the check fails if one falls out.

THE REQUIREMENT HALF IS OPEN. Measured 2026-08-13: 34 of 35 verbs are named
in no requirement. Only `se_pull` is.

That gap is named here and NOT closed by naming it, which is the ruling this
row's own source_refs cite. It wants its own piece of work: deciding which
requirement demands each verb, 34 times, is judgment rather than placement.

THIS ROW CAME FROM THE CHECKLIST (owner design 2026-08-07).
