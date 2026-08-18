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

---

Their descendant sits in one folder. Two folders along is a checkout of something else entirely, unrelated, with uncommitted work in it. Both are on the same disk, under the same user.
|||

---

They delete half of what the descendant shipped with - guidance, method cards, whole directories - because it is theirs and they were told nothing is sealed.
|||

---

They rename its folders, rewrite its brand file, and point it at a different product. It keeps running on what is left.
|||

---

They run whatever their tooling offers for cleanup, including the force-removal command that follows links.
|||

---

They open the neighbouring checkout. It is exactly as they left it, with its uncommitted work and its history intact, and nothing in it changed while they were not looking.
|||

---

They never checked, and they never had to. There was no path out of the descendant's own folder for anything to travel along.
|||

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
