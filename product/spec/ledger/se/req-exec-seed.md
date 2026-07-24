---
id: se.req-exec-seed
kind: requirement
statement: When a seeding state completes, the executor shall instantiate the iteration's declared sub-machine and run it to its terminal before the dependent state activates.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Candidate sets, spikes and build chunks stay prose lists instead of parallel machine runs.
req_kind: functional
verify_method: test
source_refs:
  - se.machine-systematic
---


