---
id: req-walk-survives-host-swap
type: "[[requirement]]"
statement: When the project is reopened under a different supported host, the engine shall serve the walk from the same recorded position with zero host-specific repair steps.
kind: quality
verify_method: demonstration
breaks_if_removed: Work is welded to one harness, and a host change strands mid-flight iterations.
breaks_how_badly: crippling
refines:
  - uc-quality-flexibility
source_refs:
  - uc-quality-flexibility step 5
  - uc-quality-flexibility ext 5a
  - ".se/req-mine-v2.md: worktrees and parallel streams (v2-017)"
  - the serial-read retreat, observed 2026-07-31
priority: should
weighs_against:
  - req-trace-view-derived-from-files >
---

## Detail

- The lane's rules are one list; each supported host arms it its own way.
- A host defect met mid-walk takes a recorded retreat with a lifting condition; the serial-read retreat of 2026-07-31 is the precedent.

## Scenario

- source: the person changing machine or harness
- stimulus: the project opens under a different supported host
- artifact: the walk position and the lane's rules
- environment: mid-iteration, position committed to the branch
- response: the same lane rules arm, and a pull serves the position the previous host left
- response measure: host-specific repair steps = 0; positions lost across a swap = 0
