---
form: gate-requirements
bless: blessed by agent
reopened: 2026-08-20T07:23:55.401Z — a feeder re-signed above it after the v3 merge moved the rigor matrix and the M6 spikes moved the winner
by: agent
signed_off: 2026-08-20T07:23:58.122Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

M3 is complete. write-requirements, derive-functions, identify-assumptions and probe-assumptions are signed.

Six requirements, eight functions, seven flows. The register now carries eight entries from this iteration.

THE FATAL PREMISE HOLDS. project/spec/trace at 5f85977f^ contains zero files naming i33, against 60 today, with a control search for i15 returning 123 matches at the same ref.

A NEW FATAL ASSUMPTION OPENED IN ITS PLACE, and it is a question four milestones never asked: which engine walks a rewound tree.

Nothing is built.

## round_0_verify

- evidence vs claims: Every claim in M3 rests on a measurement taken on this build. 12 pinned records all carrying a started stamp and zero missing one. Zero i33 files in the trace at the rewind commit against 60 today, with a 123-match control. CallRecord's field list read from calllog.ts with no state field on it. The git allowlist read from gitlane.ts. One claim is explicitly a PROXY and says so: the started COMMIT was not queried, because se_git is not legal in these states.
- types: Nothing built. No engine code exists in this iteration.
- lint: Nothing built. M3 wrote corpus nodes and evidence forms.
- tests: Nothing built, and the battery is not earned here.

## round_1_validate

- exercised against the goal: M3 owes requirements that are testable and assumptions that are probed. Six requirements carry response measures that are all counts with a target of zero. The iteration's fatal premise was probed and holds. Both delivered.
- missing: No requirement covers how a benchmark run is REACHED — a lane verb, a desk door, or neither. gate-inputs named it as the one uncovered door and write-requirements ruled it a shape question for the design milestones. It is still uncovered and is now named twice.
- wrong: One thing found wrong in earlier work, and it is this milestone's most valuable output. Every artifact from M1 and M2 assumed a rewound tree without ever saying which ENGINE runs over it. The old engine measures a machine nobody is improving. Opened as raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine, graded fatal.
- out of scope: A quality diff between the re-walk's tests and the original's stays out of scope and is now blocked in writing at use-case extension 5a.
- prior art: Prior art was positioned at M1 and M3 added nothing. The EARS shapes and the Cockburn form came from the method cards the machine served on the way in — and two requirement statements were refused for not being in an EARS shape and were rewritten.

## goals_served

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.: SERVED AS REQUIREMENT AND FUNCTION. fn-the-benchmark-run.locate-the-rewind-point and fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run carry it, and the rewind commit is now flow-rewind-point. Measured on i33: 5f85977f^ resolves to 20abd831.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.: SERVED, AND IT IS THE BEST-COVERED GOAL IN THE ITERATION. Two requirements — req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point and req-a-ceiling-that-cannot-prove-ancestry-refuses — over one function, deliberately joined so a build cannot satisfy the happy path and defer the silent half.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.: SERVED AS FUNCTION, NOT AS REQUIREMENT. fn-the-benchmark-run.choose-the-iteration-to-re-walk carries it and flow-chosen-iteration carries the seed. write-requirements recorded why no requirement was written: a wrong draw is visible in the report and costs a re-run, not a defect.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.: SERVED. The cycling loop is the same function consuming flow-benchmark-report, which it does not produce. That is the one closure oddity in the set and it is correct: the reports folder is the scheduler's only state.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.: SERVED BY TWO REQUIREMENTS AND TWO FUNCTIONS. req-a-benchmark-report-carries-the-conditions-of-its-run and req-a-run-that-stopped-early-says-where-it-stopped, over derive-what-the-walk-cost and state-the-conditions-of-the-run, which are split because one reads the log and one reads the environment.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.: SERVED BY req-the-benchmark-history-is-unreadable-while-a-run-is-bound over fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run. It is the only requirement in the set carrying a live dependency, and the dependency is a work token minted in this iteration's own retro.
- Where a run stops is configurable, and the whole walk is the default.: SERVED. req-a-run-that-stopped-early-says-where-it-stopped is the requirement it produced, and it carries more than the ruling did: a run that FAILED is a measurement too, and the report records the state it ended in.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.: SERVED AT M1 AND UNCHANGED. M3 wrote no criterion. The three metrics on vp-rigor-without-toil are now traceable down to six requirements and eight functions.

## bound_breaches

- if-agent-harness-to-entrypoint: none observed since gate-inputs signed. Nothing in M3 exercised the entrypoint interface. The same caution stands as at the last two gates: nothing here was measured against a bound, so this is an absence of evidence rather than a clean bill.

## round_2_red_team

- STEELMAN: the iteration's fatal premise was probed by the agent that proposed it, using a method the agent chose, and it came back holding => the strongest version of this is that the FIRST attempt at that probe returned the opposite answer and was wrong. Sixty ref reads came back as SE-C-040 toll refusals and the classifier counted a refusal as file-present. It reported 60 of 60 present, a clean falsification, and it was an artefact. The control search exists because of that, and it is the only reason the holding result should be believed at all.
- A proxy is not a probe. The started-commit assumption was answered by reading record frontmatter, not the git log => correct, and it is graded down rather than closed. The record stamp and the commit are written by the same act in markStarted, which is why the proxy is worth something. It remains half answered and says so.
- M3 opened a NEW fatal assumption at the same milestone that closed one. The iteration is not converging => the count is right and the reading is wrong. The new one was always true and nobody had asked. Finding it at M3 rather than at M7 is the process working; the alarming version would have been finding it during the build.
- Six requirements for a mechanism with no shape yet is premature => five of the six are demands on behaviour with counts as measures, and none names a verb, a folder or a flag. The one that leaks a solution word is the throwaway tree, and derive-functions named it rather than defended it.
- Two requirements share one function, so a build can satisfy one and skip the other => that is why they share it. Split into two functions, the fail-closed half becomes a separate chunk that a tired builder defers. Joined, it cannot be.
- Nothing in this iteration has run. Every artifact is prose about a mechanism that does not exist => true of every iteration at M3, and it is what M6 and M7 are for. What would be wrong is a gate claiming otherwise, and this one does not.

## raid_additions

- none new at this review. M3 opened three assumptions at identify-assumptions and they stand: raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine, raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it and raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in. Two entries CHANGED here rather than being added: the rewind assumption now records a holding probe with its control, and the started-commit assumption records a proxy result.

## verdict

pass — the requirements are testable, the functions are solution-neutral with the one leak named, and the iteration's fatal premise was probed and holds with a control.

WHAT THIS GATE ENDORSES. Six requirements, eight functions, seven flows, and the probe results as recorded.

WHAT IT EXPLICITLY DOES NOT ENDORSE. That a rewound tree can run the engine at all. That is now the sharpest open item in the iteration and it is graded fatal.

BLESSED BY THE AGENT UNDER A GRANT. The owner said on 2026-08-19 that this walk runs at full autonomy and the agent may bless the gates.

THE DISSENT WORTH RECORDING, and it is a different one from the last two gates. The old dissent is discharged: the rewind premise was the thing hanging over gate-motivation and gate-inputs, and it now holds. The new one is that M4 is about to enumerate a solution space for a mechanism whose most basic execution question is unanswered. If the old engine has to run over a rewound tree, several candidates M4 would otherwise consider are already dead. The gate passes anyway, because rank-unknowns and run-spikes at M6 are where that is settled, and because designing against both answers is cheaper than guessing one.

## follow_up

- M4 is next: derive-criteria, partition-functions, enumerate-space, run-candidates, cut-criteria, evaluate-set, then gate-candidates.
- CARRY THE ENGINE-VERSION QUESTION INTO M4 AS A DESIGN AXIS rather than as a blocker. Candidates that need the old engine and candidates that need only old content are different families, and the morphological box should hold both.
- The uncovered door — how a run is reached — becomes a real design question at M4. It has now been named at two gates and deferred at two states.
- rank-unknowns in M6 takes the engine-version assumption first. It is a ruling before it is a spike.
- Owner: nothing is owed and nothing is blocked. The engine-version question is one the owner may want to rule rather than let a spike decide, and it is on the record as such.

## anything_else

THE MOST USEFUL THING M3 PRODUCED WAS NOT A REQUIREMENT.

Four milestones of design said a benchmark run stands a tree at the rewind commit and walks it. Not one of them said which engine walks it. The environment sweep at identify-assumptions found it in one line.

TWO ANSWERS, TWO DIFFERENT PRODUCTS. The old engine checked out with the tree measures the machine as it was, which is the exact opposite of the point. The current engine over old content measures the machine being improved.

AND THE SECOND ANSWER MAKES THE MECHANISM SMALLER. If only content is rewound — records, corpus, trace — then the rewind is not a checkout at all. It is a narrower operation over a subtree, and every candidate at M4 gets cheaper.

THAT IS THE ITERATION'S OWN SECOND OUTPUT ARRIVING BEFORE THE MECHANISM EXISTS. Re-reading a design nobody had questioned turned up something that changes its shape.
