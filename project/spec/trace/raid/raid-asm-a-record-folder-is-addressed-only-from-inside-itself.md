---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-asm-a-record-folder-is-addressed-only-from-inside-itself
type: "[[raid]]"
kind: assumption
statement: Nothing outside a record's own folder addresses that record by its worktree path, so moving the folder to trunk moves everything that points at it.
owner: the engine maintainer
trigger: before the levelling step moves any record folder onto trunk
status: closed
impact: If something outside the folder holds a worktree path, the levelling silently breaks that reader and the damage shows up as a record whose evidence reads as missing — the exact shape that took i12 four moves to undo.
breaks_how_badly: crippling
how_likely: plausible
probe: "FALSE, probed 2026-08-16. ModelFileSystem.stamp at engine/model-fs.ts:29-35 matches the root against a /.worktrees/(id)/ pattern and writes minted_in from that directory name onto every newly created trace node. That is a reader outside every record folder taking a record's identity from a worktree path, and under one tree the pattern never matches, so the stamp silently stops. Verified live: fn-run-a-governed-walk.resolve-a-path.md carries minted_in i27. EVERYTHING ELSE HELD: every other record path is built as worktreesDir(root) plus the id plus a relative path, so it is derived from the id and follows the folder wherever it goes."
probed: "2026-08-16"
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-f40b2052e59b
  - note-d3c18f094587
weighs_with: none
weighs_against: none
---

## Probe

SEARCH FOR THE ADDRESS, not for the idea. Two searches over the engine and the
tests, and one over the spec.

- `worktreesDir`, `\.worktrees`, and `it\.path` joined with anything under
  `project/spec/`. Every hit is read, and each one is judged: does it reach a
  record folder, and does it reach one it does not own?
- `recordDirFor` and any fallback that derives a record's directory from a
  basename rather than from its id. note-d3c18f094587 records that such a
  fallback exists and resumes scan-first-hit when both branches miss.

WHAT WOULD FALSIFY IT: one reader outside `project/spec/iterations/<id>/` that
builds a path from a worktree rather than from the record id.

WHY IT CANNOT WAIT FOR THE BUILD. The levelling is the step that moves the
folders. A wrong answer discovered afterwards means the move already happened,
and the reader that broke is one nobody was watching.

IT IS CHEAP. Three searches, and the whole engine is 26 files.

## Closed at i34, 2026-08-16 — the one reader it caught was fixed

THE PROBE FOUND EXACTLY ONE VIOLATION and it was repaired in the same
iteration. `ModelFileSystem.stamp` matched the root against a
`/.worktrees/(id)/` pattern to write `minted_in`, which is a reader outside
every record folder taking a record's identity from a worktree path. Under one
tree the pattern would never match and the stamp would silently stop.

IT NOW ASKS THE WALK. The stamp takes the bound record's id from the session
rather than parsing it out of a directory name, so it does not depend on where
the folder sits.

THE PROBE'S OTHER HALF HELD AND IS WHY THE MOVE WAS SAFE: every other record
path is built from the id plus a relative path, so it follows the folder
wherever it goes. All 35 record folders now stand on trunk and no reader broke.

THE ENTRY IS KEPT RATHER THAN DELETED because its probe is the evidence that
the levelling was safe, and a reader asking "how do you know nothing broke"
should find the answer rather than an absence.
