---
form: the-pool-module
by: agent
signed_off: 2026-08-18T10:01:01.314Z
authors: agent
files: null
---

# Evidence form / the-pool-module

## current_situation

THE CHUNK IS BUILT AND THIS FORM IS WRITTEN AFTER IT. The drawing was authored late — specify-build recorded the plan in its own form and did not seed this machine, so the walk refused to enter build-steps until the drawing existed. The four chunks ran in the drawn order all the same; what was missing was the drawing, never the plan.

## built

engine/pool.ts, new, 190 lines.

WHAT IT OWNS: `poolDir` (project/spec/trace/option), `mintOption`, `standingOptions`, and `longestSharedRun` which the next chunk uses.

THREE DECISIONS WORTH THE READING.

- THE OPTION IS A CORPUS NODE, which is raid-asm-the-pool-is-a-node-kind-under-project-spec made concrete. It buys the identity sweep for nothing: prose-inspect walks project/spec recursively, so a minted option is swept for leaked names and paths on the day it exists. Probed 2026-08-18 and it holds.
- THE ID IS A SLUG OF THE STATEMENT, uniquified against what already stands. A pool of files wants readable names — somebody listing that directory IS reading the pool, and a hash would tell them nothing.
- IT REFUSES BEFORE IT WRITES, always. A refused mint must leave the pool and the note store exactly as it found them, and that ordering is what the next chunk's guarantee rests on.

WHY IT IS NOT A FUNCTION IN inbox.ts, since that was the obvious alternative: the pool is read by things with nothing to do with notes — the survey today, the desk tomorrow — and importing the note store to read a list of options would tie two lifetimes together that the whole design keeps apart.

## follow_up

- the six-word threshold lands in the next chunk, not this one; this chunk only provides the run-finder it uses

## anything_else

