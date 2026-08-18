---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: sty-nothing-i-do-reaches-what-it-came-from
type: "[[story]]"
statement: When a builder is about to let an unfamiliar system sit beside repositories they care about, they want proof that nothing it does can reach outside itself, so they can gut their copy without checking what else moved.
actor: stk-vehicle-owner
refines:
  - vp-vendoring
priority: must
---

## Deck

A builder is asked to install a system that copies itself. They have repositories on that machine they cannot afford to lose, and nothing tells them what the copy can touch.
|||
THREE THINGS NOW TELL THEM, and each is a refusal rather than a promise. SE-C-143 refuses a write target that is the tree this one came from. SE-C-141 refuses a write that left the tree the running act is producing. SE-C-142 refuses a producing act before it writes a byte. Each carries its rule in `guidance/refusals.md` ahead of ever firing, at lines 158, 175 and 193.

---

Their descendant sits in one folder. Two folders along is a checkout of something else entirely, unrelated, with uncommitted work in it. Both are on the same disk, under the same user.
|||
THE TEST FIXTURE BUILDS EXACTLY THIS SHAPE, in a temporary directory: a produced tree, a sibling tree, the same disk and the same user. What is NOT set up anywhere is uncommitted work in the neighbour, because nothing in the battery has ever been pointed at a neighbour that had any.

---

They delete half of what the descendant shipped with - guidance, method cards, whole directories - because it is theirs and they were told nothing is sealed.
|||
NOTHING IS SEALED, and that is now the recorded law rather than an inversion of it. `raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours` carries v2's ruling verbatim: the rule names the DIRECTION of writes, never a folder. vp-vendoring's outcome line used to say the opposite and was amended at this iteration's frame-delta. NOT OBSERVED: nobody has gutted a produced copy and kept it running.

---

They rename its folders, rewrite its brand file, and point it at a different product. It keeps running on what is left.
|||
THE RENAME IS SAFE BY CONSTRUCTION, and that is the whole reason the identity is MINTED rather than derived from a name. The guard compares recorded identities, so moving, copying or renaming either tree changes nothing. One hazard was found and closed by writing: a copy owner editing `brand.json` is now told that `instance` is not a name and must be left alone. NOT OBSERVED.

---

They run whatever their tooling offers for cleanup, including the force-removal command that follows links.
|||
THIS IS THE WHOLE TEST AND IT HAS NEVER BEEN RUN. The exact command that caused the 2026-07-25 incident, `git worktree remove --force` following a symlink, is exercised nowhere. The SYMLINK facet has no check at all, and neither does the platform facet. This is the emptiest slide in the iteration, and it is the one the story was written for.

---

They open the neighbouring checkout. It is exactly as they left it, with its uncommitted work and its history intact, and nothing in it changed while they were not looking.
|||
PROVED FOR EVERY PATH AN AGENT NAMES, and not otherwise. A write reaching outside is refused, with a negative control proving the guard actually fires rather than passing by accident. NOT covered: the engine's own internal writes, measured at 116 bare joins across 49 files, which never reach the guard.

---

They never checked, and they never had to. There was no path out of the descendant's own folder for anything to travel along.
|||
NOT TRUE YET, AND THE GAP IS NAMED RATHER THAN ROUNDED OFF. The claim is that NO path out exists. What is proved is that the paths an agent names are refused. The 116 internal write sites, the symlinks and the platform facets are unchecked, so "no path" is a target rather than a measurement.

<!-- WHY THIS STORY EXISTS, and it is the only one here written from an
incident rather than from a goal.

ON 2026-07-25 IN THIS HOUSE the sixth slide went the other way. An npm `file:`
dependency was implemented as a symlink into a sibling checkout, and a routine
`git worktree remove --force` followed it and deleted that repository's working
tree and its .git. The law that came out of it is
[[raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours]], graded fatal.

WHY IT NEEDED A STORY rather than only a decision. A decision is a claim, and a
claim is what M8 cannot demonstrate. The isolation rule was the best-founded
thing in this iteration's register and the only one with nothing to show it.

AND THE FIFTH SLIDE IS THE WHOLE TEST. It names the exact command that did the
damage, on purpose. A demonstration that does not run it has not demonstrated
anything. -->
