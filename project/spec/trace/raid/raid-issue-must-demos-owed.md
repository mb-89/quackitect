---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-issue-must-demos-owed
type: "[[raid]]"
kind: issue
statement: Three of the six must-story demonstrations stand unperformed - the fresh-machine ramp-up, the second-product start, and the hand walk at autonomy 0 - and the same eyes-on-a-live-session gap leaves four i8 test-specs unobservable by an unattended agent, namely tsp-first-run (population measures), tsp-panel-walkthrough (2 of 5 requirements), tsp-desk-and-gates and tsp-tour-run (both live-demonstration methods).
owner: the owner
trigger: a fresh machine or a first-time reader becomes available, or the owner takes five minutes at the panel with the dial at 0, or an agent walks a live desk session/full tour and records the observation
status: open
impact: The validation record carries three demonstrations by name only; their reports state not-performed, the population claims on tsp-first-run stand at zero observations, and i8's M7 verification carried tsp-panel-walkthrough, tsp-desk-and-gates and tsp-tour-run as owed against this same entry for the same underlying reason.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - reports/rpt-ramp-up.md
  - reports/rpt-start-a-new-product.md
  - reports/rpt-walk-it-by-hand.md
  - tsp-first-run
  - tsp-panel-walkthrough
  - tsp-desk-and-gates
  - tsp-tour-run
---

The three runs need what the agent cannot honestly supply: a fresh
machine, a real first-timer, and a person's own hand at the dial. The
reports name each gap; the gate's musts_demonstrated cites them. The
issue closes when the runs happen and the reports flip to observed.

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
