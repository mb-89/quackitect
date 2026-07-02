# M5 — Prove the riskiest unknowns (i0007_tdd_implementation)

Evidence for the M5 gate. The one genuine unknown (R1: deterministic RED observation) was spiked and retired.

## Riskiest validated  → i7-m5-riskiest-validated  *(killer)*
**Risk R1:** can the engine durably record "test observed FAILING" **without a later re-run** (which can't see a past red once green), and **re-suspect** when the test changes?

**Validated** — by inspection of the real engine + a runnable tracer (`.quack/spikes/tests-red/spike.sh`):
- The `Event` log (`attest.json`) already discriminates by an `action` field (only `"bless"` today). A `"red-observed"` event `{check:<test>, action:"red-observed", hash:<test fullHash>}` is the durable record — exactly analogous to a bless.
- `gateState` already returns DONE on attested-hash == current-hash and **SUSPECT** on mismatch. `tests-red` reuses that for the "re-suspect on change" behaviour **for free**.
- Tracer output (verbatim): red-observed@H1 → **SATISFIED**; test edited H1→H2, no re-run → **SUSPECT**; re-observe@H2 → **SATISFIED**.

**Conclusion:** `tests-red` is `tests-pass`'s dual — a small reuse, not a new subsystem. Insertion points: (a) `Event` — no change; (b) `attestLoad` — add a `red-observed` loader; (c) `coverage.go` — add `case "tests-red"` (mirrors `case "tests-pass"`); (d) a writer op (`quack observe-red <test>`, run by the tester pre-build, or folded into the build-planned step).

## Design is buildable  → i7-m5-design-buildable
All six work-items are buildable:
- Shared fragment, role seam, doc-tests — **method/composition only**, no engine change (the engine merely gates outputs).
- `tests-red` — the small engine addition proven above.
- Fixes: `#8` evidence honesty (root cause to fix in `runExecuted`/`selftestWorkspace` `ENGINE==""` guard); `#9` verdict-link and `#6` nesting — hooks **already exist** (`selftestReportVerdict`, `selftestReportNesting`) to strengthen so they catch the field-observed gap.

## Spike recorded  → i7-m5-spike-recorded
Spike at `.quack/spikes/tests-red/` (gitignored throwaway). One refinement carried to M6: the exact interaction between a `red-observed` attestation and `designs-realized` (a test may only require a prior red *before* its design existed) is a build-time detail; the core mechanism is validated here.
