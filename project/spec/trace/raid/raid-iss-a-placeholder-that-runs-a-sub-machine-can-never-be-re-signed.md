---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed
type: "[[raid]]"
kind: issue
statement: "A state whose job is to run a sub-machine cannot be re-signed after a feeder re-signs above it, because se_reopen resolves its name to the sub-machine and the claim guard will not let the walk past until it is signed."
owner: the owner
trigger: any reopen upstream of run-spikes, build-steps, run-candidates, enumerate-space or run-demos
status: open
impact: "The walk pins permanently. Every remedy the engine offers was tried and none applies, so an iteration that reopens anything upstream of a sub-machine placeholder cannot reach its next gate."
breaks_how_badly: fatal
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
---

## What happens

MEASURED 2026-08-19 on i37, live.

The M6 spikes overturned the declared winner. `declare-winner` was reopened and
re-signed, which is the act both blessed gates had written a trigger for. The
chain beneath it was re-signed state by state: `record-adrs`,
`decompose-structure`, `evaluate-architecture`, `gate-architecture`,
`rank-unknowns`.

`run-spikes` IS NEXT AND CANNOT BE RE-SIGNED.

The walk pins at `iterations/i37/run-spikes/end` and every pull answers the
same refusal:

    SE-C-112 — run-spikes's claim to stand before it completes — it declares 0
    evidence field(s) / a "filled" completion with the claim neither signed nor
    standing — the walk has not moved

## Why no remedy applies

- `se_reopen {state: "run-spikes"}` REFUSES with SE-C-110: "a state of
  run-spikes with an evidence form". The name resolves to the SUB-MACHINE, so
  the parent placeholder is unaddressable.
- `se_reopen {state: "iterations/i37/run-spikes"}` refuses identically.
- RE-SIGNING ALL FIVE SUB-STATES does not help. Each reopened and re-signed
  cleanly; the parent claim still does not stand.
- THE REFUSAL'S OWN REMEDY DOES NOT HOLD. It says "pull — the machine serves
  the owed form". Pulling serves `do` at `run-spikes/end` and never the
  `run-spikes` form.
- ESCAPING TO THE DESK AND RE-ENTERING walks straight back to the same pin.
- AIMING AT ANY DOWNSTREAM TARGET draws a route and the walk does not move.
- A BARE `submit`, and a `choice` naming the next state, both change nothing.

## The code

`engine/session.ts`, `completeGuarded`. The guard is
`claimfulNow && !done.has(stateId)`. It first asks `claimBlockers` for
something nameable to report; when that returns nothing it throws the generic
refusal above.

SO THE WALK IS IN THE ONE BRANCH THE COMMENT CALLS "the fallback, when nothing
nameable holds the claim". The engine knows the claim is down, cannot say why,
and the verb that would clear it cannot address the state.

## Why it is graded fatal

IT IS NOT SPECIFIC TO run-spikes. Every placeholder that runs a sub-machine has
the same shape: `run-candidates`, `enumerate-space`, `build-steps`,
`run-demos`.

SO ANY ITERATION THAT REOPENS ANYTHING UPSTREAM OF A SUB-MACHINE PLACEHOLDER
CANNOT REACH ITS NEXT GATE. i37 reopened at M5 because its own prototype
milestone overturned a decision — which is exactly what M6 exists to do — and
the machine cannot express the consequence.

M7 AND M8 WOULD HIT IT AGAIN. `build-steps` and `run-demos` are the same shape,
so even a fix that unpinned this one walk would meet it twice more.

## The shape of a fix, not designed here

Either `se_reopen` resolves a placeholder ahead of the sub-machine that shares
its name, or a placeholder's claim follows its sub-machine's completion rather
than standing on a signature of its own.
