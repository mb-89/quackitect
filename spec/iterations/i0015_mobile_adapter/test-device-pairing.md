---
id: test-device-pairing
type: test
statement: A device pairs in one operation with a QR-rendered subscribe link and the safety disclaimers.
class: executed
verify: selftest:pair-qr pairing
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The pairing output renders a structurally valid QR matrix (finder, timing, format) encoding the subscribe link, beside the plain link. *(was test-pair-qr)*
2. One pairing operation mints the credential and prints the disclaimer and the lockscreen instruction. *(was test-pairing)*
