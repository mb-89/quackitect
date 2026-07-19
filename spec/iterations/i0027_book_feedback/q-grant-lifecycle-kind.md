---
id: q-grant-lifecycle-kind
type: question
state: decided
statement: model-grant-lifecycle (i22) still carries the deleted state kind. The b14 kind walk missed it. Delete, retype, or resurrect the kind?
class: review
killer: false
decided_via: owner ruling 2026-07-19, option A (the c16 models session) - deleted; git history serves any actual need
provenance:
  class: schema-default (review)
  decided_via: user-ruling via handoff
  killer: schema-default (false)
  state: user-ruling via handoff
---
## Options

- A) Delete the model. Its three-state insight lives on in the grant decision record. The siblings (model-check-states, model-register-ask-flow, model-reload-sequence) died the same death at b14.
- B) Retype it structural. Keeps the file, but a state machine is not a part-of tree - the kind would lie.
- C) Resurrect a state kind for it. Reverses the b14 owner ruling for one model.

## Rationale (not load-bearing)
Found by the i27 M7 consistency sweep after the model.json enum caught up with b14. The owner ruled A at the c16 session: the file is deleted, the dangling chosen edge healed, and the i22 comment carries the lifecycle contract inline.
