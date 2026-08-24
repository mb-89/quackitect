---
form: a-hop-carries-its-own-time
amended: "2026-08-24T19:53:36.666Z by agent — the budget comparison it carried measured the whole hop against a budget that binds the flip, and the flip has now been measured"
by: agent
signed_off: 2026-08-24T16:31:58.968Z
authors: agent
files:
---

# Evidence form / a-hop-carries-its-own-time

## current_situation

The route drawer answered only with the total. A slow route could not name the slow hop, so nothing could tell a search that expanded many states from one that expanded few.

The round's own opening belief was that drawing is what makes an aim slow. Nothing had measured it.

## built

THE HOP IS THE UNIT NOW, NOT THE CALL.

`RouteStep` in [deliverable/engine/route.ts](deliverable/engine/route.ts) carries `ms`, the time that hop's drawing cost. `RouteResult` carries `visited`, the number of states the search looked at before answering. Every return path sets it, including the two that answer without finding anything.

The hand-built branch-return step in [deliverable/engine/session.ts](deliverable/engine/session.ts) carries `ms: 0`, because no drawing happened for it. That is a stated zero rather than a missing field.

### What it measured, immediately

The instrument answered the round's own open question on its first use.

| what | cost |
| --- | --- |
| building a session | 33 ms |
| expanding one state, cold | 3.7 ms |
| expanding the same state again | 0.1 ms |
| the whole route to `end` | 68 ms, 6 states visited, 6 hops |

A live aim into this record drew about thirty hops at roughly 8 ms each.

### Why that matters beyond the number

The round opened believing the route drawing was the cost of a slow aim. It is not, and the belief had already changed code before anything measured it.

That revert is its own chunk, and it depends on this one for exactly this reason.

### The check

Two cases in [deliverable/tests/route.test.ts](deliverable/tests/route.test.ts): hops carry `ms`, and searches report `visited`. Both green, in a suite that now stands at 464 of 464.

## follow_up

THE MEASUREMENT THIS SECTION CALLED OWED HAS BEEN TAKEN, and it refuted the suspect this section named.

### What the suspect was, and why it was wrong

THE SUSPECT WAS THE CONDITION SCRIPTS, on the reasoning that each starts a process. A phase trace put leaving a state at ONE millisecond, so the scripts were never the cost.

THE COST WAS THE ROUTE DRAWING, REPEATED ONCE PER HOP. This chunk proved the drawing is cheap for one route, which is true. It was read as proving the drawing is not the cost at all. Drawing it again every hop is a different question, and nobody had asked it.

### What a profiler found

FOUR READS, each repeated hundreds of times per hop.

- A whole state form rebuilt to read one field: 1,034 ms.
- The same form rebuilt again to read a signature: 914 ms.
- Every reachable machine redrawn per node the search expanded: 498 ms.
- The trace corpus re-stat'd across 2,790 files, four times a hop.

### What it now costs

| | was | is |
| --- | --- | --- |
| a three-hop sweep | 15,404 ms | 2,562 ms |
| one hop | 5,204 ms | 854 ms |
| file-door calls per sweep | 612,532 | 22,040 |

### The budget is met, and this section first said it was not

THE FLIP IS 20 MILLISECONDS AGAINST 250. The requirement bounds the flip and not the state's work, and a phase trace splits hop one into 13 ms of reading, 1 ms of condition scripts and 20 ms of assembling the status.

THE THREE HOPS WARM COST 34, 66 AND 59 MILLISECONDS in total. Attribute all of the worst one to the flip and it is still inside the budget by a factor of four.

THE 854 FIGURE IS A COLD PROCESS, and this section published it against the budget for about an hour. The probe built a new session per run, so every hop paid module loading and the first corpus read that a live engine pays once at boot.

`raid-iss-the-hop-is-still-over-its-published-budget` IS CLOSED as refuted, and it records what it got wrong.

THIS CHUNK IS WHAT MADE THAT INVESTIGATION POSSIBLE. `swept_ms` turned a theory about a slow aim into a number per hop.

## anything_else

