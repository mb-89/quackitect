---
id: adr-tests-red-mechanism
type: adr
addresses: [req-tdd-sequence]
adjudicated_by: human
statement: RED is observed durably by a run-once attestation — record the observed-failing test hashes before the build; a test-hash change re-suspects it — chosen over re-running the suite (which cannot see a past red once green). Reuses the existing attestation+suspect machinery. Full ADR + M5 spike.
depends_on: []
class: review
killer: true
---
