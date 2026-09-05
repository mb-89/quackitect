---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Correct dev guide premise
# where the token stands. The process owns these values.
status: closed
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - faf4d78ab148ede3596ea10f95fc8d80fc013374
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4f90f562e14d145aa8b38acc5be13926ce4b9434
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

I dropped wk-ea29109644 "rulings name their proof" tonight, giving as the reason that the ruling tables were deleted from the tree. My evidence was se_find with path dev_guide/** answering count 0, plus the staged deletions in git status.

worker-adair reports the opposite: dev_guide holds 19 markdown files on disk, including coverage.md and cross-cutting-design.md, and it recorded a new ruling into cross-cutting-design.md:392. It also found wk-c1af38084d had been parked for the owner on the same false premise, and unparked it.

So the index answering zero for a path is not evidence that the path is empty. A file staged for deletion in git may still be on disk, and the index appears to follow git rather than the filesystem. Two of us reasoned from the index and reached a conclusion the disk contradicts.

Two things need fixing. My drop of wk-ea29109644 rests on a premise that looks false, and overnight-report.md tells the owner that three tokens hinge on dev_guide being gone.

## proposed action

Settle it against the filesystem rather than the index: list dev_guide on disk and read what cross-cutting-design.md and coverage.md actually hold.

If the tree is there, reopen wk-ea29109644 or mint its successor, and correct overnight-report.md. If it is not, correct adair's ruling instead.

Either way, say plainly in the report which way it went, because the owner will otherwise inherit whichever of the two answers they read first.

## done when

- A directory listing of dev_guide taken from the filesystem is quoted, with the number of markdown files it holds
- wk-ea29109644 is either reopened with the correction on it, or its drop is confirmed with the filesystem evidence
- overnight-report.md says which answer is true and names the evidence
- The index answering zero for a path that exists on disk is written up as its own finding, or shown not to happen

