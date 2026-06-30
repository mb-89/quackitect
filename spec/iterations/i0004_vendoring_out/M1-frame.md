# M1 — Frame the problem and vision (i0004_vendoring_out)

Evidence for the four M1 subtasks. Each section is the referent for one gate.

## Problem agreed — the delta is real and worth solving  → i4-m1-problem-agreed  *(killer)*

- **Goal:** one engine drives many projects. quack and vehicles are themselves projects (they have `product/` + `spec/`), but they must also drive *other* projects.
- **Actual:** the engine is bound to its own ROOT (`findRoot` walks up to the local `.quack/`; product/spec/state all hang off that one root). The only way to drive another project today is to vendor a whole engine into it (the i3/this-session model). State and engine are entangled under one root.
- **Delta:** separate the **workspace** (a project's product + spec + *all* its state) from the **engine** (binary + vendored resources), so one engine points at its own workspace or another project's — the way `git` operates on the repo at cwd, or sebot tools take a `base`. Real and worth solving: it is the difference between "vendor an engine per project" and "one engine, many workspaces."

## Vision and scope  → i4-m1-vision-scope-stated

Moore frame:
- **For** builders who drive multiple projects with one engineering-gate engine,
- **Who** need the engine decoupled from any single project's data,
- **The** quackitect engine **operates on a selectable workspace**,
- **That** holds the driven project's product + spec + state, defaulting to the local one or pointed at another,
- **Unlike** today, where the engine is welded to its own ROOT and driving another project means vendoring a second engine.

**In scope:**
1. **Workspace separation** (the headline) — engine drives a selectable workspace; all project state lives under it. `adr-workspace-base`.
2. **Grandfathered vendoring-out** (shipped this session) — vendor model under `.quack/vendor/`, `quack start init`, argv[0] white-label, `.claude` command vendoring.
3. **`quack build`** — compile + re-baseline golden in one step (kills the stale-golden footgun).
4. **Engine hardening from the i3 retro** — tests-pass/gateState unification, the no-trace-gate invariant.
5. **Report** — DONE→verdict/evidence link; build/test nesting (3rd level).

**Out of scope:** a multi-workspace registry/switcher UI; remote workspaces; signed-release binary (carried from i3).

## Success is measurable — the acceptance contract  → i4-m1-success-measurable

The **killer end-to-end** (the user's bar): *a vehicle (from `start init`) creates a dummy workspace, and the engine drives that workspace through a **full systematic iteration with empty content** — a "machinery test", every milestone argued as exercising the machinery — and **all milestones go green**, with state resolving under the workspace.* → `test-machinery-e2e` (`i4-m7-killer-ucs-demonstrated`).

Every requirement maps to a test (`req-has-test`): `selftest:workspace`, `:split`, `:integrate`, `:brand`, `:claude-vendor`, `:build`, `:tests-pass-eval`, `:no-trace-gate`, `:report-verdict`, `:report-nesting`.

## Top risks logged — RAID  → i4-m1-top-risks-logged

- **R1 (Risk, high):** workspace-split touches `findRoot` + the state paths (`QUACK`/`ATTEST`/`NOTES`/evidence/gather/out). Scattered edits could regress dogfood. *Mitigation:* centralize state-path resolution behind a workspace root; `selftest` + `status` guard regression (`i4-m6-impl-risks-acceptable`).
- **R2 (Risk, high):** the machinery test must pass on **empty** content at max rigor — coverage rules must be vacuously green on an empty trace and review gates blessable with a machinery-test rationale. *Mitigation:* validate in the M5 spike before committing the design.
- **R3 (Issue, medium):** the stale-golden footgun produced false milestone FAILs ~repeatedly this session. *Mitigation:* `req-quack-build` makes build→re-baseline atomic.
- **R4 (Risk, medium):** scope is broad (workspace + 5 folded retro items). *Mitigation:* M6 plan-build seeds small resumable steps; milestone-monotonic gating.
- **R5 (Assumption, low):** the sebot `base` model transfers cleanly. *Mitigation:* M3 elaborates ≥2 alternatives; M5 spikes the riskiest.
