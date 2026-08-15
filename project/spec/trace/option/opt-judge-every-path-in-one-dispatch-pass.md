---
minted_in: i27
id: opt-judge-every-path-in-one-dispatch-pass
type: "[[option]]"
statement: leave the root where it is and check every call's path against one rule at the single dispatch point, refusing what falls outside the record
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: prior-art
source: "raid-dec-two-layer-auth, minted i1, status decided — authorisation splits into which tools a step exposes and whether this call's path is allowed here"
---

## Mechanism

One predicate, in the pass every call already goes through. Inside the
record is writable; outside is not. The root never moves, so nothing
resolves differently from today.

IT IS OUR OWN DECIDED DECISION, not an external idea. raid-dec-two-layer-auth
was ruled at i1 and its trigger is, word for word, any write landing outside
the record from inside a bound walk.

IT COVERS THE SHELL. A judgment in the dispatch pass sees every tool
including se_run, which is the hole SE-C-134 leaves open by guarding five
write verbs and nothing else.

WHAT IT COSTS HERE. One predicate, and raid-dec-thin-tree's thin worktree is
what makes it a one-line judgment rather than a tree walk.

THE KNOWN WEAKNESS, from the literature rather than from us. This is the
access-control-list shape, and the confused-deputy analysis is that ACL
systems do not protect against it while capability systems do. A rule about
where a write may LAND also says nothing about where a read may come FROM,
and the read case is where today's worst false finding came from.
