---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: tsp-the-mint-crosses-the-boundary
type: "[[test-spec]]"
statement: A drain to the pool authors a durable option and leaves the raw note where it is, verified by test over the mint's four demands.
method: test
verifies:
  - req-draining-to-the-pool-mints-an-option-on-trunk
  - req-a-minted-option-is-authored-never-the-note-s-own-text
  - req-a-minted-option-says-what-it-is-and-when-it-comes-back
  - req-the-raw-note-stays-local-and-is-marked-drained
files:
  - tests/pool-mint.test.ts
---

## Scope

The crossing itself: what a drain to the pool writes, what it refuses, and what
it leaves untouched. The privacy line is the load-bearing part and it gets the
most cases, because it is the only FATAL row in the delta.

## Approach

Component level, fault-based on the refusals and example-based on the happy
path. Every case builds its own throwaway root with its own note store, so no
case can see another's state — which is what makes the file concurrent.

THE ORACLE IS THE FILE ON DISK, never the return value alone. A mint that
answers correctly and writes nothing is exactly the failure a return-value
assertion misses.

## Steps

Every case in the referenced file is one step and its name states the claim.
The load-bearing steps:

- a drain to the pool writes an option node, and the node carries the
  statement, the re-entry condition and the note's ref
- the raw note is still on disk afterwards, byte for byte, and marked drained
- a statement that appears verbatim in the note is REFUSED, and the refusal
  quotes the overlapping text back
- a statement that merely shares words with the note is ACCEPTED — the check
  recognises a run, not a vocabulary
- an empty statement is refused, and so is a missing re-entry condition
- a statement saying the option cannot be stated cleanly yet is ACCEPTED, and
  the option stands as an open question
- nothing is written when any check refuses

## Why the acceptance cases matter as much as the refusals

A CHECK THAT ONLY EVER REFUSES PASSES ITS OWN TESTS WHILE BEING USELESS. Two of
the steps above exist to catch an over-strict mint: the shared-vocabulary case
and the cannot-be-stated case. Without them a mint that refused everything
would look green.
