---
id: se.machine-session-ended
kind: machine_state
statement: The session ended; a new boot starts a new session.
provenance:
  iteration: i2f-machines-are-canvases
  ai_involvement: agent-drafted
machine: se.machine-session
state: ended
state_kind: terminal
filled_by: agent
---

## Guidance
Sessions are per-process: a reconnect or a fresh shell boots again, by design.
