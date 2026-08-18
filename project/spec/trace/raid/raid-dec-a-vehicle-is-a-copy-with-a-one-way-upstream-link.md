---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link
type: "[[raid]]"
kind: decision
statement: A vehicle is a plain copy of the engine's folder with its own fresh repository and one commit, and it records where it came from in a small file rather than in a git remote.
owner: the owner
trigger: the first update taken by a vehicle, which is the first act that reads the upstream file
status: decided
impact: A vehicle shares no commits with the engine, so no git merge can ever run between them. Every update mechanism must work from the vehicle's files as they stand rather than from a common ancestor.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - owner ruling 2026-08-18
  - raid-dec-a-copy-is-a-clone-that-keeps-its-history
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - el-vehicle-producer
  - vp-vendoring
---

## The ruling

THE OWNER'S WORDS, 2026-08-18: "I want this to be a copy. You can store a link
to the upstream in a config file or something... we are vended from something,
so put a small file in there that tells you where you're from. And then the
update stuff can reference that file. You can still git init it and make an
initial commit. That's okay. But it shouldn't point back to the original."

AND THE PRECEDENT THEY GAVE: "v1 just made a copy, and that worked."

## What it supersedes

[[raid-dec-a-copy-is-a-clone-that-keeps-its-history]] CHOSE A CLONE, and its
only reason was that a later update would have a merge base to work from. The
owner has ruled the update mechanism is not what this product is for, so the
reason is gone and the cost stays.

THE COST OF A CLONE, now unpaid for. A vehicle carrying the engine's whole
history carries every commit of a project that was never its own, and a reader
opening its log sees somebody else's work.

## Where the link lives

`deliverable/vendor/` ALREADY HOLDS THIS SHAPE. Each vendored thing gets a
folder with a README naming its source, its version, when it was pulled and how
to update it. The owner's own suggestion, and the pattern was already there.

THE UPSTREAM FILE IS THE SAME SHAPE with the direction reversed: the product is
the vendored thing, and the file says what it was vendored FROM.

- Source — which engine, by identity.
- Version — which version of it.
- Pulled — when the vehicle was made.
- To update — what an arriving update does, so a person reading the file learns
  the mechanism without leaving it.

## The link points ONE WAY, and that is the whole design

THE VEHICLE KNOWS ITS ENGINE. The engine knows nothing of the vehicle, which is
[[req-the-source-keeps-no-record-of-a-copy]] and is unchanged.

A GIT REMOTE WOULD BE A TWO-WAY THING. It is an address you can fetch from and,
with one wrong flag, push to. A file naming an identity is read by whatever
wants it and can reach nothing by itself.

THAT IS WHY THE FILE IS NOT A REMOTE, and it is the same reason
[[raid-dec-a-driven-tree-names-which-copy-drives-it]] gives for the driven
tree's record: an identity rather than a path, read rather than dialled.

## Rejected options

- A GIT CLONE KEEPING HISTORY. The standing decision until today. Rejected on the
  owner's ruling: it buys a merge base for an update mechanism they have said is
  not the point, and it pays by carrying somebody else's history into every
  vehicle.
- A CLONE WITH THE REMOTE REMOVED. Keeps the merge base and drops the dial-back.
  Rejected because the history is the part the owner objected to, not the remote
  alone, and a vehicle that silently contains the engine's commits is still
  carrying them.
- NO LINK AT ALL, which is what the shipped export does today. Rejected because
  an update then has nothing to identify itself against, and the owner asked for
  the file by name.
- A LINK IN A NEW ROOT-LEVEL CONFIG FILE. Rejected as a second home for a fact
  that already has a shape: the vendor folder records provenance, and this is
  provenance.

## Consequences

- NO GIT MERGE IS POSSIBLE between an engine and a vehicle, ever. There is no
  common ancestor. This is the consequence that reaches furthest and it is not
  a drawback of the choice so much as the choice itself.
- [[exp-a-structural-rename-across-a-vehicle]]'s MEASUREMENT NOW APPLIES TO A
  SHAPE NOBODY WILL BUILD. It measured a merge across a clone. Its finding is
  not retracted; its scope is.
- [[cand-nothing-but-a-channel]] IS DEAD, not merely behind. It exists to keep a
  fetchable connection to the engine, which the ruling forbids.
- THE UPDATE MECHANISM MUST READ THE VEHICLE'S FILES AS THEY STAND. A what-not-
  where program does exactly that, which strengthens the standing winner rather
  than weakening it.
- AND THE PRODUCER GETS SIMPLER. A copy, a fresh repository, one commit, one
  file written. No history to filter and no remote to strip.
