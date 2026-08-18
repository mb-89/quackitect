---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: uc-see-the-whole-pool-from-any-clone
type: "[[use-case]]"
statement: Ask what the project could do next and be offered every standing option, whichever machine parked it.
actor: stk-engineer-driving-agents
trigger: somebody asks what to do next, or a record needs its scope filled
precondition: the clone has trunk
guarantee: the answer includes every option standing in the pool, each with its statement and its re-entry condition, and no machine-local store is consulted
refines:
  - sty-see-what-the-other-machine-may-pull-from
priority: must
---

## Why this is its own use case

uc-get-work-routed COVERS THE ROUTING, not the source. Its subject is the desk
recommending a vehicle on the person's word. It is indifferent to where the
open work came from, and it would pass unchanged over a pool nobody could see.

THIS ONE IS ABOUT THE SOURCE BEING COMPLETE. Its guarantee is the one thing the
routing cannot check for itself: that the list is not one machine's worth.

## Main scenario

1. The person asks what stands open.
2. The system reads the standing options from the repository.
3. The system reads the open records the same way.
4. The system answers with both, each option carrying its statement and its
   re-entry condition.
5. The person picks one and commits to it, or leaves it standing.

## Extensions

- 2a. A machine-local store still holds undrained captures. They are NOT in
  the answer and must not be — an undrained note has not been judged, and the
  answer is a list of options rather than a list of everything anybody typed.
  The count of what is pending locally is a separate signal and stays one.
- 2b. The pool is large enough that the answer cannot carry it whole. It is
  windowed and says so, rather than being silently cut.
- 4a. An option's re-entry condition has already come true. Nothing detects
  that today, so it reads like any other standing option and a person notices
  or does not. Named rather than solved.
- 5a. The person is an AGENT filling a record's scope. It needs the same list
  as facts rather than as prose, from the same source, or the two answers
  disagree.

## What this use case deliberately does not cover

THE PLAN FILE. `project/spec/version-planning.md` is a hand-kept list standing
in for this, and retiring it is a non-goal of the record that mints this node.
So both stand for now, and a reader is offered the pool BESIDE the plan rather
than instead of it.
