---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-every-matrix-row-declares-its-complexity
type: "[[requirement]]"
statement: "When the rigor matrix is loaded, the engine shall obtain a complexity for every row in every change-size column in which that row applies, refusing loudly where it cannot rather than proceeding without one."
kind: functional
verify_method: test
breaks_if_removed: "A rating that is optional is a rating most rows will not carry, and a maximum taken over a partly-rated milestone is not a maximum. The mechanism degrades to nothing without saying so."
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 2"
  - "vp-the-engine"
  - "raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so"
priority: must
---


## Restated at gate-architecture, 2026-08-20

THIS ROW NAMED A DECLARATION MECHANISM and forbade derivation by construction: a
loader that refuses a row which does not DECLARE cannot accept a row whose value
is computed, because there is nothing to declare.

WHAT IT MEANS, taken from its own breaks_if_removed: a rating that is optional is
a rating most rows will not carry, and the mechanism degrades to nothing without
saying so. The demand is that every applying row HAS a complexity and that its
absence fails loudly.

OBTAIN RATHER THAN DECLARE IS THE WHOLE CHANGE. Declaring satisfies it. Deriving
from the row's own field count satisfies it. Two figures rather than one satisfies
it, because the row still has a complexity the engine can obtain. What does not
satisfy it is a row the engine reaches with nothing and walks anyway.

## Detail

THE LOADER ALREADY REFUSES A MISSING CELL — a change-size cell that does not
apply must be an explicit `none` with its reason, and absence is refused. The
COMPLEXITY IS REFUSED THE SAME WAY AND FOR THE SAME REASON.

THIS SENTENCE SAID "the complexity KEY takes the same treatment", corrected
2026-08-20. A key is a declaration, and the statement above stopped requiring
one — a value derived from the row's own field count satisfies the demand and
has no key at all. What must fail loudly is a row the engine reaches at an
applying column and cannot get a complexity for, however the complexity would
have been arrived at.

THE FIVE RUNGS ARE C0 DERIVE, C1 TRANSCRIBE-OR-RULE, C2 APPLY, C3 AUTHOR,
C4 FRAME. The ladder itself is authored elsewhere; this requirement is about
every row carrying one.

"RUNG" NAMES TWO LADDERS IN THIS RECORD AND THEY ARE NOT THE SAME, noted
2026-08-20 after a cold pass found nothing distinguishing them.

- THE COMPLEXITY LADDER is these five. It is the DOMAIN: how hard a row's work
  is at a change size. This requirement is about it.
- THE HAND LADDER is what a complexity resolves TO.
  `opt-the-roster-and-the-mapping-are-two-records-on-two-clocks` speaks of "four
  rungs and one host", which is that second ladder — classes of worker, the
  CODOMAIN of the mapping.

THE MAPPING RUNS FROM THE FIRST TO THE SECOND, and the two ladders need not be
the same length or the same names. `req-an-unmatched-rung-names-itself-and-publishes-no-driver`
is about the second: a difficulty for which nothing in the hand ladder is
covered.

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
