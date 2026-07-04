# M5 — Spike findings (i0010_engine_workshop)

## Riskiest assumptions validated  → i10-m5-riskiest-validated

Spike: `spikes/i10-cache-ratchet/main.go` in the data home (throwaway). Seven assertions, all PASS, run 2026-07-04.

**Unknown 1 — cache-key correctness across rebuilds.**

- Unchanged inputs + unchanged binary → HIT, zero re-runs.
- Edited test (new input hash) → MISS, re-runs.
- Rebuilt binary, same inputs → MISS, re-runs.
- Byte-identical rebuild → self-hash stable → HIT.

Verdict: the key (full input hash + binary self-hash) cannot serve a stale verdict. The byte-identical case is a bonus: a no-op rebuild keeps the cache warm.

**Unknown 2 — semantic ratchet on fresh clones.**

- The bug reproduced: a fresh clone of OLD vendored source gets checkout-time mtimes, and the mtime rule rebuilds the global binary BACKWARD.
- The fix proven: a stamp whose value is **committed content** (not filesystem metadata) survives the clone; comparing stamps refuses the backward rebuild and still ratchets forward on genuinely newer source.

**Spike finding that advances the design (the M4 contingency, resolved):**

- The engine version constant is static (`0.0.1-go`) — a *version-number* stamp would never fire. The stamp's monotonic component must be the **build time**, written by `quack build` as committed file content (RFC3339), paired with the source hash so an equal-time/equal-hash clone never rebuilds.
- adr-ratchet-stamp's wording ("recorded version") is realized as this build-time stamp; no hash-guard fold-in needed beyond the pair above.

## Design is buildable  → i10-m5-design-buildable

- Every mechanism ran in the spike with stdlib only: sha256, os file ops, RFC3339 time parse. Zero new dependencies.
- The cache sits at the one existing choke point (the selftest evaluator); the stamp rides `quack build`, which already writes generated files (golden root).
- The remaining items (notes list, calls.jsonl, why-delta, pager merge, mint fixes, wording sweep) need no spike — they are exposure of existing computations or mechanical sweeps, per the M3 feasibility card.

## Spike results recorded  → i10-m5-spike-recorded

- Output (7× PASS) captured above; the spike stays in the data home and dies with it.
- Design advanced: adr-ratchet-stamp's contingency is RESOLVED (build-time + source-hash stamp, committed content). The M4 card's kill-criterion is satisfied.

## Milestone review  → i10-m5-gate

**Round 1 — verify.** Both named unknowns have executable evidence, not argument: the failure mode was reproduced before the fix was trusted. Assertions cover hit, miss-by-edit, miss-by-rebuild, stability, backward-refusal, and forward-ratchet.

**Round 2 — validate.** The spike answered exactly the two risks M1's RAID named (cache staleness, backward ratchet) and resolved M4's one open contingency. No requirement changed; no architecture stepped back.

**Round 3 — red-team.** Weakness probed: the spike's cache is a toy map, not the real evaluator — but the claim under test was the KEY discipline, not the plumbing; the key logic is the same three comparisons. Second probe: build-time stamps are wall-clock — a machine with a wrong clock could mis-order builds; accepted risk for a single-maintainer tool, noted in the ADR realization. A hash-chain stamp (order by lineage extension, no clock) was offered at the gate; the owner kept build-time: chains only order builds within one lineage (a truthful partial order), and the total order of timestamps is worth the small clock risk here. Rejection recorded with its reason.

**Verdict: PASS** — proceed to bless. No reopened checks.
