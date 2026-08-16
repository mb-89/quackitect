---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: req-a-records-own-status-decides-whether-it-is-open
type: "[[requirement]]"
statement: The engine shall decide whether a record is open from that record's own status field, and shall not decide it from the presence of a directory.
kind: functional
verify_method: test
breaks_if_removed: Two readers of "is this open" disagree, and a record that shipped keeps standing in the open list.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
  - uc-browse-the-archive
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-e6c318aeb7a2
priority: must
---

## Detail

THE SIX SITES that decide it today, each by asking the filesystem:

- `itList`, engine/iterations.ts:77 — `open: existsSync(path)`.
- `itFind`, engine/iterations.ts:212 — refuses a record it reads as not open.
- `generateIterations`, engine/iterations.ts:764 — the container's filter.
- `generateIterationArchive`, engine/iterations.ts:1208 — the archive's filter.
- `expList`, engine/worktree.ts:246 — the same for expeditions.
- `survey`, engine/survey.ts:65-68 — already reads status AND the directory,
  so it keeps the right half and drops the wrong one.

THE PROOF IT IS ALREADY BROKEN, observed 2026-08-16. i28 carried
`status: shipped` and `closed: 2026-08-15T20:49:48.268Z` while its worktree
still stood. The survey listed 26 iterations and left i28 out; `itList` must
have read it as open. Two readers, one record, opposite answers, silently.

THE TEST IS CHEAP: stamp a record shipped, leave any directory in place, and
assert the container, the archive and the survey all agree.
