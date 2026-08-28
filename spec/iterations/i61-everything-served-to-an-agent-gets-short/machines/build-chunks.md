---
steps:
  - id: state-entry-form
    statement: Return an incomplete entered-state form from the successful post-sweep pull response.
    depends_on: []
    realization: software
  - id: session-guidance
    statement: Filter served guidance by session mode before it reaches an attended session.
    depends_on:
      - state-entry-form
    realization: software
  - id: blockers-only-stop
    statement: Keep blockers-only continuation active until the newest pull reports a blocker.
    depends_on: []
    realization: software
---
