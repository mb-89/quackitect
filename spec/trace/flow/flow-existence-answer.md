---
minted_in: i62-background-work-reports-its-own-end-the-
id: flow-existence-answer
type: "[[flow]]"
statement: whether a piece of work the session started is still there, asked of the work itself rather than inferred from what it last said
kind: signal
crosses: in
source_refs:
  - req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
  - fn-run-a-governed-walk.keep-the-account-true
---

## What it holds

One answer per piece of work still recorded as under way: it is there, it is
gone, or the question could not be asked at all.

## Why the third value is not an edge case

A design where the question cannot be asked is a real design, and on one
platform it may be the only one available. Folding that into "gone" would end
work on a machine that could not answer rather than on a machine where the
work had ended.

## What it is not

It is not a report of progress. A piece of work that is there and has said
nothing for an hour produces the same answer as one that is there and busy.

It is not an outcome either. `flow-settled-entry` is what this answer can cause
to be written, and only when the answer is that the work is gone.
