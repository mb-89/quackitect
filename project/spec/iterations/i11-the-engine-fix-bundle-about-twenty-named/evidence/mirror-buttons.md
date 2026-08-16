---
form: mirror-buttons
by: agent
signed_off: 2026-08-16T12:55:53.934Z
authors: agent
files:
---

# Evidence form / mirror-buttons

## current_situation

THE DIAL IS LIVE ON THE NEXT RELOAD, buttons and enforcement together.

WHAT THE OWNER CAN DO WITH IT NOW: watch every state (`state end`), work normally (`agent judgement`), run a supervised milestone (`bless`), or leave it unattended (`blockers only`).

WHAT IS NOT BUILT. The mirror does not yet show that a transition is being HELD — under `state end` the agent's refusal says so and the `go on` button is there, but the machine view draws no held marker. The control works without it; a reader watching only the graph would not see why nothing moves.

## built

THE STOP-AT DIAL, built to the owner's design of 2026-08-16 and recorded at raid-dec-stop-at-is-a-four-notch-dial-the-hook-enforces.

### Why it exists

THE STOP HOOK READS THE WALK'S POSITION AND CANNOT SEE THE REASON. A stop the contract REQUIRES looks exactly like an overcautious one. On 2026-08-16 the hook overrode a rule-9 stop five times — the agent had correctly refused to open a record unasked, said so, and was pushed past it anyway. The same day, the same hook was right about eight other stops.

A RULE THAT IS RIGHT EIGHT TIMES AND WRONG FIVE CANNOT BE TUNED INTO SEEING THE DIFFERENCE. The person can, so the notch is theirs.

### The four notches

`project/deliverable/machines/stopat.md` holds them, in the same grammar as the autonomy scale and equally editable. Editing that file moves the buttons on the next reload; nothing restates them in code.

- `state end` — every transition is blocked. The ENGINE refuses to change state and the person releases the next one.
- `agent judgement` — the default, and today's behaviour exactly.
- `bless` — no stopping until a bless is owed.
- `blockers only` — never stop unless the walk cannot go on.

CUMULATIVE, LIKE THE AUTONOMY RUNGS, and unlocked one press at a time. The owner's words: "state end is the least you do by yourself. Agent judgment is the default. Bless and blocker, you have to click and enable the same way you have to unlock autonomy buttons."

### The row

`machines/panels/controls.md` declares it directly under `autonomy`, as a `rungs` control with source `stopat`.

THE LABEL SITS IN FRONT, ONCE. The owner: "the stop at label that goes in the front like the autonomy label today. We don't have a stop at at every button because then the buttons get too big." That falls straight out of the panel spec's own rule — a named parameter starts a row and its name IS the row's label.

`renderRungs` READS ITS PARAMETER NOW. It ignored the source entirely and always drew the autonomy bank; an unknown source REFUSES rather than falling back, because a silent fallback would draw the autonomy dial under a `stop @` label — a control that lies about what it sets.

EVERY BUTTON CARRIES `data-bank`, so two banks can sit side by side and post to different routes. The emergency drumroll, the hidden slider and the hazard styling stay bound to the autonomy bank alone.

A SECOND ROW, `go on`, POSTS `/release`. The design needs it: under `state end` the engine holds, so something must let one transition through.

### The hold

`holdsTransition` sits at the front of `gatePriority`, and it is deliberately NOT an autonomy rule. Autonomy weighs how HEAVY a step is; this asks nothing about the step at all — under `state end` the agent hands back at every boundary whatever it weighs.

req-controls-never-advance-walk STANDS UNCHANGED. The press grants permission and never moves anything; the agent's pull is still the only thing that walks. One press is spent by one transition, which is what "one press, one state" means. THE PERSON IS NEVER HELD — the hold exists so a person can watch, and holding their own hand would be absurd.

THE NOTCH SURVIVES A RELOAD; THE RELEASE DOES NOT. Permission is for one transition, and carrying it across an engine swap would spend a press made for a state that no longer stands.

### The hook obeys it

`stop_at` rides EVERY pull, and it has to: the hook's only ground truth is the call log, so a setting the packet does not carry is a setting the hook cannot obey. It is read from the truncation-tolerant path too.

- `state end` — every stop passes. The engine is the one holding, so the agent handing back IS the machine's own stop.
- `agent judgement` — unchanged, and an ABSENT or unreadable notch reads as this. Never as a licence.
- `bless` — passes at a gate, blocks anywhere else.
- `blockers only` — passes only when the newest pull was REFUSED.

THE REFUSAL NAMES THE NOTCH THAT IS ASKING, rather than leaving the reader to infer it from a setting they may not have looked at. The bites-once valve still covers all four, so a genuinely blocking question can always end a turn.

### Green

87 of 87 across `params`, `mirror-contract`, `stophook`, `scale`, `narration`, `panel` and `boot` — run `test-msvt5476-17`. Four new hook cases, one per notch, plus the bank's own rendering.

FOUR OLDER CASES MOVED WITH IT, and each says why in place. Three assumed one rung bank; one assumed the whole bar goes dark at blocked, which is now false because the stop-at bank has no off — `state end` is its tightest setting, not an off switch.

## follow_up

NOTHING BLOCKS.

ONE THING WORTH THE OWNER'S EYE. `state end` means seventeen presses for a seventeen-state re-entry. That is the notch doing its job rather than a defect, and it is written into stopat.md as such — but it is the kind of thing that reads as broken the first time it happens.

NEXT: `promotions-are-own-record` and `pipe-refused`, the two remaining rulings from the observe-red decision, then `audit-the-twenty`.

## anything_else

