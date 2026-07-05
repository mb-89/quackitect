---
id: cand-emit-two-stage
type: candidate
axis: emitter-pipeline
ratings:
  trust: 0.8
  zero-dep: 1
  authoring-cost: 0.7
  reversibility: 0.9
statement: Two stages - graph to markdown intermediates, then assemble to HTML.
class: review
killer: false
---
Pro: intermediates stay CommonMark (Obsidian/GitHub render them); SSG fallback stays open; the drafting step edits markdown, not HTML. Con: two representations to keep honest. (Backfilled from M3-candidates.md, axis 1.)
