---
template: item-neighbour
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# neighbour — one external system or actor on the context boundary

Lives in `spec/trace/`. The ch3 context unit derives its figures from these
notes: the context star draws one border-connected node per neighbour, and the
neighbours view lists each with its interface line. Model the neighbour once
here; never hand-author it into prose. Id prefix `nbr-`; the star labels the
node with the id minus the prefix, so pick the id for reading.

## Fields
- `type` (neighbour): fixed.
- `statement` (one or two sentences): what crosses the boundary — the
  interface, seen from the system.
- `direction` (in | out): the flank the star draws it on.
  - `in` — the neighbour feeds or drives the system. Left side.
  - `out` — the neighbour consumes from the system. Right side.
  - Missing means `in`.

## Body
Anything the statement cannot hold: protocols, formats, failure behaviour.

```
---
id: nbr-{{slug}}
type: neighbour
direction: {{in|out}}
statement: {{what-crosses-the-boundary}}
class: review
killer: false
---
```
