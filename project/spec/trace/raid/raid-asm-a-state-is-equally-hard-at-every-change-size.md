---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-a-state-is-equally-hard-at-every-change-size
type: "[[raid]]"
kind: assumption
statement: "The design gives each matrix row ONE complexity value, which treats a state's difficulty as constant across change sizes while forty-six of the fifty-three rows already declare that the state does demonstrably different work at each one."
owner: the owner
trigger: "the first rating pass over the matrix, and the first walk at a change size other than the one the ratings were judged against"
status: open
impact: "A rating judged against the column it was written for is wrong at every other column, in the expensive direction at the small end: a patch walk pays a major walk's driver for a state the matrix itself has already tailored down to almost nothing."
breaks_how_badly: crippling
how_likely: expected
probe: "COUNTED OVER THE MATRIX AT i38's identify-assumptions, 2026-08-20. Fifty-two rows declare all four change-size cells; FORTY-SIX of them differ across the columns and only six are identical in all four. The spread is not cosmetic: draft-vision is `none` at patch, `inherit` at minor, `tailored` at major and `full` at product — four different amounts of work under one row name. write-requirements is `tailored` at patch and `full` everywhere else. The design's own words are that every STATE says how hard it is, and the hazard it worried about — a key added to all rows moving the matrix hash — is stated per row, so one value per row is what is proposed."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - req-every-matrix-row-declares-its-complexity
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
weighs_with: raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
weighs_against: none
---

## Probe

THE CHEAP HALF IS DONE AND IT IS ABOVE: count how many rows already vary by
column. Forty-six of fifty-two.

THE HALF THAT NEEDS THE RATINGS: take any row whose cells span a wide range —
`draft-vision` is the clearest, running from `none` to `full` — and rate it
twice, once as the patch column asks and once as the product column asks. If
the two ratings differ by a rung or more, one value per row cannot be right.

WHAT WOULD FALSIFY THE ASSUMPTION, in order of how likely each is:

- A rating pass that finds itself asking "at which size?" and having nowhere to
  put the answer. This is the expected outcome and it arrives at M3 or M7.
- A patch walk paying a top-rung driver for a state its own column marked
  `none` or `inherit`.
- Two people rating the same row differently because they were each thinking of
  a different column, with nothing in the artifact to show why they disagreed.

WHAT WOULD CONFIRM IT: the ratings cluster by row regardless of column, because
the KIND of judgment a state asks for is stable even when the AMOUNT of work is
not. That is a real possibility and it is the assumption's honest case — see
below.

## The honest case for the assumption

DIFFICULTY AND VOLUME ARE NOT THE SAME THING. The cells say how MUCH of a step
applies, not how HARD the judgment is. `draft-vision` at `tailored` is a
smaller job than at `full` and it may be the same KIND of job — still framing,
still a thing only a reader can judge, still C4 by the ladder's own definitions.

IF THAT HOLDS, one value per row is exactly right and the column is irrelevant
to it. The ladder rates the kind of thinking, and the column rates the amount.

## Why it is registered rather than assumed

BECAUSE NOBODY HAS CHECKED, and the cost of being wrong is asymmetric. If the
kind is stable, one value per row costs nothing and the entry closes at the
first rating pass. If it is not, every rating in the matrix is silently keyed to
one unnamed column, and the small-change walks pay for it forever without
anything saying so.

AND IT COMPOUNDS WITH THE DRIFT RISK. A rating that is wrong for three of four
columns will never be contradicted, because nothing compares a declared rung
against what the work turned out to need.

## What closes it

THE FIRST RATING PASS, which is this iteration's own work. It should rate one
wide-spread row at two columns before rating anything else, and say which way it
came out. That is one row's work and it settles the shape of all fifty-three.
