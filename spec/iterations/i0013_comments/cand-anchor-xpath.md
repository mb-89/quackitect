---
id: cand-anchor-xpath
type: candidate
axis: anchoring
ratings:
  robustness-in-file: 0.6
  agent-readability: 0.3
  buildability: 0.6
statement: XPath/CSS node paths to the selected range endpoints.
class: review
killer: false
---
Pro: precise addressing without content duplication. Con: brittle against any structural nesting change; unreadable for the agent and the owner; no quote context for triage.
