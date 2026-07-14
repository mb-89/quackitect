---
id: raid-busy-record
type: raid
statement: A test that consults a busy render guard can record the guard's vacuous answer as a real verdict - the false entry then self-perpetuates on cache hits.
kind: risk
probability: 0.3
impact: 0.6
mitigation: Class fix queued (a busy return must never record; NOTE-20260714-164933); until then the two known instances carry per-test guards (deck-goto vacuous-pass idiom, register-render render-exclusion).
owner: the driving agent
status: open
killer: false
provenance:
  mitigation: user-ruling via handoff
---
