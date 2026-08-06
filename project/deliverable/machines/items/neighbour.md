---
template: item-neighbour
artifact: node
id_prefix: nbr-
folder: project/spec/trace/neighbour
sections:
  - Interface
applies_rigor: [systematic]
applies_type: [default]
---

# neighbour — one thing outside the boundary, and what crosses it

Lives in `project/spec/trace/neighbour/`. It is a STANDING ARTIFACT: it
outlives the iteration that authored it, lands on trunk when that record
closes, and a later record may change it.

The context diagram is a BLACK BOX in the middle and its neighbours around
it. The box is the system; each neighbour is one of these nodes; each
connection is the neighbour's own `direction` and its Interface section. The
figure DERIVES from these nodes — nobody hand-draws the interface list, and
nobody writes it twice.

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
---

## Interface

<!-- WHAT CROSSES THE BOUNDARY. Name the actual thing: a protocol, a file
format, a command, a keystroke. "Integrates with X" is not an interface. A
reader must be able to tell what would break if the neighbour changed. -->
```
