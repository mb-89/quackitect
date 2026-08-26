---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-can-a-reader-act-on-the-departures-the-tree-holds
type: "[[experiment]]"
statement: Can a later reader act on the reasons written into this tree's departure list, measured by reading every departure the tree holds and asking what each one would let a reviewer decide?
probes:
  - raid-asm-an-author-refused-at-write-time-states-a-usable-reason
timebox: reading every departure the tree holds
form: calculation
chunk: none — the population is one, so it was read whole
faked: none. The real list was read at its real path.
fallback: pre-agreed at seeding. If the reasons read as boilerplate, the departure list stops being the product and the design falls back to a plain allow-list with no reason column.
verdict: unsettled
measured: 2026-08-26. Population of one. `deliverable/machines/widget-exemptions.md:51` carries the tree's only departure, and its reason is usable. One case cannot separate a rule that produces good reasons from a rule that has been used once by a careful author.
folds_to: Nothing moved upstream. The assumption stays open with a ready-when, because the population is one. What DOES move is a design constraint - a departure list that grows long is first evidence about the predicate, since sharpening this tree's predicate collapsed its list from 21 entries to 1.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/machines/widget-exemptions.md — the list itself
---

## Setup

The tree holds exactly one departure list, at `deliverable/machines/widget-exemptions.md`. Its entries sit below a marker comment on line 50.

The list was read whole. Each entry was held against one question: what would a reviewer be able to DECIDE from this reason alone?

## Result

UNSETTLED, ON A POPULATION OF ONE.

### The one departure, and its reason is good

`deliverable/machines/widget-exemptions.md:51` names `deliverable/engine/bin/mermaid-check.ts`. Its reason says the file is a diagnostic page a maintainer opens to see whether a document's diagrams parse, that it renders nothing about the walk, and that the panel never reaches it.

A reviewer can act on that. It names what the file IS, why the rule does not fit it, and the specific test — panel reach — the rule turns on. Nothing about it is boilerplate.

### One case is not evidence

The assumption is about what a POPULATION of authors writes under a refusal. A single entry written by a careful author says nothing about the population.

The falsifier the assumption names is a column of near-identical sentences. A column of one cannot be near-identical to anything.

### What the file records instead, and it is worth more

The list used to hold 21 entries. The rule changed on 2026-08-23, from asking whether the editor registry NAMES a module to asking whether the VS Code panel REACHES it. That left three, two of which were folded into the surface.

SHARPENING THE PREDICATE COLLAPSED THE LIST BY TWENTY ENTRIES. That is a measured fact about departure lists in this tree, and it was not what the spike went looking for.

It cuts against the worry the assumption carries. A long list of thin reasons is, on this one precedent, a signal that the PREDICATE is wrong rather than that the authors are lazy.
