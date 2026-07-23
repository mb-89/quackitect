---
id: se.machine-systematic-reverse-sensitivity
kind: machine_state
statement: "Reverse the sensitivity: find the first plausible world where the winner loses."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: reverse_sensitivity
state_kind: work
filled_by: agent
---

## Guidance
Per [[meth-pugh-convergence]]: perturb weights (engine-computed where available), hunt the losing world, judge its credibility out loud. A credible flip becomes a RAID tripwire with its fallback ([[meth-raid]]) - never a silent dismissal.

## Evidence form
- sensitivity | robust, or weight-sensitive with the flip conditions | required
- tripwires | the credible flips as RAID watch-items, or none | required
