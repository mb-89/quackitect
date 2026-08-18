---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: sty-press-create-vehicle-and-land-in-it
type: "[[story]]"
statement: When somebody wants their own copy of this system, they want to ask for it from the surface they are already looking at, so they end up working in it without ever finding a script.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
priority: must
---

## Deck

<!-- THE RAMP-UP of this iteration, per meth-story-slideshow: the first story is
always the one that starts from nothing and reaches the first screen. Every
other story in this record starts where this one ends. -->

Somebody wants their own copy of this system. The only way to get one is a script inside a repository they would have to find, read and trust first.
|||

---

They have the system open in front of them and its feature list on screen. They have never run the export. They do not know it exists.
|||

---

They choose CREATE A VEHICLE from the feature list.
|||

---

It asks them the three things the export asks: where to put it, what to call it, and the short name.
|||

---

A complete copy appears at the place they named. Nothing else on the machine changed, and the window they were in is exactly as they left it.
|||

---

A new window opens on the copy, and the desk greets them under their own name rather than ours.
|||

---

They have their own system, they are already working in it, and they never saw a command line.
|||

<!-- WHY THIS STORY IS NEW at i16, on the owner's instruction of 2026-08-18:
"there is a create vehicle button. If I press it, I would be asked for the same
arguments as RUNME export, then this new vehicle will be created, and then a new
window of VS Code will be opened in that vehicle, so I can continue my work
there."

WHY THE FIFTH SLIDE IS NOT DECORATION. An act that writes a whole folder is the
most dangerous thing this iteration ships, and the slide asserts the two things
draw-context made binding: nothing outside the produced tree changed, and the
window it was launched from was not touched.

AND THE SIXTH SLIDE IS THE ONE THAT PROVES THE RENAME. The desk greeting them
under their own name is the brand fact resolving, which is
[[req-the-product-name-is-one-fact]] observed rather than asserted. -->
