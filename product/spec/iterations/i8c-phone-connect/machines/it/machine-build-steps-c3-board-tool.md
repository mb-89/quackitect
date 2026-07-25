---
id: it.machine-build-steps-c3-board-tool
kind: machine_state
statement: "c3 the board tool: a phone-connect icon in the header tools strip; clicking it renders the pairing QR in the details pane over a /connect route."
machine: it.machine-build-steps
state: c3_board_tool
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. bin/se-board.ts: a centered #tools strip in the header (📲, the first tool), a /connect POST route calling phonePairingQR, and a client renderer painting the boolean matrix as an SVG QR into the details pane with the caption 'Scan this QR code to link via ntfy.'. No modal - click-for-detail. Greens the board test.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
