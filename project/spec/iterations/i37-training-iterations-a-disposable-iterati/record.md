---
id: i37-training-iterations-a-disposable-iterati
status: seeded
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
