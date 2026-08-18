---
form: specify-build
by: agent
signed_off: 2026-08-18T09:51:15.395Z
authors: agent
files:
---

# Evidence form / specify-build

## current_situation

The tests are written and red. This state says how the delta is designed and in what order it is built.

ONE DESIGN SPEC covers both elements the delta touches, and that is a judgement rather than laziness: the mint and the offer are two ends of ONE mechanism, and a spec per element would have split the one thing a reader needs to hold together — where an option lives, and how the two readers of it agree.

THE CHUNKS ARE A CHAIN, NOT A FAN, and the plan says so rather than forcing width onto it. flow management's own warning applies: forcing parallelism onto a deep chain only adds seams.

## design_specs

- dsp-the-options-pool

## promotions

none — no expedition promoted a spike into this record, and no experiment node carries a `chunk:` for it. Said explicitly because an unassigned promotion is refused, and silence would read as one having been lost.

## follow_up

- SE-C-140 needs its section in refusals.md in the same chunk that mints the clause. The pairing rule is that a clause is not done until its feed-forward section stands, and authorship carries that rule today
- the six-word threshold is written into the design spec rather than buried in the code, so the first run of real data can move it without archaeology
- chunk 4 is where the kill criterion becomes checkable, and its cases are already written against a root whose local store holds nothing drained
- trace-design comes after the build and is where the files this spec names get their teeth

## anything_else

## build_order

THE LENSES THAT SHAPED IT: RISK FIRST, and spine second. Both are visible in the order and neither is decorative.

RISK FIRST DECIDES WHAT IS BUILT FIRST. The riskiest piece is not the mint as a whole — it is the overlap check, because it is the only mechanical defence behind the only FATAL row, and because its threshold is a judgement nobody has data for. It is chunk two, before anything reads the pool, so a wrong threshold is found while the budget to react still exists.

THE SPINE DECIDES WHAT COMES AFTER. Chunks three and four are the thinnest end-to-end slice: a drain that mints, and a survey that offers. Until both exist the seam between them is untested, and the seam is the kill criterion.

- CHUNK 1, the module. engine/pool.ts: where an option lives, how one is written, how they are read. No caller yet. Realization: code
- CHUNK 2, the refusal. SE-C-140 in errors.ts, its section in refusals.md, and the longest-common-run check in pool.ts. Depends on 1. Realization: code
- CHUNK 3, the drain. inbox.ts takes a statement, mints, then marks the note drained — in that order, so a refused mint leaves nothing drained. tools.ts carries the argument. Depends on 1 and 2. Realization: code
- CHUNK 4, the offer. survey.ts reads the pool instead of the note store. Depends on 1 and 3. Realization: code

THE ONE EDGE THAT MATTERS is 3 before 4: chunk 4's own cases need minted options to read, so building the offer first would leave it testable only against hand-written fixtures — which is exactly the shape that passes over a wrong source.

NOTHING FANS OUT, and that is the honest answer. Four chunks, one chain, each depending on the one before. A plan that split this into strands would be drawing parallelism that the dependencies do not have.
