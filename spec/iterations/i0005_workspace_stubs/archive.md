<<<quackitect-archive v1>>>
<<<node: adr-engine-resolution.md>>>
---
id: adr-engine-resolution
type: adr
statement: A bare workspace reaches its engine through a committed root launcher (`quack.cmd`) that resolves a `quack.exe` in a fixed order — internal `.quack\engine\quack.exe`, then the gitignored pointer `.quack\engine.local`, then the `QUACK_ENGINE` env var — and forwards all arguments; if none resolve it exits with a clear message. PATH lookup (candidate C) and a committed relative link (candidate D) are rejected: C mutates global state and is ambiguous, D leaks the engine location into version control. The engine location therefore lives only in gitignored/machine-local places, never in a tracked file.
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0005 decision. Order internal→B→A chosen by the human. Internal-first preserves the dogfood case (quackitect drives itself via its own built engine, exactly as quack.cmd does today); B gives an explicit per-clone override discoverable in-repo; A serves CI/power users. Satisfies the High criteria (out of VC, drive-from-inside, no engine copy) and stays Windows-portable with a plain .cmd (no symlinks). Other-OS launcher deferred.
<<<node: iteration.md>>>
---
iteration: i0005_workspace_stubs
status: active
type: default
rigor: systematic
---

Drive a bare --base workspace from inside itself via linked-engine stubs (launcher + AGENTS + gitignored engine pointer); wire the roundtrip machinery test to prove drive-from-inside.
<<<node: req-workspace-stubs.md>>>
---
id: req-workspace-stubs
ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded (adr-grandfathers-historical)
type: requirement
statement: A bare workspace shall drive its runtime-resolved engine from inside via committed stubs that carry no engine path - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. From inside a bare workspace, `.\quack status` (and `next`, `bless`) drives it via the linked engine and prints its board, with no engine path in version control. Acceptance bar — the existing roundtrip/machinery test is EXTENDED to create a bare workspace and drive it from inside via the stubs, and it passes. *(was req-drive-from-inside)*
2. The engine's location shall be resolved at runtime and shall never appear in version control - a clone on another machine carries no absolute engine path and no engine binary. *(was req-engine-loc-untracked)*
3. A bare workspace ships a committed `AGENTS.md` stub that tells an AI opening the workspace to drive it via `.\quack` and to load method prompts path-free through `quack resolve` / `quack guides`. The stub is self-contained — no external instruction and no hard link to a quackitect checkout is required. *(was req-inside-entry-surface)*
4. The bare workspace's committed launcher stub (`quack.cmd` at its root) shall resolve an engine at runtime in a fixed order - the global engine binary, then env `QUACK_ENGINE` - and forward all arguments to it. No engine binary or engine path is committed into the workspace. *(was req-inside-launcher)*
<<<node: tasks/i5-m1-gate.md>>>
---
id: i5-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i5-m1-problem-agreed,i5-m1-vision-scope-stated,i5-m1-success-measurable,i5-m1-top-risks-logged]
---

## Rationale (not load-bearing)
Milestone M1 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m1-problem-agreed.md>>>
---
id: i5-m1-problem-agreed
statement: Problem agreed. A --base-driven workspace can only be driven from OUTSIDE today; opened on its own it has no entry surface. The delta is real and worth solving.
milestone: M1
class: review
killer: true
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i5-m1-success-measurable.md>>>
---
id: i5-m1-success-measurable
statement: Success is measurable. From inside a bare workspace, `.\quack status` drives it via the linked engine, and no path to the engine appears in version control.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i5-m1-top-risks-logged.md>>>
---
id: i5-m1-top-risks-logged
statement: Top risks logged (RAID). The engine-location indirection, keeping it out of version control, and the roundtrip test actually exercising the drive-from-inside path.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i5-m1-vision-scope-stated.md>>>
---
id: i5-m1-vision-scope-stated
statement: Vision & scope stated. Open a bare --base workspace and drive it from inside via a linked engine, with no engine copied in and no engine path in version control.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i5-m2-gate.md>>>
---
id: i5-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i5-m2-inputs-captured,i5-m2-requirements-traced,i5-m2-requirements-verifiable,i5-m2-stakeholder-coverage]
---

## Rationale (not load-bearing)
Milestone M2 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m2-inputs-captured.md>>>
---
id: i5-m2-inputs-captured
statement: Inputs captured — context, stakeholders, use cases. The two backlog retro notes, the existing --base drive-a-workspace mechanism, `quack resolve` for path-free prompt loading, and the roundtrip machinery test.
milestone: M2
class: review
killer: false
depends_on: [i5-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/i5-m2-requirements-traced.md>>>
---
id: i5-m2-requirements-traced
statement: Requirements traced. Every requirement traces back to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i5-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (coverage:req-traced).
<<<node: tasks/i5-m2-requirements-verifiable.md>>>
---
id: i5-m2-requirements-verifiable
statement: Requirements verifiable. Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i5-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (coverage:req-has-test).
<<<node: tasks/i5-m2-stakeholder-coverage.md>>>
---
id: i5-m2-stakeholder-coverage
statement: Stakeholder coverage — no role left out. The human driving a project from its own folder, the AI reading its entry surface, and version control (which must not carry the engine path).
milestone: M2
class: review
killer: false
depends_on: [i5-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment.
<<<node: tasks/i5-m3-alternatives-elaborated.md>>>
---
id: i5-m3-alternatives-elaborated
statement: At least two alternatives elaborated for how a bare workspace reaches its engine (e.g. gitignored pointer file, environment variable, engine on PATH, or a committed relative link).
milestone: M3
class: review
killer: true
depends_on: [i5-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i5-m3-criteria-weighted.md>>>
---
id: i5-m3-criteria-weighted
statement: Decision criteria weighted, derived from the requirements — keep the engine path out of version control, drive from inside, no engine copy, portability, simplicity.
milestone: M3
class: review
killer: false
depends_on: [i5-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i5-m3-feasibility-checked.md>>>
---
id: i5-m3-feasibility-checked
statement: Feasibility rough-checked per candidate against the existing engine (engineRoot/--base resolution and `quack resolve`).
milestone: M3
class: review
killer: false
depends_on: [i5-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment.
<<<node: tasks/i5-m3-gate.md>>>
---
id: i5-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i5-m3-alternatives-elaborated,i5-m3-criteria-weighted,i5-m3-feasibility-checked]
---

## Rationale (not load-bearing)
Milestone M3 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m4-adr-recorded.md>>>
---
id: i5-m4-adr-recorded
statement: ADR recorded and traced. Every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i5-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Derived from the trace (coverage:adr-traced).
<<<node: tasks/i5-m4-architecture-stated.md>>>
---
id: i5-m4-architecture-stated
statement: Chosen architecture stated — how a bare workspace resolves and invokes its engine, and where the (non-committed) engine location lives.
milestone: M4
class: review
killer: false
depends_on: [i5-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/i5-m4-choice-traced.md>>>
---
id: i5-m4-choice-traced
statement: Choice traced to the weighted criteria.
milestone: M4
class: review
killer: false
depends_on: [i5-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment.
<<<node: tasks/i5-m4-gate.md>>>
---
id: i5-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i5-m4-architecture-stated,i5-m4-choice-traced,i5-m4-adr-recorded]
---

## Rationale (not load-bearing)
Milestone M4 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m5-design-buildable.md>>>
---
id: i5-m5-design-buildable
statement: Design is buildable — the stub set and launcher resolution fit the existing engine with no core rework.
milestone: M5
class: review
killer: false
depends_on: [i5-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i5-m5-gate.md>>>
---
id: i5-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i5-m5-riskiest-validated,i5-m5-design-buildable,i5-m5-spike-recorded]
---

## Rationale (not load-bearing)
Milestone M5 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m5-riskiest-validated.md>>>
---
id: i5-m5-riskiest-validated
statement: Riskiest assumptions validated by evidence — a spike proves a bare workspace drives itself from inside via the resolved engine, with no engine path committed.
milestone: M5
class: review
killer: true
depends_on: [i5-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i5-m5-spike-recorded.md>>>
---
id: i5-m5-spike-recorded
statement: Spike results recorded — design advanced as needed.
milestone: M5
class: review
killer: false
depends_on: [i5-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment.
<<<node: tasks/i5-m6-bs-emit.md>>>
---
id: i5-m6-bs-emit
statement: Emit the stub set (launcher + AGENTS.md + .gitignore) into a target workspace via the engine's scaffold path, so a bare workspace can be made drivable-from-inside with one step. Realizes req-drive-from-inside (the emit half).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-bs-stub-templates]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Wires the three templates into a target workspace.
<<<node: tasks/i5-m6-bs-roundtrip.md>>>
---
id: i5-m6-bs-roundtrip
statement: Extend the roundtrip machinery test (`selftest:workspace`) so that after creating a bare workspace it drives it FROM INSIDE via the emitted launcher (resolving the engine at runtime) — status, next, a bless, report. Wires test-drive-from-inside (the killer demonstration).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-bs-selftest-stubs]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). The end-to-end proof, reusing the existing roundtrip harness per the user's ask.
<<<node: tasks/i5-m6-bs-selftest-stubs.md>>>
---
id: i5-m6-bs-selftest-stubs
statement: Implement `selftest:stubs` — resolution order (internal → pointer → env, clear failure when none), AGENTS.md self-contained (no hard checkout path), and .gitignore excludes the pointer. Wires test-inside-launcher, test-inside-entry-surface, test-engine-loc-untracked.
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-bs-emit]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). The unit guards named as residual in the M5 spike.
<<<node: tasks/i5-m6-bs-stub-templates.md>>>
---
id: i5-m6-bs-stub-templates
statement: Author the drive-from-inside stub templates as one authoring unit — the `quack.cmd` launcher (internal → `.quack\engine.local` → `QUACK_ENGINE`, clear failure otherwise), the committed `AGENTS.md` stub (drive via `.\quack`; prompts via `quack resolve` / `quack guides`), and the `.gitignore` (excludes `.quack/engine.local`, `.quack/engine/`). Realizes req-inside-launcher, req-inside-entry-surface, req-engine-loc-untracked (design markers in the templates).
milestone: M6
parent: i5-m6-build
class: review
killer: false
depends_on: [i5-m6-build-planned]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). One checkpoint: the three stub files are authored together and share one verification; splitting per-file was below the resumability floor. The launcher's label-goto shape was validated in the M5 spike.
<<<node: tasks/i5-m6-build-planned.md>>>
---
id: i5-m6-build-planned
statement: Build planned — decomposed into small, resumable steps seeded as children of the build task.
milestone: M6
class: review
killer: true
depends_on: [i5-m5-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment. Build steps are seeded as children here at M6 entry.
<<<node: tasks/i5-m6-build.md>>>
---
id: i5-m6-build
statement: Build the design. The planned children realize it in dependency order; this rolls up when the last step is done.
milestone: M6
class: review
killer: false
depends_on: [i5-m6-bs-roundtrip]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i5-m6-detailed-design-complete.md>>>
---
id: i5-m6-detailed-design-complete
statement: Detailed design complete — every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i5-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (coverage:designs-realized).
<<<node: tasks/i5-m6-gate.md>>>
---
id: i5-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i5-m6-build-planned,i5-m6-build,i5-m6-detailed-design-complete,i5-m6-internal-quality-ok,i5-m6-verification-green,i5-m6-impl-risks-acceptable]
---

## Rationale (not load-bearing)
Milestone M6 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m6-impl-risks-acceptable.md>>>
---
id: i5-m6-impl-risks-acceptable
statement: Implementation risks acceptable.
milestone: M6
class: review
killer: false
depends_on: [i5-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i5-m6-internal-quality-ok.md>>>
---
id: i5-m6-internal-quality-ok
statement: Internal quality ok — a review of the stub set and launcher for clarity and portability.
milestone: M6
class: review
killer: false
depends_on: [i5-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment.
<<<node: tasks/i5-m6-verification-green.md>>>
---
id: i5-m6-verification-green
statement: Verification green — every test passes, across all iterations.
milestone: M6
class: executed
killer: false
verify: coverage:tests-pass
depends_on: [i5-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (coverage:tests-pass).
<<<node: tasks/i5-m7-acceptance-obtained.md>>>
---
id: i5-m7-acceptance-obtained
statement: Acceptance obtained — sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i5-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i5-m7-gate.md>>>
---
id: i5-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i5-m7-meets-need,i5-m7-killer-ucs-demonstrated,i5-m7-acceptance-obtained,i5-m7-validation-gaps]
---

## Rationale (not load-bearing)
Milestone M7 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m7-killer-ucs-demonstrated.md>>>
---
id: i5-m7-killer-ucs-demonstrated
statement: Killer use-cases demonstrated end-to-end — a bare workspace driven from inside via the linked engine, proven by the roundtrip machinery test.
milestone: M7
class: review
killer: false
depends_on: [i5-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i5-m7-meets-need.md>>>
---
id: i5-m7-meets-need
statement: Meets the need — validated against all needs (every iteration), demonstrated by the Ch1 criteria.
milestone: M7
class: review
killer: true
depends_on: [i5-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i5-m7-validation-gaps.md>>>
---
id: i5-m7-validation-gaps
statement: Validation gaps captured (RAID).
milestone: M7
class: review
killer: false
depends_on: [i5-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment.
<<<node: tasks/i5-m8-config-baselined.md>>>
---
id: i5-m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
depends_on: [i5-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i5-m8-docs-complete.md>>>
---
id: i5-m8-docs-complete
statement: Docs complete and match the actual surface — the drive-from-inside stubs documented (integrate.md and the workspace AGENTS entry).
milestone: M8
class: review
killer: true
depends_on: [i5-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i5-m8-gate.md>>>
---
id: i5-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i5-m8-docs-complete,i5-m8-packaged-versioned,i5-m8-config-baselined,i5-m8-handover-accepted]
---

## Rationale (not load-bearing)
Milestone M8 GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i5-m8-handover-accepted.md>>>
---
id: i5-m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
depends_on: [i5-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: tasks/i5-m8-packaged-versioned.md>>>
---
id: i5-m8-packaged-versioned
statement: Packaged and versioned.
milestone: M8
class: review
killer: false
depends_on: [i5-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment.
<<<node: test-drive-from-inside.md>>>
---
id: test-drive-from-inside
type: test
statement: The roundtrip/machinery test is extended so that after creating a bare workspace it drives that workspace FROM INSIDE via the committed launcher stub (resolving the engine at runtime) — status, next, a bless, report — and all steps succeed. State resolves under the workspace.
class: review
verify: selftest:workspace
killer: true
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
The i5 killer end-to-end demonstration. Extends test-machinery-e2e / selftest:workspace rather than adding a parallel harness; the full inside-drive is demonstrated live at M7.
<<<node: test-engine-loc-untracked.md>>>
---
id: test-engine-loc-untracked
type: test
statement: The committed stub set carries no absolute engine path, no engine binary, and no machine-local state; engine resolution lives only in the launcher's runtime order.
class: executed
verify: selftest:stubs
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
selftest:stubs checks the ignore rules and scans the committed set for leaked paths.
<<<node: test-inside-entry-surface.md>>>
---
id: test-inside-entry-surface
type: test
statement: A bare workspace produced by the stub set contains a committed `AGENTS.md` that names `.\quack` as the drive command and references `quack resolve` / `quack guides` for path-free prompt loading, with no hard path to a quackitect checkout.
class: executed
verify: selftest:stubs
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
selftest:stubs asserts the entry-surface file exists and is self-contained.
<<<node: test-inside-launcher.md>>>
---
id: test-inside-launcher
type: test
statement: The committed launcher stub resolves the global engine binary, then env `QUACK_ENGINE`, and forwards arguments; with neither present it fails with a clear message. No engine binary and no retired `.quack` lane is present in the committed tree.
class: executed
verify: selftest:stubs
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
selftest:stubs exercises the resolution order non-interactively.
<<<node: uc-drive-from-inside.md>>>
---
id: uc-drive-from-inside
type: usecase
statement: A user opens a BARE workspace (product+spec+state, no engine present) on its own and drives it from INSIDE its own folder with `.\quack …`, via an engine linked at runtime — without copying the engine in and without committing the engine's location.
class: review
killer: false
---
## Rationale (not load-bearing)
i0005. Complements uc-drive-other-workspace (drive from OUTSIDE via --base) and uc-self-workspace (the engine's own checkout). Here the workspace has no engine of its own; it reaches one through a committed, path-free stub.
