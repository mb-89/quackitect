---
template: item-question
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# question — one open unknown, riding the trace

Lives in the iteration that surfaced it. An open unknown the owner must rule on
is a first-class trace node, never buried prose (adr-question-nodes-provenance):
it links to what it blocks through the ordinary edge lanes, and deciding it
ripples its dependents like any content edit. The ledger records WHAT was
decided and via what; it never simulates the deciding. Id prefix `q-`.

## Fields
- `type` (question): fixed.
- `statement` (one sentence): the question itself — a question, not a shall-statement (EARS never applies).
- `state` (open | proposed | decided): the decision state; anything else is a lint finding.
- `decided_via` (free text): how the ruling happened (owner ruling, expedition finding, measurement). Required once `state: decided`; a lint finding on an undecided question.

## Body
The candidates considered and what the answer unblocks. On decision, the ruling's
one-line summary.

```
---
id: q-{{slug}}
type: question
state: open
statement: {{the-question}}
---
{{candidates-and-stakes}}
```

## Mint skeleton
`quack mint` seeds these fields from this fence, verbatim. The engine owns every other key.

```skeleton
state: open
```
