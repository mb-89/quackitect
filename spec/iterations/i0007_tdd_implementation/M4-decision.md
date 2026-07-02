# M4 — Decide the architecture (i0007_tdd_implementation)

Evidence for the M4 gate. The chosen options (from M3's candidates), traced to the weighted criteria, recorded as ADRs.

## Chosen architecture  → i7-m4-architecture-stated
1. **Shared implementation fragment** — one `method/rigor/_shared/implementation.md`, imported by lean (one review gate) and systematic (full sub-gate density). Replaces today's L4/M6 build content.
2. **`tests-red` coverage rule** (new, the only engine change) — RED observed by **run-once attestation** (Decision 1-A): the tester runs the new suite pre-build, the engine records the observed-failing test-hashes, a hash change re-suspects. A green test with no realized design = SUSPECT.
3. **File-based role Strategy seam** (Decision 2-A) — testdesigner / implementer / tester behind a files-in/files-out interface; default binding **inline** (behaviour unchanged); resolved at seed iteration ▸ type ▸ default.
4. **Doc-tests** — mechanizable acceptance criteria → `class:executed`, residue → `class:review`.
5. **Fixes it rests on** — evidence-cache honesty (#8, unblocks trustworthy RED), verdict-link on DONE checks (#9, realizing i0004's `req-verdict-link`), build/test report nesting (#6).
6. **Research** — referenced pluggable capability, never vendored (#2).

## Choice traced to criteria  → i7-m4-choice-traced
- Shared fragment ← **C1** (DRY, single source).
- `tests-red` run-once attestation ← **C2** (engine-observed honesty; beats re-run which fails C2) and **C3** (extends existing machinery).
- File-based seam ← **C1/C3/C4** (durable tool-agnostic handoff, no orchestration engine; MAST evidence rules out the multi-agent framework on C3).
- Evidence honesty ← **C2** (the ledger must not show green when red — and `tests-red` depends on it, so it lands first in M6).

## ADRs recorded & traced  → i7-m4-adr-recorded  *(derived: coverage:adr-traced)*
- `adr-tests-red-mechanism` addresses `req-tdd-sequence` (run-once attestation over re-run; full context + M5 spike).
- `adr-role-binding-model` addresses `req-role-seam` (file-based Strategy, inline default; over a multi-agent framework).
Both ADRs address a requirement → `coverage:adr-traced` satisfied.
