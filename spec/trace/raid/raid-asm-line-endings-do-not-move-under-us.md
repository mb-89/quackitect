---
minted_in: i3
id: raid-asm-line-endings-do-not-move-under-us
type: "[[raid]]"
kind: assumption
statement: A document's bytes on disk stay stable while nobody edits its meaning, so a content hash does not change for a reason the reader would call no change.
owner: the driving agent
trigger: the reading credit's hash is chosen, or a line-ending complaint appears in the log
status: probed
impact: A credit dies for a change nobody made. The agent re-reads a document it still holds, which is the exact defect the requirement removes, arriving by a different door.
breaks_how_badly: abrasive
how_likely: plausible
probe: unprobed. The check means rewriting a file's line endings to see whether its hash moves, which mutates the tree to answer a design question. It belongs beside the storage design, inside this iteration, not before it.
probed: 2026-08-13
source_refs:
  - req-reading-credit-survives-a-reload
  - the lane's own CRLF/LF correction on se_file_patch, which is evidence both endings exist in the tree
---

## What is being relied on

The credit keys to document CONTENT. That is deliberate and it discharges
raid-dep-reading-credit-outlives-se-move, because a content key survives a
move.

It relies on the bytes being stable for the right reasons.

## Why the doubt is real rather than theoretical

The lane already corrects a CRLF/LF mismatch on every patch and names the
correction on the result. That correction exists because BOTH endings occur
in this tree.

So the tree demonstrably holds mixed endings, and git's own checkout
behaviour is configuration nobody here has pinned.

An editor, a git setting or a formatter can rewrite endings without touching
a word. The reader would call that no change. A byte hash would call it a
change.

## Probe

Hash one document. Rewrite its line endings without altering a character.
Hash it again.

If the hash moved, decide the normalisation before the storage ships: hash
the text with endings normalised, or hash the bytes and accept the false
misses.

The cheap answer is probably normalisation, and this probe is what makes it a
decision rather than a habit.

## Scope of the harm

Bounded. A false miss costs one re-read, never a wrong answer. That is why
this is abrasive rather than corrosive: it wastes work and never corrupts it.

## Probe result, 2026-08-19 — HOLDS at the filesystem, which is not the whole channel

CARRIAGE-RETURN LINE-FEED WAS WRITTEN AND READ BACK BYTE-IDENTICAL on this
machine. Nothing between the write and the read rewrote the endings.

WHAT THAT SETTLES is the layer this entry named: the platform does not move
endings under us.

WHAT IT DOES NOT SETTLE is the tooling above it. Version control, an editor's
own save behaviour, and the lane's patch verb each touch endings, and the lane
is documented as CORRECTING a mismatch rather than refusing it. A correction is
a deliberate move, which is the opposite of the drift this entry worries about,
but it means a byte comparison across the whole chain is a different experiment
from this one.
