---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-entry-binds-worktree
type: "[[requirement]]"
statement: When the walk enters a seeded iteration, the engine shall bind a dedicated worktree and branch to the record and stamp the record started.
kind: functional
verify_method: test
breaks_if_removed: The record has no isolated tree; a second stream or a mid-walk commit lands on trunk.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 2
  - ".se/req-mine-v2.md: Worktrees and parallel streams"
  - ".se/req-mine-v1.md: The ledger and truth"
priority: should
weighs_against:
  - req-unshipped-dependency-refused >
---

## Detail

## Detail

- A leftover worktree or branch from an earlier attempt is adopted, never duplicated.
- The started stamp records the time and the acting role from the fixed stamp vocabulary.
