---
id: req-pair-qr
type: requirement
depends_on: []
statement: The engine shall render the pairing subscribe link as a scannable QR code in the console at pairing.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner ruling 2026-07-09: no typing topic names. Hand-rolled QR (byte mode, ECC-L, single-block versions) - the zero-dep law forbids a library, and the topic is a CREDENTIAL: it never leaves the machine to be encoded by a service. The plain link prints beside the code.
