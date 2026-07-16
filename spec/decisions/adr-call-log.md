---
id: adr-call-log
decided_in: i0010_engine_workshop
type: adr
adjudicated_by: human
statement: Engine calls append one redacted line each to calls.jsonl in the logs home. Retention is retro-bound (owner ruling 2026-07-04). The retro aggregates the log, then deletes it. There is no rotation machinery. This was chosen over per-day files, since retro aggregation reads one file, and over SQLite, to stay zero-dep.
class: review
killer: false
---
## Rationale (not load-bearing)
The log exists FOR the retro (review.md step 6). Once aggregated it has served its purpose;
deleting it at that point keeps the data home lean and makes retention a process fact, not a
tuning knob. Between retros the file grows unbounded in theory — in practice a retro opens
every engage start, so the window is one iteration.
