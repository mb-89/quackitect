---
form: the-guard-at-the-write
by: agent
signed_off: 2026-08-23T19:17:54.679Z
authors: agent
files:
---

# Evidence form / the-guard-at-the-write

## current_situation

THE RULE EXISTED AND NOTHING ASKED IT. `widgets.ts` held the predicate, the registry read and the difference; no caller ran any of it.

BOTH CALLERS NOW EXIST, and the rule is refused at the write and reported by the sweep.

## built

SE-C-146 IS THE CLAUSE. It is minted in `deliverable/engine/errors.ts` as `UNREGISTERED_EMITTER`, and its card stands in [refusals.md](guidance/refusals.md) with the three ways past it.

`guardNoUnregisteredEmitter()` IS THE WRITE HALF. It sits in the write path at `deliverable/engine/files.ts`, beside the two guards that were already there, at the last point before anything lands.

IT REFUSES THE ADDITION, NEVER THE EDIT. The question it asks is whether THIS write turned a quiet file into an emitter. A file that already emits stays editable, which it has to be — the files that emit today are the collapse's work, and a guard that froze them would block the fix as well as the fault.

THE REFUSAL CARRIES A RUNNABLE REMEDY: the exact `se_file_patch` that adds the file to the exemption list, with a blank where the reason goes.

THE SWEEP IS THE OTHER HALF. `deliverable/engine/bin/sweep.ts` asks `strays()` and lists what it finds. It is for a break no write arrived with — a rename, a merge, a registry line deleted out from under a module still emitting.

ONE RULE, TWO CALLERS, NO SECOND COPY. Both ask `widgets.ts`, which is the point of having built it first.

### What the sweep printed

IT RAN, AND IT IS RED: 21 unregistered emitters, each named. `basesclient`, `baseui`, `bin/mermaid-check`, `brand`, `card-parts`, `mirror`, `params`, `render`, six `renderclient` files, `session`, `stateform-sheet`, `tables`, `tools`, `trace-layout`, `trace`, `traceui`.

THE SPIKE SAID EIGHTEEN AND THE BUILT CHECK SAYS 21. The spike's registry reader was rougher and it did not walk `bin/`. The prose that quoted eighteen is corrected in the design spec, the test spec and the element card. The chunk id keeps its name because the machine walks by id.

THE SWEEP NOW EXITS NON-ZERO ON A WIDGET FINDING, the same as it does on a corpus finding. A check that reports and never fails is a warning that rots.

## follow_up

THE BATTERY IS NOW THIS ROUND'S WORK (owner ruling 2026-08-23). It was red before this session started — 24 failures, all in `deliverable/tests/claimops.test.ts`, all in one setup helper. The owner's words: it needs to be green when you're finished. `the-battery-goes-green` is added to the drawing, depending on nothing.

THE SWEEP IS RED UNTIL THE 21 ARE DECIDED, and that is the last chunk on purpose. Every intermediate battery will carry it.

TWO RULES CAME OUT OF THE OWNER'S QUESTIONS AND NEITHER IS BUILT. Both are in a note for the retro.

- A SURFACE MODULE MAY IMPORT THE VIEW MODEL AND NOTHING ELSE about the walk. That is what would catch a DERIVER, which this guard cannot see — it finds files that produce markup, not files that work out their own answers.
- SOURCE NO DESIGN SPEC CLAIMS COULD BE REFUSED AT THE WRITE. Half of it stands already: every design spec declares its files and trace-design sweeps for unclaimed ones. What is missing is the teeth and the timing.

## anything_else

