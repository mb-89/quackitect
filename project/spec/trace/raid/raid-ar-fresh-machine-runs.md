---
id: raid-ar-fresh-machine-runs
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-fresh-machine-runs at risk — the response hinges on el-bootstrap.
owner: the adjudicator
trigger: any change to el-bootstrap, or to the scenario on req-fresh-machine-runs
status: open
impact: a fresh machine now has a core and a satellite per record to bring up, and the bootstrap on the chart converges files and reports drift.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-fresh-machine-runs
  - el-bootstrap
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-bootstrap; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.

## Where the response forms now, 2026-08-19

HALF OF IT MOVED, and this entry would otherwise send a reader to the wrong
element. The scenario asks for three things: the system installs, verifies
itself, and reports ready.

- INSTALLING still forms at [[el-bootstrap]], and the sentence above still
  holds for that half.
- VERIFYING AND REPORTING READY now forms at [[el-entrypoint]], on the
  architecture gate's ruling at i9. Nothing carried it before.

THE RISK STAYS OPEN. Naming an owner is not building one, and the check's
depth is undecided.
