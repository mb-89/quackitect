---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-a-state-mints-and-re-mints-its-work
type: "[[test-spec]]"
statement: Entering a state derives the work it owes, and entering again matches what already stands rather than duplicating or orphaning it.
method: test
verifies:
  - req-a-state-mints-its-work-tokens-on-entry
  - req-re-entering-a-state-decides-what-its-work-does
  - req-a-work-token-survives-its-methods-rewording
  - req-a-step-that-would-seed-a-submachine-takes-work-instead
files:
  - tests/mint-on-entry.test.ts
---

## Scope

WHAT IT COVERS: the moment a position starts owing things. What is derived, from
which sources, and what happens the second time.

WHAT IS OUT: how a card marks its parts, which has its own spec, and the COST of
minting, which cannot be measured until minting exists.

## Approach

STATE GRAPH, because re-entry is a state question. Three states of a piece of
work at entry: absent, standing open, standing finished. Every transition gets a
case, and the events that cause NO transition get one too, because those probe
the error handling.

THREE SOURCES, THREE CLASSES. The requirement names the reading a state demands,
the marked steps of its method, and the evidence it must produce. Each source is
its own equivalence class, and a case covers a state drawing on one, two and all
three.

COMPONENT LEVEL. Minting reads declarations and returns a set.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- ENTERING DERIVES FROM ALL THREE SOURCES, and a state demanding reading, steps
  and evidence owes items from each.
- A SOURCE THAT IS EMPTY CONTRIBUTES NOTHING, rather than an empty placeholder.
- ENTERING TWICE MINTS NO DUPLICATE. The second entry matches what stands.
- A REWORDED CARD ORPHANS NOTHING. The match is on the identity stamped when
  the item was first made, never on the heading text, so changing the wording
  leaves the item attached.
- AN ITEM WHOSE STEP IS GONE FROM THE CARD IS REPORTED, not deleted. The engine
  says the card no longer names it and leaves the decision to a person.
- FINISHED WORK IS NOT RE-MINTED on a second entry, so re-entering a position
  does not re-owe what was already settled.
- A STEP THAT WOULD SEED A SUBMACHINE TAKES WORK INSTEAD, so the same act is one
  item rather than a nested machine with its own lifecycle.
- A METHOD THAT WILL NOT COMPILE REFUSES ENTRY rather than minting a partial
  set, because a partial set reads exactly like a complete one.

NO MANUAL STEP.
