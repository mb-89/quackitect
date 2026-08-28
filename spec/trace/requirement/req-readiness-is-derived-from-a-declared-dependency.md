---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-readiness-is-derived-from-a-declared-dependency
type: "[[requirement]]"
statement: Where a piece of work declares a predecessor, the system shall withhold that work until the outcome its edge names has been reached, and shall offer work declaring no predecessor at once.
kind: functional
verify_method: test
breaks_if_removed: Order inside a state can only be written as prose nobody reads, so two things that must happen in sequence happen in whatever order a hand picks.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - uc-work-a-states-work-tokens-to-completion step 5 and extensions 5a to 5d
  - "kickoff goal: a token may depend on another token, or on a position finishing"
  - "prior art: Beads derives its ready list from a dependency graph; Argo keys on a predecessor's outcome rather than its completion"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THE EDGE CARRIES TWO THINGS, AND THE SECOND IS THE ONE PRIOR ART ADDED.

| what the edge points at | what the edge demands |
| --- | --- |
| another piece of work | that piece finished |
| another piece of work | that piece merely no longer open, however it settled |
| a state | that state finished |

MOST WORK CARRIES NO EDGE and is offered straight away. Readiness is derived
where an order was written down and assumed everywhere else.

SEVERAL PIECES OFFERED AT ONCE IS THE ORDINARY CASE. The hand takes them in
whatever order it likes, and the marks each carries say which matter most.

WHY THE OUTCOME KIND MATTERS HERE. This design has several terminal
statuses, so a piece of work can reasonably wait on another being settled
either way rather than specifically done.
