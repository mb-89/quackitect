---
id: se.adr-call-log
kind: anti_decision
statement: Engine calls append one redacted line each to calls.jsonl in the logs home. Retention is retro-bound (owner ruling 2026-07-04). The retro aggregates the log, then deletes it. There is no rotation machinery. This was chosen over per-day files, since retro aggregation reads one file, and over SQLite, to stay zero-dep.
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
graveyard: "true"
p3_note: "OWNER RULING: superseded. Log everything raw through the single call path; at ~1 GB surface a cleanup decision (keep/compact/delete), never auto-delete. Retro-bound deletion anti-kept with the measured loss: the raw v1 call log is gone; P5 counts are lower bounds."
---

## Rationale (not load-bearing)
The log exists FOR the retro (review.md step 6). Once aggregated it has served its purpose;
deleting it at that point keeps the data home lean and makes retention a process fact, not a
tuning knob. Between retros the file grows unbounded in theory — in practice a retro opens
every engage start, so the window is one iteration.

## Graveyard note (why-not, queryable)

OWNER RULING: superseded. Log everything raw through the single call path; at ~1 GB surface a cleanup decision (keep/compact/delete), never auto-delete. Retro-bound deletion anti-kept with the measured loss: the raw v1 call log is gone; P5 counts are lower bounds.
