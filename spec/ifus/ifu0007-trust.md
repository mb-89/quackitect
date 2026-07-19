---
id: ifu0007-trust
type: manifest
mode: deck
kind: ifu
statement: trust - how the record stays honest.
review-82079:
  completeness: guards, models, connections, pruning, and the battery each have a step slide; the coverage slide links every use case this journey exercises
  correctness: each mechanism is described as the engine enforces it, hash semantics included
  conciseness: one trust mechanism per slide; the enforcement detail lives in the design chapters
  comprehensibility: the arc runs from "why believe any of this" to the mechanisms that answer it
  minimalism: the base state is referenced from the setup IFU; each guard appears exactly once
  accessibility: rides the book shell's slide roles and labels; the guard figure carries its aria label
  target-group-fit: written for the skeptic auditing the record, the owner three months later included
---
<!-- ai:3 -->
# Why believe a record an agent wrote
<!-- ai:3 -->
A ledger is only worth its enforcement. If anything could be stamped green without evidence, the whole record is decoration. These are the mechanisms that keep it honest.
---
<!-- ai:3 -->
# Starting state
<!-- ai:3 -->
The idle state from [the setup IFU](ifu0001-setup). Trust mechanisms are always on; this journey just makes them visible.
---
<!-- ai:3 -->
# Guards at the point of writing
<!-- ai:3 -->
Field schemas type every register row. Authoring guards refuse malformed content at the door. EARS lint shapes requirements while they are written, not after.
---
<!-- ai:3 -->
# Models that must conform
<!-- ai:3 -->
A declared model is checked against the code it claims to describe, and structure can be DERIVED from the graph instead of asserted. A diagram that cannot drift is a diagram you can cite.
---
<!-- ai:3 -->
# Edges, pruning, and honest change
<!-- ai:3 -->
Connections are first-class edges; a changed input turns its dependents SUSPECT, never silently stale. Pruning retires what no longer earns its place, with its reason recorded.
---
<!-- ai:3 -->
# The battery seals it
<!-- ai:3 -->
Every mechanism is itself test-first: the selftest battery runs the whole engine against its own spec, and a verification gate rides on the battery's verdict. The workshop stays smooth because the machine sweats the checks.
---
<!-- ai:3 -->
# Honesty as a property, not a promise
<!-- ai:3 -->
No single mechanism carries the trust. The stack does: typed writes, conforming models, suspect propagation, recorded pruning, and a battery over all of it.
---
<!-- ai:3 -->
# Covered use cases
<!-- ai:3 -->
The trust journey exercises:
[uc-authoring-guard](uc-authoring-guard), [uc-battery-trust](uc-battery-trust), [uc-connections](uc-connections), [uc-declare-models](uc-declare-models), [uc-derive-structure](uc-derive-structure), [uc-engine-mediated-io](uc-engine-mediated-io), [uc-field-schemas](uc-field-schemas), [uc-model-conformance](uc-model-conformance), [uc-prune](uc-prune), [uc-workshop-smooth](uc-workshop-smooth).
Note: The coverage slide is the machine-readable reference home. Story slides stay clean.
