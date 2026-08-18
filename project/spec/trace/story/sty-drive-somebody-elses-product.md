---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: sty-drive-somebody-elses-product
type: "[[story]]"
statement: When a builder has this system and a product of their own, they want to point one at the other, so the method runs on the work they actually care about.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
priority: must
---

## Deck

A builder has the system and a product they are trying to build. The system can only work on itself, so the method never reaches the thing they came for.
|||

---

Their descendant is installed and running. Their own guidance is written. Their product sits in a different folder entirely, with its own history, its own build and no knowledge that any of this exists.
|||

---

They choose START A PROJECT from the feature list, and name the folder.
|||

---

A new window opens on that folder, and the system comes up in it - in a tree that carries none of its method, having written nothing yet.
|||

---

It reads what is there and reports where the work stands.
|||

---

They open the desk and the method that greets them is theirs - their guidance, their cards, their rows - even though the work in front of it is not the system's own.
|||

---

They walk one iteration on their product. Every record, every evidence form and every signature lands in their product's tree, beside the code it is about.
|||

---

Mid-walk the system hits a fault in its own machinery. It writes itself a note and keeps going, and the note waits in the descendant rather than in their product.
|||

---

The iteration closes. Their product carries a spec, a trace and signed evidence it did not have this morning, and the system it was driven by is unchanged except for one note.
|||

---

They ran their own method on their own product, with the method and the work in two different trees, and neither leaked into the other.
|||

<!-- WHY THIS STORY IS NEW at i16. The owner named two capabilities on
2026-08-18: "the engine creates a vehicle from itself" and "the engine can work
on something else than itself". The first had a story since i1 and the second
had none.

WHAT IT FORCES INTO EXISTENCE, which is the point of writing a story before the
design: something has to say WHERE the work is, separately from where the
method comes from. Today project/product.md declares this product self-hosting
and every path resolves under one root.

AND ITS SIXTH SLIDE IS NOT DECORATION. A descendant noticing its own fault
while driving somebody else's product is the sixth goal of the vision, and the
slide is where it becomes checkable: the note lands in the descendant, never in
the driven product. -->
