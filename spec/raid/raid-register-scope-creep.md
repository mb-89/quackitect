---
id: raid-register-scope-creep
type: raid
kind: risk
probability: 0.6
impact: 0.5
mitigation: the M3 candidates step bounds the register to ONE placement; the fill/adjudicate UI unifies with the EXISTING ask path instead of growing a parallel one; two-model budget at M4
owner: driving agent
status: open
statement: The register grows into a parallel UI system: its own renderer, its own answer path, its own state. This happens instead of unifying with the existing ask/bless machinery.
class: review
killer: false
---
## Rationale (not load-bearing)
The register seed demands unification (register view, ask loop, questionnaires = one system).
Every prior surface that grew beside an existing one (deck vs book rails, i19-i20) cost a
consistency sweep later.
