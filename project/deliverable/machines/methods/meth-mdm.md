---
kind: method
statement: MDM (Multiple-Domain Matrix) - a block matrix of several domains' DSMs (diagonal) and DMMs (off-diagonal) where at least one subset is COMPUTED (derived) from others already present, not independently elicited.
source: ref-structural-complexity-management
---

## Situation
Reach for it specifically when a target relationship is unreliable to elicit directly - respondents don't know they're coupled, or over-report "everything is linked to everything" - or when the domain-spanning derivation path IS the object of interest. Merely combining several [DSMs](meth-dsm)/[DMMs](meth-dmm) side by side without deriving anything new stays a "combined" case, not yet an MDM (term due to Maurer & Lindemann, 2007).

## Effect
Derives one DSM/DMM subset from others via directed-path composition - e.g. person-to-document x document-to-document yields a derived person-to-person coordination DSM nobody had to elicit by hand. Precedents: the K- and V-Matrix (a technical and a customer-view DSM, linked via a DMM, Bongulielmi et al. 2001); Danilovic and Börjesson's multi-project MDM (also an asymmetric-DSM example - same elements, deliberately different row and column order); Yassine et al.'s connectivity maps.

## Procedure
Name every domain and its elements. Keep ONE dependency meaning per DSM/DMM subset - mixing relation kinds inside one subset breaks structural interpretation. To derive a target subset: follow a row in domain-A-to-B's DMM to a filled cell, follow that column into B's own DSM, check the intersection for a further dependency; direction survives the composition (six documented Boolean-composition cases cover directed relations).
