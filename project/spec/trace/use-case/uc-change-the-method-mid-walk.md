---
id: uc-change-the-method-mid-walk
type: "[[use-case]]"
statement: Correct the method while a walk is standing on it, and continue on the corrected version.
actor: stk-engineer-driving-agents
trigger: the step in hand asks for something that should not be asked
precondition: none
guarantee: the walk continues under the corrected method, with both the change and the walk that provoked it on the record
refines:
  - sty-improve-the-machine-mid-walk
killer: false
---

## Main scenario

1. Whoever is walking judges the guidance wrong rather than the work.
2. They change it where the state compiles from, never in a copy of it.
3. They ask the engine to reload; it restarts on the new sources.
4. The walk recomputes its position rather than remembering it, and re-earns whatever it owes.
5. The state opens again under the corrected guidance, with what was already filled still standing.

## Extensions

- 2a. The change is a rigor-matrix row or engine source, and the walk is inside a record. Those compile from the trunk while a bound write lands in the record's worktree, so the change must be made where it compiles or it takes no effect.
- 2b. The change is a method card the walk reads at entry. It is served from the record's tree, so the same split applies in the opposite direction.
- 3a. The reload finds the two trees have diverged. It reports the conflicting files rather than merging them.
- 4a. Something already filled no longer satisfies the corrected guidance. It is marked rather than deleted, naming what moved.
- 5a. The correction is not the walker's to make — it is a settled decision rather than a defect. It becomes a note and the walk continues unchanged.
