---
id: stk-vehicle-owner
type: "[[stakeholder]]"
statement: A builder who runs the method on their own product, and needs their own guidance to stay their own.
interest: 0.7
influence: 0.4
weight: 0.6
---

## Concerns

- Their guidance, methods and behaviour are specific to their organisation
  and cannot leave it. The engine is open; their overlay is not.
- Forking to get their own method costs them every upstream improvement from
  the day they fork.
- A colleague must be able to clone the vehicle repository and run it,
  without access to the engine's own working copy.
- What the engine writes must never land inside their tree, and what they
  write must never land inside the engine's.

## Notes (not load-bearing)

Distinct from the engineer driving agents, and deliberately weighted lower:
this role arrives after the product works for its primary audience. Its
influence is low because it does not yet exist as a real person — it is the
role the vendoring proposition is built for, and it will gain weight when
someone actually occupies it.
