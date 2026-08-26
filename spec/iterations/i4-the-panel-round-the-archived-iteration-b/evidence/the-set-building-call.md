---
form: the-set-building-call
by: agent
signed_off: 2026-08-23T19:31:26.425Z
authors: agent
files: null
---

# Evidence form / the-set-building-call

## current_situation

THE CHUNK WAS AIMED AT A NUMBER THAT TURNED OUT TO BE A COLD RENDER. The 1190.2 ms figure came from one profiled render whose 1163.6 ms sat in set-building.

THE RESOLVER NOW REPORTS ITS OWN PARTS, so the question could be asked properly for the first time.

## built

SEVEN SUB-PHASES were added inside `drawingSets` in `deliverable/engine/viewmodel.ts`: `sets.run`, `sets.paint`, `sets.blessed`, `sets.proven`, `sets.suspect`, `sets.open`, `sets.complete` and `sets.meta`. They ride the caller's own phase callback, so they show up beside the render's existing phases and cost nothing when nobody is listening.

THE COST IS REPORTED EVERY RUN rather than measured once and written into a comment. A check that is cheap today and expensive in a year is how a render gets slow without anybody deciding it should.

### What the measurement says

THREE RENDERS ON THE LIVE ROOT, one cold and two warm.

COLD: 10837.2 ms. Of that, `machine.sets` is 9883.4 ms and it is the machine COMPILE, not the set arithmetic. It happens once.

WARM: 674.3 ms and 668.1 ms. Both are inside the second, which is what the requirement asks for.

WHERE A WARM RENDER ACTUALLY GOES:

- `trace` — 406.5 ms, and it is not set-building at all
- `machine` — 265.8 ms in total
- `sets.open` — 121.8 ms, which is asking the resolver whether each sub-machine has a drawing
- `sets.complete` — 117.5 ms, the record-completion check
- `packet` — 16.7 ms
- `machine.states` — 8.1 ms

EVERY OTHER SUB-PHASE IS UNDER A MILLISECOND. `sets.run`, `sets.paint`, `sets.blessed`, `sets.proven` and `sets.suspect` do not appear, because they cost less than the reporting threshold.

### What was not changed, and why

NOTHING WAS OPTIMISED. The budget the requirement sets is met warm, and the cold cost is a compile that happens once per process.

THE PREMISE OF THE CHUNK WAS WRONG AND THAT IS THE FINDING. Optimising set arithmetic that costs under a millisecond would have been work aimed at a number, not at a person's wait.

THE BIGGEST WARM COST IS THE TRACE SLICE at 406.5 ms, and it belongs to a different subsystem. It is recorded rather than chased, because chasing it here would be this round doing another round's work.

## follow_up

THE TRACE SLICE IS 60 PER CENT OF A WARM RENDER and nothing in this round touches it. It is the first place to look if the surface ever misses its budget.

TWO SUB-PHASES ARE WORTH A SECOND LOOK ONE DAY. `sets.open` asks the resolver about every sub-machine on every render, and `sets.complete` walks the record. Together they are 239 ms of a 674 ms render, and both answer questions that change rarely.

THE COLD RENDER IS 10.8 SECONDS and the person pays it once per process. It is worth knowing that the first look at the panel after a restart is slow on purpose.

## anything_else

