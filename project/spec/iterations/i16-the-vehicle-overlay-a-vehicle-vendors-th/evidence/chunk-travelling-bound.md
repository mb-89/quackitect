---
form: chunk-travelling-bound
by: agent
signed_off: 2026-08-18T18:44:38.553Z
authors: agent
files:
---

# Evidence form / chunk-travelling-bound

## current_situation

THE BOUND EXISTS AND IT TRAVELS. 1450 of 1451 pass; the one failure is the corpus-wide churn alarm, unchanged and not this chunk's.

### The chunk's own statement was almost wrong about where the check goes

IT SAYS "CHECKED AT THE ONE RESOLUTION SEAM EVERY VERB GOES THROUGH". Measured 2026-08-18: the seam is imported by exactly two files, and engine/tools.ts reaches it twice — both times for se_lint READS.

EVERY FILE WRITE VERB CALLS resolveInRoot DIRECTLY. So a bound placed only at the seam would have guarded two reads and no write at all, while reading as though the guarantee were real.

THE CHECK THEREFORE SITS IN THE JAIL, and the seam keeps it only to name the bound as the store it answered from. Two cases were added specifically to pin that placement down, because the first version passed its tests and guarded nothing.

### The read half, which is the part that is easy to get backwards

A PRODUCING ACT COPIES FROM THE ENGINE. Bounding its reads would leave it unable to read the thing it is reproducing, so reads are never bounded.

THAT MEANT SPLITTING THE CONTAINMENT RULE OUT rather than duplicating it. `resolveForRead` used to delegate to `resolveInRoot`, which now applies the bound. Both lanes reach one shared `containedIn`, so the rule is still proved once.

### And the bound has to beat the ordinary routing

METHOD AND SESSION PATHS RESOLVE TO THE MACHINE ROOT whatever is bound. That is right during a walk and catastrophic during production: the act would write the ENGINE while copying it.

SO THE FIRST TEST USES A METHOD PATH DELIBERATELY, and it is the case that proves the precedence rather than assuming it.

## built

### engine/actbound.ts, new

THE STATE AND THE ONLY DOOR TO IT. `withActBound(tree, source, act)` sets the bound, runs the act, and tears the bound down in a `finally`. There is no setter, on purpose.

IT IS ITS OWN MODULE TO KEEP THE IMPORTS ACYCLIC. paths.ts asks whether a bound is open; resolve.ts re-exports the way to open one. State in either would have made the two import each other.

### engine/paths.ts

- `resolveInRoot` consults the bound FIRST, before the root-ref branch and before ordinary containment.
- `containedIn` is the containment rule, extracted and shared.
- `resolveForRead` calls `containedIn` directly, so reads stay unbounded.
- `resolveInActBound` refuses anything outside the tree being produced, and refuses a root-ref outright.

### engine/resolve.ts

THE SEAM NAMES THE BOUND AS ITS STORE, so an answer can still be checked against where it landed. It re-exports `withActBound`.

### engine/errors.ts and guidance/refusals.md

SE-C-141 IS NEW. A write that left the act's bound is a different fault from one that left the project, and the option node asked for them to be told apart by name.

### tests/resolution.test.ts

SEVEN CASES, all green:

- a write during the act lands in the tree being produced, proved on a METHOD path
- a write outside the bound refuses, naming the tree being produced
- a read still reaches the tree being copied
- a failed act leaves nothing bound behind
- a second act cannot open a bound while one is open
- the jail every write verb calls honours the bound
- a read stays unbounded even though it shares the containment rule

## follow_up

IMMEDIATELY: chunk-producing-acts, which is the first caller `withActBound` has.

### What this chunk does NOT cover, said plainly

THE BOUND GUARDS PATHS AN AGENT NAMES THROUGH A LANE VERB. It does not guard the engine's own internal writes.

raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces ALREADY MEASURED THAT: a bare path join appears 116 times across 49 files against 44 resolver calls. Those writes never reach the jail, so the bound cannot see them.

THAT IS UNCHANGED BY THIS CHUNK and it is not a regression. It is the standing gap dsp-resolution-seam owns, and closing it is a sweep this iteration did not scope.

SO THE PRODUCING ACT MUST ROUTE ITS OWN WRITES THROUGH THE LANE rather than through a bare join, or its bound is decoration. That is a constraint on the next chunk, and it is the reason this one is named as a dependency of it.

### The end-to-end test, corrected

v1 DOES HAVE ONE and my first answer said it did not. It is product/engine-go/i18_red3.go at ref main, and it is hermetic: temp directories, the data home redirected by environment, the binary subprocessed with an explicit base.

IT DEFEATS THE "WHY DEMONSTRATION RATHER THAN TEST" REASONING on two requirements, which says a test inside this repository's own root cannot establish the result. v1 establishes most of the chain exactly that way.

READY WHEN the producers exist, because the test's first step is producing a vehicle.

### Still parked

THE CHURN ALARM, 868 of 1689 against a 50 percent limit. It blocks verification and wants the owner's word.

## anything_else

### What v1's end-to-end test asserts that ours must not lose

READ AT ref main, 2026-08-18, and worth listing because it is a field-hardened list rather than a guess:

- The project's record names the VEHICLE as its engine home.
- The project resolves a method file that exists ONLY in the vehicle's overlay.
- The vehicle's override BEATS the vendored engine copy. Precedence, not mere existence.
- The project drives a full-graph command clean through the vehicle.
- The machine-wide pointer is NEVER captured, with the shape of a live hijack deliberately planted to try to steal it.

THE LAST ONE IS A HAZARD SOMEBODY HIT IN THE FIELD, and note-b966f8fd311e already carries it.

### The cost of this design, named where it was decided rather than discovered later

THE BOUND IS STATE, AND A CONSTANT CANNOT BE WRONG. State can be stale, unset, or set by the wrong caller, and each of those is a write landing somewhere nobody chose.

THREE OF THE SEVEN CASES EXIST FOR THAT REASON ALONE: the teardown on failure, the refusal to nest, and the read staying unbounded. They are not padding; they are the price of the state being safe.
