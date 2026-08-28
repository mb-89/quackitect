---
form: references-repaired
by: agent
signed_off: 2026-08-28T11:40:35.459Z
authors: agent
files:
---

# Evidence form / references-repaired

## current_situation

The dangling-reference class is empty. It stood at 131 findings when i44 opened and reads 0 now.

The split is 47 repaired against 84 marked unreachable.

Every marker rests on the same check: a git query over the whole history, every ref, for the file the reference expects. All 84 come back with no such file ever having existed here.

## built

### The counts, which raid-risk-the-unreachable-marker-becomes-the-cheap-answer asks for

| | findings |
| --- | --- |
| REPAIRED — the reference now resolves | 47 |
| MARKED UNREACHABLE — the target never existed and cannot be restored | 84 |
| total, at the start | 131 |

THE PLAN EXPECTED ROUGHLY 35 MARKED AGAINST 11 REPAIRED. Both sides came in larger, and the ratio moved further toward the marker. The evidence for every marker is below and is a query anyone can repeat.

### The 47 repairs

- 33 by declaring `cluster-the-benchmark-run`. Eleven function and element nodes named that cluster and it had never been written.
- 13 by declaring four more clusters the i51 option nodes already named: `cluster-the-estimate` (6), `cluster-the-telling` (3), `cluster-the-standing` (2), `cluster-the-handback` (2).
- 1 by following a rename. `req-a-served-instruction-names-the-next-act` pointed at `req-a-refusal-carries-its-remedy`; the node stands as `req-refusal-carries-remedy` and its statement is the same rule.

EACH CLUSTER NODE IS WRITTEN FROM WHAT ITS MEMBERS SAY, never from a fresh judgment. The grouping already existed in the corpus; only the declaration was missing.

### The 84 markers, and what they are

THEY ARE TWO RETIREMENTS AND ONE ABSENCE.

- 20 point at the retired core-and-satellite design and the retired claim ledger. `raid-dec-the-machine-locking-specification-is-retired-whole` says in its own words that no requirement, use case or story describing the claim ledger survives i34.
- 64 point at 14 design candidates, from 57 live nodes. Those are provenance: the decision came out of the candidate, and the candidate was never written to disk here.

### The check behind every marker

`git log --all --diff-filter=AD --name-status` over all 14 candidate paths and over the retired element, interface and use-case paths.

EVERY QUERY ANSWERS EMPTY. Not one of those files has ever existed in this repository, on any ref, at any point in its history.

THAT SETTLES A QUESTION THAT LOOKED LIKE THE OWNER'S. The candidate references appeared to wait on whether the settled option and candidate nodes come back as an archive slice. They do not: an archive can only restore what was once there, and these were never there. Marking is the only answer available, not the cheap one.

### The marker

A node listing an id under `unreachable_refs` in its frontmatter declares that target deliberately gone, and `danglingReferences` in `deliverable/engine/guard.ts` leaves it alone.

ONE ENTRY PER ID, IN THE NODE THAT POINTS. That is what makes the two counts above readable without running anything.

### Two cases guard it

- A reference the node marks unreachable is not reported.
- The marker silences only the ids it names, so a second unmarked reference in the same node still comes back.

### One refactor came with it

`danglingReferences` went one point over the complexity limit when the marker check was added. The id resolution moved out to `referencedId`, which carries the cluster-prefix rule and the looks-like-an-id rule that used to sit inside the loop.

## follow_up

### For arm-the-rest

THE REFERENCE CLASS IS EMPTY, so the check can be armed. `raid-risk-arming-the-reference-sweep-turns-every-boot-red` is mitigated by that order and by nothing else.

### For the validation gate

CHECK THE 84, NOT THE COUNT. The gate's job here is to repeat one git query and see it answer empty. If any of those paths turns out to have existed, that marker is wrong and the finding comes back.

### For whoever writes a candidate next

FOURTEEN CANDIDATES WERE CITED AND NEVER WRITTEN. That is the shape of the defect this class was really reporting: a decision records which candidate it came from, and the candidate file is not always minted alongside it. Nothing in i44 stops that happening again.

### Not done here

The 14 candidate nodes were not reconstructed. Writing them from what cites them would be inventing design history, and the citing nodes do not carry enough to recover it honestly.

## anything_else

