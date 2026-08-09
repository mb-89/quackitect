---
id: req-overlay-survives-update
type: "[[requirement]]"
statement: When the engine updates to a new version, the engine shall serve the walk under the vehicle's existing overlay with zero forced edits to overlay files.
kind: quality
verify_method: test
breaks_if_removed: Every engine update forces overlay rework, which is the fork cost the product exists to remove.
breaks_how_badly: fatal
refines:
  - uc-stay-maintainable
source_refs:
  - uc-stay-maintainable step 3
  - uc-stay-maintainable ext 2a
  - uc-stay-maintainable ext 3a
  - stk-vehicle-owner
priority: should
---

## Scenario

- source: the vehicle owner taking an upstream update
- stimulus: a new engine version is pulled into the vehicle
- artifact: the overlay: the vehicle's guidance, methods and behaviour
- environment: a running vehicle project, overlay private, engine open
- response: the walk runs under the unedited overlay, and a broken seam is named at load rather than silently defaulted
- response measure: forced overlay edits per update = 0; silent fallbacks to engine defaults where the overlay rules = 0
