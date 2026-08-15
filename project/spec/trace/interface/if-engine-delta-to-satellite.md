---
minted_in: i27
id: if-engine-delta-to-satellite
type: "[[interface]]"
statement: The delta hands the satellite its composed machine, naming every file that came from the record.
source: el-engine-delta
destination: el-satellite
carries:
  - flow-compiled-machine
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-an-engine-change-applies-in-its-own-record
---

## Handed once, at start

Never re-read mid-walk. A satellite runs one
composition for its whole life, so a walk finishes under the machine it began
under.

## What crosses

The resolved module set, plus the list of which files came from
the record rather than from trunk. That list is small, usually empty, and it
is what a reader needs to know what this satellite is running that others are
not.

## Why the list travels with the machine

Without it, N satellites run N
compositions and nothing says which is which. That is the hole
cand-os-rooted leaves open in its own text - N versions running, nothing
showing which record runs which - and naming the overrides closes it.

## A change means a new satellite

Not a re-read across this interface. The
supervisor composes again and brings a replacement up; this interface never
carries an update.
