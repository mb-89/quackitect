---
id: adr-verdict-cache
decided_in: i0010_engine_workshop
type: adr
adjudicated_by: human
statement: Test verdicts live in ONE JSON map in the data home, atomically rewritten per battery, keyed test id to full input hash + build identity + verdict + duration. Chosen over an append-only log (needs compaction, history is not required) and over spec residency (caches are never truth).
class: review
killer: false
---
## Rationale (not load-bearing)
Status was slow because every check re-ran its tests.
A cache lets a verdict be reused until its input or the engine changes.
An append-only log was rejected, because it needs compaction and the history is not needed.
Spec residency was rejected too, because a cache is never truth and the repo must stay cache-free.
So one JSON map lives in the data home, rewritten atomically per battery.
