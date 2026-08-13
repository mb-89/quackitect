---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: stk-vehicle-owner
type: "[[stakeholder]]"
statement: A builder who runs the method on their own product, and needs their own guidance to stay their own.
role_class: acquirer
dicet: customer
disposition: +
interest: 0.9
influence: 0.8
weight: 0.85
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

CORRECTED BY THE OWNER, 2026-08-06. This node previously said the role does not
yet exist as a real person, and weighted it at 0.4 influence on that basis.
Both were wrong. These are the product's CUSTOMERS in the DICET sense: they
provide requirements, they do not hold the budget and do not decide the
product's direction. They run the system today with their own guidance layered
on it, and they specifically do not want that guidance going back into the open
source.

SO THE PRIVACY OF THE OVERLAY IS A REQUIREMENT, not a preference. It is the
reason this role vendors rather than contributes, and it is the constraint the
whole resolution chain exists to honour. It is listed as a concern above
because that is what it is - a stated need from a real audience - rather than
an inference the agent drew.

WHY IT WAS WRONG. The agent asserted the role was hypothetical instead of
asking. That is the same defect as writing an unevidenced comparison, in a
different place: a judgment stated where a question was owed (note-2374e629249f).
