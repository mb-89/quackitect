---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-work-records-when-it-opened-and-when-it-closed
type: "[[requirement]]"
statement: "The system shall record on every piece of work the time it opened and the time it reached a terminal status."
kind: functional
verify_method: inspection
breaks_if_removed: "Nothing can say how long a state took or which piece of work dominated it, and a design whose exit rule makes a state as slow as its slowest piece cannot be measured at all."
breaks_how_badly: corrosive
refines:
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "uc-read-what-the-system-owes-and-what-it-is-doing step 8"
  - raid-dec-completeness-beats-flow-at-a-position-boundary
priority: should
weighs_with:
  - none
weighs_against:
  - req-one-word-names-one-thing-and-the-walks-marker-is-not-a-token > timestamps are read by every account of how long work took; the naming rule is general house style rather than a demand this system rests on
  - none
---

## Detail

THE EXIT RULE IS WHY THIS ROW IS A `must`. A state's elapsed time is its
slowest piece of work rather than its average, and anybody measuring state
time has to read it that way. Without the two stamps there is nothing to
read.

IT ALSO FEEDS THE RETRO. Per-state cost is already computable from the call
log; per-piece cost is what this adds, and it is the finer grain the retro's
milestone table has never had.

TWO STAMPS AND NOT A HISTORY. This row asks for the open and the close.
Whether every intermediate move is kept is the design's to choose.
