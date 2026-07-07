---
id: cand-anchor-unit-quote
type: candidate
axis: anchoring
ratings:
  robustness-in-file: 0.9
  agent-readability: 1
  buildability: 0.7
statement: Unit anchor id + quote and position selectors (W3C multi-selector, the Hypothesis lesson scoped to one file).
class: review
killer: false
---
Pro: unit ids are stable per render; the quote gives the agent human-readable context; position disambiguates repeats; premark targets fall out (a bare unit id). Con: more code than raw offsets.
