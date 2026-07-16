<<<quackitect-archive v1>>>
<<<node: adr-contract-delivery.md>>>
---
id: adr-contract-delivery
type: adr
statement: Deliver the contract to the agent through the harness's NATIVE instruction channel: AGENTS.md for agents that honor it, .github/copilot-instructions.md for Copilot. It carries the rules with an active read-paraphrase-confirm imperative, single-sourced from contract.md. Deferred: an engine-time renderer that generates the entry files, and runtime engine-serve (quack contract). These wait until the wording is empirically shown insufficient, because a thin harness may never run the engine. Passive pointers are rejected outright, since they failed on Copilot.
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0006 decision. Cheapest fix first (native channel + active imperative), escalate to rendering only if the empirical Copilot test fails.
<<<node: adr-readout-determinism.md>>>
---
id: adr-readout-determinism
type: adr
statement: The bar and one-pager are a fixed 80 columns and fenced, with NO chat/terminal-width detection. Detection is impossible from the engine (output is captured, not a TTY) and would be non-deterministic; a fenced fixed width prevents mangling (horizontal scroll, no reflow). A config-set width was considered and deferred; 80 chosen as safe on a narrow pane.
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0006 decision. Determinism over false-dynamic width.
<<<node: iteration.md>>>
---
iteration: i0006_harness_and_readout
status: active
type: default
rigor: lean
---

Bless-time readout (72-col fenced progress bar + handover one-pager), conversational new-project bootstrap into the M1 interview, and thin-harness contract delivery (Copilot native channel + active imperative + confirm-back); folds in engine-correctness fixes and the lean-trace-enforcement template fix.
<<<node: req-contract-delivery.md>>>
---
id: req-contract-delivery
ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded (adr-grandfathers-historical)
type: requirement
statement: Every entry surface shall deliver the contract as an active read-paraphrase-confirm imperative through each harness's native channel. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Every entry surface (AGENTS.md and the Copilot channel) states an ACTIVE first-action imperative — read the contract in full, paraphrase its specifics back, confirm you will obey — not a passive "the contract binds you" pointer. A missing paraphrase is a detectable signal the rules never loaded. *(was req-active-imperative)*
2. The contract requires the agent to confirm understanding before acting (the read→paraphrase→confirm ritual). There is one canonical confirm-back clause, referenced by the entry surfaces (reconciling the previously-unpushed clause). *(was req-confirm-back)*
3. The repo carries .github/copilot-instructions.md (Copilot's native instruction channel) delivering the contract to the agent, single-sourced from contract.md (not a hand-maintained fork), so Copilot receives the binding rules without loading AGENTS.md or following a pointer. *(was req-copilot-instructions)*
<<<node: req-deterministic-readout.md>>>
---
id: req-deterministic-readout
type: requirement
statement: The engine shall render deterministic fixed-width readouts: the progress bar and the killer handover pager. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a killer gate is handed to the human, the engine renders a one-pager (a function under `report`): the progress bar, the biggest decisions (linking the iteration's ADRs), the biggest risks (from the M1 frame), deterministic readiness facts (subtasks done, upstream SUSPECT, evidence-doc present), and a bless y/n line. Decisions and risks link to their trace nodes, not restated. *(was req-handover-pager)*
2. The engine renders a deterministic horizontal progress bar for the active iteration — START, each milestone in order, and END, with the current position marked — as a function under `report`. Identical inputs yield identical bytes. The agent shows it when it self-blesses. *(was req-progress-bar)*
3. The bar and one-pager are a fixed 80 columns wide, emitted inside a fenced code block, with no chat/terminal width detection. Every rendered line is <=80 columns so nothing wraps. *(was req-readout-width)*
<<<node: req-killer-adjudication.md>>>
---
id: req-killer-adjudication
type: requirement
statement: The contract shall let the user's explicit gate-specific authorization bless a killer gate. This includes a y to a presented pager. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. A human "y"/"yes"/"bless" replying to a presented handover pager is an explicit bless of that gate, recorded actor=human as if run at the console. Any ambiguous reply is not a bless; the gate stays open. *(was req-bless-y-console)*
2. The contract permits the agent to bless a killer gate only when the human explicitly authorizes that specific bless (stamped actor=agent); a blanket "continue" is not permission. Relaxes the former absolute prohibition. *(was req-contract-killer-relax)*
<<<node: req-lean-enforces-trace.md>>>
---
id: req-lean-enforces-trace
type: requirement
statement: Lean rigor structurally enforces the trace via derived coverage checks (req-traced, req-has-test, adr-traced, designs-realized), in addition to tests-pass. Even at the lean floor, the trace stays gated. Only the human review count is reduced. The lean checklist template carries these checks.
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
i0006 requirement under uc-engine-correctness.
<<<node: req-project-onboarding.md>>>
---
id: req-project-onboarding
type: requirement
statement: The entry surfaces shall onboard a new project conversationally from first contact into its first iteration. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. A "start a new project" request drives a fixed onboarding — confirm intent to start an iteration, ask the target folder, ask vendor-engine vs drive-from-inside stubs — then scaffolds via the existing start-init / start-stubs and proceeds into the first iteration. Documented on the entry surface. *(was req-bootstrap-flow)*
2. The README leads with the conversational onboarding (tell the agent to start a new project) and demotes the raw clone/build CLI to a slim "get the engine" step, so the primary documented path is starting YOUR project. *(was req-readme-onboarding)*
3. A workspace with zero iterations, when driven, immediately opens the first iteration's M1 vision interview rather than dead-ending on a status board. The rule lives on the entry surface so landing in a fresh vehicle triggers framing. *(was req-empty-spec-autostart)*
<<<node: req-report-live-reload.md>>>
---
id: req-report-live-reload
type: requirement
statement: The HTML report always recomputes live (no cached state.json snapshot), so it can never show a cached pass. It carries a live-reload hook; `quack report --watch` serves it via a zero-dep net/http server and pushes a reload only when a source input (spec/product/attest) actually changes. A killer or milestone bless triggers a report refresh so the board reflects the adjudication.
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
i0006. Replaces the snapshot-read (the one place a stale/cached pass could surface) with live recompute, plus opt-in live-reload and a bless-time refresh trigger.
<<<node: tasks/i6-m1-gate.md>>>
---
id: i6-m1-gate
statement: Milestone M1 (Frame) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i6-m1-problem-success]
---

## Rationale (not load-bearing)
i0006 milestone M1 check.
<<<node: tasks/i6-m1-problem-success.md>>>
---
id: i6-m1-problem-success
statement: Problem & success stated. The delta is real — thin harnesses can't engage the loop, bless-time state is invisible, and starting a new project dead-ends; done well = a legible readout, reliable contract delivery, and a straight-into-framing bootstrap.
milestone: M1
class: review
killer: true
depends_on: []
---

## Rationale (not load-bearing)
i0006 milestone M1 check.
<<<node: tasks/i6-m2-gate.md>>>
---
id: i6-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i6-m2-requirements-stated,i6-m2-req-traced,i6-m2-req-has-test]
---

## Rationale (not load-bearing)
i0006 milestone M2 check.
<<<node: tasks/i6-m2-req-has-test.md>>>
---
id: i6-m2-req-has-test
statement: Requirements verifiable. Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i6-m2-requirements-stated]
---

## Rationale (not load-bearing)
i0006 milestone M2 check.
<<<node: tasks/i6-m2-req-traced.md>>>
---
id: i6-m2-req-traced
statement: Requirements traced. Every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i6-m2-requirements-stated]
---

## Rationale (not load-bearing)
i0006 milestone M2 check.
<<<node: tasks/i6-m2-requirements-stated.md>>>
---
id: i6-m2-requirements-stated
statement: Requirements stated, each checkable. The 14 requirements across the four use-cases are written and testable.
milestone: M2
class: review
killer: true
depends_on: [i6-m1-gate]
---

## Rationale (not load-bearing)
i0006 milestone M2 check.
<<<node: tasks/i6-m3-adr-traced.md>>>
---
id: i6-m3-adr-traced
statement: ADRs traced. Every ADR addresses a requirement.
milestone: M3
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i6-m3-approach-chosen]
---

## Rationale (not load-bearing)
i0006 milestone M3 check.
<<<node: tasks/i6-m3-approach-chosen.md>>>
---
id: i6-m3-approach-chosen
statement: Approach chosen with a recorded reason. ADRs record the decisions: contract-delivery (native channel + active imperative, defer renderer) and readout-determinism (fixed 72-col fenced).
milestone: M3
class: review
killer: false
depends_on: [i6-m2-gate]
---

## Rationale (not load-bearing)
i0006 milestone M3 check.
<<<node: tasks/i6-m3-gate.md>>>
---
id: i6-m3-gate
statement: Milestone M3 (Design) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i6-m3-approach-chosen,i6-m3-adr-traced]
---

## Rationale (not load-bearing)
i0006 milestone M3 check.
<<<node: tasks/i6-m4-build-planned.md>>>
---
id: i6-m4-build-planned
statement: Build planned. The build is decomposed into small resumable steps seeded as children of i6-m4-build, in dependency order.
milestone: M4
class: review
killer: true
depends_on: [i6-m3-gate]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m4-build.md>>>
---
id: i6-m4-build
statement: Build. The planned children realize the design in dependency order; rolls up when the last step is done.
milestone: M4
class: review
killer: false
depends_on: [i6-m4-build-planned]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m4-designs-realized.md>>>
---
id: i6-m4-designs-realized
statement: Designs realized. Every requirement has a realized design (design: marker in product/).
milestone: M4
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i6-m4-build]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m4-gate.md>>>
---
id: i6-m4-gate
statement: Milestone M4 (Build & test) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i6-m4-build-planned,i6-m4-build,i6-m4-designs-realized,i6-m4-tests-pass,i6-m4-internal-quality]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m4-internal-quality.md>>>
---
id: i6-m4-internal-quality
statement: Internal quality ok — a quick self review of the build.
milestone: M4
class: review
killer: false
depends_on: [i6-m4-build]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m4-tests-pass.md>>>
---
id: i6-m4-tests-pass
statement: Verification green. Every test passes, across all iterations.
milestone: M4
class: executed
killer: true
verify: coverage:tests-pass
depends_on: [i6-m4-build]
---

## Rationale (not load-bearing)
i0006 milestone M4 check.
<<<node: tasks/i6-m5-docs-match.md>>>
---
id: i6-m5-docs-match
statement: Docs match the surface. README onboarding, AGENTS.md, copilot-instructions, and the contract reflect the actual behavior.
milestone: M5
class: review
killer: true
depends_on: [i6-m4-gate]
---

## Rationale (not load-bearing)
i0006 milestone M5 check.
<<<node: tasks/i6-m5-gate.md>>>
---
id: i6-m5-gate
statement: Milestone M5 (Docs & ship) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i6-m5-docs-match,i6-m5-packaged]
---

## Rationale (not load-bearing)
i0006 milestone M5 check.
<<<node: tasks/i6-m5-packaged.md>>>
---
id: i6-m5-packaged
statement: Packaged. quack ship produces the artifact.
milestone: M5
class: review
killer: false
depends_on: [i6-m5-docs-match]
---

## Rationale (not load-bearing)
i0006 milestone M5 check.
<<<node: test-bootstrap.md>>>
---
id: test-bootstrap
type: test
statement: Selftest asserts the onboarding flow and empty-spec-autostart rule are present on the entry surface and the README leads with conversational onboarding (raw CLI demoted).
class: review
verify: selftest:bootstrap
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
<<<node: test-contract-rules.md>>>
---
id: test-contract-rules
type: test
statement: Selftest asserts the contract and entry surfaces carry the required clauses. These are the y=console-bless rule, the killer-bless explicit-authorization exception, and the confirm-back ritual. It also asserts the active read→paraphrase→confirm imperative, and the existence of .github/copilot-instructions.md single-sourced from contract.md.
class: review
verify: selftest:contract
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
<<<node: test-correctness.md>>>
---
id: test-correctness
type: test
statement: Selftest asserts the lean checklist template carries the derived coverage checks (req-traced, req-has-test, adr-traced, designs-realized), so lean structurally enforces the trace. Two other correctness concerns are already covered by i0004's selftest:no-trace-gate and selftest:tests-pass-eval: no trace-typed node is a gate, and tests-pass uses the in-process evaluator.
class: review
verify: selftest:correctness
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
i0006. Only req-lean-enforces-trace is new; the other two retro notes were already realized in i0004.
<<<node: test-readout.md>>>
---
id: test-readout
type: test
statement: Selftest asserts the progress bar and handover one-pager render deterministically, identical bytes for identical inputs. They contain the required sections: START/milestones/END, and decisions/risks/readiness/bless line. Every line is <=72 columns inside a code fence.
class: review
verify: selftest:readout
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
<<<node: test-report-live.md>>>
---
id: test-report-live
type: test
statement: Selftest renders the report and asserts it carries the live-reload hook (an EventSource on /__reload). Recompute-live is structural: StatusMap is called on every render, and the snapshot machinery is removed.
class: review
verify: selftest:report-live
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
i0006 test for the live report.
<<<node: uc-bless-readout.md>>>
---
id: uc-bless-readout
type: usecase
statement: When the agent adjudicates a gate, it shows a deterministic at-a-glance readout. On a self-bless, it shows a horizontal progress bar of where the iteration stands (START, milestones, END, current position marked). On handing a killer gate to the human, it shows the bar plus a one-pager: biggest decisions, biggest risks, readiness facts, a bless recommendation. A human "y" is taken as the bless. Blessing a killer is permitted only with the human's explicit authorization.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. The bless-time readout, folded under need-engage (advancing the loop with the work and its checks visible). Houses the progress bar, the handover pager, the y=bless interaction, and the rule-3 killer-bless relaxation.
<<<node: uc-engine-correctness.md>>>
---
id: uc-engine-correctness
type: usecase
statement: ISO/IEC 25010 Functional Correctness: the determinizer's own checks are internally consistent, with one evaluation path for executed checks. They structurally enforce the trace at every rigor, including lean, so the ledger cannot silently mis-report.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Folds the retro correctness notes (tests-pass evaluator split; trace-typed nodes dangling as gates) and the lean-enforces-trace template fix.
<<<node: uc-harness-portability.md>>>
---
id: uc-harness-portability
type: usecase
statement: ISO/IEC 25010 Portability/Compatibility: the binding method reaches the agent reliably regardless of harness. A thin harness that will not follow a file pointer (e.g. GitHub Copilot) still receives the contract through its native instruction channel, with an active read→paraphrase→confirm imperative. This lets it engage the loop.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Field-driven: Opus 4.8 via Copilot could not engage the loop because AGENTS.md only pointed at the contract. A cross-cutting quality of the method.
<<<node: uc-new-project.md>>>
---
id: uc-new-project
type: usecase
statement: A user says "start a new project." The agent asks the framing questions: start an iteration? Which folder? Vendor the engine or drive-from-inside stubs? It scaffolds the workspace, lands in it, and immediately opens the first iteration's M1 vision interview. No manual CLI setup is needed.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Conversational bootstrap into the loop. Uses the existing start-init / start-stubs scaffolding (need-workspace-drive machinery); the new capability is auto-entering engage at framing.
