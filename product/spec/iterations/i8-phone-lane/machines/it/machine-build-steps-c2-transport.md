---
id: it.machine-build-steps-c2-transport
kind: machine_state
statement: "c2 the real transport (E2): NtfyTransport over fetch - PUT publish with X-Actions, since-poll read, AbortSignal.timeout bound, token held out of any logged object."
machine: it.machine-build-steps
state: c2_transport
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. NtfyTransport implements Transport against a base URL: publish PUTs the message with the X-Actions header (adr-ntfy-actions), pollSince GETs the since-poll; both wrap the fetch in AbortSignal.timeout (the promoted sp1 pattern); the token lives only in the Authorization header construction, never in a returned or logged object (S2 duty). Greens the bounded-read test.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
