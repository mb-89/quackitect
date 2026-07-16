---
id: adr-attest-ritual
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: The attestation ritual combines a console grant, a positional-word challenge, and flag-carried chained keys. A one-time code is minted by `quack attest --grant` on the interactive console. It is redeemed with a challenge answer: word N of rule K, nonce-seeded, verified against the live contract. This yields a session key passed as `--key` on ledger-advancing commands. The key is hash-only at rest. It expires after a command budget. It can be renewed autonomously with the prior key plus a fresh challenge. This was chosen over flag-relayed chat grants, which give no structural proof, over contract-hash challenges, which are grep-able without reading, and over key files, which are plaintext at rest.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Pugh winner on C1 (structural enforceability) and C7 (one adjudicator interaction per session); C2 carried by the renewal chain. Env-var transport (`QUACK_KEY`) is accepted as a second read path, never required. Sensitivity: if the M5 harness spike shows the code/key round-trip garbles, fallback is a shorter alphanumeric code format — the ritual shape survives. Graveyard entries (chat-relayed grant, key file) get veto nodes once the scrap sink ships (M6); recorded here until then.
