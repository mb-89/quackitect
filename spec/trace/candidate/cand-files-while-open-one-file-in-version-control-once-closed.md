---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: cand-files-while-open-one-file-in-version-control-once-closed
type: "[[candidate]]"
name: "Archive in git"
statement: "editable files while the iteration is open, then the whole iteration folded into one file and taken off trunk, read back out of version control"
picks:
  - "[[opt-a-closed-iteration-leaves-trunk-as-one-file-read-back-from-version-control]]"
---

## Why this one

IT KEEPS BOTH THINGS THE OTHER FOLD GIVES UP ONE OF. A person can open, edit
and move a work token while the iteration is open. Once it closes, the whole
iteration becomes one file and the tree stops carrying it.

NOTHING IS DISCARDED. Fold at close keeps the evidence and loses the record of
how the work was done. This keeps both, because moving a folder into version
control is not the same act as summarising it.

THE READING HALF NEEDS NO BUILDING. `se_file_search`, `se_file_read` and
`se_file_glob` already take a `ref` and dispatch to git.

## How it works

WHILE THE ITERATION IS OPEN, nothing changes from the round as written. One
markdown file per work token, in the iteration's folder, editable with the
tools a person already has.

AT CLOSE, TWO ACTS HAPPEN TOGETHER. The folder's content becomes one JSONL
file, one line per item. The folder leaves trunk.

READING AN ARCHIVED ITERATION IS A VERSION-CONTROL READ after that, for the
system and for a person alike. The archive renderer is fed rather than reading
the tree, so it is unaffected.

## What it buys, measured

READING OUT OF GIT IS NOT A PENALTY. At 20,000 files `git grep` over HEAD
objects took 114 ms against 161 ms over the worktree. It is faster, not slower.

THE TREE STOPS GROWING. 68 folders, 1,312 files and 9.7 MB stand on trunk today
and nothing opens them. Under work tokens each new iteration would add 320 to
402 files to that.

WRITING GETS CHEAPER WHERE IT HURTS. `git add` over 20,000 separate files took
26,073 ms against 97 ms for one file. Trunk never reaches that number under this
candidate, which is the point.

## What it costs

THE REFERENCES BREAK, and the count is known rather than guessed. 56 paths name
an iteration folder from outside it, across 49 files.

- 12 are source files, and rewriting those is mechanical.
- 37 are prose, sentences a person wrote pointing at an evidence file.

THE PROSE HALF IS THE REAL COST. A regex can rewrite the path. What it cannot
do is keep the result a link that opens something, so 37 citations become
references a reader has to resolve by hand.

FOURTEEN ENGINE FILES READ `spec/iterations` FROM DISC, across 33 sites. Each
one learns the git path or the folded file. `shippedIterations` in
`deliverable/engine/benchmark.ts` is the sharpest, because it builds the
benchmark pool from a directory listing and finds 32 shipped folders today.

THE FOLD IS IRREVERSIBLE IN PRACTICE. History is never rewritten here, so a bad
fold format is carried forever.

## What it argues with

A STANDING MUST REQUIREMENT SAYS THE OPPOSITE, and it is
`req-a-closed-records-folder-stays-on-trunk`. This candidate cannot be built
until the owner withdraws it. That clash is
`raid-iss-the-archive-ruling-reverses-a-blessed-must-requirement`.

THE REQUIREMENT'S OWN REASON IS FALSIFIED. i34 kept the archive on disc so
closed records would stay searchable. The 114 ms measurement says searching
version control is not the cost i34 thought it was.

## What it leans on

THAT ONE ITERATION IS OPEN AT A TIME. The owner ruled it 2026-08-26. Two open
iterations put two folders on trunk and the ceiling doubles, which is survivable
but unmeasured.

THAT NOBODY EDITS AN ARCHIVED ITERATION. The owner ruled that too. A workflow
that needs to correct an old evidence form has no path here short of a new
commit rewriting a line in a JSONL file.

THAT THE FOLD FORMAT IS RIGHT FIRST TIME, because history is never rewritten.
