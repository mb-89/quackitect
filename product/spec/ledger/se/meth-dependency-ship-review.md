---
id: se.meth-dependency-ship-review
kind: method
statement: "The ship review: flip each import-or-vendor decision consciously, flag divergence, deposit upstream proposals - sticky rulings keep it short forever."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
---

## Situation
M9's ship_review. Ship is the sync point of the dependency layer: pull happened at start, push happens here.

## Procedure
- Display the full dependency list: mode (import or vendored), ruling, divergence state.
- Ask ONLY where no sticky ruling exists or the state changed: a new import, a new divergence.
- A diverged vendored dependency triggers the push-back ask: offer the modifications upstream, or keep the fork - shipping a fork is a fact the receiver should know, so it ships flagged.
- Upstream offers travel as proposal bundles (diff, rationale, base version) into the upstream project's inbox - offered, never pushed.
