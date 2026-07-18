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
- `decided_via` (a letter or free text): carries the letter on a `proposed` OR a `decided` question. On `proposed` it is the agent's PROPOSAL, so a hand-off card reads "Bless selects A" and a bless finalizes it. On `decided` it is the recorded ruling. Required once `state: decided`. A lint finding only on an `open` question (nothing is proposed yet).

An open question that reaches a hand-off is unanswerable: the card reads "no ruling renderable yet". Before a hand-off, set `state: proposed` and `decided_via: <letter>` so the owner rules by accepting or rejecting the proposal.

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
