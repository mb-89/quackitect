---
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

VERIFIED BY ANALYSIS, not test. Nothing can enumerate "capabilities a person
can reach" mechanically — the doors are drawn, the verbs are declared, the
panel actions are code. Somebody walks all three and compares. Naming that as
analysis is the honest answer; claiming a test would be the dishonest one.

THIS ROW CAME FROM THE CHECKLIST (owner design 2026-08-07).
