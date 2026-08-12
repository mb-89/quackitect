---
minted_in: i2-parallel-iterations-across-machines-seed
id: opt-machines-advertise-availability
type: "[[option]]"
statement: reverse the direction - machines advertise that they are FREE, and assignment happens at the desk against the availability list instead of machines claiming work
cluster: cluster-the-record-life
found_by: transform
source: "SCAMPER Reverse applied to the claim - the work stops being taken and starts being given"
---

## Mechanism

Each machine pushes a small availability mark when idle; whoever seeds
or triages assigns stubs against the visible fleet. No claim race ever
happens because assignment is centralized in the person.

WHAT IT COSTS HERE: heartbeat pushes (noise on the remote), a person in
the loop for every assignment (the elasticity loss of preassignment
wearing a new coat), and staleness twice over - a crashed machine
advertises free forever. Recorded because the reversal is real; its
costs are why the claim direction stands.
