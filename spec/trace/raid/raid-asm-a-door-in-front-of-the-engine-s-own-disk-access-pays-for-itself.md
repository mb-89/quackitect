---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
type: "[[raid]]"
kind: assumption
statement: Routing the engine's own disk access through one door buys more than it costs, so the 123 direct write sites in engine core are a defect rather than a shape somebody chose.
owner: the owner
trigger: the first design state that has to say which of the 398 measured disk sites should go through a door, and the first time a rewrite of one of the seven heaviest modules is proposed
status: probed
impact: The whole widened scope of this record rests on it. If the direct sites are mostly fine as they are, the record spends a major-sized effort building a door in front of code that never needed one, and the count that motivated it turns out to have measured the size of the question rather than the size of the defect.
breaks_how_badly: crippling
how_likely: plausible
probe: holds, narrowly. All 64 write sites in the seven heaviest modules were listed and read. 42 sit in the pile a door would improve; 22 sit in the pile a door would only lengthen. A majority in the second pile was the falsifier, and it did not happen. THE WIN IS NARROWER THAN THE STATEMENT CLAIMS. 25 of the 64 sites are that one shape - 20 hand-verified read-modify-writes of a claim, record or form instance, plus 4 mkdirSync calls that immediately precede one. A remeasurement on 2026-08-26 corrected this down from thirty, so the object that pays is a claim writer rather than a facade over disk. run.ts is the clean counter-example at 0 of 10, because every write is an append to a log it owns through three module-local helpers at lines 438, 442 and 1403 that already jail them under .se/jobs. Full result in the Result of the probe section below.
probed: 2026-08-26
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
weighs_with: none
weighs_against: none
---

## Result of the probe

THE ASSUMPTION SURVIVES, 42 TO 22. Every one of the 64 write sites in the seven
modules was listed and read on 2026-08-26. The falsifier was a majority in the
second pile, and the second pile holds 22.

The split, per module, as improve/lengthen:

- `deliverable/engine/sessionclaims.ts` — 10 / 0
- `deliverable/engine/session.ts` — 10 / 1
- `deliverable/engine/iterations.ts` — 9 / 1
- `deliverable/engine/benchmark.ts` — 6 / 3
- `deliverable/engine/sessionforms.ts` — 4 / 2
- `deliverable/engine/produce.ts` — 3 / 5
- `deliverable/engine/run.ts` — 0 / 10

### The win is one shape, not the whole of disk

THIRTY OF THE SIXTY-FOUR SITES ARE THE SAME ACT. 23 are a read-modify-write of a
claim, record or form instance. 7 more are the `mkdirSync(dirname(...))` that
immediately precedes one of those writes.

None of the thirty replaces the file atomically. None checks a hash before
overwriting. `sessionclaims.ts` alone writes `h.instanceAbs` from eight separate
call sites, and a signature lives in that file.

SO THE THING THAT PAYS IS A CLAIM WRITER, not a general disk facade. That is a
narrower object than the assumption's own words, and it is the object the design
should name.

### run.ts is the clean counter-example

ALL TEN OF ITS WRITES ARE IN THE SECOND PILE. Seven are appends to a log the
module owns; three are the `mkdirSync` that ensures the directory. Every path
comes from one of three module-local helpers — `jobDir` at line 438, `jobPath`
at line 442, `estimateLog` at line 1403 — which already jail them under
`.se/jobs`.

A door in front of these lengthens them and buys nothing. This is the dismissal
the owner invited, with its reason.

### The containment check is written five times outside the jail

THE SECOND FINDING, and it was not what the probe went looking for. Searching
the engine for the is-it-inside predicate finds it in six files: `paths.ts`,
which owns it, and five others that wrote their own.

- `deliverable/engine/benchmark.ts` line 195, `ownTree`
- `deliverable/engine/produce.ts` line 77, `travels`
- `deliverable/engine/tables.ts`
- `deliverable/engine/bases.ts`
- `deliverable/engine/machines/compile.ts`

THE TWO THAT GUARD A DESTRUCTIVE WRITE DISAGREE WITH EACH OTHER. `ownTree`
returns `rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)`. `travels`
returns `rel === ""` for the root and omits the absolute-path check entirely.
The same question, two answers, guarding two recursive deletes.

That divergence is the strongest single argument for a door in this file, and it
is about destructive writes rather than about writes in general.

## Probe

RUN ON 2026-08-26, by the M1 walker of i54. The result is in the section above.
The probe is kept here in full because a probe that has been run is still the
thing that gets re-run when the code moves.

THE COUNTING WAS DONE AND THE JUDGING WAS NOT. That is what this probe closed:
what had not been measured was whether any given site SHOULD go through a door.

THE PROBE, and it costs one reading pass over seven files. session.ts,
iterations.ts, run.ts, sessionclaims.ts, benchmark.ts, produce.ts and
sessionforms.ts carry 64 of the 117 core writes between them.

SORT EACH WRITE INTO TWO PILES.

- Writes a door would improve. Repeated path building, atomic replacement, hash
  checking, the same error handling in seven places.
- Writes a door would only lengthen. A single append to a log the module owns,
  a temporary file it reads straight back, a path already jailed by paths.ts.

WHAT THE RESULT MEANS. A majority in the second pile falsifies this and
re-sizes the record down to the sweep that was seeded. Anything else confirms
it.

WHO RAN IT: the walker of the milestone that opened the design work, at
[draft-vision](iterations/i54/draft-vision).

HOW IT WAS RUN, so it can be repeated. One search for the write verbs over
`deliverable/engine`, filtered to the seven filenames, returned exactly 64
lines. Each line was read and sorted. The per-module split is in the result
section above.

## Why it is written down rather than assumed

THE OWNER CALLED IT AN IDEA, not an order. Their words allow any of the three
doors to be dismissed where it does not make sense, with the reason recorded.

That is an invitation to test the principle, and a test needs the claim stated
first. Left unstated, the record would treat the principle as settled and the
dismissal path would never be walked.

## What is measured and what is not

MEASURED, on 2026-08-26, over 180 source files: 93 of them reach disk or the
network directly, at 398 disk sites and 52 network sites. Engine core alone
carries 117 writes across 50 files, and seven modules carry 64 of those.

NOT MEASURED: whether a door improves any single one of them. A count of
call sites is a count of call sites.

## What would falsify it

THE SEVEN HEAVY MODULES ARE THE PLACE TO LOOK. session.ts, iterations.ts,
run.ts, sessionclaims.ts, benchmark.ts, produce.ts and sessionforms.ts.

FALSIFIED IF most of their writes turn out to be the kind a door cannot
improve. A single append to a log the module owns, a temporary file it
immediately reads back, a write whose path is already jailed by paths.ts.

CONFIRMED IF the writes repeat a shape a door would hold once. Path building,
atomic replacement, hash checking, error handling, the same three lines in
seven places.

## The related seam that already works

PATHS.TS IS THE COUNTER-EXAMPLE IN OUR FAVOUR. The path jail has 20 importers
and is well adhered, which shows an internal seam can hold here.

IT IS ALSO NARROWER THAN A DISK DOOR. A path jail answers one question about a
string; a disk door owns the whole act. The precedent supports the shape and
does not establish the cost.

## Probe result, 2026-08-26 — two figures corrected

THE ASSUMPTION STILL HOLDS. Two figures written into it do not.

### The one-shape count was 30 of 64, and it is 25 of 64

Every borderline site in the seven modules was hand-read again. The count is 20 read-modify-writes plus 4 `mkdirSync` calls that immediately precede one.

A machine classifier says 21 read-modify-writes, one higher. The extra one is a false positive, verified by reading. `deliverable/engine/produce.ts:314` writes `README.md` from a template read out of a DIFFERENT file, so it is a one-shot write of a generated file rather than a round trip.

Two corrections went the other way, and both were misses in the earlier passes. `deliverable/engine/iterations.ts:257` and `:287` each read `recAbs`, rewrite one frontmatter line, and write it straight back.

### The engine-core total was 117 across 50 files, and it measures 123 across 29

The verb list is not in dispute. The seven modules agree exactly at 64 sites on both counts.

What could not be reconstructed is a scope that yields 50 files. The remeasurement spans top-level `deliverable/engine/*.ts` and finds 29 files. THE 50-FILE FIGURE IS UNEXPLAINED, and it is recorded here rather than quietly dropped.

### The whole engine, for scale

151 write sites in 41 files across all of `deliverable/engine`, counting `bin/`, `editors/` and `machines/`.

Eight shapes across those 151 sites:

- mkdir-then-write: 38
- read-modify-write: 37
- one-shot-write: 25
- mkdir-only: 16
- append-log: 16
- delete-or-move: 14
- copy: 4
- chmod: 1

The single `chmod` is `deliverable/engine/bin/preflight.ts:164`.

The classifier is deterministic. Three runs gave byte-identical counts, so there is no variance to report on these figures.
