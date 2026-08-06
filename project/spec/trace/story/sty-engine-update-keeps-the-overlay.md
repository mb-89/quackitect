---
id: sty-engine-update-keeps-the-overlay
type: "[[story]]"
statement: When a new engine version arrives, I want my own method to survive it untouched, so vendoring never quietly turns into a fork.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
killer: false
---

## Deck

A vendored dependency that has been customised is a fork in waiting. The first upstream update is when you find out which one you have.
|||

---

The vehicle's own guidance, methods and rigor rows live in the vehicle's folder, above the engine's. Nothing of theirs was ever written underneath it.
|||

---

The new engine version drops in whole, replacing the old one. There is nothing to merge, because there is nothing of theirs in there to lose.
|||

---

The resolution chain runs again on the next pull. The vehicle's cards win where they exist; the engine's serve where they do not.
|||

---

The update was a replace, not a merge, and the vehicle's method came through unchanged.
|||
