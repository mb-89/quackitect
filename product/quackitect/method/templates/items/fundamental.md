---
template: item-fundamental
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# fundamental — one flow-breaking explanation, parked

Lives in `spec/fundamentals/`. When a chapter needs an explanation that breaks the
reading flow, the explanation becomes a fundamental: the text links it and keeps
flowing; the fundamentals chapter lists the one-liner; the full body renders one
link away. Id prefix `fund-`.

**A fundamental is BOOK KNOWLEDGE the reader needs, never our reasoning (owner law).**
It is externally established domain material a reader must have to understand the
product, the requirements, or the use cases - control theory for a control loop,
EARS shapes for requirement statements. It decides nothing and takes no position.
Our own philosophy, project-specific reasoning, and any "why we work this way"
belong in a RATIONALE (`why-`, the item-rationale template), never here.

## Fields
- `statement` (one sentence): the one-liner the fundamentals chapter lists.
- `aliases` (list of phrases): names the auto-link pass resolves.

## Body
The full explanation. Figures encouraged — text-based, always.

```
---
statement: {{one-liner}}
aliases: [{{alias}}]
---
{{explanation}}
```
