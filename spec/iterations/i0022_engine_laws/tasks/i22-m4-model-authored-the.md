---
id: i22-m4-model-authored-the
statement: **model authored — the DIAGRAM is the architecture deliverable** : every chosen view exists as a model node with its ELEMENTS ALLOCATED (the blocks the build will fill, allocated ahead of any code — the conformance lint tolerates unrealized elements), the structure drawn, each element's INPUTS and OUTPUTS wired (the developer fills a block by its contract, not by re-deciding architecture), each element carrying a one-line PLACEMENT RATIONALE (why the architecture put it WHERE it is in this view — the onion's band, a tree's parent, a state group; placement is a judgment call, general to every model kind, not onion-specific), and each architecture ADR marked `kind: architecture` and linked to the element(s) it shapes (informed-by). The M4 gate is a DIAGRAM REVIEW — the architect (owner) reviews and approves the decomposition here; the M4 gate cannot bless without it. M6 then ADHERES to this model; the build never invents an element the diagram did not sanction (sky-fall lint).
milestone: M4
class: review
killer: true
depends_on: [i22-m3-gate]
---
