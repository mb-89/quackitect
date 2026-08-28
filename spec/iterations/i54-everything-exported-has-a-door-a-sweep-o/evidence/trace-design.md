---
form: trace-design
by: agent
signed_off: 2026-08-26T14:35:54.891Z
reopened: "2026-08-26T14:25:04.312Z — the trace recorded a design the build does not meet: one rule written twice, and three of four write verbs skip the guards"
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

Four design specs cover four elements and two interfaces, and every file each one names exists.

### The trace was reopened, and this is what moved

It first recorded that `el-door-write-guard` landed in `doorguard.ts` and `files.ts`. Fresh eyes then found the pair running on the whole-file write only.

The lane has FOUR write verbs. Patch ran one unrelated guard, replace ran one, and move ran none. So the element was realized in one path of four, and the trace said it was realized.

THAT IS WHY THE CLAIM STOPPED STANDING. A `files` cell naming half the landing sites reads exactly like one naming all of them.

### The coverage

- `dsp-the-door-rule` realizes `el-door-rule`, landing in `deliverable/engine/doors.ts`.
- `dsp-the-door-refusals` realizes `el-door-write-guard`, landing in `deliverable/engine/doorguard.ts`, `deliverable/engine/files.ts`, `deliverable/engine/files-patch.ts` and `deliverable/engine/move.ts`.
- `dsp-the-departure-list` realizes `el-departure-list`, landing in `deliverable/machines/doors.md`.
- `dsp-the-door-sweep` realizes `el-door-sweep` and both crossings into it, landing in `deliverable/engine/bin/sweep.ts`.

Every one of those files exists. None was a planned name that survived the record unrealised.

### One element is new and three are reused

`el-door-rule` is the only new element, and it is the only wholly new file. The write guard, the departure list and the sweep are existing elements this record gave a second rule to.

That ratio is the design's own claim: the widget guard already had this shape for one conversation, and generalising it needed one new module rather than four.

### The two crossings are on one spec

`if-door-rule-to-door-sweep` and `if-departure-list-to-door-sweep` both detail how the sweep gets its answers, so they sit on the sweep's spec rather than each having their own.

The second crossing goes THROUGH the rule module rather than around it. The sweep never opens the departure list itself, which is what stops two readers of one file drifting.

### The guard now walks through its own door

`doorguard.ts` imported `node:fs` and read the file on disk. It is engine source and it held the disk conversation, so the module that refuses an undeclared reach was an undeclared reach.

The on-disk question moved into the rule module, which is already declared. The guard imports no filesystem at all now.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-the-departure-list]] | el-departure-list | deliverable/machines/doors.md |
| [[dsp-the-door-refusals]] | el-door-write-guard | deliverable/engine/doorguard.ts · deliverable/engine/files.ts · deliverable/engine/files-patch.ts · deliverable/engine/move.ts |
| [[dsp-the-door-rule]] | el-door-rule | deliverable/engine/doors.ts |
| [[dsp-the-door-sweep]] | el-door-sweep · if-door-rule-to-door-sweep · if-departure-list-to-door-sweep | deliverable/engine/bin/sweep.ts |

## follow_up

- Verification runs again, and the standing tester re-verifies the DELTAS rather than rereading from zero. That is what its card asks for after a fix round.
- The full battery has not run since these fixes. Nine files changed, including three write paths every other suite exercises, so a red is expected somewhere and is the point of running it.
- The prompt layer is stale, because this record added two clause sections to `guidance/refusals.md`. `se_prompt_place` is not legal in a build state and preflight names it as the remedy.

### One risk this round takes on purpose

The single guard function carries the pool guard and the widget guard as well as the two door refusals. Those two were also whole-file-write-only, which is the same hole in two more rules.

So patch, replace and move now ask them for the first time. A battery red on a pool or widget case is a hole that was already there, not a break this round made.

## anything_else

The dead-code half of this state is worth naming, because this record built a second answer to the same question.

The law here asks whether every deliverable code file is claimed by a design spec, and the unclaimed list is the dead-code view.

`unreachedEntryPoints` asks a narrower version of it at the other end: which files a person can RUN that nothing invokes. It found four.

The two do not overlap. A file can be claimed by a spec and invoked by nothing, which is exactly what `deliverable/engine/bin/brand.ts` is.
