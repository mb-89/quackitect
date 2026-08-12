---
form: b2-claim-guardrails
by: agent
signed_off: 2026-08-12T12:58:49.738Z
authors: agent
files:
---

# Evidence form / b2-claim-guardrails

## current_situation

The verb from b1 already minted the id and pushed only machinery; this chunk pins both as guardrail cases.

## built

The guardrails stand as tests and as feed-forward guidance.

- The anonymity sweep (tests/claims.test.ts): after a claim and a force release, every pushed commit identity and every pushed blob is swept for the hostname and the username — none appears; the identities are machine-<id>@machines.invalid.
- The push scope: the same case asserts only the claims ref leaves the machine (ls-remote shows one head), and the agent lane's push refusal (SE-C-003) keeps its standing end-to-end test in tests/gitlane.test.ts.
- The machine id mint (eight hex, machine-local outside git, stable across calls) carries its own case from b1.
- The refusal guidance now names the engine's two-artifact push right (guidance/refusals.md § SE-C-003), per the owner's 2026-08-11 ruling.

Scoped run: 8 of 8 green (job test-msq3ginj-3).

## follow_up

b3 wires the seed push and the claimable listing; b4 gates record entry on a standing claim.

## anything_else

