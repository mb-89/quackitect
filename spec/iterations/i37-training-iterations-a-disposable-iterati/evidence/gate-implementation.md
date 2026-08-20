---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-20T12:49:20.823Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

gate-implementation, after a fresh-eyes verification that FAILED and two fix rounds against the same standing gatekeeper.

THE BATTERY IS GREEN. 1624 tests. Verification's exit script is the battery and it signed at 10:55, which is what let the walk reach this gate.

FOUR OF FIVE BUILD CHUNKS ARE BUILT. The fifth is blocked on a work token this iteration does not own, and its cases are absent rather than red.

THE VERIFICATION IS THE STORY OF THIS MILESTONE. Every check I ran was green when I signed four build chunks — tsc, biome, preflight, sweep, the suite. The tester ran the same code against the project's own call log and the central function returned `{}` over 13,619 records.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none — nothing was taken quick-and-dirty. What is unbuilt is unbuilt on the record with its spec standing, not shipped badly: the concealment has no cases and the ceiling reaches no verb, and both are carried as owed rather than as debt.

## risks_acceptable

acceptable — the two open risks are a blocked dependency with a named owner and a ceiling that is structurally sound but wired to no verb, and neither can produce a wrong number silently: a run that cannot establish its conditions refuses at bind, and a log that cannot be partitioned refuses rather than returning a plausible table.

## round_0_verify

- evidence vs claims: the central claim was FALSE and a fresh-eyes tester proved it by running, not by reading. `costPerState` read `rec.where` and took the clause from `outcome`; CallRecord has no `where` and `outcome` is the enum `result | rejected | errored`. Measured on the live log: 13,619 records, 2,298 pulls, 0 with a position, and the function returned `{}`. I confirmed it independently against calllog.ts before acting. Fixed at the source rather than in the reader: the record now carries `where`, stamped by the one observer in tools.ts beside `actor` and `harness`.
- types: `npx tsc --noEmit` exit 0, confirmed directly rather than from the lane's cached result, which lagged a round twice and reported a fixed error as live.
- lint: `npx biome check .` clean over 342 files. Two ratchets bit and both were re-earned with written reasons — direct reads 112 to 115 after two were GIVEN BACK to the note door, and direct writes 41 to 42.
- tests: 1624 in the battery, green. The benchmark file alone is 30 of 30, up from a suite whose green meant nothing: the tester found two stub-driven passes and three tautologies, and every one is gone.

## round_1_validate

- exercised against the goal: the goal is whether a weaker model on an improved machine does the work a stronger model did on the old one. What is built answers the first half — a run re-walks a real archived iteration and records what it cost under named conditions. The second half needs two runs and there has been none, which is honest rather than a gap: a mechanism with no first run has nothing to compare.
- missing: the concealment, and a lane verb that consults the ceiling. Both are named, specified, and carried as owed. Also missing: any run at all, so the inspection spec tsp-a-benchmark-run-leaves-the-archive-untouched remains unwalkable and is marked owed rather than ticked.
- wrong: five things this milestone believed and had to correct. The one-millisecond bound was mine. Three absence measurements were one parser bug. Four test cases could not have passed against any implementation. Five direct file reads I believed were fine, three of which were reading notes the door exists to serve. And two of my own FIXES were worse than what they replaced — a control that false-refused the default run, and a sentinel removal that moved a silent pass into a late refusal discarding a completed walk.
- out of scope: nothing left scope. The door — `se_benchmark` — came INTO scope here on the tester's argument, and the argument is that a mechanism reachable only from its own unit test cannot pass an implementation gate.
- prior art: unchanged in substance from gate-prototype and applied rather than cited. Tau-bench's `pass^8` below 25 percent against single-trial under 50 percent is why the item template REQUIRES a median over at least three runs rather than recommending one. TPC-H's rule that a result is quoted with its scale factor is why `change_size` is a required condition and an unpinned iteration refuses at bind. SPEC's ratio is deliberately shed by owner ruling — a run compares to the same iteration's own original and to nothing else. Property-based testing's seed survives only for the unnamed draw. WHERE THE COMPARISON WAS NOT MADE, and it is the same gap as before: no system was found that benchmarks a process machine by re-walking its own history, and that negative is WEAK because se_web_search refuses for want of a key, so sources had to be named in advance.

## goals_served

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.: BUILT AND EXERCISED. `standRewoundTree` in engine/benchmark.ts: git update-ref then git fetch --depth 1, with the three-way split. `rewindPointFor` takes the parent of the commit whose subject is `iteration <id>: started`, and returns undefined on two matches as well as zero.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.: BUILT AS A STRUCTURE, NOT AS A CHECK, and the wording of this goal is now wrong. Nothing is refused because the object is absent from a depth-1 fetch. `resolvesInBoundTree` proves it and a case asserts the negative directly. WHAT IS NOT BUILT: no lane verb consults it, so a bound run's verbs still read the live root. Carried as owed against req-a-ceiling-that-cannot-prove-ancestry-refuses.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.: BUILT AND NARROWED by the owner's ruling that a person triggers every run. `se_benchmark {iteration?}` names one; naming none takes the least recently benchmarked. The size draw survives on the element card and is not built, because the ruling removed its caller.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.: BUILT. `leastRecentlyBenchmarked` reads the reports folder and nothing else — no clock, no queue, no separate ledger. An iteration never benchmarked sorts FIRST, so a fresh archive cycles through everything once before repeating.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.: BUILT. machines/items/benchmark-run.md, discovered by being written because vocabulary.ts scans the folder. `conditionsFor` fills the eight conditions plus the stamp set, and `reportProblems` refuses a report missing any of them.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.: NOT BUILT, AND NOT DEFERRED QUIETLY. Its spec stands with all seven steps and its cases are deliberately absent. Blocked on wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-, and the block was RE-TESTED here rather than inherited: search.ts never reaches the containment seam, so a rule placed there holds for every verb except the one most likely to find a previous run's numbers.
- Where a run stops is configurable, and the whole walk is the default.: BUILT. `stop_at` defaults to `shipped` and `ended_at` records where the run actually ended. Both are required even when equal, because a reader cannot tell `reached the end` from `nobody recorded it` when one is absent.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.: NOTHING YET, AND THIS IS THE FIFTH GATE. It is not `nothing, and nothing will`: the use case uc-measure-a-machine-change-against-a-finished-iteration now names the criterion's third metric in its source_refs, and vp-rigor-without-toil is where it lands. It is authored before ship or the goal has failed.

## bound_breaches

- if-agent-harness-to-entrypoint: TWO BREACHES, unchanged since gate-prototype and both the same fault — a lane restart silently dropped the owner's autonomy grant, twice, notes note-ef85e0c86b5e and note-a02771bee06a. No third occurrence. DISPOSITION: not this iteration's subject and it needs the owner. The dial has no lane verb by design, so a restart that drops it silently is an entrypoint defect.

## round_2_red_team

- STEELMAN: the iteration is blessing an implementation gate for a mechanism that has never once been run end to end => that is true and it is the strongest case against passing. What answers it is that the door now EXISTS, so the first run is a call rather than a build; and that every failure mode found so far was found by running parts of it against real data rather than by reasoning about the whole. The inspection spec is marked owed for exactly this reason rather than ticked.
- STEELMAN: the builder verified their own build, found it sound, and was wrong — so why believe the second verdict => because the second verdict is not the builder's. One tester stood across both rounds, re-ran its own probes from round one against the new code, and held its earlier findings against my claims about them. It caught two regressions I introduced while fixing its findings. That is the discipline card's `one tester across the rounds, shown the deltas` working, and this iteration is the measured argument for that sentence.
- STEELMAN: five things were wrong and corrected, so the sixth is still out there => almost certainly. The mitigation is not confidence, it is that the mechanism REFUSES rather than guesses at every point where it cannot establish something: no rewind point, an empty tree, a failed control, unset conditions, an unpartitionable log. A wrong number is the failure that matters here, and every path to one now ends in a refusal that names its cause.
- ATTACK: the historical call log has no position stamp, so the first runs measure only themselves and there is no baseline => true, unrecoverable, and written on the design spec and the register rather than discovered later.
- ATTACK: a run today can read the previous run's numbers, because the concealment is unbuilt and leastRecentlyBenchmarked reads that folder => true. Any report produced before the work token lands carries the caveat that it measured an agent which could have read the answer key.
- ATTACK: the eighth goal has survived five gates => it has, and this is the last gate that can name it before ship. Authored before ship or the goal has failed.
- KILL-CRITERION: this is the wrong call if the mechanism cannot produce a trustworthy number, and I went looking rather than arguing => the tester found FOUR independent reasons it could not, at the last gate's evidence. Cost derivation returned empty, an empty rewind was indistinguishable from a correct one, the ceiling reached no verb, and nothing could start a run. Three are fixed and the fourth is carried with its spec unsatisfied. What survives the criterion is that no path now produces a WRONG number silently; what does not survive is any claim that the whole has been demonstrated.

## raid_additions

- [[raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls]]
- [[raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger]]
- [[raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost]]
- [[raid-asm-one-second-resolution-is-enough-to-time-a-lane-call]]
- [[raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it]]

## verdict

pass with overrides — the build is sound where it is built, every path to a wrong number ends in a refusal, and TWO REQUIREMENTS ARE NOT SATISFIED AND ARE NOT PRETENDED TO BE.

THE OVERRIDES, each with its dissent rather than as a clean pass.

- `req-the-benchmark-history-is-unreadable-while-a-run-is-bound` IS NOT MET. Its spec stands with seven steps and no cases. DISSENT: this is a `must` requirement being carried past an implementation gate, and the only thing that makes it tolerable is that the block has a named owner, a named file and a named mechanism rather than a count of lists.
- `req-a-ceiling-that-cannot-prove-ancestry-refuses` IS NOT MET AS WORDED. The ceiling is structural and built; no lane verb consults it. DISSENT: `resolvesInBoundTree` returns a bare boolean, so a missing .git and an out-of-range commit are indistinguishable — and the requirement's own `breaks_if_removed` says a ceiling that goes quiet looks exactly like a ceiling that passed.
- THE INSPECTION SPEC HAS NEVER BEEN WALKED, because no run has happened. It verifies a `must`/`fatal` requirement. It is marked OWED at verification rather than ticked, which is the honest state and not a satisfied one.

WHAT THE BLESS ENDORSES: the rewound tree, the structural ceiling, the binding and its refusals, the cost derivation on a stamped log, the report guard, the item template, and `se_benchmark` as the door.

BLESSED BY THE AGENT under the owner's grant of 2026-08-19, widened the same day to cover every gate in this iteration including this one.

## follow_up

- M8 OPENS. The first act is a real run, because nothing here has been demonstrated end to end and the inspection spec cannot be walked without one.
- WIRE THE CEILING TO THE REF-TAKING VERBS. `se_file_read`, `se_file_search` and `se_file_glob` all take a `ref` and none consults `isBound`. Now that the door exists and `isBound` has a consumer, this is bounded work.
- THE EIGHTH GOAL IS AUTHORED BEFORE SHIP OR IT HAS FAILED. Five gates have named it.
- TWO ENGINE DEFECTS STAY OPEN AND NEITHER IS I37'S SUBJECT. `stateFormState` names `se_pull` where it means `se_reopen {state, machine}`, which bit twice more this milestone. And SE-C-110 refuses a tool without naming which state grants it — a delete became unreachable because every state that allows one was behind the walk, and only the escape hatch resolved it. Both are notes.
- THE CONCEALMENT TOKEN NOW CARRIES A NAMED MECHANISM rather than a count: `search.ts` never reaches the containment seam.
- THREE ASSUMPTIONS STILL HAVE NO PROBE, and one is deferred with its until: the started-commit survey needs a state where `se_git` is legal.

## anything_else

THE MEASURED CASE FOR FRESH EYES IS THIS MILESTONE, and it is worth more than the mechanism it was checking.

I SIGNED FOUR BUILD CHUNKS ON GREEN EVIDENCE. tsc clean, biome clean, preflight green, sweep green, 1616 of 1618 passing with both failures declared and explained. Every claim I made was true and the build did not work.

THE FIXTURE WAS THE HOLE. I wrote `CallRecordish` from the design document rather than from `CallRecord`, then wrote a fixture from `CallRecordish`. The test and the code agreed with each other and neither agreed with the product. No amount of running MY tests could have found it.

THEN I FIXED THE FINDINGS AND BROKE TWO MORE THINGS. A control that false-refused the default run, off a lexicographic sort where `i11` precedes `i2`. A sentinel removal that left the bind happy and the report refusing after the whole walk. Both were correct about the defect and wrong about the blast radius, and both were invisible to every check I had.

WHAT CAUGHT THEM WAS A GATEKEEPER THAT PERSISTED. It re-ran its own round-one probes against the new code — which is how F3's closure was proved rather than asserted — and it held its earlier findings against my account of them. `meth-verification-discipline` asks for exactly that in one sentence: one tester across the rounds, shown the deltas, never respawned to reread from zero.

ONE THING THE TESTER COULD NOT DO, AND IT BELONGS IN A RETRO. The `se` lane was not in its tool set. It reported `No matching deferred tools found` for every verb and fell back to native tools, which were not blocked for it. The contract says to pass the lane rule to every subagent and I did; the rule was right and the tools were absent. So fresh eyes saw a DIFFERENT PROJECT than the walk does — no state gate, no toll, no typed refusals — and every finding about lane behaviour is second-hand by construction. Captured as note-20fe7e33b02c.

AND ONE THING ABOUT WHAT A BENCHMARK CAN MEASURE, which this iteration met from the inside. The read ratchet caught three wrong reads by refusing to let a number rise without a written reason. That is a cost the machine imposes ON PURPOSE, and its signature — a slow state, several refusals, a fix — is identical to drag. Any report that ranks states by cost will rank that kind of state badly and cannot tell the difference. It is not a defect in the design; it is what `measures the machine's drag, never quality` means in practice.
