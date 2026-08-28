---
unreachable_citations:
  - tests/bound-engine.test.ts
minted_in: i27
id: tsp-bound-engine-and-method
type: "[[test-spec]]"
statement: An agent changes the engine or the method from inside their record, and the change takes effect on their next call.
method: test
verifies:
  - req-an-engine-change-applies-in-its-own-record
  - req-a-method-change-reaches-every-tree
files:
  - tests/bound-engine.test.ts
---

## What i34 changed here, 2026-08-16

THE THIRD CLAUSE IS GONE FROM THE STATEMENT. It read "and no other record is
altered by it", which one tree makes false rather than unproven. Every open
record now writes into the same tree. That loss is recorded on
raid-dec-one-tree-beats-a-record-travelling-between-machines, which is the
decision that took it.

req-a-method-change-reaches-every-tree IS BACK ON THE `verifies:` LIST. i34
retired it by reading its id — which says reaches-every-tree — rather than its
statement, which asks one thing: the change takes effect without the agent
leaving the record. This spec's statement said the same in its own words the
whole time, which is why the row belongs here and nowhere else.

THE ROW'S RESTORATION IS CONTESTED and the adjudicator settles it. Both
readings are written into the requirement node with their evidence.

## Scope

The record's hold on the machine it runs: [[el-engine-delta]] resolving
record-first then trunk-second, and [[el-satellite-supervisor]] levelling a
tree before it serves.

WHAT IS DELIBERATELY OUT. The satellite lifecycle itself. Starting, replacing
and reaping belong to the supervisor's own checks, and [[exp-satellite-start]]
priced the start at 306.9 ms.

## Approach

DESIGN METHOD: a decision table over two axes — whether the record carries an
override, and whether trunk has moved under it. Four cells, and each has one
right answer.

- No override, trunk still: trunk serves.
- Override, trunk still: the record's file serves.
- No override, trunk moved: the new trunk serves, with nothing to reconcile.
- Override, trunk moved: the delta reconciles, or the record stops at entry with
  the conflict named.

The fourth cell is the one that matters. A composed mixture nobody assembled
is the harm: a walk that begins in a tree which does not compile.

req-entry-levels-the-record-tree carried that harm and was retired by i34 with
the record trees themselves. The cell stays because the harm does.

LEVEL: component for the resolution order, integration for the levelling.

DEPTH: high. Three of the four requirements are graded fatal, and the shape
that makes them true is new.

## Steps

Every case in `tests/bound-engine.test.ts` is one step.

THE CASES THAT PASS TODAY establish the ground the delta stands on: method
files are shared by every tree, the prompt layer counts as method though it
lives under no method folder, and a record's own folder belongs to that
record.

THE RED CASES ARE THE DESIGN'S OWED WORK.

- A record's own folder may override an engine file, and the composition asks
  the record first and trunk second.
- Entry levels the record's tree and reconciles its delta before the first call,
  or stops the record with the conflict named.

Neither mechanism exists. The red is what the build turns green.

## What no test here can reach

That an engine change costs no STEP-OUT. This very file could not be written
from inside the record — SE-C-134 refused it, because the engine's tests count
as method. That refusal is the requirement, met by a guard rather than by the
design, and only the build removes it.
