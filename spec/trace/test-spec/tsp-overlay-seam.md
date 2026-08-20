---
minted_in: i1
id: tsp-overlay-seam
type: "[[test-spec]]"
statement: The vendored engine and a builder overlay never mix trees, drift is reported by identity, and a walk-governing edit lands where it compiles, verified by test over the overlay seam.
method: test
verifies:
  - req-overlay-resolution
  - req-overlay-survives-update
  - req-overlay-drift-reported
  - req-guidance-edit-lands-where-it-compiles
files:
  - tests/editsafety.test.ts
  - tests/drift.test.ts
  - tests/overlay.test.ts
---

## Scope

The seam between the shipped engine and a hosting product's overlay:
card resolution, survival across engine updates, drift reporting, and
the routing law for walk-governing writes.

## Approach

Component level. THREE of the four claims are DEFINED ahead of their
cases — the overlay mechanism is not built; tests/overlay.test.ts is the
planned home and lands with the overlay build. The fourth claim's
compile-live half runs today (a state note edited on disk binds the next
call; a row edited now reaches the walk's machine); its write-routing
half is the SE-C-134 guard, and its case is planned in the same file.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps today: the drawing is data: a state note
edited on disk binds the next call, no reload; a row edited now reaches
the walk's machine with no pull at all. The planned steps assert: an
overlay card served at every resolution point; an engine update forcing
zero overlay edits; every diverged identity and path reported instead of
a default served.
