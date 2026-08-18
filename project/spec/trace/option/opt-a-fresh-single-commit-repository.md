---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-fresh-single-commit-repository
type: "[[option]]"
statement: the copy is the working tree with the history and the session state stripped, committed once into an empty repository under its new name
cluster: the-bootstrap
question: how a copy is produced
found_by: prior-art
source: this product's own RUNME.ps1 --export, read off the script — the mechanism it actually performs rather than what it is described as doing
---

## Mechanism

FOUR ACTS, AND THE SCRIPT PERFORMS THEM IN ORDER.

- REFUSE unless the destination is empty, and unless all three of folder, name
  and abbreviation were given. Its comment gives the reason for demanding all
  three: "a forgotten argument would ship it to somebody else."
- COPY the working tree, excluding the history, the session state and this
  project's own expedition records.
- RENAME by writing ONE file. Its comment states the rule: "THE PRODUCT NAME IS
  ONE FACT. Nothing below spells it out, so an export renames the whole system
  by writing that one file."
- COMMIT once into a fresh repository.

WHAT IT BUYS. The copy is complete and standalone in one command, and it
carries nothing of the source's past. Its own message says so: "a fresh repo,
one commit, no history."

WHY THE HISTORY IS DROPPED, WHICH IS NOT AN ACCIDENT. The script cites an
owner requirement dated 2026-07-30: the system must run on another machine
WITHOUT this repository's history. The records are excluded for a separate and
stated reason — they describe work the receiver never did, so they are
confusing noise.

WHAT IT COSTS, AND IT IS THE ONE COST THAT MATTERS HERE. A repository sharing
no commit with its source has no merge base, so an ordinary update cannot be
taken. The copy is complete and it is also terminal.

AND THE TWO HALVES OF THE REQUIREMENT COME APART UNDER READING. "Must run
without the history" is a statement about what the copy DEPENDS ON. Dropping
the history satisfies it. So does carrying a history the copy never needs to
consult. Only the second also leaves a channel open, and the requirement as
written does not choose between them.

ONE DETAIL WORTH KEEPING, because it was found the hard way. The exclusion
list carries `.git` as both a directory and a FILE, because a tree checked out
as a git worktree has a `.git` file rather than a folder. The script's comment
records what happened before that was handled: the export re-used the live
repository.
