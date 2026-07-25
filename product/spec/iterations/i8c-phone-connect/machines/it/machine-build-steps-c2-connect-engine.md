---
id: it.machine-build-steps-c2-connect-engine
kind: machine_state
statement: "c2 the connect engine: connectPhone mints a topic pair, encodes the ntfy:// deep link, atomically writes phone.json; phonePairingQR reuses-or-creates for the board."
machine: it.machine-build-steps
state: c2_connect_engine
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/connect.ts: connectPhone (encode FIRST then temp-then-rename write, so an encode failure leaves no partial config), phonePairingQR (reuse an existing pairing else create), phoneConfigPath re-exported from phone.ts (one path home). The QR encodes ntfy://<host>/<topic> - it opens the app; an https link opens only the browser (v1's ruling, ask.go). Greens R1/R2/R5.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
