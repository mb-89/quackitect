---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-pointer-outside-both-trees
type: "[[option]]"
statement: a record kept in a machine-local data area, keyed to the working tree, names which copy that tree must follow back
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: v1's engineHomeRecordPath and dataHomeFor, product/engine-go/data.go at ref main
---

## Mechanism

THE RECORD LIVES OUTSIDE BOTH TREES, in a per-user data area. It is found by
deriving a key from the working tree and looking the key up.

v1 DERIVES THE KEY FROM THE TREE'S PATH: the directory's own name plus the
first six characters of a hash of its canonical absolute path. The record is a
one-line file naming the copy, written at the moment the tree was produced.

WHAT IT BUYS. The working tree stays clean. Nothing about the tool appears in
the user's own repository, so a colleague who clones that repository sees no
trace of the tool at all.

WHAT IT COSTS HERE, AND THIS IS DECISIVE. The key is the tree's PATH, so
moving the tree loses the record. The area is per-user and per-machine, so
copying the tree to another machine loses it, and so does a colleague cloning
it. All three are established by reading the derivation rather than argued
from principle.

v1 KNEW THIS AND BUILT A REPAIR RATHER THAN A FIX. Any run whose working tree
is a real source repository re-records the pointer, so one command inside that
repository restores every tree on the machine. The repair is guarded by a
two-part identity check — the method layer AND the program's source — so that
a copy carrying only the method cannot claim the pointer.

THAT REPAIR IS THE EVIDENCE AGAINST THE OPTION. A mechanism that ships with a
standing fix for its own loss has told you what it does under the three moves
that matter here.

AND THIS PRODUCT FORBADE THE WRITE OUTRIGHT, WHICH IS NO LONGER TRUE. That
sentence stood here until 2026-08-18 and it excluded this option before any
scoring happened.

THE OWNER RULED THE JAIL WAS TOO STRICT. Driving a foreign product means the
foreign product is outside our own tree, so a write outside it is unavoidable
and no arrangement of one target serves the demand. The law is the DIRECTION of
writes, never their count: nothing a copy does may reach its SOURCE, and a
driven tree is not the source.
[[raid-iss-the-path-jail-has-one-write-target]] carries the ruling and the
proof.

SO THIS OPTION IS BACK ON THE CELL. It was never weighed on its merits against
the others, because it was out before the weighing.

## The objection that survives, and it is the stronger one

THE JAIL WAS THE SECOND OBJECTION. The first is above and it does not depend on
any rule of ours: this mechanism ships with a standing repair for its own loss,
and a mechanism that needs a standing fix has told you what it does under a
move, a copy and a clone.

THAT IS EVIDENCE FROM THE ONLY IMPLEMENTATION ANYBODY HERE HAS RUN. Weigh this
option on that, not on the jail.

AND IT IS ALSO WHY THE OPTION MATTERS. v1 keeps its pointer exactly here, and
`product/engine-go/i18_red3.go` at ref main is a passing end-to-end test of the
chain that pointer serves. The mechanism is proven to work and known to be
fragile at the same time, which is a more useful position than either half
alone.
