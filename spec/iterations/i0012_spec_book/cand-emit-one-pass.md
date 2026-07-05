---
id: cand-emit-one-pass
type: candidate
axis: emitter-pipeline
ratings:
  trust: 0.8
  zero-dep: 1
  authoring-cost: 0.9
  reversibility: 0.4
statement: One pass, graph to HTML (the report.go pattern).
class: review
killer: false
---
Pro: one code path, in-house precedent. Con: no reusable intermediate; SSG optionality lost; prose units live only in HTML. (Backfilled from M3-candidates.md, axis 1.)
