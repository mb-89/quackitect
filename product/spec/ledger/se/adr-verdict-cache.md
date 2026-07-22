---
id: se.adr-verdict-cache
kind: decision
statement: Test verdicts live in ONE JSON map in the data home, atomically rewritten per battery, keyed test id to full input hash + build identity + verdict + duration. Chosen over an append-only log (needs compaction, history is not required) and over spec residency (caches are never truth).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0010_engine_workshop
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
v2_amendment: build-identity mechanism
---

## Rationale (not load-bearing)
Status was slow because every check re-ran its tests.
A cache lets a verdict be reused until its input or the engine changes.
An append-only log was rejected, because it needs compaction and the history is not needed.
Spec residency was rejected too, because a cache is never truth and the repo must stay cache-free.
So one JSON map lives in the data home, rewritten atomically per battery.

## v2 amendment (applied at mint)

build-identity mechanism
