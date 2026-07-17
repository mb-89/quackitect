# M5 — Prove the riskiest unknowns (i0009_contract_attestation)

## Riskiest assumptions validated → i9-m5-riskiest-validated

**Spike 1 — grant/key round trip + challenge determinism** (`spikes/i9-attest-roundtrip/`).

- A worst-case session key (`+`, `/`, `=`, 50 chars) and a grant code passed chat → tool call → shell → flag parse **byte-exact in both PowerShell and git-bash** — verified by sha8 comparison (`8ffa3c13` / `2feae3f2` identical on both channels). This session itself was the real-harness leg of the trip: the key traveled through actual driving-agent tool calls.
- The positional challenge (word N of rule K) parses contract.md deterministically: rule sections split on `## K.` headings, CRLF normalized before counting, HTML design-marker comments stripped so markers never shift word positions. Repeated runs across both shells agree.
- **Finding (design advanced):** a raw positional pick can land on punctuation — rule 1 word 7 is `"—"`, an unanswerable token. The M6 implementation must pick from **letter-bearing words only** (filter tokens without letters before indexing). The ADR's mechanism statement stays valid; this is a token-selection detail inside it.
- Kill-criterion from M4 (round-trip garbles → shorter code format): **not triggered**; fallback stays unused.

**Spike 2 — Windows self-replace rename dance** (`spikes/i9-rename-dance/`).

- A running exe renamed itself aside, moved a staged "newer build" into its original path, and spawned the new binary from that path — all while still running: `NEW BINARY ALIVE … exe-replaced-in-place=true`. **PASS on the first and second run.**
- The parked old file is delete-locked while its process lives (expected on Windows) and **deletable on the next run** — run 2's step-0 cleanup removed run 1's leftover. The ratchet therefore opens with a leftover sweep.
- Kill-criterion from M4 (dance fails → build-next-launch): **not triggered**; fallback stays unused.

## Design is buildable → i9-m5-design-buildable
Every M4 mechanism now rests on demonstrated primitives: channel detection (shipped, i8), byte-exact flag transport (spike 1), deterministic contract parsing (spike 1), in-place binary replacement with cleanup (spike 2), `spec/**` node loading for spec/decisions/ (verified in LoadAll before M4), migrations (i8 verified-move pattern). No mechanism remains unproven; the remaining work is assembly, not invention.

## Spike results recorded → i9-m5-spike-recorded
Findings distilled here; the spike scratch stays gitignored and disposable per the method. One design advance carried into M6: letter-bearing-words-only challenge indexing.

## Review rounds & verdict

**Round 1 — Verify.** Both spikes ran for real (outputs quoted above, reproducible from the spike dirs). The sha8 equality across shells is the round-trip proof, not an assertion. The double run demonstrates cleanup, not just replacement.

**Round 2 — Validate.** The two spiked risks were exactly the two the M3 feasibility check flagged and the M4 kill-criteria named — the riskiest unknowns, not convenient ones. Both kill-criteria cleared without touching their fallbacks. The one discovery (punctuation tokens) is precisely what a spike exists to surface before the build hardens it.

**Round 3 — Red-team.** "The harness round-trip proves this harness, not Copilot." True — but the transported artifact is a plain CLI flag: the lowest common denominator every terminal-wielding harness shares. The harness-specific risk was chat-copy fidelity, demonstrated live. "The rename dance ran in a spike dir, not the global bin" — the primitive (rename-while-running on NTFS) is path-independent. The M6 selftest re-proves it at the real location. Residual accepted: no spike for an agent DECLINING to game the challenge — out of scope by design. The target is drift, not adversaries (recorded at M1 R2).

**Verdict: PASS.** Riskiest unknowns proven. Design advanced by one implementation detail. Proceed to M6.
