---
minted_in: i27
id: dsp-engine-delta
type: "[[design-spec]]"
statement: two-level resolution for every engine and method file, the record's own folder first and trunk second, so a record holds only what it changed
realizes:
  - el-engine-delta
  - if-engine-delta-to-account
  - if-engine-delta-to-mirror
  - if-engine-delta-to-walk-engine
files:
  - project/deliverable/engine/delta.ts
  - project/deliverable/engine/paths.ts
  - project/deliverable/engine/machines/compile.ts
---

## Responsibility

Compose the machine a satellite runs: trunk's files, with the record's own
overrides in place of the ones it changed.

WHAT A RECORD HOLDS is the files it changed and nothing more. Most records
hold none.

## Interface

`compose(record) -> { modules, fromRecord[] }`

Handed ONCE, at start, and never re-read mid-walk. A change means a new
satellite, so this interface never carries an update.

THE OVERRIDE LIST TRAVELS WITH THE MACHINE. Without it, N satellites run N
compositions and nothing says which is which.

## Behavior and constraints

RECORD FIRST, TRUNK SECOND, NEVER BOTH. A file is served from one store or the
other. A composed file assembled from both is a mixture nobody
assembled, and a walk beginning in it starts from a tree that does not compile.

THE REQUIREMENT THAT CARRIED THIS RULE IS RETIRED. i34 deleted
req-entry-levels-the-record-tree along with the record trees it levelled. The
harm is restated above in full, because the rule outlived its citation.

THE ORDER IS THE WHOLE RULE, and it lives under [[el-resolution-seam]] rather
than beside it. A caller never asks the delta anything; every read reaches it
through the one resolver no verb may bypass.

WHAT GOES STALE. Trunk moves and an override does not. That is caught at entry
by the supervisor, which reconciles the delta and stops the record when it will
not apply, reporting the divergence rather than composing a mixture.

METHOD AND ENGINE ARE THE SAME KIND OF THING here: files in the record's
folder that override trunk's. One mechanism serves both.

THE OVERRIDE LIST IS THE PANEL'S ANSWER to what a record has done to the
machine, readable without diffing anything. A list that has grown long is a
record that has quietly become a fork.

## Rationale

A WHOLE COPY PER RECORD CONTRADICTS THE THIN TREE and priced twenty-seven
engines on disk. A blind scorer found that contradiction in
[[cand-live-engine]] and again in [[cand-core-satellite]]. THE DELTA KEEPS
BOTH PICKS TRUE.

IT IS THE PIECE THE WINNER BORROWED FROM ITS RUNNER-UP, and naming it
separately is what lets a reader see the borrowing.

THIS IS WHAT REMOVES THE STEP-OUT. SE-C-134 refuses a method write from inside
a record, and it refused three test files at author-tests this same day. The
delta is what makes that refusal unnecessary rather than merely unenforced.
