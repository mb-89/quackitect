---
id: doors
statement: Every module allowed past a door, with the reason it is allowed. One section per door.
---

# doors — the declared departures, and why each one stands

## What this file is for

EVERY REACH OUT OF THE ENGINE GOES THROUGH A NAMED DOOR, OR IS RECORDED HERE WITH ITS REASON.

The rule for each conversation lives in `deliverable/engine/doors.ts`. This file is the hatch, and it is declared. A hatch nobody can find is the same as no hatch, so the list lives here where a person can read it rather than inside the engine as a constant.

## What a departure means

THE REASON IS THE ENTRY, NOT METADATA ON IT. A line without a reason is not a line, and the write guard refuses one.

That is the single thing this design does that dependency-cruiser, ArchUnit, ESLint, Rust, Go and Bazel do not. Every one of them lets somebody bypass a boundary; none makes the bypass explain itself.

## How to add one

ONE BULLET PER MODULE, in its door's section, below that section's marker.

    - deliverable/engine/<file>.ts — why this one is allowed past

THE PATH IS ROOT-RELATIVE. Any dash separates it from the reason.

A BULLET OUTSIDE A SECTION BELONGS TO NO DOOR. Two doors must not read each other's departures.

## What this file cannot do

THERE IS NO OFF-SWITCH. No section, marker or line turns a door off. Only per-module departures, each with its reason.

Rust ships `--cap-lints allow`, Bazel ships `--check_visibility=false` and dependency-cruiser ships `severity: "ignore"`. This file ships none of them, and adding one would undo everything above.

## keeping-a-record-on-disk

This door governs reading and writing the project's own files.

IT SEES A MODULE THAT IMPORTS `node:fs`. It CANNOT see one that reaches disk through a spawned process, because a command carries no path to judge.

IT ALSO SEES NOTHING OUTSIDE `deliverable/engine`. The tests, the editor extension, the cage and the repository root all hold this conversation, and none of them is governed. That is a limit of the rule, never an exemption granted to them.

HOW MANY MODULES REACH IT TODAY IS THE SWEEP'S ANSWER, NOT THIS FILE'S. A number typed here goes stale the first time somebody adds an import. A hand-written count standing beside a computed one is the same defect this whole file exists to stop, in prose instead of code.

Two departures are declared below, and that is not the number of modules that reach. Most of the engine does. The sweep at `deliverable/engine/bin/sweep.ts` names every one of them on every run, and this file deliberately holds no count of its own.

<!-- departures below this line -->
- deliverable/engine/doors.ts — it is the door itself. The rule that decides who may read and write has to read the tree to answer, so a door that could not reach its own conversation could not exist.
- deliverable/engine/run.ts — it writes only logs it owns, through three module-local helpers: eight of its ten sites land under .se/jobs and two write .se/estimates.jsonl beside it. Measured at 0 of 10 sites a door would improve, which makes it the clean counter-example rather than an exception.
