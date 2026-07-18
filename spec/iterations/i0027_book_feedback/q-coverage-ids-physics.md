---
id: q-coverage-ids-physics
type: question
state: decided
decided_via: B
statement: The kernel's coverage rules do external I/O and call outward - accept as documented, or refactor?
class: review
killer: false
provenance:
  class: schema-default (review)
  decided_via: user-ruling via chat (2026-07-18)
  killer: schema-default (false)
  state: user-ruling via chat (2026-07-18)
---
## Options

A) Accept as documented: the tests-pass shell-out is the long-recorded expected finding; the model rationale carries it.

B) Refactor in the i27 build: move the run seam to the rim.

C) Refactor at a later build.

## Ruling

The owner rejects acceptance. The law: EXTERNAL I/O GOES THROUGH THE LAYERS. File and disk I/O crosses the onion on an I/O busbar like any other input; a kernel element never touches the world directly. The coverage rules' run seam refactors to route through the I/O lane, and the onion gains a disk-I/O busbar representation. Scheduling lands in the M6 build plan; if it does not fit, the carry-over is explicit, never silent.

## Rationale (not load-bearing)
The finding has been documented since i18 with no field cost. A refactor spends i27 budget the M2 review already flagged as tight.
