---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
type: "[[raid]]"
kind: decision
statement: "While a run is bound, a commit or ref that is not an ancestor of the rewind point does not resolve. Nothing is hidden by path."
owner: the owner
trigger: "any new verb that resolves a commit or a ref, or the first benchmark whose report cannot show its guard was exercised"
status: decided
impact: "A path mask hides a folder and leaves the answers everywhere else. Measured: 282 files under project/spec/trace mention i15 or i34, and an iteration writes its requirements and experiments outside its own folder. At the rewind commit those files are unwritten, so the boundary removes rather than conceals."
breaks_how_badly: fatal
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
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
