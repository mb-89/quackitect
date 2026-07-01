# M5 — Docs & ship (i0006_harness_and_readout)

Evidence for the M5 (Docs & ship) gate. Lean L5 → M5.

## Docs match the surface  → i6-m5-docs-match
A consistency pass over every user/agent-facing prose surface, reconciling it with the i6 changes:
- **README** — leads with conversational onboarding ("start a new project"); raw CLI demoted; report
  called the "live HTML board".
- **AGENTS.md** — command list now includes `progress [--pager]` and `report [--watch]`; the report
  line fixed from "HTML snapshot" to "live HTML board (recomputed fresh)".
- **.github/copilot-instructions.md** — carries the contract inline in Copilot's native channel with
  the active read→paraphrase→confirm imperative; lists `progress`.
- **contract.md** — active-imperative delivery + confirm-back (§ top); rule 3 = killer-bless explicit
  authorization + y=console-bless via the handover pager.
- **engage.md / compose-reference.md** — plan-time `bless --all` guidance corrected (gates start OPEN,
  blessed one milestone at a time via the pager); ADJUDICATE mandates the pager on killer/milestone.
- **review.md** — report prose corrected to "recomputes live, no cached snapshot".
- Swept for stale references: no lingering "72" (now 80), no stale "snapshot" (report is live), no
  `need-engine-reuse` edges (merged into `need-workspace-drive`). Removed the stray Python
  `__pycache__` (project is Go-only). `quack lint` clean.

## Packaged  → i6-m5-packaged
`quack ship` packages `product/` into `.quack/out/` (see ship output). The zip is ephemeral, not committed.

## Review & verdict
Verify: docs sweep greps clean; lint clean; selftest green. Validate: every user/agent-facing surface
reflects the actual i6 behavior (readout, contract delivery, bootstrap, live report). Red-team: the one
prior honesty gap (flaky `workspace` masking `tests-pass`) was root-caused and de-flaked in M4.
**Verdict: pending human adjudication of the M5 gate.**
