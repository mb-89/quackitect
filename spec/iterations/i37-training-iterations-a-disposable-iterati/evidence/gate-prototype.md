---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-20T09:17:04.499Z
authors: agent
files:
---

# Evidence form / gate-prototype

## current_situation

i37 stands at gate-prototype. This gate closes M6, the prototype milestone.

FIVE SPIKES RAN AND TWO CAME BACK `falls`. The two that fell are the ones that moved the design.

THE DECLARED WINNER WAS OVERTURNED BY ITS OWN MILESTONE. declare-winner named cand-the-refusing-run on an evidence-grade override, because cand-the-guarded-run scored higher and its central mechanism had never been run. M6 ran it. The override's only ground is gone, and the winner is now cand-the-guarded-run.

BOTH EARLIER GATES WROTE THAT TRIGGER IN ADVANCE. gate-candidates and gate-architecture each recorded, before the spike, what result would reopen the ruling. The result arrived and the ruling reopened.

AN ENGINE DEFECT STOPPED THE PREVIOUS UNATTENDED RUN AND IS NOW FIXED. A reopened placeholder could not be re-signed. The fix is shipped and the battery is green at 1518 of 1518.

## buildable

yes — six of eight blessed goals rest on mechanisms M6 ran rather than argued, the hardest one got simpler when the ceiling went structural, and the single unbuildable goal is a named dependency on somebody else's work token with its cost measured at four call sites.

## round_0_verify

- evidence vs claims: every claim opened and read at its own node, not taken from a summary. Five spikes: the truncated history holds at 1723 files with i33's start commit unresolvable against a control of 71; the whole-tree rewind FAILS TO COMPILE and the split is three-way; the ancestry test costs 4229 microseconds against zero for a structural ceiling; the call log attributes 0 of 1282 calls by record and all of them by carry-forward; four exclusion lists exist and one is empty. declare-winner was opened specifically to check the override was WITHDRAWN on the spike result rather than quietly swapped, and it names the withdrawal and cites the pre-written trigger.
- types: `npx tsc --noEmit` clean, over the packaging cherry-pick and the engine placeholder fix, which are the only code changes on this branch.
- lint: `npx biome check` clean on the changed engine file. The comment standard bit once at 161 dated or attributed comment lines over a ceiling of 160, caused by my own new comments; the reasoning moved into dsp-walk-machine.md and the application sites carry pointers. Every `see <doc>.md#<section>` pointer now resolves, which is itself a checked test.
- tests: 1518 of 1518 pass, 146 suites. Run because the engine changed, not for reassurance: the question was whether the placeholder fix broke the walk, and the answer is no.

## round_1_validate

- exercised against the goal: the goal is one number — does a weaker model on an improved machine do the work a stronger model did on the old machine. The structure survived its own prototype milestone with no seam moving; two nodes changed content and no element boundary or interface was added or removed. Measured end to end on i33 rather than argued.
- missing: the concealment, and it is missing for a reason with an owner rather than an oversight. Spike five found four exclusion lists with one empty, so the single visibility rule the winner assumes does not exist yet. Also missing: any probe for the three assumptions this milestone created, now minted as raid nodes rather than left as prose.
- wrong: the one-millisecond bound on if-benchmark-binding-to-guard was mine. I wrote it at decompose-structure, it was the only millisecond bound in a corpus of seventeen, and a spike returned `falls` against it which I nearly folded back as evidence about the design. The owner asked where it came from and the answer was `from me`. It is replaced by a bound derived from the standing one-second convention with the divisor named as unmeasured.
- out of scope: nothing left scope this milestone. The visibility rule moved INTO scope by owner ruling, and its cost was measured before the ruling rather than after.
- prior art: SWE-bench (arxiv 2310.06770) fixes and versions 2,294 problems so two runs a year apart are comparable by construction, which ours cannot claim because the archive grows; ours sheds the authoring entirely, since the pool is iterations already walked for their own sake. Tau-bench (arxiv 2406.12045) measures reliability rather than capability and proved it with pass^8 below 25 percent against single-trial under 50 percent; ours sheds the annotated goal state because the original walk IS the reference, and takes the warning — median over at least three runs with the spread. TPC-H (tpc.org/tpch, fetched) specifies its generator and quotes every result with its scale factor; ours sheds the generator because the change-size column already decides how many states a walk visits, and takes the rule that size is part of the result's name. SPEC CPU quotes ratios against a reference machine so results survive hardware turnover; ours sheds the ratio by owner ruling, comparing a run only to the same iteration's own original. Property-based testing was copied whole — generate at random, record the seed — and then narrowed by the ruling that a person triggers every run. Synthetic monitoring is the closest framing of all, fake transactions with results discarded and timing kept, and ours sheds its schedule by owner ruling. WHERE THE COMPARISON WAS NOT MADE: no system was found that benchmarks a process machine by re-walking its own history, and that negative is WEAK and was marked weak at the scan, because se_web_search refuses with SE-C-106 for want of an API key and sources had to be named in advance.

## goals_served

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.: SERVED AND MEASURED. el-benchmark-binding carries the two-command recipe; git update-ref then git fetch --depth 1 stood 1723 files on i33 at its own start commit's parent.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.: SERVED BETTER THAN ASKED, and the goal's wording is now wrong. Nothing is refused because nothing is there. i33's start commit does not resolve in the fetched tree; control, 0 trace files naming i33 against 71 naming another iteration.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.: SERVED AND NARROWED by the owner's ruling that a person triggers every run. The draw and its seed survive for the unnamed case, which is the property-based-testing lever kept at one turn.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.: SERVED IN STRUCTURE. if-benchmark-report-to-binding is the only backward crossing in the element matrix and is read before the binding opens, so the reports folder is the whole scheduler state.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.: SERVED. el-benchmark-report owns it. Item templates are scanned from machines/items/ by readdirSync, so a new benchmark-run template costs no engine change.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.: IN SCOPE AND NOT BUILT. M7 owns it and it waits on wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-. Cost measured at four call sites across three files: paths.ts, search.ts, and fileRead in files.ts.
- Where a run stops is configurable, and the whole walk is the default.: SERVED BY RULING, whole walk by default, with two fields on the report carrying the stop point and whether it was reached.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.: NOTHING YET — M7 owns it, at the state that derives value. This is the fourth gate it has survived unserved, which is named here rather than smoothed over; it is authored in M7 or it is cut.

## bound_breaches

- if-agent-harness-to-entrypoint: TWO BREACHES, both the same fault, fixed by hand rather than in code. The lane restarted twice and silently dropped the owner's autonomy grant, coming back at tactical each time. Captured as note-ef85e0c86b5e and note-a02771bee06a. The second cost four calls inspecting a signed gate form before anybody checked the dial, because the symptom was SE-C-113 `a hand above this gate's weight`, which reads as a design problem. DISPOSITION: not i37's subject and it needs an owner. The dial has no lane verb by design — only --autonomy, SE_AUTONOMY or the mirror slider move it — so a restart that drops it silently is an entrypoint defect. Both notes stand undrained for a retro. No third occurrence since the dial was restored.

## round_2_red_team

- STEELMAN: a gate that overturns its own earlier ruling shows the earlier ruling was wrong, so the process produced two confident answers and one was false => the first ruling was CORRECT on the evidence then available: the guarded run scored 12 to 9 and had never been run, and choosing it then would have been choosing on an unprobed claim, which is what M6 exists to prevent. The distinction is only visible because both gates wrote the falsification condition BEFORE the spike. A design that quietly swapped its winner after the numbers came in would look identical in the final spec and be worth nothing.
- STEELMAN: the iteration is measuring itself and grading its own homework, and it found four things that looked like findings and were artefacts of how it measured => it FOUND them, and three of the four were one mechanical parser bug rather than three reasoning failures, a correction that is itself on the record. But the steelman lands: an instrument validated only by its builder is not validated. The mitigation is that the first real run compares against an original walk nobody took for benchmarking purposes.
- STEELMAN: the pool moves, so no two results are comparable => the owner ruled the moving pool an upside and ruled out cross-iteration ratios in the same breath. A run is compared to the same iteration's own original. That is a narrower claim than SPEC's ratio and it is the claim the design actually makes.
- The incremental report ships untested => one of ten cells of the winner and nothing has run it. Named in declare-winner as inherited rather than endorsed, and it gets M7's first test. ACCEPTED RISK with a named discharge point.
- The eighth goal has survived four gates => four is where a schedule becomes a drift. It is authored in M7 or it is cut, and a fifth deferral is a failed goal rather than a deferral. Recorded as this gate's dissent.
- The rigor matrix hash may not identify what changes walk cost, so the control does not control => real, unprobed, and now minted as raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost at crippling and expected. Guidance, form templates and the engine all change walk cost and none is in the matrix.
- KILL-CRITERION: this is the wrong call if a re-walk cannot be told apart from the original, because the agent reaches the original answers anyway => I went looking, and the looking is what produced the structural ceiling. A folder mask fails, because 282 trace files name an iteration and the answers leak through the corpus. An ancestry test works, costs 4229 microseconds and can fail open. Making the objects absent means the request cannot be formed. THE GIT HALF SURVIVES THE CRITERION AND THE LANE HALF DOES NOT YET: a run today cannot reach the original answers through git, and CAN reach a previous benchmark report through the lane. That is a real hole with a named owner, and it is exactly what this gate declines to call built.

## raid_additions

- [[raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed]]
- [[raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls]]
- [[raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost]]
- [[raid-asm-one-second-resolution-is-enough-to-time-a-lane-call]]

## verdict

pass — the structure survived its prototype milestone with no seam moving, and its riskiest mechanism got simpler rather than harder.

WHAT THIS BLESS ENDORSES. Three elements, four interfaces, the structural ceiling, the three-way rewind, and cand-the-guarded-run as the winner on probed rather than argued ground.

WHAT IT EXPLICITLY DOES NOT ENDORSE, and this is the part that carries.

- THE CONCEALMENT IS NOT BUILT and cannot be built here. i37 DEFERS it rather than blocking: the token has an owner, the cost is measured at four call sites, and the other seven goals do not depend on it. Blocking a whole iteration on somebody else's list would be the wrong call at this weight.
- THE INCREMENTAL REPORT IS INHERITED, NOT ENDORSED. Untested, and it gets M7's first test.
- THE COMPOSITE WINNER IS NOT DECLARED AS A CANDIDATE. declare-winner declined to mint a fourth node it had no state to write, and that was correct. The differences live on el-benchmark-binding and el-benchmark-guard, which M7 builds from.

BLESSED BY THE AGENT under the owner's grant of 2026-08-19, widened the same day to cover every gate in this iteration including gate-implementation.

ONE DISSENT IS RECORDED AND IT IS MINE. The eighth goal has now survived four gates unserved. This gate passes anyway, because the state that derives value has not been reached and authoring the criterion before it would be authoring against nothing. If M7 closes without it, that is a failed goal.

## follow_up

- M7 OPENS AT author-tests. Its first test is the incremental report, the one untested cell this gate carried.
- TRUNK IS MERGED BEFORE author-tests, by owner instruction, and origin/v3 is re-checked immediately before the merge.
- M7 BUILDS FROM el-benchmark-binding AND el-benchmark-guard AS CORRECTED, never from the candidate note alone. Both carry the fetch recipe, the three-way split and the structural ceiling.
- THE VISIBILITY RULE IS M7'S, at four call sites across three files: paths.ts, search.ts, and fileRead in files.ts.
- THE EIGHTH GOAL IS AUTHORED IN M7 OR CUT. No fifth deferral.
- TWO ENGINE DEFECTS STAY OPEN AND NEITHER IS I37'S SUBJECT. stateFormState names se_pull where it means se_reopen with a machine argument. sessionclaims.ts guards on evidence_form.length where it means owesASignature, which reports a formless end state as unsubmitted. Both are on the RAID node with their fixes drawn.
- THREE ASSUMPTIONS NEED PROBES AND HAVE NONE, and all three are now minted with their checks written out.

## anything_else

THE MOST USEFUL RESULT OF THIS MILESTONE IS NOT ABOUT THE DESIGN.

FOUR TIMES THIS ITERATION PRODUCED SOMETHING THAT LOOKED LIKE A FINDING AND WAS AN ARTEFACT OF HOW IT WAS MEASURED. Three absences read as results. One threshold authored and then tested against.

THE PATTERN LOOKED SHARPER THAN ANY OF THE FOUR. A result that CONFIRMS gets checked. A result that CONTRADICTS gets believed. All four were contradictions, and every one went unchecked until something outside the measurement caught it.

AND THAT GENERALISATION WAS ITSELF AN OVER-READ, WHICH IS THE FIFTH INSTANCE. Three of the four were one mechanical bug in a parser, not three reasoning failures. Only the invented bound was reasoning. The correction is on the record because it is the same fault one level up.

FOR AN ITERATION BUILDING AN INSTRUMENT, THAT IS THE ARGUMENT FOR THE INSTRUMENT. Per-state refusal counts and refill counts would have surfaced every one of these mechanically. Nobody caught them by hand. The owner caught one by asking a question, and the rest came out of chasing that question.

ONE THING GOT SIMPLER AND IT IS WORTH SAYING PLAINLY. The design's hardest, most-argued mechanism — how a benchmark run is stopped from reading the answers — went from a folder mask, to a per-call ancestry test, to nothing at all. The right answer was to make the objects absent. Two gates argued about how to guard a door before anybody checked whether the room had to exist.
