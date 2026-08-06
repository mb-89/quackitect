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

Id prefix `nbr-`.

## Fields

Every field carries its name, its semantics and its value range. A field
that cannot be filled honestly is left out, never guessed.

- `id` (`nbr-<slug>`): unique across the whole trace corpus.
- `type` (`"[[neighbour]]"`): a LINK to this template, which is what makes a
  node typed. A bare `neighbour` reads the same.
- `statement` (one sentence): what this neighbour IS, in the reader's terms.
  Not what we do with it.
- `direction` (in | out | both): which way the system's relationship runs.
  - `in` — the neighbour drives the system. A person, an agent, a host.
  - `out` — the system drives the neighbour. A tool it calls, a service it
    reaches.
  - `both` — traffic runs each way and neither side is only a caller.
- `refines` (list, optional): normally absent. A neighbour's parent is the
  boundary, and that edge is implicit in the type.

## Body

One section, and it is the point of the node.

- `## Interface` — WHAT CROSSES THE BOUNDARY. Name the actual thing: a
  protocol, a file format, a command, a keystroke. "Integrates with X" is not
  an interface. A reader must be able to tell what would break if the
  neighbour changed.

## The boundary is a claim, and it is checkable

A neighbour the running system talks to but the context does not name is a
standing defect. So is a neighbour named here that nothing reaches any more.

At rest, this folder and the system's real integrations are the same list.

## Example

```
---
id: nbr-{{slug}}
type: "[[neighbour]]"
statement: {{what it is, in one sentence}}
direction: in
---

## Interface

{{what actually crosses the boundary — the protocol, format, or command}}
```

## Mint skeleton

A new neighbour is seeded from this fence verbatim. The engine owns `id`
and `type`; everything else starts as a TODO the author must answer.

```skeleton
statement: TODO — what this neighbour is, in one sentence
direction: TODO — in | out | both
```
