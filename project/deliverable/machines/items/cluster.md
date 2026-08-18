---
template: item-cluster
artifact: node
id_prefix: cluster-
folder: project/spec/trace/cluster
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: coupling
    one_of:
      - shared-data
      - sequence
      - timing
      - shared-failure-mode
      - same-actor
      - same-policy
      - same-external-interface
      - same-lifecycle
    hint: name the coupling class, do not describe it
  - field: name
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a group nobody can name is a group nobody chose
---

# cluster — a group of functions that belong together

Lives in `project/spec/trace/cluster/`. Written at M4 partition-functions.

The engine proposes the grouping from the function DSM. It cannot name one,
and naming is the part that turns a computed blob into something a person can
argue with.

## A CLUSTER IS NOT AN ELEMENT

This is the commonest way M4 goes wrong, and the two look alike on a page.

A cluster is a group of FUNCTIONS — things the system does. An element is a
part of the system that DOES them. The cut into elements is per candidate and
comes later, at M5.

SO IT IS NOT CALLED A MODULE. That word would answer M5's question here, and
every candidate would inherit an element boundary nobody chose.

## MEMBERSHIP LIVES ON THE FUNCTION

A function carries `cluster:` naming the one it belongs to. This node does
not list its members.

WHY THAT WAY ROUND. Two places holding one fact means one of them goes stale.
The function already carries every other edge it is part of, so it carries
this one too, and the cluster's membership is read off them.

ONE FUNCTION, ONE CLUSTER. A partition does not overlap. A function that
seems to belong in two is usually two functions.

## THE COUPLING CLASS IS NAMED, NOT DESCRIBED

`coupling` says WHY these functions are together, from a fixed list:

- shared-data
- sequence
- timing
- shared-failure-mode
- same-actor
- same-policy
- same-external-interface
- same-lifecycle

A named class can be counted, compared across clusters, and argued with. A
sentence describing the coupling cannot, and every cluster gets one that
sounds reasonable.

## Fields

- `id` — `cluster-<slug>`.
- `type` — `"[[cluster]]"`.
- `name` — what this group of functions IS, in one line.
- `coupling` — the class above.
- `source_refs` — the matrix run it came from, or a ruling that moved it.

## The Rationale section

One short paragraph, and only where the grouping departed from what the
matrix proposed. A confirmed proposal needs no argument; a move does.

## Skeleton

```
---
id: cluster-{{slug}}
type: "[[cluster]]"
name: {{what this group of functions is}}
coupling: shared-data
source_refs:
  - {{the matrix run, or the ruling that moved it}}
---

## Rationale

{{why this grouping departs from the proposal, or strike this section}}
```

## Sources

- Lindemann, Structural Complexity Management. Clustering finds subsets with
  high internal and low external dependency.
- The SyA corpus at @ai/sya_kb, chapter 01: functional partitioning precedes
  static partitioning, and the two are not the same act.
- [[meth-dsm-clustering]] for the search itself.
