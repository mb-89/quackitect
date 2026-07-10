<<<quackitect-archive v1>>>
<<<node: iteration.md>>>
---
iteration: i0010_engine_workshop
status: active
type: default
rigor: systematic
---

The engine gets a workshop pass: it answers fast (verification cache), explains itself (why, notes list, call log), ships modern vehicles (scaffold + ratchet), drops double ceremony (merged pagers), and speaks of the user, not the human.
<<<node: req-call-log.md>>>
---
id: req-call-log
type: requirement
depends_on: []
statement: When a command dispatches, the engine shall append one JSONL line to the workspace logs carrying timestamp, command, arguments with secret values redacted, duration, exit code, and channel.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [maintainability]
---
## Rationale (not load-bearing)
TODO
<<<node: req-mint-sugar.md>>>
---
id: req-mint-sugar
type: requirement
statement: quack mint shall honor its sugar forms - rationale text and deduplicated sink addressing - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. If a mint sugar form targets the scrap sink itself, then the engine shall write the sink into addresses exactly once. *(was req-mint-dedupe)*
2. Where --rationale is passed to quack mint, the engine shall write its text into the minted node rationale section. *(was req-mint-rationale)*
<<<node: req-notes-list.md>>>
---
id: req-notes-list
type: requirement
depends_on: []
statement: When the user runs quack notes, the engine shall print the notes location and each open inbox note with id, age, and first line, including backlog and archive notes where --all is passed.
class: review
killer: false
phase: [operation]
discipline: [process]
quality: [usability]
---
## Rationale (not load-bearing)
TODO
<<<node: req-pager-merge.md>>>
---
id: req-pager-merge
type: requirement
depends_on: []
statement: When every undone dependency of a milestone gate is a ready killer subtask, quack progress --pager shall present one combined pager naming those killers and the gate, blessing each individually on a single yes and accepting a split answer.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Widened at the i10 M7 gate (owner ruling: order is not dependency). The original last-open-killer
form measured graph adjacency. The ceremony cost is USER DECISIONS. The merge fires whenever no
agent-blessable work stands between the user and the gate, killers plural.
<<<node: req-ratchet-semantic.md>>>
---
id: req-ratchet-semantic
type: requirement
depends_on: []
statement: When the launcher evaluates a ratchet, the engine shall rebuild only when the vendored source recorded version exceeds the installed binary version.
class: review
killer: false
phase: [commissioning]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
TODO
<<<node: req-scaffold-modern.md>>>
---
id: req-scaffold-modern
type: requirement
depends_on: []
statement: When start init or start stubs emits a workspace, the engine shall emit the spec/project.toml root marker, the bootstrapping global-bin launcher, vendored engine source, and pointer-chain entry files.
class: review
killer: false
phase: [commissioning]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
TODO
<<<node: req-user-wording.md>>>
---
id: req-user-wording
type: requirement
depends_on: []
statement: The product prose, prompts, and CLI display strings shall name the person as user or by role, never as human, outside the recorded actor-stamp vocabulary.
class: review
killer: false
phase: [engineering]
discipline: [design]
quality: [functionality]
---
## Rationale (not load-bearing)
TODO
<<<node: req-verdict-machinery.md>>>
---
id: req-verdict-machinery
type: requirement
statement: The engine shall serve verdicts from a cache for a fast board while announcing re-runs and naming why a check flipped - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When coverage evaluation reaches an executed test, the engine shall reuse a verdict recorded for that test at its full input hash and the current engine build identity, re-running the test only on a cache miss. *(was req-verify-cache)*
2. When a verification battery re-runs at least one test, the engine shall announce the run on stderr before the first test and name each test running longer than one second. *(was req-verify-feedback)*
3. While every test verdict is cached, quack status shall print the board within one second on the reference machine. *(was req-status-fast)*
4. When quack why targets a check made suspect by a derived coverage rule, the engine shall name the rule and the changed inputs that flipped it. *(was req-why-derived)*
<<<node: tasks/i10-m1-gate.md>>>
---
id: i10-m1-gate
statement: M1 motivation gate: increasing-scrutiny review of frame and vision.
milestone: M1
class: review
killer: true
depends_on: [i10-m1-vision-scope-stated, i10-m1-problem-agreed, i10-m1-success-measurable, i10-m1-top-risks-logged]
---
<<<node: tasks/i10-m1-problem-agreed.md>>>
---
id: i10-m1-problem-agreed
statement: The delta is real and worth solving: slow answers, mute why, invisible notes, legacy scaffold, double pagers, human wording.
milestone: M1
class: review
killer: true
depends_on: [i10-m1-vision-scope-stated]
---
<<<node: tasks/i10-m1-success-measurable.md>>>
---
id: i10-m1-success-measurable
statement: Ch1 success criteria defined and measurable (cached status within 1s, why names the rule, one pager per ready pair).
milestone: M1
class: review
killer: false
depends_on: [i10-m1-problem-agreed]
---
<<<node: tasks/i10-m1-top-risks-logged.md>>>
---
id: i10-m1-top-risks-logged
statement: Top risks logged as RAID (cache staleness, backward ratchet, stamp-schema churn, scaffold regressions).
milestone: M1
class: review
killer: false
depends_on: [i10-m1-success-measurable]
---
<<<node: tasks/i10-m1-vision-scope-stated.md>>>
---
id: i10-m1-vision-scope-stated
statement: Vision and scope of the engine workshop pass stated (Moore vision, PR-FAQ pressure test).
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i10-m2-gate.md>>>
---
id: i10-m2-gate
statement: M2 requirements gate: increasing-scrutiny review of the requirement set.
milestone: M2
class: review
killer: true
depends_on: [i10-m2-inputs-captured, i10-m2-stakeholder-coverage, i10-m2-requirements-verifiable, i10-m2-requirements-traced, i10-m1-gate]
---
<<<node: tasks/i10-m2-inputs-captured.md>>>
---
id: i10-m2-inputs-captured
statement: Context, stakeholders, and the eight use cases captured. Environment assumptions field-checked per the M2 method.
milestone: M2
class: review
killer: false
depends_on: [i10-m1-gate]
---
<<<node: tasks/i10-m2-requirements-traced.md>>>
---
id: i10-m2-requirements-traced
statement: Every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i10-m2-requirements-verifiable]
---
<<<node: tasks/i10-m2-requirements-verifiable.md>>>
---
id: i10-m2-requirements-verifiable
statement: Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i10-m2-stakeholder-coverage]
---
<<<node: tasks/i10-m2-stakeholder-coverage.md>>>
---
id: i10-m2-stakeholder-coverage
statement: No role left out: user, adjudicator, driving agent, maintainer, vehicle owner.
milestone: M2
class: review
killer: false
depends_on: [i10-m2-inputs-captured]
---
<<<node: tasks/i10-m3-alternatives-elaborated.md>>>
---
id: i10-m3-alternatives-elaborated
statement: At least two viable alternatives per open axis: cache shape, call-log shape, ratchet stamp, pager merge form, stamp vocabulary.
milestone: M3
class: review
killer: true
depends_on: [i10-m2-gate]
---
<<<node: tasks/i10-m3-criteria-weighted.md>>>
---
id: i10-m3-criteria-weighted
statement: Vital-few decision criteria derived from the requirements and weighted.
milestone: M3
class: review
killer: false
depends_on: [i10-m3-alternatives-elaborated]
---
<<<node: tasks/i10-m3-feasibility-checked.md>>>
---
id: i10-m3-feasibility-checked
statement: Feasibility rough-checked per candidate.
milestone: M3
class: review
killer: false
depends_on: [i10-m3-criteria-weighted]
---
<<<node: tasks/i10-m3-gate.md>>>
---
id: i10-m3-gate
statement: M3 candidates gate: increasing-scrutiny review of the alternative set.
milestone: M3
class: review
killer: true
depends_on: [i10-m3-alternatives-elaborated, i10-m3-criteria-weighted, i10-m3-feasibility-checked, i10-m2-gate]
---
<<<node: tasks/i10-m4-adr-recorded.md>>>
---
id: i10-m4-adr-recorded
statement: Every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i10-m4-choice-traced]
---
<<<node: tasks/i10-m4-architecture-stated.md>>>
---
id: i10-m4-architecture-stated
statement: Chosen architecture stated per axis, including the stamp-vocabulary ruling (user replaces human).
milestone: M4
class: review
killer: false
depends_on: [i10-m3-gate]
---
<<<node: tasks/i10-m4-choice-traced.md>>>
---
id: i10-m4-choice-traced
statement: Each choice traced to the weighted criteria via a Pugh run with the strongest rival as datum.
milestone: M4
class: review
killer: false
depends_on: [i10-m4-architecture-stated]
---
<<<node: tasks/i10-m4-gate.md>>>
---
id: i10-m4-gate
statement: M4 architecture gate: increasing-scrutiny review of the decisions.
milestone: M4
class: review
killer: true
depends_on: [i10-m4-architecture-stated, i10-m4-choice-traced, i10-m4-adr-recorded, i10-m3-gate]
---
<<<node: tasks/i10-m5-design-buildable.md>>>
---
id: i10-m5-design-buildable
statement: Design is buildable within the zero-dep, one-binary constraints.
milestone: M5
class: review
killer: false
depends_on: [i10-m5-riskiest-validated]
---
<<<node: tasks/i10-m5-gate.md>>>
---
id: i10-m5-gate
statement: M5 prototype gate: increasing-scrutiny review of the spike evidence.
milestone: M5
class: review
killer: true
depends_on: [i10-m5-riskiest-validated, i10-m5-design-buildable, i10-m5-spike-recorded, i10-m4-gate]
---
<<<node: tasks/i10-m5-riskiest-validated.md>>>
---
id: i10-m5-riskiest-validated
statement: Riskiest unknowns validated by spike evidence: cache-key correctness across engine rebuilds, semantic ratchet on fresh clones.
milestone: M5
class: review
killer: true
depends_on: [i10-m4-gate]
---
<<<node: tasks/i10-m5-spike-recorded.md>>>
---
id: i10-m5-spike-recorded
statement: Spike results recorded and the design advanced as needed.
milestone: M5
class: review
killer: false
depends_on: [i10-m5-design-buildable]
---
<<<node: tasks/i10-m6-bs-call-log.md>>>
---
id: i10-m6-bs-call-log
statement: Call log: one redacted JSONL line per dispatch into the logs home; retro (review.md step 6) aggregates then deletes. Realizes req-call-log.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-notes-list]
---
<<<node: tasks/i10-m6-bs-cleanup.md>>>
---
id: i10-m6-bs-cleanup
statement: Cleanup: AGENTS.md command list and dependencies.md match the new surface; full build + selftest green.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-user-wording]
---
<<<node: tasks/i10-m6-bs-mint-fixes.md>>>
---
id: i10-m6-bs-mint-fixes
statement: Mint fixes: sink dedupe in the sugar forms and --rationale lands in the minted node. Realizes req-mint-dedupe, req-mint-rationale.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-call-log]
---
<<<node: tasks/i10-m6-bs-notes-list.md>>>
---
id: i10-m6-bs-notes-list
statement: quack notes [--all]: prints the notes location and each open note with id, age, first line. Realizes req-notes-list.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-why-derived]
---
<<<node: tasks/i10-m6-bs-pager-merge.md>>>
---
id: i10-m6-bs-pager-merge
statement: Pager merge: progress --pager presents one combined pager when the last open killer subtask and its gate are ready together; engage.md ADJUDICATE names the merged hand-off. Realizes req-pager-merge.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-scaffold-modern]
---
<<<node: tasks/i10-m6-bs-ratchet-stamp.md>>>
---
id: i10-m6-bs-ratchet-stamp
statement: Ratchet stamp: quack build writes a committed build-time stamp into the vendored source; the launcher ratchets forward only, by stamp comparison. Realizes req-ratchet-semantic.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-mint-fixes]
---
<<<node: tasks/i10-m6-bs-scaffold-modern.md>>>
---
id: i10-m6-bs-scaffold-modern
statement: Scaffold modernization: start init and start stubs emit project.toml root, bootstrapping launcher, vendored source with stamp, pointer-chain entry files; driveFromInside proves the roundtrip. Realizes req-scaffold-modern.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-ratchet-stamp]
---
<<<node: tasks/i10-m6-bs-status-fast.md>>>
---
id: i10-m6-bs-status-fast
statement: Fast status: with a warm cache quack status answers within the one-second bound; timed selftest proves it. Realizes req-status-fast.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-verify-feedback]
---
<<<node: tasks/i10-m6-bs-user-wording.md>>>
---
id: i10-m6-bs-user-wording
statement: User-wording sweep: prose, prompts, and CLI display strings say user or the role; the allowlist selftest guards the frozen stamp tokens. Realizes req-user-wording.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-pager-merge]
---
<<<node: tasks/i10-m6-bs-verdict-cache.md>>>
---
id: i10-m6-bs-verdict-cache
statement: Verdict cache: JSON map in the data home keyed by full input hash + binary self-hash; the tests-pass evaluator consults it and re-runs only misses. Realizes req-verify-cache.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-tests-red-observed]
---
<<<node: tasks/i10-m6-bs-verify-feedback.md>>>
---
id: i10-m6-bs-verify-feedback
statement: Re-run feedback: a re-running battery announces itself on stderr before the first test and names each test over one second; a cached run is silent. Realizes req-verify-feedback.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-verdict-cache]
---
<<<node: tasks/i10-m6-bs-why-derived.md>>>
---
id: i10-m6-bs-why-derived
statement: why explains coverage flips: names the derived rule and the changed inputs; the fresh-nothing-changed answer dies for that class. Realizes req-why-derived.
milestone: M6
class: review
killer: false
parent: i10-m6-build
depends_on: [i10-m6-bs-status-fast]
---
<<<node: tasks/i10-m6-build-planned.md>>>
---
id: i10-m6-build-planned
statement: Build decomposed into small resumable steps seeded as children of the build task, in dependency order.
milestone: M6
class: review
killer: true
depends_on: [i10-m5-gate]
---
<<<node: tasks/i10-m6-build.md>>>
---
id: i10-m6-build
statement: The planned steps nested beneath are realized.
milestone: M6
class: review
killer: false
depends_on: [i10-m6-bs-cleanup]
---
<<<node: tasks/i10-m6-detailed-design-complete.md>>>
---
id: i10-m6-detailed-design-complete
statement: Every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i10-m6-build]
---
<<<node: tasks/i10-m6-gate.md>>>
---
id: i10-m6-gate
statement: M6 implementation gate: increasing-scrutiny review of build and verification.
milestone: M6
class: review
killer: true
depends_on: [i10-m6-build-planned, i10-m6-tests-red-observed, i10-m6-build, i10-m6-detailed-design-complete, i10-m6-internal-quality-ok, i10-m6-verification-green, i10-m6-impl-risks-acceptable, i10-m5-gate]
---
<<<node: tasks/i10-m6-impl-risks-acceptable.md>>>
---
id: i10-m6-impl-risks-acceptable
statement: Implementation risks reviewed and acceptable.
milestone: M6
class: review
killer: false
depends_on: [i10-m6-build]
---
<<<node: tasks/i10-m6-internal-quality-ok.md>>>
---
id: i10-m6-internal-quality-ok
statement: Internal quality reviewed: engine style, zero-dep, voice on all new output.
milestone: M6
class: review
killer: false
depends_on: [i10-m6-build]
---
<<<node: tasks/i10-m6-tests-red-observed.md>>>
---
id: i10-m6-tests-red-observed
statement: Every new test ran and failed before the build.
milestone: M6
class: executed
killer: false
verify: coverage:tests-red
depends_on: [i10-m6-build-planned]
---
<<<node: tasks/i10-m6-verification-green.md>>>
---
id: i10-m6-verification-green
statement: Every test passes, across all iterations.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
depends_on: [i10-m6-build]
---
<<<node: tasks/i10-m7-acceptance-obtained.md>>>
---
id: i10-m7-acceptance-obtained
statement: Sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i10-m7-killer-ucs-demonstrated]
---
<<<node: tasks/i10-m7-gate.md>>>
---
id: i10-m7-gate
statement: M7 validation gate: increasing-scrutiny review against the needs.
milestone: M7
class: review
killer: true
depends_on: [i10-m7-meets-need, i10-m7-killer-ucs-demonstrated, i10-m7-acceptance-obtained, i10-m7-validation-gaps, i10-m6-gate]
---
<<<node: tasks/i10-m7-killer-ucs-demonstrated.md>>>
---
id: i10-m7-killer-ucs-demonstrated
statement: Killer use cases exercised end-to-end for real: cached fast board, merged pager, modern scaffold roundtrip.
milestone: M7
class: review
killer: false
depends_on: [i10-m7-meets-need]
---
<<<node: tasks/i10-m7-meets-need.md>>>
---
id: i10-m7-meets-need
statement: Meets the need, validated against all needs of every iteration and demonstrated by the Ch1 criteria.
milestone: M7
class: review
killer: true
depends_on: [i10-m6-gate]
---
<<<node: tasks/i10-m7-validation-gaps.md>>>
---
id: i10-m7-validation-gaps
statement: Validation gaps captured as RAID.
milestone: M7
class: review
killer: false
depends_on: [i10-m7-acceptance-obtained]
---
<<<node: tasks/i10-m8-config-baselined.md>>>
---
id: i10-m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
depends_on: [i10-m7-gate]
---
<<<node: tasks/i10-m8-docs-complete.md>>>
---
id: i10-m8-docs-complete
statement: Docs complete and matching the actual surface: README, dependencies, method prompts, CLI help.
milestone: M8
class: review
killer: true
depends_on: [i10-m7-gate]
---
<<<node: tasks/i10-m8-gate.md>>>
---
id: i10-m8-gate
statement: M8 release gate: increasing-scrutiny review of the handover, then engage ship.
milestone: M8
class: review
killer: true
depends_on: [i10-m8-docs-complete, i10-m8-packaged-versioned, i10-m8-config-baselined, i10-m8-handover-accepted, i10-m7-gate]
---
<<<node: tasks/i10-m8-handover-accepted.md>>>
---
id: i10-m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
depends_on: [i10-m8-packaged-versioned]
---
<<<node: tasks/i10-m8-packaged-versioned.md>>>
---
id: i10-m8-packaged-versioned
statement: Packaged and versioned.
milestone: M8
class: review
killer: false
depends_on: [i10-m7-gate]
---
<<<node: test-call-log.md>>>
---
id: test-call-log
type: test
statement: A dispatched command appends one calls.jsonl line. Key, answer, and grant values appear only redacted.
class: executed
verify: selftest:call-log
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-mint-sugar.md>>>
---
id: test-mint-sugar
type: test
statement: quack mint honors its sugar forms - rationale text and deduplicated sink addressing.
class: executed
verify: selftest:mint-dedupe mint-rationale
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. mint veto --of scrap yields addresses with the sink exactly once. *(was test-mint-dedupe)*
2. mint with --rationale writes the text under the rationale heading of the minted node. *(was test-mint-rationale)*
<<<node: test-notes-list.md>>>
---
id: test-notes-list
type: test
statement: quack notes on a seeded inbox prints location plus id, age, and first line per note. --all adds backlog and archive.
class: executed
verify: selftest:notes-list
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-pager-merge.md>>>
---
id: test-pager-merge
type: test
statement: With only ready killers and the gate left open, progress --pager emits one combined pager naming them all; open agent-blessable work suppresses the merge; two ready killers group with the gate.
class: executed
verify: selftest:pager-merge
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-ratchet-semantic.md>>>
---
id: test-ratchet-semantic
type: test
statement: A vendored source with fresh mtimes but an older recorded version does not trigger a rebuild. A newer recorded version does.
class: executed
verify: selftest:ratchet-semantic
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-scaffold-modern.md>>>
---
id: test-scaffold-modern
type: test
statement: driveFromInside on a fresh emission finds project.toml, the launcher, vendored source, and pointer-chain entry files, and no .quack directory.
class: executed
verify: selftest:scaffold-modern
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-status-fast.md>>>
---
id: test-status-fast
type: test
statement: With a warm verdict cache, quack status completes within the one-second bound.
class: executed
verify: selftest:status-fast
killer: false
---
## Rationale (not load-bearing)
Unclustered at i17 b12: the verdict-machinery cluster violated the re-verification economics rule - these members each spawn subprocesses or renders, so one member's input change re-ran ~20s of siblings. Expensive tests keep their own cache entries. The birth red stands in the ledger under this original id.
<<<node: test-user-wording.md>>>
---
id: test-user-wording
type: test
statement: No product prose, prompt, or CLI display string contains the word human outside the actor-stamp allowlist.
class: executed
verify: selftest:user-wording
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: test-verify-cache.md>>>
---
id: test-verify-cache
type: test
statement: A second evaluation with unchanged inputs consumes the recorded verdict and runs zero tests. An edited test or a new engine build re-runs exactly the misses.
class: executed
verify: selftest:verify-cache
killer: false
---
## Rationale (not load-bearing)
Unclustered at i17 b12 (economics: expensive members keep their own cache entries). The birth red stands under this original id.
<<<node: test-verify-feedback.md>>>
---
id: test-verify-feedback
type: test
statement: A forced re-run prints the announcement before the first test. A fully cached run prints nothing.
class: executed
verify: selftest:verify-feedback
killer: false
---
## Rationale (not load-bearing)
Unclustered at i17 b12 (economics: expensive members keep their own cache entries). The birth red stands under this original id.
<<<node: test-why-derived.md>>>
---
id: test-why-derived
type: test
statement: quack why on a coverage-flipped check names the derived rule and the delta. The fresh-nothing-changed answer is gone.
class: executed
verify: selftest:why-derived
killer: false
---
## Rationale (not load-bearing)
Unclustered at i17 b12 (economics: expensive members keep their own cache entries). The birth red stands under this original id.
<<<node: uc-call-observability.md>>>
---
id: uc-call-observability
type: usecase
statement: The retro reads aggregated engine-call data: top commands, failure rate, slow calls, channel mix.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-decision-hygiene.md>>>
---
id: uc-decision-hygiene
type: usecase
statement: The user mints decisions with clean edges and an optional rationale in one command.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-explain-suspect.md>>>
---
id: uc-explain-suspect
type: usecase
statement: The user asks why a check is suspect and gets the real cause, including derived-coverage flips.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-fast-board.md>>>
---
id: uc-fast-board
type: usecase
statement: The user asks for status or report and gets the board fast. Cached verification answers without re-running the world.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-modern-vehicle.md>>>
---
id: uc-modern-vehicle
type: usecase
statement: The user scaffolds a new vehicle that matches the current world: project.toml root, global binary, pointer-chain entries.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-notes-visible.md>>>
---
id: uc-notes-visible
type: usecase
statement: The user lists pending notes without hunting the data directory.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-single-handoff.md>>>
---
id: uc-single-handoff
type: usecase
statement: The adjudicator answers one pager when a killer subtask and its gate are ready together. A split answer stays possible.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
<<<node: uc-user-wording.md>>>
---
id: uc-user-wording
type: usecase
statement: The user reads themselves as user or by role everywhere. Human-vs-agent wording is gone from prose.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
