---
id: it.machine-rank-unknowns-sp1-poll-timeout
kind: machine_state
statement: "Spike 1 (10 min): an abort-timeout bounds a hanging transport read - the S4 guard the whole in-board poll rests on."
machine: it.machine-rank-unknowns
state: sp1_poll_timeout
state_kind: work
filled_by: agent
---

## Guidance
Stand up a hanging local HTTP server; fetch it with AbortSignal.timeout(short); confirm the call rejects within the bound rather than blocking. Pass = bounded rejection. Fail = record what mechanism to use instead (a manual timer + abort).

## Evidence form
- run_ref | the spike's run | required
- verdict | held or broke, one breath | required
