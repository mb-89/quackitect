---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: archived note reads open
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nancarrow
claimed_at: "2026-09-05T15:29:51Z"
# tokens that have to close before this can start
depends_on:
  - "[[wk-808abd40a4]]"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 1b74ee0f6c2563f88a852e9311a9c7c6aa735127
---

## detail

Found while doing wk-808abd40a4, which stopped the archive depending on a ref.

An archived row now names two copies of the note: blob, the bytes the close wrote, which git hash-object -w put in the object store where no tree or ref reaches it; and on_branch, the blob the branch's last commit holds for that note, which is the copy every clone gets. readArchived in src/engine/archive.go tries blob first and on_branch after.

on_branch is the note one close short. The close rewrites the frontmatter, setting status to the closing state, writing the disposition and appending to ended, and only then archives and deletes the file. So on a box that has the branch and not the loose blob, readArchivedNote parses the note as it stood before the close and answers a Token whose status is the open one and whose disposition is empty. A caller asking Ended() of that token is told the closed work is not closed.

The row itself carries the disposition, and the archive knows the token closed, so the reader has what it needs and does not use it.

Nothing is lost either way: the body, which is what a reader wants, is the same.

## proposed action

Have readArchivedNote overlay what the row says over what the note text says: the disposition, and the status the close wrote. readArchived already answers which object it read from, so the reader can tell whether it is holding the exact note or the one the branch carries and only correct the second.

## done when

- readArchivedNote answers a token that reads as ended on a box that has only the branch: a test archives a token, reads it back through on_branch alone, and asserts Ended() and the disposition, seen red first
- the row's own fields are what corrects it, so nothing new is stored

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One reader, readArchivedNote, corrected from the row it already had to load, and one test. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | The first names its test, TestAnArchivedNoteReadsClosedOnTheBranchAlone, which reads back through a clone holding the branch and no tags. The second is read off the change, which touches no stored field. |  |
| [x] | the basics it stands on exist, or are minted first | TheArchive, readArchived and Process.EndsAt are all here, and the row already carries the disposition. Nothing had to be minted. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. Rule 12 put the red first, and the proposed action is what was built. |  |
| [x] | one test was written first and seen red for the reason expected | On a copy of the tree with the reader as it stood, the test said `a closed token reads as not ended, with disposition "" and status "open"`. Expected, as the branch holds the note the close later rewrote. |  |
| [x] | the same test was seen green after the change, and named | It passes, and every other Archive test passes beside it on the same copy. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | src/engine/archive.go, readArchivedNote alone, and the new test file. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Token wk-0f91286ac1 already names it. claimsync.go imports internal/logbook, which nothing in the tree carries. |  |

