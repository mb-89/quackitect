---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed
type: "[[raid]]"
kind: issue
statement: "A reopened placeholder could not be re-signed — the walk popped past it and no verb could serve its form — and the refusal that showed it named the wrong remedy, pointing at se_pull instead of at se_reopen's machine argument. The walk defect is fixed; the remedy-naming one is not."
owner: the owner
trigger: any reopen upstream of run-spikes, build-steps, run-candidates, enumerate-space or run-demos
status: mitigated
impact: "The walk appears permanently pinned to an agent following the refusals. This one cost a full unattended run: the agent tried six remedies, reported a fatal blocker, and stopped one state short of a gate."
breaks_how_badly: corrosive
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

## CORRECTED 2026-08-19 — there was a remedy and this record was wrong

THE OWNER SAID SO PLAINLY: an engine defect is a thing to fix, not a wall to
stop at. Going to look was the right move and it took one grep.

`se_reopen` TAKES A `machine` ARGUMENT. Its own tool description says so:
"which machine the state belongs to — needed from outside it, e.g. i1".

    se_reopen {state: "run-spikes", machine: "i37", reason: "..."}

REOPENED IMMEDIATELY. The walk was never pinned.

## What the real defect is, and it is much smaller

THE REFUSAL NAMES THE WRONG REMEDY. `stateFormState` in
`engine/sessionclaims.ts` throws:

    expected: a state of run-spikes with an evidence form
    remedy:   se_pull — "the walk's own states carry the forms"

BOTH LINES POINT AWAY FROM THE FIX. The `expected` says the name is not a state
of this machine, which is true and useless — the caller meant the state one
frame OUT. The `remedy` says to pull, and pulling never serves that form.

THE ARGUMENT THAT WOULD HAVE FIXED IT IS NOT MENTIONED. It exists, it is
documented on the tool, and the refusal does not name it.

## Against the standing law

`refusals.md` opens with it: ANYTHING THAT BLOCKS OWES A REMEDY, NOT ONLY A
TYPED REFUSAL. And: "THE TEST OF A REMEDY: could somebody act on it without
asking a second question? If not, it is a diagnosis rather than a remedy."

THIS REMEDY FAILED THAT TEST and the cost is measured: six attempted remedies,
a wrongly-graded fatal register entry, a field report built around a blocker
that was not one, and a stopped run.

## The fix

When the named state is not in the current machine, look outward through the
frame stack. If a machine there declares it, name that machine in the remedy:

    se_reopen {state: "<name>", machine: "<that machine's id>"}

The engine already knows the answer — `subs` and `machine` are both on the
claims host. It just does not say it.

## Why the grade dropped from fatal to corrosive

NOTHING IS UNREACHABLE. The walk was never actually stuck, so no iteration is
blocked and no data is at risk. What it destroys is an agent's afternoon, and
it does it silently, which is exactly the shape this iteration exists to
measure.

## CORRECTED AGAIN 2026-08-20 — there were TWO defects, and the second one was real

THE SECTION ABOVE IS HALF RIGHT. `machine: "i37"` does reopen the placeholder,
so the FIRST diagnosis — unaddressable state — was wrong and the remedy-naming
defect it found is real and still open.

BUT THE WALK STAYED PINNED AFTER THE REOPEN. Reopening `run-spikes` moved the
claim into the owed shape and the walk still could not complete it, answering
at `iterations/i37/run-spikes/end` with an `unsubmitted` blocker and no verb
that could serve the form.

THREE MECHANISMS DISAGREED ABOUT WHETHER A PLACEHOLDER WAS GREEN.

- `recordDone` greened it as soon as its sub-machine's DRAWING was done,
  whatever its own signature said.
- The claim guard in `completeGuarded` asked whether its own claim STOOD, and
  a reopen makes it not stand.
- The pop out of a sub-machine landed on the parent's SUCCESSORS, so the parent
  itself had no landing site.

THE THREE MADE A CIRCLE. The parent could only go green once the drawing
finished, and the drawing could not finish because the parent was not green.
This is the "fallback, when nothing nameable holds the claim" branch the
section above correctly identified — it was reached for a reason that section
did not find.

## The fix, shipped

`placeholderOwesItsOwnClaim` in `engine/session.ts` is now asked by three
paths: the router lands ON a reopened placeholder rather than diving past it,
the aim resolves to it, and the pop out of its sub-machine stands the walk on
it WITHOUT completing it, so its form is served and the re-sign is what lets
the next tick complete.

The narrowing to the REOPENED case only is deliberate: treating a merely stale
placeholder the same way was tried and left the walk standing on the
placeholder with the sub-machine unfinished and no drawn path back in. The
reasoning is at `dsp-walk-machine.md#a-reopened-placeholder-is-walked-to-not-through`.

MEASURED: `run-spikes` re-signed, `fold-back` signed, and the walk reached
`gate-prototype` on the first drive after the fix. 1518 of 1518 tests pass.

## What is still open

TWO THINGS, both smaller than what was fixed.

- THE REMEDY-NAMING DEFECT. `stateFormState` still says `se_pull` where it
  should say `se_reopen {state, machine}`. The fix is drawn in the section
  above and is not this iteration's work.
- A FALSE `unsubmitted` BLOCKER. `engine/sessionclaims.ts` guards on
  `here.evidence_form.length > 0` where it means `owesASignature`, so a
  formless `end` state reports as unsubmitted. It is a wrong word rather than
  a wrong walk, and it is what made the pin above read as unfixable.

## Grade, after the second correction

STAYS CORROSIVE, and the reason changed. It is no longer "an agent's afternoon"
alone: a real engine defect sat underneath a wrong diagnosis, and the wrong
diagnosis is what stopped the looking. The cost of the pair, measured: one
stopped unattended run, one register entry graded fatal in error, and one field
report written around a blocker that had a fix.
