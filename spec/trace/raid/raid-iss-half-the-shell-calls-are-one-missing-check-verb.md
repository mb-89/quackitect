---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-half-the-shell-calls-are-one-missing-check-verb
type: "[[raid]]"
kind: issue
statement: Nineteen of the thirty-nine shell commands in the i37 window were a typecheck or a lint, and the lane has no verb that runs either on its own.
owner: the driving agent
trigger: the next iteration that edits engine source, which is nearly every iteration
status: open
looked: 2026-08-20
impact: An agent that has just edited engine source wants an answer in two seconds and the only lane verb that gives one is the two-minute battery. So it reaches for the shell, which is the exact traffic the retro exists to drive down.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - i37-training-iterations-a-disposable-iterati
place: i39-the-lane-tells-the-truth-about-itself-de
---

## The shapes, grouped

Thirty-nine `se_run` calls, grouped by what they do rather than by when they
ran:

- 16 typecheck. `npx tsc --noEmit` and its variants.
- 3 lint. `npx biome check`.
- 20 genuine shell work. Git plumbing for the benchmark spikes, timing probes,
  and two throwaway lane instances on another port.

The last group is the shell doing what only a shell does, and the standing
ruling says that is encouraged. The first two are a missing verb.

## The capability already exists and is not reachable

`se_file_patch` TYPECHECKS EVERY PATCH. It returned `typecheck_error` several
times during this window and that is how two mistakes were caught within one
call of being made.

SO THE ENGINE CAN ALREADY DO THIS. What it cannot do is answer the question on
its own, for a file written rather than patched, or for the tree as a whole.

## What would close it

A verb that runs the fast checks and answers in seconds — typecheck and lint,
nothing else, no battery. `se_test` is the right neighbour and the wrong
answer: it decides scope from a question and its floor is the battery.

NAME IT FOR WHAT IT ANSWERS, not for what it runs. The question is "does what
I just wrote still compile and still pass the linter", and the answer is two
counts and the failures.
