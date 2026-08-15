---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-read-back-from-the-tree-the-caller-meant
type: "[[option]]"
statement: close every write with a read from the tree the caller named, so the write is proved by what came back rather than by its own verdict
cluster: cluster-the-walk
question: how a resolution is made visible
found_by: analogy
source: "aviation readback-hearback, ICAO Annex 11 — the receiver repeats the clearance and the issuer checks it; https://skybrary.aero/articles/read-back-or-hear-back"
---

## Mechanism

Air traffic control does not treat an instruction as delivered when it is
spoken. The pilot repeats it, the controller listens to the repetition, and
the loop is only closed when the controller hears it correct.

THE FOUR STEPS ARE THE TRANSFER. Instruction, readback, hearback, correction.
Ours today has step one and nothing else: the tool answers ok and the caller
believes it.

WHAT MAKES THE ANALOGY EXACT rather than decorative. The named failure mode
is a HEARBACK ERROR - an uncorrected wrong readback that is not detected
until the controller sees the deviation on the display, by which point
separation is already lost. Read our own raid-risk-a-write-lands-in-the-wrong-
tree-silently beside it: the work appears to land, and it is found at a merge,
or never. Same shape, same lateness, same cost.

WHAT IT COSTS HERE. One read per write. On the measured trunk-read figure
that is 2.0 ms through the batch reader, which is the difference between a
write that is believed and a write that is proved.

WHAT DOES NOT TRANSFER. Aviation's loop needs two parties, and the check is
that a DIFFERENT actor confirms. Here the same engine writes and reads back,
so a resolver wrong in one direction is wrong in both. The transfer buys
proof against a failed write, not against a mis-resolution - and saying so
is the part a decorative analogy would skip.
