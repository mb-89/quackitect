---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-work-state-is-replayed-from-an-append-only-change-log
type: "[[option]]"
statement: store no state on a piece of work at all, and derive what it is now by replaying every recorded change against its identity in time order
cluster: the-work
found_by: prior-art
source: Fossil's ticket design, at fossil-scm.org/home/doc/trunk/www/bugtheory.wiki, which replays change artifacts in timestamp order to find a ticket's current state
---

## Mechanism

EACH CHANGE IS AN IMMUTABLE RECORD carrying an identity, a time and a set of
field values. Nothing is ever edited. What a piece of work IS right now is
the result of replaying its changes in order, and a change that names only
the fields it touches leaves the rest alone.

WHAT IT BUYS, and it is the reason the design exists. Two people changing the
same piece of work in two clones merge without a conflict, because neither
wrote over the other. The history of how the work moved is free, rather than
being a second thing somebody has to keep.

WHAT IT COSTS HERE. Every read is a replay, so the count a position shows is
computed rather than looked up. It also leans on clocks: the source that
invented it warns that a change stamped months out of true confuses the
replay badly enough to need an administrator.

IT ANSWERS THIS CORPUS'S OWN RULE DIRECTLY. A stored copy never beats a
derived one, and this is that rule taken all the way down.
