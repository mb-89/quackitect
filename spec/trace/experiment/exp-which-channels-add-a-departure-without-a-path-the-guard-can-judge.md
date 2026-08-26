---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-which-channels-add-a-departure-without-a-path-the-guard-can-judge
type: "[[experiment]]"
statement: How many engine modules can add a departure through a channel that carries no path, measured as the count that reaches a shell against the 178 the door rule would govern?
probes:
  - raid-asm-every-write-that-adds-a-departure-passes-through-the-lane
timebox: one search for the channels that bypass a path
form: script
chunk: none — all 178 engine TypeScript files were classified
faked: none in the scan. What is FAKED is the link from capability to use — the run counts modules that CAN reach a shell, and nothing measured whether any of them writes a departure list.
fallback: pre-agreed at seeding. If any channel bypasses the path, the write-time guard stops being complete and the sweep carries the coverage instead. That is the seam the existing widget rule already uses.
verdict: falls
measured: 2026-08-26. 38 of 178 modules reach a shell, or 21.3 percent — 29 spawn a process themselves and 9 go through the lane's runner. 41 write to disk directly. The figure was first measured as 60, and that was an overcount corrected here.
folds_to: el-door-rule must state its coverage limit out loud, because 38 modules hold a channel the write-time guard cannot see. el-door-sweep stops being a second opinion and becomes the only complete check, which changes what the build does first. The corrected 38 replaces the overcounted 60 on the raid node and in the signed run-spikes form.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - raid-iss-the-shell-writes-method-with-no-path-to-judge — the same hole, found earlier and never closed
---

## Setup

`scratchpad/shell-reach.mjs` walked all 178 TypeScript files under `deliverable/engine`, excluding declaration files, and classified each one.

Two channels count as reaching a shell.

- DIRECT. The module imports `node:child_process`.
- SECOND-HAND. The module calls into the lane's own runner, which spawns for it.

A bare `exec(` is deliberately NOT counted. `RegExp.prototype.exec` collides with it, and that collision is what produced the first, wrong figure.

## Result

FALLS. THE HOLE IS 38 MODULES WIDE.

### The counts

- 41 modules write to disk directly, through `node:fs`.
- 29 modules spawn a process themselves.
- 9 more reach a shell through the lane's runner.
- 38 reach a shell either way, or 21.3 percent of the governed set.
- 27 of those 38 also import `node:fs`.

### The first figure was 60, and this corrects it

An earlier script matched a bare `exec(` as a shell call, so ordinary pattern matching read as spawning a process.

The corrected count cross-checks exactly against an independent measurement of the subprocess conversation, which also found 29 direct spawners.

THE ASSUMPTION IS STILL FALSE. A smaller hole is still a hole, and 38 modules is not the single counterexample the entry carried.

### Why a shell defeats a write-time guard

A write-time guard is handed a path and content, and judges the path.

A spawned process is handed neither. The command is a string the guard cannot resolve into a target, so those 38 modules hold a channel it cannot see.

### What the run did not establish

Holding a shell channel is not the same as USING it to add a departure.

Nothing measured whether any of the 38 ever writes a departure list. The count still over-matches in one direction: a module that spawns a process to run a test is counted.

SO THE SIZE OF THE HOLE IS MEASURED AND ITS USE IS NOT. That falsifies "a write-time guard sees all of them". It does not say how much leaks through.

### What it means for the design

The write-time guard's coverage is a fraction nobody has computed.

`el-door-sweep` is what stands behind it, so the sweep stops being a second opinion and becomes the only complete one.

This is not a new hole. `raid-iss-the-shell-writes-method-with-no-path-to-judge` recorded the same shape earlier, against the retired method-write refusal, and nothing closed it then either.
