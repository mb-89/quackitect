---
id: req-ifu-base-state
type: requirement
depends_on: []
statement: The book shall define the idle starting state once in a setup IFU that every other IFU references as its start.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Design decision (owner, 2026-07-17)

- The starting state is an idle state, the same for every IFU.
- One IFU named "setup" describes the path from a fresh machine to quackitect running.
- Every other IFU references that state as its start, rather than restating it.
- Exception: the five-minute Pong walkthrough starts completely fresh, from nothing to Pong.

## Rationale (not load-bearing)
Defining the base state once keeps every IFU short and consistent. A reader learns the idle state once, then each IFU begins from it.
