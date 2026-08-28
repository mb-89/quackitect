---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-the-i38-seed-counts-a-matrix-that-has-since-moved
type: "[[raid]]"
kind: issue
statement: Every measured figure in the i38 seed was taken against the matrix as it stood before i9 added a row, so the state count, the evidence-field count, the drawn-field count and the front-half claim are all one sweep out of date.
owner: the walking agent
trigger: any state that rates, counts or sweeps the matrix, and the first reader who takes 52 or 86 as the denominator of a measurement
status: open
impact: A rating pass driven by the seed's figures leaves one state unrated and reports coverage over a denominator three too small. The warning about the test going red is already spent, so a state may also spend effort answering a problem that does not exist.
breaks_how_badly: corrosive
how_likely: expected
probe: "MEASURED AT THE i38 KICKOFF GATE, 2026-08-20. deliverable/machines/rigor_matrix/rows/ holds 53 row files by an exhaustive, untruncated glob. tests/rigor-matrix.test.ts:68 asserts m.rows.length === 53, and the comment at :66 dates it — 53 since 2026-08-19, M5_27 graft-onto-the-winner, added by i9. Evidence-field declarations across the rows number 89, spread over 43 of the 53 rows. The drawn-field split was re-derived by a reviewer with no shared context and is 25 of 89, not 23 of 86 — the two extra drawn fields are graft-onto-the-winner's own, the same i9 row that moved the count. The seed's claim that M0 through M3 hold ONE drawn field between them is also wrong: there are three (onboard-retro notes_drained, gate-kickoff retro_drained, probe-assumptions probes). A third stale count stands outside the record, in guidance/method/tour.md:70, which says 50 rows."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
place: overhaul
---

## The three figures

- STATES: the seed says 52. There are 53.
- EVIDENCE FIELDS: the seed says 86. There are 89, across 43 rows; ten rows
  declare none.
- THE TEST: the seed says it hard-codes 52 and that adding states will turn it
  red. It asserts 53 and carries a dated comment for every change that moved
  the number.
- DRAWN FIELDS: the seed says 23 of 86. It is 25 of 89, and the two extra are
  the i9 row's own.
- THE FRONT HALF: the seed says M0 through M3 hold ONE drawn field between
  them. There are three. The qualitative claim it rests on — the front half is
  authorship and the back half is method — survives; the number does not.

AND ONE OUTSIDE THE RECORD: guidance/method/tour.md:70 tells a
newcomer the matrix has 50 rows. It has 53. Nobody is served worse by a stale
count than the reader being introduced to the thing.

## Why it happened, and why it will happen again

THE SEED WAS WRITTEN FROM A SWEEP, and the sweep was right when it ran. A row
landed on 2026-08-19 and the figures were carried into a record written the
next day.

A COUNT IN PROSE HAS NO WAY TO GO STALE LOUDLY. Nothing recomputes it, nothing
compares it, and it reads exactly the same whether it is current or a fortnight
old. That is the durable half of this entry: every measured figure a record
carries is a snapshot with no timestamp on it.

## What the states below must do

READ THE MATRIX, NEVER THE RECORD, for anything countable. The record carries
the rulings; the matrix carries the rows. Where a figure is quoted from the
record, say when it was measured.
