---
kind: method
statement: "DMM (Domain Mapping Matrix) - a rectangular matrix mapping elements of two DIFFERENT domains (e.g. requirements x design regions), without computing new information from it."
source: ref-structural-complexity-management
---

## Situation
Reach for it when relating two different domains - not one domain's internal structure - and no algorithmic structure analysis is needed on the mapping itself. A [DSM](meth-dsm) is one domain; a DMM is exactly two, directly elicited.

## Effect
Not necessarily square: row and column headings name different element sets. The term was fixed by Danilovic and Börjesson, 2001. Several DSMs and DMMs can sit side by side without any subset being computed from another - e.g. the House of Quality (a DSM "roof" of requirement-conflict relations plus three DMMs), or Eppinger and Salminen's separate one-to-one comparisons of component, process, and organization DSMs. That combined-but-uncomputed use stays a set of DSMs/DMMs, not yet an [MDM](meth-mdm).

## Procedure
List domain A's elements as rows, domain B's as columns. Mark a cell where an A element maps to (uses, is covered by, traces to) a B element. Keep one mapping meaning per DMM, same rule as a DSM.

## Tools
Trace edges - requirement to design region, or model kind to element - are DMM cells already; a requirement x region DMM is one query away from the existing graph, no separate elicitation needed.
