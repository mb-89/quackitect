---
template: item-method
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# method — one engineering method, routed to its chapters

Lives in `spec/methods/`. Chapters render "methods that apply here" as a derived
view — no chapter hard-codes a method. Populate DEMAND-DRIVEN: write a method note
when a walk first routes to it, never the library upfront. The five-field schema
is Lindemann's (Methodische Entwicklung, digest). Id prefix `method-`.

## Fields
- `statement` (one sentence): the PURPOSE — what the method achieves.
- `applies_chapters` (list of chapter slugs, e.g. design-input): routing. Stable slugs, never numbers.
- `applies_type` (list of project types): lower bound; judgment reaches beyond it.
- `applies_rigor` (list of rigors): lower bound.
- `source` (a ref- note id): the literature the method cites (the pull law feeds ch2).
- `aliases` (list of phrases): names the auto-link pass resolves.

## Body
Four sections: Situation (when to reach for it) / Effect (what it buys) /
Procedure (the steps) / Tools (what supports it).

```
---
statement: {{purpose}}
applies_chapters: [{{chapter-slug}}]
applies_type: [default]
applies_rigor: [lean, systematic]
source: {{ref-id}}
aliases: [{{alias}}]
---
## Situation
{{when}}
## Effect
{{what-it-buys}}
## Procedure
{{steps}}
## Tools
{{tools}}
```
