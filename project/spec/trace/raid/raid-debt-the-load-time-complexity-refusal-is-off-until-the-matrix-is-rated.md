---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated
type: "[[raid]]"
kind: debt
statement: "The engine refuses a missing complexity at the point of use rather than when the matrix is loaded, because turning the load-time refusal on before the 154 active cells are rated would make the product unloadable."
owner: the owner
trigger: "the matrix owner rating the cells, and any reader who takes req-every-matrix-row-declares-its-complexity at its word"
status: open
impact: "The requirement asks for a refusal WHEN THE MATRIX IS LOADED. What ships refuses when a step is SIZED. Nothing ever proceeds without a complexity either way, so the demand's purpose is met — but a reader comparing the requirement against the code finds them saying different things, and the narrower reading is the one that ships."
breaks_how_badly: abrasive
how_likely: expected
probe: "READ engine/rigor-matrix.ts difficultyFor, 2026-08-20. A missing complexity on an applied change-size cell returns {} while complexityRequiredIn(dir) is false, and throws naming the row and the column once it is true. The flag is one line in project/deliverable/machines/rigor_matrix/README.md, and the line is not there: no cell in the shipped matrix carries a rating."
probed: 2026-08-20
source_refs:
  - req-every-matrix-row-declares-its-complexity
  - dsp-the-sizing-block
  - "project/deliverable/engine/rigor-matrix.ts"
weighs_with: none
weighs_against: none
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

## What closes it

RATING THE CELLS AND WRITING THE LINE. That is the matrix owner's judgement,
and `exp-two-hands-rating-the-same-six-cells` measured what it costs: two
readers agreed on five of six sampled cells, and disagreed on exactly the one
row that stands in for work happening elsewhere.

WHAT MUST NOT CLOSE IT is deleting the point-of-use refusal on the grounds that
the load-time one exists. Both are the same demand at two moments, and the later
one is what stops a walk proceeding on a guess.
