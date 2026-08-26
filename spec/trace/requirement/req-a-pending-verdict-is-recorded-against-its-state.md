---
minted_in: i51-work-running-out-of-sight-reports-itself
id: req-a-pending-verdict-is-recorded-against-its-state
type: "[[requirement]]"
statement: While a state's leaving check is running, the product shall record that a verdict is owed against that state, and shall report that condition to every reader of the state's standing.
kind: functional
verify_method: test
measure: every reader of a state's standing returns the owed condition as its own answer, distinct from passed and from not-yet-attempted, on 100% of readers
breaks_if_removed: A state with a check still running is indistinguishable from one that never attempted to leave, so a gate below it reads a green it has not earned.
breaks_how_badly: crippling
priority: must
refines:
  - uc-leave-a-state-whose-check-is-still-running
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - raid-risk-a-hop-that-finishes-later-makes-green-ambiguous
  - stk-agent
---

## Detail

THE READERS ARE NAMED, because a demand about "every reader" that names none is
unverifiable.

| reader | what it asks today | what it must ask after |
| --- | --- | --- |
| a gate | are my feeders green | are my feeders green, and is any of them still deciding |
| the route drawer | which hops already pass | which hops already pass, and which are deciding |
| the state's own standing | passed or not | passed, not, or deciding |

EACH ROW BINDS. A reader that treats the owed condition as passed lets a gate
through on evidence that does not exist. A reader that treats it as failed
refuses a walk that has done nothing wrong.

WHY THIS IS A SEPARATE ROW from the one that stops the call being held. They
verify differently. That one is measured with a clock on one call. This one is
measured by asking each reader what it returns, with no clock involved.

WHAT THIS ROW DOES NOT DECIDE. Which answer each reader should GIVE its own
caller when the condition is owed. That is the design's, and the row demands
only that the condition reaches them distinctly rather than being flattened.

THE PROMISE PREDATES THE ROW. `uc-quality-performance-efficiency` step 4 has
said since i1 that a call which will take longer than its bound hands off
rather than blocking. This is the machinery that makes the handing-off safe.
