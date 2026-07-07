---
id: uc-decisions-never-relitigated
type: usecase
statement: Every decision — adopt, veto, defer — is an immutable node in spec/decisions/ classified purely from graph facts; the graveyard and parked panels are the read path that prevents re-raising a settled idea.
class: review
killer: false
---
## Rationale (not load-bearing)
Decision model v2: born made, never edited, exits by supersession only; no status fields (the gate ledger IS the state machine, DRY). OPEN decisions are never a record state — in-iteration pending = unblessed gate, cross-iteration = defer node, musings = raw notes.
