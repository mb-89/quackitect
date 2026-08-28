---
unreachable_citations:
  - driven-by.json
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: sty-drive-somebody-elses-product
type: "[[story]]"
statement: When a builder has this system and a product of their own, they want to point one at the other, so the method runs on the work they actually care about.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

A builder has the system and a product they are trying to build. The system can only work on itself, so the method never reaches the thing they came for.
|||
THE SECOND ACT EXISTS NOW. `produceProject` makes a plain work tree and records `driven-by.json`, naming the driving copy by identity rather than by location. Before i16 nothing in the engine produced anything but itself.

---

Their descendant is installed and running. Their own guidance is written. Their product sits in a different folder entirely, with its own history, its own build and no knowledge that any of this exists.
|||
HALF OF THIS STARTING STATE IS NOT REACHABLE TODAY. "Their own guidance is written" needs the overlay, and no overlay mechanism exists — that is vp-the-engine's fourth criterion and this iteration's largest gap. The other half is real and tested: a produced project carries none of the method, and the produced tree has its own git history.

---

They choose START A PROJECT from the feature list, and name the folder.
|||
DECLARED AND REGISTERED, BOTH HALVES. `vscode/package.json` line 68 declares "Start a Project This System Drives" and `vscode/src/extension.ts` line 2015 registers it. `createProject` asks for an empty folder and a name, and nothing else. NOT OBSERVED: nobody has pressed it.

---

A new window opens on that folder, and the system comes up in it - in a tree that carries none of its method, having written nothing yet.
|||
THIS IS THE SLIDE THAT FAILS TODAY, and naming it is why this deck exists. The window opens, on `forceNewWindow: true`. The tree carrying none of the method IS proved by test. What does NOT happen is the system coming up in it: nothing reads `driven-by.json` at startup, so the engine has no way to know it was pointed anywhere.

---

It reads what is there and reports where the work stands.
|||
NOT BUILT. No state, no verb and no startup path reads a driven tree. `drivenBy(tree)` exists and answers three states, but `resolved` is always false today and carries a `why` field saying why: no register of seen copies exists, so an identity cannot be turned back into a tree.

---

They open the desk and the method that greets them is theirs - their guidance, their cards, their rows - even though the work in front of it is not the system's own.
|||
NOT BUILT, AND IT IS THE OVERLAY AGAIN. A produced vehicle carries the whole method as a copy, so "their cards" means cards they edited in their own tree, which works. What is unanswered is which method a DRIVEN project resolves. That is req-overlay-resolution and it has no mechanism.

---

They walk one iteration on their product. Every record, every evidence form and every signature lands in their product's tree, beside the code it is about.
|||
NOT BUILT. Records resolve to the machine root. The MECHANISM this would rest on now exists — a declared root may be writable, which is how the engine reaches a tree that is not its own — but nothing routes records to it.

---

Mid-walk the system hits a fault in its own machinery. It writes itself a note and keeps going, and the note waits in the descendant rather than in their product.
|||
NOT BUILT AND NOT DESIGNED. Notes land in `.se/` under the machine root, and nothing separates a note about the machinery from a note about the driven work. This slide is the sixth goal of the vision and it is where that goal becomes checkable, so its emptiness is the honest measure of the goal.

---

The iteration closes. Their product carries a spec, a trace and signed evidence it did not have this morning, and the system it was driven by is unchanged except for one note.
|||
NOT REACHABLE, because the four slides above it are not built. Nothing here is blocked on a decision — it is blocked on work nobody has done.

---

They ran their own method on their own product, with the method and the work in two different trees, and neither leaked into the other.
|||
THE NO-LEAK HALF IS PROVED AND THE RUNNING HALF IS NOT. SE-C-143 refuses a write to the tree a copy came from, comparing recorded identities rather than paths, and it fails closed when it cannot decide. SE-C-141 bounds a producing act to what it is producing, for writes only. NOT covered: the engine's own internal writes, measured at 116 bare joins across 49 files, and the symlink and platform facets, which have no check at all. The rest of this deck is not built, so nothing has run that could leak.

<!-- WHY THIS STORY IS NEW at i16. The owner named two capabilities on
2026-08-18: "the engine creates a vehicle from itself" and "the engine can work
on something else than itself". The first had a story since i1 and the second
had none.

WHAT IT FORCES INTO EXISTENCE, which is the point of writing a story before the
design: something has to say WHERE the work is, separately from where the
method comes from. Today product.md declares this product self-hosting
and every path resolves under one root.

AND ITS SIXTH SLIDE IS NOT DECORATION. A descendant noticing its own fault
while driving somebody else's product is the sixth goal of the vision, and the
slide is where it becomes checkable: the note lands in the descendant, never in
the driven product. -->
