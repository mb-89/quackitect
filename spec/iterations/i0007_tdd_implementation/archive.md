<<<quackitect-archive v1>>>
<<<node: adr-role-binding-model.md>>>
---
id: adr-role-binding-model
type: adr
adjudicated_by: human
statement: Roles bind through a file-based Strategy interface with inline as the default; chosen over a multi-agent orchestration framework (Berkeley MAST evidence: coordination overhead, verifier rubber-stamping ~21pct of failures). Files are the durable handoff.
depends_on: []
class: review
killer: true
---
<<<node: adr-tests-red-mechanism.md>>>
---
id: adr-tests-red-mechanism
type: adr
adjudicated_by: human
statement: RED is observed durably by a run-once attestation — record the observed-failing test hashes before the build; a test-hash change re-suspects it — chosen over re-running the suite (which cannot see a past red once green). Reuses the existing attestation+suspect machinery. Full ADR + M5 spike.
depends_on: []
class: review
killer: true
---
<<<node: iteration.md>>>
---
iteration: i0007_tdd_implementation
status: active
type: default
rigor: systematic
---

Test-first (TDD) implementation checklist shared by lean+systematic, with pluggable testdesigner/implementer/tester roles; plus the fixes it rests on: evidence-cache honesty, verdict links, build/test nesting, and thin-harness/cross-harness obedience.
<<<node: req-build-test-nesting.md>>>
---
id: req-build-test-nesting
type: requirement
statement: The report nests generated build steps under a single build parent (a third nesting level, collapsible, in dependency order), reflecting the real hierarchy. (Tests are trace content rolled up by the verification task — the trace/task separation supersedes the original "testing parent" idea.)
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---
<<<node: req-evidence-honesty.md>>>
---
id: req-evidence-honesty
type: requirement
statement: A test that fails on a live re-run must never display DONE from cached tests-pass evidence; the evidence cache must not mask a red test (fixes the selftest:workspace red-but-DONE masking bug).
depends_on: []
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [process]
quality: [reliability]
---
<<<node: req-impl-fragment-tdd.md>>>
---
id: req-impl-fragment-tdd
type: requirement
statement: The implementation method shall be one shared fragment enforcing tests authored first, observed red, then realized - executed wherever mechanizable - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Lean and systematic both import ONE shared implementation checklist fragment (single source, no duplication) that replaces the current lean L4 and systematic M6 build content. Lean imports it at one review gate; systematic at full sub-gate density. *(was req-shared-impl-fragment)*
2. The implementation fragment enforces the order author-tests -> plan-build -> RED -> GREEN. A new coverage rule tests-red requires every new test to be observed FAILING before its design is realized; a test that is green with no realized design is SUSPECT. *(was req-tdd-sequence)*
3. For non-code deliverables the test-designer pushes each acceptance criterion to class:executed wherever it is mechanizable (fixed expected result + mechanical evaluation + gating pass/fail); the irreducible residue stays class:review. *(was req-doc-tests)*
<<<node: req-pluggable-capabilities.md>>>
---
id: req-pluggable-capabilities
type: requirement
statement: Roles and research shall be pluggable strategies behind file-based seams, never vendored or hardcoded - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. A role is a strategy behind a file-based interface (testdesigner reqs->test nodes; implementer reqs+RED tests->code with design: markers; tester tests+build->pass/fail). Default binding inline; resolved at seed iteration>type>default. A tool/subtool binding must emit design: markers via its own constitution. *(was req-role-seam)*
2. Research is a referenced, pluggable capability — Claude Code delegates to the built-in deep-research skill; other harnesses run the same method inline with available web tools — never vendoring the harness skill into the repo. *(was req-research-pluggable)*
<<<node: tasks/i7-m1-gate.md>>>
---
id: i7-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i7-m1-problem-agreed,i7-m1-vision-scope-stated,i7-m1-success-measurable,i7-m1-top-risks-logged]
---
<<<node: tasks/i7-m1-problem-agreed.md>>>
---
id: i7-m1-problem-agreed
statement: Problem agreed: implementation is the weak leg — build rigor is unstructured, tests-pass evidence can mask a red test, and thin harnesses (Copilot) bypass the engine. The delta is real and worth solving.
milestone: M1
class: review
killer: true
depends_on: []
---
<<<node: tasks/i7-m1-success-measurable.md>>>
---
id: i7-m1-success-measurable
statement: Success measurable: lean+systematic share one implementation fragment; tests-red enforced; roles default inline with a working swap; evidence-mask bug fixed; report shows verdict links + build/test nesting; contract present in each harness native channel.
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i7-m1-top-risks-logged.md>>>
---
id: i7-m1-top-risks-logged
statement: Top risks logged (RAID). Chief risk: deterministic RED observation without a suite re-run (spike at M5).
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i7-m1-vision-scope-stated.md>>>
---
id: i7-m1-vision-scope-stated
statement: Vision & scope: extract the build milestone into a shared test-first implementation fragment imported by lean+systematic, with pluggable roles; land the fixes it rests on (evidence honesty, verdict links, build/test nesting, cross-harness obedience).
milestone: M1
class: review
killer: false
depends_on: []
---
<<<node: tasks/i7-m2-gate.md>>>
---
id: i7-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i7-m2-inputs-captured,i7-m2-stakeholder-coverage,i7-m2-requirements-verifiable,i7-m2-requirements-traced]
---
<<<node: tasks/i7-m2-inputs-captured.md>>>
---
id: i7-m2-inputs-captured
statement: Inputs captured: the 8 triaged notes, the systematic rigor template, the current M6/L4 build content, the evidence cache + selftest machinery, the report renderer, and the AGENTS.md / copilot-instructions channels.
milestone: M2
class: review
killer: false
depends_on: [i7-m1-gate]
---
<<<node: tasks/i7-m2-requirements-traced.md>>>
---
id: i7-m2-requirements-traced
statement: Requirements traced — every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i7-m1-gate]
---
<<<node: tasks/i7-m2-requirements-verifiable.md>>>
---
id: i7-m2-requirements-verifiable
statement: Requirements verifiable — every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i7-m1-gate]
---
<<<node: tasks/i7-m2-stakeholder-coverage.md>>>
---
id: i7-m2-stakeholder-coverage
statement: Stakeholder coverage: builder (drives the loop), maintainer (renders entry files), reader (report), and thin-harness agents (Copilot) — none left out.
milestone: M2
class: review
killer: false
depends_on: [i7-m1-gate]
---
<<<node: tasks/i7-m3-alternatives-elaborated.md>>>
---
id: i7-m3-alternatives-elaborated
statement: At least two mechanisms elaborated per key decision: RED-observation (run-once attestation vs suite re-run vs required failing-marker) and role binding (file-based Strategy vs multi-agent framework vs no-seam).
milestone: M3
class: review
killer: true
depends_on: [i7-m2-gate]
---
<<<node: tasks/i7-m3-criteria-weighted.md>>>
---
id: i7-m3-criteria-weighted
statement: Decision criteria weighted from the requirements: DRY, cross-harness portability, determinism, minimal engine change.
milestone: M3
class: review
killer: false
depends_on: [i7-m2-gate]
---
<<<node: tasks/i7-m3-feasibility-checked.md>>>
---
id: i7-m3-feasibility-checked
statement: Feasibility rough-checked per candidate.
milestone: M3
class: review
killer: false
depends_on: [i7-m2-gate]
---
<<<node: tasks/i7-m3-gate.md>>>
---
id: i7-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i7-m3-alternatives-elaborated,i7-m3-criteria-weighted,i7-m3-feasibility-checked]
---
<<<node: tasks/i7-m4-adr-recorded.md>>>
---
id: i7-m4-adr-recorded
statement: ADR recorded and traced — every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i7-m3-gate]
---
<<<node: tasks/i7-m4-architecture-stated.md>>>
---
id: i7-m4-architecture-stated
statement: Chosen architecture stated: a shared implementation fragment (imported by lean+systematic) + one new engine coverage rule tests-red (RED via run-once attestation) + a file-based role Strategy seam (inline default) + doc-tests as executed-where-mechanizable; plus the fixes it rests on (evidence-cache honesty, verdict-link, build/test nesting) and the research reference.
milestone: M4
class: review
killer: false
depends_on: [i7-m3-gate]
---
<<<node: tasks/i7-m4-choice-traced.md>>>
---
id: i7-m4-choice-traced
statement: Choice traced to the weighted criteria.
milestone: M4
class: review
killer: false
depends_on: [i7-m3-gate]
---
<<<node: tasks/i7-m4-gate.md>>>
---
id: i7-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i7-m4-architecture-stated,i7-m4-choice-traced,i7-m4-adr-recorded]
---
<<<node: tasks/i7-m5-design-buildable.md>>>
---
id: i7-m5-design-buildable
statement: Design is buildable.
milestone: M5
class: review
killer: false
depends_on: [i7-m4-gate]
---
<<<node: tasks/i7-m5-gate.md>>>
---
id: i7-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i7-m5-riskiest-validated,i7-m5-design-buildable,i7-m5-spike-recorded]
---
<<<node: tasks/i7-m5-riskiest-validated.md>>>
---
id: i7-m5-riskiest-validated
statement: Riskiest assumption validated by a spike: the engine can durably record 'observed RED' (attest failing test-hashes pre-build) and re-suspect on a test-hash change, without re-running the suite.
milestone: M5
class: review
killer: true
depends_on: [i7-m4-gate]
---
<<<node: tasks/i7-m5-spike-recorded.md>>>
---
id: i7-m5-spike-recorded
statement: Spike results recorded — design advanced as needed.
milestone: M5
class: review
killer: false
depends_on: [i7-m4-gate]
---
<<<node: tasks/i7-m6-bs-evidence-honesty.md>>>
---
id: i7-m6-bs-evidence-honesty
statement: FIX #8 (prerequisite): a live-red selftest must not show DONE from stale/vacuous evidence. Root-cause the selftestWorkspace ENGINE=='' vacuous-true guard and the runExecuted hash-cache; make tests-pass reflect a genuine live re-run. Realizes req-evidence-honesty.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-build-planned]
---
<<<node: tasks/i7-m6-bs-nesting.md>>>
---
id: i7-m6-bs-nesting
statement: FIX #6: the report nests build steps under a build parent and tests under a testing parent (3rd level), in dependency order; strengthen selftestReportNesting. Realizes req-build-test-nesting.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-verdict-link]
---
<<<node: tasks/i7-m6-bs-research-ref.md>>>
---
id: i7-m6-bs-research-ref
statement: Add the research-as-pluggable-capability reference to the method (Claude Code: deep-research; else inline), never vendoring the skill. Realizes req-research-pluggable.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-role-seam]
---
<<<node: tasks/i7-m6-bs-role-seam.md>>>
---
id: i7-m6-bs-role-seam
statement: Create method/roles/ (README + testdesigner/implementer/tester default=inline bindings) + doc-tests guidance; wire role resolution into compose-reference/engage + the iteration.md roles block. Realizes req-role-seam, req-doc-tests.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-shared-fragment]
---
<<<node: tasks/i7-m6-bs-shared-fragment.md>>>
---
id: i7-m6-bs-shared-fragment
statement: Create method/rigor/_shared/implementation.md (the test-first sequence) and rewire lean L4 + systematic M6 to import it at their gate density. Realizes req-shared-impl-fragment.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-tests-red]
---
<<<node: tasks/i7-m6-bs-tests-red.md>>>
---
id: i7-m6-bs-tests-red
statement: Add the tests-red coverage rule: a red-observed attestation on the Event log + attestLoad loader + coverage.go case 'tests-red' + an observe-red writer op (per the M5 spike). Realizes req-tdd-sequence.
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-nesting]
---
<<<node: tasks/i7-m6-bs-verdict-link.md>>>
---
id: i7-m6-bs-verdict-link
statement: FIX #9: the report renders a working verdict link on every DONE check (bless attestation for review, executed evidence for executed); strengthen selftestReportVerdict so it catches the field-observed gap. Realizes req-verdict-link (i0004).
milestone: M6
class: review
killer: false
parent: i7-m6-build
depends_on: [i7-m6-bs-evidence-honesty]
---
<<<node: tasks/i7-m6-build-planned.md>>>
---
id: i7-m6-build-planned
statement: Build planned — FIXES FIRST (evidence honesty #8, verdict link #9, build/test nesting #6), then the tests-red rule, the shared implementation fragment + lean/systematic imports, the role seam + doc-tests, and the research reference — decomposed into small resumable steps seeded as children of the build task.
milestone: M6
class: review
killer: true
depends_on: [i7-m5-gate]
---
<<<node: tasks/i7-m6-build.md>>>
---
id: i7-m6-build
statement: Build the design. The planned children realize it in dependency order (fixes first, then TDD); rolls up when the last step is done.
milestone: M6
class: review
killer: false
depends_on: [i7-m6-bs-research-ref]
---
<<<node: tasks/i7-m6-detailed-design-complete.md>>>
---
id: i7-m6-detailed-design-complete
statement: Detailed design complete — every requirement has a realized design (design: marker in product/).
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i7-m6-build]
---
<<<node: tasks/i7-m6-gate.md>>>
---
id: i7-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i7-m6-build-planned,i7-m6-build,i7-m6-detailed-design-complete,i7-m6-internal-quality-ok,i7-m6-verification-green,i7-m6-impl-risks-acceptable]
---
<<<node: tasks/i7-m6-impl-risks-acceptable.md>>>
---
id: i7-m6-impl-risks-acceptable
statement: Implementation risks acceptable.
milestone: M6
class: review
killer: false
depends_on: [i7-m6-build]
---
<<<node: tasks/i7-m6-internal-quality-ok.md>>>
---
id: i7-m6-internal-quality-ok
statement: Internal quality ok.
milestone: M6
class: review
killer: false
depends_on: [i7-m6-build]
---
<<<node: tasks/i7-m6-verification-green.md>>>
---
id: i7-m6-verification-green
statement: Verification green — every test passes, across all iterations.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
depends_on: [i7-m6-build]
---
<<<node: tasks/i7-m7-acceptance-obtained.md>>>
---
id: i7-m7-acceptance-obtained
statement: Acceptance obtained — sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i7-m6-gate]
---
<<<node: tasks/i7-m7-gate.md>>>
---
id: i7-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i7-m7-meets-need,i7-m7-killer-ucs-demonstrated,i7-m7-acceptance-obtained,i7-m7-validation-gaps]
---
<<<node: tasks/i7-m7-killer-ucs-demonstrated.md>>>
---
id: i7-m7-killer-ucs-demonstrated
statement: Killer use-cases demonstrated end-to-end: a real iteration runs the test-first fragment; tests-red trips on a vacuous test; a bypassing commit is rejected by the pre-commit hook.
milestone: M7
class: review
killer: false
depends_on: [i7-m6-gate]
---
<<<node: tasks/i7-m7-meets-need.md>>>
---
id: i7-m7-meets-need
statement: Meets the need — validated against ALL needs (incl. need-implementation and need-qualities/uc-reliability), demonstrated by the Ch1 criteria.
milestone: M7
class: review
killer: true
depends_on: [i7-m6-gate]
---
<<<node: tasks/i7-m7-validation-gaps.md>>>
---
id: i7-m7-validation-gaps
statement: Validation gaps captured (RAID).
milestone: M7
class: review
killer: false
depends_on: [i7-m6-gate]
---
<<<node: tasks/i7-m8-config-baselined.md>>>
---
id: i7-m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
depends_on: [i7-m7-gate]
---
<<<node: tasks/i7-m8-docs-complete.md>>>
---
id: i7-m8-docs-complete
statement: Docs complete and match the actual surface — the implementation fragment, roles README, tests-red rule, and cross-harness delivery documented; AGENTS/copilot entries regenerated.
milestone: M8
class: review
killer: true
depends_on: [i7-m7-gate]
---
<<<node: tasks/i7-m8-gate.md>>>
---
id: i7-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i7-m8-docs-complete,i7-m8-packaged-versioned,i7-m8-config-baselined,i7-m8-handover-accepted]
---
<<<node: tasks/i7-m8-handover-accepted.md>>>
---
id: i7-m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
depends_on: [i7-m7-gate]
---
<<<node: tasks/i7-m8-packaged-versioned.md>>>
---
id: i7-m8-packaged-versioned
statement: Packaged & versioned.
milestone: M8
class: review
killer: false
depends_on: [i7-m7-gate]
---
<<<node: test-build-test-nesting.md>>>
---
id: test-build-test-nesting
type: test
statement: A rendered report shows generated build steps nested under a build parent and test checks under a testing parent — three visible nesting levels — in dependency order.
class: review
killer: false
---
<<<node: test-doc-tests.md>>>
---
id: test-doc-tests
type: test
statement: A document-deliverable fixture yields at least one class:executed acceptance check and classifies the non-mechanizable residue as class:review.
class: review
killer: false
---
<<<node: test-evidence-honesty.md>>>
---
id: test-evidence-honesty
type: test
statement: selftest:workspace forced to FAIL on a live re-run is reflected as not-DONE in status — cached tests-pass evidence does not mask the red.
class: executed
verify: selftest:evidence-honesty
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
<<<node: test-research-pluggable.md>>>
---
id: test-research-pluggable
type: test
statement: The method references deep-research by name with an explicit inline fallback, and no deep-research workflow script is vendored in the repo.
class: review
killer: false
---
<<<node: test-role-seam.md>>>
---
id: test-role-seam
type: test
statement: With no roles block the build binds all three roles inline; an iteration.roles override selects a named binding; resolution order iteration>type>default holds.
class: review
killer: false
---
<<<node: test-shared-impl-fragment.md>>>
---
id: test-shared-impl-fragment
type: test
statement: Both lean and systematic checklists resolve their build milestone to the same imported implementation fragment; the fragment's content appears once in the source tree (no duplication).
class: review
killer: false
---
<<<node: test-tdd-sequence.md>>>
---
id: test-tdd-sequence
type: test
statement: coverage:tests-red exists as an engine rule; a fixture requirement with a passing test but no realized design region reports SUSPECT; realizing the design clears it.
class: executed
verify: selftest:tests-red
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
<<<node: uc-pluggable-roles.md>>>
---
id: uc-pluggable-roles
type: usecase
statement: The test-designer, implementer, and tester are pluggable roles behind a stable file-based interface (prompt | subagent | tool | subtool); default binding is inline (todays behaviour), resolved at iteration seed from the project type and iteration overrides.
class: review
killer: false
---
<<<node: uc-reliability.md>>>
---
id: uc-reliability
type: usecase
statement: ISO/IEC 25010 Reliability — the ledger's recorded evidence never shows green when a live re-run is red; a stale cache cannot mask a failing self-test.
class: review
killer: false
---
## note (not load-bearing)
The quality use-case foreseen by need-qualities' rationale ("Reliability for determinism"). Scoped to evidence honesty (#8); cross-harness enforcement was descoped from i0007.
<<<node: uc-test-first-build.md>>>
---
id: uc-test-first-build
type: usecase
statement: The implementation milestone is a shared, test-first walk (author tests -> plan build -> observe RED -> implement GREEN), imported by both lean and systematic at their own gate density.
class: review
killer: false
---
