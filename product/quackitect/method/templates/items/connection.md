---
template: item-connection
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# connection — one prose-bearing relation between two items

The NOTE lane of `spec/connections/<kind>/` (adr-connection-lanes). Trivial
edges live as `edges.jsonl` lines instead; an edge lives in exactly ONE lane.
Deterministic id `con-<kind>--<src>--<dst>`; symmetric kinds order src/dst
lexicographically. Mint with `quack mint connection`, never by hand.

## Fields
- `type` (connection): fixed.
- `kind` (a declared connection kind): the relation type; the type layer's
  vocabulary declares direction and default lane per kind.
- `src` (node or item id): the edge source (first endpoint for symmetric kinds).
- `dst` (node or item id): the edge target.
- `q` (short slug, optional): the qualifier for a second edge on the same triple.
- `statement` (one sentence): the relation, readable ("A conflicts with B over X").

## Body
The prose that made this edge worth a note: the tension, the interface contract,
the reasoning. A substantial cross-cutting why still graduates to a rationale.

```
---
id: con-{{kind}}--{{src}}--{{dst}}
type: connection
kind: {{kind}}
src: {{src}}
dst: {{dst}}
statement: {{readable-relation}}
---
{{prose}}
```

## Mint skeleton
`quack mint` seeds these fields from this fence, verbatim. The engine owns every other key.

```skeleton
kind: TODO
src: TODO
dst: TODO
```
