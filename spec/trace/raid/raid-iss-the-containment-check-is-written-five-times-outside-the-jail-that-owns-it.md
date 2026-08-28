---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-the-containment-check-is-written-five-times-outside-the-jail-that-owns-it
type: "[[raid]]"
kind: issue
statement: Five engine modules each wrote their own is-this-path-inside check instead of using the path jail, and the two copies guarding a recursive delete disagree about absolute paths.
owner: the maintainer
trigger: any change to a destructive write in benchmark.ts or produce.ts, and the first design state that decides what the disk door owns
status: open
impact: Two recursive deletes are guarded by two predicates that answer the same question differently. A path the stricter guard would refuse passes the looser one, and the act it guards is rmSync with force set. Beyond the safety, five copies mean a fix to the check reaches one caller and leaves four wrong.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
  - raid-iss-the-path-jail-has-one-write-target
weighs_with: none
weighs_against: none
place: i46-one-home-per-idea-the-copies-that-could-
---

## What was found

MEASURED ON 2026-08-26, searching the engine for the containment predicate.
Six files carry it. `deliverable/engine/paths.ts` owns it and uses it four
times. Five others wrote their own.

- `deliverable/engine/benchmark.ts` line 195, as `ownTree`
- `deliverable/engine/produce.ts` line 77, as `travels`
- `deliverable/engine/tables.ts`
- `deliverable/engine/bases.ts`
- `deliverable/engine/machines/compile.ts`

## The two that matter disagree

`ownTree` returns `rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)`.

`travels` returns `rel === ""` for the root itself and omits the absolute-path
test entirely.

THE SAME QUESTION, TWO ANSWERS. One admits the root and one refuses it. One
checks for an absolute path and one does not.

## What they guard

`ownTree` guards `rmSync(run.tree, { recursive: true, force: true })` at
`benchmark.ts` line 393.

`travels` filters `cpSync(from, to, { recursive: true, ... })` at `produce.ts`
line 188. The same function runs
`rmSync(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })`
at line 219.

## Why this is an issue and not a risk

IT HAS ALREADY HAPPENED. The divergence is on disk today. Nothing about it is
conditional on a future event.

## The fix is smaller than the finding

`paths.ts` already has 20 importers and already uses this predicate four times.
Exporting it and deleting the five copies is a smaller change than any door,
and it settles the disagreement by removing one of the two answers.
