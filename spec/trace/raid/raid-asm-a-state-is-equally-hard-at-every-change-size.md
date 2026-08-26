---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-a-state-is-equally-hard-at-every-change-size
type: "[[raid]]"
kind: issue
statement: A row's difficulty varies with change size while the design gives each row ONE complexity value. The SPREAD is established; the NON-MONOTONICITY this entry first claimed was manufactured by quoting half a note and is withdrawn.
owner: the owner
trigger: the first rating pass over the matrix, and the first walk at a change size other than the one the ratings were judged against
status: open
looked: 2026-08-20
impact: "A rating judged against the column it was written for is wrong at every other column, in the expensive direction at the small end: a patch walk pays a major walk's driver for a state the matrix itself has already tailored down."
breaks_how_badly: corrosive
how_likely: expected
probe: "SPREAD MEASURED ACROSS THE WHOLE MATRIX AT M4 PROBE 1, 2026-08-20, and it is larger than the single worked example suggested. Rows active per column: 19 at patch, 29 at minor, 53 at major, 53 at product — so 34 of 53 rows are struck entirely at patch and 24 at minor, which is the spread in its coarsest form. Among the rows that DO apply, the declared rigor word discriminates at the small end and collapses at the large: patch reads 13 tailored, 34 none, 6 full; major reads 49 full against 4 tailored. The field count runs the other way, spreading over seven classes at major. So a single value per row is wrong in both directions: it cannot express the small end where the matrix already tailors, and it cannot express the large end where the declared word is a constant. SPREAD ESTABLISHED, NON-MONOTONICITY WITHDRAWN, both 2026-08-20. THE SPREAD HOLDS on M3_10_write-requirements: `tailored` at patch, where the note says CLARIFICATION ONLY and no new requirement rows, against `full` everywhere else, where every requirement is authored with its kind, verify method and breaks-if-removed. Repairing wording against a checkable shape and authoring a requirement a reader must judge are different rungs. THE NON-MONOTONICITY WAS FALSE. It rested on rating draft-vision C1 at major from the first sentence of a two-sentence note; the second sentence says a major that shifts a goal or a conflict REWRITES THE AFFECTED PART OF THE PACKET. The row's evidence fields settle it mechanically: big_idea, to_be_world and moore_pitch each carry `omit: [minor]` and goal_system does not, so minor asks ONE field and major asks four. Minor is a strict subset of major."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - req-every-matrix-row-declares-its-complexity
weighs_with: raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
weighs_against: none
---

## WHAT THIS ENTRY FIRST CLAIMED, AND WHY HALF OF IT IS WITHDRAWN

IT CLAIMED THREE RUNGS AND NON-MONOTONICITY, and built both on a reading of
`draft-vision`'s four column notes. An adversarial pass with no shared context
took the row apart and the non-monotonic half did not survive.

THE QUOTE WAS CUT IN HALF. The major note is two sentences. The first —
"INHERIT-WITH-JUDGMENT: point to the resident vision and argue in one paragraph
whether the change bends it" — reads as accept-only, and that is the half this
entry quoted. THE SECOND SENTENCE: "A major that leaves the vision untouched
inherits; one that shifts a goal or a conflict rewrites the affected part of the
packet, and only that part." Rewriting the part a shifted goal touches is the
same act the entry rated C3 at minor.

THE EVIDENCE FIELDS SETTLE IT WITHOUT ANY READING AT ALL. `big_idea`,
`to_be_world` and `moore_pitch` each carry `omit: [minor]`; `goal_system` does
not. So minor asks ONE field and major asks FOUR, `goal_system` among them.
MINOR IS A STRICT SUBSET OF MAJOR in both fields asked and judgment asked, and
no non-monotonicity can survive that. The omit lists were never looked at.

AND THE ROW'S OWN CELLS ARE MONOTONIC: `none`, `inherit`, `tailored`, `full`,
non-decreasing. The entry inverted an ordering the row declares about itself.

## THE WORST PART WAS NOT THE READING

THIS ENTRY CLAIMED FIRST-HAND EVIDENCE AND THE FIRST-HAND EVIDENCE IS FALSE. It
said: "This iteration walked `draft-vision` at major. The work was an inherit:
point at the resident vision, argue the delta in a paragraph, rewrite nothing."

THE SIGNED FORM SAYS OTHERWISE, and it is in this record's own evidence folder.
`draft-vision.md` carries a filled `big_idea` of three paragraphs, a
`to_be_world` of five, a `goal_system` of five goals with three conflicts each
ruled and a priority order, and a four-paragraph `moore_pitch` — roughly four
thousand eight hundred characters. THE WHOLE PACKET WAS AUTHORED. Nothing was
inherited and a great deal was written.

SO THE ENTRY CITED THE WALKER'S MEMORY OF ITS OWN WORK against a file the
walker had signed ninety minutes earlier, and the memory was wrong in the exact
direction the argument needed. That is the most dangerous shape available: a
process claim, stated as measurement, contradicted by an artifact in the tree.

## WHAT SURVIVES, AND IT IS ENOUGH TO KEEP THE ISSUE OPEN

DIFFICULTY DOES VARY WITH COLUMN. `write-requirements` is the clean case and it
is a monotonic row, so it carries spread without carrying the withdrawn half:
at patch the note says CLARIFICATION ONLY, an unclear requirement repaired in
place, EARS shape and verify method surviving the edit, no new rows. At every
other size every new requirement is authored with its kind, its verify method
and its breaks-if-removed filled.

REPAIRING WORDING AGAINST A CHECKABLE SHAPE IS NOT AUTHORING A REQUIREMENT A
READER MUST JUDGE. One value for that row is wrong at one end or the other.

## What this costs the design, restated honestly

ONE VALUE PER ROW IS STILL WRONG, on spread alone. A rating keyed to one
unnamed column reads as if it applied at all four.

THE CHEAP REPAIR IS BACK ON THE TABLE and this entry no longer rules it out. If
the columns are ordered — and for `draft-vision` they demonstrably are — then one
row value plus a per-column adjustment could express the spread. WHETHER THE
ADJUSTMENT IS DERIVABLE is unknown, and deriving it would need per-column data
anyway, which is the simpler thing to store.

TWO ROWS ARE STILL NON-MONOTONIC IN THEIR APPLICATION CELLS —
`M4_25 run-candidates` and `M6_15 run-spikes`, both `full` at major and
`tailored` at product, and independently confirmed to be the only two. THAT IS
ABOUT APPLICATION, NOT DIFFICULTY, and this entry no longer leans on it for
more than it says.

## What closes it

THE FIRST RATING PASS, rating `write-requirements` at patch and at major. If
the two differ, per-column stands. If they do not, one value per row is right
and this entry closes.

AND IT SHOULD RATE `draft-vision` AT MINOR AND MAJOR TOO, now that the omit
lists are known: one field against four is the sharpest available test of
whether volume and difficulty come apart.
