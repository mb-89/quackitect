---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-roster-and-the-mapping-are-two-records-on-two-clocks
type: "[[option]]"
cluster: the-sizing
question: what the mapping from difficulty to driver holds
statement: "the difficulty-to-rung mapping and the roster of models filling each rung live in two separate records, because they move on different clocks and for different reasons"
found_by: heuristic
source: "the heuristic group what changes together and separate what changes apart, held against the sizing cluster"
---

## Mechanism

THE OBVIOUS DESIGN IS ONE FILE — a ladder that reads `major -> the strong model,
minor -> the middle one`, and every fact about sizing in one place. That is the
shape `req-one-model-list-is-read-live-from-the-repository` invites, and it is
wrong for a reason the heuristic names exactly.

TWO CLOCKS, NOT ONE. The roster moves when a vendor ships or retires a model —
outside this project, on somebody else's schedule, several times a year, and the
change is a fact about the world. The mapping moves when we decide that a minor
change deserves a stronger hand — inside this project, rarely, and the change is
a judgement we own. Putting them in one record means every vendor announcement
touches a file that carries policy, and every policy argument happens in a file
full of model names.

WHAT SPLITS THEM CLEANLY. The mapping names rungs and never a model. The roster
names, for each rung, the models that fill it. Neither record can be edited into
naming a driver by itself, so `req-the-machine-names-a-driver-and-starts-nothing`
survives either way.

WHAT IT COSTS: two files to read live instead of one, and a join that can fail —
a rung the mapping names and the roster does not fill. That failure is exactly
the unmatched case `req-an-unmatched-rung-names-itself-and-publishes-no-driver`
already handles, so the split adds a way to reach a case that already has an
answer rather than adding a new failure.

AGAINST IT: at four rungs and one host, the split is ceremony. It earns its keep
only when the roster starts moving faster than the policy, and it is possible
that never happens.
