---
minted_in: i1
id: dsp-call-log
type: "[[design-spec]]"
statement: every call appended with role and channel, carried by one jsonl log and the views that count it
realizes:
  - el-account
  - if-walk-engine-to-account
  - if-holding-pen-to-account
  - if-method-compiler-to-account
  - if-record-store-to-account
files:
  - project/deliverable/engine/failure-shapes.ts
  - project/deliverable/engine/calllog.ts
  - project/deliverable/engine/version.ts
  - project/deliverable/engine/survey.ts
---

## The acting role is stamped where the call is served

req-acts-carry-role-and-channel, and its reader half
req-the-actor-is-recorded-where-the-call-is-served.

A record carries `actor`, written by the handler that served the call — the
mirror's own POST table for a person's press, the dispatcher for a lane call,
and the server itself for a poll it made on its own behalf.

THE READER STOPS GUESSING. The feed drew the role from the tool's NAME prefix,
which was wrong for 52 records in one measured window and is wrong by
construction for every new server-side tool.

THE PREFIX RULE SURVIVES AS THE FALLBACK, for records written before the stamp
existed and for nothing else. History cannot be restamped, and a fix that
dropped the fallback would rewrite what it cannot know.

## Responsibility

The append-only account: every lane call lands raw with its actor role
and channel, refusals with their clause, verdicts with their run. The
log query serves it back by ref, by filter and by grouping; the survey
counts what stands open across records and notes.

## Behavior and constraints

- Append-only; the log is kept, never rewritten.
- Sessions and retro windows are derived from the records themselves.

## The one-second rule is the line

THE ONE-SECOND RULE IS THE LINE (req-call-answers-in-one-second; owner
 ruling 2026-08-09: a person's request over one second moves to the
 background and reports). Every outside door — the lane's dispatch and
 the mirror's — measures against this ONE number; slowness is mined from
 the one log with min_ms. A function, not a constant: the env test seam
 must work after the module has loaded.

## The live files ceiling

THE LIVE FILE'S CEILING. Roughly ten thousand records at the size this
 log actually runs to (owner ruling 2026-08-09: cap it at ten thousand).
 It is measured in BYTES because a byte is one stat call and a line count
 is a full read — and reading the log to decide whether the log is too big
 to read is the joke this whole change exists to stop.

## Rotate by rename

ROTATE BY RENAME, NEVER BY REWRITE (owner ruling 2026-08-09).

 Trimming a JSONL to its last N lines means reading and rewriting the
 whole file. That is the same synchronous cost this is removing, paid on
 every rotation instead of every query, and a process that dies mid-write
 leaves the log torn — the one file that must survive a crash.

 A rename is one filesystem operation and it is atomic on the same
 volume. The live file starts empty; the old one keeps every byte.

 NOTHING IS EVER DELETED HERE. The standing ruling is that the raw log is
 kept forever-until-1GB, and the owner reaffirmed it: at a gigabyte we
 TALK about the old records rather than a collector quietly eating them.

## The whole-log parse was the server killer

THE WHOLE-LOG PARSE WAS THE SERVER KILLER (2026-08-09). query() parsed
 every line of the log on every call, synchronously, on the single
 event loop — at tens of megabytes that is seconds of silence, and the
 MCP socket dropped mid-call six recorded times in two days. A line is
 ruled out by SUBSTRING before it is parsed — the same trade find()
 makes — so a filtered query parses only its own records. The parsed
 checks stay as the exact half of the answer.

## The last session

THE LAST SESSION, READ OFF THE LOG (owner ruling 2026-08-07).

 THIS REPLACES THE WRITTEN HANDOVER. The old one had a gate at the `end`
 state, so a session that simply stopped — the host closed, the person
 walked away — never wrote one. The owner named that plainly: they kill
 the session, so there was never a handover. A briefing nobody writes is
 worth less than one nobody has to.

 THE LOG ALREADY KNOWS. Every call lands here with its verdict, so the
 last session can be described rather than remembered. It cannot go
 stale, it cannot be forgotten, and it costs the reader nothing.

 ONLY THE TAIL IS PARSED. Splitting a few megabytes of text is cheap;
 JSON.parse of every record is not, and this runs during boot. The same
 trade find() already makes one line at a time.

 SESSIONS ARE TOLD APART BY A GAP. There is no session id in the record
 and adding one would only describe sessions written after the change.
 A quiet stretch is what actually separates two sittings.
ONLY THE TAIL IS PARSED. Splitting a few megabytes of text is cheap;
 JSON.parse of every record is not, and this runs during boot. The same
 trade find() already makes one line at a time.
