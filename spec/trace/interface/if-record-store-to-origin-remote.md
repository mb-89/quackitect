---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-record-store-to-origin-remote
type: "[[interface]]"
statement: The only outward edge the agent may never cross by itself, which makes its bound a permission rather than a duration.
source: el-record-store
destination: nbr-origin-remote
carries:
  - flow-trunk
form: git over the network
bound: 1 second on the read half; the push is a person's act
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
  - "SE-C-003: push stays with the user"
---

## What crosses

- a push of trunk or a record branch, on the person's act
- a fetch of what the remote holds

## Measured 2026-08-17, and it corrected the bound

`git ls-remote --exit-code origin HEAD` — a full network round trip to the
remote — took 665 ms. INSIDE ONE SECOND.

THE BOUND ON THIS NODE WAS WRONG WHEN IT WAS WRITTEN. It said "not one
second" from an armchair, because network sounded slow. The read half meets a
second comfortably and now says so.

WHAT STAYS OUTSIDE. A push moves objects rather than refs, so its cost follows
the payload; it is also the person's act and never on an agent's critical
path. The bound above splits the two rather than pessimising both.

THIS IS WHY MEASURING BEATS REASONING, and it is the second time today the
same lesson landed: the first was a latency count taken from a log that
undercounts.

## Why the bound is a permission

THE AGENT NEVER PUSHES. It is refused at the lane, so no duration this edge
takes is on any agent's critical path. A slow push costs a person's patience,
which is a real cost and a different one.

SO THE HONESTY HALF IS ALL THIS EDGE OWES. A push in progress says so; a
rejected push says why.

## Why it is modelled even though the agent cannot use it

AN EDGE NOBODY MAY CROSS IS STILL AN EDGE, and leaving it out would make the
boundary set read as complete while a whole direction of traffic went
unrecorded. It is also the edge a cloud run depends on, so a later iteration
working on cloud agents starts from a node rather than from a gap.
