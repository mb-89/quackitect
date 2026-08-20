---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-a-state-is-equally-hard-at-every-change-size
type: "[[raid]]"
kind: issue
statement: "FALSIFIED 2026-08-20. The design gives each matrix row ONE complexity value; the probe found a single row spanning three rungs across its columns, and not monotonically, so one value per row cannot express what the matrix already says."
owner: the owner
trigger: "the first rating pass over the matrix, and the first walk at a change size other than the one the ratings were judged against"
status: open
impact: "A rating judged against the column it was written for is wrong at every other column, in the expensive direction at the small end: a patch walk pays a major walk's driver for a state the matrix itself has already tailored down to almost nothing."
breaks_how_badly: crippling
how_likely: expected
falsified: 2026-08-20
probe: "COUNTED OVER THE MATRIX AT i38's identify-assumptions, 2026-08-20, AND RECOUNTED AT THE REQUIREMENTS GATE BECAUSE THE FIRST COUNT WAS WRONG. All FIFTY-THREE rows declare all four change-size cells; FORTY-SEVEN differ across the columns and six are identical in all four. The first count said forty-six of fifty-two: the counting script read only the first three thousand characters of each file, so one long row lost its fourth cell and dropped out of the population entirely. The conclusion is untouched and the method was not. The spread is not cosmetic: draft-vision is `none` at patch, `inherit` at minor, `tailored` at major and `full` at product — four different amounts of work under one row name. write-requirements is `tailored` at patch and `full` everywhere else. The design's own words are that every STATE says how hard it is, and the hazard it worried about — a key added to all rows moving the matrix hash — is stated per row, so one value per row is what is proposed."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - req-every-matrix-row-declares-its-complexity
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
weighs_with: raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
weighs_against: none
---

## FALSIFIED AT probe-assumptions, 2026-08-20

IT WAS AN ASSUMPTION FOR ONE STATE. The probe named in it was run at the next
state and came back negative, so the kind is now `issue`: it has happened, it
is present tense, and the id is kept.

THE PROBE AS WRITTEN: take a row whose cells span a wide range, rate it at two
columns, and see whether the ratings differ by a rung or more.

`draft-vision` WAS THE ROW, and its own column notes are the evidence.

| column | what the row's note asks for | rung |
| --- | --- | --- |
| patch | "Does not apply. The vision is axiomatic and a patch never touches it." | none |
| minor | one question survives — name a goal conflict the delta creates and rule which wins | C3, narrowly |
| major | "INHERIT-WITH-JUDGMENT: point to the resident vision and argue in one paragraph whether the change bends it" | C1 |
| product | "STANDING ARTIFACT: the vision packet — big idea, to-be world, goal system, pitch … the axiom every smaller column inherits" | C4 |

THREE RUNGS UNDER ONE ROW NAME, and worse than that: NOT MONOTONIC. Minor asks
for a small piece of authored judgment while major asks the agent to accept a
standing artifact and say whether it moved. The bigger column is the EASIER one.

CORROBORATED BY A SECOND ROW. `write-requirements` is `tailored` at patch —
"CLARIFICATION ONLY … an unclear requirement whose wording produced the wrong
output is repaired in place … No new requirement rows" — and `full` everywhere
else, where every new requirement is authored with its kind, its verify method
and its breaks-if-removed. Repairing wording against a checkable shape is C2;
authoring a requirement a reader must judge is C3.

AND MEASURED FROM THIS WALK RATHER THAN ONLY FROM THE PAGE. This iteration
walked `draft-vision` at major. The work was an inherit: point at the resident
vision, argue the delta in a paragraph, rewrite nothing. That is not the same
act as authoring a vision packet and it is not the same rung.

## WHAT THIS COSTS THE DESIGN

ONE VALUE PER ROW CANNOT EXPRESS IT. The rating has to live where the rest of
the row's per-size truth already lives — in the cells — or the matrix will carry
a number keyed to one unnamed column while every walk at another column reads it
as if it applied.

THE NON-MONOTONICITY KILLS THE CHEAP REPAIR. If bigger columns were always
harder, one row value plus a per-column adjustment would work. They are not, so
nothing can be derived from a single number.

AND IT WOULD HAVE FAILED SILENTLY. Nothing compares a declared rung against
what the work turned out to need, so a rating keyed to the major column would
have over-driven every patch walk forever with no signal — which is the standing
drift risk arriving through a door this iteration would have built itself.

## The counter-case, and why it did not survive

THE HONEST ARGUMENT WAS THAT DIFFICULTY AND VOLUME DIFFER: the cells say how
MUCH of a step applies, not how HARD the judgment is, so the KIND of thinking
might be stable even where the amount is not.

`draft-vision` REFUTES IT DIRECTLY. Its columns do not differ in amount alone.
At major the agent ACCEPTS a standing artifact; at product it FRAMES one from
nothing. Those are different kinds of act by the ladder's own definitions, not
different sizes of the same act.

## What closes this issue

THE RATING MOVES INTO THE CELLS, or the schema says explicitly which column a
row's single value is keyed to and every other column is refused a driver rather
than given the wrong one. The first is more work and is probably right; the
second is honest and cheap. Either is a change to `req-every-matrix-row-declares-its-complexity`,
which is why that requirement was amended the same day.

## The original probe, kept

THE CHEAP HALF, run at identify-assumptions: count how many rows already vary by
column. FORTY-SEVEN OF FIFTY-THREE, six identical.

IT WAS FIRST REPORTED AS FORTY-SIX OF FIFTY-TWO and the error is worth keeping.
The count was made by a program rather than by eye — which is the correction
this iteration had already adopted twice — and the program truncated each file
at three thousand characters, so one long row lost its fourth cell and left the
population. A MEASUREMENT WITH A SILENT TRUNCATION IN IT IS NOT BETTER THAN A
GUESS BECAUSE IT WAS AUTOMATED.

AND THE SANITY CHECK WAS ALREADY IN HAND. This iteration established at its
kickoff gate that the matrix has fifty-three rows, and then wrote fifty-two four
milestones later without noticing the two figures disagreed.

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
