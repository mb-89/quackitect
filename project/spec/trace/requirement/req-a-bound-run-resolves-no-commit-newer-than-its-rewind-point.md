---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
type: "[[requirement]]"
statement: "While a benchmark run is bound, the lane shall resolve zero commits that are not ancestors of the run's rewind point, at every verb that reaches history."
kind: quality
verify_method: test
fitness_candidate: true
breaks_if_removed: "The run reads what the original iteration concluded, and every number taken under it is wrong in the flattering direction while the report still looks valid."
breaks_how_badly: fatal
refines:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future
source_refs:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future step 4
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future ext 4a
  - raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers
  - engine/gitlane.ts allowlist read 2026-08-19
priority: must
---

## Scenario

- source: the agent walking a bound benchmark run
- stimulus: any request that names a commit or a ref
- artifact: the git lane and the file lane's ref-reading path
- environment: a throwaway tree standing at the rewind commit, in a clone holding the full history
- response: a commit at or before the rewind point resolves; anything else is refused, naming the ceiling
- response measure: non-ancestor commits resolved = 0, counted across se_git show, se_git log, se_git diff and a ref read through the file lane

## Why every verb and not just se_git

MEASURED 2026-08-19. `engine/gitlane.ts` allows `status`, `log`, `diff`, `show`,
`add`, `commit`, `fetch`, `branch`, `rev-parse`, `restore`, `merge` and
`checkout`. Nothing bounds which commit any of them reaches.

`se_file_read` and `se_file_search` both take a `ref`, which is a second door
to the same bytes. One ceiling, every door, or it is not a ceiling.
