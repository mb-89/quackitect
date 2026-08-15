---
minted_in: i1
id: exp-latency-ledger
type: "[[experiment]]"
statement: Does the serving path hold the one-second line today, measured over the recorded call log rather than remembered incidents?
probes:
  - raid-ar-call-answers-in-one-second
timebox: two hours
form: script
faked: none — the run aggregated the day's real recorded calls
fallback: the async round's ticket desk — a handle back fast, the work in the background
verdict: falls
measured: 2026-08-10 — 12 of 118 pulls broke the one-second line, worst 15.2 seconds on a full 28-state record re-entry; median call 11 ms; no background handle came back in any breach
folds_to: "raid-ar-call-answers-in-one-second re-grounded on the dated ledger and the stale 274 retired — the demand stands and is missed today"
promote: "none — the fix is the async round's ticket desk, chartered in the backlog"
source_refs:
  - rank-unknowns, the seeded pick
---

## Setup

One aggregation over the day's raw call log: every recorded call with a
duration, filtered to the serving verbs, percentiles and worst offenders
computed. The design-waits (the mirror's long-poll, the battery recording
its own wall clock) were excluded by name.

## Result

2026-08-10, over 1,596 recorded calls. The serving picture: 118 pulls,
12 over the one-second line, worst 15.2 seconds (a full 28-state record
re-entry), median call 11 ms.

The requirement allows a background handle instead of a fast answer; no
handle exists yet, so every breach is a plain breach. The stale
274-second number from the pre-stamp engine was retired from the register
in the same pass — today's worst is 18 times better, and still a miss.
