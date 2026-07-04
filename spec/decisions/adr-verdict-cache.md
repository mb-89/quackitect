---
id: adr-verdict-cache
type: adr
addresses: [req-verify-cache]
adjudicated_by: human
statement: Test verdicts live in ONE JSON map in the data home, atomically rewritten per battery, keyed test id to full input hash + build identity + verdict + duration. Chosen over an append-only log (needs compaction, history is not required) and over spec residency (caches are never truth).
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
