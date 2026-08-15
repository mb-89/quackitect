---
minted_in: i27
id: exp-satellite-start
type: "[[experiment]]"
statement: Can a satellite start inside the one-second budget, measured as the median start with the engine module load included?
probes:
  - raid-ar-call-answers-in-one-second
  - raid-asm-the-target-machine-is-many-throttled-cores
timebox: one hour
form: script
promote: "none — the constraint enters specify-build as a property of the START act, and loading less eagerly is the lever it has"
folds_to: "raid-ar-call-answers-in-one-second is re-grounded at 306.9 ms with the module load included"
faked: the process imported the engine and stopped, so the real start is this number plus the levelling
fallback: if a start does not fit the budget, a satellite is not a process — the choice moves to a worker thread or a pre-warmed pool
verdict: holds
measured: 2026-08-14 — 306.9 ms median to start and load the verb surface, against 40 ms for a bare Node process; the engine load alone is 267 ms
source_refs:
  - rank-unknowns, the seeded pick
  - el-satellite
  - el-satellite-supervisor
  - req-call-answers-in-one-second
---

## Setup

The owner's Windows machine, 2026-08-14, Node v24.16.0. Seven runs of each,
reported as min, median and max.

Three measurements, each a fresh process.

- BARE. A Node process that does nothing, which is the floor.
- SESSION LOADED. The same process having imported the walk kernel.
- TOOLS LOADED. The same process having imported the verb surface, which
  pulls the widest graph in the engine. A satellite needs it before it can
  serve.

## Result

| what | min | median | max |
| --- | --- | --- | --- |
| bare Node | 36.4 ms | 40.0 ms | 67.5 ms |
| walk kernel loaded | 213.4 ms | 223.0 ms | 258.7 ms |
| verb surface loaded | 288.9 ms | 306.9 ms | 387.7 ms |

The engine load alone is 183 ms for the kernel and 267 ms for the verb
surface.

## What it settles

THE BOARD'S FIGURE WAS THE FLOOR, NOT THE START. Every number recorded so far
was 36 ms warm and 67 ms cold, with the engine load NAMED AS EXCLUDED. The
bare-Node column reproduces both figures exactly, which is what makes the
comparison sound.

The real start is 306.9 ms. The board understated it by between five and
eight times.

IT FITS THE BUDGET, AND IT SPENDS A THIRD OF IT.
[[req-call-answers-in-one-second]] allows 1000 ms and a start takes 307.

That is affordable only because a satellite starts when a RECORD OPENS, not
when a call arrives. [[el-satellite-supervisor]] already says so in its START
act. This measurement is what makes that a constraint rather than a
preference.

## What it decides about what a satellite is

A PROCESS IS FINE FOR PER-RECORD and ruled out for per-call. At 307 ms a
process cannot be spawned inside a call that must answer in one second and
still do the work.

So the open decision narrows: the choice between a process, a worker thread
and an isolate matters only if starts turn out to be frequent. Under the
current design they are not — one per record open, plus one per engine delta
change.

## What it says about the parallelism case

Twenty-seven records opening one after another costs 8.3 seconds of start.
The same twenty-seven starting at once costs 307 ms of wall clock, if the
cores are real.

That is [[raid-asm-the-target-machine-is-many-throttled-cores]] stated as
arithmetic on a measured number. It is not a profile of where the time goes
in normal work, and it does not become one.

## What it does not settle

The process imported the engine and stopped. It did not level a tree, rebase
a delta or open a channel. The real start is this number PLUS that work, and
the levelling is the part most likely to dominate.
