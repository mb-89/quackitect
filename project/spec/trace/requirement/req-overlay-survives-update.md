---
id: req-overlay-survives-update
type: "[[requirement]]"
statement: When the engine updates to a new version, the engine shall serve the walk under the vehicle's existing overlay with zero forced edits to overlay files.
kind: quality
verify_method: test
breaks_if_removed: Every engine update forces overlay rework, which is the fork cost the product exists to remove.
refines:
  - uc-quality-flexibility
source_refs:
  - uc-quality-flexibility step 3
  - uc-quality-flexibility ext 2a
  - uc-quality-flexibility ext 3a
  - stk-vehicle-owner
priority: should
weighs_against:
  - req-overlay-drift-reported >
---

## Scenario

- source: the vehicle owner taking an upstream update
- stimulus: a new engine version is pulled into the vehicle
- artifact: the overlay: the vehicle's guidance, methods and behaviour
- environment: a running vehicle project, overlay private, engine open
- response: the walk runs under the unedited overlay, and a broken seam is named at load rather than silently defaulted
- response measure: forced overlay edits per update = 0; silent fallbacks to engine defaults where the overlay rules = 0
