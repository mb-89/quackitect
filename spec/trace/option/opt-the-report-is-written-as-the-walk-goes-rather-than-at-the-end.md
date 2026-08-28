---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-report-is-written-as-the-walk-goes-rather-than-at-the-end
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how an incomplete run is treated
found_by: transform
statement: Each state's cost is recorded as that state completes, so a run that never reaches its end still leaves everything it measured.
source: "SCAMPER — Rearrange, applied to filling the report: move the writing from after the walk to during it"
---

## What it answers

A run that dies — the box is reclaimed, the walk wedges, the agent runs out —
currently leaves nothing, because the report is filled at the stop point.

## Why it matters more here than it looks

Where the machine stops an agent is precisely what this iteration exists to
measure. The runs that fail are the most interesting ones, and they are exactly
the runs that would produce no report.

## What it costs

A partial report is a corpus node in an incomplete state, and the report
requirement demands every condition be present. The conditions are known at
bind time, so this works only if they are written first.

## Mechanism

Conditions written when the run binds. Per-state cost appended as each state
signs. The stop point and reached state written last, or left absent to mean
the run did not finish.
