---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-engine-delta-to-account
type: "[[interface]]"
statement: A record's override that no longer applies to trunk is reported as divergence, never composed into a mixture.
source: el-engine-delta
destination: el-account
carries:
  - flow-divergence-report
form: append
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-diverged-trees-reported-never-merged
---

## Reported, never merged

That rule already binds diverged trees and it binds
this for the same reason: a composition assembled from two sides that
disagree is a machine nobody wrote.

## What crosses

The record, the file, the trunk revision the override was
written against, and the trunk revision it now faces.

## When it fires

At entry, when the supervisor rebases the delta. A divergence
stops the record starting, and this is the durable account of why.

## Why it goes to the account and not only to the person

A record that will not
open is exactly the situation where somebody needs a history afterwards, and
a message on a screen that is gone is not one.
