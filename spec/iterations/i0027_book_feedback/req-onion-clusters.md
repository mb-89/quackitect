---
id: req-onion-clusters
type: requirement
depends_on: []
statement: Where a level contains a coupling cluster, the book shall render the cluster as one enterable block with a top input bus, a bottom output bus, and no core.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Cluster rules (owner, 2026-07-17)

A cluster groups nodes on ONE level so the onion does not grow crowded. Its rules:

1. A cluster is entered by activating it, the same way a ring is entered.

2. Inside, the cluster has its own top input bus and bottom output bus. It has NO core drawn inside.

3. Every input to the cluster comes from its input bus. Every output leaves through its output bus. The cluster block itself never carries a direct arrow to anything; its whole surface is the two buses.

4. A cluster MAY contain a node that talks to the core. That connection rides the cluster's output bus, and on the onion level the bus lane connects onward to the core. The core wiring lives on the level, never on the cluster.

5. Bus lanes are IDENTIFIED. Each input lane names its source; each output lane names its target. Two inputs from two sources are two named lanes.

6. Sides carry no meaning inside a cluster. Nodes sort to avoid crowding and to minimize wire crossings.

7. A node inside a cluster may itself be a cluster. Nesting repeats these rules at every depth, including the bus-only boundary.

8. Clustering is derived from real coupling with a design-structure-matrix method. The goal is low external complexity; high internal complexity is acceptable.

9. The diagram is part of the top-down design process, not documentation of finished code. The build follows the diagram; the diagram comes first.

The layout of a single level, cluster or not, follows [req-onion-io-rendering](req-onion-io-rendering.md) and its drawing [onion-io-layout.excalidraw.md](onion-io-layout.excalidraw.md).

## Rationale (not load-bearing)
The owner specified clusters to keep large onions readable. External simplicity over internal simplicity is the guiding principle.
