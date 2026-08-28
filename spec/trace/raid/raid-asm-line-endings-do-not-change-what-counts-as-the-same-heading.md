---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-asm-line-endings-do-not-change-what-counts-as-the-same-heading
type: "[[raid]]"
kind: assumption
statement: "A heading read from a file with Windows line endings compares equal to the same heading read with POSIX ones, so the duplicate-heading finding does not depend on which machine ran the sweep."
owner: the maintainer of the machine
trigger: the first duplicate-heading finding that appears on one platform and not on the other
status: open
probe: "Write one fixture node carrying a doubled heading with Windows line endings, and the same node with POSIX ones. Run the heading check over both. Two equal finding counts confirm it; any difference falsifies it."
probed: "unprobed 2026-08-28, and scheduled rather than skipped. It needs a first implementation of the heading check plus the two fixtures, so it runs in the milestone that builds the check."
impact: "A platform-dependent finding is worse than no finding. The sweep reads green on one machine and red on another, and neither result can be trusted until somebody works out which is right."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-heading-appears-once-in-a-node
weighs_with: none
weighs_against: none
---

## Where it comes from

THE ROW SAYS HEADINGS ARE COMPARED AS EXACT TEXT AFTER TRIMMING. Whether a
carriage return survives that trim is an implementation detail nobody has
pinned.

THE CORPUS ALREADY CARRIES THIS CLASS. The patch verb treats a line-ending
difference as a trivial mismatch and corrects it rather than refusing, which
means both endings really do occur in this tree. The overhaul plan's seed 8
names a separate line-ending divergence between two node readers.

## Why it is an assumption and not a decision

WE CHOOSE THE COMPARISON, so that half is ours. What is not ours is which
endings the files already carry, and that was set by whichever machine wrote
each one.

## Probe

Write one fixture node with a doubled heading using Windows endings, and the
same node using POSIX endings. Run the heading check over both.

TWO EQUAL FINDING COUNTS confirm it. Any difference falsifies it, and the fix
is to normalise before comparing rather than to pick a side.
