---
unreachable_citations:
  - scratchpad/shell-reach.mjs
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-every-write-that-adds-a-departure-passes-through-the-lane
type: "[[raid]]"
kind: assumption
statement: Every write that adds a departure to the exemption list goes through a lane verb that carries a path, so a write-time guard sees all of them.
owner: the maintainer
trigger: the first departure that appears in the list without a lane write behind it
status: open
impact: A departure written around the guard is a granted exception nobody reasoned for, and the list then reads as complete when it is not.
breaks_how_badly: crippling
how_likely: expected
probe: false — 38 of 178 engine modules can reach a shell, and a shell carries no path a guard can judge. The figure was first recorded as 60 and that was an overcount; the correction is in the result section.
probed: 2026-08-26
source_refs:
  - req-an-exemption-without-a-reason-is-refused-at-write-time
  - fn-govern-a-conversation-under-a-stated-rule.refuse-a-departure-that-states-no-reason
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

One counterexample already stands in this repository, so the honest probe is
how wide the hole is rather than whether it exists.

`raid-iss-the-shell-writes-method-with-no-path-to-judge` records that a shell
command is handed no path and cannot be judged by a path-carrying guard. A
shell heredoc appending to the exemption list is therefore invisible to a
write-time check.

The probe is to read the call log for writes that landed on
`deliverable/machines/widget-exemptions.md`, and to count how many arrived
through a path-carrying verb against how many arrived through `se_run`.

A count of zero shell writes holds it in practice. Any shell write falsifies
it, and the answer is then the sweep rather than the write-time guard, which
is the seam the existing widget rule already uses.

## Probe result, 2026-08-26

FALSE AS STATED. The hole is 38 modules wide.

### The counts

`scratchpad/shell-reach.mjs` counted the channels over 178 engine TypeScript files.

- 41 modules write to disk directly, through `node:fs`.
- 29 modules spawn a process themselves, by importing `node:child_process`.
- 9 more reach a shell second-hand, through the lane's own runner.
- 38 modules reach a shell either way, or 21.3 percent.
- 27 of those 38 also import `node:fs`.

### The first figure was 60, and it was wrong

An earlier script matched a bare `exec(` as a shell call. `RegExp.prototype.exec` collides with it, so ordinary pattern matching was counted as spawning a process.

The corrected count requires an import of `node:child_process`, or a call into the lane's runner. It cross-checks exactly against an independent count of the subprocess conversation, which also found 29.

THE ASSUMPTION IS STILL FALSE. A smaller hole is still a hole, and 38 modules is not one counterexample.

### Why a shell defeats a write-time guard

A SHELL COMMAND CARRIES NO PATH A GUARD CAN JUDGE. The write-time guard is handed a path and content. A spawned process is handed neither, so those 38 modules hold a channel the guard cannot see.

The assumption said a write-time guard sees every write that adds a departure. It does not.

### What is NOT established, and the distinction matters

Holding a shell channel is not the same as USING it to add a departure.

Nothing measured whether any of the 38 ever writes the departure list. The count still over-matches in one direction: a module that spawns a process to run a test is in it.

SO THE SIZE OF THE HOLE IS MEASURED AND ITS USE IS NOT. That is enough to falsify "sees all of them", and not enough to say how much leaks through it.

### What it means for the design

The write-time guard's coverage is a fraction nobody has computed, and `el-door-sweep` is what stands behind it.

The sweep stops being a second opinion and becomes the only complete one.
