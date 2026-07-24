---
id: it.machine-build-steps-c1-lane-core
kind: machine_state
statement: "c1 the lane core (E1+E3+E4): config loader, announceOffer, pollAnswers with hash-match bless/dismiss + idempotent cursor - all against the injected Transport interface."
machine: it.machine-build-steps
state: c1_lane_core
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/phone.ts: the Transport interface + PhoneAnswer type, PhoneLane reading seDir/phone.json (graceful-absent), announceOffer (config gate, build brief+actions with id=offer hash, publish, swallow failures), pollAnswers (pollSince from a cursor, match id to Gate.current().base_hash, bless channel=phone or dismiss, advance the answered cursor, ignore strays). Greens the publish/bless/dismiss/idempotent/graceful/secret tests.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
