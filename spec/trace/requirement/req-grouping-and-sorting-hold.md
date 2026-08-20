---
minted_in: i1
id: req-grouping-and-sorting-hold
type: "[[requirement]]"
statement: When rows are grouped or sorted, the engine shall order them per the Detail table, with every row still appearing and the counts whole at every level.
kind: functional
verify_method: test
breaks_if_removed: A sorted table that loses or misplaces rows answers questions wrongly while looking authoritative.
breaks_how_badly: corrosive
refines:
  - uc-shape-the-view
source_refs:
  - reverse-engineered from tests/grouping.test.ts
priority: should
weighs_against:
  - req-lane-fixes-what-machines-fix > — a table that looks authoritative and answers wrongly beats a second corrective call
---

## Detail

- Levels nest: a second level subdivides the first, a third settles remaining ties.
- DESC reverses a level; the empty group still trails.
- Numbers order as numbers, never as text.
- A missing value gets its own group rather than losing the row; an empty cell sorts last.
- The counts at each level add up to the level above.
- What the controls wrote is what the renderer reads back.
