---
id: i1-prove-a-bases-equivalent-live-table-can-
status: seeded
opened: 2026-08-01T12:56:57.591Z
goal: "Prove a Bases-equivalent live table can replace Obsidian for this vault, before anything is switched over.\n\nThree things have to hold together. One warm model of every note, its frontmatter and its connections, holding TENS OF THOUSANDS of nodes. The Bases expression language, with a function registry we can extend with our own. Interface controls — Properties, Sort, Filter, group-by, Add view — that WRITE the .base file.\n\nThe owner rejected the direction the previous expedition took. What was built is a renderer for view files somebody else authors. What is wanted is the view AS THE INSTRUMENT, built and changed and saved from the interface. The dependency matrix is one renderer among several and explicitly not an important one; nothing further gets built on it."
vision: "THE LAW: content lives in the nodes, never in the view. A cell edit writes the source note's frontmatter. A control change writes the .base file. Both re-render from what is on disk. One law, two surfaces, and the cell half already works.\n\nFILTERING IS THE HOT PATH, RENDERING IS NOT. The owner ruled it plainly: cutting tens of thousands of nodes down to a few dozen must be fast, and painting tens of thousands of rows slowly is acceptable. Today's code does the opposite — it re-reads the whole vault and server-renders every view of every .base file on each render. That gets replaced, not tuned.\n\nLIVE IN BOTH DIRECTIONS. Add a node or a state machine and it appears. Change a note and the view follows. No reload.\n\nDONE LOOKS LIKE FIVE THINGS PROVEN, risk first:\n\n1. The warm model at real scale — index the vault, then 30,000 nodes, reporting build time, memory, and the time to filter 30,000 down to dozens.\n2. The expression language — parser, evaluator, extensible function registry, running the real examples from the reference and the filter from the owner's screenshot.\n3. One control end to end — tick a property, the column appears, the property lands in that view's order: in the .base file, and the file on disk is what re-renders.\n4. Live — touch a note and the view follows.\n5. The owner drives it BY HAND in VS Code. Nobody has ever driven the existing table by hand.\n\nNOT IN THIS PROOF, deliberately: formulas, summaries, Cards and List views, and the ![[File.base#ViewName]] markdown embed. Those are parity work after the concept holds. The owner deferred the embed explicitly.\n\nTHE MEASURED GAP the proof closes: the expression language does not exist at all. No arithmetic, no boolean operators, no ordering comparisons, no function calls, no date durations, no note./formula./this. namespaces. Filters today are four shapes. Filters and formulas are the SAME language in Bases, so everything in the owner's screenshots stands on it."
inputs:
  - "product/spec/bases-syntax.md"
  - "product/spec/table-and-pivot.md"
  - "note-b20c4ff82555"
  - "e28-fix-the-day-s-bucket-for-2026-08-01-five-kno"
---

# i1-prove-a-bases-equivalent-live-table-can-

## Goal

Prove a Bases-equivalent live table can replace Obsidian for this vault, before anything is switched over.

Three things have to hold together. One warm model of every note, its frontmatter and its connections, holding TENS OF THOUSANDS of nodes. The Bases expression language, with a function registry we can extend with our own. Interface controls — Properties, Sort, Filter, group-by, Add view — that WRITE the .base file.

The owner rejected the direction the previous expedition took. What was built is a renderer for view files somebody else authors. What is wanted is the view AS THE INSTRUMENT, built and changed and saved from the interface. The dependency matrix is one renderer among several and explicitly not an important one; nothing further gets built on it.

## Rough vision

THE LAW: content lives in the nodes, never in the view. A cell edit writes the source note's frontmatter. A control change writes the .base file. Both re-render from what is on disk. One law, two surfaces, and the cell half already works.

FILTERING IS THE HOT PATH, RENDERING IS NOT. The owner ruled it plainly: cutting tens of thousands of nodes down to a few dozen must be fast, and painting tens of thousands of rows slowly is acceptable. Today's code does the opposite — it re-reads the whole vault and server-renders every view of every .base file on each render. That gets replaced, not tuned.

LIVE IN BOTH DIRECTIONS. Add a node or a state machine and it appears. Change a note and the view follows. No reload.

DONE LOOKS LIKE FIVE THINGS PROVEN, risk first:

1. The warm model at real scale — index the vault, then 30,000 nodes, reporting build time, memory, and the time to filter 30,000 down to dozens.
2. The expression language — parser, evaluator, extensible function registry, running the real examples from the reference and the filter from the owner's screenshot.
3. One control end to end — tick a property, the column appears, the property lands in that view's order: in the .base file, and the file on disk is what re-renders.
4. Live — touch a note and the view follows.
5. The owner drives it BY HAND in VS Code. Nobody has ever driven the existing table by hand.

NOT IN THIS PROOF, deliberately: formulas, summaries, Cards and List views, and the ![[File.base#ViewName]] markdown embed. Those are parity work after the concept holds. The owner deferred the embed explicitly.

THE MEASURED GAP the proof closes: the expression language does not exist at all. No arithmetic, no boolean operators, no ordering comparisons, no function calls, no date durations, no note./formula./this. namespaces. Filters today are four shapes. Filters and formulas are the SAME language in Bases, so everything in the owner's screenshots stands on it.

## Inputs

- product/spec/bases-syntax.md
- product/spec/table-and-pivot.md
- note-b20c4ff82555
- e28-fix-the-day-s-bucket-for-2026-08-01-five-kno
