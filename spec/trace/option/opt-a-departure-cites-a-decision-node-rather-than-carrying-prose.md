---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-a-departure-cites-a-decision-node-rather-than-carrying-prose
type: "[[option]]"
statement: A departure is legal only where it cites a standing decision, and a departure citing nothing fails a check by name.
cluster: cluster-the-door-regime
found_by: prior-art
source: v2 at ref v2, product/spec/ledger/se/adr-grandfathers-historical.md — historical grandfathers become recorded decisions, not silent constants, and an exemption without a citation fails test-grandfathers-decided
---

## Mechanism

The departure carries a REFERENCE instead of a sentence. Every exempt marker
names the decision that granted it, and a test asks whether that reference
resolves.

WHAT IT BUYS OVER A FREE-TEXT REASON. A sentence can be copied down a column
and nothing notices. A citation cannot, because the decision it points at
either exists and covers this case or it does not. It also gives the reader
one place to go rather than as many places as there are departures.

WHAT IT COSTS HERE. Somebody has to open a decision before they may depart,
which is heavier than typing a reason. That weight is the point where the
departure is rare and the wrong trade where it is common.

It answers the open question on
raid-asm-a-demanded-reason-is-a-considered-reason directly. That node asked
for a reason that names something checkable, and this is the predecessor's own
answer to the same worry.
