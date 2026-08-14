---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-resolution-seam-to-account
type: "[[interface]]"
statement: Every resolution the seam performs is recorded with the store it resolved against, so a wrong tree is visible in the log rather than at a merge.
source: el-resolution-seam
destination: el-account
carries:
  - flow-resolved-target
form: append
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-a-resolution-is-proven-by-read-back
  - req-a-write-lands-where-it-is-meant
  - req-every-call-logged
---

The seam decides WHICH TREE answers. That decision is the one a reader cannot
check by eye, because the same path reads identically against every tree, so
it is the one the account has to carry.

## What crosses

`flow-resolved-target`: the path as the caller wrote it, the absolute path it
resolved to, and the STORE that answered.

The store is the load-bearing part. An answer that cannot name its store is an
answer nobody can check, and the same clause rides the core-to-satellite
crossing for the same reason.

## Why this crossing was missing

IT WAS ALWAYS THERE IN INTENT AND NEVER DECLARED. `keep-the-record` listed
`flow-resolved-target` among its inputs, so the crossing existed in the
function structure from the moment the seam was designed.

Nothing caught it because the file carrying that list had TWO `inputs:` keys
and did not parse as YAML. The allocation check cannot see a crossing in a
file it cannot read, so it reported nothing at all.

Fixing the duplicate key on 2026-08-14 made the crossing visible, and
`decompose-structure` fell the moment it was. THE CHECK WAS RIGHT AND SILENT,
which is the worse of the two ways to be wrong.

## Why it is an append and not a call

The seam resolves inside every lane call, and a resolution that had to wait
for an acknowledgement would put the account on the hot path of every read.
`exp-channel-cost` measured a direct append at 124.7 microseconds against 144
for an acknowledged crossing; neither is free, and only one of them is
optional.

So the seam appends and does not wait. A resolution nobody logged is a
resolution nobody can audit, but a resolution that BLOCKS on logging makes
every read cost the log.
