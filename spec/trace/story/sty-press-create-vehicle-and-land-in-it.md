---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: sty-press-create-vehicle-and-land-in-it
type: "[[story]]"
statement: When somebody wants their own copy of this system, they want to ask for it from the surface they are already looking at, so they end up working in it without ever finding a script.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

<!-- THE RAMP-UP of this iteration, per meth-story-slideshow: the first story is
always the one that starts from nothing and reaches the first screen. Every
other story in this record starts where this one ends. -->

Somebody wants their own copy of this system. The only way to get one is a script inside a repository they would have to find, read and trust first.
|||
THE SCRIPT IS GONE, and RUNME.ps1 line 54 says so in its own words: "THE EXPORT IS GONE, AND THE ACT IS A BUTTON NOW (owner ruling 2026-08-18)". The 85-line export block was removed and the file fell from 555 lines to 470.

---

They have the system open in front of them and its feature list on screen. They have never run the export. They do not know it exists.
|||
NOTHING TEACHES THE EXPORT ANY MORE. `bin/se-mcp.ts` lines 124-127 redirect the removed `--export` flag to the two palette commands by name, and no prose anywhere in the repository mentions `RUNME.ps1 --export`. Checked across the whole tree at this iteration's consistency sweep.

---

They choose CREATE A VEHICLE from the feature list.
|||
DECLARED AND REGISTERED, BOTH HALVES. `vscode/package.json` line 63 declares "Make a Copy of This System" and `vscode/src/extension.ts` line 2014 registers it. A test asserts both, because declared-and-not-registered is a palette entry that errors when pressed, and registered-and-not-declared is a command nobody can find. NOT OBSERVED: nobody has pressed it.

---

It asks them the three things the export asks: where to put it, what to call it, and the short name.
|||
`createVehicle` ASKS FOR EXACTLY THOSE THREE and nothing else: an empty folder, a name, and a two-or-three-letter short name. The abbreviation validates AS THE PERSON TYPES, so a bad one is refused before the call rather than after the wait. Neither command reads a path from a settings file, which is what makes the act theirs rather than the configuration's.

---

A complete copy appears at the place they named. Nothing else on the machine changed, and the window they were in is exactly as they left it.
|||
THE FIRST HALF IS PROVED AND THE SECOND CANNOT BE PROVED FROM HERE. Eleven cases in `tests/produce.test.ts` produce a vehicle into a temporary directory and compare the engine's own tree before and after. A producing act is bounded to the tree it is making (SE-C-141) and may never write back to the tree it came from (SE-C-143), both with negative controls. The WINDOW half rests on `forceNewWindow: true` asserted in the extension's source, which proves the intent rather than the result.

---

A new window opens on the copy, and the desk greets them under their own name rather than ours.
|||
THE RENAME IS PROVED, THE GREETING IS NOT OBSERVED. `produceVehicle` writes `brand.json` with the given name, id and abbreviation, mints a fresh 12-hex `instance`, and renders the README from the shared entry template. The produced tree is asserted to carry the new name and not ours. Nobody has seen the desk greet anybody under a produced name.

---

They have their own system, they are already working in it, and they never saw a command line.
|||
NOT OBSERVED, AND ONE PART OF IT IS KNOWN TO FAIL TODAY. The copy excludes `node_modules`, so it needs a network install before it runs, and that install is a command line. raid-debt-i16-ships-with-its-demonstrations-unperformed carries this slide and the whole deck, graded crippling and expected.

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
