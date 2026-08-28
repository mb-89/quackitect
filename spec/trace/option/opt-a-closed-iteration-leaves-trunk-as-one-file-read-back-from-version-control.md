---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-a-closed-iteration-leaves-trunk-as-one-file-read-back-from-version-control
type: "[[option]]"
statement: fold a whole finished iteration into one file, take it off trunk, and read it back out of version control when somebody wants it
cluster: the-work
found_by: probe
source: "measured 2026-08-26, scratchpad/probe-many-files.mjs and scratchpad/measure-archive-cost.mjs: git grep over HEAD objects 114 ms against 161 ms over the worktree at 20,000 files, and 68 iteration folders holding 1,312 files stand on trunk today"
---

## Mechanism

TWO ACTS AT ONE MOMENT, when an iteration closes.

- ITS CONTENT BECOMES ONE FILE. Every evidence form and every settled work
  token becomes a line, in one JSONL file named for the iteration.
- ITS FOLDER LEAVES TRUNK. The working tree keeps only what is open.

READING AN OLD ITERATION IS A VERSION-CONTROL OPERATION after that, for the
system and for a person alike.

NOTHING IS LOST. The fold keeps what the folder held, rather than summarising
it. That is what separates this from folding work tokens into the evidence,
which discards the token history on purpose.

## What it buys

THE TREE STOPS GROWING. 68 folders, 1,312 files and 9.7 MB stand on trunk today
and none of it is ever opened. Under work tokens the same tree would carry 320
to 402 more files per iteration.

READING IS NOT SLOWER. Measured at 20,000 files, `git grep` over HEAD objects
took 114 ms against 161 ms over the worktree. Reading out of version control is
FASTER at that size, not slower.

THE CAPABILITY ALREADY EXISTS. `se_file_search`, `se_file_read` and
`se_file_glob` all take a `ref` and dispatch to git. Nothing has to be built for
the reading half.

## What it costs

THE REFERENCES BREAK, and the count is known. 56 paths name an iteration folder
from outside it, 53 of them naming a file inside one, across 49 files. 12 are
source and 37 are prose.

THE SOURCE HALF IS MECHANICAL. The prose half is not: a regex can rewrite a path
into a reference to a line in the folded file, and the result stops being a link
that opens anything.

FOURTEEN ENGINE FILES READ `spec/iterations` FROM DISC, across 33 sites. The
benchmark is the sharpest: `shippedIterations` builds its pool from a directory
listing, and finds 32 shipped folders today.

## What it argues with

A STANDING MUST REQUIREMENT SAYS THE OPPOSITE.
`req-a-closed-records-folder-stays-on-trunk`, minted in i34, priority must,
breaks_how_badly crippling. This option cannot be built until that is withdrawn.

I34'S OWN REASON FOR IT WAS SEARCHABILITY, written down in that record: "Closed
records stay searchable, because they stay on disk." The 114 ms measurement
falsifies that reason.

I34'S GOAL WAS THE WORKTREE SYSTEM, not the archive. Its goal line reads "One
tree: iterations and archives live on disk on trunk, worktrees and record
branches are gone." The archive ruling inside it was permissive: "We CAN keep
the archive on disk too."

## Why it is separate from folding at close

FOLDING WORK TOKENS INTO THE EVIDENCE keeps the folder and discards the token
history. THIS keeps everything and moves the folder.

THE TWO COMPOSE. An iteration can fold its tokens into evidence at close AND
then leave trunk as one file. Neither forecloses the other.
