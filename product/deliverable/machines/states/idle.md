---
state: idle
state_kind: work
filled_by: agent
legal: all
---

# Idle

Booted, no active process. The whole lane is legal.

## Guidance

Work through the `se` lane. Paths are root-relative to the project root.
When a call is refused, follow the typed remedy — recover in one turn.
When the session's work is finished and the user is done, `se_exit` closes
the session machine.
