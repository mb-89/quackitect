---
id: se.guidance-retro-independence
kind: guidance
statement: At the retro, distribute open work into INDEPENDENT iterations and record cross-iteration dependencies as plan depends_on; DSM-partition the plan items where the cut is unclear.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
applies_to:
  - process
---

## Rules

- The retro's distribution half: group drained work into iterations that can each run in their own worktree without waiting on a sibling.
- The FIRST cut to look for is mechanical-vs-judgment: separate work that is purely mechanical (engine bug-fixes, determinizers, design-reuse realization) from work that needs the owner's judgment. The mechanical half can then run delegated/unattended (and eventually two-in-parallel per [[se.guidance-worktrees]]); the judgment half waits for the owner.
- Where two candidate iterations share edits, that is a dependency: record it as depends_on on the LATER one so its start refuses until the earlier ships.
- When the independent cut is unclear, partition the plan items DSM-style (cluster the coupled ones, tear the weakest link) rather than guessing.
- Independence is the goal, not a rule to force: some work genuinely belongs in one iteration - say so and keep it whole. [[se.guidance-worktrees]]
