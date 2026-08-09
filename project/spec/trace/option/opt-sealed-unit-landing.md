---
id: opt-sealed-unit-landing
type: "[[option]]"
statement: seal the work at its source into one unit that moves without being opened, and unseal it only at the destination
cluster: cluster-the-record-life
found_by: analogy
source: "containerisation in freight — the box is sealed at the shipper and opened at the consignee"
---

## Mechanism

THE ABSTRACT PROBLEM. Move work that must not be tampered with in transit,
across handlers who never inspect it, and have it arrive whole or not at all.

HOW FREIGHT SOLVES IT. The shipper packs and seals the container. Every
handler moves the SEALED BOX and none opens it. The seal number travels on
the paperwork, so a broken seal is visible before the box is opened rather
than discovered inside. Intermodal transfer works because the box is the unit
and the contents are nobody's business in between.

WHAT TRANSFERS. A landing today is a merge, and a merge inspects and
recombines. The sealed shape says the record produces one artifact, its
identity is a hash the record itself computed, and trunk verifies the seal
rather than re-deriving the contents.

WHAT BREAKS IN TRANSLATION. Freight containers do not have to reconcile with
what is already at the destination, and a landing does. Two records touching
one file is the case a sealed box cannot express, so this cell needs a
partner mechanism for the overlap — which is what the merge queue is for.

The seal earns its place anyway on a different axis. It makes a half-landed
trunk impossible to reach by construction rather than by a refusal that has
to be remembered, which is what req-land-is-one-piece asks for.
