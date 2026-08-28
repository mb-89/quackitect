---
form: departures-through-the-lane
by: agent
signed_off: 2026-08-26T13:33:12.533Z
authors: agent
files: null
---

# Evidence form / departures-through-the-lane

## current_situation

FALSE AS STATED. The hole is 38 modules wide.

### The counts

`scratchpad/shell-reach.mjs` classified all 178 TypeScript files under `deliverable/engine`.

- 41 modules write to disk directly, through `node:fs`.
- 29 modules spawn a process themselves, by importing `node:child_process`.
- 9 more reach a shell second-hand, through the lane's own runner.
- 38 reach a shell either way, or 21.3 percent of the governed set.
- 27 of those 38 also import `node:fs`.

### The first figure was 60, and this corrects it

An earlier script matched a bare `exec(` as a shell call. `RegExp.prototype.exec` collides with it, so ordinary pattern matching read as spawning a process.

The corrected count requires an import of `node:child_process` or a call into the lane's runner. It cross-checks exactly against an independent count of the subprocess conversation, which also found 29.

The assumption is still false. A smaller hole is still a hole, and 38 modules is not the single counterexample the entry carried.

### Why a shell defeats a write-time guard

A write-time guard is handed a path and content, and judges the path.

A spawned process is handed neither. The command is a string the guard cannot resolve into a target, so those 38 modules hold a channel it cannot see.

### What the run did not establish

Holding a shell channel is not the same as using it to add a departure.

Nothing measured whether any of the 38 ever writes a departure list. The count still over-matches in one direction, because a module that spawns a process to run a test is counted.

The size of the hole is measured and its use is not.

### This is not a new hole

`raid-iss-the-shell-writes-method-with-no-path-to-judge` recorded the same shape earlier, against the method-write refusal that has since been retired. Nothing closed it then either.

## built

- spec/trace/experiment/exp-which-channels-add-a-departure-without-a-path-the-guard-can-judge.md

## follow_up

- `el-door-rule` must say what it does with a module that reaches disk through a shell. Two honest options stand: the rule governs only the calls it can read and says so out loud, or the shell channel itself becomes a door.
- `el-door-sweep` carries the coverage the guard cannot. It stops being a second opinion and becomes the only complete one, which changes what M7 must build first.
- The write-time guard's coverage is a fraction nobody has computed. Ready when the departure list exists and its entries can be traced to the channel that wrote them.
- The 60-figure correction was applied to the raid node and to the signed run-spikes form. Any later reader quoting 60 is quoting the overcount.

## anything_else

The fallback was written before the run, and it fired. It said that any channel bypassing the path moves the coverage from the write-time guard to the sweep, which is the seam the existing widget rule already uses.

So the design does not need a new idea here. It needs to stop claiming the guard is complete.
