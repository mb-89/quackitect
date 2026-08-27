---
kind: method
statement: A DMM (Domain Mapping Matrix) is a rectangular matrix mapping two DIFFERENT domains. Nothing new is computed from it.
source: ref-structural-complexity-management
---

## Situation

Reach for it when relating two different domains, rather than one domain's
internal structure. No algorithmic structure analysis is needed on the
mapping itself.

A [DSM](meth-dsm) is one domain. A DMM is exactly two, directly elicited.

## Effect #work

Not necessarily square. Row and column headings name different element sets.

The term was fixed by Danilovic and Börjesson, 2001.

Several DSMs and DMMs can sit side by side without any subset being computed
from another. Two examples:

- The House of Quality. A DSM "roof" of requirement-conflict relations, plus
  three DMMs.
- Eppinger and Salminen's separate one-to-one comparisons of the component,
  process and organization DSMs.

That combined-but-uncomputed use stays a set of DSMs and DMMs. It is not yet
an [MDM](meth-mdm).

## Procedure #work

List domain A's elements as rows, and domain B's as columns.

Mark a cell where an A element maps to a B element. Mapping means one of:

- uses
- is covered by
- traces to

Keep one mapping meaning per DMM, by the same rule as a DSM.

## Tools #work

Trace edges are DMM cells already. A requirement-to-design-region edge is one,
and so is a model-kind-to-element edge.

A requirement-by-region DMM is one query away from the existing graph. No
separate elicitation is needed.
