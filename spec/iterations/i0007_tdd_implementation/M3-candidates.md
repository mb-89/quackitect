# M3 — Candidate architectures (i0007_tdd_implementation)

Evidence for the M3 gate. Alternatives per key decision, criteria weighted from the requirements, feasibility rough-checked. Chosen options are decided at M4 (ADRs); the riskiest is spiked at M5.

## Scope note — cross-harness enforcement DESCOPED at M3
The original frame carried a third decision (contract delivery) and a git pre-commit gate. Both were **cut by human direction**: (a) contract *delivery* is advisory-only and is already covered by the SessionStart hook + `copilot-instructions.md` added this session — observe empirically first (per i0006 `adr-contract-delivery`'s "escalate only if shown insufficient"); (b) a pre-commit gate blocking a suspect/incomplete ledger is hostile to work-in-progress commits. See the backlog note. `uc-reliability` is now scoped to evidence honesty (#8) only. Two design decisions remain.

## Decision criteria (weighted)  → i7-m3-criteria-weighted
Derived from the requirements. Weights 1 (minor) … 5 (vital):
- **C1 · DRY / single-source** (5) — no duplicated data in code or output (req-shared-impl-fragment).
- **C2 · Determinism / honesty** (5) — the gate must be engine-observed, not agent-asserted; evidence must not lie (req-tdd-sequence, req-evidence-honesty).
- **C3 · Minimal engine change** (3) — keep the trust surface small; prefer method/composition over new engine code.
- **C4 · Portability of handoff** (3) — role handoffs should be durable, tool-agnostic artifacts (req-role-seam).
- **C5 · Resumability** (2) — durable across interruption.

## Alternatives elaborated  → i7-m3-alternatives-elaborated  *(killer)*

### Decision 1 — RED-observation mechanism (for `tests-red`)
- **A · Run-once attestation** — the tester runs the new suite before the build; the engine records the observed-failing test-hashes; a test-hash change re-suspects it. Reuses the existing attestation+suspect machinery. High on C2 (engine-observed), C3 (small), C5.
- **B · Suite re-run** — re-run the tests on every `status`. Fatal flaw: once green, a re-run can never see the earlier red, so it cannot prove the test ever failed. Fails C2.
- **C · Required failing-marker** — the author declares a `should-fail-until-realized` marker the engine checks. Weaker on C2 (author-asserted, not observed) and adds trace surface.
→ Riskiest unknown; **spiked at M5**. Leaning A.

### Decision 2 — Role binding model
- **A · File-based Strategy seam** — roles behind a files-in/files-out interface; default binding inline; swap per type/iteration. High on C1/C4 (files are durable, tool-agnostic handoffs), C3 (no orchestration engine).
- **B · Multi-agent orchestration framework** — spawn a subagent per role with a coordinator. Berkeley MAST evidence: gains often minimal, coordination overhead, verifier rubber-stamping ~21% of failures. Fails C3, risks C2.
- **C · Inline-only (no seam)** — keep today's single-agent build, no pluggability. Fails req-role-seam (no swap for spec-kit/doc deliverables).
→ Leaning A (thin seam, inline default) — the MAST evidence actively argues against B.

## Feasibility rough-checked  → i7-m3-feasibility-checked
- **D1-A** feasible: the engine already hashes evidence and re-suspects on input change; recording failing-hashes extends that, not a new subsystem. (Confirm at M5.)
- **D2-A** feasible: roles are a method/composition concept; the engine only gates outputs (tests-red, designs-realized, tests-pass) — no engine change for the seam itself. Prior art (spec-kit/OpenSpec) is file-based and separable.
Neither surviving candidate is infeasible; the only real unknown is D1 (RED observation), which M5 spikes.
