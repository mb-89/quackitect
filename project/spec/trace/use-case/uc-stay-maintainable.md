---
id: uc-stay-maintainable
type: "[[use-case]]"
statement: Take engine updates under a private overlay
actor: stk-vehicle-owner
trigger: A new engine version is available.
precondition: The vehicle runs the engine with its own overlay layered on.
guarantee: The updated engine runs, and the overlay is unchanged, undisclosed and still in charge.
refines:
  - sty-maintainability
killer: false
---

## Main scenario

1. The owner pulls the new engine version into the vehicle.
2. The engine loads the overlay from the vehicle's own tree.
3. A pull runs the walk under the owner's guidance, unedited.
4. The owner checks both trees: engine writes landed only in engine-owned places, and overlay content stayed home.
5. A colleague clones the vehicle and runs it without the engine's working copy.

## Extensions

- 2a. The update changed a seam the overlay hangs on: the load names the broken seam instead of silently dropping the overlay.
- 3a. A state serves engine-default guidance where the overlay rules: the silent fallback counts as a defect, never as a working walk.
- 4a. A write aims across the tree boundary: the write is refused, never applied.
- 5a. The clone does not run without the engine's working copy: the vehicle is not self-contained; the missing piece is named.
