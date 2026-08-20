---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-every-matrix-row-declares-its-complexity
type: "[[requirement]]"
statement: "When the rigor matrix is loaded, the loader shall refuse any row that does not declare a complexity value from the five-rung ladder for every change-size column in which that row applies."
kind: functional
verify_method: test
breaks_if_removed: "A rating that is optional is a rating most rows will not carry, and a maximum taken over a partly-rated milestone is not a maximum. The mechanism degrades to nothing without saying so."
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 2"
  - "vp-the-machine-says-how-strong-a-hand-each-step-needs"
  - "raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so"
priority: must
---

## Detail

THE LOADER ALREADY REFUSES A MISSING CELL — a change-size cell that does not
apply must be an explicit `none` with its reason, and absence is refused. The
complexity key takes the same treatment for the same reason.

THE FIVE RUNGS ARE C0 DERIVE, C1 TRANSCRIBE-OR-RULE, C2 APPLY, C3 AUTHOR,
C4 FRAME. The ladder itself is authored elsewhere; this requirement is about
every row carrying one.

PER COLUMN, NOT PER ROW — AMENDED 2026-08-20 AFTER A PROBE FALSIFIED THE
SIMPLER FORM. This requirement first said one value per row. `draft-vision`
spans three rungs across its columns and does not do so monotonically: at major
it asks the agent to ACCEPT a standing artifact and say whether it moved, and at
product it asks the agent to FRAME one from nothing. `write-requirements`
corroborates — clarification-only at patch against authoring at every other
size.

SO THE RATING LIVES WHERE THE REST OF THE ROW'S PER-SIZE TRUTH ALREADY LIVES.
A row already declares a cell per column; the complexity is one more thing that
cell says.

A COLUMN WHERE THE ROW DOES NOT APPLY OWES NOTHING. `draft-vision` at patch is
`none`, so there is no work to rate. The refusal follows the existing cell rule
rather than inventing a second one.

WHY REFUSAL RATHER THAN A DEFAULT. A default would be a rating nobody chose,
indistinguishable at read time from one somebody did. That is the failure mode
the whole register entry on silent drift describes, arriving before the
mechanism has even shipped.
