---
id: adr-contract-delivery
type: adr
statement: Deliver the contract to the agent through the harness's NATIVE instruction channel (AGENTS.md for agents that honor it; .github/copilot-instructions.md for Copilot) carrying the rules with an active read→paraphrase→confirm imperative, single-sourced from contract.md. Deferred: an engine-time renderer that generates the entry files, and runtime engine-serve (quack contract) — until the wording is empirically shown insufficient, because a thin harness may never run the engine. Passive pointers are rejected outright (they failed on Copilot).
addresses: [req-copilot-instructions, req-active-imperative]
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0006 decision. Cheapest fix first (native channel + active imperative), escalate to rendering only if the empirical Copilot test fails.
