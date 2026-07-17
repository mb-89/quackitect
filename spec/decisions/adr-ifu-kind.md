---
id: adr-ifu-kind
decided_in: i0026_ifu_system
type: adr
adjudicated_by: agent
statement: IFU is a `kind: ifu` deck and guide row, not a new document type.
class: review
killer: false
---

## Rationale (not load-bearing)
The field term stays visible. The existing slideshow renderer stays the document mechanism.

## Options
A) Add a new IFU document type.

B) Use `kind: ifu` on markdown deck manifests and guide rows.

C) Keep IFUs as ordinary guides only.

Decided via B.