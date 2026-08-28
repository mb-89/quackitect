---
unreachable_citations:
  - claims.test.ts
minted_in: i12
id: raid-iss-a-bound-record-records-no-test-timings
type: "[[raid]]"
kind: issue
statement: A battery run inside a bound record writes no timing record anywhere the lane can read.
owner: the driving agent
trigger: a green battery leaves .se/test-timings.jsonl and .se/test-progress.jsonl unchanged
status: open
impact: The one path believed to record test cost does not record it while a record is bound. Every ranking of what to speed up therefore comes from the last run that happened on trunk, and it goes stale silently.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-scoped-run-records-its-timings
  - raid-asm-battery-timings-measure-work
  - raid-iss-record-entry-levels-method-not-spec
  - i12
---

## What was observed

Two full battery runs on 2026-08-15, inside the bound record i12. Both
green: 1301 tests, 1301 pass, 0 fail, biome and preflight clean.

Three files should have moved and none did.

| file | expected | actual |
| --- | --- | --- |
| .se/test-timings.jsonl | appended, one line per case | 260284 lines before and after, same hash |
| .se/test-progress.jsonl | rewritten at run start | still stamped 2026-08-14T20:20:55.722Z |
| .se/test-last-run.json | replaced per run | still stamped 2026-08-14T20:20:55.908Z |

The record's own worktree holds no `.se` directory at all, checked on
disk rather than through the lane, because the lane rewrites every `.se`
path to the machine root and so cannot answer that question about
another tree.

## Why it is worse than the scoped-run hole

`req-scoped-run-records-its-timings` names a known gap: a scoped run
attaches only the TAP reporter and keeps nothing.

The battery was the path that DID record. It attaches
`test-timings.mjs` beside the spec reporter, and 260284 lines of history
prove it worked before.

So the gap nobody knew about is the one in the mechanism everybody
trusted.

## What this costs the record that found it

This iteration ranked its work by `.se/test-last-run.json`: a 76985 ms
wall, and one `claims.test.ts` case at 75218 ms.

That file is from 2026-08-14, on trunk, before a sixty-nine-commit merge.
It has not moved since, and two runs today could not move it.

`raid-asm-battery-timings-measure-work` asks whether those numbers
measure work or contention. This entry says something narrower and more
urgent: they do not measure TODAY at all.

## The two candidate mechanisms, neither confirmed

DIAGNOSE BEFORE FIXING. A confident wrong mechanism is what this class of
defect already produced once, in the packager outage of 2026-08-13.

- THE ROOT THE REPORTER COMPUTES. `test-timings.mjs` takes
  `ROOT = join(process.cwd(), "..", "..")`, with a comment saying selftest
  runs with cwd = deliverable. If the run's cwd is the record's
  tree, the records land in a `.se` under the worktree. No such directory
  exists, so either this is wrong or the write is failing silently.
- THE REPORTER NEVER ATTACHING. `selftest.ts` builds the reporter path
  from its own `--root`. A path that does not resolve would leave the run
  green and the record unwritten, and every write in that file sits inside
  a try that swallows its error.

BOTH ARE SILENT BY CONSTRUCTION, which is the real defect underneath: a
bookkeeping write that must never fail the suite currently cannot report
that it failed either.

## What would close it

The write is allowed to fail. It is not allowed to fail quietly.

A run that recorded no timings says so in its own verdict, in the same
answer that reports the pass count.
