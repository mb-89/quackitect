---
id: cand-store-island
type: candidate
axis: comment-storage
ratings:
  single-file: 1
  agent-readability: 1
  dom-static: 0.9
statement: One embedded JSON island (script type=application/json) in W3C Web Annotation vocabulary.
class: review
killer: false
---
Pro: one source of truth in the file; content DOM untouched; the agent reads the island, never the DOM; schema carries threads, marks, suggested edits, premark targets. Con: save must re-serialize the island block precisely.
