---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: fn-run-a-governed-walk.report-what-the-vehicle-changed
type: "[[function]]"
cluster: the-bootstrap
statement: state every path where a vehicle's content differs from the version it was built from, as what this vehicle made its own rather than as a fault
satisfies:
  - req-overlay-drift-reported
inputs:
  - flow-method-sources
  - flow-repository
outputs:
  - flow-vehicle-inventory
controls:
  - the version the comparison is made against
  - the framing, which states what was made own and never what has wandered
source_refs:
  - uc-vendor-and-overlay
  - opt-the-copys-changes-are-derived-on-every-update
  - raid-dec-serve-the-overlay-and-report-the-drift
  - note-5a4745132c01
---

## Rationale

A VEHICLE'S OWNER HAS TO BE ABLE TO ASK WHAT THEY MADE THEIR OWN. Without that
answer they cannot hand the vehicle on, cannot judge an arriving update, and
cannot tell their own work from what they received.

NOTHING ELSE PRODUCES IT. The nearest thing is a report of where two method
trees disagree at load time, which is a different comparison at a different
moment and cannot see what a vehicle changed relative to what it received.

AND IT IS THE INPUT THAT MAKES AN UPDATE DECIDABLE, which is why it stands apart
from the act that takes one. It answers a question worth asking on its own, and
it answers a question another function cannot proceed without.

## Why it is separate from hold-the-method

`req-overlay-drift-reported` HAS THREE CLAUSES AND THEY ARE TWO ACTS.

- CLAUSE ONE is resolution-time: an overlay entry naming an identity the loaded
  version no longer provides is reported as unresolved rather than silently
  defaulted. That is `hold-the-method`'s, and `flow-divergence-report` carries
  it.
- CLAUSES TWO AND THREE ARE THIS FUNCTION'S. What the vehicle changed relative
  to what it received, and that same report making an arriving update decidable.

THEY WERE BEING CONFUSED AND NOTHING NOTICED. "Where two method trees disagree"
is loose enough to read as either, so the requirement and the function talked
past each other while clauses two and three had no home at all.
`flow-divergence-report` also carries an EMPTY `source_refs` — minted at i1,
deriving from nothing.

## Why the framing is a control rather than prose

WHAT DID YOU MAKE YOUR OWN, never how far have you wandered. The second question
reads as damage, and a vehicle's owner changing things is the entire value
proposition rather than a defect.

A REPORT PHRASED AS A FAULT WOULD MAKE THE PRODUCT ARGUE WITH ITS OWN PROMISE,
which is why the framing is listed as a control on this function and not left to
whoever writes the output.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Three, and they differ in
what the report can say.

- DERIVED FROM A COMPARISON each time, which can never be false and can never
  say why.
- A DECLARED LIST the vehicle's owner maintains, which carries reasons and can
  silently stop being true.
- A DIRECTORY LISTING, where the vehicle's own content sits in its own folder
  and asking what changed is asking what is in it.

NOTHING IN THE FIELD DOES BOTH HALVES. The survey of roughly a hundred products
found derived reports with no meaning and declared ones needing a person to keep
them honest, and that gap is what `req-overlay-drift-reported` is actually
asking somebody to close.

## What it costs to run

A COMPARISON AGAINST THE VERSION THE VEHICLE WAS BUILT FROM, which means that
version has to be reachable. Under the winning design the vehicle is a clone
that keeps its history, so the base is local and the comparison is cheap.

UNDER A VEHICLE THAT SHARED NO COMMIT WITH ITS ENGINE this function could not
run at all, which is one more reason the incumbent could not reach step 6 of the
use case.
