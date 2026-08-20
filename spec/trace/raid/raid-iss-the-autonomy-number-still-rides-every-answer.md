---
minted_in: i27
id: raid-iss-the-autonomy-number-still-rides-every-answer
type: "[[raid]]"
kind: issue
statement: The lane's own answers still carry a numeric autonomy value, so tsp-autonomy-tiers cannot be observed green. Every se_pull result of 2026-08-14 carried an autonomy number beside the categorical tier.
owner: the maintainer
trigger: the next sweep for numeric autonomy, or any iteration that touches the packet's header
status: open
breaks_how_badly: abrasive
how_likely: expected
impact: A test-spec that cannot be observed green blocks verification for every iteration that inherits it, and the box gets ticked anyway or marked owed forever. Neither is the answer the spec asked for.
---

## What was observed

`tsp-autonomy-tiers` says no numeric autonomy value and no slider survives on
any surface, state note or guidance page once the categorical tiers land.

Every `se_pull` answer in this session carried both:

    "autonomy": 1,
    "tier": "ideation",

The tier is the categorical answer the requirement asked for. The number beside
it is what the requirement says should be gone.

`se_aim` and `se_survey` answers carry the same pair, and the route's steps each
carry a numeric `priority`.

## Why it is an issue rather than a risk

It is not a thing that might happen. It is happening, in the answer of the verb
the agent calls most.

## What it is NOT

NOT A CLAIM THAT THE TIERS FAILED. The categorical tier is present and correct
everywhere the number appears. This is the number's survival, not the tier's
absence.

NOT A SURFACE-ONLY QUESTION. `note-6446d1e9ac8d` records the owner's position
that the numbers are still shown deliberately, and that the ACCEPTANCE
CRITERION is the thing to look at. That note is the reason this entry exists as
an issue rather than a defect to fix silently.

## What closes it

One of two things, and they are not the same:

- The number leaves the answer, and the spec is observed green as written.
- The spec is rewritten to say what is actually wanted — that the tier is the
  vocabulary a PERSON sees, while a number may remain in the machine's own
  payload — and the new wording is observed instead.

THE SECOND IS THE OWNER'S CALL, not the verifier's. A verifier who rewrites the
criterion to match what was built has verified nothing.

## Corrected 2026-08-14, at gate-validation

"The categorical tier is present and correct everywhere the number appears"
was NOT true when this entry was written. Two answers carried a bare number
with no tier at all:

- the route answer in `engine/session.ts`, beside `judgments`
- `describe()`, the tick's own answer

A bare number is precisely what [[req-autonomy-is-categorical]] forbids, so
those two were a live violation rather than a transitional carrier. Both now
carry the tier word beside the number.

WHAT REMAINS IS THE REMOVAL, and it is deliberately not in this iteration.
[[raid-risk-autonomy-rework-breaks-walking]] says cut over first and remove
after, never both in one commit. The cut-over is now complete: every answer
carrying the number carries the word. The removal is the next record's work,
and which of the two closings above applies is still the owner's call.
