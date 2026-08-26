---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-the-model-ladder-is-a-total-order
type: "[[raid]]"
kind: assumption
statement: The design treats models as a ladder where a higher rung is strictly better, so that asking for a stronger driver is always safe and needs no argument, while nothing establishes that model strength is a single ordered dimension.
owner: the owner
trigger: the first time the fixed list is written and a rung has to be filled, and any occasion where a nominally stronger model does a rated state worse
status: open
impact: "If strength is not one dimension, the safety asymmetry has no meaning: escalating is not free, the recommendation cannot be read as a floor, and a list of one model per rung cannot express what the work actually needs."
breaks_how_badly: corrosive
how_likely: plausible
probe: "NOT YET CHECKED, and the honest state of it is that no list exists to check against. WHAT THE DESIGN RESTS ON: the ruling that asking for a STRONGER model than recommended needs no argument while asking for a WEAKER one needs a recorded reason. That is only safe if stronger is a well-ordered relation. WHAT WOULD TEST IT CHEAPLY once a list exists: take a C1 transcribe-or-rule state and run it on the top rung. If the stronger model does it worse — over-elaborating a transcription, re-deriving a drawing it was asked to accept — then higher is not strictly better and the asymmetry needs re-stating."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - req-one-model-list-is-read-live-from-the-repository
  - raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
weighs_with: raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
weighs_against: none
---

## Probe

ONE STATE, TWO RUNGS, AND READ THE RESULT. Take a C1 state — one where the
answer already exists and the agent moves, accepts or picks among what was
drawn — and walk it on the rung the list names and on the top rung. Compare.

WHAT WOULD FALSIFY IT:

- A stronger model re-deriving a drawn field instead of accepting it. The lane's
  own forms already warn that a drawn field invites exactly this mistake, and
  the warning exists because it has been made.
- A stronger model writing an essay where a pick was wanted, which the same
  guidance names as the other half of that failure.
- Any state where the recommended rung is measurably better than the rung above
  it.

WHAT WOULD CONFIRM IT: escalation never hurts, only costs. Then the asymmetry
stands exactly as ruled and this entry closes.

## Why this is not pedantry

THE ASYMMETRY IS THE DESIGN'S ONLY SAFETY RULE. It is what makes a
recommendation safe to disregard upward, and it is the whole reason a weaker
choice is the one that owes a sentence.

IF STRONGER IS NOT STRICTLY BETTER, the rule protects nothing in one direction
and the recommendation stops being a floor. A reader who escalates on instinct
would then be making an unrecorded, unexamined choice — which is precisely the
shape the rule was written to stop in the other direction.

## What it does not claim

IT DOES NOT CLAIM THE LADDER IS WRONG. Ordering models by capability is
ordinary and mostly works. The assumption is narrower: that it works well
enough for "stronger is always safe" to be a rule rather than a heuristic, and
nobody has looked.
