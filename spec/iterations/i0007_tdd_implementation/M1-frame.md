# M1 — Frame the problem & vision (i0007_tdd_implementation)

Evidence for the M1 gate. Blameless framing; the delta, the vision, the success criteria, the risks.

## Vision & scope  → i7-m1-vision-scope-stated
**For** a builder driving systematic/lean work with an AI agent, **who** needs the build phase to be as rigorous and auditable as the design phase, **the** i0007 iteration **is** a test-first implementation subsystem **that** (a) extracts the build milestone into ONE shared, imported implementation checklist (lean + systematic, no duplication), (b) makes it test-first — author tests → plan → observe RED → implement GREEN — enforced by a new `tests-red` coverage rule, and (c) makes the test-designer / implementer / tester **pluggable** roles (default inline, swappable per deliverable), **unlike** today's unstructured build step that bolts tests on after the fact.

**Scope (the 8 triaged notes):** the shared fragment + TDD sequence (#1), pluggable roles (#1), doc-tests spectrum (#1), research-as-pluggable-capability (#2), the evidence-cache honesty fix (#8), verdict-links on DONE checks (#9), build/test report nesting (#6), and cross-harness obedience — contract-render + git commit gate (#3/#4/#7). **Fixes first, then TDD.**

## Problem agreed  → i7-m1-problem-agreed  *(killer)*
Implementation is quackitect's weak leg, on three concrete counts, all surfaced as **field feedback** this cycle:
1. **Build rigor is unstructured.** M6/L4 today is "plan, build, verify" — tests are authored *after* code and can pass vacuously. There is no structural test-first gate.
2. **The ledger's test evidence can lie.** `selftest:workspace` FAILs on a live re-run yet shows DONE from cached `tests-pass` evidence (note #8). A gate ledger whose evidence masks a red test is not trustworthy — and a red/green TDD gate built on that cache would inherit the lie.
3. **Thin harnesses bypass the engine entirely.** Copilot did the work itself and never called `quack`; the default-closed killers never fire because they're never invoked. Advisory instructions don't enforce.

The delta between "auditable, test-first, harness-agnostic implementation" and today's state is real, and it undermines the core value proposition (an auditable gate ledger). **Worth solving.**

## Success is measurable  → i7-m1-success-measurable
Ch1 acceptance criteria for i0007:
- Lean and systematic resolve their build milestone to **one shared implementation fragment** (fragment content appears once).
- A `tests-red` coverage rule exists; a requirement with a green test and no realized design reports **SUSPECT**.
- Roles default to **inline** (behaviour unchanged) with a demonstrated non-inline swap; resolution order iteration ▸ type ▸ default holds.
- The **evidence-mask bug is fixed**: a live-red `selftest` is reflected as not-DONE in `status`.
- The report shows a **verdict link** on every DONE check and **build/test nesting** (3 levels).
- The contract is **present in each harness's native channel**, rendered from the single `contract.md`; a bypassing commit is **rejected by a git pre-commit gate**.

## Top risks logged (RAID)  → i7-m1-top-risks-logged
- **R1 (Risk, high) — deterministic RED observation.** Tests pass after implementation, so a re-run can't see the earlier red. Mitigation: run-once attestation of failing test-hashes, re-suspect on hash change. **Spiked at M5** before building on it.
- **R2 (Risk, med) — scope.** Eight notes across TDD + reliability + report in one systematic iteration; M6 will be large. Accepted by the human at version planning (all-in-one, fixes first).
- **R3 (Assumption) — file-based role interface** suffices for prompt/subagent/tool bindings (incl. spec-kit via its constitution). Validated by prior art (spec-kit/OpenSpec are file-based & separable); revisit if a binding needs more.
- **R4 (Issue) — verdict-link regression.** `req-verdict-link` was blessed in i0004 but doesn't work in the field; its realization is reopened here.
- **D1 (Dependency)** — `tests-red` (R1) depends on the evidence-honesty fix (#8) landing first; sequenced accordingly in M6.
