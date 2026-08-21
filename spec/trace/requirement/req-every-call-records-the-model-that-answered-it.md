---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-every-call-records-the-model-that-answered-it
type: "[[requirement]]"
statement: "When the lane records a call, the record shall carry the model that answered it, taken from what served the call rather than from what was requested, and marked as self-reported wherever the lane cannot obtain the value independently."
kind: functional
verify_method: test
breaks_if_removed: "Without it a walk that went badly and a walk that cost too much leave the same undifferentiated trail, and the rule that a weaker driver owes a recorded reason has nothing to check against."
breaks_how_badly: crippling
refines:
  - uc-attribute-a-finished-walk
source_refs:
  - "uc-attribute-a-finished-walk step 3"
  - "uc-attribute-a-finished-walk ext 3a"
  - "raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it"
  - "vp-the-ledger"
priority: must
---

## Detail

THE REQUESTED MODEL AND THE SERVED MODEL DIFFER IN PRACTICE, which is why the
observability conventions carry them as two separate attributes and use exactly
that divergence as their worked example.

THE MARK IS PART OF THE REQUIREMENT, not a caveat on it. The transport hands
the engine a client name and no model, so today the value can only come from
the caller. A field that reads like an observation and is a claim is worse than
an empty field, because nobody knows to doubt it.

WHAT WOULD LET THE MARK COME OFF: the value arriving from whatever performed the
spawn, which knows what it started and is not the party being measured.
