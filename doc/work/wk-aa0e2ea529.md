---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: restore wiped evidence tables
# where the token stands. The process owns these values.
status: closed
author: worker-zev
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d7011d7e6b0d51bfd3b0527d795b9c573bde1185
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 0f59f56e6e1d7682be01ca4f6b13750e1603679b
# how it ended. Only an ended token carries one.
disposition: dropped
# why it was dropped
reason: "The repair is made and standing: both tokens carry their tables again, restored verbatim from .se/undo and marked with the record they came from. Dropped rather than done because criterion 1 cannot be met as written and the do checklist has no truthful close for note text. The journal's last copy of each file is one apply short of the close. That final apply is the one that ticks the last box, so the pre-submit state is never in the journal. On wk-437137c7a1 the divergence is known and named in the file: the began..ended row was unticked at 20:43:04 and the author ticked it at close, and 0.127s became 0.132s. The gap in the checklist is wk-f5d6b4308e. The gap in the journal is wk-a463727d87."
# what it became. They have to exist.
successors:
  - "[[wk-a463727d87]]"
  - "[[wk-f5d6b4308e]]"
---

## detail

Submitting through the resident engine destroys the evidence tables a worker wrote into the token file. src/engine/pull.go submit sets t.Submission = p.Evidence: the gate reads the tables off the file to decide the move, then overwrites them with the payload's map. Every tick, per-row evidence cell and receipt is lost. A se_pull carrying no evidence carries nil, so the file is rebuilt with the tables gone.

Confirmed first-hand on wk-437137c7a1, closed by me tonight. Its two checklists are gone and in their place sit the three short strings I passed as the evidence map. The frontmatter is perfectly current, so nothing looks wrong.

worker-jory fixed this in source. The resident binary is 7f22e1a3.210143 and predates the fix, so the wipe is live tonight.

This token is the repair and not the fix. Restore the tables onto the tokens I closed tonight from what the engine already recorded, and leave the source fix to whoever holds it.

## proposed action

For each token this actor closed tonight, read the file at its ended hash with git show <ended>:<path>. Take the evidence sections as they stood before the submission, and write them back with se_apply. Read the file back afterwards and confirm the ticks are present. Where the ended snapshot turns out to have been taken after the wipe rather than before, say so on this token. Recover from the .se/undo journal instead, which records the pre-write content of every se_apply.

## done when

- wk-437137c7a1 carries its step 1 and step 2 tables again, with the same ticks and the same per-row text as before the submission. Reading the file back verifies it.
- wk-373ecd88ed carries its tables again on the same terms, or this token records that it was not wiped and needed nothing.
- The restored text came from the snapshot or the undo journal and was not retyped from memory: the command that produced it is named.

