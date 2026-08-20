---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: flow-vehicle-inventory
type: "[[flow]]"
statement: every path where a vehicle's content differs from the version it was built from, stated as what this vehicle changed rather than as a fault
kind: signal
source_refs:
  - req-overlay-drift-reported
  - opt-the-copys-changes-are-derived-on-every-update
  - uc-vendor-and-overlay
---

## It is not the divergence report, and the two were being confused

[[flow-divergence-report]] SAYS "where two method trees disagree" and comes out
of `hold-the-method`. That is resolution-time: an overlay entry naming an
identity the loaded version no longer provides.

THIS ONE COMPARES A VEHICLE AGAINST WHAT IT RECEIVED. Different act, different
moment, different inputs. `req-overlay-drift-reported` has three clauses and the
divergence report serves only the first; this flow serves the second and the
third.

AND THE CONFUSION WAS LIVE UNTIL 2026-08-18. "Where two method trees disagree"
is loose enough to look like both, so the requirement and the function were
talking past each other with nothing in between. `flow-divergence-report` also
carries an EMPTY `source_refs` — minted at i1, deriving from nothing.

## The framing is deliberate

WHAT DID YOU MAKE YOUR OWN, not how far have you wandered. A mechanism that
reports drift answers the second question, which reads as damage. This answers
the first, which reads as an inventory.

THE VEHICLE'S OWNER IS NOT DOING SOMETHING WRONG BY HAVING CHANGED THINGS. That
is the entire value proposition, and a report phrased as a fault would make the
product argue with its own promise.

## Why it is recomputed rather than maintained

IT IS AN OUTPUT, NOT AN INPUT. Nobody keeps a list truthful, because the list is
derived from the comparison each time, which is why it can never be false.

AND IT CARRIES NO REASONS, which is the cost of that. It can say a difference
exists and never that the vehicle's owner meant it, or why. The design that
attaches reasons lost this iteration by one cell, and nothing in the field does
both.

## What consumes it

[[fn-run-a-governed-walk.take-an-update]], because clause three of its
requirement says this report is what makes an update DECIDABLE — it is the only
thing that can say which of the vehicle's own changes an arriving update
touches.
