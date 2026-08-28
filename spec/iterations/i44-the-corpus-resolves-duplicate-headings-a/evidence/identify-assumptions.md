---
form: identify-assumptions
by: agent
signed_off: 2026-08-28T10:47:13.489Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

Five new requirements went into the register at the last state. This sweep walks them, one named source at a time.

Two assumptions came out of it, and both carry a probe that could falsify them.

Four sources answered none, each for its own reason rather than for want of looking.

## assumptions

- raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot
- raid-asm-line-endings-do-not-change-what-counts-as-the-same-heading

## sweep

- environment: ONE ASSUMPTION. The set was called affordable on a single measurement, 2,549 nodes read in 892 to 1,178 milliseconds today. The corpus size is not ours to cap, so the sweeps fitting inside boot rests on it staying in this order of magnitude. Recorded as raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot.
- toolchain: none. The sweeps are engine code running on the pinned node version, which the arrival step already verifies against engines.node. Nothing new is installed and no new version is relied on.
- host: none new. The one thing worth naming here already stands as an experiment: the POSIX branch of the lane has never run. That is recorded and is not re-minted.
- platform: ONE ASSUMPTION. The heading check compares text after trimming, and whether a carriage return survives that trim is unpinned. Both line endings occur in this tree, since the patch verb corrects between them. Recorded as raid-asm-line-endings-do-not-change-what-counts-as-the-same-heading.
- neighbours: none. Nothing in this delta reads or is read by another system. The sweeps run over files this product owns.
- people: none as an assumption. The nearest candidate is that authors will use the unreachable marker honestly rather than as the cheap answer, and that is already a standing risk with a counting mitigation, not something a probe could settle.

## follow_up

Probe every standing assumption, not only these two.

The corpus-size probe cannot run until the lints exist, so it is a measurement owed at verification rather than now.

The line-ending probe can run as soon as the heading check has a first implementation, and it needs two fixtures.

## anything_else

WHY THE PEOPLE SOURCE ANSWERED NONE rather than minting an entry. The method says an assumption whose probe cannot be written is not one. No probe settles whether an author will take a shortcut; counting markers against repairs measures it after the fact, which is a mitigation on a risk rather than a probe on an assumption.

WHY THE HOST SOURCE POINTS AT SOMETHING STANDING. Re-minting an entry that already exists splits one concern into two, and the register's own rule is one entry per concern.
