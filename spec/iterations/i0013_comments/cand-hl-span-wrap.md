---
id: cand-hl-span-wrap
type: candidate
axis: highlight-rendering
ratings:
  dom-static: 0.2
  reader-ux: 0.8
  buildability: 0.4
statement: Wrap selected ranges in mark/span elements (the classic annotator.js way).
class: review
killer: false
---
Pro: renders in every browser ever. Con: mutates the content DOM (req-comment-dom-static breaks); overlapping ranges need split-and-merge bookkeeping; save must unwrap to stay idempotent - the fiddly machinery vendored libraries exist for.
