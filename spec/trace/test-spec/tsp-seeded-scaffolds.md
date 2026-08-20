---
minted_in: i2
id: tsp-seeded-scaffolds
type: "[[test-spec]]"
statement: The kickoff bless writes every seeded sub-machine's placeholder drawing in the same act, so no route refuses over a machine M4 has not authored yet — verified by test at the pin.
method: test
verifies:
  - req-pin-writes-seeded-scaffolds
files:
  - tests/seed-scaffolds.test.ts
---

## Scope

The pin's scaffold write: the placeholder drawings for every sub-machine
the blessed column seeds. The pin's column storage and growth are
[[tsp-record-lifecycle]]; this spec covers only the scaffolds whose
absence surfaced SE-C-112 refusals on 2026-08-11.

## Approach

Component level over a fixture column that seeds two sub-machines.
Boundary-based: the observation is the file set immediately after the
bless, and the route that previously refused.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- blessing the kickoff writes a placeholder drawing for every seeded
  sub-machine in the same act — none missing, none hand-copied
- a route through a seeded-but-unauthored sub-machine draws instead of
  refusing SE-C-112
- M4 authoring the real machine later replaces its placeholder without
  a second scaffold appearing
