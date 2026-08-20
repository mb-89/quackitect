---
minted_in: i1
id: req-drawn-state-equals-a-row
type: "[[requirement]]"
statement: When a drawn state declares evidence, the engine shall compile it exactly as a matrix row's declaration, and shall descend only into a sub-machine that resolves.
kind: functional
verify_method: test
breaks_if_removed: A person's drawing becomes a second, weaker way to author states, and what they draw quietly means less than a row.
breaks_how_badly: corrosive
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - reverse-engineered from tests/drawnsub.test.ts and tests/arrows.test.ts
priority: should
weighs_against:
  - req-grouping-and-sorting-hold > — a weaker authoring path is structural; a mis-sorted table is one view
---

## Detail

- A drawn state's evidence declaration compiles like a matrix row's.
- Only a sub-machine that resolves is double-clickable; a seeded one is left to its generator.
- A double-headed arrow compiles to a forward edge and an alternative return; a one-way arrow stays one-way.
- The drawn view is laid out like an iteration, never from authored coordinates.
