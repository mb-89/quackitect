---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-name-the-acceptable-over-driving-rate-in-advance
type: "[[option]]"
cluster: the-sizing
question: how over-driving is measured
statement: "the design states in advance what proportion of work it is willing to over-drive, and measures against that number, so over-provisioning becomes a budget somebody set rather than a drift nobody sees"
found_by: analogy
source: "emergency-department triage, where the two errors are named and priced separately: under-triage is measured and held near zero because it kills, and a substantial over-triage rate is ACCEPTED and stated as the price of that, rather than being discovered later as waste"
---

## Mechanism

THE TRANSFER IS THE NAMING, NOT THE NUMBER. Triage does not try to be
accurate; it tries to be safe in one direction and honest about the cost in the
other. The acceptable over-triage rate is a figure somebody chose and publishes.

APPLIED HERE: say what fraction of states we are willing to walk with a driver
stronger than they needed, before rating anything. A rating pass then has a
target to miss rather than only a floor to clear.

WHY IT BREAKS SOMETHING THE OTHER OPTIONS DO NOT. Every other answer to the
drift risk needs an error signal — a reconciliation, a derived rung, a revised
table. THIS ONE NEEDS NO SIGNAL AT ALL. A stated target makes the drift
visible as a gap between intention and the rating distribution, which is
computable from the ratings alone the day they are written.

WHAT IT DOES NOT DO: it cannot tell you WHICH rung is wrong. It tells you that
the set as a whole has drifted from what was intended, which is strictly less
than a reconciliation and enormously cheaper.

AND IT SURVIVES THE ASYMMETRY. Because under-driving is the dangerous error
here too, the same shape applies: hold under-driving near zero, accept a stated
over-driving rate, and stop pretending the rate is zero.
