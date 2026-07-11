---
id: adr-attest-ritual
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: The attestation ritual is console-grant + positional-word challenge + flag-carried chained keys — a one-time code minted by `quack attest --grant` on the interactive console, redeemed with a challenge answer (word N of rule K, nonce-seeded, verified against the live contract), yielding a session key passed as `--key` on ledger-advancing commands, hash-only at rest, expiring after a command budget and renewable autonomously with the prior key plus a fresh challenge — chosen over flag-relayed chat grants (no structural proof), contract-hash challenges (grep-able without reading), and key files (plaintext at rest).
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Pugh winner on C1 (structural enforceability) and C7 (one adjudicator interaction per session); C2 carried by the renewal chain. Env-var transport (`QUACK_KEY`) is accepted as a second read path, never required. Sensitivity: if the M5 harness spike shows the code/key round-trip garbles, fallback is a shorter alphanumeric code format — the ritual shape survives. Graveyard entries (chat-relayed grant, key file) get veto nodes once the scrap sink ships (M6); recorded here until then.
