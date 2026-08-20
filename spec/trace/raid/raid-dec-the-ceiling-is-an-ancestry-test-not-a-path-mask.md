---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
type: "[[raid]]"
kind: decision
statement: "While a run is bound, a commit or ref that is not an ancestor of the rewind point does not resolve. Nothing is hidden by path."
owner: the owner
trigger: "any new verb that resolves a commit or a ref, or the first benchmark whose report cannot show its guard was exercised"
status: decided
impact: "A path mask hides a folder and leaves the answers everywhere else. Measured: 282 files under spec/trace mention i15 or i34, and an iteration writes its requirements and experiments outside its own folder. At the rewind commit those files are unwritten, so the boundary removes rather than conceals."
breaks_how_badly: fatal
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - cand-the-refusing-run-with-recorded-conditions
  - "probe 2026-08-19: git merge-base --is-ancestor answers 0 forward and 1 reversed"
  - "measured 2026-08-19: 282 trace files mention i15 or i34"
  - "owner ruling 2026-08-19: do not design against a malicious agent"
---

## What it settles

Whether concealment is spatial or temporal. It is temporal.

## The verb it needs, and does not have

`merge-base` is NOT on `se_git`'s allowlist — status, log, diff, show, add,
commit, fetch, branch, rev-parse, restore, merge, checkout. Either the list
grows by one, or the ancestry answer is derived from `log` or `rev-parse`,
which is more code for a worse answer.

## What it does not cover

The benchmark history. That is a separate concealment, keyed on the binding
rather than on time, and it rides three exclusion lists that already disagree.

## Rejected options

- MASK THE ITERATION'S FOLDER. Rejected on a measurement: 282 files under `spec/trace` mention i15 or i34, and an iteration writes its requirements, RAID nodes and experiments outside its own folder.
- MASK THE TRACE CORPUS TOO. Rejected: it blinds the walk to the machine it runs on, which is most of what an agent legitimately reads.
- FILTER THE GIT LANE'S OUTPUT. Rejected: parsing `log` and `show` output to remove commits is more code than a boundary test and fails in ways nobody can enumerate.

## Consequences

- Every verb that resolves a commit or a ref consults the boundary while a run is bound. A new such verb inherits the obligation.
- `se_git`'s allowlist owes one entry, or the ancestry answer is derived from `log` or `rev-parse`.
- The benchmark history is NOT covered by this decision. It needs a separate rule keyed on the binding.

## Amended by the M6 spikes, 2026-08-19 — the boundary stays temporal, the mechanism stops being a test

THE DECISION'S SUBJECT IS UNCHANGED. Concealment is temporal rather than
spatial, and the 282-file measurement that killed the path mask still stands.

WHAT CHANGED IS HOW THE BOUNDARY IS ENFORCED.

- IT WAS AN ANCESTRY TEST on every resolved commit or ref, costing 4229
  microseconds per call, with the cost being the process spawn.
- IT IS NOW THE ABSENCE OF THE OBJECT. A depth-1 fetch stands a tree whose
  history ENDS at the rewind commit. `git rev-parse` on a later commit does not
  resolve, because there is nothing to resolve.

SO THE TITLE'S "ANCESTRY TEST" IS NOW THE FALLBACK RATHER THAN THE DESIGN. It
is what a run would do if a truncated tree could not be stood up.

THE ALLOWLIST GAP FALLS AWAY WITH IT. `merge-base` is still not on `se_git`'s
allowlist and the winning design no longer needs it.

MEASURED, on i33's rewind point: 1723 files, depth 1, i33's own start commit
unresolvable, 0 trace files mentioning i33 against a control of 71 for a
different iteration.
