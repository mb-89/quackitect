---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: tsp-the-engine-keeps-no-record-of-what-it-produced
type: "[[test-spec]]"
statement: After an act produces a vehicle, nothing anywhere in the engine names that vehicle, records that it was made, or can be used to find it later.
method: inspection
verifies:
  - req-the-source-keeps-no-record-of-a-copy
files:
  - none — the attribute is an absence, and an absence is examined directly rather than exercised. The Checklist below is the whole definition.
---

## Scope

ONE ROW, AND IT IS A NEGATIVE. Everything else in this iteration says what the
system must DO; this one says what must not exist afterwards.

WHY INSPECTION RATHER THAN TEST. A test proves a behaviour by making it happen.
There is no behaviour here to make happen — the claim is that a set of things is
empty, and the cheapest method that would catch it failing is looking.
[[meth-test-design]] says every requirement gets the cheapest method that would
catch it failing, and for an absence that is inspection.

WHAT IS DELIBERATELY OUT. The direction of writes — that nothing a vehicle does
reaches its engine — which is [[tsp-product-scaffold]]'s. That row is about the
vehicle's behaviour; this one is about the engine's leftovers.

## Approach

THE DESIGN METHOD IS FAULT-BASED, working backwards from how a record gets kept
by accident rather than by design. Nobody sets out to build a registry. A record
appears because something logged, cached, counted or phoned home.

THE LEVEL IS COMPONENT, examined against the producing act's own outputs and the
engine tree beside it.

DEPTH IS ONE PASS PER PRODUCING ACT, and it is re-run whenever an act gains a
new output. The register grades this crippling, and the reason is on
vp-the-engine: this is the promise that made the audience vendor rather than
contribute, and it fails silently.

## Checklist

SIX ATTRIBUTES, each with what makes it pass. Every one is examined in the
ENGINE tree after a vehicle has been produced from it.

- NO REGISTRY FILE. Pass: no file created or modified by the producing act names
  the vehicle, its path, or its identity.
- NO ENTRY IN AN EXISTING FILE. Pass: no line added to any standing file —
  configuration, index, manifest — mentions the vehicle. This is the one that
  hides, because appending to something that already exists reads as normal.
- NO LOG LINE NAMING IT. Pass: the call log records that a producing act ran and
  does not record what it produced. The act is auditable; the artifact is not
  traceable from here.
- NO NETWORK CALL. Pass: the producing act reaches nothing outside the two trees
  it touches. No announcement, no telemetry, no registration.
- NO COUNTER. Pass: nothing increments. A count of vehicles made is a record of
  copies with the names filed off, and it still tells somebody how many exist.
- NO PATH BACK ON THE ARTIFACT. Pass: the produced vehicle contains no link,
  junction, mount or install step resolving into the engine tree. This one is
  examined on the vehicle rather than the engine, and it is here because it is
  the same promise seen from the other end.

## What the inspection cannot settle

WHAT THE PLATFORM DID. A filesystem, a shell history or an editor may record the
act whatever the engine does. The row binds what this system writes, and the
checklist is scoped to that.

AND WHETHER A LATER CHANGE REINTRODUCES ONE. An absence has no guard, which is
why this is re-run per producing act rather than signed once. That is the
weakness of inspection as a method, and naming it is cheaper than pretending a
test could do it.
