---
id: uc-honest-adjudication
type: usecase
refines: [need-qualities]
statement: The attest record names the true adjudicator — channel defaults match reality (interactive console = human, harness-invoked = agent) and an explicit flag overrides both, so omission errs toward under-claiming human oversight.
class: review
killer: false
---
## Rationale (not load-bearing)
The realistic failure is omission, not malice: forgetting the QUACK_ACTOR env dance stamps an agent bless as human and blinds the self-cert metric. Make the accurate record the path of least resistance.
