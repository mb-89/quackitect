---
template: item-candidate
artifact: node
applies_rigor: [systematic]
applies_type: [default]
---
# candidate — one option on one decision axis

Born at M3, lives in its birth iteration. DECISIONS choose or reject candidates
through links — status derives from the links, never stored here. Rejected
candidates stay: the deciding record references them, history survives. The
candidates-x-criteria matrix renders derived (fig: candidates-matrix) — it replaces
hand-written Pugh tables in the book AND the milestone evidence. Id prefix `cand-`.

## Fields
- `type` (candidate): fixed.
- `axis` (a short slug): the decision axis this candidate answers.
- `ratings` (one-level map, criterion: 0..1): the scored criteria. Criteria derive
  from weighted requirements — no separate criterion type.
- `statement` (one sentence): the option, named plainly.

## Body
Description, pros, cons. The judgment (weights, sensitivity, the verdict) lives in
the deciding record, not here — anti-bias: weights are fixed before options are scored.

```
---
id: cand-{{slug}}
type: candidate
axis: {{axis-slug}}
ratings:
  {{criterion}}: {{0..1}}
statement: {{the-option}}
class: review
killer: false
---
{{description, pros, cons}}
```
