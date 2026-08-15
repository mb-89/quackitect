---
minted_in: i27
id: opt-restart-only-this-records-engine
type: "[[option]]"
statement: give each record its own engine process, so an engine change restarts that record's process alone and every other record keeps running the version it started with
cluster: cluster-the-walk
question: how a change to the engine's own code takes effect
found_by: transforming
source: "taking opt-one-process-per-record-rooted-by-the-os and asking what it does for a DIFFERENT row than the one it was found for"
---

## Mechanism

A record's engine is its own process, loading its code from that record's
tree. Change the code, that one process comes up again, and its next call
answers with the change in effect. No other process is touched.

WHY THE RESTART IS AFFORDABLE HERE, where a whole-machine reload is not. The
walk is resumable from the repository by construction - the pull recomputes
position from disk, and the reading is re-owed rather than lost. A restart
therefore costs a start-up, not a walk.

MEASURED START-UP, 2026-08-14: 67 ms cold per process, ~36 ms warm, with the
engine module load excluded from the measurement. What a full engine load
costs is unmeasured and is the number this option actually needs.

## What it inherits

The rooting answer comes free with it. A process started in the record's tree
resolves relative paths by the platform's own mechanism, so this option and
[[opt-one-process-per-record-rooted-by-the-os]] are the same machinery seen
from two rows.

## What it breaks

THE SHARED STATE, exactly as the rooting option records it. The mirror, the
claim ledger, the note inbox and the call log are machine-wide and single.
Several engine processes cannot each own them.

AND A VERSION SPREAD NOBODY READS. With N records open there are N engine
versions running, and nothing today shows which record runs which.
