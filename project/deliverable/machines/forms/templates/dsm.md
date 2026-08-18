---
id: template-dsm
statement: The matrix with the groups drawn on it — elements on both axes, a mark where one affects the other, and a box round every cluster.
editor: dsm
resolves: artifact
line_pattern: ^\| .+ \|
line_help: one row per element; the cells are the element and its cluster
---

# dsm

A design structure matrix. The elements sit on both axes, and a cell is
marked where the row element affects the column one.

## Why it is drawn rather than listed

Sorted so each cluster is contiguous, the groups appear as BLOCKS on the
diagonal. A person reads the structure off the picture in a second.

The same information as a list of memberships tells nobody anything. You
cannot see, from a list, that one group is nearly self-contained and another
is held together by a single thin link.

## What the field declares

```
- name: clusters
  template: dsm
  of: function
  items:
    - $functions
  writes: cluster
  picks:
    cluster: $clusters
```

- `items` — the elements on both axes.
- `writes` — the frontmatter key holding each element's group.
- `picks.cluster` — the groups on offer, so a row can be reassigned.

## The engine groups, and never overrules you

The clustering search runs on every look ([[meth-dsm-clustering]]). It reads
the edges, finds groups with high internal and low external coupling, and
orders the rows so they show.

A PLACEMENT YOU MADE BY HAND IS FIXED. The search groups around it. A search
that moved a person's decision is a search nobody would trust again.

## It is deterministic

Same input, same picture, every time.

A matrix that reordered itself between two looks would put nothing where you
left it, and no amount of clever grouping would make up for that.

## The diagonal is blacked out

A cell on the diagonal is an element against itself. It carries no
information, and left empty it reads like an absent dependency.

## Naming happens underneath

The engine can group. It cannot say what a group IS, or why its members
belong together. That is a separate field over the cluster nodes, and it is
the part only a person can do.

## Stored form

A markdown table, so the file stays readable to somebody who never opens the
editor.

```
| element | cluster |
| --- | --- |
| [[fn-serve-a-step]] | [[cluster-the-walk]] |
```

The stored copy is a RENDERING. The nodes are the truth, and the matrix is
rebuilt from them on every look.
