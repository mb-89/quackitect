# M2 — Requirements inputs (i0003_engine_vehicle_go)

Evidence for the M2 review subtasks. The requirements themselves are the typed `req-*` trace nodes; the two derived subtasks (traced, verifiable) are computed from the trace.

## Context  → i3-m2-inputs-captured

System-in-focus: **the quackitect engine** (the single binary, post-port).

- **Inputs (IN):** `spec/` (the typed trace + the gate/subtask ledger), `.quack/config.toml`, `.quack/attest.json`, `.quack/evidence/`, the vehicle's overlay resources (guides, prompts, templates), CLI arguments.
- **Outputs (OUT):** the status board (stdout), `report.html`, the `ship` zip, appended attest events, the `gather` bundle.
- **Environment:** the host **vehicle** (one or more overlay layers above the engine), the **human adjudicator**, the **AI filler**, the filesystem (unzipped folder, no network), `winget` (install path for missing build tools), `git` (optional, only the report stamp).

## Stakeholders by role  → i3-m2-stakeholder-coverage

- **Vehicle author** — builds a host project that vendors the engine; wants to overlay, not fork; wants a dependency-free run.
- **Vehicle end user** — runs the vehicle on a fresh or locked-down machine; never sees "quackitect"; wants zero install friction.
- **Human adjudicator** — blesses gates; wants trustworthy state and a clear report.
- **AI filler (the agent)** — fills checks and writes code; wants deterministic tooling and unambiguous prompts.
- **Engine maintainer** — keeps quackitect (the open-source engine); wants a stable extension surface and parity guarantees.
- **OS / security tooling** (Windows SmartScreen, antivirus) — a constraint-bearing actor: no web-downloaded executables.
- **Determinism / CI** — consumes the report integrity root; wants byte-identical output for the same spec.

No role from M1's vision is left out: the distribution pain maps to the end user + OS tooling; the reuse goal maps to the vehicle author + maintainer; the gate trust maps to the adjudicator + determinism.

## Requirements (the trace)  → i3-m2-requirements-traced / i3-m2-requirements-verifiable *(derived)*

Nine typed requirements, each refining a use-case (so each traces up to `need-engine-reuse`) and each verified by a `test-*` node:

| requirement | use-case | test |
|---|---|---|
| req-go-engine *(killer)* | uc-run-dep-free | test-binary-deps |
| req-behavior-parity *(killer)* | uc-run-dep-free | test-parity-golden |
| req-zero-dep-parse | uc-run-dep-free | test-parity-golden |
| req-cli-help | uc-run-dep-free | test-cli-help |
| req-engine-vehicle-split *(killer)* | uc-vendor-engine | test-split-readonly |
| req-overlay-resolver *(killer)* | uc-vendor-engine | test-split-readonly |
| req-dep-prompt | uc-vendor-engine | test-dep-prompt |
| req-unique-ids *(killer)* | uc-vendor-engine | test-unique-ids |
| req-trace-filter | uc-review-report | test-trace-filter |
| req-responsiveness *(NFR)* | uc-run-dep-free + uc-review-report | test-responsiveness |
| req-integrate *(killer)* | uc-vendor-engine | test-integrate |

The two derived subtasks evaluate this table live: **traced** (every requirement refines a use-case that refines a need) and **verifiable** (every requirement has a test). Both pass.
