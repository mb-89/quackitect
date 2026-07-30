---
kind: matrix-row
name: rank-unknowns
statement: Rank the unknowns and timebox the spikes - seeded from RAID, tripwires and doubtful verify methods.
state_kind: work
filled_by: agent
depends_on:
  - gate-architecture
seeds: spikes
---

## Guidance

Sources: the RAID register, the M5 tripwires, any requirement whose verify_method is doubtful. Rank by exposure - risk-based testing's probability times consequence ([[meth-risk-based-testing]]). This state SEEDS the iteration's spike machine: one parallel spike per chosen unknown, each timeboxed ([[meth-spike-tracer]]).

## Evidence form

- ranking | the unknowns ranked, with what-if-wrong | required
- seeded | the spike list with timeboxes | required
