---
minted_in: i1
id: req-close-refuses-loose-ends
type: "[[requirement]]"
statement: If a record holds unlanded work the engine shall refuse the close and name it; if it holds an unruled finding the engine shall CARRY the finding to the next record, name it, and count it on the closed record.
kind: functional
verify_method: test
breaks_if_removed: A record closes over work nobody landed and findings nobody ruled, and the archive lies.
breaks_how_badly: fatal
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record precondition
  - uc-close-a-record ext 6a
  - uc-close-a-record step 3
  - uc-close-a-record step 4
  - uc-close-a-record ext 2a
  - uc-close-a-record ext 3a
  - uc-close-a-record ext 4a
  - ".se/req-mine-sebots.md: rejections need memory"
  - "owner ruling 2026-08-16: the close hands over rather than refusing"
priority: must
ears: "exempt — owner ruling 2026-08-16 split one close-time rule into two dispositions (refuse on unlanded work, carry an unruled finding); the statement states both halves and no single EARS shape covers a two-branch rule. See Detail."
---

## Detail

TWO LOOSE ENDS, AND THEY ARE ANSWERED DIFFERENTLY. That split is the whole
of this row, and it was one rule until 2026-08-16.

- UNLANDED WORK REFUSES. If the record holds work that has not landed, the
  engine shall refuse the close and name the unlanded work. Nothing about
  this changed: unlanded work is the record's own job and nobody else can do
  it later.
- AN UNRULED FINDING IS CARRIED. The engine shall hand it to the next record,
  name it in the close's answer, and write the count on the closed record.

## Why the finding is carried and not refused

OWNER RULING 2026-08-16, after the refusing shape trapped the walk.

DISPOSING A FINDING MEANS FIXING THE THING OR RULING ITS REGISTER ENTRY, and
a ruling is usually the person's. So a refusing close puts a person-blocking
step at the very end of every record — at the one moment when the only thing
left to do is ship, which is when the pressure to wave it through is highest.
That is how a checklist becomes a formality.

AND IT TRAPS THE WALK. A close that will not pass leaves the walk standing in
the last state with no legal move. The same shape failed three times in one
day, and stepping out to the desk unbinds the record to fix a two-line problem.

CARRYING IS STILL A DISPOSITION. "Carried to the next record, on the record"
is an agreed outcome, which is what NASA NPR 7123.1 means by a review
completing on the agreed disposition of every finding rather than on every
finding being fixed.

## What keeps it from being a slow leak

THE COUNT IS THE POINT. A carried list nobody counts is the same as losing
them slowly, so the closed record carries `carried_count` and the items
themselves. A number that grows every record is a signal somebody can act on,
and it is what decides when a pruning record is due — measured rather than
remembered.

THE STOP MOVES TO THE SEED, and that half is not built by this row. Above a
threshold the next record should be a pruning one, and the moment to ask is
when the person is already choosing what to work on.

## Behaviour

One invariant per half.

- A close attempted over unlanded work refuses and names it.
- A close over an unruled finding SUCCEEDS, its answer names every carried
  item with its register entry, and the closed record carries the count.
