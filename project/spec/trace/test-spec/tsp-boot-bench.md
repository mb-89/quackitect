---
minted_in: i2-parallel-iterations-across-machines-seed
id: tsp-boot-bench
type: "[[test-spec]]"
statement: A session boot lands the walk at the front desk within 20 seconds of the first pull on the reference machine, serving boot's own reading only — verified by test with a measured clock.
method: "test"
verifies:
  - "req-boot-ends-at-front-desk"
files:
  - "tests/boot-bench.test.ts"
---

## Scope

Where a session STARTS: the boot walk's destination, its reading scope,
and its wall clock. What the engine REMEMBERS between sessions is
req-walk-resumes-from-repo, covered by the existing lifecycle suites —
this spec tightens the start, not the memory.

## Approach

Integration level: a whole boot driven against a repository holding an
open record, because the 2026-08-11 failure was boot marching into open
i2 and serving its route's ten documents. The bound is asserted as a
measured duration; the 20-second pass line is judged on the reference
machine (a 2025 mid-tier laptop), and the bench records its number so
drift shows across runs.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- with an open record standing, the boot walk ends at front_desk — the
  record keeps its position and is not entered
- boot's reading serves boot's own demands only, never an open record's
  route documents
- the wall clock from the first pull to the walk standing at the desk
  stays inside the bound, and the measured time lands in the bench
  record
