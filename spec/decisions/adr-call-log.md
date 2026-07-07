---
id: adr-call-log
type: adr
adjudicated_by: human
statement: Engine calls append one redacted line each to calls.jsonl in the logs home. Retention is retro-bound (owner ruling 2026-07-04) - the retro aggregates the log, then deletes it. No rotation machinery. Chosen over per-day files (retro aggregation reads one file) and SQLite (zero-dep).
class: review
killer: false
---
## Rationale (not load-bearing)
The log exists FOR the retro (review.md step 6). Once aggregated it has served its purpose;
deleting it at that point keeps the data home lean and makes retention a process fact, not a
tuning knob. Between retros the file grows unbounded in theory — in practice a retro opens
every engage start, so the window is one iteration.
