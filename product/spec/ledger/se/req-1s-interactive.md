---
id: se.req-1s-interactive
kind: requirement
statement: When an admitted session issues any se call, the engine shall respond within 1 second, or immediately return a background handle whose completion is observable.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
verify_method: test
---

## Rationale
The working rhythm dies on slow calls; v1 carried a 1-second upper limit per operation. First measured offender in v2 (retro 2026-07-24, 840-call log): engine-filled states run their command inline in the loop's next() - a verify suite holds the submit for ~5s. i3 moves engine-filled commands to background runs.

## Verification
- verify_method: test - a timing guard over the dispatch path; a command exceeding the budget must return a handle, never block the call.
