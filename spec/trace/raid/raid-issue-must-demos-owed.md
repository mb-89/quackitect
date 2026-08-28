---
minted_in: i1
id: raid-issue-must-demos-owed
type: "[[raid]]"
kind: issue
statement: Three of the six must-story demonstrations stand unperformed - the fresh-machine ramp-up, the second-product start, and the hand walk at autonomy 0 - and the same eyes-on-a-live-session gap leaves four i8 test-specs unobservable by an unattended agent, namely tsp-first-run (population measures), tsp-panel-walkthrough (2 of 5 requirements), tsp-desk-and-gates and tsp-tour-run (both live-demonstration methods).
owner: the owner
trigger: a fresh machine or a first-time reader becomes available, or the owner takes five minutes at the panel with the dial at 0, or an agent walks a live desk session/full tour and records the observation
status: open
impact: The validation record carries three demonstrations by name only. NO REPORT EXISTS FOR ANY OF THEM - checked 2026-08-18 across the working tree and at ref main, and the whole corpus holds zero files matching rpt-*.md. The population claims on tsp-first-run stand at zero observations, and i8's M7 verification carried tsp-panel-walkthrough, tsp-desk-and-gates and tsp-tour-run as owed against this same entry for the same underlying reason.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - tsp-first-run
  - tsp-panel-walkthrough
  - tsp-desk-and-gates
  - tsp-tour-run
place: backlog
---

The three runs need what the agent cannot honestly supply: a fresh
machine, a real first-timer, and a person's own hand at the dial. The
issue closes when the runs happen and each mints its report.

## Corrected 2026-08-18, at i16's gate-validation

THIS ENTRY USED TO CITE THREE REPORTS THAT DO NOT EXIST. Its `source_refs`
named `reports/rpt-ramp-up.md`, `reports/rpt-start-a-new-product.md` and
`reports/rpt-walk-it-by-hand.md`, and its impact line said "their reports state
not-performed". No such files have ever existed.

MEASURED. A glob for `**/rpt-*.md` returns nothing, in the working tree and at
ref `main`. No iteration has a `run-demos.md` evidence form either. The
convention itself is real and stands at `meth-validation-container.md` line 15
- "EVERY RUN MINTS A REPORT" - but no run has ever minted one.

WHY IT MATTERS MORE THAN THE THREE MISSING FILES. An entry that cites evidence
by path reads as though somebody opened it. This one asserted the CONTENTS of
three files nobody wrote. It is the same defect the evidence rule exists to
stop, sitting inside the register that is supposed to catch it.

IT IS WIDER THAN THIS ENTRY. Six story decks and i27's gate-validation cite
`reports/rpt-*.md` paths on the same pattern. They are named in i16's
gate-validation red team and are not corrected here, because correcting a
signed gate's prose is not this entry's to do.

i8's M7 verification (2026-08-13) found the same limit blocks four
whole-product test-specs, not just tsp-first-run's three reports:

- tsp-first-run's own population-measure requirements
  (req-newcomer-orients-unaided, req-newcomer-leaves-able-to-ask) are
  this entry's original concern, restated here for completeness.
- tsp-panel-walkthrough's req-panel-shows-the-machine and
  req-selected-node-shows-its-claim need eyes on the rendered panel —
  the other three of its five requirements were demonstrated by that
  same iteration's own host-swap and multi-session field report.
- tsp-desk-and-gates and tsp-tour-run are demonstration-method specs
  verified at the live desk / a live tour; no amount of reading source
  substitutes for an observed run, and none was performed that round.

Each of the four closes independently, on its own trigger, the moment
someone (owner or a live-session-capable agent) performs the run and
records the observation.
