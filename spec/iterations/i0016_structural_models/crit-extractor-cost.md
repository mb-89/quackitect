---
id: crit-extractor-cost
type: criterion
weight: 0.15
metric: extractor size and drift fragility (0-1, higher is cheaper)
target: one small hand-rolled parser per admitted format
statement: The axis weighs the cost of the zero-dep hand-rolled extractor and its fragility under format drift.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.15 - the zero-dep law and raid-extractor-fragility. Anchors - 1.0: flat nodes+edges JSON (JSON Canvas); 0.7: bindings JSON, probed live in i14 (Excalidraw); 0.5: line-grammar subset (Mermaid kinds); 0.1: full language grammar (KerML/SysML v2).
