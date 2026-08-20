---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-write-guard
type: "[[test-spec]]"
statement: A write is checked before it lands — a break this write made refuses with its remedy, a break the corpus carried lands and reports, and neither costs the write its one-second budget.
method: test
verifies:
  - req-a-write-that-breaks-the-corpus-refuses
  - req-a-value-outside-its-vocabulary-refuses
  - req-a-standing-break-reports-and-lands
  - req-a-check-names-its-way-forward
  - req-a-check-too-slow-for-the-write-moves-to-the-sweep
files:
  - tests/writeguard.test.ts
---

## Scope

The write path's own laws. Everything that happens between a write verb
being called and something landing on disk, or not.

FIVE ROWS, ONE COLLECTION, because they are one decision seen from five
sides. A single question is asked of the incoming content, and the
answer picks refuse, land-and-report, or land clean.

## Approach

COMPONENT LEVEL, DRIVEN THROUGH THE LANE rather than against a function.
The guard's whole claim is about what a WRITE VERB does, so a case that
called the checker directly would prove nothing about the verb.

FAULT-BASED, and two of the faults are not invented. The unquoted colon
and the out-of-vocabulary value are this iteration's own failures,
replayed as fixtures with the exact strings that caused them.

THE HAPPY PATH IS A CASE TOO. A guard that refuses everything passes
every fault case and is useless.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- AN UNQUOTED COLON IS REFUSED and nothing lands on disk. The write that
  made this exact shape returned `created: true` on 2026-08-16.
- THE REFUSAL CARRIES FOUR THINGS: the file, the line, the value quoted
  back, and an executable remedy. Three of them are a diagnosis; the
  fourth is what makes it actionable.
- A VALUE OUTSIDE ITS VOCABULARY IS REFUSED, and the refusal names the
  WHOLE allowed list. `part-closed` against the eight status words.
- A STANDING BREAK LANDS AND REPORTS. A dangling reference the author did
  not create must not refuse their unrelated write, and the report names
  the difference rather than the category.
- AN UNFINISHED RULE DOES NOT ARM. A rule with no declared way forward
  can trap the walk, so it is refused at authoring time.
- THE GUARDED WRITE ANSWERS INSIDE 1000 ms. The unguarded baseline is 4
  to 12 ms, measured from the call log's own `duration_ms` over twelve
  consecutive writes.
- A CORPUS-WIDE CONDITION RUNS IN THE SWEEP, over a whole tree, and
  answers with findings rather than a refusal.
- NO FLAG WAVES THE GUARD THROUGH. `force: true` does not clear it —
  a check that can be skipped is a report with extra steps.
- A SOUND WRITE STILL LANDS, returns its hash, and the bytes on disk are
  the bytes that were sent.

## What is deliberately not here

MUTATION TESTING. Whether a case CAN fail is a different question from
whether it failed for the right reason, and it is out of scope for this
iteration by name.
