---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-19T16:45:21.692Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

i37 stands at its kickoff. The retro before it drained three notes and minted two work tokens.

THE DESIGN IS ALREADY SETTLED, which is unusual at a kickoff. Four rounds of owner rulings were recorded on the record before the walk started, and the brief at project/spec/training-iterations.md carries them.

WHAT IS BEING BUILT. A benchmark run re-walks an archived iteration from the commit before it started, so the design input costs nothing to author, and the walk itself is timed.

THE ARCHIVE IS THE POOL. 15 iterations are shipped. 11 carry a pinned size: 8 minor and 3 major.

## retro_drained

- none: the inbox stands empty. The three notes that were pending were drained in onboard-retro, immediately before this gate.

## goals

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.
- Where a run stops is configurable, and the whole walk is the default.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.

## pulled_in

- The design brief, project/spec/training-iterations.md, carrying four rounds of owner rulings from 2026-08-19.
- The outward scan, project/spec/references/ref-agent-benchmark-harnesses-2026.md, with tau-bench and SWE-bench fetched live.
- The benchmark walk already in project/deliverable/tests/fallback-outcome.test.ts, which the owner asked for on 2026-08-18 and which already auto-fills forms from their own templates.
- The throwaway-root machinery in project/deliverable/tests/helpers.ts.
- wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-, minted in this iteration's own retro, because the conditional mask cannot be built over three disagreeing lists.

## left_out

- An authored scenario pool. Struck by owner ruling: the archive already holds real design inputs.
- A sandbox package with fake tests. Struck by owner ruling: a re-walked iteration writes real tests against the real tree.
- A path-based mask over an iteration folder. Struck: the rewind hides the answers by construction, and 282 trace files naming an iteration proved a folder mask insufficient anyway.
- A dedicated value proposition. Struck by owner ruling: this is machine overhead, not a customer-facing promise. It lands on vp-rigor-without-toil.
- Benchmarks at patch, product and specification. Struck by owner ruling: patch work is ad hoc, product happens once, specification is derived.
- Replaying recorded events without re-invoking the agent. That is i31 and stays i31.
- wt-outward-scanning-states-cannot-reach-a-search-engine-on-this. It needs owner configuration, not build work, and it waits in the pool.

## change_size

major — this adds a record kind, changes what the lane may see, and moves a standing goal.

WHY NOT MINOR. A minor cannot move a goal. This adds a success criterion to vp-rigor-without-toil, and that criterion is the point of the whole iteration rather than a side effect.

WHY NOT PRODUCT. The big idea, the to-be world and the pitch are untouched. This is a measuring instrument for a machine that already exists.

THE THREE THINGS THAT MAKE IT MAJOR.

- A NEW RECORD KIND. A benchmark run has its own lifecycle, its own folder and its own item template. Nothing existing carries it.
- A CHANGE TO WHAT THE LANE MAY SEE. The git ceiling and the conditional mask sit under every state, because every state reads through the lane. A change beneath everything is not a small change.
- A MOVED GOAL. The claim that the machine carries more of the weight over time becomes measurable, and a measured claim is one anyone can now fail.

STRIKES NAMED, and there are none. Read cell by cell: at the major column 48 of 52 rows apply in full and 4 are tailored. The four are draft-vision, define-actual, pressure-test and map-stakeholders, all in M1 and M2, all inherit-with-judgment rather than reductions.

SO THIS COLUMN ASKS FOR THE WHOLE PROCESS, and that is accepted rather than argued down. An iteration that measures the process should not be the one that skips it.

## round_0_verify

- evidence vs claims: every load-bearing number in the brief was measured on this build rather than recalled. 218 calls and 16 rejections from the call log. 15 shipped and 11 pinned iterations from the records. 48 full and 4 tailored cells at the major column. 282 trace files naming i15 or i34. i33's rewind point at 5f85977f^ read back a seeded record. The two external citations were fetched, and everything else in the scan is marked RECALLED.
- types: nothing built yet. No engine code has been written in this iteration, so there is nothing to typecheck.
- lint: nothing built yet. The prose written so far is spec and brief, not code.
- tests: nothing built yet. The battery belongs to verification and is not earned here.

## round_1_validate

- exercised against the goal: the goal is a benchmark that costs nothing to author. The measurement at i33 answers it directly: the seeded record with goal, vision and inputs stands at the commit before the walk started. Nothing has to be written for a benchmark to have a design input.
- missing: the conditional mask has no mechanism yet, and its dependency is a work token minted an hour ago. Where a run stops is configurable by ruling but has no named checkpoint vocabulary. Neither blocks the kickoff.
- wrong: one earlier claim on the brief was wrong and is corrected in place. It said quality cannot be measured. Against a re-walk the original evidence is a reference, so quality is comparable, though never scored by the engine.
- out of scope: replay without re-invoking the agent belongs to i31. Ranking states by drag belongs to i32. This iteration produces the repeatable workload both of them need and neither of them is a dependency.
- prior art: scanned live and recorded. No published equivalent was found. Four traditions each hold a piece, and the nearest thing inside this repository is the benchmark walk already sitting in the test suite.

## bound_breaches

- if-agent-harness-to-entrypoint: none observed in this span. Nothing in this walk exercised the entrypoint interface under load. The lane was restarted once to raise the autonomy dial, and that restart answered normally.

## round_2_red_team

- STEELMAN: the agent knows the output is thrown away, so it will not work the way it works on real evidence, and the whole number describes a mode of working that never happens => accepted and narrowed rather than answered. The benchmark measures process overhead and never production behaviour, and that limit is written into the brief rather than discovered later. Blinding would buy fidelity and was rejected because it costs the honesty rules.
- STEELMAN: a re-walk cannot be compared to the original because the original was walked against a different machine => that is the experiment, not a defect. The machine is an axis. What must not vary inside a pair is the model, the effort and the size.
- The git ceiling is the single point of failure. If it fails open, the run reads the original answers and every number in that report is worthless => it fails closed or not at all. It needs a case that proves a non-ancestor commit does not resolve, written before the mechanism.
- Cycling makes any single report unrepeatable, because the next run walks a different iteration => the unit of comparison is the paired delta, never a single report. A cycle is the sample.
- 282 trace files name i15 or i34, so masking is hopeless => that number argued against the PATH mask and is what killed it. The rewind does not mask; it removes. At the rewind commit those files are mostly unwritten.
- A major column asks for 52 states to build a stopwatch => the stopwatch is not the deliverable. The second output is a design audit of an old decision, and that is why the design half of the walk is not skipped.

## raid_additions

- none — the register's additions belong to log-risks, which this column runs in full. Two work tokens were minted in this iteration's retro and stand in the pool rather than in the register.

## verdict

pass — the design is settled, the size is argued and the evidence behind every claim was measured rather than recalled.

WHAT THE BLESS PINS. The major column, 48 rows in full and 4 tailored, with nothing struck.

BLESSED BY THE AGENT UNDER A GRANT, not by default. The owner said in as many words on 2026-08-19 that this walk runs at full autonomy and that the agent may bless the gates. The dial was raised to ideation by restarting the lane with SE_AUTONOMY, which is the mechanism the guidance names as the owner's call. There is no lane verb for it on purpose.

THE DISSENT WORTH RECORDING. A major asks for the whole process to build a measuring instrument, and a smaller column would ship a number sooner. It was rejected because the second output — the design audit — lives in the design half of the walk, and a column that skips it buys the timing and loses the reason the owner wants this at all.

## follow_up

THE WALK CONTINUES into M1. draft-vision is tailored at this column, so it points at the resident vision and argues the delta rather than re-deriving it.

TWO THINGS ARE CARRIED RATHER THAN OPEN.

- wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see- is this iteration's own dependency. The conditional mask cannot be built over three disagreeing lists, and the reading verb consults none of them.
- wt-outward-scanning-states-cannot-reach-a-search-engine-on-this waits on owner configuration and is not build work.

ONE LEAD BELONGS TO A LATER RETRO. The chained-brief correction mints node ids the caller never chose, and SE-C-121 fired four times in this session because of it.

## anything_else

ONE MEASUREMENT ERROR IN THIS SESSION IS WORTH RECORDING, because it is the kind this iteration exists to catch.

Three directory-wide searches over the rigor matrix returned nothing, and the agent read that as "no rows match". They were SE-C-040 refusals for an unpaid narration toll, and the parser printed an empty list rather than the refusal.

THE FALSE READING WOULD HAVE REACHED THIS FORM. The claim "nothing is struck at major" was almost written from a search that never ran. It was checked again after paying the toll, and the real answer is 48 full and 4 tailored.

A SILENT EMPTY RESULT READS EXACTLY LIKE A TRUE NEGATIVE. That is a benchmark finding about the agent's own tooling, and it is the second output working before the mechanism exists.
