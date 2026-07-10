<<<quackitect-archive v1>>>
<<<node: arch-adr.md>>>
---
id: arch-adr
type: adr
statement: The chosen trace architecture is the FIXED 5-layer V-model (option A). It is recorded as an ADR (context, options, decision, consequences), traced to the criteria. Depth is fixed. That is a discipline, not a limit. Edges use a single refines field. A requirement is tagged functional or non-functional. Tasks are prefixed and separate. Milestones are derived reachability-coverage gates. Quackitect's own spec is retyped into it. The dogfood is required.
depends_on: [arch-candidates]
class: review
killer: true
---

## Rationale (not load-bearing)
M4 killer. Full ADR: design/M4-ADR.md. Supersedes the earlier task->design `implements` link.
<<<node: arch-candidates.md>>>
---
id: arch-candidates
type: adr
statement: At least two viable trace models were weighed. Option A is a FIXED 5-layer V-model: need -> uc -> requirement -> design -> test, a single refines edge, tasks prefixed and separate. Option B is a flexible refines-DAG with variable depth and same-type refinement. The criteria came from the requirements. Feasibility was rough-checked.
depends_on: [req-trace-model, req-version-mgmt, req-metrics, req-tooling, req-review]
class: review
killer: true
---

## Rationale (not load-bearing)
M3 killer. A (fixed, a discipline) vs B (flexible). Decided at M4.
<<<node: design/OVERRIDE-M1-scope.md>>>
# Override — M1 scope (i0002)

**Gate:** M1 (frame + success).

**Finding (milestone review, red-team round):** i0002 bundles ~7 concerns at systematic rigor —
trace/task split, version management, metrics (+ attest migration), ship-label, verify tool,
review-system + start/end brackets, milestone-structured plans + report rework. Over-scoped; the
review recommended splitting metrics, version-management, and the review-system into their own
versions, since one M4 ADR cannot soundly decide trace-model + attest-event-log + review-process
together.

**Decision (human): OVERRIDE — no split, keep all in.**

**Reasoning:** tool/infra improvements should be done as early as possible, not deferred to
dedicated iterations; the classic over-scope caution is calibrated for human teams' cognitive
limits and is weaker for AI-driven work, which holds broader scope/context.

**Dissent (stands, not erased):** the blast radius spans the engine, the report, the attest
format, and every rigor policy; risk of a milestone gate that cannot be honestly reviewed.

**Kill-criterion:** if the bundled scope produces thrash — a milestone review that cannot honestly
pass, or high rework/reversal — raise it at the next retro and split.
<<<node: iteration.md>>>
---
iteration: i0002_disentangle_trace
status: active
type: default
rigor: systematic
---
Structural: split the trace (design input -> output) from per-iteration task-lists (nested steps + checks per step). Folds in tooling done early — version management (version-aware quack next + planned-version ops) and metrics (attest event log) — plus the ship-version-label fix.
<<<node: req-metrics.md>>>
---
id: req-metrics
type: requirement
statement: Attest becomes an append-only event log of bless, reopen, and reverse events. Each event has an actor and a timestamp. Current state is still the latest event per check. The existing attest migrates into the log. Each check's current attestation becomes its first event. No check's DONE/SUSPECT/OPEN state changes. Reversal rate, rework rate, and self-cert ratio are derived from the log. The report shows them with their formulas.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2. Append-only unlocks reversal/rework; the actor field unlocks self-cert.
<<<node: req-review.md>>>
---
id: req-review
type: requirement
statement: A milestone gate is reviewed in increasing-scrutiny rounds before it is blessed. Verify the input cone. Validate against the ORIGINAL intent. Red-team. Every plan is bracketed by a start plausibility check and an end red-team. These rules are defined ONCE, in an always-on guide. Every rigor policy references them (vibe, lean, systematic), as do the engage and review prompts. No duplication.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [process]
quality: [functionality]
---

## Rationale (not load-bearing)
M2. Single source = guides/milestone-review.md (+ a start/end-brackets guide).
<<<node: req-tooling.md>>>
---
id: req-tooling
type: requirement
statement: Two small tooling fixes. quack ship names the artifact by the current iteration version, not a hardcoded v0. quack verify <id> runs one executed check's verify on demand and reports pass or fail.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2. Two small determinizer fixes folded in.
<<<node: req-trace-model.md>>>
---
id: req-trace-model
type: requirement
statement: The engine shall model the trace as a fixed five-layer typed V-model and derive every milestone gate as coverage over it - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The trace is a FIXED 5-layer V-model of typed nodes: need, use-case (or user-story), requirement, design, and test. Display order is top-down, test last. A requirement is tagged functional or non-functional. The edges are semantic. A use-case refines a need. A requirement refines a use-case. A design implements a requirement. A test verifies a requirement. The V hinges at the requirement. A node names its parent's id in the matching field. There is no same-type refinement. Depth is fixed at five. More or fewer is a modelling error. Tasks are prefixed instance data (TASK-/MARK-). They are separate from the trace and excluded from it, with no per-node link. *(was req-split)*
2. Milestones are DERIVED coverage gates over the typed trace, not hand-authored. The rule is n>=1 for every layer link. Every need has at least one use-case. Every use-case has at least one requirement. Every requirement has at least one design that implements it, and at least one test that verifies it. No node is an orphan. Every node traces up to a need. By phase: a test definition first, then a passing test. Each gate's pass is computed from the trace, never stored. A lint surfaces the holes. *(was req-coverage)*
<<<node: req-version-mgmt.md>>>
---
id: req-version-mgmt
type: requirement
statement: quack next picks the latest not-done version, else the earliest planned. It announces its choice. It locks onto a named version. With a single active version, next behaves as today. It stays back-compatible. Deterministic ops create a planned version and append to an unstarted one. This replaces the hand-written iteration.md.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2. Closes the engine-gap note.
<<<node: spike-risk.md>>>
---
id: spike-risk
type: adr
statement: The riskiest unknown is validated by a spike. Move attest to append-only. Move next to version-aware. The existing suspect/bless killers still behave unchanged on the current ledger. Evidence is recorded. The design is updated if the spike demands it.
depends_on: [arch-adr]
class: review
killer: true
---

## Rationale (not load-bearing)
M5 killer. The one thing that, if wrong, breaks v0: do not regress suspect/bless.
<<<node: tasks/m1-gate.md>>>
---
id: m1-gate
statement: Milestone M1 (Frame the problem & vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [m1-vision-scope-stated, m1-problem-agreed, m1-success-measurable, m1-top-risks-logged]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m1-problem-agreed.md>>>
---
id: m1-problem-agreed
statement: Problem agreed. The delta is real and worth solving.
milestone: M1
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/m1-success-measurable.md>>>
---
id: m1-success-measurable
statement: Success is measurable. Ch1 criteria defined.
milestone: M1
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/m1-top-risks-logged.md>>>
---
id: m1-top-risks-logged
statement: Top risks logged (RAID).
milestone: M1
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/m1-vision-scope-stated.md>>>
---
id: m1-vision-scope-stated
statement: Vision and scope stated.
milestone: M1
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/m2-gate.md>>>
---
id: m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [m2-inputs-captured, m2-stakeholder-coverage, m2-requirements-traced, m2-requirements-verifiable]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m2-inputs-captured.md>>>
---
id: m2-inputs-captured
statement: Inputs captured. Context, stakeholders, use cases.
milestone: M2
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/m2-requirements-traced.md>>>
---
id: m2-requirements-traced
statement: Requirements traced. Every requirement traces to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (req-traced).
<<<node: tasks/m2-requirements-verifiable.md>>>
---
id: m2-requirements-verifiable
statement: Requirements verifiable. Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (req-has-test).
<<<node: tasks/m2-stakeholder-coverage.md>>>
---
id: m2-stakeholder-coverage
statement: Stakeholder coverage. No role left out.
milestone: M2
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/m3-alternatives-elaborated.md>>>
---
id: m3-alternatives-elaborated
statement: Two or more alternatives elaborated.
milestone: M3
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/m3-criteria-weighted.md>>>
---
id: m3-criteria-weighted
statement: Criteria weighted. Derived from the requirements.
milestone: M3
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/m3-feasibility-checked.md>>>
---
id: m3-feasibility-checked
statement: Feasibility rough-checked per candidate.
milestone: M3
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/m3-gate.md>>>
---
id: m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [m3-alternatives-elaborated, m3-criteria-weighted, m3-feasibility-checked]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m4-adr-recorded.md>>>
---
id: m4-adr-recorded
statement: ADR recorded and traced. Every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
---

## Rationale (not load-bearing)
Subtask of milestone M4. Derived from the trace (adr-traced).
<<<node: tasks/m4-architecture-stated.md>>>
---
id: m4-architecture-stated
statement: Chosen architecture stated.
milestone: M4
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/m4-choice-traced.md>>>
---
id: m4-choice-traced
statement: Choice traced to the weighted criteria.
milestone: M4
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/m4-gate.md>>>
---
id: m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [m4-architecture-stated, m4-choice-traced, m4-adr-recorded]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m5-design-buildable.md>>>
---
id: m5-design-buildable
statement: Design is buildable.
milestone: M5
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/m5-gate.md>>>
---
id: m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [m5-riskiest-validated, m5-design-buildable, m5-spike-recorded]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m5-riskiest-validated.md>>>
---
id: m5-riskiest-validated
statement: Riskiest assumptions validated by evidence.
milestone: M5
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/m5-spike-recorded.md>>>
---
id: m5-spike-recorded
statement: Spike results recorded. Design advanced as needed.
milestone: M5
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/m6-detailed-design-complete.md>>>
---
id: m6-detailed-design-complete
statement: Detailed design complete. Every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (designs-realized).
<<<node: tasks/m6-gate.md>>>
---
id: m6-gate
statement: Milestone M6 (Build & verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [m6-detailed-design-complete, m6-internal-quality-ok, m6-verification-green, m6-impl-risks-acceptable]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m6-impl-risks-acceptable.md>>>
---
id: m6-impl-risks-acceptable
statement: Implementation risks acceptable.
milestone: M6
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/m6-internal-quality-ok.md>>>
---
id: m6-internal-quality-ok
statement: Internal quality ok (review).
milestone: M6
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/m6-verification-green.md>>>
---
id: m6-verification-green
statement: Verification green. The executed tests pass.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (tests-pass).
<<<node: tasks/m7-acceptance-obtained.md>>>
---
id: m7-acceptance-obtained
statement: Acceptance obtained. Sign-off recorded.
milestone: M7
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/m7-gate.md>>>
---
id: m7-gate
statement: Milestone M7 (Validate & accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [m7-meets-need, m7-acceptance-obtained, m7-validation-gaps]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m7-meets-need.md>>>
---
id: m7-meets-need
statement: Meets the need. Demonstrated against Ch1 criteria.
milestone: M7
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/m7-validation-gaps.md>>>
---
id: m7-validation-gaps
statement: Validation gaps captured (RAID).
milestone: M7
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/m8-config-baselined.md>>>
---
id: m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/m8-docs-complete.md>>>
---
id: m8-docs-complete
statement: Docs complete and match the actual surface.
milestone: M8
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/m8-gate.md>>>
---
id: m8-gate
statement: Milestone M8 (Package & hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [m8-docs-complete, m8-packaged-versioned, m8-config-baselined, m8-handover-accepted]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/m8-handover-accepted.md>>>
---
id: m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/m8-packaged-versioned.md>>>
---
id: m8-packaged-versioned
statement: Packaged and versioned.
milestone: M8
class: review
killer: false
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: verify-green.md>>>
---
id: verify-green
type: test
statement: The i0002 integration suite is green. Report determinism holds. The three metrics compute, with no deferred placeholders. Version selection picks correctly. The trace/task split holds (trace is content, gates carry state). Coverage rules evaluate. The milestone-review guide exists. Suspect/bless is unchanged.
depends_on: []
class: executed
verify: selftest:determinism
killer: true
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 killer (executed). Asserts determinism AND that the metrics were built (the deferred
placeholder is gone). Stays OPEN until build-metrics lands. EXTEND during build to also
assert version-selection.
