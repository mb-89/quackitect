---
template: item-design-spec
artifact: node
id_prefix: dsp-
folder: project/spec/trace/design-spec
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ban_words:
      - appropriate
      - adequate
      - sufficient
      - robust
      - reasonable
      - thoroughly
      - properly
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: a weasel word cannot carry a responsibility
---

# design-spec — one design concern, below the architectural line

Lives in `project/spec/trace/design-spec/`. A STANDING ARTIFACT: it
outlives the iteration that authored it, like a requirement.

ONE SPEC, ONE DESIGN CONCERN. A spec details how a coherent piece of the
structure works — the choices with local reach, safe to revise inside
it. The architecture above it lives on the elements; this note carries
the detail the element card is too coarse for.

THE SPEC CARRIES THE TRACE EDGE. `realizes:` names the element ids it
details — the child names its parents, like every other node. The trace
graph draws element ← design-spec in the design slice. Nothing is
written on the element.

A LINK IS A CONTRIBUTION. A spec names an element only when its design
actually serves that element. A spec that serves nothing stays visibly
unlinked, is discussed, and is usually cut — never filed somewhere to
look covered.

THE FILES ARE REALIZATION, NOT TRACE. `files:` names the code this
design lands in, root-relative. The engine's sweep checks the seam
mechanically and OUTSIDE the graph, at trace-design:

- every design spec names files that exist
- every deliverable code file is claimed by at least one spec — the
  unclaimed list is the dead-code view

FILE GRAIN FIRST. v1 marked regions inside files (`// design: <id>`)
and swept declarations outside every region. The file is this schema's
grain for now; regions return when a file proves too coarse. Dead code
INSIDE a claimed file stays invisible at this grain — a noted, accepted
cost for now.

## Sources

- IEEE 1016's component attributes shape the body sections —
  [[ref-ieee-1016]].
- v1's design-regions table and marker sweep —
  @ai/quackitect/spec/man-design-output.md and
  @ai/quackitect/product/engine-go/book.go (the `// design:` markers).
- The spec-carries-the-edge shape mirrors [[test-spec]] (owner ruling
  2026-08-11).

## The template

```skeleton
---
# The engine writes id and the type link. id is dsp- plus a slug.
#
# THE RESPONSIBILITY, one sentence — what this design answers for,
# arguable like a register title.
statement: TODO — <the concern>, carried by <the mechanism>
#
# THE TRACE EDGE: the el- ids this design details. At least one.
realizes:
  - TODO — an el- id
#
# THE REALIZATION: the code files this design lands in, root-relative
# (project/deliverable/...). Named before the build — test-first's
# sibling: the file may not exist yet.
files:
  - TODO — project/deliverable/<path>
---

## Responsibility

<!-- What this piece accomplishes and what it deliberately does not.
The one section every spec carries. -->

## Interface

<!-- What the neighbors see: the entry points, the data in and out,
the contract. Omit when the element card already carries it whole. -->

## Behavior and constraints

<!-- How it works when it matters: state, ordering, timing, failure
behavior. Preconditions and invariants the code cannot say. -->

## Rationale

<!-- Why this shape over the nearest alternative. Cite the decision or
the experiment where one exists. -->
```
