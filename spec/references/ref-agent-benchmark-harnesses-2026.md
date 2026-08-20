---
id: ref-agent-benchmark-harnesses-2026
kind: reference
statement: How agent systems are benchmarked outside this project, what the synthetic-workload tradition already settled, and which of it applies to a throwaway iteration walked for time.
scanned: 2026-08-19
scanned_at: the training-iteration research
---

# Benchmarking an agent that walks a process, 2026

WHY IT WAS SCANNED. The owner asked whether a TRAINING ITERATION already
exists somewhere, and whether its work should be random, prepared, or
replayed from an old run. This card holds the answer and its sources.

TWO GRADES OF CLAIM, kept apart on purpose.

- CONFIRMED — a primary source was fetched on 2026-08-19 and says it.
- RECALLED — the writer knows it from training data. It was NOT checked
  against a live source.

THE LANE'S SEARCH IS NOT CONFIGURED. `se_web_search` refuses with SE-C-106:
no `SE_BRAVE_API_KEY` in the server environment. Only `se_web_fetch` was
available, so sources had to be named in advance rather than found. Two
were fetched whole. Everything else on this card is RECALLED and marked.
Configuring a search key would raise the grade of most of Part A.

## Part A — what exists outside

### Nobody publishes a "training iteration". The nearest thing has four names

NO EXACT PRIOR ART WAS FOUND for a disposable process instance, walked by an
agent, that produces correctly shaped throwaway artifacts and is then
deleted. RECALLED, and it is a negative claim over an unsearched field, so
it is weak.

FOUR TRADITIONS EACH HOLD A PIECE OF IT.

- Agent benchmarks hold the task set and the scoring.
- Synthetic database benchmarks hold the scale factor and the specification.
- Property-based testing and fuzzing hold the seeded generator.
- Synthetic monitoring holds the fake transaction run against a live system.

### Agent benchmarks fix the task set and never regenerate it

SWE-BENCH is 2,294 software problems drawn from real GitHub issues across 12
Python repositories. The model is given a codebase and an issue and must edit
the code. CONFIRMED — https://arxiv.org/abs/2310.06770.

THE SHAPE THAT MATTERS HERE is not the difficulty. It is that the task set is
FIXED, versioned and published. Two runs are comparable because the workload
did not move between them.

TAU-BENCH ADDS THE RELIABILITY METRIC. It evaluates an agent against
domain-specific rules and compares the database state at the end of a
conversation against an annotated goal state. It proposes `pass^k` — the
probability that an agent succeeds on ALL of k independent trials.
CONFIRMED — https://arxiv.org/abs/2406.12045.

THE MEASURED RESULT IS THE WARNING. State-of-the-art function-calling agents
scored `pass^8` below 25% in the retail domain, against a single-trial score
under 50%. CONFIRMED, same source. Agents are inconsistent between identical
runs, and a benchmark that runs once measures the draw rather than the agent.

### The synthetic-workload tradition settled the size question decades ago

THE TPC BENCHMARKS ARE SYNTHETIC BY DESIGN. TPC-H is a decision-support
benchmark with a generated dataset and a published specification. The
benchmark family and its published results exist. CONFIRMED —
https://www.tpc.org/tpch/ was fetched and lists TPC-C, TPC-E, TPC-H, TPC-DS
and others with public result tables.

THE SCALE FACTOR IS THE PART TO COPY. RECALLED. TPC-H generates its data at
declared scale factors, and a result is only ever quoted WITH its scale
factor. Size is not a property of the run. It is part of the result's name.

THE DATA IS FAKE AND THE SPECIFICATION IS NOT. RECALLED. What makes a TPC
number mean anything is that the generator, the schema and the queries are
written down and versioned. A synthetic workload nobody specified cannot be
compared with itself six months later.

SPEC CPU WORKS THE SAME WAY. RECALLED. Fixed programs, a reference machine,
and results quoted as a ratio against that reference rather than as raw
seconds.

### Seeded randomness is how the field gets fixed AND random from one lever

PROPERTY-BASED TESTING GENERATES INPUTS AT RANDOM AND RECORDS THE SEED.
RECALLED. QuickCheck started it and Hypothesis carries it today. A failing
run prints the seed, and replaying the seed reproduces the run exactly.

FUZZERS KEEP A CORPUS. RECALLED. AFL and libFuzzer keep the inputs that found
something and re-run them forever after. The corpus is the regression suite;
fresh random draws are the exploration.

THE LESSON FOR THIS DESIGN. Random and fixed are not two modes. They are one
generator plus a decision about whether the seed is written down.

### Synthetic monitoring runs fake work through a real system on purpose

APPLICATION MONITORING TOOLS RUN SCRIPTED FAKE TRANSACTIONS against
production on a schedule. RECALLED. The results are thrown away. The timing
is kept.

THE POINT IS REGRESSION DETECTION, not correctness. Nobody cares that the
synthetic checkout bought nothing. They care that it took 4 seconds when it
took 2 seconds last week.

THAT IS EXACTLY THE OWNER'S FRAMING. A training iteration is a synthetic
transaction for a process machine.

### Continuous benchmarking in CI has three rules and they are all about noise

RECALLED, from the tooling around criterion, pytest-benchmark and similar
harnesses.

- Compare against a baseline on the SAME machine. Absolute numbers between
  machines mean nothing.
- Report a distribution, not a number. Median plus spread over several runs.
- Record the environment with the result. A number without its conditions
  cannot be re-tested.

### Record-and-replay is a different mechanism from re-running

RECALLED. A replay feeds recorded results back and never re-invokes the thing
under test. A re-run invokes it again from a chosen state. The two answer
different questions and conflating them is a known source of pain.

THIS PROJECT ALREADY SAYS SO IN ITS OWN WORDS. See Part B.

## Part B — what already exists inside this repository

### A benchmark walk is already in the test suite, and the owner asked for it

`deliverable/tests/fallback-outcome.test.ts` carries a section headed
THE BENCHMARK WALK. It quotes the owner, 2026-08-18:

> I imagine that we have a session that is like a benchmark. So we start the
> session, we walk all the steps, and all the tests that are specific to some
> steps are done in that benchmark.

WHAT IT DOES TODAY. It stands a real session on a throwaway root, seeds an
iteration, blesses the kickoff, and walks the pinned column to a named state.

IT ALREADY AUTO-FILLS EVERY FORM. `fillFor` reads the form's own field
templates and produces one satisfying answer per template kind: `checklist`,
`per-item`, `findings`, `list`, `refs`, `file-ref`, `choice-with-rationale`,
and a free-form default. Its own comment says why: "A benchmark walk cannot
hand-write twenty forms."

IT ALREADY COUNTS THE COST. `walkTo` returns the number of forms filled, "so
a stop that costs more than it should is visible rather than silent".

SO THE TRAINING ITERATION IS NOT A NEW IDEA HERE. It is this fixture,
promoted out of the test suite, with the filling handed BACK to the agent
instead of done by the machine.

### The throwaway root already exists

`deliverable/tests/helpers.ts` builds a fresh temp project root that
carries the real boot machine. It links what is only read and copies what is
written. A seeded iteration inside it is already disposable by construction.

### Three seeded iterations sit next to this one

- i31 — a walk replays from recorded events, and drag per state names where
  the guidance fails. Its record states the rule this design must not break:
  "Replay feeds recorded results back and never re-invokes the agent. Re-run
  re-invokes it from a chosen state. Those are two modes and conflating them
  will cause pain."
- i32 — the agent's thinking is measured per turn, ranked by drag. Its record
  asks for exactly what a training iteration supplies: "Run the same walk
  several times per setting; one run per setting proves nothing."
- i36 — the harness is not Claude. Every host gives the lane something
  different, so a timing number without its harness is not comparable.

### The call log already carries the raw material

`engine/calllog.ts` records `ref`, `ts`, `tool`, `args`, `ok`, `outcome`,
`duration_ms`, `actor` and `se_version` for every dispatch. Timing per call
needs no new capture.

IT IS MACHINE-LOCAL. `.se/` is never committed. A benchmark result that must
survive the box has to be exported deliberately.

## Part C — the four ways this benchmark can lie

### One: the agent knows the data is fake

THE STRONGEST THREAT, and it has no clean fix. An agent told that its output
is thrown away will not work the way it works on real evidence. The number
then describes a mode of working that never happens in production.

TWO HONEST ANSWERS EXIST.

- Blind the agent, so the training iteration is indistinguishable from a real
  one. Highest fidelity. It costs the honesty rules this project runs on.
- Tell the agent, and narrow the claim. The benchmark then measures PROCESS
  OVERHEAD — boot, reading, form mechanics, refusal loops, routing — and not
  judgment quality.

THE SECOND IS RECOMMENDED, and the narrowing must be written into the
record. A training-iteration number is a statement about the machine, never
about the agent's thinking.

### Two: incoherent synthetic work inflates the number

IF THE FAKE SUBJECT CONTRADICTS ITSELF between states, the agent spends its
time being confused. That reads as machine drag and is not.

THE FIX IS SCENARIO-LEVEL GENERATION. The pool holds coherent fake deltas,
each one carrying a subject that survives from vision to verification. It
does not hold per-field random strings.

### Three: a single run is a draw, not a measurement

TAU-BENCH MEASURED IT. `pass^8` under 25% against single-trial under 50%.
CONFIRMED. i32's record says the same thing independently.

THE RULE THAT FOLLOWS. Never compare two single runs. Report a median over
at least three, with the spread beside it.

### Four: the conditions were not recorded

A TIMING NUMBER IS ABOUT A HOST, A MODEL, A REASONING EFFORT AND A BUILD.
i36 is the whole argument. Every result stamps its conditions or it is not a
result.

## Part D — what the scan supports

- ONE GENERATOR, ONE SEED. A named seed reproduces a run. No seed draws a
  fresh one. Fixed and random stop being two features.
- SIZE IS THE SCALE FACTOR. The change-size column already decides how many
  states the walk visits. It is the size lever, and it belongs in the
  result's name.
- THE POOL IS AUTHORED AND VERSIONED. A generated workload nobody wrote down
  cannot be compared with itself later.
- REPLAY IS NOT THIS. i31 owns replay. A training iteration is a fresh
  invocation over synthetic work, and it needs its own word.
- THE OLD ITERATION IS A SILHOUETTE, NOT A SCRIPT. Reusing an archived
  iteration's SHAPE is cheap and safe. Reusing its CONTENT hands the agent
  the answers, because that content is committed and searchable.
