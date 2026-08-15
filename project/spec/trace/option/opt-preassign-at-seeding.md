---
minted_in: i2
id: opt-preassign-at-seeding
type: "[[option]]"
statement: no runtime claiming at all - the person assigns each seeded iteration to a machine up front, and the assignment rides the stub
cluster: cluster-the-record-life
question: what serializes a claim
found_by: without
source: "the trimming question - remove the claim cluster and the PERSON does its job at seeding time"
---

## Mechanism

The stub carries its assigned machine id from birth. No race, no lock,
no force - the pool is partitioned before anyone runs. Who takes over
the claim's job: the person, once, at the desk.

WHAT IT COSTS HERE: elasticity - a fast machine finishing early cannot
take a slow machine's queued work without the person re-assigning; an
offline person blocks all redistribution. The owner's own vision
("let agents claim") argues against it, but the chart records it
because the null option is regularly the honest baseline.
