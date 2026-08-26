---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-publish-the-driver-only-when-it-changes
type: "[[option]]"
cluster: the-sizing
question: how often the block publishes
statement: the block publishes a driver only when the answer differs from the one already standing, so the common case costs nothing and a receiver sees a signal rather than a heartbeat
found_by: heuristic
source: the heuristic make the common case cheap and the rare case possible, held against the sizing cluster
---

## Mechanism

THE COMMON CASE IS THAT NOTHING CHANGED. Consecutive states of a milestone
mostly share a rung, and consecutive milestones often do too. Republishing the
same name every time makes the receiver filter a stream to find the one event
it cares about.

PUBLISH THE DIFFERENCE INSTEAD. A named driver appears when the answer moves,
and its absence means the standing answer holds.

WHY IT MATTERS MORE UNDER PER-STATE NAMING. If the trim that names a driver per
state is taken, the raw rate goes up by a factor of the states in a milestone —
and almost all of that traffic is repetition. The two options are close to
being one design: name per state, publish on change.

WHAT IT COSTS: a receiver that arrives late has no standing answer, so the block
must publish the current one on first ask as well as on change. That is the
ordinary retained-last-value problem and it has an ordinary answer.

AND IT MAKES THE LOG READ BETTER, which is not the reason but is a real
consequence. A record whose driver entries are all changes is a record of
decisions; one where every state repeats the same name is a record of ticks.
