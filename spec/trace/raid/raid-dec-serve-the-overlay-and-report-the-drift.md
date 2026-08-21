---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-serve-the-overlay-and-report-the-drift
type: "[[raid]]"
kind: decision
statement: The chain serves the overlay's card and REPORTS what an update moved, rather than falling back to the engine's card quietly.
owner: the driving agent
trigger: the first engine update that renames an identity a host overlay points at
status: open
breaks_how_badly: crippling
how_likely: expected
impact: "A silent fallback is the worst failure this mechanism can have: the builder's method stops applying and nothing says so, so they keep working under rules they think are theirs. The drift report is what makes an update survivable rather than merely quiet."
source_refs:
  - req-overlay-resolution
  - req-overlay-survives-update
  - req-overlay-drift-reported
  - uc-vendor-and-overlay extension 6a
---

## The conflict, already recorded

`req-overlay-resolution` carries `weighs_against: req-overlay-survives-update >`,
so serving the overlay's card already outranked surviving an update cleanly.

THE USE CASE STATES THE FAILING BEHAVIOUR IN ITS OWN EXTENSION 6a: "The new
version renamed something their overlay pointed at. The pull says what no longer
resolves, rather than silently serving the engine's default."

## Why quiet is the worst answer

THREE OUTCOMES ARE POSSIBLE when an update moves an identity an overlay claims.

- THE OVERLAY'S CARD IS SERVED and the drift is reported. The builder knows.
- THE ENGINE'S CARD IS SERVED and the drift is reported. The builder knows.
- THE ENGINE'S CARD IS SERVED AND NOTHING IS SAID. The builder does not know,
  and every walk after that runs on rules they did not choose.

ONLY THE THIRD IS UNACCEPTABLE, and it is the one a naive first-hit resolver
produces by default. A chain that finds nothing at the overlay layer and
continues down is exactly that behaviour unless something notices.

## What it binds

GOAL 4 CARRIES A REPORT RATHER THAN A FALLBACK. req-overlay-drift-reported is
not a nicety attached to the update story; it is what makes serving-the-overlay
safe to prefer.

## Rejected options

SILENT FALLBACK TO THE ENGINE'S CARD. The chain finds nothing at the overlay
layer and continues down without comment. REJECTED, and it is the default
behaviour of a naive first-hit resolver, which is why it needs rejecting
explicitly rather than merely not being chosen. The builder's method stops
applying and every walk afterwards runs on rules they did not pick.

REFUSE TO LOAD AT ALL when an overlay card names an identity that no longer
resolves. REJECTED because it makes an engine update able to stop a product
dead over one stale card. The blast radius is wrong: a drifted card is a local
problem and should not be a global halt.

PIN THE OVERLAY TO AN ENGINE VERSION, so drift cannot happen. REJECTED because
it is forking again by another name — the builder stops receiving upstream
improvements, which is the exact cost vp-the-engine exists to remove.

## Consequences

req-overlay-drift-reported BECOMES LOAD-BEARING rather than a nicety attached
to the update story. It is what makes preferring the overlay safe.

THE RESOLVER MUST KNOW WHAT AN OVERLAY CLAIMED, not only what resolved. A chain
that returns the first hit and forgets the misses cannot report drift, so the
report is a constraint on the resolver's shape rather than a feature bolted
beside it.

AN UPDATE'S STORY IS "REPLACE AND READ THE REPORT", never "replace and hope".
That is what a builder is told to expect.

AND uc-vendor-and-overlay's EXTENSION 6a IS NOW BINDING rather than
aspirational: the pull says what no longer resolves.
