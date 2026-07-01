# M1 — Frame the problem and vision (i0005_workspace_stubs)

Evidence for the four M1 subtasks. Each section is the referent for one gate.

## Problem agreed — the delta is real  → i5-m1-problem-agreed  *(killer)*

- **Actual:** the engine drives another project only via `quack --base <path>` / `-C` from *outside* (from a quackitect or vehicle checkout). A bare workspace (product+spec+state, no engine) opened on its own has **no entry surface** — no launcher, no `AGENTS.md`, no way to reach an engine — so you cannot `.\quack …` from inside it. Hit live with `adapter_obs_pola`.
- **Delta:** let a bare workspace be driven from *inside* its own folder via an engine linked at runtime — without copying the engine in and without committing the engine's location. Real and worth solving.

## Vision and scope  → i5-m1-vision-scope-stated

- **For** someone opening a bare quackitect workspace on its own,
- **Who** wants `.\quack` to work from inside without a vendored engine,
- **The** workspace ships a committed launcher + `AGENTS.md` stub that resolve an engine at runtime,
- **That** keeps the engine location out of version control,
- **Unlike** today, where the only way to drive a project is `--base` from an external engine checkout.

**In scope:** committed root launcher (`quack.cmd`) resolving an engine at runtime; committed `AGENTS.md` stub; `.gitignore` for the local engine pointer/binary; extend the roundtrip machinery test to drive from inside.

**Out of scope:** building/installing the engine (assumed present); retrofitting existing bare workspaces like `adapter_obs_pola` (deferred); any change to the `--base` external-drive path.

## Success is measurable  → i5-m1-success-measurable

1. From inside a bare workspace, `.\quack status` runs and prints its board via the linked engine.
2. The committed tree carries **no** absolute engine path and **no** vendored engine binary — resolved at runtime (internal → gitignored pointer → env).
3. The AI opening the workspace reads an in-repo `AGENTS.md` stub and knows to drive via `.\quack`.
4. The roundtrip machinery test exercises this drive-from-inside path and stays green.

## Top risks logged — RAID  → i5-m1-top-risks-logged

- **R1 (Risk):** engine-location indirection resolves to a stale/wrong engine → drift. *Mitigation:* fixed resolution order + machinery test.
- **R2 (Risk):** the local pointer leaks into version control → breaks on another clone. *Mitigation:* `req-engine-loc-untracked` + `.gitignore`.
- **R3 (Risk):** launcher not portable across OS. *Mitigation:* plain `.cmd`, Windows-first; other-OS deferred.
- **A1 (Assumption):** an engine binary already exists reachable on the machine.
- **D1 (Dependency):** resolution order settled before the launcher is designed (→ M4).
- **D2 (Dependency):** the machinery test is extendable to drive a bare workspace from inside.

## Verdict

**Verify** — the four subtasks delivered: problem, vision/scope, measurable success, RAID. **Validate** — the frame answers the real gap (a bare workspace has no entry surface); success is observable. **Red-team** — biggest exposure is R1/R2 (resolution + keeping it out of VC); both carried forward as M2 dependencies D1/D2. **Pass** → gate blessed.
