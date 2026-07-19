---
id: model-quack-structure
type: model
kind: structural
statement: How is quack structured overall? Which parts compose it, and which part is the software the onion details?
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: structural (the i27 kind walk, req-models-useful)
---
```mermaid
flowchart TD
  %% route: determinizer -> model-engine-layers
  quackitect["quackitect - the whole product"]
  launcher["launcher - quack.cmd plus the go-bin shim"]
  determinizer["determinizer - the Go engine binary; the onion details this"]
  enginesource["vendored engine source - the ratchet's origin"]
  methodlayer["method layer - the process resources"]
  prompts["prompts - contract, engage, compose"]
  rigor["rigor - vibe, lean, systematic"]
  modelkinds["models - the kind registry"]
  projecttypes["project types and stakeholder classes"]
  roles["roles - the implementation seam"]
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
  methodlayer -->|has| prompts
  methodlayer -->|has| rigor
  methodlayer -->|has| modelkinds
  methodlayer -->|has| projecttypes
  methodlayer -->|has| roles
  launcher -->|bootstraps| determinizer
  enginesource -->|ratchet builds| determinizer
  determinizer -->|resolves overlay| methodlayer
  determinizer -->|white-labels via| brandlayer
  determinizer -->|reads and writes| datahome
  mcpsurface -->|fronts| determinizer
```
## Rationale (not load-bearing)
The middle altitude of the reading path (req-structure-layers): the context model shows quack as a black box; this model opens it into its parts; the determinizer element opens into the onion. Authored at i0027 M4 for the owner's diagram review. The driven WORKSPACE stays outside: it belongs to the driven project, a neighbor's material, not a part of quack. model-product-tree is absorbed here (q-product-tree-absorb, ruling A): its method sub-parts ride under the method layer, and the shipped-product tree has one home.
