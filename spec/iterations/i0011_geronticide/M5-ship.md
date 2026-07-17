# M5 — Ship (i0011_geronticide, lean L5)

## Docs match the surface  → i11-m5-docs-match

Every live doc surface was swept for the i11 removals; history docs stay untouched.

- [AGENTS.md](../../../AGENTS.md): `lint` without the dead flag; `bless [--by user|agent]`; new `migrate-actors` line (the migration note).
- [contract.md](../../../product/quackitect/method/prompts/contract.md): rule 3 and its design comment say `actor=user`; the `actor=agent` exception is unchanged.
- [engage.md](../../../product/quackitect/method/prompts/engage.md): channel stamps say `user`; delegated blesses pass `--by user`.
- [integrate.md](../../../product/quackitect/method/prompts/integrate.md): rewritten to the modern layout — `tools/vendor/`, `spec/project.toml`, global-binary launcher, data-home overlay; no `.quack` lane, no `engine.local`.
- [triage.md](../../../product/quackitect/method/prompts/triage.md) and [review.md](../../../product/quackitect/method/prompts/review.md): notes inbox and report output point at the workspace data home.
- [compose-reference.md](../../../product/quackitect/method/prompts/compose-reference.md): EARS doctrine says markers citing [adr-grandfathers-historical](../../decisions/adr-grandfathers-historical.md); the baseline is recorded dead.
- CLI usage: `lint` bare; `migrate-actors` listed.
- README: no stale mention (checked).
- Doc-sensitive selftests all green: contract, user-wording, ears-method, deps-prompt, method, integrate, surface, help, contract-render, render-drift, stubs.

## Packaged  → i11-m5-packaged

- Global binary current: `quack build` green, stamp ratcheted, golden re-baselined.
- Ledger migrated: 652 events say `user`, audit event in place, second pass a no-op.
- `quack ship` packaged `product/` → `<data-home>/out/quack-i0011_geronticide.zip` (ephemeral, not committed).

## Milestone review  → i11-m5-gate

**Verify:** docs match the shipped surface (killer blessed). The package builds from the same tree the suite verified. The full backward-cumulative verification is green. **Validate:** the iteration's need — a board that stops lying — holds at ship: every exemption is a recorded decision. The ledger vocabulary is one era. No retired lane survives in code or docs. **Red-team:** two live strays were found during the walk and captured as notes (verify-green parity wiring, stale-FAIL verdict wedge). Neither blocks ship; both are retro leads with recorded reproduction. **Verdict: PASS.**
