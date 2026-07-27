---
state: read_contract
state_kind: work
priority: 0.01
legal_tools: se_file_read
exit_read:
  - workspace/AGENTS.md
  - product/guidance/contract.md
  - product/guidance/voice.md
  - product/guidance/walking.md
guidance: Read every document in the exit condition through se_file_read - each result carries its hash. Leaving demands those hashes as proof (se_tick with read_hashes); keep them, later states demand them again at entry.
---

# Read the contract

The boot sequence's first step: the listed documents are read at every
session start — never remembered from training or a previous session.
A left-behind session handover (.se/HANDOVER.md) joins the read demand
while it exists — the engine adds it here, where reading is legal.

- AGENTS.md (the one rule; outside the vault, the engine serves it)
- [[guidance/contract|contract]]
- [[guidance/voice|voice]]
