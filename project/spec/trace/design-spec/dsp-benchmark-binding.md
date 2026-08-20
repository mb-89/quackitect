---
minted_in: i37-training-iterations-a-disposable-iterati
id: dsp-benchmark-binding
type: "[[design-spec]]"
statement: "A run's whole lifetime: which iteration it re-walks, where its history is cut, and the three conditions no log can recover."
realizes:
  - el-benchmark-binding
  - if-benchmark-binding-to-guard
  - if-benchmark-report-to-binding
files:
  - project/deliverable/engine/benchmark.ts
  - project/deliverable/engine/tools.ts
---

## Responsibility

THE BINDING IS THE RUN. Everything else exists only while it stands and dies
with it.

- Choose the iteration: a given id, or the least recently benchmarked one read
  from the reports folder.
- Locate the rewind point: the parent of the commit whose message is
  `iteration <id>: started`.
- Stand the tree at that point.
- Write the three conditions no log holds — the model, the reasoning effort and
  the harness.
- Refuse to bind at all where any of the above cannot be established.

WHAT IT DELIBERATELY DOES NOT DO. It never touches `project/deliverable`. The
engine being measured is today's engine, which is the whole point of the
exercise.

## Interface

ONE VERB, BECAUSE A RUN HAS ONE LIFETIME.

    se_benchmark {iteration?, stop_at?}   opens a run
    se_benchmark {stop: true}             ends one

THE ALTERNATIVES WERE SETTLED ON THE ELEMENT CARD after three deferrals. A desk
door was rejected because a measuring instrument does not belong in the same
list as expeditions and iterations. Nothing at all was rejected because binding
is an act that can refuse, and a refusal needs a caller it can reach.

## Behavior and constraints

STANDING THE TREE IS TWO COMMANDS AND THE FIRST IS NOT OPTIONAL.

    git update-ref refs/bench/<id> <rewind-commit>
    git fetch --depth 1 <source> refs/bench/<id>:refs/heads/bench

A BARE OBJECT ID CANNOT BE FETCHED without `uploadpack.allowAnySHA1InWant`, so
the rewind commit is named as a ref first. Measured on i33 during M6: 1723 files
at depth 1, and `git rev-parse` on i33's own start commit does not resolve.

THE REWIND IS THREE-WAY, NOT TWO-WAY. `project/spec` rewound; `project/deliverable`
and `project/guidance` current; history bounded. A whole-tree rewind FAILS TO
COMPILE, and the engine proved that itself rather than a reviewer noticing.

`project/guidance` IS METHOD RATHER THAN SUBJECT. That is why it stays current,
and it is the half the first design got wrong.

THE REFUSAL IS AT BIND TIME, NEVER PER REQUEST. A run that cannot establish its
own ceiling never opens. The alternative — binding and refusing per request —
produces a report full of refusals that reads as a machine failure rather than
as a guard.

## The pool is what can bind

SHIPPED IS NOT THE SAME AS BENCHMARKABLE. Measured 2026-08-20: of sixteen
shipped iterations, TEN have no commit naming them started, so their history
cannot be cut.

`markStarted` RETURNS EARLY when a record already carries `started:`, so a
field written any other way suppresses the commit forever — and all sixteen
have the field, which is exactly what hid it.

THE DEFAULT PICK USED TO LAND ON ONE OF THE TEN AND REFUSE EVERY TIME, because
never-benchmarked sorts first and the lowest-sorting shipped iteration is one
of them. So `se_benchmark` with no argument was unusable.

THE DROPPED COUNT IS RETURNED, NOT SWALLOWED. `benchmarkPool` gives the pick,
the pool, the shipped count and the names of what it could not reach. A pool
that quietly shrinks is the failure this iteration kept finding in other laws,
and it is not one this design gets to repeat.

THE POOL IS SIX: i5, i6, i11, i16, i33, i35. Backfilling the other ten is
archaeology — the right commit for each has to be found rather than guessed,
and a guessed rewind point is worse than none.

## Rationale

THE TREE IS FETCHED, NOT EXPORTED, and this was wrong on the element's first
statement. `git archive` leaves no `.git`, so every git verb is dead inside the
tree, including the ones an agent legitimately uses to read the past.

Both corrections came from `exp-can-the-lane-read-from-a-history-that-ends-at-the-rewind-point`
and `exp-does-the-current-engine-run-against-a-rewound-tree`, and both were
found by RUNNING rather than by review.


## The two crossings this design carries

TO THE GUARD. The binding hands over the rewind commit and the fact that a run
is open, and the guard answers every later resolution against them. Nothing else
crosses: the guard never asks which iteration, and the binding never asks what
was refused.

FROM THE REPORTS FOLDER. The folder tells the binding which iteration was
benchmarked least recently, and it is the ONLY state a cycling run reads. That
makes it the one backward crossing in the element matrix, and it is read before
the binding opens rather than during it — a run that has already bound cannot
change which iteration it is.
