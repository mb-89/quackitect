---
kind: method
statement: DSM clustering searches cluster assignments over a DSM. It maximises dependency inside a cluster and minimises it across clusters, exposing candidate modules.
source: ref-structural-complexity-management
---

## Situation

Reach for it once a [DSM](meth-dsm) exists and the open question is which
elements form a cohesive module.

That is the M3 and M4 grouping call, which is otherwise pure judgment.

## Effect

Turns a judgment into a computed answer. The judgment is "this element sits
here because it is tightly coupled to these".

A cluster is a defensible module boundary because an edit to one element
inside it mostly stays inside it.

High internal density with low external density is the informal objective.
The source links that objective to two criteria.

- The strongly-connected-component criterion. All nodes mutually reachable
  implies internal connectivity is at least external.
- A similarity criterion.

NO READY-TO-RUN ALGORITHM IS GIVEN in the source. It names the canonical
worked example, and the research that supplies the actual objective and
search.

The worked example is Pimmler and Eppinger 1994. A 16-element automotive
climate-control-system DSM, clustered into both product modules and the
matching team structure.

## Procedure

Run a stochastic hill-climb over cluster assignments, in the cost and bid
style of Thebeau 2001.

A comparable heuristic also works.

- Fernandez 1998.
- Yu and colleagues, 2003. A genetic algorithm with a
  Minimum-Description-Length formulation.
  - It also separates cluster elements from cross-cutting "bus" elements.

Either way the search maximises coupling inside a cluster and minimises it
across clusters.

Manual realignment in a spreadsheet tops out around 30 elements. Past that,
automate the search.
