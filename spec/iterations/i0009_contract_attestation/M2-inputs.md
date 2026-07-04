# M2 — Requirements (i0009_contract_attestation)

## Inputs captured → i9-m2-inputs-captured

**Context (system-in-focus + environment).** The Go engine (`product/engine-go`, one static binary) driven through `quack.cmd` by: an interactive console (a person), thick harnesses (Claude Code), thin harnesses (Copilot — known to bypass the engine entirely), and CI/pipes. State surfaces today: the repo (`spec/`, `product/`, `.quack/`), the per-workspace user data home (`%LOCALAPPDATA%\quackitect\...`, logs since i8), and generated entry files (AGENTS.md; copilot-instructions.md missing today). IN: contract.md (single rule source), notes, blesses, engine source. OUT: refusals/keys (attest), rendered entry files, report, ship zip.

**Source notes (all archived with TRIAGE-CLOSE stamps 2026-07-04):** `block-the-ledger-until-the-contr` (attestation design, settled with the owner), `thin-harness-contract-delivery` + `origin-field-i6-field-feedback-b` (ready-when fired), `raw-notes-out-of-repo`, `decision-model-v2`, `eliminate-quack-folder` (incl. the owner's informal ratchet call), `deterministic-minting`, `logs-dir-fragments-by-path-casin`; plus live directives from the owner this session (fold data-leg into i9; ratchet rule; report suspect-why while adjudicating M1).

**Use cases (this iteration):** uc-attested-session, uc-contract-delivery, uc-stable-data-dir, uc-repo-holds-only-truth, uc-global-engine, uc-notes-private, uc-decisions-never-relitigated, uc-deterministic-minting; plus refined global surfaces uc-review-report (req-report-why) and uc-backward-vv (req-vv-time-scope) and the filter-UX family (req-filter-clear/descendants/dblclick/help) — owner directives at the M1–M3 stops — all folded under existing needs (need-qualities, need-engage, need-note, need-workspace-drive), no new needs minted.

## Stakeholder coverage → i9-m2-stakeholder-coverage

| Role | Interest | Covered by |
|---|---|---|
| Owner / adjudicator | never gated by their own machinery; one grant per session max; auditable actor stamps | req-console-exempt, req-attest-grant, i8 actor channels |
| Driving agent (thick harness) | unattended runs never stall; deterministic unlock path; mintable nodes | req-attest-renewal, req-attest-block, req-mint, req-note-lane |
| Thin-harness agent (Copilot) | contract present in natively-loaded file without pointer-following | req-contract-render, req-render-drift |
| Vehicle users (ship-a-zip clients) | working launcher without pre-installed global binary | req-global-binary, req-engine-ratchet |
| Future readers/auditors | decisions never re-litigated, classified from graph facts; suspects explain themselves; old verdicts never reopened by mere addition | req-decisions-folder, req-decision-classes, req-parked-list, req-decision-realized-lint, req-report-why, req-vv-time-scope |
| The repo itself (publishability) | only truth committed; private material out | req-no-quack-state, req-truth-in-spec, req-notes-out, req-clean-status, req-root-marker, req-global-config |

No role without a requirement; no requirement without a role. The engine-bypassing harness (never runs quack) is a recorded ceiling (M1 RAID), not a covered role — detection stays with pre-commit/status backstops.

## Requirements verifiable → i9-m2-requirements-verifiable
Derived: coverage:req-has-test — every i9 requirement carries a test node (26 tests for 30 requirements; test-filter-ux verifies four; test-note-lane is grounded-review by design, the rest selftest-executed). Computed live by the engine.

## Requirements traced → i9-m2-requirements-traced
Derived: coverage:req-traced — every i9 requirement refines a use case, every use case refines an existing need. Computed live by the engine.

## Review rounds & verdict

**Round 1 — Verify.** All referents real: the eight source notes exist in the archive with TRIAGE-CLOSE stamps; all i9 use-case and requirement nodes (9 + 30) load under the strict parser; both derived checks (req-has-test, req-traced) compute green live; EARS lint clean with zero exemptions.

**Round 2 — Validate.** The requirement set covers every M1 success criterion (attest 1–2 → req-attest-*; render 3 → req-contract-render/render-drift; clean-status 4 → req-clean-status; amnesia 5 → req-no-quack-state/truth-in-spec; mint 6 → req-mint; one-home 7 → req-logs-canonical) and every stakeholder row. req-report-why and req-vv-time-scope folded per the owner's live directives at the M1 and M2 stops (suspects must explain themselves; V&V looks backward only). Migrations are deliberately build steps, not requirements. No duplicated claims found (logs-canonical = slug computation; no-quack-state = artifact location — distinct).

**Round 3 — Red-team.** Strongest case: "some requirements smuggle design" — req-engine-ratchet and req-decision-classes are the closest calls. Held: ratchet is the owner's recorded decision with the mechanism (launcher vs engine self-check) left open for M3/M4; the decision-model schema was settled with the owner 2026-07-03, and its remaining axes are named M3 work. Kill-criterion forward: if M3 shows the scrap-sink model can't coexist with the strict parser's allowlist, req-decision-classes reopens. Second case: "25 reqs = too big" — acknowledged as R8, carried, mitigated at M6 slicing.

**Verdict: PASS.** Proceed to M3 (candidates).
