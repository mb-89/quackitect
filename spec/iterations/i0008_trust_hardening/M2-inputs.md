# M2 — Requirements (i0008_trust_hardening)

Evidence for the M2 gate. Context, stakeholders, use cases, and the EARS requirement set.

## Inputs captured  → i8-m2-inputs-captured
**Context diagram (system-in-focus + environment).** In focus: the quack engine's trust path — `parse.go` (node files → nodes) → `engine.go` (graph, norm/h12/fold hashing, suspect cone) → gates/coverage (`coverage.go`) → attest chain (`ops.go`) → readout/report. Environment: **IN** — node frontmatter under `spec/`, `design:` regions under `product/`, CLI invocations (console or harness channel), blesses, `config.toml`, the OS user profile; **OUT** — exit codes (now load-bearing: nonzero on refusal), attest events with actor stamps, status/report/pager, session logs (moving to the user-scoped dir), lint findings (now including EARS and monotonicity).

**Sources.** The red-teamed scope directive plus its six review notes (strict parser, actor channels, hash normalization, kernel tests, logs-out, EARS) — all archived-as-baked with this iteration; the two backlog notes pulled at the M1 gate (CLI-help incident of 2026-06-30, i0002 milestone-jump incident); the cli-help guide (`project_types/default/guides/cli-help.md`) as the pre-existing convention `req-cli-help` realizes.

**Use cases.** Eight, composed: `uc-fail-loud-parsing` (+CLI refusal), `uc-honest-adjudication`, `uc-stable-design-hashes`, `uc-kernel-selftested`, `uc-workspace-hygiene`, `uc-ears-requirements`, `uc-monotonic-walk` — each hung under an existing need (`need-qualities`, `need-workspace-drive`, `need-engage`); no new needs minted.

**Quality tree (ISO 25010).** Reliability/integrity: strict parse, ref integrity, kernel selftest, attest chain. Functional correctness of the record: actor channels, hash normalization. Maintainability: EARS statements, monotonic lint. Portability/privacy: logs-out (Windows + XDG). Usability/safety: CLI help without side effects.

## Stakeholder coverage  → i8-m2-stakeholder-coverage
No role left out:
- **Adjudicating human (markus)** — gates and stamps must mean what they say: `req-actor-channels`, `req-design-hash-norm` (no rubber-stamp training), `req-ears-lint` (blessable statements).
- **Driving agent** — needs loud refusal over silent acceptance (`req-strict-frontmatter`, `req-ref-integrity`), a `next` that cannot jump milestones (`req-monotonic-lint`), and safe help flags (`req-cli-help`).
- **Auditor / record reader** — a verifiable chain and honest self-cert metric: `req-kernel-selftest` (attest battery), `req-actor-channels`.
- **Other-machine / field user** — the kernel proves itself locally with no toolchain: `req-kernel-selftest`, and logs land in a predictable per-user place: `req-logs-out-of-repo`.
- **Foreign-data owners (trader/sebot)** — their session/memory files leave the published repo: `req-logs-out-of-repo`.
- **Future composer (next `engage start`)** — authoring instruction present at compose time: `req-ears-method`; wiring mistakes caught: `req-monotonic-lint`.
- **Maintainer** — refactors guarded by golden vectors; gofmt without ledger churn: `req-kernel-selftest`, `req-design-hash-norm`.

## Requirements verifiable  → i8-m2-requirements-verifiable  *(derived: coverage:req-has-test)*
Computed live by the engine: all requirements carry a test node (`selftest:parser-strict`, `ref-integrity`, `actor-channels`, `design-hash-norm`, `kernel-vectors`/`cone`/`gatewalk`/`attest`, `logs-dir`, `ears-lint`, `ears-method`, `monotonic-lint`). *[correction, M5: originally ten including `req-cli-help`/`test-cli-help` — those ids already existed in i0003 (realized, green); the i8 duplicates were removed, leaving nine i8 requirements. See M5-spike-findings.md.]*

## Requirements traced  → i8-m2-requirements-traced  *(derived: coverage:req-traced)*
Computed live by the engine: every requirement refines a use case, every use case refines an existing need (`need-qualities`, `need-workspace-drive`, `need-engage`).

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** The ten requirements each restate exactly one triaged source note (or one pulled backlog note) — checked pairwise against the directive; none drifted in meaning. All are EARS-shaped with `shall` (dogfooding `req-ears-lint` before it exists). The two derived checks compute green from the trace itself — no hand-stamp involved. The i7 key additions the strict parser must allowlist (`roles`, `milestone`, `validates`, `parent`, `ears`, coverage verbs) are named inside `req-strict-frontmatter` so R1 (day-one brick) is owned by a requirement, not a hope.

**Round 2 — Validate.** Against the M1 frame: each of the eight scope items maps to at least one requirement and each requirement maps back to exactly one scope item — no orphan requirements, no uncovered scope. The deferred/rejected items (evidence-into-merkle, notes-graduation, unforgeable bless, decision model) have deliberately **no** requirement here. Stakeholder walk covers the roles the directive named, including the foreign-data owners the log migration protects.

**Round 3 — Red-team.** Weakest statements probed: (a) `req-ref-integrity`'s "both directions" is the least pinned phrase in the set — the precise semantics (dangling target vs. asymmetric backlink) is a named M3/M4 design decision, and the requirement is verifiable under either reading; acceptable at requirement level. (b) `req-ears-lint`'s "new or SUSPECT for a real upstream reason" carries R3 (mechanical discrimination) — flagged as the load-bearing M3 alternative, kill-criterion already recorded at M1. (c) `req-actor-channels`' "interactive console" depends on TTY detection quirks — R2, spiked at M5. No requirement found untestable or double-counted.

**Verdict: PASS.** Ten verifiable, traced, EARS-shaped requirements covering the amended scope exactly. Proceed to the human bless of `i8-m2-gate`.
