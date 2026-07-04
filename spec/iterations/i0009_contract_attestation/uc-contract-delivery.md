---
id: uc-contract-delivery
type: usecase
refines: [need-engage]
statement: Every harness receives the full contract through its natively auto-loaded entry file, generated from the single contract source — no pointer-following required of the agent.
class: review
killer: false
---
## Rationale (not load-bearing)
A thin harness never follows a pointer; the contract CONTENT must already sit in the entry file. A generated file is an output, not a duplicate (like quack.exe from .go) — DRY holds.
