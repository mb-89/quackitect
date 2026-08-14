---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-mark-the-tree-at-bind-while-intent-is-still-known
type: "[[option]]"
statement: stamp the target tree onto the record at the moment of binding, when the caller still knows which one they meant, and resolve every later path against that stamp alone
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: analogy
source: "the Universal Protocol for preventing wrong-site surgery — the site is marked by the operator with the patient awake, BEFORE anaesthesia removes their ability to confirm; https://www.ncbi.nlm.nih.gov/books/NBK2678/box/ch36.box2/"
---

## Mechanism

Surgery does not verify the site at the incision. It marks it earlier, at
the one moment the party who knows can still speak, and everything after
that reads the mark rather than re-deciding.

THE TIMING IS THE WHOLE MECHANISM, and it is the part usually missed. The
protocol does not merely require a mark. It requires the mark to be made
before the patient is anaesthetised, because after that the only source of
truth about which side is correct is gone.

THE TRANSFER. The moment our caller knows which tree they mean is ENTRY.
By the time a write happens the walk is deep, the path is relative, and the
tree is inferred from whatever the engine happens to hold - which is exactly
how a diagnostic read the bound worktree's copy on 2026-08-13 and reported
a false finding with total confidence.

So: resolve ONCE, at bind, and stamp it. Later paths read the stamp. Nothing
downstream re-derives which tree it is in.

WHAT ELSE THE PROTOCOL CARRIES. A time-out immediately before the act, led
by a different role. Its analogue here is the read-back, which is the other
analogy option - and in surgery the two are one protocol rather than rivals.

WHAT IT COSTS. One field on the bound record, and a rule that nothing may
resolve a tree any other way. The rule is the expensive half: one bypassing
code path and the mark means nothing, which is the same weakness
opt-confine-the-root-to-the-bound-tree carries.
