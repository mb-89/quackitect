---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-copys-changes-are-a-declared-patch-series
type: "[[option]]"
statement: the copy never edits what it received; every change it makes exists only as a named, described, separately stored patch, and the set of those patches is the inventory
cluster: the-bootstrap
question: how a copy's own changes are represented
found_by: prior-art
source: Debian source format 3.0 quilt (manpages.debian.org/unstable/dpkg-dev/dpkg-source.1.en.html), DEP-3 Patch Tagging Guidelines (dep-team.pages.debian.net/deps/dep3/), quilt(1) (man7.org/linux/man-pages/man1/quilt.1.html), pnpm patchedDependencies (pnpm.io/cli/patch)
---

## Mechanism

THE RECEIVED TREE STAYS PRISTINE. Every change the copy makes is written as a
patch file in a folder of its own, ordered by a list. Applying the list to the
pristine tree produces the copy's working state.

NOBODY HAS TO COMPUTE WHAT THE COPY CHANGED, because the changes have no other
representation. The folder IS the answer.

DEP-3 IS THE STRONGEST VERSION FOUND, and it is an accepted specification
rather than a convention. Each patch carries a header naming who wrote it and
why it exists.

- `Origin`, categorised — and one category is literally `vendor`, "a patch
  created by Debian or another distribution vendor".
- `Forwarded: not-needed`, meaning this one is permanently ours.
- `Applied-Upstream`, meaning upstream has absorbed it and the next update can
  drop it.

WHAT IT BUYS BEYOND A LISTING. The inventory carries REASONS, one per change.
That is the difference between knowing a copy differs and knowing what it
decided.

AND ONE SYSTEM GIVES LINE GRANULARITY. `quilt annotate` prints a file showing
which patch owns which line, so a reader can ask of any single line who made
it what it is.

WHAT IT COSTS, AND IT IS THE HEAVIEST PRICE ON THIS CELL. You cannot edit the
tree. Every change begins with declaring a patch and registering the files it
will touch, BEFORE touching them. quilt refuses an edit to a file a later patch
also modifies.

SO IT INVERTS THE WORKING HABIT. The copy's owner stops being somebody who
edits their own product and becomes somebody who maintains a patch stack
against somebody else's — which is a different job, and a less comfortable one.

AND UPSTREAM MOVEMENT COSTS REFRESHES. Debian's format demands patches apply
with ZERO fuzz and errors out otherwise, so an upstream change near a patched
region means re-cutting the patch by hand.
