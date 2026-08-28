---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-the-write-time-guard-judges-only-the-write-in-front-of-it
type: "[[option]]"
statement: The guard on the write asks one question about the file being written, and every question about the whole tree belongs to the sweep instead.
cluster: cluster-the-door-regime
found_by: contradiction
source: TRIZ separation IN TIME and IN LEVEL, on the contradiction that making the departure check exhaustive makes every write pay to read the whole rule
---

## Mechanism

Two callers of one rule, split by what each may look at rather than by what
each may decide.

- THE WRITE-TIME CALLER sees one file and the rule. It may ask whether THIS
  write adds a departure and whether that departure carries what the rule
  demands. It may not ask anything about the other files.
- THE SWEEP sees the whole tree and the rule. It answers completeness, staleness
  and every question that needs the set.

WHY IT DISSOLVES RATHER THAN TRADES. The contradiction assumed both demands
apply at one moment. They never did. Correctness of what LANDS is owed at the
write; correctness of what STANDS is owed on a schedule, and no write has to
pay for it.

IT ALSO DISSOLVES THE SECOND ONE, in level. The enumeration that needs a
parser is the sweep's work at the whole-tree level. The write-time guard works
at the level of one file and needs no enumeration at all, which is why the
parser question never reaches the write path.

WHAT IT COSTS HERE. A break that arrives without a write — a rename, a merge,
a registry line deleted out from under a module — is invisible until the sweep
runs. That is a real window and its length is the sweep's interval.

THIS IS THE SHAPE THE EXISTING WIDGET RULE ALREADY USES, and the same
separation is the worked example in the TRIZ card itself, where an exhaustive
corpus check moved off form-open and onto form-submit.
