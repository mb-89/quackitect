---
id: it.machine-build-steps-c1-qr-encoder
kind: machine_state
statement: "c1 the QR encoder: encodeQR(text) -> a boolean module matrix, the one engine-facing surface over the vendored qrcode-generator."
machine: it.machine-build-steps
state: c1_qr_encoder
state_kind: work
filled_by: agent
---

## Guidance
Realization: vendor. engine/vendor/qrcode.ts: qrcode-generator@1.4.4 (Kazuhiko Arase, MIT) copied verbatim (UMD footer -> ESM export), @ts-nocheck, loud credit header; encodeQR wraps it. Zero runtime node_modules - node type-strips the .ts. Greens the QR finder-pattern check (R3).

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
