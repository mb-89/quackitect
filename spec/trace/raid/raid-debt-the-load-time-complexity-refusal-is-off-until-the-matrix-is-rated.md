---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated
type: "[[raid]]"
kind: debt
looked: 2026-08-26
statement: The engine refuses a missing complexity at the point of use rather than when the matrix is loaded, because turning the load-time refusal on before the 154 active cells are rated would make the product unloadable.
owner: the owner
trigger: "none — paid 2026-08-28: the cells are rated, the re-pin was watched, and the line is written"
status: closed
impact: The requirement asks for a refusal WHEN THE MATRIX IS LOADED. What ships refuses when a step is SIZED. Nothing ever proceeds without a complexity either way, so the demand's purpose is met — but a reader comparing the requirement against the code finds them saying different things, and the narrower reading is the one that ships.
breaks_how_badly: abrasive
how_likely: expected
probe: "READ engine/rigor-matrix.ts difficultyFor, 2026-08-20. A missing complexity on an applied change-size cell returns {} while complexityRequiredIn(dir) is false, and throws naming the row and the column once it is true. The flag is one line in deliverable/machines/rigor_matrix/README.md, and the line is not there: no cell in the shipped matrix carries a rating."
probed: 2026-08-20
source_refs:
  - req-every-matrix-row-declares-its-complexity
  - dsp-the-sizing-block
  - deliverable/engine/rigor-matrix.ts
weighs_with: none
weighs_against: none
last_looked: 2026-08-23
look_verdict: rescheduled
place: i14-the-ladder-engine-half-comparison-moves-
---

## The shape of it

TWO TRUE THINGS COLLIDED AND THIS IS THE SEAM. The requirement demands a
load-time refusal. `specify-build` declared rating the cells out of scope,
because putting 154 unreviewed judgements in the same commit as the mechanism
that reads them is not a build.

TURNING IT ON TODAY BRICKS THE PRODUCT. Every row that applies in a
change-size column would refuse, and every one of them is unrated.

## Why the flag lives in the README and not in code

SAYING "EVERY ACTIVE CELL IS RATED" AND MAKING IT BINDING SHOULD BE ONE ACT.
A boolean in a source file can be flipped by somebody who has not looked, and a
sentence in a document can be written by somebody who has not checked. Putting
the check on the sentence makes the two the same act.

THE LINE IS `EVERY ACTIVE CELL CARRIES A COMPLEXITY.` in the matrix folder's
own README, and the loader reads the file.

## What the shipped product does today, said plainly

NOTHING IS PUBLISHED. `strengthNeeded` refuses on every step, so no pull in the
real product carries a `hand` field. A reader of
`req-the-machine-names-a-driver-and-starts-nothing` or
`req-a-milestone-takes-the-maximum-complexity-over-its-rows` needs that fact
and not only the narrower one about which moment refuses.

AND THE LOG ANSWERS `(none)` FOR THE PART COORDINATE until a server built from
this code is running. The lane server in a session that predates the build does
not know the argument exists.

## One thing the day the line is written will do

EVERY STANDING PIN GOES STALE AT ONCE. The matrix content hash now covers the
rated flag, so writing the line changes the hash and every open record re-pins.

`iterationDrift` REOPENS NOTHING, because a complexity reaches neither the
demand digest nor the step shape — that is the fatal row holding. But a silent
mass re-pin across the open records is unexercised behaviour, and whoever writes
the line should watch it happen rather than discover it.

## Repayment

THREE ACTS, IN ORDER, AND THE THIRD IS ONE LINE.

- RATE THE 154 ACTIVE CELLS. Each applied change-size cell takes a
  `<column>_complexity: <judgement>/<reading>` — judgement one of C0..C4,
  reading one of R0..R4. A row that RUNS a sub-machine takes none.
- WATCH THE RE-PIN. Writing the README line moves the matrix content hash, so
  every open record re-pins at once. `iterationDrift` reopens nothing, and
  that should be observed rather than assumed.
- WRITE `EVERY ACTIVE CELL CARRIES A COMPLEXITY.` into
  `deliverable/machines/rigor_matrix/README.md`. The loader reads the
  file, so the sentence and the binding are one act.

WHAT REPAYMENT IS NOT. Deleting the point-of-use refusal because the load-time
one now fires. They are the same demand at two moments, and the later one is
what stops a walk proceeding on a guess.

HOW A READER KNOWS IT IS PAID: a pull at any rated step carries a `hand`
field, and `node --test tests/sizing-block.test.ts` still passes.

## What closes it

RATING THE CELLS AND WRITING THE LINE. That is the matrix owner's judgement,
and `exp-two-hands-rating-the-same-six-cells` measured what it costs: two
readers agreed on five of six sampled cells, and disagreed on exactly the one
row that stands in for work happening elsewhere.

WHAT MUST NOT CLOSE IT is deleting the point-of-use refusal on the grounds that
the load-time one exists. Both are the same demand at two moments, and the later
one is what stops a walk proceeding on a guess.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

NOT TOUCHED THIS WINDOW. No rating pass ran and the matrix is unchanged.

RE-ACCEPTED consciously, trigger unchanged.

SWEPT 2026-08-28, at i63's closing retro: TRIGGER PARTLY FIRED, RE-ACCEPTED.

The trigger has two halves. The matrix owner rating the cells has not happened.
The second half — a reader taking req-every-matrix-row-declares-its-complexity
at its word — fired: a note in this window records that every work item carries
an empty difficulty because no matrix cell is rated.

SO THE ROW IS STILL WRITING A CHEQUE THE MATRIX CANNOT CASH, and a reader met
it. 42 rigor-matrix files changed in this window and none of them added a
rating.

## PAID 2026-08-28. All three acts, in the order this entry set them.

### One: the cells are rated

182 ratings stand, one on every active change-size cell. Four hands rated the
63 rows against their full shape, each with a written reason; two rows were
rated per column by hand. What is judged and what is derived is written down in
the matrix README rather than left for a reader to work out.

THE COUNT IS 182 AND NOT THE 154 THIS ENTRY PREDICTED, because the prediction
pre-dates rows added since. Two of the engine's own refusals corrected the
first attempt: `specification` is not a change-size column and owes nothing,
and five rows that RUN a sub-machine are placeholders that owe nothing.

### Two: the re-pin was watched, and it did not happen

THE PREDICTION WAS THAT EVERY STANDING PIN GOES STALE AT ONCE. It did not,
and the reason is better than the prediction.

ASKED THROUGH THE ENGINE'S OWN FUNCTIONS — `pinIsUnset`, `pinIsStale` and
`iterationDrift` — over all 39 open records: 39 carry NO PIN AT ALL, 0 went
stale, and 0 had a demand move. Every open record sits before its kickoff
bless, which is exactly where `pinIsUnset` says a record has no stored column.

SO THE MASS RE-PIN COULD NOT HAVE HAPPENED, and the claim it was meant to test
— that a complexity reaches no demand digest — is untested by this pass rather
than confirmed by it. It will be tested the first time a record with a pin sees
a matrix edit.

A FIRST ATTEMPT AT THIS CHECK READ `record.md` FOR A PIN FIELD and found none,
which looked like the same answer and was the script looking in the wrong
place. The pin is a JSON file under the record. Recorded because the wrong
method gave the right number, which is the shape that gets believed.

### Three: the line is written

`EVERY ACTIVE CELL CARRIES A COMPLEXITY.` stands in
`deliverable/machines/rigor_matrix/README.md`. The loader reads that file, so
saying it and making it binding were one act.

VERIFIED BY LOADING: all four change-size columns compile with the refusal
armed. patch 28 states carrying a complexity, minor 38, major 58, product 58.
The only states without one are `start`, which the compiler synthesises, and
the five sub-machine placeholders the engine itself excludes.

### What was NOT done

THE POINT-OF-USE REFUSAL STANDS UNTOUCHED, which is what this entry said
repayment must not do.
