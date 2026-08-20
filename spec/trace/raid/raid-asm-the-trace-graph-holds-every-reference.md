---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-the-trace-graph-holds-every-reference
type: "[[raid]]"
kind: assumption
statement: The trace graph holds every reference to a node, so naming what points at a node before deleting it finds all of them.
owner: the driving agent
trigger: decompose-structure, where the deletion warning's source of truth is chosen
probe: false in part. The check is a count i34 already produced. The graph found the frontmatter orphans — two requirements from a deleted function, one must story from a deleted test-spec — and missed 17 prose citations plus 3 engine comments, because trace-coverage reads frontmatter edges rather than bodies. The graph sees roughly a fifth of what a deletion breaks, so the warning must read the graph AND a text sweep.
probed: 2026-08-16
status: open
impact: the deletion warning reports a clean list, the author deletes on it, and the prose citations orphan exactly as before — with a green check now saying they did not.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-a-deletion-names-what-points-at-the-node
  - "i34: 17 dangling citations in the live corpus and 3 in engine comments, found by a vocabulary sweep rather than by the graph"
  - req-broken-trace-is-a-defect
  - note-e0b6769a3a5a
---

## The assumption

req-a-deletion-names-what-points-at-the-node demands that a deletion names
every node referencing the one going. The cheap implementation reads the trace
graph, which the engine already builds for the coverage laws.

## Probe

COUNT WHAT i34'S DELETIONS ORPHANED, split by how each was found. That number
already exists and it is why this entry opens FALSE IN PART rather than
unprobed.

- FOUND BY THE GRAPH: the frontmatter edges. Deleting a function orphaned two
  requirements; deleting a test-spec orphaned a must story. Both surfaced
  through coverage laws, which read `satisfies`, `refines`, `verifies` and the
  rest.
- NOT FOUND BY THE GRAPH: seventeen citations in the live corpus and three in
  engine comments. A verifier found ten by reading; a mechanical sweep over the
  deleted ids found the rest. `trace-coverage.test.ts` reads frontmatter edges,
  not prose, so `[[req-something]]` in a body is invisible to it.

SO THE GRAPH SEES ROUGHLY A FIFTH OF WHAT A DELETION BREAKS.

## What follows for the requirement

THE ROW STANDS; THE IMPLEMENTATION CANNOT BE THE GRAPH ALONE. A warning built
on it would be worse than none, because it would report a clean list and be
believed.

TWO SOURCES ARE NEEDED: the frontmatter edges the graph already holds, and a
text sweep for the id across the corpus. The second is what actually found
i34's twenty, and it costs one search.

note-e0b6769a3a5a ARGUES THE DEEPER FIX — every mention of a mechanism should
be a typed link, so connections are checkable without reading prose. That is
not this iteration's scope, and until it lands the text sweep is the only
honest half.
