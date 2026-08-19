---
id: training-iterations
kind: brief
statement: A training iteration is a disposable iteration, seeded by command, walked by an agent for time, and discarded without ever reaching the archive.
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
  agent every time.
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

THE SEED IS PART OF THE RESULT'S NAME. A number quoted without its seed and
its size cannot be re-tested.

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

## The lifecycle, and why the archive is skipped

SEEDED, WALKED, MEASURED, DISCARDED. There is no ship and no close.

THE FOLDER IS THROWN AWAY. What survives is one line in a results ledger.

THE ID NAMESPACE IS SEPARATE. Training iterations are `t1`, `t2` and so on,
and they live at `project/spec/training/<id>/`, not with the real ones.

WHY THE SEPARATE FOLDER IS NOT COSMETIC. `itSeed` numbers a new iteration
from the highest `i<n>` in `project/spec/iterations/`, and `se_survey` counts
that same folder. Sharing it would eat iteration numbers and inflate every
count the front desk reads. The separation is what makes "does not count"
true rather than merely claimed.

## The results ledger

THE RECORD IS DISPOSABLE. THE MEASUREMENT IS NOT.

ONE LINE PER RUN, COMMITTED. `.se/` is machine-local and a cloud box is
reclaimed, so a result that lives only in the call log did not happen.

EVERY LINE STAMPS ITS CONDITIONS.

- the training id, the seed, the size, the scenario
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

THE AGENT IS TOLD IT IS WALKING A TRAINING ITERATION. It is not blinded.

THE COST IS REAL AND IS ACCEPTED. An agent that knows the output is thrown
away works differently from one that does not. The number therefore describes
PROCESS OVERHEAD and not production behaviour.

THE ALTERNATIVE WAS REJECTED FOR NOW. A blind training iteration, dressed as
a real one, would measure production behaviour honestly and would require the
machine to lie to the agent. That trade is the owner's to make, and it is
listed as an open question below.

## Comparing runs

- NEVER COMPARE TWO SINGLE RUNS. Tau-bench measured agents scoring `pass^8`
  below 25% against single-trial scores under 50%. Runs vary that much.
- REPORT A MEDIAN OVER AT LEAST THREE RUNS, with the spread beside it.
- COMPARE ONLY WITHIN ONE SET OF CONDITIONS. Same host, same model, same
  size, same seed or same scenario.

## Open questions for the owner

- BLIND OR OPEN. The recommendation is open, and the claim is narrowed to
  match. Blinding buys fidelity and costs the honesty rules.
- TRUNK OR MACHINE-LOCAL. The recommendation is a folder on trunk, so a cloud
  box can be pointed at a named training iteration. The results ledger is
  committed either way.
- DOES THE TRAINING WALK PAY THE FULL TOLL. The recommendation is yes. The
  narration toll and the reading proof ARE part of what is being measured, so
  exempting them would measure a machine nobody runs.
