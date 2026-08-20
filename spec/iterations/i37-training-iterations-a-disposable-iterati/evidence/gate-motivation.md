---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:00:25.883Z
authors: agent
files:
---

# Evidence form / gate-motivation

## current_situation

M1 is complete. draft-vision, define-actual, log-risks, frame-delta, scope-non-goals and pressure-test are all signed.

The register carries five entries opened by this iteration: one risk, two assumptions, one issue and one decision. Two are graded fatal.

vp-rigor-without-toil carries one new success criterion with three metrics.

Nothing is built. No engine code exists yet, so there is nothing to typecheck, lint or test.

## vision_scope_stated

COMPLETE, and every part is on the record.

- BIG IDEA. Inherited from the resident vision with one sentence added: nobody can say whether the machine is getting better, so every improvement is taste.
- TO-BE WORLD. Written as a scene, from the maintainer's side rather than the engineer's, because nothing about an engineer's working day changes.
- GOAL SYSTEM. Five goals, ruled in priority order 1 over 2 over 3 over 4 over 5. Four conflicts named openly, each with a ruling.
- MOORE PITCH. Five slots filled, with the alternative named as judgment by feel — which is what the project does today.
- SCOPE. Five pieces.
- NON-GOALS. Twelve lines, seven of them designs that were struck with the reason each fell.

WHAT IS INHERITED RATHER THAN REWRITTEN. The big idea, the to-be world and the pitch all point at the resident vision and argue the delta, which is what a tailored draft-vision asks for at this column. Only the goal system is authored fresh, and it had to be: the goals are what this iteration is.

## problem_agreed

THE DELTA IS REAL AND IT IS ARITHMETIC RATHER THAN OPINION.

The owner's complaint that iterations run too slowly has stood since 2026-08-14. Five days later there is still no number behind it. That is the gap.

WHY IT CANNOT BE CLOSED BY TIMING REAL ITERATIONS. Each one is a different job. Two real walks differ in a hundred ways, so the number describes which iteration you happened to get. i32's own record reaches the same conclusion independently: "one run per setting proves nothing."

WHY THE GOAL IS WORTH HAVING. vp-rigor-without-toil already carries four success criteria, and every one of them has a target that should fall retro over retro. Not one of them holds the work fixed between readings. So the proposition has been unfalsifiable since it was minted, and this closes that.

TWO SEEDED ITERATIONS ARE WAITING ON IT. i31 wants comparable runs so a guidance change can be A/B tested. i32 wants repeated runs per setting. Neither supplies the workload and neither is a dependency of this one.

THE ARGUMENT AGAINST, taken seriously. A day of agent time for a stopwatch reading is expensive. It survives because the run has a second output — a design audit of a decision nobody has questioned since it shipped — and because the stop point is configurable for whoever wants only the timing.

## prior_art_positioned

POSITIONED AT frame-delta AGAINST A LIVE SCAN, recorded at ref-agent-benchmark-harnesses-2026 with CONFIRMED and RECALLED marked separately.

- AGENT BENCHMARKS hold a fixed task set and measure the MODEL against a constant harness. This needs the mirror image. Two sources fetched live: SWE-bench and tau-bench.
- SYNTHETIC DATABASE BENCHMARKS hold the scale factor and the rule that a result is quoted with its conditions. Their data is synthetic because no real data exists to borrow. Ours does.
- PROPERTY-BASED TESTING holds the seeded generator, which is why random and fixed stopped being two features here.
- SYNTHETIC MONITORING holds the shape exactly and sheds only the fakeness.
- CONTINUOUS BENCHMARKING holds three noise rules and transfers whole.

WHAT FAILED, AND IT IS THE MOST USEFUL PIECE. The owner built a benchmark like this on an earlier system and will not repeat it, because simulating the design input was most of the work. That failure is what struck the scenario pool and the sandbox, and it is the reason the archive is the pool.

THE NEAREST PRIOR ART IS INSIDE THIS REPOSITORY. tests/fallback-outcome.test.ts walks the whole machine with fillFor filling every form. It sheds the agent, which is the only thing being measured here.

ONE HONEST WEAKNESS IN THE SCAN. se_web_search refuses with SE-C-106 — no provider key — so sources had to be named in advance. Most of the scan's Part A is graded RECALLED rather than CONFIRMED, and the gap is minted as a work token.

## success_measurable

EVERY GOAL CARRIES A PASS LINE, and they are on vp-rigor-without-toil rather than invented here.

- Metric: the paired delta in lane calls for one archived iteration re-walked across two machine versions, at the same model and effort. Target: falling, machine version over machine version.
- Metric: the weakest model that completes a re-walk of a given archived iteration without a refusal loop. Target: weakening, machine version over machine version.
- Metric: benchmark runs whose report omits its conditions. Target: zero.

TWO OF THE THREE CANNOT BE READ YET, and that is correct rather than a gap. A paired delta needs two machine versions, so the first run establishes a baseline and reads nothing.

THE THIRD IS READABLE FROM THE FIRST RUN and is the one that fails loudly. A report without its conditions is not a result.

WHAT IS DELIBERATELY NOT MEASURED. Quality. The original walk is a reference, never a correct answer, so the comparison is a reading rather than a score. An iteration claiming to score design quality automatically would be claiming more than it can hold.

## risks_logged

THE REGISTER IS OPEN, five entries, every one with an owner and a trigger.

- raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers. Fatal, plausible. Owner: the maintainer of the machine. Trigger: the first run, and every later change to the git lane allowlist or the ref-reading path.
- raid-asm-a-rewound-tree-carries-none-of-the-answers-the-walk-must-derive. Fatal, conceivable, half-probed. Owner: the maintainer of the machine. Trigger: the first report showing a state finish far faster than every other.
- raid-iss-the-reading-verb-consults-no-exclusion-list-at-all. Crippling, expected. Owner: the maintainer of the machine. Trigger: any work needing a path concealed from more than one verb, which is this iteration.
- raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way. Corrosive, plausible, unprobeable until a real iteration and a benchmark exist at the same size and model. Owner: the owner.
- raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored. Decided. Four rejected options kept on the record with the reason each fell.

TWO ARE GRADED FATAL DELIBERATELY. The ceiling failing open and the rewind premise being wrong are one failure seen from two sides. Either makes every number worthless while the report still looks valid.

## round_0_verify

- evidence vs claims: every load-bearing number in M1 was measured on this build rather than recalled. 15 shipped and 11 pinned iterations. 8 minor and 3 major. 48 full and 4 tailored cells at the major column. 282 trace files naming i15 or i34. Three exclusion lists, and a lane read of .se/reading.md returning content and hash. i33's rewind point at 5f85977f^ returning a seeded record. 218 calls and 16 rejections in the session. Two external sources fetched live; everything else in the scan is graded RECALLED.
- types: nothing built. No engine code exists in this iteration, so there is nothing to typecheck. Not a pass and not a skip — an empty set.
- lint: nothing built. What was written is spec, brief and register prose.
- tests: nothing built, and the battery is not earned here. It belongs to verification and is fired by that state's own exit script.

## round_1_validate

- exercised against the goal: the goal is a benchmark that costs nothing to author. The measurement at 5f85977f^ answers it directly — the seeded record carrying goal, vision and inputs stands at the commit before the walk started. Nothing has to be written for a benchmark to have a design input.
- missing: the conditional concealment has no mechanism and carries a dependency on a work token minted today. The stop point is configurable by ruling but has no checkpoint vocabulary yet. Neither blocks M1.
- wrong: one claim on the brief was wrong and is corrected in place — it said quality cannot be measured at all, which is true of an authored scenario and too strong for a re-walk. One claim in this session was nearly wrong and was caught: three directory searches returned nothing and were read as true negatives when they were unpaid-toll refusals.
- out of scope: replay without re-invoking the agent is i31. Drag ranking is i32. Harness comparison is i36. This iteration supplies what all three want and depends on none of them.
- prior art: scanned live, positioned at frame-delta, and the most useful piece is a failure — the owner's earlier benchmark, whose authoring cost is what struck two of this iteration's designs.

## goals_served

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.: SERVED AS INTENT, not as artifact. The goal system ranks it second. The mechanism is proven possible by the measurement at 5f85977f^ and is scoped as piece one. Nothing is built at M1 and nothing should be.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.: SERVED AS INTENT and as the first-ranked goal. It carries raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers, graded fatal, and its case is scheduled before its mechanism.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.: SERVED AS INTENT. Scoped as piece three. Random and prepared collapsed into one lever, which is the property-based testing answer recorded in the scan.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.: SERVED AS INTENT. The consequence for aggregation — paired deltas rather than absolutes — is ruled as conflict 3 in the goal system.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.: SERVED AS INTENT. Scoped as piece four. The machinery costs no engine change because machines/items is scanned with readdirSync.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.: SERVED AS INTENT, and this is the only goal carrying a live dependency — raid-iss-the-reading-verb-consults-no-exclusion-list-at-all, graded crippling and expected.
- Where a run stops is configurable, and the whole walk is the default.: SERVED AS RULING. Recorded on the record and in the brief, with the trade stated: a stop before the design gates keeps the timing and loses the audit.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.: SERVED AS ARTIFACT, and it is M1's only one. The criterion is written with three metrics and its stated limit at project/spec/trace/value-prop/vp-rigor-without-toil.md.

## bound_breaches

- if-agent-harness-to-entrypoint: none observed since this gate's scope began. Nothing in M1 exercised the entrypoint interface under load. The lane was restarted once to raise the autonomy dial and answered normally. One measurement caution: 24 mirror_slow entries stand in the call log for this session, and they are the mirror's own slow-call marker rather than an entrypoint breach. Nothing was modelled or measured against a bound here, so this is an absence of evidence rather than a clean bill.

## round_2_red_team

- STEELMAN: M1 produced no artifact except one value-prop criterion, so a gate that passes it is endorsing prose => accepted as accurate and rejected as an objection. M1 is the motivation milestone. Its deliverable IS the framing, and the column asks for the framing to be attacked rather than built. What would be wrong is passing M1 with the framing unattacked, and pressure-test ran a full hostile FAQ against it.
- STEELMAN: the agent wrote the vision, attacked the vision, and is now blessing the gate over the vision => true, and it is the grant rather than an oversight. The owner said in as many words on 2026-08-19 that this walk runs at full autonomy and the agent may bless. The mitigation that actually bites is that every rejected design is on the register with the measurement that killed it, so the reasoning is auditable rather than asserted.
- The whole iteration rests on one unprobed premise, and it is graded fatal => correct, and it is the sharpest thing on the record. The output half of the rewind assumption is unchecked. It is cheap to check and is scheduled at probe-assumptions. A gate passing M1 with it open is right; a gate passing M3 with it open would not be.
- Four of the agent's own designs were struck in one day, so the fifth is untrustworthy => the honest answer is that the fifth is not trusted, it is merely uncontradicted. Each of the four fell to a measurement. The fifth stands until a measurement takes it.
- The benchmark measures a biased number and ships it => yes, and the direction is now known and written down. It understates. It is a floor rather than an estimate, and the paired delta carries the same bias on both sides.
- Three major iterations is not a sample => it is not. It is three pairs per machine version, growing without anyone feeding it. The alternative was authoring, and authoring is what killed the owner's earlier attempt.
- Nothing here proves an agent walking a rewound tree behaves like one walking real work => nothing does, and that is an open assumption graded corrosive with an owner and a trigger. It cannot be probed until a real iteration and a benchmark exist at the same size and model.

## raid_additions

- none — the five entries this milestone opened were opened at log-risks and stand unchanged. This review added no new entry. It folded one finding INTO an existing entry: the bias direction now sits in the probe section of raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way.

## verdict

pass — the framing is complete, it was attacked rather than asserted, and every load-bearing number behind it was measured on this build.

WHAT THIS GATE ENDORSES. That the problem is real, that the goal is worth having, that the delta is positioned against a live scan, that the measures exist, and that the register is open with owners and triggers.

WHAT IT DOES NOT ENDORSE, said plainly so a later reader does not overread it. It does not endorse the mechanism. Nothing is built and no requirement is written yet.

BLESSED BY THE AGENT UNDER A GRANT, not by default. The owner said on 2026-08-19 that this walk runs at full autonomy and the agent may bless the gates. The dial was raised to ideation by restarting the lane with SE_AUTONOMY, which is the mechanism the guidance names as the owner's call.

THE DISSENT WORTH RECORDING. This gate passes with a fatal-graded assumption unprobed. That is defensible at M1, where the deliverable is the framing, and it stops being defensible by M3. If probe-assumptions falsifies the output half of the rewind premise, the mask is not a mask and this iteration's whole design falls with it. The gate is passed knowing that, not around it.

## follow_up

- M2 is next: draw-context, map-stakeholders and write-stories, then generalize-use-cases and gate-inputs.
- probe-assumptions in M3 carries the sharpest open item. Take the trace nodes naming i33 and ask whether each path resolves at 5f85977f^.
- write-requirements in M3 turns the five scope pieces into requirements. The ceiling needs the most testable statement of the five.
- The bias-direction sentence belongs in the benchmark report template as standing text when that template is authored at M7.
- Owner: nothing is owed. Four rounds of rulings are recorded on the record and all of them are reflected in M1's evidence.

## anything_else

ONE THING ABOUT THIS GATE IS WORTH RECORDING FOR THE ITERATION IT IS BUILDING.

This walk is itself the closest thing to a benchmark run the project has ever taken. It walked M0 and M1 of a major column in one session, and the call log holds every duration.

WHAT IT WOULD LOOK LIKE AS A REPORT, if the template existed. 218 calls at the point M1's evidence was mined, 16 rejections at 7 percent, se_update the most-called verb at 47 ahead of se_file_read at 35, and SE-C-121 firing four times from a single cause.

THAT IS THE SHAPE OF THE DELIVERABLE, produced by hand, on the iteration that exists to stop it being produced by hand. It is not evidence about the design. It is a check that the design is aimed at something real, and it is.
