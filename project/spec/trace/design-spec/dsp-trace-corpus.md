---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: dsp-trace-corpus
type: "[[design-spec]]"
statement: the trace read live from node files, carried by one loader with a stat-stamped cache and schema-checked edges
realizes:
  - "el-account"
files:
  - "project/deliverable/engine/trace.ts"
  - "project/deliverable/engine/traceschema.ts"
  - "project/deliverable/engine/frontmatter.ts"
  - "project/deliverable/engine/bin/backfill-minted.ts"
  - "project/deliverable/engine/puml_mindmap.ts"
---

## Responsibility

The corpus is the folder of typed nodes; the loader derives the graph
on every look, stamped against file stats so unchanged trees cost
milliseconds. The schema card declares the legal edges and slices; the
edge check refuses what it does not list. Conformance runs the item
templates' declared checks over every node.

## Behavior and constraints

- Every schema key folds into the one drawn slot, or its level goes
  invisible.
- The view derives from files and never mixes sources.
