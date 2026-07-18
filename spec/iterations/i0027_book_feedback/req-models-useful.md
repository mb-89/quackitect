---
id: req-models-useful
type: requirement
depends_on: []
statement: The design chapter shall render each model only after an owner review confirms it answers its declared question; the rest are reworked or dropped.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The kind walk (owner rulings, 2026-07-17)

| Kind | Ruling | Consequence |
|---|---|---|
| context | KEEP | good as-is; the catalog ([req-model-kinds-catalog](req-model-kinds-catalog.md)) finally renders it in 10.6 |
| element-tree | RENAME to `structural` | a GENERIC structural kind, nothing quack-specific - an assembly is another instance (owner ruling 2026-07-18). Quack is modeled as one instance ([req-structure-layers](req-structure-layers.md)); model-product-tree is ABSORBED into it (q-product-tree-absorb, ruling A). Remaining instances follow: model-agent-lanes, model-module-architecture, model-guard-tree |
| sequence | DROP for now | template deleted; instances model-register-ask-flow and model-reload-sequence dropped; sequence models return when needed |
| state | DROP for now | template deleted; instance model-check-states dropped |
| (new) `onion` | CREATE | model-engine-layers IS the onion's source model, badly named and typed `guide` with no kind. It becomes the onion kind's first instance. The template is written so other projects reuse onions |
| (new) `structural` | CREATE with the model | the layer between context and onion |

**The principle (owner):** no placeholders for unused model kinds. Like rationales and fundamentals, a model is created when needed.

**Execution timing:** these renames and drops land as a BUILD step, not mid-elicitation. The engine's model-kind selftests couple to the registry (kind scans, kind-example figures); the same walk that moves the files amends those tests under the red ritual. Dropped models take their dangling edges with them (adr-i24-views to model-reload-sequence, adr-register-watch-answers to model-register-ask-flow).

## Rationale (not load-bearing)
Each rendered model must answer its declared question for the owner. The walk above is that review's outcome for the kind layer; the per-instance content review of the surviving structural models happens at the M4 diagram session.
