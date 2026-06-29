# M5 — spike findings (append-only attest risk)

Spike: `.quack/spikes/m5/spike.py` (throwaway; reads the live `attest.json` read-only).

## Result — risk retired
- **[a] Killer invariant holds.** `current_state(migrate(attest)) == attest` for all 32 attested
  checks, byte-identical. Current attestation = the **latest bless event per check**, so
  `status` / `why` / `bless` / suspect read exactly as today. **v0 is safe.**
- **[b] History unlocks the metrics.** A simulated DONE → (inputs change) → re-bless cycle makes
  reversal (hash changed between blesses), rework (check re-blessed), and self-cert (actor=agent)
  all derivable from the log; current state stays correct (latest bless wins).
- **[c] Version-aware `next`** is a sort+filter over the iteration folders (latest not-done →
  earliest planned) — low risk, no spike needed.

## Migration
Each current attestation becomes one `bless` event (`actor: migrated`, deterministic `ts`).
One-time, lossless, reversible-on-read.

## Carries to M6 (build-metrics)
1. The engine must derive current-state from the log via **exactly** the "latest bless per check"
   rule, then re-run the `status` diff to confirm byte-identity on the real ledger.
2. Migration `ts` must be deterministic (HEAD commit time or 0) — determinism check covers it.
3. Decide: log explicit `reopen` events vs. infer reversals from hash changes (explicit = cleaner
   reversal-rate; inferred = fewer event types). Minor.

## Edge checked
Blessed → statement edited (SUSPECT) → never re-blessed: log has one bless with the old hash;
status compares to the new full_hash → SUSPECT. Same as today. ✓
