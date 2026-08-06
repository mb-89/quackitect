---
id: req-refusal-carries-remedy
type: "[[requirement]]"
statement: "When the engine refuses a call, it shall answer with a typed refusal whose remedy, executed unchanged, is accepted on the next call."
kind: interface
verify_method: test
breaks_if_removed: "A refusal becomes a dead end instead of a redirection, and the walk stalls on every wrong turn."
refines:
  - uc-take-a-step
  - uc-stay-recoverable
source_refs:
  - uc-take-a-step ext 3a
  - ".se/req-mine-v2.md: errors and refusals"
  - ".se/req-mine-v1.md: refusals and honesty"
  - uc-stay-recoverable step 2
  - uc-stay-recoverable ext 2a
  - ".se/req-mine-v2.md: errors and refusals (v2-062, v2-064, v2-066)"
  - stk-agent
  - uc-take-a-step step 3
  - ".se/req-mine-v1.md: the lane — mediated I/O"
  - "- \\\".se/req-mine-v2.md: the edit model and the file lane"
priority: must
---

## Detail

The refusal contract, whole:

- When the engine refuses a call, the engine shall return a typed rejection whose remedy, executed unchanged, is accepted on the next call.
- If an admitted call fails its precondition, then the engine shall refuse the call and leave the project unchanged.
