---
id: req-attest-block
type: requirement
refines: [uc-attested-session]
statement: If a ledger-advancing command arrives on the agent channel without a valid attestation key, then the engine shall refuse it, naming method/prompts/contract.md as the only unlock path.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Ledger-advancing = next, start, bless, ship, observe-red. Read-only commands (status, report, progress, why, lint, selftest, version, gather) stay open so debugging is never hostage. The refusal message names the contract and nothing else — the unlock instruction lives only inside the contract, so the sole path to the key runs through the file.
