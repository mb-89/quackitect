---
id: se.q-attest-ritual
kind: question
statement: "Re-derive under v2 ground: attestation UX under v2 grants + channels"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-attest-ritual
v1_statement: "The attestation ritual combines a console grant, a positional-word challenge, and flag-carried chained keys. A one-time code is minted by `quack attest --grant` on the interactive console. It is redeemed with a challenge answer: word N of rule K, nonce-seeded, verified against the live contract. This yields a session key passed as `--key` on ledger-advancing commands. The key is hash-only at rest. It expires after a command budget. It can be renewed autonomously with the prior key plus a fresh challenge. This was chosen over flag-relayed chat grants, which give no structural proof, over contract-hash challenges, which are grep-able without reading, and over key files, which are plaintext at rest."
status: open
---

## The ported question

attestation UX under v2 grants + channels

## v1 ruling (NOT ported — context only)

The attestation ritual combines a console grant, a positional-word challenge, and flag-carried chained keys. A one-time code is minted by `quack attest --grant` on the interactive console. It is redeemed with a challenge answer: word N of rule K, nonce-seeded, verified against the live contract. This yields a session key passed as `--key` on ledger-advancing commands. The key is hash-only at rest. It expires after a command budget. It can be renewed autonomously with the prior key plus a fresh challenge. This was chosen over flag-relayed chat grants, which give no structural proof, over contract-hash challenges, which are grep-able without reading, and over key files, which are plaintext at rest.
