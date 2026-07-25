---
id: se.raid-engine-iteration-cannot-self-demonstrate
kind: raid
statement: "An iteration that changes the ENGINE cannot demonstrate its change on its own ship: the running engine is trunk's, which predates the iteration, so the new behaviour only takes effect for the NEXT iteration. i5d hit this - its own close runs under the pre-split engine unless the close is driven deliberately from the built code. Not a defect, a bootstrap fact, and the same shape i5b recorded when it ran on trunk. It matters because it is easy to mistake a bootstrap-driven close for a genuine self-demonstration."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: assumption
raid_owner: agent
trigger: "Any iteration that changes the close, the loop or the bless path. Rule to apply: state plainly which engine performed the ship, and treat the FOLLOWING iteration's close as the first honest demonstration."
---


