---
id: se.req-depends-on-gate
kind: requirement
statement: When a planned iteration declares depends_on, se_loop_start shall refuse to open it while any dependency has not shipped, naming the unmet dependency.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Dependent work fires early against missing baselines - the plan's ordering stays decorative.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


