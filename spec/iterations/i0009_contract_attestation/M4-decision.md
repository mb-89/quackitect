# M4 — Decide the architecture (i0009_contract_attestation)

## Chosen architecture → i9-m4-architecture-stated

In short: **the engine gates the ledger behind a console-granted and self-renewing key ritual. The contract ships pre-rendered into every entry file. The repo keeps only truth — everything else lives in one data home per workspace, served by one forward-ratcheting global binary. Decisions are immutable graph-classified nodes. Every node is engine-minted.**

Per axis — chosen / why / runner-up:

| Axis | Chosen | Why (top criterion) | Runner-up, why not |
|---|---|---|---|
| Grant | Console-minted one-time code | Structural proof a person acted (C1) | Chat-relayed flag — no proof, today's failure |
| Challenge | Word N of rule K, nonce-seeded | Forces contract text into context (C1) | File hash — computable without reading |
| Key transport | `--key` flag per ledger command | In-conversation by construction (C4) | Env var — kept as optional second path |
| Entry files | Engine-rendered from contract.md + drift lint | Works in pointer-blind harnesses (C3) | Git-hook render — hooks don't fire everywhere |
| Data layout | Workspace-first home, kind subfolders | One-delete amnesia test (C6) | Kind-first — scatters the workspace |
| Root marker | spec/project.toml walk-up | Committed truth, present everywhere (C3) | .git walk-up — zip vehicles have no git |
| Ratchet | Engine self-check + rename dance | Launcher stays dumb, one code path (C5) | Launcher version logic — batch parsing, brittle |
| Decisions | Model v2, spec/decisions/, derived classes | No duplicate state machine (C4) | 4-state lifecycle — rejected 2026-07-03 |
| Minting | `quack mint` typed ops + engine note lane | Validity at birth (C4) | Graduation-only — no path for tests/reqs |

ADRs: [adr-attest-ritual](../../decisions/adr-attest-ritual.md) · [adr-entry-render](../../decisions/adr-entry-render.md) · [adr-no-quack-data-home](../../decisions/adr-no-quack-data-home.md) · [adr-global-ratchet](../../decisions/adr-global-ratchet.md) · [adr-decision-model-v2](../../decisions/adr-decision-model-v2.md) · [adr-deterministic-mint](../../decisions/adr-deterministic-mint.md) — the first six citizens of `spec/decisions/` (dogfood from birth).

## Choice traced to the criteria → i9-m4-choice-traced

Pugh, datum = "do nothing" (advisory floor + .quack as-is). Score −1/0/+1 per criterion, weighted:

- C1=5
- C2=4
- C3=4
- C4=4
- C5=3
- C6=3
- C7=3

| Candidate set | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Weighted |
|---|---|---|---|---|---|---|---|---|
| **Chosen set (above)** | +1 | +1 | +1 | +1 | 0 | +1 | 0 | **+20** |
| Chat-grant + hash challenge + env key | −1 | +1 | +1 | 0 | +1 | 0 | +1 | +9 |
| Keep .quack, kind-first, launcher ratchet | 0 | +1 | 0 | 0 | −1 | −1 | +1 | +1 |
| Do nothing (datum) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Sensitivity.** The chosen set wins under any single weight change of ±2: its lead rests on C1 (which only it scores) and on breadth, not on one criterion. Doubling C7 (friction) to 6 still leaves it ahead (+20 vs +12). The one genuine sensitivity is feasibility rather than weighting: the pre-agreed fallbacks (shorter code format; build-next-launch) keep the set intact if the M5 spikes falsify the code round-trip or the rename dance — no candidate flip.

**Datum re-run (gate discussion 2026-07-04, red-team criticism upheld).** Same weights; datum = the strongest rival (soft-ritual set) — the comparison the first run hid:

| Candidate set vs soft-ritual datum | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Weighted |
|---|---|---|---|---|---|---|---|---|
| **Chosen set** | +1 | 0 | 0 | +1 | −1 | +1 | −1 | **+6** |
| Keep .quack, kind-first, launcher ratchet | +1 | 0 | −1 | 0 | −2* | −1 | 0 | −10 |
| Soft-ritual set (datum) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

*scored −2 as worse-than-either on simplicity: launcher version logic duplicated per platform. The choice survives the honest datum: the chosen set trades simplicity and friction for structural proof, determinism and the amnesia test — exactly the priorities the M1 frame set. Method fix (datum = strongest rival, status quo only for worth-doing-at-all) noted for triage into the M4 checklist method line.

## ADRs recorded → i9-m4-adr-recorded
Derived: coverage:adr-traced — all six ADRs address requirements. Computed live.

## Review rounds & verdict

**Round 1 — Verify.**

- Six ADR nodes load under the strict parser from `spec/decisions/`.
- adr-traced computes green (every ADR addresses named requirements).
- Every M3 axis appears in the decision table with its runner-up and reason.
- The Pugh matrix uses the M3 weights unchanged.

**Round 2 — Validate.** The chosen set realizes both halves of the vision (undodgeable contract; truth-only repo). Every owner call is traceable to its recording:

- ratchet (2026-07-04)
- no-.quack (2026-07-04)
- decision model (2026-07-03)

Nothing decided here contradicts a blessed decision elsewhere. The one superseded decision (.quack as plumbing, 2026-06-30) is named inside adr-no-quack-data-home rather than silently overwritten.

**Round 3 — Red-team.** (i) "The Pugh datum is a straw man — 'do nothing' can't win." Fair. The matrix's real work is ranking the second row (the plausible soft-ritual set). That row loses exactly where it should: no structural proof (C1). (ii) "Six ADRs at once dilutes adjudication." Countered by the gate ceremony: each killer stamp is listed at the hand-off, and any single ADR can be reopened by name without touching the others. (iii) "Dogfooding spec/decisions/ before the lint exists risks orphaned convention" — accepted deliberately. The M6 lint lands on files already in place. A failure there is loud rather than silent.

**Verdict: PASS.** Architecture decided and traced. M5 proves the two riskiest unknowns. Gate discussion 2026-07-04 recorded three rulings:

- Datum criticism upheld — dual-datum run recorded above and the method fix noted for triage.
- adr-entry-render demoted to non-killer by the owner (cheap reversal).
- The since-marker residual consciously accepted by the owner (fix if it happens).
