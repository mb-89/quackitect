---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: uc-drive-a-foreign-product
type: "[[use-case]]"
statement: Drive a product that is not the system's own, with the method coming from the system's tree and the work living in the other product's.
actor: stk-vehicle-owner
trigger: a builder has the system and a product of their own that they want the method applied to
precondition: the system is installed and running; the product to be driven exists as its own tree, with its own history
guarantee: the work's records, evidence and signatures land in the driven product's tree; the method served is the builder's own; and neither tree's content resolves into the other
refines:
  - sty-drive-somebody-elses-product
priority: must
---

<!-- MINTED at i16, 2026-08-18. The owner named two capabilities: "the engine
creates a vehicle from itself" and "the engine can work on something else than
itself". The first had a use case since i1 and the second had none.

WHAT MAKES IT A SEPARATE USE CASE rather than an extension of
uc-vendor-and-overlay: a different goal. That one is about HOLDING a copy. This
one is about POINTING one at work that is not its own, and the two are walked
by the same person at different times.

WHAT IT FORCES INTO EXISTENCE. Something has to say WHERE the work is,
separately from where the method comes from. project/product.md declares this
product self-hosting, and every path it resolves today sits under one root. -->

## Main scenario

1. The builder names the product to be driven.
2. The system COMES UP in that product's tree - which carries none of its method - and reports where the work stands, having written nothing yet.
3. The builder opens the desk, and the method served is theirs rather than the one the source shipped.
4. They walk a record on the driven product.
5. Every record, evidence form and signature the walk produces lands in the driven product's tree, beside the code it is about.
6. The system's own notes, call log and machinery stay in the system's tree throughout.
7. They close the record, and the driven product carries a trace it did not have before.

## Lane doors

- `se_produce_project` is step 1. It takes an empty folder and a name, and produces a tree carrying none of the method plus one record saying which copy drives it. The record names an identity and a version, never a path, so moving either tree changes nothing.

## Extensions

- 1z. THE ACT IS OFFERED WHERE THE BUILDER ALREADY IS, with the same bound as the spawn: it writes inside the named tree and nowhere else, and it ends with the builder working in that tree. Naming a product and arriving in it are one act rather than two.
- 1a. The named product is the system itself. That is the self-hosting case, unchanged, and it stays the default when nothing is named.
- 1b. The named product is not reachable, or is not a tree the system can read. The naming is refused with what it looked for, rather than a partial start.
- 2y. THE DRIVEN TREE CARRIES NONE OF THE SYSTEM'S METHOD, which is the ordinary case rather than an error. The system serves its method without consulting the driven tree at all. Reaching outside that tree is the crossing the path jail refuses today. HOW the method is found is M5's call rather than this step's, and one candidate is a recorded pointer to the copy that made the project, which is the predecessor's engine-home mechanism. Softened 2026-08-19: naming one mechanism inside a use case lets a gate read the use case as a demand for that mechanism.
- 2a. The driven product has no trace at all yet. The system reports an empty state rather than refusing, because a first record is exactly what a builder comes for.
- 3a. The builder has written no method of their own. The shipped method is served, which is the same guarantee uc-vendor-and-overlay's step 2 gives.
- 4a. The walk finds a fault in the system's own machinery mid-record. It is captured as a note in the SYSTEM's tree, never in the driven product's, and the walk continues. That note is repaired in the system's own next record.
- 5a. A write the walk needs would resolve outside both trees. Refused.
- 6a. The driven product's tree carries something that looks like method - guidance, cards, rows. It is treated as that product's WORK rather than as method. Method resolves from the system's tree only, with the builder's overlay on top.
- 7a. The builder drives a second product afterwards. Each product's trace stays in its own tree, and nothing of the first travels to the second.
