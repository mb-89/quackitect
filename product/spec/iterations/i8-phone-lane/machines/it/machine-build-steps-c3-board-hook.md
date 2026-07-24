---
id: it.machine-build-steps-c3-board-hook
kind: machine_state
statement: "c3 the board hook (E5): the board process constructs the PhoneLane with the real transport, calls announceOffer at the offer seam and pollAnswers each tick, wrapped so a lane error never breaks the tick."
machine: it.machine-build-steps
state: c3_board_hook
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts + board-html. bin/se-board.ts: build a PhoneLane(root, new NtfyTransport(config)) when phone config is present; call pollAnswers() inside the state.json poll (or a sibling interval), announceOffer() when an offer appears; every lane call try/caught so the board keeps ticking (best-effort). This is server-side node in the board binary, not page JS. Greens nothing new by itself - it wires the tested core into the live board; verified by the board test still passing.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
