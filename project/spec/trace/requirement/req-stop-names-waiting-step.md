---
id: req-stop-names-waiting-step
type: "[[requirement]]"
statement: "When the walk stops at a step above the autonomy setting, the engine shall name the waiting step and what resumes it in the same answer."
kind: functional
verify_method: test
breaks_if_removed: "The person sees a stopped agent with no way to tell what waits or what resumes it."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 5
priority: should
---
