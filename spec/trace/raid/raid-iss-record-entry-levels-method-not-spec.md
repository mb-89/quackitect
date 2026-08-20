---
minted_in: i12
id: raid-iss-record-entry-levels-method-not-spec
type: "[[raid]]"
kind: issue
statement: Entering a record levels its tree's method and engine with trunk, but leaves the spec corpus at the seed.
owner: the driving agent
trigger: a scoped run inside a record fails a case that passes on trunk
status: closed
impact: The walk reads the red as its own and starts debugging work it never did. Worse, every measurement taken inside a record is taken against a tree that matches neither trunk nor the seed.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i12
  - raid-asm-battery-timings-measure-work
---

## What happened

Entering i12 on 2026-08-15 produced two levelling commits on the record's
branch.

- `9654e1e1 the machine levels this tree with trunk (78 files)`
- `bd2853fa the machine levels this tree's method with trunk (56 files)`

Read the file lists and the boundary is sharp. Both commits carry the
engine, the tests, the machines, the guidance and the prompt layer.
Neither carries anything under `spec/`.

So `tests/trace-coverage.test.ts` arrived from trunk in the levelling,
and the trace corpus it checks stayed at the state the seed cut on
2026-08-12.

## What it cost

Two cases failed inside the record that pass on trunk.

- "every lane verb the engine registers is named in the trace"
- "every lane verb is named in a use case, not merely somewhere"

The record's trace named the newest verbs twice, both in stories. Trunk's
trace named them forty times across seventeen files, four of them use
cases.

Diagnosing it took six calls, and the first four were spent establishing
that the red was not caused by the nodes this walk had just written.

## Why it is an issue rather than a risk

It has already happened, and it is present tense for every open record
cut before trunk last moved.

## The remedy that worked

`se_git_sync` merged sixty-nine commits from trunk into the record's
branch and the same three test files then ran 56 of 56 green.

The verb exists and its own description says a worktree should never be
silently stale. SILENTLY is the word that matters. Nothing in the walk
said the tree was behind, and no state asked for a sync.

## What would close it

Either half would do.

- Level the spec corpus with the method and the engine at entry.
- Report the distance from trunk when a record is entered, so a walker
  syncs on purpose instead of discovering it through a red.

The first is the smaller change and it carries a hazard the second does
not: a record's own spec edits must not fan out over trunk, which is the
failure i27 was built to stop.

## Closed

ENTRY LEVELS NOTHING, because there is nothing to level. The issue was that
entering a record copied method and engine into that record's own tree while
leaving its spec corpus at the seed, so a measurement inside a record matched
neither trunk nor the seed.

ONE TREE MAKES THE THREE THINGS ONE THING. Method, engine and corpus are the
same files whoever is standing where, so a scoped run inside a record judges
exactly what a run outside it judges.
