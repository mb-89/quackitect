---
minted_in: i36
id: req-repeated-failure-shape-becomes-durable-work
type: "[[requirement]]"
statement: While an iteration window is open, when a non-misuse failure shape recurs across lane calls, the system shall record it as iteration evidence or a RAID entry naming an owner and a trigger.
kind: functional
verify_method: test
breaks_if_removed: Repeated failures stay local recovery noise and the same failure shape can recur in a later session with no durable record.
breaks_how_badly: corrosive
refines:
  - uc-route-failed-calls-into-improvement
source_refs:
  - raid-failed-tool-calls-stay-local
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

- A single fatal occurrence routes immediately; it does not wait for a repeat (uc extension 4a).
- A shape counted as clear agent misuse is tallied without becoming product work by itself (uc extension 2a).
- The count is per active iteration window, using the recorded call log — never a private tally the log cannot reproduce.
