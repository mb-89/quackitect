---
form: sty-know-whether-a-machine-change-helped
by: agent
signed_off: 2026-08-20T13:09:43.399Z
authors: agent
files: null
---

# Evidence form / sty-know-whether-a-machine-change-helped

## current_situation

The first benchmark run in this project's history was performed, and it worked.

DEMONSTRATED FOR REAL against this repository's own archive, not a fixture. `project/scratchpad/demo-benchmark.mjs` drives the shipped functions.

THE RUN NAMED i33 BECAUSE THE DEFAULT PICK REFUSED, and the refusal is itself part of what was demonstrated.

## built

WHAT WAS OBSERVED, in order, on 2026-08-20.

THE CYCLING PICK REFUSED AT BIND, correctly and with its cause named.

    least recently benchmarked  i1-prove-a-bases-equivalent-live-table-can-
    BIND  REFUSED — no rewind point for i1-... — no single commit names it as
          started, so the history cannot be cut

THAT IS THE DESIGN'S OWN LAW WORKING: the refusal happens once, at the earliest point the cause is knowable, rather than binding and failing per request.

NAMING i33, THE RUN BOUND.

    rewind point   20abd831543481309f50071be2a5436166205fd5
    control ran    true
    stop_at        shipped

    change_size    minor
    se_version     6.0.0

    harness        claude-code-remote
    model          claude-opus-5
    effort         high

    stamp_covers   six directories, each with its own hash

EVERY ONE OF THE TEN FIELDS RECORDED. `stamp_covers` carries the set rather than the matrix hash alone, which is the thing this iteration called a lie in writing when the matrix stood by itself.

THE CONTROL RAN AND PASSED. An older iteration's files were found in the stood tree, so an empty fetch could not have passed as a correct rewind.

THE RUN CLOSED AND SAID WHERE IT ACTUALLY ENDED.

    {"ended":"i33-...","stop_at":"shipped","ended_at":"run-demos","reached_the_end":false}

`reached_the_end: false` is the honest answer: the run was told to go to `shipped` and ended at `run-demos`. Both fields are recorded and they disagree, which is exactly the case the design says a reader must be able to see.

WHAT THIS DEMONSTRATES AND WHAT IT DOES NOT. A paired number is now REACHABLE — one run exists where there were none. Judging a machine change needs TWO runs on two machine versions, and there has been one. The drawing said so before the run and it is still true after it.

## follow_up

- THE DEFERRED PROBE RAN HERE AND THE ASSUMPTION IS FALSE. `raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it` is measured: 16 shipped iterations, SIX with exactly one started commit, TEN with none, none with two. `rewindPointFor` resolves 6 of 16.
- THE BENCHMARK POOL IS SIX, NOT SIXTEEN, and that changes a design claim rather than just a number. Cycling through the archive cycles through six: i5, i6, i11, i16, i33, i35. The owner's `the pool moving is an upside` still holds, and the pool is a third of what the kickoff assumed.
- THE DEFAULT RUN IS UNUSABLE UNTIL THAT IS FIXED. `leastRecentlyBenchmarked` sorts un-benchmarked first, and the lowest-sorting is i1, which has no start commit — so `se_benchmark` with no argument refuses every time until either the pool is filtered to what can bind, or the ten records get their commits.
- THE SECOND DEMO IS NEXT and it tries every door to the future.
- `se_benchmark` COULD NOT BE CALLED THROUGH THE LANE, because the running server predates the verb and `se_reload` is not legal here. The mechanism was driven directly instead. The verb's registration is proved separately by the trace-coverage enumerator, which counts it, and by the typecheck.

## anything_else

THE PROBE RESULT IS THE MORE USEFUL OUTPUT OF THIS DEMO, and it was found by running rather than by reading.

THE NODE WAS DEFERRED WITH AN UNTIL — a state where `se_git` is legal — precisely so it would not be forgotten. It came due here, took one script, and the answer is worse than the node feared. It suspected records predating the `markStarted` guard might be unstamped. TEN OF SIXTEEN ARE, including i27 which the node named as the visible sign, and also i15, i28 and i34, which are recent.

THE MECHANISM IS ON THE NODE ALREADY. `markStarted` returns early when a record already carries `started:`, so a field written any other way suppresses the commit forever — and every one of the sixteen has the field. The field's presence is what hides its absence.

SO A DESIGN CLAIM MOVED. `an archived iteration is the benchmark and nothing is authored` rests on the archive being reachable, and two thirds of it is not. Nothing about the mechanism changes; what changes is how much material it has.

AND THE HONEST NOTE ON THIS DEMONSTRATION'S OWN LIMIT. It ran the functions, not the verb, because the server in this session predates the verb. That is a weaker demonstration than driving the lane, and it is weaker in exactly the place a reader would want it strongest — whether an AGENT can start a run, rather than whether the code works.
