---
id: req-packet-carries-the-step
type: "[[requirement]]"
statement: "When the walk stands on a state whose work is open, the engine shall answer the pull with one packet carrying the state's guidance, the legal tool set, and the owed evidence form."
kind: functional
verify_method: test
breaks_if_removed: "The driver guesses guidance and tools from memory, and the executor invents its own checks."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 2
  - ".se/req-mine-sebots.md: rumination — the failure the machine exists to cage"
  - ".se/req-mine-v2.md: errors and refusals"
priority: should
---

## Detail

## Detail

The packet carries, in one answer:

- the state's guidance — what the step asks for.
- the legal tool set — the only tools the work uses.
- the owed evidence form — every field named.
- the walk's position — where the work lands.
