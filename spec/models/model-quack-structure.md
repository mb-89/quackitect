---
id: model-quack-structure
type: model
kind: element-tree
statement: How is quack structured overall - which parts compose it, and which part is the software the onion details?
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: element-tree until the structural kind lands at the build (owner ruling, req-models-useful)
---
```mermaid
flowchart TD
  quackitect["quackitect - the whole product"]
  launcher["launcher - quack.cmd plus the go-bin shim"]
  determinizer["determinizer - the Go engine binary; the onion details this"]
  enginesource["vendored engine source - the ratchet's origin"]
  methodlayer["method layer - prompts, templates, guides, schemas, model kinds"]
  brandlayer["brand layer - voice, palette, logos"]
  mcpsurface["mcp surface - supervisor plus child tool face"]
  datahome["data home - per-workspace state, notes, verdicts, research"]
  quackitect -->|has| launcher
  quackitect -->|has| determinizer
  quackitect -->|has| enginesource
  quackitect -->|has| methodlayer
  quackitect -->|has| brandlayer
  quackitect -->|has| mcpsurface
  quackitect -->|has| datahome
  launcher -->|bootstraps| determinizer
  enginesource -->|ratchet builds| determinizer
  determinizer -->|resolves overlay| methodlayer
  determinizer -->|white-labels via| brandlayer
  determinizer -->|reads and writes| datahome
  mcpsurface -->|fronts| determinizer
```
## Rationale (not load-bearing)
The middle altitude of the reading path (req-structure-layers): the context model shows quack as a black box; this model opens it into its parts; the determinizer element opens into the onion. Authored at i0027 M4 for the owner's diagram review. The driven WORKSPACE stays outside: it belongs to the driven project, a neighbor's material, not a part of quack. Overlap question for the owner: model-product-tree answers a part-of question this model may absorb.
