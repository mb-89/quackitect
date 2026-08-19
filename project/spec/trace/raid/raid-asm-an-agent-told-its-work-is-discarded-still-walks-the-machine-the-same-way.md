---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way
type: "[[raid]]"
kind: assumption
statement: "An agent told it is walking a benchmark spends the same effort on the machine's mechanics as one walking real work, so the measured process overhead transfers to real iterations."
owner: the owner
trigger: the first time a benchmark number and a real iteration's own call log can be compared at the same size and model
status: open
impact: "If it is false, every benchmark number understates what a real iteration costs, and a machine change judged good on benchmarks might be neutral or worse in production."
breaks_how_badly: corrosive
how_likely: plausible
probe: "unprobed — it cannot be probed until a real iteration and a benchmark run exist at the same size and model."
source_refs:
  - training-iterations
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Probe

THE OWNER RULED OPEN RATHER THAN BLIND on 2026-08-19, so the agent knows. The
assumption is what that ruling costs, written down rather than left implicit.

HOW IT WOULD BE CHECKED. A real iteration's call log carries the same fields a
benchmark report does. At a matching size and model, compare calls per state
and refusals per clause between a real walk and a benchmark walk.

WHAT HOLDS WOULD LOOK LIKE. The mechanical states — reading, form filling,
refusal recovery — cost the same in both. The judgment states may differ
freely, and that difference is expected rather than falsifying.

WHY IT IS ONLY CORROSIVE. The number stays useful for comparing one machine
version against another, because the bias applies to both sides of a paired
delta. What it corrupts is any claim about ABSOLUTE cost.

WHY IT IS PLAUSIBLE. One ordinary event produces it and there is no
coincidence in the story: an agent that knows nothing depends on its output
writes shorter evidence.

THE BIAS HAS A KNOWN DIRECTION, and a maintainer needs it. The number
UNDERSTATES what a real iteration costs. It is a floor rather than an
estimate. Folded back from i37's pressure-test, where the second hostile
question asked which way the error runs and the assumption only said that it
runs.

THE NARROWED CLAIM STANDS EITHER WAY. The report says it measures process
overhead and never production behaviour.
