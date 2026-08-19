---
id: training-iterations
kind: brief
statement: A training iteration is a disposable iteration, seeded by command, walked by an agent for time, never committed, and discarded without ever reaching the archive.
written: 2026-08-19
---

# Training iterations — the brief

FOR THE AGENT THAT BUILDS THIS. The outward scan is
[[ref-agent-benchmark-harnesses-2026]]. Read it first. It carries the
sources, the four ways this benchmark can lie, and what the
synthetic-workload tradition already settled.

## Why it exists

RUNNING AN ITERATION IS TOO SLOW, and nothing measures it. The owner's
complaint has stood since 2026-08-14 without a number behind it.

TWO SEEDED ITERATIONS ALREADY WANT THIS FIXTURE.

- i31 records a walk so a guidance change can be A/B tested.
- i32 ranks states by drag, and its record says "one run per setting proves
  nothing".

NEITHER CAN RUN WITHOUT A REPEATABLE WORKLOAD. A real iteration is walked
once, and the next one is a different job. Two real walks differ in a hundred
ways, so the numbers measure the job rather than the machine.

A TRAINING ITERATION IS THE REPEATABLE WORKLOAD. It is the same job, walked
as often as needed, by any agent, on any host.

## What it is

A DISPOSABLE ITERATION. Five properties, all stated by the owner.

- It is seeded by one command.
- Its size is chosen, or drawn at random.
- Its steps carry work that produces correctly shaped data.
- It never enters the archive.
- Several stand open at once, and none counts as a normal iteration.

THE DATA IS WORTHLESS AND THE SHAPE IS NOT. Evidence written in a training
iteration passes the same form checks a real one passes. That is the whole
point: the agent walks the real machine, not a mock of it.

## What it is not

- IT IS NOT A REPLAY. i31 owns that word. A replay feeds recorded results
  back and never re-invokes the agent. A training iteration re-invokes the
  agent every time. An archived iteration may still be a SOURCE for a
  training scenario — see the mask section below.
- IT IS NOT A TEST. The test suite already walks the machine with the forms
  filled by a function. Here the AGENT fills them, because the agent is what
  is being timed.
- IT IS NOT A QUALITY MEASURE. See "the honesty ruling" below.

## The generator: one lever, not two modes

THE OWNER ASKED WHETHER THE WORK SHOULD BE RANDOM OR PREPARED. The answer
from property-based testing is that this is one question, not two.

    se_seed_training {size?, seed?, scenario?}

- NO SEED — one is minted, printed, and written into the record. The draw is
  random and reproducible afterwards.
- A SEED — the same draw comes back exactly. This is the "prepared" mode, and
  it costs no second mechanism.
- NO SIZE — a change-size column is drawn.
- A SIZE — that column is pinned.

THE SEED IS THE PORTABLE ARTIFACT. Nothing about a training iteration is
committed, so a second machine does not FETCH one. It REGENERATES one from
the seed, the size, the scenario name and the pool version. Those four values
are the whole handover.

## Size is the scale factor

THE CHANGE-SIZE COLUMN ALREADY DECIDES HOW BIG THE WALK IS. `patch`, `minor`,
`major`, `product` and `specification` compile different numbers of states
out of the same rigor matrix.

SO SIZE NEEDS NO NEW MECHANISM. The training seed pins a column exactly as a
real kickoff does. A `patch` run is the short benchmark. A `product` run is
the long one.

THIS MATCHES THE SYNTHETIC-DATABASE TRADITION. TPC-H results are always
quoted with their scale factor. Size is part of the result, never a hidden
setting.

## The scenario pool

THE POOL IS AUTHORED, SMALL AND COMMITTED. Three to five scenarios to start.
The pool is the one part of this system that IS committed, because it is the
specification of the workload and a workload nobody wrote down cannot be
compared with itself later.

EACH SCENARIO CARRIES FOUR THINGS.

- A fake subject. A coherent pretend feature, stated once.
- A fake delta. What this iteration is supposed to change about it.
- A size range. Which columns this scenario is honest at.
- A sandbox package. Real code with real tests, described below.

WHY SCENARIOS AND NOT RANDOM FIELDS. Random per-field text contradicts itself
between states. The agent then spends its time being confused, and confusion
reads as machine drag. The generator draws a SCENARIO and a size. It does not
draw sentences.

## The sandbox package

THE BUILD STEPS DEMAND REAL CODE. `build-steps` runs a seeded chunk machine.
`observe-red` demands a failing test. `verification` runs the battery.

SO EACH SCENARIO SHIPS A TINY PACKAGE inside the training folder.

- It has its own tests.
- The tests really go red before the build.
- They really go green after it.
- Nothing outside the training folder is ever touched.

THIS IS THE BIGGEST BUILD ITEM, and it is what makes the M7 half of the walk
honest. Without it the training iteration measures the paperwork only.

## The mask, and what an archived iteration can be

THE OWNER'S RULING, 2026-08-19. Do not design against a malicious agent. The
agent reads through the lane, the lane can hide what it likes, and a
workaround shows up in the call log afterwards. That is sufficient.

THE RULING IS ACCEPTED AND THE OBJECTION IS WITHDRAWN. The earlier reason for
rejecting an archived iteration as a training source was framed as trust. It
is not a trust problem. It is a COVERAGE problem, and coverage is arithmetic.

### The mechanism the owner described already exists, for shell commands

`engine/discipline.ts` classifies every `se_run` command against a rule
table: tests, file edits, file writes, text searches, file reads, listing,
waiting and git. Each category allows ONE warned run and then refuses with
SE-C-129. A `no_tool_reason` valve runs it anyway and files the reason for
the retro. The counters persist in `.se/` ACROSS sessions.

SO THE SHELL HALF IS DONE. Nothing new is needed there.

### The lane's own hiding is in three places and covers less than it looks

MEASURED 2026-08-19, on this build.

- `paths.ts` exports `EXCLUDED_DIRS` — `.git`, `node_modules`, `.se`,
  `.venv`, `__pycache__`. Only `se_file_list` and `se_file_glob` call it.
- `search.ts` carries its OWN list, two entries, as ripgrep globs: `.se` and
  `node_modules`. It never reads `EXCLUDED_DIRS`.
- `se_file_read` applies NO exclusion at all. A lane read of `.se/reading.md`
  returned the file and its hash on this build.

SO "INVISIBLE IN THE LANE" IS NOT A FLAG THAT EXISTS. Building it means one
path mask honoured by read, search, glob and list alike. That also closes the
three-way drift i9 already carries.

### Two doors stay open after the mask

- `se_git` ALLOWS `show`, `log` and `diff`. They go straight to git, so a
  masked path is still readable at any commit unless the git lane filters its
  own output too. That is a second mask, and it is the harder one.
- READS AT A `ref:` reach committed history through the file lane. They need
  the same mask as a working-tree read.

### The number that decides it

AN ITERATION'S OUTPUT DOES NOT STAY IN ITS FOLDER. Requirements, RAID nodes,
experiments and stories land in `project/spec/trace/`, and some carry the
iteration's id in their own filename.

MEASURED: 282 files under `project/spec/trace/` mention `i15` or `i34`.

SO MASKING ONE ITERATION FOLDER HIDES THE RECORD AND NOT THE ANSWERS. The
requirements a replayed walk is supposed to derive are sitting in the trace
corpus, which the agent must read to do ordinary work. Masking the trace
corpus as well would blind the walk to the machine it runs on.

### The verdict

- BUILD THE MASK. It is cheap, it fixes the i9 drift, and it is the honest
  way to keep a scenario's answers out of reach.
- AN ARCHIVED ITERATION IS A SILHOUETTE, NOT A SCRIPT. Take its size, its
  step count and its evidence-field profile. Author the subject fresh.
- TWO COSTS REMAIN EVEN WITH A PERFECT MASK, and neither is about trust.
  - The rigor matrix moved. An archived iteration answered a column that no
    longer compiles the same way, so today's forms ask different questions.
  - The code half. A real iteration edited the real engine. A training walk
    must not, so the sandbox package is needed either way.
- ONCE THE CONTENT IS MASKED AND THE CODE IS SANDBOXED, what is left of the
  archived iteration IS a scenario. The two designs meet.

## The lifecycle, and why nothing is committed

OWNER RULING, 2026-08-19: nothing about a training iteration is committed.

SEEDED, WALKED, MEASURED, DISCARDED. There is no ship and no close.

THE FOLDER LIVES IN THE TREE AND IS IGNORED BY GIT. `project/spec/training/`
carries a gitignore entry. The training seed WRITES; it does not commit.

THAT IS A REAL DIFFERENCE FROM `itSeed`, which commits its record as part of
the seed. The training seed must not, or the ruling is broken by the first
call.

THE ID NAMESPACE IS SEPARATE. Training iterations take `t<n>` ids.

WHY THE SEPARATE FOLDER IS NOT COSMETIC. `itSeed` numbers a new iteration
from the highest `i<n>` in `project/spec/iterations/`, and `se_survey` counts
that same folder. Sharing it would eat iteration numbers and inflate every
count the front desk reads. The separation is what makes "does not count"
true rather than merely claimed.

## The results ledger

THE RECORD IS DISPOSABLE. THE MEASUREMENT IS NOT.

ONE LINE PER RUN. `.se/` is machine-local and a cloud box is reclaimed, so a
result living only in the call log did not happen.

THIS IS THE ONE PLACE THE NOT-COMMITTED RULING NEEDS THE OWNER'S WORD. A
ledger line carries no iteration content — only a seed, a size, a scenario
name and numbers. Committing it is what lets two boxes be compared next
month. Not committing it means every result dies with its box.

EVERY LINE STAMPS ITS CONDITIONS.

- the training id, the seed, the size, the scenario, the pool version
- the rigor matrix hash and the se version
- the harness, the model and the reasoning effort
- wall clock, total and per state
- lane calls, total and per state
- forms filled, and forms REFILLED after a refusal
- refusals counted by clause
- states visited, and states re-entered

WITHOUT THE CONDITIONS IT IS NOT A RESULT. i36 is the whole argument: the
harness is not Claude, and two hosts give the lane different things.

## What is measured, and what is not

MEASURED — the machine's drag.

- Time and calls per state.
- Refills. A refill is a refusal the guidance failed to prevent.
- Refusal loops. The same clause twice in a row is a remedy that is not
  executable.
- Reading cost. The boot loop and every in-state read.

NOT MEASURED — quality. A training iteration cannot tell a good decision from
a bad one, because there is no real subject to decide about.

## The honesty ruling

OWNER RULING, 2026-08-19: open, not blind. The agent is TOLD it is walking a
training iteration.

THE COST IS REAL AND IS ACCEPTED. An agent that knows the output is thrown
away works differently from one that does not. The number therefore describes
PROCESS OVERHEAD and not production behaviour. Write that limit into the
record rather than leaving it to be discovered.

## The toll

OWNER RULING, 2026-08-19: the training walk pays the full toll. The narration
toll and the reading proof are part of what is being measured. Exempting them
would measure a machine nobody runs.

## Comparing runs

- NEVER COMPARE TWO SINGLE RUNS. Tau-bench measured function-calling agents
  scoring `pass^8` below 25% against single-trial scores under 50%. Runs vary
  that much.
- REPORT A MEDIAN OVER AT LEAST THREE RUNS, with the spread beside it.
- COMPARE ONLY WITHIN ONE SET OF CONDITIONS. Same host, same model, same
  size, same seed or same scenario.

## Still owed

- THE NAMED TRAINING ITERATION. The owner has parked this for a conversation
  of its own. How a training iteration is named, and whether a name can be
  handed to another machine, is not settled here.
- THE LEDGER'S COMMIT STATUS. See the ledger section above.
