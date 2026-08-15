---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-reconcile-at-entry-and-reload
type: "[[option]]"
statement: level every open tree against trunk at entry and at reload rather than at every write, so a method change reaches all of them without a write costing N writes
cluster: cluster-the-walk
question: how shared method reaches a tree
found_by: contradiction
source: "TRIZ separation IN TIME, on the contradiction that fanning method out removes the reason to leave and multiplies every method write by the number of open trees"
---

## Mechanism

The fan-out is not a property of the write. It is a pass that runs at two
moments: when a record is entered, and when the engine reloads.

A method write lands once, in trunk. Every tree catches up the next time
somebody walks into it.

THE SEPARATION IS IN TIME. Both demands are real - one copy of the method,
and no write paying for twenty-seven trees - and they only fought because
they were assumed to apply at the same moment.

IT IS ALREADY THE RULED SHAPE. The 2026-08-06 retro ruled a method change
lands in trunk and every open worktree at once, with the reconcile pass as
the reload-time backstop. This option is that ruling with the write half
moved off the hot path.

THE MEASUREMENT THAT MAKES IT URGENT. Twenty-seven worktrees stood sixteen
method files behind trunk on 2026-08-13, and levelling them was hand work.
The engine now does it at entry, so half of this already runs.

WHAT IT DOES NOT COVER. A tree entered once and walked for hours sees no
further updates until a reload. Whether that matters is raid-dec-thin-tree's
own open bet: does a walk survive the method moving under it.
