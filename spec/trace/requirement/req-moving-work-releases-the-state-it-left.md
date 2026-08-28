---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-moving-work-releases-the-state-it-left
type: "[[requirement]]"
statement: When a piece of work is moved to another place, the system shall treat the state it left as released of it.
kind: functional
verify_method: test
breaks_if_removed: A state can freeze on one piece of work nobody standing there can finish, and the first state of every record deadlocks on the scope it was handed.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - raid-dec-completeness-beats-flow-at-a-position-boundary
  - "kickoff gate override one: a position is left when every token reaches a terminal status OR moves"
  - uc-work-a-states-work-tokens-to-completion extension 8a
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

MOVING IS A REAL EXIT, NOT A FAILURE. It sits beside done, cancelled,
rejected and skipped as a way the state stops owing the work.

IT IS ALSO WHAT MAKES THE KICKOFF WORK. A record opens holding scope that
belongs on later states. If moving did not release, the first state of every
record would deadlock on work it was never meant to do.

THE WORK IS NOT FINISHED BY MOVING. It becomes an open point wherever it
landed, and the destination owes it from that moment.
