---
minted_in: i1
id: sty-vendor-it-into-my-product
type: "[[story]]"
statement: When a builder wants this machine but not our way of working, they want a copy of it that is entirely theirs, so they can change anything in it and still take what we fix later.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
priority: must
---

## Deck

<!-- REVISED at i16, 2026-08-18. The previous deck told the sealed model: the
engine installed UNDER the builder's product, in a folder of its own, with
nothing of theirs inside it and an update replacing that folder whole. The
owner withdrew that model - "at no point is there any sealing" - and the method
says a story the change invalidates is revised rather than silently outgrown.
The id is kept because five closed iterations' signed evidence points at it. -->

A builder wants this machine and not the way of working that ships with it. Today their only option is a fork, which costs them every improvement we make from that day on.
|||
THE COPY IS NOT A FORK, AND THAT DISTINCTION RESTS ENTIRELY ON SLIDE SEVEN. What i16 built is the copy and the change reporter. The taking of an update is not built, so as things stand today a produced vehicle IS a fork that knows what it changed.

---

Nothing of ours is on their machine. They have a clone of the parent and a command, and they have never run either.
|||
NOT DEMONSTRATED, AND ONE PART IS KNOWN TO FAIL. Every green result in this iteration was observed inside this repository. On a machine holding nothing of ours, the copy needs a network install first, because `node_modules` is excluded from what travels.

---

They run one command with a name. A complete copy of the whole system leaves under that name, as its own repository, and the name is written in exactly one file.
|||
PROVED, EXCEPT THE LAST CLAUSE. Eleven cases assert the tree is complete, is a repository of its own with one commit and no remote, and carries the given name. THE NAME IS NOT IN EXACTLY ONE FILE: it is spelled in nine places below the root, against a requirement whose target is zero. That is note-8aae512f9e01, found by the tester and left standing.

---

They open the copy on a machine that has never held the parent. The desk greets them, and the method it serves is the one we shipped, because they have written nothing of their own yet.
|||
THE METHOD TRAVELS, AND THE GREETING HAS NEVER BEEN SEEN. One defect here was found and fixed during verification: the repository-root `.claude/settings.json` was being dropped, and that is the only hook a fresh clone reads at session start, so no produced vehicle would have arrived at all. The "machine that has never held the parent" half has never been tried.

---

They write their own guidance and their own method cards. Where a card of theirs carries an identity we also ship, theirs is served and ours stays untouched underneath.
|||
NOTHING SERVES THIS. It is req-overlay-resolution and no overlay mechanism exists. THE FIRST HALF WORKS TRIVIALLY and that is worth saying plainly: a vehicle carries the whole method as a copy, so editing a card IS writing their own. What is missing is the LAYERING, never the ownership.

---

They edit one of our files directly, because it is theirs and nothing stops them. It stays edited, and the system keeps running.
|||
TRUE BY CONSTRUCTION, AND NOW RECORDED AS LAW. A vehicle is a complete independent copy and nothing in it is sealed, on the owner's ruling of 2026-08-18, which reversed the model the previous version of this deck told. `req-engine-folder-is-sealed` is removed. NOT OBSERVED, but there is nothing left that could stop them.

---

Three months on they take an update. What we changed since arrives, what they changed stays, and where the two meet the same place they decide it once, by hand.
|||
HALF BUILT, AND THE HALF THAT EXISTS IS THE REPORTING. `engine/update.ts` inventories what a vehicle made its own, measured from the vehicle's own root commit, with three cases. The RUNNER does not exist and its own header says why: writing one for a format nobody has specified would be fabrication rather than progress. The owner deprioritised it in their own words.

---

They ran their own method on their own product, on a machine that never held ours, and they are still taking what we learn. They did not fork, and nothing they did could reach us.
|||
ONE OF FOUR CLAUSES IS PROVED. "Nothing they did could reach us" holds for every path an agent names, by identity rather than by path, with a negative control. "Their own method" needs the overlay, which does not exist. "A machine that never held ours" has never been tried. "Still taking what we learn" needs the update runner, which does not exist. Carried by raid-debt-i16-ships-with-its-demonstrations-unperformed.
