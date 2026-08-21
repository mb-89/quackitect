---
template: item-neighbour
artifact: node
id_prefix: nbr-
folder: spec/trace/neighbour
sections:
  - Interface
applies_rigor:
  - systematic
applies_type:
  - default
---

# neighbour — one thing outside the boundary, and what crosses it

Lives in `spec/trace/neighbour/`. It is a STANDING ARTIFACT: it
outlives the iteration that authored it, lands on trunk when that record
closes, and a later record may change it.

The context diagram is a BLACK BOX in the middle and its neighbours around
it. The box is the system; each neighbour is one of these nodes; each
connection is the neighbour's own `direction` and its Interface section.

THE FIGURE IS NOT BUILT YET. Nothing in the engine reads this type: the word
`neighbour` appears in one test file and nowhere else in the code. When it is
built, the figure will derive from these nodes rather than being hand-drawn.
Until then these nodes are the record of the boundary and no surface shows
them.

## Groups

A neighbour MAY name a group, and neighbours sharing one are the same kind
of thing. Fifteen loose nodes around one box is unreadable, and the count only
grows.

```yaml
group: supported-products
```

THE FIELD IS OPTIONAL and a neighbour without one stands on its own. Three
groups are in use.

- `supported-products` — third-party products this system works with or
  recommends. VS Code, Obsidian, the agent harness, a wireframe editor.
- `required-toolchain` — what the checks will not run without. Node, git, the
  typechecker, the linter, the test runner.
- `lineage` — trees and machines related to this one. A descendant, a parent,
  a peer, a driven project, the remote they meet on.

A PERSON IS NEVER IN A GROUP. Roles stand alone, because grouping them with
tools is how a boundary picks up intentions it cannot have.

IT IS `group` AND NOT `cluster`, DELIBERATELY. A cluster is already a thing
here: a partition of FUNCTIONS, carrying a coupling class from a fixed list,
written at M4 from the function matrix. The engine wires that word to the
design structure matrix in dozens of places, so a neighbour landing in
`spec/trace/cluster/` would feed a non-function into machinery that partitions
functions.

MEASURED WHILE WRITING THIS, 2026-08-21. A neighbour carrying
`cluster: supported-products` was accepted, and the write answered
`cluster-supported-products resolves to nothing`, naming a path under the
function-cluster folder. The word was already taken; the grouping still needed
a name.

WHEN THE FIGURE IS BUILT, a group will draw as one shape that opens. That is
what the field is for, and it is why the field is worth carrying before the
renderer exists.

## The boundary is a claim, and it is checkable

A neighbour the running system talks to but the context does not name is a
standing defect. So is a neighbour named here that nothing reaches any more.

At rest, this folder and the system's real integrations are the same list.

## The template

A new neighbour is seeded from this fence. Replace every comment with the
real content.

```skeleton
---
# The engine writes id and the type link. id is nbr- plus a slug, unique
# across the whole trace corpus.
#
# refines is normally absent. A neighbour's parent is the boundary, and that
# edge is implicit in the type.
#
# What this neighbour IS, in one sentence, in the reader's terms. Not what we
# do with it.
statement: TODO — what this neighbour is, in one sentence
#
# Which way the relationship runs.
#   in   — the neighbour drives the system. A person, an agent, a host.
#   out  — the system drives the neighbour. A tool it calls, a service it
#          reaches.
#   both — traffic runs each way, and neither side is only a caller.
direction: TODO — in | out | both
#
# Optional. Which group this neighbour belongs to, where it is one of a
# kind: supported-products, required-toolchain, lineage. A person is never
# in a group. Omit it and the neighbour stands on its own.
group: TODO — omit unless it belongs to one
---

## Interface

<!-- WHAT CROSSES THE BOUNDARY. Name the actual thing: a protocol, a file
format, a command, a keystroke. "Integrates with X" is not an interface. A
reader must be able to tell what would break if the neighbour changed. -->
```
