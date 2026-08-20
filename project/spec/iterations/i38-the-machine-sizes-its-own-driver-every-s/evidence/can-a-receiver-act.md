---
form: can-a-receiver-act
by: agent
signed_off: 2026-08-20T18:03:39.215Z
authors: agent
files:
---

# Evidence form / can-a-receiver-act

## current_situation

Three spikes ran, all three returned a verdict, and none ran out of its timebox.

### The results

- `exp-can-anything-act-on-a-published-driver` — FALLS. No path exists today by which a value the lane publishes changes which model is running.
- `exp-what-the-lane-can-learn-about-the-answering-model` — HOLDS. The transport carries a client name and no model, so the self-reported mark is permanent rather than a caveat awaiting an implementation.
- `exp-two-hands-rating-the-same-six-cells` — HOLDS. Two independent readers landed on the same rung for five of six cells, quoting the same sentences.

### The first two met at one missing thing, and neither spike was looking for it

SPIKE 1 ASKED whether anything can act on a published driver. `se-start.ts` spawns the agent once, before any walk exists, with the model not a parameter of the call; `se-pty.ts` spawns a command handed to it. Nothing in the walk re-invokes either.

SPIKE 2 ASKED what the lane can learn about the answering model. `engine/mcp.ts` carries `clientInfo: { name, version }` and no model on both the transport metadata and the request context.

WHAT WOULD FIX EITHER IS THE SAME PARTY. A thing that spawns on a published value would both unlock the payoff and be able to report what it started — the requirement's own Detail names that as the condition for the mark coming off.

AND IT IS NOT A MISSING MECHANISM. `se-pty.ts` already spawns a command and already holds a live read-write channel back. WHAT IS MISSING IS A DECISION ABOUT WHO MAY CAUSE A SPAWN on a computed value. `req-the-machine-names-a-driver-and-starts-nothing` says correctly that the lane may not, and nothing anywhere says who may.

### The first spike could not do the job it was seeded for, and says so

IT WAS SEEDED TO SETTLE THE OWNER'S RULING AS A SIDE EFFECT: if nothing can act on a model name either, the roster is a file maintained for nobody, and publishing a class is the honest answer.

THE TIEBREAK HOLDS AND IT HOLDS FOR THE WRONG REASON. Both halves fail at the same place, because nothing can be acted on at all. That is an argument against the payoff rather than for either design, and it leaves the ruling exactly where it was.

### The third found a class it was not looking for

IT WAS SEEDED TO PROBE DRIFT — a hand-typed number going stale while the work under it changes. IT MEASURED AGREEMENT INSTEAD, because two readers in one session cannot measure drift, and the node says so rather than claiming otherwise. The risk is narrowed and stays open.

WHAT IT FOUND is that the one disagreement was not noise. Both readers named the same row as their least-sure, unprompted, for the same reason: `M7_40 build-steps` is a placeholder that a seeded sub-machine fills, so the row has no single difficulty to declare.

THAT MAKES IT A RATING THAT WILL BE WRONG FOR ONE OF TWO CAREFUL READERS however carefully it is typed, and this record has already walked three such rows — `M4_25 run-candidates`, `M6_15 run-spikes` and this one.

## built

- [[exp-can-anything-act-on-a-published-driver]]
- [[exp-what-the-lane-can-learn-about-the-answering-model]]
- [[exp-two-hands-rating-the-same-six-cells]]

## follow_up

ONE PROMOTION COMES OUT OF THESE THREE and it is small, mechanical and not yet built: THE LOADER SHOULD REFUSE A COMPLEXITY ON A PLACEHOLDER ROW, or the rating should attach to the states the sub-machine seeds, where the work actually is. Three such rows already exist and each would otherwise carry a figure two careful readers disagree about.

TWO REGISTER ENTRIES ARE NARROWED AND NEITHER CLOSES. `raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all` is confirmed rather than settled — the dependency is real and its cause is now named as a missing party rather than a missing mechanism. `raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so` is narrowed to rows that are one act, and drift over time is untested.

AND ONE THING GATE-PROTOTYPE SHOULD BE MADE TO SAY OUT LOUD. This iteration is about to bless a machine that names a driver correctly, publishes it honestly, and hands it to nobody. That is not a defect in the design — it is what `req-the-machine-names-a-driver-and-starts-nothing` demands and what the seed already assumed. IT IS STILL THE SHAPE OF WHAT SHIPS, and a gate that does not say so is letting a reader assume otherwise.

WHAT NO SPIKE COVERED, repeated here because it is the assumption under everything: nothing tested whether a stronger hand does better work on a harder step. Probe 3 tried at M4 and could not. Every candidate on the chart leans on it and this iteration ships without it.

## anything_else

