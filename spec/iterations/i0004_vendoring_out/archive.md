<<<quackitect-archive v1>>>
<<<node: adr-brand-overlay.md>>>
---
id: adr-brand-overlay
type: adr
statement: Brand, the design language of voice, logos, palette, and type, is an OVERLAY-resolved resource, not a ship-time transform. The engine's default brand is generic, with generic voice and logo placeholders, under product/. Quackitect's own brand, duck plus voice, lives in quackitect's .quack/overlay. So quack ship naturally packages a brand-neutral engine. Deleting a vehicle's brand files falls back to the engine default through the normal resolver.
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
Avoids ship-time magic; reuses the i4 resolver. "Delete to fall back" is just resolution.
<<<node: adr-white-label-argv.md>>>
---
id: adr-white-label-argv
type: adr
statement: Derive the brand from argv[0] (invoked binary name) rather than a config field, and have `start init` name the launcher + binary after the project. Keep the hidden .quack/ dir as plumbing (like .git/) rather than renaming it per-project, which would force findRoot off its literal marker.
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
Zero-config white-label; the engine never hardcodes its own name. User decided to keep .quack/.
<<<node: adr-workspace-base.md>>>
---
id: adr-workspace-base
type: adr
statement: Separate the engine from the workspace. The engine, binary plus vendored resources, is stateless with respect to any project. A WORKSPACE holds product, spec, and all state, and is selected by a target base, default the local workspace, with an override to drive another. Prior art: sebot tools take a `base` and write all state under it; git's binary operates on the repo at cwd or -C. The hidden .quack/ stays the engine and state home marker.
adjudicated_by: human
killer: true
---
## Rationale (not load-bearing)
The third separation axis (engine / vehicle / DATA). Reduces vendoring: driving a project needs only its workspace, not a second engine. Open fork: workspace as cwd vs an explicit --base flag vs a workspaces/ dir.
<<<node: iteration.md>>>
---
iteration: i0004_vendoring_out
status: active
type: default
rigor: systematic
---

Separate engine from workspace (product+spec+state) so one engine drives its own or another project's workspace — built on this session's vendoring-out (vendor model, start init, white-label rebrand, .claude vendoring).
<<<node: need-qualities.md>>>
---
id: need-qualities
type: need
source: stk-assessor
statement: The system exhibits cross-cutting QUALITY attributes (NFRs) that no single functional use-case owns. They constrain the whole. This need is the home for those qualities. First is the brand design-language: voice, logos, palette, typography. Others migrate here over time: responsiveness, determinism, and the like.
class: judgment
killer: true
functions: [hash every input, attest a session, observe a test failing]
---
## Rationale (not load-bearing)
NFRs / quality-attributes are cross-cutting; they do not refine a functional need cleanly. Gathering them under one "qualities" need keeps the trace honest. Design + voice are the first residents; existing NFRs (e.g. responsiveness) can migrate here in a later pass without churning their origin iteration.
<<<node: need-workspace-drive.md>>>
---
id: need-workspace-drive
type: need
source: stk-integrator
statement: One reusable, dependency-free engine drives many projects. A project's product, spec, and all its state live in a selectable WORKSPACE. The engine, binary plus resources, is separate. It can point at its own workspace or a different project's, the way a tool operates on a target repo. Other projects vendor and overlay the engine without forking. It runs as a self-contained artifact with no runtime or web-downloaded dependencies.
class: judgment
killer: true
functions: [rebuild the engine, migrate a workspace, test itself]
---
## Rationale (not load-bearing)
i0006 consolidation: absorbs the former need-engine-reuse (reusable, dependency-free, vendor/overlay engine) into workspace-drive. quack and vehicles are themselves projects (product+spec) but must also drive OTHER projects; separating the workspace (data) from the engine lets one engine serve many workspaces, and the vendor/overlay chain lets other projects reuse it without forking. Use-cases: uc-self-workspace, uc-drive-other-workspace, uc-drive-from-inside, uc-ship-branded-engine, uc-review-board, uc-run-dep-free, uc-vendor-engine.
<<<node: req-design-language.md>>>
---
id: req-design-language
type: requirement
statement: A design-language resource defines the brand as ONE bundle: voice, logo set (hero + mark), colour palette, and typography. Every output resolves brand assets through the overlay chain. The engine default is GENERIC, a neutral voice with [LOGO GOES HERE] placeholders. A vehicle overrides in its overlay. Deleting the vehicle's files falls back to the engine default. The report renders the resolved logo to the left of the project name.
depends_on: []
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Per the brand discussion: the design language rides the i4 overlay chain (no ship-time transform). quackitect's duck lives in quackitect's .quack/overlay, so quack ship packages a brand-neutral engine. Voice is part of the design language.
<<<node: req-gate-eval-integrity.md>>>
---
id: req-gate-eval-integrity
type: requirement
statement: The engine shall keep gate evaluation honest: one evaluator, a tool-owned build re-baseline, and no trace node as a task gate. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. An invariant — no trace-typed node (need, usecase, requirement, design, test, adr) is ever treated as a task gate. A lint/selftest check asserts it so the dangling-test-gate class of bug cannot regress. *(was req-no-trace-gate)*
2. The tests-pass coverage rule evaluates executed checks through the SAME in-process evaluator as the gate state machine — not a divergent shell path. A selftest asserts that a selftest:-verified test passes inside tests-pass, so the two paths cannot silently diverge again. *(was req-tests-pass-unify)*
3. A `quack build` determinizer compiles the Go engine AND re-baselines .quack/engine/golden-root.txt in one step, so the build->root->golden sequence is owned by the tool, not hand-run. Eliminates the stale-golden footgun (transient false milestone FAILs). *(was req-quack-build)*
<<<node: req-report-check-display.md>>>
---
id: req-report-check-display
type: requirement
statement: The report shall render checks in their real hierarchy with each DONE check linking its verdict. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Build steps nest under a single build parent and tests under a generic testing parent (a third level in the milestone->subtask render), in dependency order. engage seeds build/test subtasks under those parents; the report renders and collapses the hierarchy. *(was req-trace-nesting)*
2. In the report, a DONE check links to its VERDICT — the bless attestation (who blessed, when, against which hash) for review gates, or the evidence/why for executed checks — so the reader sees WHY it passed, not just that it did. *(was req-verdict-link)*
<<<node: req-vendor-workspace.md>>>
---
id: req-vendor-workspace
type: requirement
statement: The engine shall scaffold a brand-agnostic vehicle whose vendored engine drives a selectable workspace. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. `start init` vendors the .claude/ slash commands (engage, note, review) and settings into the vehicle, rewriting the dogfood method path product/quackitect/ to .quack/vendor/quackitect/ so the pointers resolve. Shipped this session. *(was req-claude-vendor)*
2. `quack start init <target>`, run from a quackitect checkout, scaffolds a vehicle at the target — vendors product/ into .quack/vendor/, copies the binary, writes config + launcher + AGENTS, lays down empty product/ + spec/, and never mints an iteration or fills the spec. Shipped this session. *(was req-vehicle-scaffold)*
3. The engine is vendored under .quack/vendor/ mirroring quackitect's product/ 1:1 (engine-go source + quackitect resources + assets). Resource and source lookup resolve vendor-first with a dogfood product/ fallback (EngineDir/EngineSrc), so a vehicle never inherits a hardcoded dogfood path. Shipped this session. *(was req-vendor-layout)*
4. The engine is brand-agnostic in all user-facing output — the brand derives from the invoked binary name (argv[0]). `start init` names the launcher <project>.cmd and binary <project>.exe after the target, so a vehicle's command and output read as the project, never "quack". The hidden .quack/ dir stays as plumbing. Shipped this session. *(was req-white-label)*
5. The engine operates on a selectable WORKSPACE separate from itself. A workspace holds the project's product, spec, and ALL its state (attest, evidence, snapshot, notes, gather, out, config). The engine resolves its own workspace by default, or a different one when pointed at a target base. Acceptance bar — a vehicle can create a DUMMY workspace and drive it through a full systematic iteration with no real content (a "machinery test", each milestone argued as exercising the machinery) and every gate passes. *(was req-workspace-split)*
<<<node: tasks/i4-m1-gate.md>>>
---
id: i4-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i4-m1-problem-agreed,i4-m1-vision-scope-stated,i4-m1-success-measurable,i4-m1-top-risks-logged]
---

## Rationale (not load-bearing)
Milestone M1 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m1-problem-agreed.md>>>
---
id: i4-m1-problem-agreed
statement: Problem agreed. quack and vehicles must drive OTHER projects, not just themselves; the engine is bound to its ROOT today. The delta is real and worth solving.
milestone: M1
class: review
killer: true
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i4-m1-success-measurable.md>>>
---
id: i4-m1-success-measurable
statement: Success measurable. Killer criterion: a vehicle creates a dummy workspace and drives it through a full systematic iteration (machinery test) with all milestones green. Each requirement maps to a test.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i4-m1-top-risks-logged.md>>>
---
id: i4-m1-top-risks-logged
statement: Top risks logged (RAID): workspace-split touches findRoot and state paths (regression risk); the machinery test must pass on empty content; the re-baseline footgun (mitigated by quack build).
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i4-m1-vision-scope-stated.md>>>
---
id: i4-m1-vision-scope-stated
statement: Vision and scope stated. In scope: workspace separation, grandfathered vendoring-out (vendor model, start init, white-label, .claude), quack build, tests-pass unify, no-trace-gate invariant, report verdict-link and nesting. Out: a multi-workspace registry UI.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i4-m2-gate.md>>>
---
id: i4-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i4-m2-inputs-captured,i4-m2-requirements-traced,i4-m2-requirements-verifiable,i4-m2-stakeholder-coverage]
---

## Rationale (not load-bearing)
Milestone M2 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m2-inputs-captured.md>>>
---
id: i4-m2-inputs-captured
statement: Inputs captured. Retro notes (6 inbox items), the shipped vendoring work, the sebot base-style prior art, and the machinery-test acceptance bar.
milestone: M2
class: review
killer: false
depends_on: [i4-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/i4-m2-requirements-traced.md>>>
---
id: i4-m2-requirements-traced
statement: Requirements traced. Every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i4-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (coverage:req-traced).
<<<node: tasks/i4-m2-requirements-verifiable.md>>>
---
id: i4-m2-requirements-verifiable
statement: Requirements verifiable. Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i4-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (coverage:req-has-test).
<<<node: tasks/i4-m2-stakeholder-coverage.md>>>
---
id: i4-m2-stakeholder-coverage
statement: Stakeholder coverage. Builders shipping branded engines, users driving other projects, and the maintainer (dev ergonomics) are represented.
milestone: M2
class: review
killer: false
depends_on: [i4-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/i4-m3-alternatives-elaborated.md>>>
---
id: i4-m3-alternatives-elaborated
statement: At least 2 alternatives elaborated for the workspace split: (a) a base or workspace selector defaulting to cwd; (b) a workspaces subdir registry; (c) status quo, vendor a full engine per project.
milestone: M3
class: review
killer: true
depends_on: [i4-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i4-m3-criteria-weighted.md>>>
---
id: i4-m3-criteria-weighted
statement: Criteria weighted: least vendoring, backward-compatible default, minimal change to findRoot and state, sebot parity.
milestone: M3
class: review
killer: false
depends_on: [i4-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i4-m3-feasibility-checked.md>>>
---
id: i4-m3-feasibility-checked
statement: Feasibility checked: state-path centralization (QUACK, ATTEST, etc.) and findRoot are the touch points; a base selector is tractable.
milestone: M3
class: review
killer: false
depends_on: [i4-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i4-m3-gate.md>>>
---
id: i4-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i4-m3-alternatives-elaborated,i4-m3-criteria-weighted,i4-m3-feasibility-checked]
---

## Rationale (not load-bearing)
Milestone M3 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m4-adr-recorded.md>>>
---
id: i4-m4-adr-recorded
statement: ADRs recorded and traced. Every ADR addresses a requirement (adr-workspace-base, adr-white-label-argv).
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i4-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Derived from the trace (coverage:adr-traced).
<<<node: tasks/i4-m4-architecture-stated.md>>>
---
id: i4-m4-architecture-stated
statement: Architecture stated: engine stateless; a workspace (product+spec+state) selected by a target base, default local; hidden .quack stays the marker. See adr-workspace-base.
milestone: M4
class: review
killer: false
depends_on: [i4-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/i4-m4-choice-traced.md>>>
---
id: i4-m4-choice-traced
statement: Choice traced. The chosen base-selector architecture traces to req-workspace-split via adr-workspace-base.
milestone: M4
class: review
killer: false
depends_on: [i4-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/i4-m4-gate.md>>>
---
id: i4-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i4-m4-architecture-stated,i4-m4-adr-recorded,i4-m4-choice-traced]
---

## Rationale (not load-bearing)
Milestone M4 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m5-design-buildable.md>>>
---
id: i4-m5-design-buildable
statement: Design buildable. The base-selector plus state-path centralization decomposes into small build steps.
milestone: M5
class: review
killer: false
depends_on: [i4-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i4-m5-gate.md>>>
---
id: i4-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i4-m5-riskiest-validated,i4-m5-design-buildable,i4-m5-spike-recorded]
---

## Rationale (not load-bearing)
Milestone M5 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m5-riskiest-validated.md>>>
---
id: i4-m5-riskiest-validated
statement: Riskiest unknown validated by a spike: drive a dummy workspace at a target base far enough to prove state writes under the workspace and milestones can be walked on empty content.
milestone: M5
class: review
killer: true
depends_on: [i4-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i4-m5-spike-recorded.md>>>
---
id: i4-m5-spike-recorded
statement: Spike recorded (.quack/spikes), keeper captured backward into the requirement or design.
milestone: M5
class: review
killer: false
depends_on: [i4-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i4-m6-bs-grandfather-designs.md>>>
---
id: i4-m6-bs-grandfather-designs
statement: Relink the shipped code design-markers to the new i4 req ids (req-vendor-layout, req-vehicle-scaffold, req-white-label, req-claude-vendor) so designs-realized covers them.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-quack-build]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-machinery.md>>>
---
id: i4-m6-bs-machinery
statement: selftest:workspace + :brand + :claude-vendor + :build wired into the suite; the e2e machinery test (vehicle -> dummy workspace -> full systematic iteration). Realizes req-workspace-split acceptance.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-report-nesting]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-no-trace-gate.md>>>
---
id: i4-m6-bs-no-trace-gate
statement: no-trace-gate invariant + selftest:no-trace-gate. Realizes req-no-trace-gate.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-workspace-base]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-quack-build.md>>>
---
id: i4-m6-bs-quack-build
statement: quack build — a determinizer that compiles the engine AND re-baselines golden-root in one step. Closes req-quack-build.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-build-planned]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-report-nesting.md>>>
---
id: i4-m6-bs-report-nesting
statement: Report: 3rd-level build/test nesting + engage seeding + selftest:report-nesting. Realizes req-trace-nesting.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-report-verdict]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-report-verdict.md>>>
---
id: i4-m6-bs-report-verdict
statement: Report: DONE check links to verdict (bless who/when/hash) or evidence + selftest:report-verdict. Realizes req-verdict-link.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-tests-pass-eval]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-tests-pass-eval.md>>>
---
id: i4-m6-bs-tests-pass-eval
statement: Unify tests-pass with the gateState executed-check evaluator + selftest:tests-pass-eval. Realizes req-tests-pass-unify.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-no-trace-gate]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-bs-workspace-base.md>>>
---
id: i4-m6-bs-workspace-base
statement: Workspace base selector: a --base/-C override + centralize state-path resolution behind the workspace root; default = cwd walk-up (unchanged). Realizes req-workspace-split.
milestone: M6
parent: i4-m6-build
class: review
killer: false
depends_on: [i4-m6-bs-grandfather-designs]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step; chained in dependency order.
<<<node: tasks/i4-m6-build-planned.md>>>
---
id: i4-m6-build-planned
statement: Build planned. Decomposed into small, resumable build subtasks seeded as children of the build task.
milestone: M6
class: review
killer: true
depends_on: [i4-m5-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i4-m6-build.md>>>
---
id: i4-m6-build
statement: Build the design. The planned children realize it in dependency order; this rolls up when the last step is done.
milestone: M6
class: review
killer: false
depends_on: [i4-m6-bs-machinery]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i4-m6-detailed-design-complete.md>>>
---
id: i4-m6-detailed-design-complete
statement: Detailed design complete. Every requirement has a realized design (inline code marker).
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i4-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (coverage:designs-realized).
<<<node: tasks/i4-m6-gate.md>>>
---
id: i4-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i4-m6-build-planned,i4-m6-detailed-design-complete,i4-m6-verification-green,i4-m6-impl-risks-acceptable,i4-m6-internal-quality-ok]
---

## Rationale (not load-bearing)
Milestone M6 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m6-impl-risks-acceptable.md>>>
---
id: i4-m6-impl-risks-acceptable
statement: Implementation risks acceptable. Workspace-split did not regress dogfood (selftest and status green).
milestone: M6
class: review
killer: false
depends_on: [i4-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i4-m6-internal-quality-ok.md>>>
---
id: i4-m6-internal-quality-ok
statement: Internal quality OK. State-path changes are centralized, not scattered.
milestone: M6
class: review
killer: false
depends_on: [i4-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i4-m6-verification-green.md>>>
---
id: i4-m6-verification-green
statement: Verification green. Every test passes, across all iterations.
milestone: M6
class: executed
killer: true
verify: coverage:tests-pass
depends_on: [i4-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (coverage:tests-pass).
<<<node: tasks/i4-m7-acceptance-obtained.md>>>
---
id: i4-m7-acceptance-obtained
statement: Acceptance obtained. The human walked the milestones and blessed each gate in increasing-scrutiny rounds.
milestone: M7
class: review
killer: false
depends_on: [i4-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i4-m7-gate.md>>>
---
id: i4-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i4-m7-meets-need,i4-m7-killer-ucs-demonstrated,i4-m7-acceptance-obtained,i4-m7-validation-gaps]
---

## Rationale (not load-bearing)
Milestone M7 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m7-killer-ucs-demonstrated.md>>>
---
id: i4-m7-killer-ucs-demonstrated
statement: Killer use-cases demonstrated end-to-end: a vehicle creates a dummy workspace and is driven through a full systematic iteration (machinery test) with every milestone green, done for real, not merely a green suite.
milestone: M7
class: review
killer: true
depends_on: [i4-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i4-m7-meets-need.md>>>
---
id: i4-m7-meets-need
statement: Meets the need. Validated against ALL needs across every iteration (regression), demonstrated by the success criteria.
milestone: M7
validates: needs
class: review
killer: true
depends_on: [i4-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i4-m7-validation-gaps.md>>>
---
id: i4-m7-validation-gaps
statement: Validation gaps logged (RAID and carry-forward).
milestone: M7
class: review
killer: false
depends_on: [i4-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i4-m8-config-baselined.md>>>
---
id: i4-m8-config-baselined
statement: Configuration baselined (golden-root via quack build; .gitignore; attest ledger).
milestone: M8
class: review
killer: false
depends_on: [i4-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i4-m8-docs-complete.md>>>
---
id: i4-m8-docs-complete
statement: Docs complete and match the actual surface (integrate.md, AGENTS, dependencies, the new quack build and workspace usage).
milestone: M8
class: review
killer: true
depends_on: [i4-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i4-m8-gate.md>>>
---
id: i4-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i4-m8-docs-complete,i4-m8-config-baselined,i4-m8-packaged-versioned,i4-m8-handover-accepted]
---

## Rationale (not load-bearing)
Milestone M8 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i4-m8-handover-accepted.md>>>
---
id: i4-m8-handover-accepted
statement: Handover accepted by the human.
milestone: M8
class: review
killer: false
depends_on: [i4-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i4-m8-packaged-versioned.md>>>
---
id: i4-m8-packaged-versioned
statement: Packaged and versioned. quack ship outputs product/ for i4.
milestone: M8
class: review
killer: false
depends_on: [i4-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: test-claude-vendor.md>>>
---
id: test-claude-vendor
type: test
statement: start init vendors .claude/commands/* with the method path rewritten from product/quackitect/ to .quack/vendor/quackitect/, and the rewritten targets exist in the vehicle.
class: executed
verify: selftest:claude-vendor
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test over the rewrite.
<<<node: test-design-language.md>>>
---
id: test-design-language
type: test
statement: Brand assets resolve through the overlay chain. The engine default (generic voice plus a logo placeholder) is present and resolvable. A vehicle override wins. The report embeds the resolved logo left of the project name.
class: executed
verify: selftest:brand-resolves
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
Guards the overlay resolution of brand assets + the placeholder convention. New self-test (built next).
<<<node: test-machinery-e2e.md>>>
---
id: test-machinery-e2e
type: test
statement: A vehicle (from start init) creates a dummy workspace. The engine drives that workspace through a FULL systematic iteration with empty content, a machinery test: start, gather, compose, every milestone gate M1-M8, coverage rules, report, ship. All gates pass. State resolves under the workspace, not the engine.
class: review
verify: selftest:workspace
killer: true
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
The i4 killer end-to-end demonstration (the user's acceptance bar). selftest:workspace exercises the machinery non-interactively where possible; the full bless walk is demonstrated live at M7. Empty trace -> coverage vacuously green; review gates blessed with machinery-test rationale.
<<<node: test-no-trace-gate.md>>>
---
id: test-no-trace-gate
type: test
statement: No trace-typed node (need/usecase/requirement/design/test/adr) is ever a task gate. This is asserted over the loaded graph.
class: executed
verify: selftest:no-trace-gate
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New invariant self-test.
<<<node: test-quack-build.md>>>
---
id: test-quack-build
type: test
statement: quack build compiles the engine and re-baselines golden-root in one step; after it, selftest:parity is green.
class: executed
verify: selftest:build
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test asserting the build determinizer wiring (re-baseline path).
<<<node: test-tests-pass-unify.md>>>
---
id: test-tests-pass-unify
type: test
statement: A selftest:-verified test passes inside the tests-pass coverage rule. This proves tests-pass and the gate state machine use the same executed-check evaluator.
class: executed
verify: selftest:tests-pass-eval
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test guarding against the two-path divergence.
<<<node: test-trace-nesting.md>>>
---
id: test-trace-nesting
type: test
statement: The report renders a third nesting level: build steps under a build parent, tests under a testing parent. Engage seeds subtasks under those parents.
class: executed
verify: selftest:report-nesting
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test over the render hierarchy.
<<<node: test-vehicle-scaffold.md>>>
---
id: test-vehicle-scaffold
type: test
statement: start init produces a runnable vehicle whose gather resolves the engine's rigor/type resources through the vendored overlay chain.
class: executed
verify: selftest:integrate
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
Reuses the integrate self-test; the scaffold is demonstrated end-to-end by test-machinery-e2e.
<<<node: test-vendor-layout.md>>>
---
id: test-vendor-layout
type: test
statement: Engine resources and source resolve vendor-first (.quack/vendor) with a dogfood fallback; a vendored vehicle resolves the engine without a hardcoded path.
class: executed
verify: selftest:split
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
Reuses the existing split self-test (overlay/read-only).
<<<node: test-verdict-link.md>>>
---
id: test-verdict-link
type: test
statement: The report wires a DONE check to its verdict (bless: who/when/hash) or evidence/why.
class: executed
verify: selftest:report-verdict
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test over the report shell.
<<<node: test-white-label.md>>>
---
id: test-white-label
type: test
statement: Engine output is branded from argv[0]: the invoked name drives usage/version. The default is quack. A vehicle named otherwise reads as that name.
class: executed
verify: selftest:brand
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test asserting brand() derivation.
<<<node: uc-drive-other-workspace.md>>>
---
id: uc-drive-other-workspace
type: usecase
statement: A user with one engine points it at a DIFFERENT project's workspace (a target base) and drives it without vendoring a second engine.
class: review
---
## Rationale (not load-bearing)
The sebot `base`-style separation. The headline of i4.
<<<node: uc-review-board.md>>>
---
id: uc-review-board
type: usecase
statement: A reader reviews any workspace's board and can see not just THAT a check passed but WHY: its verdict (bless attestation) or evidence. The task tree nests to reflect real build/test hierarchy.
class: review
---
## Rationale (not load-bearing)
Folds the two report notes (verdict-link, graph nesting) into i4.
<<<node: uc-self-workspace.md>>>
---
id: uc-self-workspace
type: usecase
statement: The engine drives its OWN workspace (dogfood). Product, spec, and state resolve from the local workspace by default.
class: review
---
## Rationale (not load-bearing)
The default, backward-compatible case.
<<<node: uc-ship-branded-engine.md>>>
---
id: uc-ship-branded-engine
type: usecase
statement: A builder vendors the engine into a project under its own brand (launcher, binary, output, slash-commands), so the project's users never see "quack". The engine-distribution path shipped this session.
class: review
---
## Rationale (not load-bearing)
Grandfathers the vendoring-out work (vendor model, start init, white-label, .claude vendoring).
<<<node: uc-usability.md>>>
---
id: uc-usability
type: usecase
statement: ISO/IEC 25010 Usability, renamed Interaction Capability in the 2023 revision: the product is recognizable, aesthetically coherent, and communicates in a consistent voice. Its sub-characteristics here are appropriateness-recognizability and user-interface aesthetics, realized by the brand/design-language. A vehicle re-skins by overriding; an unbranded one falls back to a neutral default.
class: review
---
## Rationale (not load-bearing)
The "use-case" layer under need-qualities holds ISO 25010 quality CHARACTERISTICS (a schema misnomer — they are qualities, not functional use-cases). Other characteristics (Performance Efficiency for responsiveness, Reliability for determinism) get their own node here as NFRs migrate in.
