---
id: i7-the-trace-sharpens-finer-grain-than-file
status: seeded
opened: 2026-08-11T15:24:09.708Z
goal: "The trace sharpens: finer grain than files, and the dead-code sweep widens past the engine."
vision: |-
  The design trace's next honesty step, parked from the i1 walk.

  - Finer grain than files (owner, note-8c6384b08d07): dead code inside a claimed file is invisible at file grain; the sweep learns to look inside, and sparsely-used code gets its pruning look.
  - The sweep's scope widens (note-9e905dddef9d): today it covers project/deliverable/engine ts files only - the VS Code extension and the bin scripts join.

  Independent of every sibling iteration; overlaps the overhaul function's territory and feeds it.

  FROM THE POOL, 2026-08-13. Four more, and two of them are the grain question stated properly.

  - THE ONE ARROW THAT WOULD CATCH A MISSING REQUIREMENT (note-a1a77f259644). A requirements state signed with three rows, then four mechanisms were built with no requirement each, found by hand. Every trace check runs from an artifact UP to its parent and keys off the artifact existing, so all three were satisfied and honest - a requirement nobody wrote is invisible to a check that starts at requirements. A test FILE sits on disk whether or not anybody wrote a requirement, so sweeping test file to spec forces the whole chain backwards. It belongs as a LAW at the tests state, not in a gate, because a gate is a judgment and this is a sweep over files. THE COUNT IS THREE OF FOUR, and the fourth is the point: new cases appended to an already-claimed file are invisible at file grain, and that will not be rare. THE RECURSION: building the sweep would itself grow a delta past a signed requirements state.
  - A DESIGN SPEC SHOULD NAME ITS REQUIREMENT DIRECTLY (owner design, note-976751d46e2e). Today the link is transitive through element and function. Functions and elements describe HOW something is implemented; the requirement does not care about the structure and wants only to be solved somewhere. Two questions, one edge answering both. THE CONSTRAINT THAT SHAPES IT: the direct edge must NOT be drawn, or every spec sprouts lines to every requirement on top of the architecture path - so it is a CHECKED edge rather than a DRAWN one, a distinction the schema does not have, and adding it is most of the work. IT CATCHES THE GAP ONE MILESTONE EARLIER than the file sweep, because a spec cannot be written without naming what it serves. The two are not exclusive. THE CHEAP HALF IS FREE AND GOES FIRST: guidance says that an agent needing to add design writes the design INPUT for it, not just the design.
  - REIFIED CONNECTIONS, mined from v1 as a candidate (note-6ba748959a02). Semantic relations become first-class connections in one home, because REIFIED EDGES ARE ADDRESSABLE - linkable, prose-bearing, queryable - which frontmatter lists can never be. Ours are frontmatter lists today, so an edge that wants a rationale has nowhere to put it. The scope line v1 used: reify verifies, refines, addresses, refers, chosen, rejected and supersedes; leave implements code-declared and merge it at read time; leave task wiring in frontmatter, because it is walk machinery rather than book content. The bound, from the RDF reification lesson: reify what carries data, keep high-volume edges cheap.
  - PRUNE THE TRACE (owner, note-836fa423019d). A link is a contribution, and that stance now stands in the schema - but nobody has audited edge by edge, and the earlier sweeps mapped honestly by intent. Audit a sample for contrived links, prune what does not contribute WITH THE OWNER, and decide a standing prune step. The owner wants that discussion in a retro, which makes the prune theirs to rule rather than this iteration's to do unattended.
inputs: null
---

# i7-the-trace-sharpens-finer-grain-than-file

## Goal

The trace sharpens: finer grain than files, and the dead-code sweep widens past the engine.

## Rough vision

The design trace's next honesty step, parked from the i1 walk.

- Finer grain than files (owner, note-8c6384b08d07): dead code inside a claimed file is invisible at file grain; the sweep learns to look inside, and sparsely-used code gets its pruning look.
- The sweep's scope widens (note-9e905dddef9d): today it covers project/deliverable/engine ts files only - the VS Code extension and the bin scripts join.

Independent of every sibling iteration; overlaps the overhaul function's territory and feeds it.

FROM THE POOL, 2026-08-13. Four more, and two of them are the grain question stated properly.

- THE ONE ARROW THAT WOULD CATCH A MISSING REQUIREMENT (note-a1a77f259644). A requirements state signed with three rows, then four mechanisms were built with no requirement each, found by hand. Every trace check runs from an artifact UP to its parent and keys off the artifact existing, so all three were satisfied and honest - a requirement nobody wrote is invisible to a check that starts at requirements. A test FILE sits on disk whether or not anybody wrote a requirement, so sweeping test file to spec forces the whole chain backwards. It belongs as a LAW at the tests state, not in a gate, because a gate is a judgment and this is a sweep over files. THE COUNT IS THREE OF FOUR, and the fourth is the point: new cases appended to an already-claimed file are invisible at file grain, and that will not be rare. THE RECURSION: building the sweep would itself grow a delta past a signed requirements state.
- A DESIGN SPEC SHOULD NAME ITS REQUIREMENT DIRECTLY (owner design, note-976751d46e2e). Today the link is transitive through element and function. Functions and elements describe HOW something is implemented; the requirement does not care about the structure and wants only to be solved somewhere. Two questions, one edge answering both. THE CONSTRAINT THAT SHAPES IT: the direct edge must NOT be drawn, or every spec sprouts lines to every requirement on top of the architecture path - so it is a CHECKED edge rather than a DRAWN one, a distinction the schema does not have, and adding it is most of the work. IT CATCHES THE GAP ONE MILESTONE EARLIER than the file sweep, because a spec cannot be written without naming what it serves. The two are not exclusive. THE CHEAP HALF IS FREE AND GOES FIRST: guidance says that an agent needing to add design writes the design INPUT for it, not just the design.
- REIFIED CONNECTIONS, mined from v1 as a candidate (note-6ba748959a02). Semantic relations become first-class connections in one home, because REIFIED EDGES ARE ADDRESSABLE - linkable, prose-bearing, queryable - which frontmatter lists can never be. Ours are frontmatter lists today, so an edge that wants a rationale has nowhere to put it. The scope line v1 used: reify verifies, refines, addresses, refers, chosen, rejected and supersedes; leave implements code-declared and merge it at read time; leave task wiring in frontmatter, because it is walk machinery rather than book content. The bound, from the RDF reification lesson: reify what carries data, keep high-volume edges cheap.
- PRUNE THE TRACE (owner, note-836fa423019d). A link is a contribution, and that stance now stands in the schema - but nobody has audited edge by edge, and the earlier sweeps mapped honestly by intent. Audit a sample for contrived links, prune what does not contribute WITH THE OWNER, and decide a standing prune step. The owner wants that discussion in a retro, which makes the prune theirs to rule rather than this iteration's to do unattended.
