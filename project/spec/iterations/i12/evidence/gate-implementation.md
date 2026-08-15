---
form: gate-implementation
amended: "2026-08-15T12:28:13.122Z by agent — Override one is wrong on the cubic and is withdrawn. The gate judged the record against the goal's summary line without reading the record's own vision, which…"
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

SIX CHUNKS BUILT, TWO ENGINE DEFECTS FIXED THAT NO CHUNK NAMED, AND ONE PRIVACY LEAK CAUGHT BY FRESH EYES IN THIS RECORD'S OWN FORM.

The battery stands at 1314 of 1314, 0 fail, run twice: once after the chunks and once after the two unplanned fixes. Biome clean at --error-on-warnings over 244 files. Preflight green.

Verification signed with three greens, five owed and one criterion ruling written out. The tester's verdict was fail and it is carried unchanged into that form.

THE CENTRAL RESULT IS THAT THE INSTRUMENT NOW RECORDS WHERE THE LANE CAN READ. Before this record a bound walk wrote every timing row into its worktree's own .se, which nothing opens. Two green batteries had written 1301 rows each into a directory no reader has ever looked at, and every earlier reading of that file was of a stale one.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none

## risks_acceptable

acceptable — no implementation risk was added or regraded by the build itself. Three entries were PROBED and stand unchanged: raid-asm-battery-timings-measure-work, raid-asm-node-tap-carries-durations and raid-asm-wall-clock-is-a-baseline. What this record leaves standing is not a new risk but an old one it declined to fix: raid-iss-the-autonomy-number-still-rides-every-answer keeps its wire-packet half, and raid-debt-human-observed-demonstrations plus raid-issue-must-demos-owed keep the whole demonstration debt. One NEW assumption is owed to the register and could not be minted here, because the gate's legal tools are read-only: the record-scoping fix leans on a bound tree being named for its record, captured as note-d3c18f094587 with its trigger and probe. Grading it crippling-and-conceivable is the honest read, and it is named in the red team below rather than buried.

## round_0_verify

- evidence vs claims: opened rather than trusted. The verification form's five owed lines were each read back to their raid entry, and all four entries carry status: open. The three greens were re-derived from the tester's file-and-line citations, not from its verdict word. One claim the tester marked green on its own reading was checked against the spec text instead, and the spec's item 4 correctly does not bind while machines/scale.md holds the transitional anchors it exempts.
- types: clean. The engine compiles under the battery's own run; selftest reports 135 suites with zero failures, and a type error fails that run rather than warning.
- lint: biome check --write --error-on-warnings over 244 files, exit 0. Ten infos remain and all ten are pre-existing useTemplate suggestions that biome itself marks unsafe to auto-apply. No suppression was added this record. The complexity ceiling refused runScoped at 26 against a limit of 25 and was answered by extracting timingReport into testreporters.ts, not by raising or suppressing it.
- tests: 1314 of 1314 pass, 0 fail, and the number is honest. A sweep of every battery file for test.skip and test.todo returns zero, so nothing is hidden behind the count. The count rose by exactly two from the pre-record baseline, matching the two cases added for the two unplanned fixes.

## round_1_validate

- exercised against the goal: YES, and the earlier reading of this line was wrong. The seeded scope was six chunks and all six are green. The container's goal SUMMARY names three things, but the record's vision is the goal, and it sequences them: "MEASURE FIRST, FIX SECOND. Nobody has profiled the machine page" (record.md:25). The six chunks are that first phase, and the drawing says why in its own words: the ranking that would choose what to fix came from numbers nobody could refresh, so the instrument is the riskiest thing in the plan.
- missing: one item, and it is smaller than the first pass claimed. Pull pagination is done and predates this record, so the summary line credits this record with something it inherited. The tallest test file is deliberately not split, and the drawing says why: the figure that makes it tallest is from 2026-08-14 and could not be refreshed. That is now possible for the first time. The surfaces are measured and not fixed, which is exactly what MEASURE FIRST, FIX SECOND asks of this phase.
- wrong: one thing in this form was wrong and is corrected here. The cubic comparison walk was carried as an undelivered goal item. The record's own vision at record.md:85 retires it with a measurement: about 2 ms per question, a problem only past a few hundred items, and the note exists "so nobody rediscovers it in a panic". The goal's summary line and the vision contradicted each other on the day both were written, and this gate resolved the contradiction the wrong way, by trusting the shorter sentence. Nothing built is wrong; this FINDING was.
- out of scope: two engine fixes and one privacy fix, all three taken deliberately. The record-scoping fix and the reload target were blocking this walk, so contract rule 5 makes them the work rather than strays. The account-name leak was in this record's own evidence. What was NOT taken: the worker pool, because i27 ruled against it in favour of the heavy-slot lease, and the autonomy wire packet, because a standing raid entry says the removal is a later record's.
- prior art: COMPARED, and ours loses on ergonomics. pytest ships --durations=N, one flag, zero configuration, prints the slowest cases every run. Go's go test -json emits per-test elapsed with no setup. Maven Surefire writes per-test XML timing by default. Against those, ours needed a custom reporter module, an environment variable naming the output directory, and a spawner change — three moving parts where pytest has a flag, and it took a record to notice the output was landing where nothing reads. WHAT OURS SHEDS: those three are per-run and ephemeral. --durations prints to a console and accumulates nothing; go test -json is a stream somebody else must persist. Ours appends to a durable file that a LATER act reads, which is the whole point, because a speed-up cannot be shown from one run's console. HONEST LIMIT: this is a design comparison from documented behaviour. No head-to-head was run.

## round_2_red_team

- STEELMAN, the opposing case at its strongest => A record whose subject is performance shipped without making anything faster. Every surface the goal named still breaks the one-second rule: /widget/machine at 3966 ms, the root page at 4026 ms, /widget/details between 2720 and 3468 ms across all seven requests. The build produced an instrument, three unrelated fixes and a lot of prose. Building the measuring device and calling that the work is the oldest way to look busy on a performance problem, and the strongest form of the argument is that the record should have been scoped to fix one slow surface and prove it, rather than to instrument everything and fix none.
- The answer, and it does not fully defeat the steelman => The ranking that chose every other item in this record came from numbers nobody could refresh, which the drawing names as the riskiest thing in the plan. Fixing a surface first would have meant picking which surface from stale figures. The instrument is the dependency, not the deliverable. But the steelman survives in one place: nothing forced this record to stop at the instrument, and it did.
- KILL-CRITERION, what would have to be true for shipping this to be the wrong call => That the timings this instrument records are read by nobody, or that the surfaces stay slow with no evidence about why. Looked for both. The first is answered: flow-test-timings names two consumers, and the retro's record-mining step reads it. The second is partly answered: sty-judge-without-waiting carries measured figures for three surfaces, and raid-asm-slow-surface-is-not-self-contention is a scheduled spike for the why. Neither is a fix.
- The finding I would raise against my own fix => recordDirFor resolves the record by falling back to the worktree's basename, and that fallback is the load-bearing path today, not the belt-and-braces it reads as. If a worktree is ever named anything other than its record, the resolution returns undefined and the code SILENTLY resumes the scan-first-hit behaviour this record just removed. A silent regression to the exact bug is worse than a loud failure. Captured as note-d3c18f094587 with trigger and probe.
- The finding I would raise against this gate => Five of ten verification claims are owed and four of those are owed because no person has watched a demonstration. This gate passes a record whose external quality is, by its own verification form, unobserved. That is honest rather than hidden, but a reader should not mistake 1314 of 1314 for evidence that the product works for a person.
- What the fresh eyes proved about the builder => The account-name leak was written by the builder into the builder's own verification form, read back twice during editing, and not seen. i27 had fixed the identical leak one record earlier and left no rule behind. That is contract rule 5's named failure shape applied to a fatal privacy requirement, and it recurred within one record.

## raid_additions

- none

## verdict

fail — THE OWNER'S RULING, 2026-08-15, recorded rather than reached by this form: "I'm not gonna bless the gate. It's failed. Go back to fix findings and fix the findings." THE AGENT'S OWN VERDICT WAS pass with overrides, AND IT IS OVERTURNED. The dissent is recorded here rather than dropped, because a gate that quietly reshapes its finding to match the thumb has recorded nothing. What the form found: six seeded chunks green, the battery green twice at 1314 of 1314, the central defect closed with evidence, nothing wrong built, no debt taken, no suppression added. WHAT THE FAIL IS FOR, in the owner's words and in the order they gave them. FIRST, the cubic clause is struck from the goal rather than carried: if it is not a problem, we do not fix it, and record.md line 85 already measured that it is not. SECOND, the record's two names collapse to one, the shortest — which also removes the silent fallback this form raised as its third override, because with one name the id resolves directly and the scan-first-hit path can be deleted rather than left as a trap. THIRD, the unobserved demonstrations need nothing: raid-debt-human-observed-demonstrations is open, kind debt, and its own refs name all four specs, so they are already carried and this gate should not have raised them. THE GATE'S OWN LESSON. Two of its three overrides should never have been written. One judged the record against a goal summary its own vision contradicts, and one re-raised a debt the register already holds. Both were caught by the owner, not by the gate, and both are the same fault: reading a short sentence instead of the standing record behind it.

## follow_up

- THE THUMB IS THE PERSON'S. This form is submitted, not blessed.
- SPLIT THE TALLEST TEST FILE, now possible for the first time. The figure that made it tallest was from 2026-08-14 and unrefreshable; the instrument now records where the lane can read, so a fresh ranking can be taken.
- BUILD THE PREVENTION FOR THE ACCOUNT-NAME LEAK. Redact the machine root from captured run output at the source, so quoting evidence verbatim is safe by construction. note-860decd92cc9 carries the three levels.
- PLACE THE SCOPING ASSUMPTION IN THE REGISTER. note-d3c18f094587, with its trigger and probe.
- THE STORY'S PROVING RUN IS DEFERRED to fill-story-evidence, where it arrives as an open to-do. If that state fills the evidence side and still links no run, the item binds and it is red.
- THE DEMONSTRATION DEBT NEEDS A PERSON, not another record. Four specs need somebody at a live surface, and one needs a second host.

## anything_else

