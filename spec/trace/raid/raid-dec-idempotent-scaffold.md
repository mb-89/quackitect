---
unreachable_refs:
  - cand-thin-worktree
minted_in: i1
id: raid-dec-idempotent-scaffold
type: "[[raid]]"
kind: decision
statement: Scaffolding is idempotent with drift detection — a re-run converges and reports, never overwrites.
owner: the maintainer
trigger: a scaffold run reporting drift nobody expected
status: decided
impact: Wrong, hand-edited files get silently overwritten on the next scaffold run.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - opt-idempotent-scaffold-with-drift-detection
  - cand-thin-worktree
  - req-scaffold-from-template
  - req-overlay-drift-reported
  - req-overlay-survives-update
---

Setup and update share one mechanism: converge the tree toward the template
and report what differs. Drift is a report, never a merge.

## Rejected options

- [[opt-one-command-install]] — a one-shot installer with no converge story
  for the second run.
- [[opt-no-installer-clone-the-template]] — cloning leaves every later
  update to hand work.

## Consequences

- The scaffold may run at any time without fear.
- An overlay edit survives an update, and the drift report names it.
