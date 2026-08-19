---
id: i37-training-iterations-a-disposable-iterati
status: open
started: 2026-08-19T16:38:23.768Z
opened: 2026-08-19T15:42:15.402Z
goal: "Training iterations: a disposable iteration seeded by command, sized by draw or by choice, walked by an agent so the walk itself can be timed, and discarded without ever reaching the archive."
vision: "THE FULL BRIEF IS COMMITTED at project/spec/training-iterations.md, with its outward scan and citations at project/spec/references/ref-agent-benchmark-harnesses-2026.md. READ BOTH BEFORE DESIGNING.\n\nWHY IT EXISTS. Running an iteration is too slow, and nothing measures it. The owner's complaint has stood since 2026-08-14 with no number behind it. A real iteration is walked once and the next one is a different job, so two real walks differ in a hundred ways and the numbers measure the job rather than the machine. A training iteration is the same job, walked as often as needed, by any agent, on any host.\n\nWHAT IT IS. A disposable iteration. Five properties, all the owner's words. It is seeded by one command. Its size is chosen or drawn at random. Its steps carry work that produces correctly shaped data. It never enters the archive. Several stand open at once and none counts as a normal iteration.\n\nTHE DATA IS WORTHLESS AND THE SHAPE IS NOT. Evidence written in a training iteration passes the same form checks a real one passes. The agent walks the real machine, never a mock of it.\n\nIT IS NOT A REPLAY, AND THE WORD MATTERS. i31 owns replay: recorded results fed back, the agent never re-invoked. A training iteration re-invokes the agent every time. Conflating the two is the pain i31's own record warns about.\n\nMOST OF THIS ALREADY EXISTS IN THE TEST SUITE. project/deliverable/tests/fallback-outcome.test.ts carries a section headed THE BENCHMARK WALK, written from the owner's 2026-08-18 request for exactly this. It stands a real session on a throwaway root, seeds an iteration, blesses the kickoff, and walks the pinned column. Its fillFor function already auto-fills every form from the form's own field templates. Its walkTo already counts forms filled, so a stop that costs too much is visible. THE BUILD IS THAT FIXTURE PROMOTED OUT OF THE TEST SUITE, with the filling handed BACK to the agent, because the agent is what is being timed.\n\nRANDOM VERSUS PREPARED IS ONE QUESTION, NOT TWO. Property-based testing settled it: generate at random, record the seed. se_seed_training takes an optional seed, an optional size and an optional scenario. No seed mints one, prints it and writes it into the record. A given seed reproduces the draw exactly. Fixed and random stop being two features and become one lever.\n\nSIZE IS THE SCALE FACTOR AND NEEDS NO NEW MECHANISM. The change-size column already decides how many states the walk visits. The training seed pins a column exactly as a real kickoff does. A patch run is the short benchmark and a product run is the long one. Quote the size with the number, as TPC-H quotes its scale factor.\n\nTHE POOL IS AUTHORED, SMALL AND COMMITTED. Three to five scenarios. Each carries a coherent fake subject, the delta this iteration is meant to make to it, the columns it is honest at, and a sandbox package. RANDOM PER-FIELD TEXT IS REJECTED: it contradicts itself between states, the agent spends its time confused, and confusion reads as machine drag.\n\nTHE SANDBOX PACKAGE IS THE BIGGEST BUILD ITEM. build-steps runs a seeded chunk machine, observe-red demands a failing test, and verification runs the battery. So each scenario ships a tiny real package inside the training folder, with tests that really go red and really go green, touching nothing outside that folder. Without it the training iteration measures the paperwork only.\n\nTHE SEPARATE FOLDER IS NOT COSMETIC. itSeed numbers a new iteration from the highest i<n> in project/spec/iterations, and se_survey counts that same folder. Training iterations take t<n> ids at project/spec/training/<id>/. Sharing the folder would eat iteration numbers and inflate every count the front desk reads. The separation is what makes \"does not count\" true rather than merely claimed.\n\nTHE RECORD IS DISPOSABLE AND THE MEASUREMENT IS NOT. One committed line per run. .se/ is machine-local and a cloud box is reclaimed, so a result living only in the call log did not happen. Every line stamps its conditions: seed, size, scenario, rigor matrix hash, se version, harness, model, effort, wall clock and lane calls per state, forms filled, forms REFILLED after a refusal, refusals by clause, states visited and re-entered. i36 is the argument for the stamp.\n\nTHE CALL LOG ALREADY CARRIES THE RAW MATERIAL. engine/calllog.ts records ts, tool, ok, outcome and duration_ms per dispatch. Timing needs no new capture, only derivation and export.\n\nWHAT IS MEASURED IS THE MACHINE'S DRAG, NEVER QUALITY. A training iteration cannot tell a good decision from a bad one, because there is no real subject to decide about. Write that limit into the record rather than leaving it to be discovered.\n\nTHE HONESTY RULING, AND IT IS THE OWNER'S TO OVERTURN. The agent is TOLD it is walking a training iteration. It is not blinded. An agent that knows its output is thrown away works differently, so the number describes process overhead and not production behaviour. A blind training iteration would measure production behaviour honestly and would require the machine to lie to the agent. That trade was not taken here.\n\nNEVER COMPARE TWO SINGLE RUNS. Tau-bench measured function-calling agents at pass^8 below 25 percent against single-trial scores under 50 percent. Runs vary that much. Report a median over at least three runs with the spread beside it, and compare only within one set of conditions.\n\nTWO SEEDED ITERATIONS ARE WAITING ON THIS FIXTURE, and neither is a dependency. i31 records a walk so a guidance change can be A/B tested. i32 ranks states by drag and its own record says \"one run per setting proves nothing\". This iteration can be built alone, and it makes both of theirs mean something.\n\nTHREE OPEN QUESTIONS ARE THE OWNER'S. Blind or open, with open recommended. Trunk or machine-local, with a trunk folder recommended so a cloud box can be pointed at a named training iteration. Whether the training walk pays the full narration toll and reading proof, with yes recommended, because those tolls ARE part of what is being measured.\n\nONE STRAY FOUND WHILE RESEARCHING: se_web_search refuses with SE-C-106 because no SE_BRAVE_API_KEY is set. The scan was done with se_web_fetch on named sources, so most of its Part A is marked RECALLED rather than CONFIRMED. A key would raise that grade."
inputs:
  - "project/spec/training-iterations.md"
  - "project/spec/references/ref-agent-benchmark-harnesses-2026.md"
  - "project/deliverable/tests/fallback-outcome.test.ts"
  - "project/deliverable/tests/helpers.ts"
  - "project/deliverable/engine/calllog.ts"
  - "project/deliverable/engine/iterations.ts"
  - "project/spec/iterations/i31-the-process-becomes-measurable-a-walk-re/record.md"
  - "project/spec/iterations/i32-the-agent-s-thinking-is-measured-capture/record.md"
  - "project/spec/iterations/i36-the-harness-is-not-claude-measure-what-e/record.md"
depends_on: []
---

# i37-training-iterations-a-disposable-iterati

## Goal

Training iterations: a disposable iteration seeded by command, sized by draw or by choice, walked by an agent so the walk itself can be timed, and discarded without ever reaching the archive.

## Rough vision

THE FULL BRIEF IS COMMITTED at project/spec/training-iterations.md, with its outward scan and citations at project/spec/references/ref-agent-benchmark-harnesses-2026.md. READ BOTH BEFORE DESIGNING.

WHY IT EXISTS. Running an iteration is too slow, and nothing measures it. The owner's complaint has stood since 2026-08-14 with no number behind it. A real iteration is walked once and the next one is a different job, so two real walks differ in a hundred ways and the numbers measure the job rather than the machine. A training iteration is the same job, walked as often as needed, by any agent, on any host.

WHAT IT IS. A disposable iteration. Five properties, all the owner's words. It is seeded by one command. Its size is chosen or drawn at random. Its steps carry work that produces correctly shaped data. It never enters the archive. Several stand open at once and none counts as a normal iteration.

THE DATA IS WORTHLESS AND THE SHAPE IS NOT. Evidence written in a training iteration passes the same form checks a real one passes. The agent walks the real machine, never a mock of it.

IT IS NOT A REPLAY, AND THE WORD MATTERS. i31 owns replay: recorded results fed back, the agent never re-invoked. A training iteration re-invokes the agent every time. Conflating the two is the pain i31's own record warns about.

MOST OF THIS ALREADY EXISTS IN THE TEST SUITE. project/deliverable/tests/fallback-outcome.test.ts carries a section headed THE BENCHMARK WALK, written from the owner's 2026-08-18 request for exactly this. It stands a real session on a throwaway root, seeds an iteration, blesses the kickoff, and walks the pinned column. Its fillFor function already auto-fills every form from the form's own field templates. Its walkTo already counts forms filled, so a stop that costs too much is visible. THE BUILD IS THAT FIXTURE PROMOTED OUT OF THE TEST SUITE, with the filling handed BACK to the agent, because the agent is what is being timed.

RANDOM VERSUS PREPARED IS ONE QUESTION, NOT TWO. Property-based testing settled it: generate at random, record the seed. se_seed_training takes an optional seed, an optional size and an optional scenario. No seed mints one, prints it and writes it into the record. A given seed reproduces the draw exactly. Fixed and random stop being two features and become one lever.

SIZE IS THE SCALE FACTOR AND NEEDS NO NEW MECHANISM. The change-size column already decides how many states the walk visits. The training seed pins a column exactly as a real kickoff does. A patch run is the short benchmark and a product run is the long one. Quote the size with the number, as TPC-H quotes its scale factor.

THE POOL IS AUTHORED, SMALL AND COMMITTED. Three to five scenarios. Each carries a coherent fake subject, the delta this iteration is meant to make to it, the columns it is honest at, and a sandbox package. RANDOM PER-FIELD TEXT IS REJECTED: it contradicts itself between states, the agent spends its time confused, and confusion reads as machine drag.

THE SANDBOX PACKAGE IS THE BIGGEST BUILD ITEM. build-steps runs a seeded chunk machine, observe-red demands a failing test, and verification runs the battery. So each scenario ships a tiny real package inside the training folder, with tests that really go red and really go green, touching nothing outside that folder. Without it the training iteration measures the paperwork only.

THE SEPARATE FOLDER IS NOT COSMETIC. itSeed numbers a new iteration from the highest i<n> in project/spec/iterations, and se_survey counts that same folder. Training iterations take t<n> ids at project/spec/training/<id>/. Sharing the folder would eat iteration numbers and inflate every count the front desk reads. The separation is what makes "does not count" true rather than merely claimed.

THE RECORD IS DISPOSABLE AND THE MEASUREMENT IS NOT. One committed line per run. .se/ is machine-local and a cloud box is reclaimed, so a result living only in the call log did not happen. Every line stamps its conditions: seed, size, scenario, rigor matrix hash, se version, harness, model, effort, wall clock and lane calls per state, forms filled, forms REFILLED after a refusal, refusals by clause, states visited and re-entered. i36 is the argument for the stamp.

THE CALL LOG ALREADY CARRIES THE RAW MATERIAL. engine/calllog.ts records ts, tool, ok, outcome and duration_ms per dispatch. Timing needs no new capture, only derivation and export.

WHAT IS MEASURED IS THE MACHINE'S DRAG, NEVER QUALITY. A training iteration cannot tell a good decision from a bad one, because there is no real subject to decide about. Write that limit into the record rather than leaving it to be discovered.

THE HONESTY RULING, AND IT IS THE OWNER'S TO OVERTURN. The agent is TOLD it is walking a training iteration. It is not blinded. An agent that knows its output is thrown away works differently, so the number describes process overhead and not production behaviour. A blind training iteration would measure production behaviour honestly and would require the machine to lie to the agent. That trade was not taken here.

NEVER COMPARE TWO SINGLE RUNS. Tau-bench measured function-calling agents at pass^8 below 25 percent against single-trial scores under 50 percent. Runs vary that much. Report a median over at least three runs with the spread beside it, and compare only within one set of conditions.

TWO SEEDED ITERATIONS ARE WAITING ON THIS FIXTURE, and neither is a dependency. i31 records a walk so a guidance change can be A/B tested. i32 ranks states by drag and its own record says "one run per setting proves nothing". This iteration can be built alone, and it makes both of theirs mean something.

THREE OPEN QUESTIONS ARE THE OWNER'S. Blind or open, with open recommended. Trunk or machine-local, with a trunk folder recommended so a cloud box can be pointed at a named training iteration. Whether the training walk pays the full narration toll and reading proof, with yes recommended, because those tolls ARE part of what is being measured.

ONE STRAY FOUND WHILE RESEARCHING: se_web_search refuses with SE-C-106 because no SE_BRAVE_API_KEY is set. The scan was done with se_web_fetch on named sources, so most of its Part A is marked RECALLED rather than CONFIRMED. A key would raise that grade.

## Inputs

- project/spec/training-iterations.md
- project/spec/references/ref-agent-benchmark-harnesses-2026.md
- project/deliverable/tests/fallback-outcome.test.ts
- project/deliverable/tests/helpers.ts
- project/deliverable/engine/calllog.ts
- project/deliverable/engine/iterations.ts
- project/spec/iterations/i31-the-process-becomes-measurable-a-walk-re/record.md
- project/spec/iterations/i32-the-agent-s-thinking-is-measured-capture/record.md
- project/spec/iterations/i36-the-harness-is-not-claude-measure-what-e/record.md

## Owner rulings, 2026-08-19

The three open questions in the vision above are answered. The brief at
project/spec/training-iterations.md carries them in full.

- OPEN, NOT BLIND. The agent is told it is walking a training iteration.
- NOTHING IS COMMITTED. The training folder lives in the tree and is ignored
  by git. The training seed writes; it does not commit. That is a real
  difference from itSeed, which commits its record as part of the seed.
- THE FULL TOLL IS PAID. The narration toll and the reading proof are part of
  what is being measured.

A FOURTH RULING REPLACED THE REPLAY VERDICT. Do not design against a
malicious agent. The agent reads through the lane, the lane can hide what it
likes, and a workaround shows up in the call log afterwards.

WHAT THAT CHANGES. The objection to reusing an archived iteration was framed
as trust and was withdrawn. The remaining objection is coverage, and it is
arithmetic: 282 files under project/spec/trace mention i15 or i34, so masking
one iteration folder hides the record and not the answers. Build the mask
anyway. Take an archived iteration as a silhouette, never as a script.

WHAT THE MASK COSTS TO BUILD, measured on this build. Lane hiding stands in
three places with three different lists. paths.ts EXCLUDED_DIRS is called by
list and glob only. search.ts carries its own two-entry ripgrep list.
se_file_read applies no exclusion at all. se_git allows show, log and diff,
which reach a masked path through git itself.

TWO THINGS ARE STILL OWED. How a training iteration is NAMED is parked for a
conversation of its own. Whether the results ledger is committed is the one
place the not-committed ruling needs a word.

## Owner rulings, 2026-08-19 — the second round

THE RIGOR MATRIX MOVING IS NOT A COST. The machine is a VARIABLE in this
experiment, not a constant. The question is whether a weaker model on an
improved machine does the same work as a stronger model on the old machine.
So the measurement is a GRID whose axes are the model, the machine version,
the size and the scenario. Comparing across matrix versions is the point.

TWO CONSTRAINTS FALL OUT, and both bind the scenario pool.

- A scenario never encodes the machine's shape. No expected form answers, no
  step lists, no state names. A subject, a delta, a size range and a sandbox.
  Anything else lets a matrix edit invalidate the pool, and the pool is the
  one thing that has to survive.
- The sandbox's red-to-green is matrix-independent too. The tests belong to
  the fake package, never to the walk.

THE RESULTS LEDGER IS REPLACED BY A REPORT TEMPLATE. No raw measurement dump
in version control. A benchmark run fills a template like the rest of the
corpus, and the filled report is committed.

THE MACHINERY COSTS NO ENGINE CHANGE. engine/vocabulary.ts scans
machines/items/ with readdirSync, so a new item template is discovered by
being written. Its own comment states the rule, citing
req-a-check-binds-without-engine-code.

THE PRECEDENT IS THE EXPERIMENT NODE. machines/items/experiment.md already
says of a spike that the run is throwaway and the record is not. A benchmark
run is the same shape.

SO ADD ONE ITEM TEMPLATE, benchmark-run, at project/spec/benchmarks with the
bench- prefix. One report is one cell of the grid, over at least three runs.

THE REPORT IS HIDDEN FROM THE AGENT DURING A TRAINING WALK, or the agent
reads the last run's numbers and works toward them.

SO THE MASK IS CONDITIONAL, NOT STATIC. EXCLUDED_DIRS hides a folder always.
This one hides the benchmarks folder only while a training walk is bound. A
normal iteration must still read its own benchmark history. One mask, two
customers: the scenario source and the reports.

ONE THING IS STILL OWED. How a training iteration is NAMED is parked for a
conversation of its own.

## Owner rulings, 2026-08-19 — the third round, and the design is settled

AN ARCHIVED ITERATION IS THE BENCHMARK. Nothing is authored. Two earlier
designs are STRUCK: the scenario pool and the sandbox package. The reason is
the cost they existed to pay, and the archive already paid it.

MEASURED, and it is what makes the ruling work. At 5f85977f^ — the commit
before i33 started — its record stands with status seeded, carrying goal,
vision and inputs, and carrying no pin. That is exactly the state a real walk
begins from. The design input costs nothing because it was written once, for
real, by whoever seeded it.

THE REWIND REPLACES THE PATH MASK. A run puts a throwaway tree back to that
commit. At that point the requirements, RAID nodes and experiments the
iteration wrote do not exist yet, so the answers are hidden by construction
rather than by a filter. The 282-file objection does not apply.

ONE RULE IS STILL OWED. A clone holds every commit and se_git allows show,
log and diff. So while a run is bound, a commit that is not an ancestor of
the training tree HEAD does not resolve. The same ceiling binds ref: reads.

RED-TO-GREEN IS GENUINE AND FREE. author-tests writes the tests, observe-red
watches them fail, build-steps makes them pass, all against the tree as it
stood. The original code is in the future and the ceiling hides it.

THE NAME IS THE ITERATION'S OWN. "Iteration 33 got ten percent smaller" is
readable. No second naming vocabulary is minted.

MINOR AND MAJOR ARE THE COLUMNS. Patch is done ad hoc. Product happens once
as a product first iteration. Specification is derived from the iterations
that already ran. None of the three is a gap.

THE POOL GROWS AND THAT IS AN UPSIDE. Old results are kept, comparison is
per-iteration, and a new candidate cannot disturb a measured pair.

RUNS CYCLE THROUGH THE ARCHIVE. A run takes the least recently walked
iteration rather than repeating the last one. The reports folder is the
scheduler state, so no second ledger exists.

SO THE AGGREGATION CHANGES. Pair an iteration against itself across machine
versions, take the DELTA of the pair, and aggregate deltas rather than raw
times. Iterations differ enormously in size, so a mean of absolutes measures
the sample rather than the machine.

QUALITY IS COMPARABLE AFTER ALL, and an earlier line said it was not. The
original walk evidence is a REFERENCE the re-walk can be read against. It is
not a correct answer, so the comparison is a reading rather than a score.

A RUN HAS A SECOND OUTPUT. Re-litigating an old design surfaces better ideas,
about the original decision and about the machine. Short findings ride a
field on the report. A finding worth acting on becomes a note for the retro.

THAT BEARS ON THE ONE THING STILL OWED. A run cut short before the design
gates keeps the timing and loses the audit. Where a run stops is not ruled.

## Owner rulings, 2026-08-19 — the fourth round

WHERE A RUN STOPS IS CONFIGURABLE. The default is the whole walk. A run may
be told to stop at a named gate instead. The trade is stated rather than
hidden: a stop before the design gates keeps the timing and loses the design
audit.

NO DEDICATED VALUE PROPOSITION. A value proposition is customer-facing and
this is not that. This belongs to vp-rigor-without-toil, which already
measures the machine own overhead rather than a feature, and whose criteria
already carry directional targets read retro over retro. The walk authors the
new criterion at the state that derives value.

FULL AUTONOMY GRANTED for this walk. Gates may be blessed by the agent. Web
research is allowed. The dial was raised to ideation by restarting the lane
with SE_AUTONOMY, which is the mechanism the guidance names as the owner
call. There is no lane verb for it on purpose — discipline.test.ts asserts
the slider is the person alone.

THE BRANCH IS claude/training-iterations-research-9kq6g2. The owner offered
v3 or a dedicated branch and left the choice open. The designated branch is
the dedicated one and the work stays there.

