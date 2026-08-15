---
minted_in: i27
id: opt-the-claim-file-registers-the-tree
type: "[[option]]"
statement: give the claim file a second job and let it say which tree holds each record, so where a record lives is answered by the artifact that already says who holds it
cluster: cluster-the-walk
question: where a record's tree is recorded
found_by: transform
source: "SIT Task Unification, applied to the incumbent — give an existing component a second job"
---

## Mechanism

The claim file already exists, is already pushed, and already answers one
question per record: which machine holds it. It gains a second field saying
which tree that record's content lives in.

Resolution then reads a registry rather than inferring from ambient state.

WHY TASK UNIFICATION FITS HERE. The alternative is a new registry, and a new
registry is a second source of truth about records - which the heuristic
catalogue's own rule forbids and which the claim lane would immediately have
to be reconciled against.

IT ALSO REACHES A PROBLEM NOBODY ELSE ON THIS CHART TOUCHES. A peer machine
that clones the repository sees records but not their trees. i27's record
already notes that a fresh clone showed all 19 pushed records as archived,
because status was read from the filesystem. The same class of gap: local
disk answering a question that should be answered from the repository.

WHAT IT COSTS. The claim lane is one of the few places the engine pushes on
its own authority, so widening it widens that. And a record with no claim -
this product's own, since Quackitect is the self-hosting exception - has no
registry entry, so the exception needs its own answer.

WHAT IT DOES NOT DO. It says where a record lives. It does not stop a call
reaching the wrong one, so it is a component under confinement or judgment
rather than a rival to either.
