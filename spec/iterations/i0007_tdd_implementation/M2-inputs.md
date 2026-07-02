# M2 — Requirements (i0007_tdd_implementation)

Evidence for the M2 gate. The requirements are the 9 composed `req-*` nodes; this records their inputs, coverage, and structural verification.

## Inputs captured  → i7-m2-inputs-captured
Sources folded into the requirements:
- **The 8 triaged notes** (the iteration's scope) — TDD+roles, research-pluggable, evidence-cache bug, verdict-link, nesting, contract-skip, Copilot-bypass, thin-harness delivery.
- **The systematic rigor template** (`method/rigor/systematic/checklist.md`) — the M1–M8 floor.
- **The current build content** — systematic M6 and lean L4 (what the shared fragment replaces).
- **The evidence + selftest machinery** (`selftest:workspace`, the `.quack/evidence` cache) — subject of the #8 honesty fix.
- **The report renderer** — subject of #9 (verdict link) and #6 (nesting).
- **The native contract channels** — `AGENTS.md`, `.github/copilot-instructions.md`, and the source `contract.md` — subject of #3/#4/#7.
- **Prior art** (5-search verified sweep): AgentCoder role split, Beck/Uncle-Bob TDD red gate, FIT/doctest/Vale doc-tests, Berkeley MAST failure taxonomy.

## Stakeholder coverage  → i7-m2-stakeholder-coverage
- **Builder** — drives the loop; needs a structured, test-first build. (need-implementation)
- **Maintainer** — renders the per-harness entry files at build. (req-contract-render)
- **Reader/auditor** — reads the report; needs verdicts + honest hierarchy. (need-review)
- **Thin-harness agent (Copilot)** — must be bound and unable to bypass. (uc-reliability)
No role left out.

## Requirements verifiable  → i7-m2-requirements-verifiable  *(derived: coverage:req-has-test)*
Every requirement has a test node (9/9): each `req-*` is paired with a `test-*` that `verifies:` it. `quack lint` reports no `req-has-test` hole.

## Requirements traced  → i7-m2-requirements-traced  *(derived: coverage:req-traced)*
Every requirement traces to a need via a use-case: implementation reqs → `uc-test-first-build`/`uc-pluggable-roles` → `need-implementation`; reliability reqs → `uc-reliability` → `need-qualities`; `req-research-pluggable` → `uc-engage-start` → `need-engage`; `req-build-test-nesting` → `uc-review-report` → `need-review`. `quack lint` reports no `req-traced` hole.
