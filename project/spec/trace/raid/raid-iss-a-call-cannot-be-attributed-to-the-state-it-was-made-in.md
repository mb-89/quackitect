---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in
type: "[[raid]]"
kind: issue
statement: "Stamping the answering model onto every call buys attribution only if the call can also be tied to a state, and it cannot — the call log has no state coordinate and every record falls into one bucket."
owner: the walking agent
trigger: "the design state that specifies what the model stamp is FOR, and the first attempt to answer which state a walk overspent on"
status: open
impact: "The stated value of the model stamp — a walk can be attributed after the fact — is half delivered. Knowing that a model answered 200 calls says nothing about which of 53 states it walked, so the reconciliation the whole ladder would need cannot be computed even once the stamp lands."
breaks_how_badly: crippling
how_likely: expected
probe: "MEASURED LIVE AT i38's define-actual, 2026-08-20. se_log_query {group_by: \"visit\"} returns {\"(none)\": 190} and {group_by: \"state\"} returns {\"(none)\": 191} — every record in one bucket, no exceptions. By contrast {group_by: \"actor\"} separates cleanly into ui, agent and human, so the grouping mechanism works and the coordinate is simply absent. The retro method already carries the same finding from 2026-08-17, in its own words: per-step cost is not computable today, and the state a call was made in rides inside a narration record's arguments where group_by does not reach it."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it
weighs_against: none
---

## Attribution needs two coordinates and the record carries neither

WHO ANSWERED is what this iteration adds. It is not on the record today.

WHERE THE CALL WAS MADE is the other half, and it is not on the record either.
It exists — a narration record's arguments carry the state — but it is buried
inside an argument blob rather than standing as a field, so nothing can group
by it.

EITHER ONE ALONE ANSWERS NOTHING USEFUL. "Opus answered 190 calls" and "190
calls happened somewhere" are the same non-answer from two directions.

## Why this is i38's business rather than somebody else's

THE ITERATION'S FOURTH GOAL STATES THE PURPOSE OUT LOUD: stamp the answering
model so a walk can be attributed after the fact. Attribution is the value, and
the stamp is only one of the two things it needs.

AND THE LADDER NEEDS IT MORE THAN THE GOAL DOES. Every proposal for ever
learning that a rung was wrong — comparing a declared rung against what the
work turned out to need — is a per-state comparison. Without a state coordinate
there is nothing to join the two halves on.

SO SHIPPING THE STAMP ALONE WOULD LOOK LIKE PROGRESS AND MOVE NOTHING. That is
the reading this entry exists to prevent.

## What would close it

- A STATE FIELD ON THE CALL RECORD, beside the actor and the model. The value
  is already known where the call is served, which is the same place the actor
  is stamped and for the same reason.
- THEN group_by REACHES IT, and the retro's per-step cost column stops being a
  documented impossibility.

THE TWO ARE ONE CHANGE. The record grows two fields or it grows neither, and
doing half of it is the failure mode above.
