---
id: req-trace-collapsible
type: requirement
depends_on: []
statement: The book shall collapse homogeneous trace fan-outs into typed cluster nodes joined by double lines, keeping each cluster in its type's place and color.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The collapse model (owner ruling, 2026-07-17)

**The past defect.** The previous collapsible render moved collapsed groups to the wrong place and lost their color. A collapsed group of requirements IS still a requirement: it stays in the requirements layer and wears the requirement color.

**The vector-line model** (the Simulink analogy). A clean subgraph collapses by multiplicity, never by structure:

- One use case with five requirements, each with one test and one design, renders as: the use case, a DOUBLE LINE down to one requirement-cluster node, a double line down to one test-cluster node, and one design-cluster node.
- The double line marks a bundled edge, like a vector line in Simulink.
- The graph's overall structure never changes. Only multiplicity bundles.

**Opening a cluster.** A trace cluster opens exactly like an onion cluster: the busbar interior of [req-onion-clusters](req-onion-clusters.md). All inputs and outputs of the cluster ride its bus bars, identified.

- So an edge from outside to one member, an ADR addressing one clustered requirement for example, surfaces at the root as an edge to the cluster, and inside as an identified bus lane. Nothing hides.

**Nesting.** Allowed in principle, same rules. Probably rarely used.

The double line carries a small multiplicity label, the way Simulink annotates vector width (owner-confirmed).

## Rationale (not load-bearing)
One use case with seven requirements, tests, and designs renders as four nodes and three double lines instead of twenty-two nodes. The chapter-5 size problem shrinks by an order of magnitude, and the reader still reaches every member through the cluster's interior.
