---
form: fix-findings
by: agent
signed_off: 2026-08-20T11:46:19.497Z
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

fix-findings, two rounds against one standing gatekeeper.

ROUND ONE closed seven findings and INTRODUCED TWO REGRESSIONS. The gatekeeper caught both, plus five it had not seen before.

ROUND TWO closed those. The benchmark suite is 30 of 30, `tsc` and biome are clean, and the tree is quiescent.

THE BATTERY HAS NOT RUN SINCE. It belongs to verification's exit script and neither `se_test` nor a shell test run is legal here — which is the machine holding a job, not an obstacle. The walk returns to verification and the battery is what decides.

## follow_up

- verification re-runs its exit script, which is the battery. That is the check this state could not make.
- THE GATEKEEPER'S THREE CONDITIONS MUST BE HONOURED AT VERIFICATION, and they are not optional.
  - `tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound` is carried as OWED, explicitly, with its reason. If it is ever marked green the F9/F10 removal becomes quarantining retroactively.
  - `tsp-a-bound-run-cannot-reach-past-its-rewind-point` MUST NOT GO GREEN on the cases that exist. Three of its seven steps have no case: an ancestor resolving, a refusal that NAMES the rewind point, and every ref-taking verb covered alike.
  - A RUN PERFORMED BEFORE THE CONCEALMENT LANDS is measuring an agent that could have read the answer key. `project/spec/benchmarks` is readable to a bound run, and `leastRecentlyBenchmarked` reads it too. Any report from that window carries the caveat.
- F5 IS DEFERRED TO M8 ON THE GATEKEEPER'S OWN REASONING. The ceiling this iteration chose is STRUCTURAL and it is built and tested; what is missing is that a bound run's lane verbs still read the live root. That is the same seam as the door, and now that `se_benchmark` exists and `isBound` has a consumer, wiring `ref` through it is bounded work.
- F6 WAS NOT DEFERRED, and the gatekeeper's argument is why. A mechanism reachable only from its own unit test cannot pass an implementation gate, and deferring the door defers the inspection spec with it — which verifies a `must`/`fatal` requirement. Blessing a fatal constraint on zero observations is what `meth-verification-discipline` forbids in as many words.
- THE HISTORICAL CALL LOG IS NOT A BASELINE. Nothing recovers a position for records written before the stamp; the first runs measure only themselves.

## anything_else

TWO OF MY OWN FIXES WERE WORSE THAN WHAT THEY REPLACED, and both were caught by the same standing gatekeeper rather than by any check I ran.

THE POSITIVE CONTROL FALSE-REFUSED THE DEFAULT RUN. I picked the neighbour as `the first shipped iteration that is not this one` off a LEXICOGRAPHIC sort. Iterations are numbered in order, so the oldest subject drew a NEWER neighbour — correctly absent from its rewound tree — and the control failed for the right reason about the wrong file. It landed on exactly the default pick, because with no reports folder every iteration is equally un-benchmarked and the tiebreak returns the lowest-sorting one. `i11` sorts before `i2`.

THE SENTINEL FIX MOVED A SILENT PASS INTO A LATE REFUSAL. Removing `"unknown"` was right, and it left `benchmarkBind` binding happily on empty conditions and the report refusing after the whole walk had run. That breaks this module's own law, written four lines above the bug: the refusal happens ONCE, at the earliest point the cause is knowable. It now refuses at bind and names which condition is unset.

THE UNSTAMPED LOG WAS THE SHARPEST FINDING OF THE PASS AND IT WAS MY OWN QUESTION. I asked whether a pre-stamp log degrades gracefully. It did not: one bucket holding 801 calls, three TYPED refusals that only a state gate can emit, and `entered: 0` — under the label `(before the first pull)`, which asserts a cause it cannot know. An empty answer is unmistakably broken. A plausible one is believed. It now throws, and the bucket is named `(unstamped)` after what it knows rather than after a reason.

THE PATTERN ACROSS ALL THREE IS ONE THING. Each fix was correct about the defect and wrong about the blast radius, and each was invisible to `tsc`, to biome, and to every case in the suite — because the cases were written by the same hand that wrote the code. That is the builder-verifies-their-own-build failure appearing a second time in one milestone, after I had already written it up as the lesson of round one.

WHAT MADE THE DIFFERENCE was a gatekeeper that PERSISTED. It re-ran its own probes from round one against the new code, which is how F3's closure was proved rather than asserted, and it held its earlier findings against my claims about them. `meth-verification-discipline` says one tester across the rounds, shown the deltas, never respawned to reread from zero. This iteration is the measured argument for that sentence.
