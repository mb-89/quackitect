---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: trivial tokens travel
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 9d0baf1faecc0b203d7caf38a4c6a310df0fa87a
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - fce082ef78fc8652f0dac1586e89572a115b6286
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The cloud reads the tree out of git. doc/work is in git and .se/work is not, so a cloud box can pull a standard token and cannot see a trivial one.

The split comes from one flag. dirFor in src/engine/store.go answers TracedDir for a process whose file says traced, and EphemeralDir for the rest. src/processes/trivial.process.yaml says traced: false, so 108 trivial tokens sit in .se/work where nothing travelling reaches them, this one among them.

SaveToken already moves a token to the folder its process names and removes the file it came from. So the flag and a re-save are the whole move.

The owner says the trivial tokens hold no private data. This token checks that rather than assumes it, because a traced token travels and a name or a datetime on it travels with it.

The note process is also untraced. This token leaves it as it is.

## proposed action

Set traced: true in src/processes/trivial.process.yaml.

Re-save every trivial token, so SaveToken moves each file from .se/work to doc/work.

Read the moved set for private data first: an email address or a clock time. Report what is found and hold back a note that holds one.

Stage the moved paths by name.

## done when

- src/processes/trivial.process.yaml holds traced: true and note.process.yaml is unchanged: git diff --stat src/processes/
- no note under .se/work names the trivial process: se_find regex ^process: \[\[trivial\]\]$ over path .se/work/*.md answers count 0
- doc/work holds 108 notes naming the trivial process: se_find regex ^process: \[\[trivial\]\]$ over path doc/work/*.md answers count 108
- git tracks the moved notes: git status --porcelain doc/work lists 108 added paths
- every trivial note holding a datetime is named to the owner: se_find regex for an email address and for a clock time

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one line of yaml, one test file, and a file move | — |
| [x] | every done-when line is decidable, and names the command where one decides it | each names se_find or a git command, and each was run | the answers are below |
| [x] | the basics it stands on exist, or are minted first | SaveToken already moves rather than copies, and TestASaveMovesRatherThanCopies proves it | ran green, 0.209s |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the token names its problem, its answer, and one criterion a command decides | — |
| [x] | one test was written first and seen red for the reason expected | TestOnlyNotesStayOutOfGit said trivial says traced false, and it should be true | whattravels_test.go:39 |
| [x] | the same test was seen green after the change, and named | TestOnlyNotesStayOutOfGit ok, 0.077s | se_test named it |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 9d0baf1faecc0b203d7caf38a4c6a310df0fa87a | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-2f6d34e845 for the guidance line, wk-7a9da9eec2 for the flag itself | both minted here |

## evidence: what the checks said

The flag. src/processes/trivial.process.yaml says traced: true, and note.process.yaml is untouched.

The move. se_find for the trivial process over .se/work answers 0, and over doc/work answers 108. On disk, 208 notes stay private.

Git. 108 paths in doc/work went from untracked to staged, named one by one. Two source paths are staged beside them.

Private data. No email address anywhere in the moved set. No personal name.

Eight moved notes carry an agent datetime: wk-00b78575d6, wk-024bb669f0, wk-437137c7a1, wk-64421f7772, wk-6cc09dedd4, wk-aa0e2ea529, wk-b166fb07eb and wk-faeaddd8a7.

Each says when an agent acted, or stamps a measurement. None names a person. doc/work already carried such a date, in wk-212909368a, so this is not a new kind of thing in git.

The owner was shown the eight and ruled the move goes ahead. wk-c6d1ac4c5b holds the open question of what a datetime in git may say.

## evidence: what this change does not settle

The owner ruled against the flag itself. The folder is to be the only answer, with the type deciding where a new token is born, and a move that sticks.

That work is wk-7a9da9eec2. This one leaves the tokens where they belong, which that change keeps.

