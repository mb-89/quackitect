---
kind: trace-schema
statement: The legal edges between node types — what may point at what, under which name, and in which direction.
edges:
  - from: story
    key: refines
    to: value-prop
    verb: refines
  - from: use-case
    key: refines
    to: story
    verb: refines
  - from: requirement
    key: refines
    to: use-case
    verb: refines
  - from: function
    key: satisfies
    to: requirement
    verb: satisfies
  - from: function
    key: satisfies
    to: function
    verb: satisfies
  - from: element
    key: implements
    to: function
    verb: implements
  - from: interface
    key: implements
    to: function
    verb: implements
  - from: interface
    key: carries
    to: flow
    verb: carries
  - from: element
    key: satisfies
    to: requirement
    verb: satisfies
  - from: interface
    key: satisfies
    to: requirement
    verb: satisfies
subsegments:
  - id: design
    label: design
    levels: [function, element, interface]
  - id: test
    label: tests
    levels: []
---

# The trace schema

Every node points UPWARD at what it serves. This file says which points at
which.

An edge not listed here is a defect. Not a warning, not a convention — the
node is wrong, and the check that reads this file says so.

## The spine

```
value-prop
   ↑ refines
 story
   ↑ refines
use-case
   ↑ refines
requirement
   ↑ satisfies
function
```

Read it downward as a question, one hop at a time:

- A value proposition is served by stories.
- A story is served by use cases.
- A use case is served by requirements.
- A requirement is satisfied by functions.

## A QUALITY IS A REQUIREMENT, AND HAS NO TYPE OF ITS OWN

There is no quality node and no quality edge (owner ruling 2026-08-07).

A quality is a requirement whose `kind` is quality. It hangs under a use
case like any other, and a function satisfies it like any other. One
register, one edge, one coverage rule.

WHAT MAKES QUALITIES DIFFERENT IS WHERE THEY HANG, not what they are:

- `vp-qualities` is the value proposition.
- One story beneath it explains what qualities are and names the standard.
- The nine ISO/IEC 25010:2023 characteristics are the use cases.
- The qualities themselves are the requirements under those.

A SEPARATE TYPE WAS BUILT AND STRUCK THE SAME DAY. It made a second
register, a second coverage question, and it pulled qualities out of the set
criteria that write-requirements argues over the whole register.

## THE USE-CASE LEVEL CARRIES TWO KINDS

A use case was one interaction, told from the user's side. A characteristic
is not an interaction.

So the level holds two things under one name, and that is a known cost
rather than an oversight. The `kind` facet on use-case says which is which.

## FUNCTIONS DO NOT TOUCH USE CASES (owner ruling 2026-08-07)

There is no edge from a function to a use case, and adding one would be a
defect rather than a shortcut.

The chain runs through the requirement. A use case says what somebody does.
A requirement says what is therefore demanded. A function says what the
system does about the demand. Skipping the middle link loses the demand.

It also breaks the coverage checks. Each one is a claim about ONE hop, and a
diagonal edge means a requirement can look covered because something two
levels down mentioned its use case.

## THE EDGE NAME SAYS WHAT THE RELATION IS

`refines` means the child breaks the parent into more detail. Same kind of
thing, finer grain. A use case refines a story because both describe what
somebody does.

`satisfies` means the child is what ANSWERS the parent. Different kind of
thing. A function does not break a requirement into smaller requirements. It
is what the system does so the requirement holds.

Calling both `refines` hid that difference, and the difference is the whole
reason M4 can allocate functions to elements while requirements stay put.

WHY `satisfies` AND NOT `implements`. An implementation names a mechanism,
and a function is solution-neutral by construction. SysML uses «satisfy» for
exactly this relation, so the word already travels.

ONE LEVEL DOWN THE SAME ARGUMENT FLIPS (owner ruling 2026-08-10). An element
IS a mechanism, so what it does to a function is `implements`. An interface
implements a function too, where the function lives on the boundary itself.

## The design slice grew on 2026-08-10

Elements and interfaces stand one radius past the functions, both in the
design half.

- An element or an interface names the functions it realizes in
  `implements`.
- THE MATCH IS NOT ONE TO ONE. Several elements may implement one function
  — software tends to one-to-one, systems spread — and the spread is
  information the DSM shows, never a defect. What IS a defect is a function
  nothing implements, or an element implementing nothing.
- An interface also names the flows it transports in `carries`. That is how
  a contract stays answerable to the function layer.
- `source` and `destination` on an interface are STRUCTURE, not trace —
  like `source_refs`, they are not checked as edges here. The element DSM
  is their view.

THE TRACE IS COMPLETE, ON TWO PATHS (owner ruling 2026-08-10: a trace with
residue cannot show the changes). Most requirements reach the structure
TRANSITIVELY — served by functions, implemented by elements — and no
requirement id is written onto structure for that path. A requirement the
function chain cannot carry — a structural quality answered by the SHAPE,
an imposed constraint binding a choice — is named DIRECTLY by the element
or interface that answers it, in `satisfies`. The union is the law: every
requirement reached by one path or the other, zero unreached. Perturb any
node and the affected cone is in the graph, whole.

## Each edge's key is the frontmatter it lives under

A node writes its upward edge under the key its type declares. A requirement
writes `refines:`. A function writes `satisfies:`.

One key per type, so a reader of the file knows what the relation is without
looking anything up.

## Functions may point at functions

A sub-function satisfies its parent, and that is the only edge that stays
inside one type.

The function TREE is carried by the dotted id, not by this edge. `fn-a.b`
sits under `fn-a` because of its name. The `satisfies` edge is for the
requirement, and for the rare case where a sub-function serves a parent
function it does not sit beneath.

## The spine divides once, at its end

Every wedge of the drawing runs whole while the spine lasts. At the spine's
END it divides into slices, and each slice goes its own way outward.

Today there are two.

- `design` holds what ANSWERS a requirement. The functions now, and the
  architecture and design elements later.
- `test` holds what VERIFIES it: test definitions and test results. It is
  empty so far, and it still holds its arc.

THE DIVISION HAPPENS ONCE (owner design 2026-08-07). A requirement is the
last node every slice can see. It may be pointed at from several slices, and
that is the one place an item belongs to more than one.

PAST IT THERE IS NO CROSS-COUPLING. A function never points at a test
definition and a test result never points at a function. Each slice is its
own chain from the requirement outward.

WHY IT IS DECLARED HERE and not in the drawing code: which slice a type lives
in is the same kind of fact as what it may point at. A product that vendors
this and adds a third slice edits this file.

AN EMPTY SLICE STILL HOLDS ITS ARC. The space is reserved so the test levels
land without moving anything already drawn.

## What this schema does not cover

- `source_refs` is not a trace edge. It is provenance: norms, decisions,
  field evidence. Nothing checks its shape as an edge.
- The RAID register stands beside the trace, not in it. An entry points at
  what leans on it through `source_refs`.
- Downward edges do not exist. A parent never lists its children, because
  then two files would hold one fact.

## Sources

- v1's trace spine, at ref main: the child names its parents, in the child's
  own file.
- SysML relationship kinds: «satisfy», «refine», «derive», «trace», «verify»,
  «allocate». This schema uses the first two; allocation arrived 2026-08-10
  as the `implements` edge from elements and interfaces.
- INCOSE Systems Engineering Handbook, 4th edition: logical decomposition and
  allocation are separate acts, so they are separate edges.
