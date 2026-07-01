---
id: test-contract-rules
type: test
verifies: [req-bless-y-console, req-contract-killer-relax, req-confirm-back, req-active-imperative, req-copilot-instructions]
statement: Selftest asserts the contract and entry surfaces carry the required clauses — the y=console-bless rule, the killer-bless explicit-authorization exception, the confirm-back ritual, the active read→paraphrase→confirm imperative, and the existence of .github/copilot-instructions.md single-sourced from contract.md.
class: review
verify: selftest:contract
killer: false
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
