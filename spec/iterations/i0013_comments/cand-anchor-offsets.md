---
id: cand-anchor-offsets
type: candidate
axis: anchoring
ratings:
  robustness-in-file: 0.3
  agent-readability: 0.2
  buildability: 1
statement: Global character offsets into the document text.
class: review
killer: false
---
Pro: trivial to implement. Con: any whitespace difference shifts every anchor; the agent sees numbers, not context; premark impossible without a selection.
