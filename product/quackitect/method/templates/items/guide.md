---
template: item-guide
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# guide — one audience's how-to

Lives in `spec/guides/`. Demand-driven: a guide exists where an audience needs
one, never one per class by decree. ch8 renders one subchapter per guide; the
reader-matrix row links its audience's guide via the stakeholder `guide` field.
Guides are the how-to mode - fundamentals explain, spec chapters stay reference
(the Diataxis split). Id prefix `guide-`.

## Fields
- `type` (guide): fixed.
- `statement` (one sentence): who this guide serves and for what.
- `audience` (a stakeholder class slug): the served class.

## Body
The guide itself: task-first, imperative, one task per section.

```
---
id: guide-{{audience}}
type: guide
audience: {{class-slug}}
statement: {{who-and-what-for}}
---
{{the-guide}}
```
