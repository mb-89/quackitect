---
id: training-iterations
kind: brief
statement: A benchmark run re-walks an archived iteration from the commit before it started, so the design input costs nothing to author and the walk itself can be timed.
written: 2026-08-19
---

# Training iterations — the brief

FOR THE AGENT THAT BUILDS THIS. The outward scan is
[[ref-agent-benchmark-harnesses-2026]]. Read it first. It carries the
sources and the four ways this benchmark can lie.

THE OWNER RULED ON 2026-08-19: an archived iteration IS the benchmark.
Nothing is authored. Two earlier designs — a scenario pool and a sandbox
package — are struck, and the reason is in the next section.

## Why it exists

RUNNING AN ITERATION IS TOO SLOW, and nothing measures it. The complaint has
stood since 2026-08-14 without a number behind it.

THE QUESTION IS NOT "HOW FAST". It is this:

> Does a weaker model on an improved machine do the same work as a stronger
> model on the old machine?

IF THE ANSWER IS YES, the machine is carrying weight the model used to carry.
That is the whole programme.

## Why nothing is authored

A BENCHMARK NEEDS A DESIGN INPUT — a goal, a vision, the context. Writing
those is the expensive part, and the owner has paid it before on an earlier
system. It is the cost this design refuses.

THE ARCHIVE ALREADY HOLDS THEM. Measured 2026-08-19 on `i33`: at the commit
before it started, `project/spec/iterations/i33-.../record.md` stands with
`status: seeded`, carrying its goal, its vision and its inputs, and carrying
no pin.

THAT IS EXACTLY THE STATE A REAL WALK BEGINS FROM. So the design input costs
nothing. It was written once, by whoever seeded the iteration, for real.

## The rewind

A BENCHMARK RUN PUTS THE TREE BACK to the commit before the iteration
started, and lets an agent walk it again.

FINDING THE TWO ENDS IS MECHANICAL. Every record's lifecycle commit carries
its id in the message.

- `iteration <id>: seed`
- `iteration <id>: started` — the rewind point is this commit's PARENT
- `iteration <id>: pin <size>`
- `iteration <id>: shipped` — the far end

MEASURED ON i33: `5f85977f` is its `started` commit, and `5f85977f^` is
`20abd831`. Reading the record at that ref returns the seeded record.

ITERATIONS INTERLEAVE ON TRUNK, and the rewind keeps that. `20abd831` is
i35's seed commit, so the tree at the rewind point carries other in-flight
work. That is the real state of the world at that moment, which is what a
comparable run wants.

## The mask is a clock, not a filter

THE EARLIER DESIGN MASKED PATHS. It was struck because the rewind does the
job better and by construction.

AT THE REWIND COMMIT, THE ANSWERS DO NOT EXIST YET. The requirements, the
RAID nodes and the experiments the iteration wrote are in its own later
commits. The 282 trace files that mention `i15` or `i34` are not a problem
here, because at the rewind point most of them are unwritten.

ONE RULE IS STILL NEEDED, and it is one rule. A clone's `.git` holds every
commit, including the future ones, and `se_git` allows `show`, `log` and
`diff`.

> THE GIT LANE TAKES A CEILING. While a benchmark run is bound, a commit that
> is not an ancestor of the training tree's HEAD does not resolve.

THE SAME CEILING BINDS `ref:` READS through the file lane. One rule, two
doors, and both are checkable.

THE SHELL HALF IS ALREADY BUILT. `engine/discipline.ts` classifies every
`se_run` command into eight categories, allows one warned run per category,
then refuses with SE-C-129. `no_tool_reason` runs it anyway and files the
reason. The counters persist across sessions.

DO NOT DESIGN AGAINST A MALICIOUS AGENT (owner ruling 2026-08-19). The lane
hides what it likes and a workaround shows up in the call log afterwards.

## Why the sandbox package is struck

THE BUILD STEPS DEMAND REAL CODE, and a re-walked iteration has real code to
write. `author-tests` writes the tests. `observe-red` watches them fail.
`build-steps` makes them pass. All of it against the tree as it stood.

SO RED-TO-GREEN IS GENUINE AND FREE. No fake package, no synthetic tests,
nothing authored. The agent does the work the original did.

THE ORIGINAL'S CODE IS IN THE FUTURE and the ceiling hides it. The run
produces its own answer, and the answer is thrown away.

## Choosing the benchmark

TWO WAYS IN, and both name a real iteration.

- BY ID. Re-walk `i33`.
- BY SIZE. Draw an archived iteration pinned at `minor` or at `major`.

A DRAW RECORDS ITS SEED, so it can be repeated. That is the only job the seed
has left.

THE NAME IS THE ITERATION'S OWN (owner ruling 2026-08-19). "Iteration 33 got
ten percent smaller" is a readable sentence. No second naming vocabulary is
minted.

THE COLUMNS THAT MATTER ARE `minor` AND `major`. Measured: 15 shipped
iterations, 11 pinned — 8 minor, 3 major, and none at patch, product or
specification. Those three are not gaps.

- PATCH work is done ad hoc and is rarely worth an iteration.
- PRODUCT happens once, as a product's first iteration.
- SPECIFICATION is derived from the iterations that already ran.

## Cycling through the archive

A RUN DOES NOT REPEAT THE LAST ONE (owner ruling 2026-08-19). It looks at
what has been benchmarked already and takes the iteration that is least
recently walked.

THE REPORTS ARE THE SCHEDULER'S STATE. `project/spec/benchmarks/` says which
iteration each run covered and when. Cycling is a query over that folder, so
no second ledger is needed.

WHY CYCLING BEATS REPEATING, and it revises the earlier advice on this page.
Three runs of one iteration buy a median against that iteration's variance.
One run each of eight iterations buys the same confidence for the same money
AND covers eight different shapes of work. The second is the better
experiment.

IT CHANGES HOW RESULTS ARE AGGREGATED. See "comparing runs" below.

## The pool grows, and that is an upside

THE POOL MOVES EVERY TIME AN ITERATION SHIPS, and it does not matter (owner
ruling 2026-08-19). Old results are kept, so nothing is invalidated by a new
candidate arriving.

A RESULT IS COMPARED WITHIN ONE ITERATION. `i33` against `i33`. The library
filling up adds cells; it never disturbs the ones already measured.

## The grid

EACH CELL IS ONE COMBINATION.

- the ITERATION being re-walked
- the MODEL, and its reasoning effort
- the MACHINE version — the rigor matrix hash plus the se version

THE MACHINE IS AN AXIS, NOT NOISE. A moved rigor matrix is a new column.
Comparing across matrix versions is the experiment, not a threat to it.

THE GOAL IS A DIRECTION, not a number. A machine improvement is real when a
weaker model reaches a cell that used to need a stronger one.

## The benchmark report

NO RAW MEASUREMENT DUMP IN VERSION CONTROL (owner ruling 2026-08-19). A run
fills a TEMPLATE, and the filled report is what is committed.

THE MACHINERY COSTS NO ENGINE CHANGE. `engine/vocabulary.ts` scans
`project/deliverable/machines/items/` with `readdirSync`, so a new item
template is discovered by being written. Its own comment states the rule:
"A vocabulary declared in `machines/items/<type>.md` costs one edit to that
file and no engine change, which is the whole point."
(`req-a-check-binds-without-engine-code`.)

THE PRECEDENT IS THE EXPERIMENT NODE. `machines/items/experiment.md` says of
a spike: "A STANDING ARTIFACT: the run is throwaway, the record is not." A
benchmark run is the same shape.

SO A NEW ITEM TEMPLATE, `benchmark-run`.

- `folder: project/spec/benchmarks`
- `id_prefix: bench-`
- The id carries the iteration: `bench-i33-<run>`.
- `checks` carry the vocabularies: the size column, the verdict, the harness.

EVERY REPORT STAMPS ITS CONDITIONS.

- the iteration re-walked, and the rewind commit
- the size it was pinned at
- the rigor matrix hash and the se version
- the harness, the model and the reasoning effort
- wall clock, total and per state
- lane calls, total and per state
- forms filled, and forms REFILLED after a refusal
- refusals counted by clause
- states visited, and states re-entered

WITHOUT THE CONDITIONS IT IS NOT A RESULT. i36 is the argument: the harness
is not Claude, and two hosts give the lane different things.

THE REPORTS ARE HIDDEN DURING A RUN. Otherwise the agent reads the last run's
numbers and works toward them.

SO THAT MASK IS CONDITIONAL, NOT STATIC. `project/spec/benchmarks/` is hidden
while a benchmark run is bound and visible everywhere else. A normal
iteration must be able to read its own benchmark history.

## The working tree is never committed

OWNER RULING, 2026-08-19: nothing about the run itself is committed. Only the
report is.

THE RUN HAPPENS IN A THROWAWAY TREE at the rewind commit. It is discarded
when the run ends.

IT NEVER TOUCHES THE REAL RECORD. `i33` is shipped and stays shipped. A
benchmark run does not reopen it, does not renumber anything, and does not
appear in `se_survey`.

## What is measured, and what is not

MEASURED — the machine's drag.

- Time and calls per state.
- Refills. A refill is a refusal the guidance failed to prevent.
- Refusal loops. The same clause twice in a row is a remedy that is not
  executable.
- Reading cost. The boot loop and every in-state read.

QUALITY IS COMPARABLE, NOT SCORED. This corrects an earlier line on this
page, which said quality could not be measured at all. That was true of an
authored scenario and is too strong here: the original walk's evidence is a
REFERENCE the re-walk can be read against.

THE ORIGINAL IS NOT A CORRECT ANSWER. It is what was decided once, and it may
have been wrong. So the comparison is a reading, done by a person or by an
agent, never a score the engine computes.

## The second output: what the re-walk finds

A BENCHMARK RUN IS ALSO A DESIGN AUDIT (owner ruling 2026-08-19). Walking an
old design again, with the arguments re-litigated, surfaces better ideas.

SO A RUN HAS TWO OUTPUTS.

- The numbers, which go in the report.
- The findings, which are about the original decision or about the machine.

THE FINDINGS NEED A HOME. A field on the report holds the short ones. A
finding worth acting on becomes a note, and the retro judges whether it mints
a work token.

THIS CHANGES THE ECONOMICS. A benchmark run is not pure overhead. It buys a
timing number AND a second look at a design nobody has questioned since it
shipped.

IT ALSO BEARS ON WHERE A RUN STOPS. The design half of the walk is where the
re-litigation happens, so a run cut short before the design gates buys the
timing and loses the audit.

## The honesty ruling

OWNER RULING, 2026-08-19: open, not blind. The agent is told it is walking a
benchmark.

THE COST IS ACCEPTED. An agent that knows the output is thrown away works
differently. The number describes PROCESS OVERHEAD, not production
behaviour.

## The toll

OWNER RULING, 2026-08-19: the run pays the full toll. The narration toll and
the reading proof are part of what is measured.

## Comparing runs

PAIR FIRST, THEN AGGREGATE. A comparison is `i33` on the old machine against
`i33` on the new one. The unit is the DELTA of that pair.

AGGREGATE THE DELTAS, NEVER THE ABSOLUTES. Iterations differ enormously in
size, so a mean of raw times says more about which iterations happened to be
in the set than about the machine.

THAT IS WHY THE GROWING POOL COSTS NOTHING. A new iteration entering the
library adds a pair. It cannot move a delta that was already measured.

- NEVER COMPARE TWO SINGLE RUNS OF DIFFERENT ITERATIONS. Tau-bench measured
  function-calling agents scoring `pass^8` below 25% against single-trial
  scores under 50%. Runs vary that much.
- A CYCLE IS THE SAMPLE. Report the median delta across the cycle's pairs,
  with the spread beside it.
- HOLD THE CONDITIONS FIXED WITHIN A PAIR. Same model, same effort, same
  size. Only the machine version moves.

## Where a run stops

IT IS CONFIGURABLE (owner ruling 2026-08-19). The default is the whole walk.
A run may be told to stop at a named gate instead.

THE TRADE IS STATED, NOT HIDDEN. A stop before the design gates keeps the
timing and loses the design audit. The person choosing the stop is choosing
which of the two outputs they are paying for.

## Where this sits in the value

NO DEDICATED VALUE PROPOSITION (owner ruling 2026-08-19). A value proposition
is customer-facing and this is not that.

IT BELONGS TO [[vp-rigor-without-toil]] — "As an engineer, I need the rigor
without the paperwork." That proposition already measures the machine's own
overhead rather than a feature, and its criteria already carry directional
targets read retro over retro.

- "WAITING IS TOIL TOO." Added by i12.
- "A BROKEN RULE COSTS ONE REFUSAL, NOT A HUNT." Added by i6.
- se_run calls as a share of all lane calls. Target: falling.

SO THIS ITERATION ADDS ONE CRITERION THERE, in the same shape. The claim is
that the machine carries more of the weight over time, and the measure is a
weaker model reaching a result a stronger model used to be needed for.

THE WALK WRITES IT, not this brief. The state that derives value is where a
criterion is authored.

## Still owed

Nothing. The design is settled.
