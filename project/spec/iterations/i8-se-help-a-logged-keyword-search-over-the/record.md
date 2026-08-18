---
id: i8-se-help-a-logged-keyword-search-over-the
status: seeded
opened: 2026-08-12T19:37:47.760Z
goal: "se.help: a logged keyword search over the lane's tools and guidance, whose every MISS is recorded as a ranked missing-tool demand — replacing the retro's hand-mining of the shell log."
vision: |-
  DONE LOOKS LIKE: an agent asks se_help in plain words and gets the verb it needed, or an honest refusal saying no such tool exists. Every refusal is recorded. A retro then reads the ranked demand list instead of a person grouping se_run commands by shape.

  WHY THIS ONE IS FIRST. It is the only true speed enabler in the plan: it makes every later iteration cheaper by naming missing verbs mechanically. Our own number, from guidance/method/retro.md: on 2026-08-07 se_run stood at 3249 calls out of 28612, the SECOND most-used verb in the lane. A lane whose escape hatch is its second-busiest door is missing verbs, and nobody had counted.

  BUILD BOTH HALVES, and if one must be cut, keep the DEMAND LOG. That is the half with evidence behind it. The SEARCH half is weaker here than it was in v2, because this harness already loads tool schemas on demand and the lane's own descriptions are long and specific. Nobody has counted how often an agent fails to find a verb that already exists — say so rather than claiming a benefit.

  TWO COMPANIONS RIDE THIS ITERATION. The INTROSPECTION VERB, which answers why a state is grey and replaces the grey-probe shell cluster. And the MISSING-CAPABILITY ENUMERATION: find what is absent by running a SECOND enumeration the spec did not write — tools and doors against use cases — which a previous handover called the highest-value unbuilt item in the system.

  PRIOR ART, both reached the same idea and neither shipped. v2 designed se.help as a keyword search with misses as a live demand signal (see project/V2-INVENTORY.md). v1 designed a DESCRIPTION CATALOG whose bodies load lazily by named trigger, in spec/decisions/guidance.md at ref main. Read both, build one.

  THIS IS THE CLOUD-ITERATION CANDIDATE. It is additive, self-contained, has a clear done condition, and an unwatched failure costs exactly one new verb. When the cloud run is attempted, attempt it here.

  FULL CONTEXT: project/spec/version-planning.md, section i8.
inputs:
  - project/spec/version-planning.md
  - guidance/method/retro.md step 8
  - project/V2-INVENTORY.md
---

# i8-se-help-a-logged-keyword-search-over-the

## Goal

se.help: a logged keyword search over the lane's tools and guidance, whose every MISS is recorded as a ranked missing-tool demand — replacing the retro's hand-mining of the shell log.

## Rough vision

DONE LOOKS LIKE: an agent asks se_help in plain words and gets the verb it needed, or an honest refusal saying no such tool exists. Every refusal is recorded. A retro then reads the ranked demand list instead of a person grouping se_run commands by shape.

WHY THIS ONE IS FIRST. It is the only true speed enabler in the plan: it makes every later iteration cheaper by naming missing verbs mechanically. Our own number, from guidance/method/retro.md: on 2026-08-07 se_run stood at 3249 calls out of 28612, the SECOND most-used verb in the lane. A lane whose escape hatch is its second-busiest door is missing verbs, and nobody had counted.

BUILD BOTH HALVES, and if one must be cut, keep the DEMAND LOG. That is the half with evidence behind it. The SEARCH half is weaker here than it was in v2, because this harness already loads tool schemas on demand and the lane's own descriptions are long and specific. Nobody has counted how often an agent fails to find a verb that already exists — say so rather than claiming a benefit.

TWO COMPANIONS RIDE THIS ITERATION. The INTROSPECTION VERB, which answers why a state is grey and replaces the grey-probe shell cluster. And the MISSING-CAPABILITY ENUMERATION: find what is absent by running a SECOND enumeration the spec did not write — tools and doors against use cases — which a previous handover called the highest-value unbuilt item in the system.

PRIOR ART, both reached the same idea and neither shipped. v2 designed se.help as a keyword search with misses as a live demand signal (see project/V2-INVENTORY.md). v1 designed a DESCRIPTION CATALOG whose bodies load lazily by named trigger, in spec/decisions/guidance.md at ref main. Read both, build one.

THIS IS THE CLOUD-ITERATION CANDIDATE. It is additive, self-contained, has a clear done condition, and an unwatched failure costs exactly one new verb. When the cloud run is attempted, attempt it here.

FULL CONTEXT: project/spec/version-planning.md, section i8.

## Inputs

- project/spec/version-planning.md
- guidance/method/retro.md step 8
- project/V2-INVENTORY.md
