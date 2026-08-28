---
form: specify-build
by: agent
signed_off: 2026-08-24T16:22:00.805Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

The tests are authored and every case is red except one, which is mapped honestly rather than claimed.

Two design specs stand, one per element this record touches. Neither names a file it does not intend to land in.

The chunk plan follows below. It is small because the change is: five chunks, in two strands.

## design_specs

- dsp-the-entry-that-closes-itself
- dsp-one-instance-holds-the-workspace

## promotions

NONE. The prototype phase was struck at this change size, so no spike ran and nothing was promoted.

WHAT WOULD NORMALLY HAVE COME THROUGH IT is already answered by measurement. Three assumptions were probed against the real channel at M3, on this machine, and all three hold. The probe card's bar is that a probe is minutes rather than a spike, and each cleared it.

SO THE BUILD STARTS WITH ITS FEASIBILITY QUESTIONS SETTLED, which is what a promoted spike would have bought. It is worth recording that the cheaper instrument did the job here rather than leaving the promotions line reading as an absence.

## follow_up

THE CHUNK PLAN, five chunks in two strands.

STRAND ONE, the entry's life, built in order because each chunk leans on the one before.

- C1. The registration takes the live end. openOperation accepts the handle and the registry keeps it. Realization: engine code. Nothing else can be built first.
- C2. Every kind settles its own entry on exit. Leans on C1 for the handle. Realization: engine code.
- C3. The sweep asks each held handle on an interval and settles what is gone. Leans on C1. Realization: engine code.
- C4. A disagreeing settle leaves a record, and every entry carries its bound. Leans on C1. Realization: engine code.

STRAND TWO, independent of strand one and buildable beside it.

- C5. The workspace take, and the registration exemption. Leans on nothing in strand one. Realization: engine code.

WHICH LENSES SHAPED THE ORDER.

- RISK FIRST. C1 is the chunk everything else needs and the only one that changes a shape rather than adding behaviour. Its feasibility was the record's kill-criterion, and it is already probed.
- PARALLEL FLOW. Strand two leans on nothing in strand one, so the two fan out. Each later chunk in strand one leans on exactly one earlier chunk, which is the shape the card asks for.

WHAT DOES NOT APPEAR. A spine-first slice, because the seams here are already built and it is the parts that are missing. A skeleton around them would be scaffolding around nothing.

## anything_else

ONE THING THE BUILDER MUST NOT DO, written here because a test can be made to pass the wrong way.

DO NOT WIDEN THE RUN VERB TO MAKE THE REGISTRATION CASE GREEN. The widening is per argument. If legality cannot be expressed per argument, the honest answer is a separate verb for the registration, and the design spec says so.

ONE THING THE BUILDER GETS FOR FREE. The cost of the sweep is measured: 20 handles in 78 microseconds, 100 in 147. No tuning is owed before it runs on the loop that serves callers, and the design spec records what would change that.
