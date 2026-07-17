# M4 — Build & verification (i0011_geronticide, lean L4)

## Tests observed red  → i11-m4-tests-red

All nine i11 tests were authored as spec nodes and observed FAILING (`quack observe-red`) at their hashes before any build step. Birth evidence lives in the ledger.

## Parity standalone  → i11-bs-parity

- `suite: never-cached` marker on test nodes; `tests-pass` skips standalone members.
- [test-parity-golden](test-parity-golden.md) rides the standalone suite: a moved golden root reddens exactly one row.
- Realized in [i11_red.go](../../../product/engine-go/i11_red.go) (design `go-standalone-suite`).

## Pager scope  → i11-bs-pager-scope

- A killer-subtask pager reports its OWN readiness: upstreams plus evidence, never the milestone.
- Gate pagers keep the milestone scope; merged hand-offs resolve to the gate first.
- Realized in [readout.go](../../../product/engine-go/readout.go) (design `go-pager-scope`).

## Suspect root  → i11-bs-suspect-root

- A propagated suspect is marked and names its root (`SuspectRoots`); a direct suspect stays direct.
- Surfaces: status board, `quack why`, the pager risk lines.
- Realized in [readout.go](../../../product/engine-go/readout.go) (design `go-suspect-root`).

## Evidence hashed  → i11-bs-evidence-hash

- A milestone gate folds its evidence doc set (`M<n>-*.md`) into its full hash ([adr-evidence-hash](../../decisions/adr-evidence-hash.md)).
- Editing blessed evidence flips the gate SUSPECT; whitespace churn moves nothing (normWS); subtasks never fold docs.
- Docless history stays stable (no seed component without docs).
- Realized in [engine.go](../../../product/engine-go/engine.go) (design `go-evidence-hash`); the upgrade wave was re-blessed knowingly at M1–M3.

## Cache cap  → i11-bs-cache-cap

- Every verdict write keeps the newest 8 `evidence/<id>/*.json` files and deletes the rest, oldest first.
- Realized in [coverage.go](../../../product/engine-go/coverage.go) (design `go-evidence-cache-cap`).

## Stamp user  → i11-bs-stamp-user

- New records write `actor=user`; a delegated `--by human` normalizes to `user` at write.
- `quack migrate-actors` rewrote 652 historical events `human -> user` in ONE audited pass (count + timestamp recorded in the ledger); the second run is a no-op.
- Readers fold `human` into `user` forever (`normActor`); the self-cert metric counts agent versus non-agent, spanning both eras ([adr-actor-user-migration](../../decisions/adr-actor-user-migration.md)).
- Fixture-proven (`selftest:stamp-user`) BEFORE the real ledger was touched. Bless hashes and the prev_hash chain stayed intact (`selftest:kernel-attest` green).

## tests-red marker  → i11-bs-testsred-marker

- The `testsRedSince` date constant is dead; the engine source carries no era constant.
- All 37 pre-mechanism tests (33 in i0001–i0007, 4 baseline nodes in `spec/decisions/`) carry `tests_red: exempt - … (adr-grandfathers-historical)` markers; a bare `exempt` without a reason is not honored.
- Realized in [coverage.go](../../../product/engine-go/coverage.go) (design `go-testsred-marker`), parser key `tests_red` allowlisted.

## Legacy lanes retired  → i11-bs-legacy-lanes

- Resolver: data-home overlay → `tools/vendor` → dogfood `product/` only; the `.quack/overlay` and `.quack/vendor` lanes are gone.
- Stub launcher: global binary → `QUACK_ENGINE`; no `engine.local`, no internal `.quack\engine` branch.
- The `.gitignore` stub died with the lanes (nothing machine-local is emitted).
- The i5 requirements were restated in place, EARS-shaped ([adr-retire-legacy-lanes](../../decisions/adr-retire-legacy-lanes.md)); design `go-legacy-lanes-retired` probes a fake legacy-only engine root.

## Grandfather ADRs  → i11-bs-grandfather-adrs

- The anonymous EARS baseline file is deleted; lint checks EVERY requirement statement.
- 63 historical non-EARS statements carry `ears: exempt - … (adr-grandfathers-historical)` markers; every marker must cite a resolvable ADR or `selftest:grandfathers-decided` fails.
- Pre-i4 requirements without a realized design region must be ADR-addressed (none exist today; the invariant is live).

## Build parent  → i11-m4-build

All nine planned steps above are realized and individually blessed.

## Internal quality  → i11-m4-internal-quality

- Zero-dep: all new imports are stdlib (`strconv`, `regexp`, `fmt`, `time`).
- Selftest seams: every new behavior carries a dependency-free hook (`evidenceBaseOverride`, pure `migrateActorsFrom`/`metricsFrom`, `testsRedExempt`, fake-ENGINE probe).
- Voice: single-thought CLI sentences; every exemption marker cites its ADR; restated statements are EARS-shaped.

## Designs realized  → i11-m4-designs-realized

Derived (`coverage:designs-realized`), computes live: every i11 requirement carries a realized design region.

## Tests pass  → i11-m4-tests-pass

Derived (`coverage:tests-pass`), computes live: the backward-cumulative suite through i0011 is green.

## Milestone review  → i11-m4-gate

**Verify:** all nine build steps realized with passing selftests. The full selftest suite green at build. Both derived checks compute live. **Validate:** every M1 problem line is answered by a shipped behavior:

- the tamper tripwire is standalone
- propagated suspects name their root
- pagers scope to the check
- evidence is hashed-or-suspect
- verdict files are bounded
- the ledger says user
- no grandfather survives without its recorded decision

**Red-team:** the migration was the riskiest step. It ran fixture-first. The audit event records count and time. Hashes stayed untouched (attest chain verified). The pass is idempotent. The evidence-hash wave was the designed churn: re-blessed deliberately at M1–M3, never silently restamped. **Verdict: PASS.**
