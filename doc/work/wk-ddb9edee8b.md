---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: restore lost evidence
# where the token stands. The process owns these values.
status: open
# tokens that have to close before this can start
depends_on:
  - "[[wk-7887984486]]"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4568c4d4b79bc5eb26c2b6ddb3fc7dc45d124cf4
---

## detail

The step 1, step 2 and step 3 evidence checklists were lost from doc/work/wk-526ac833fb.md and doc/work/wk-c93aac62be.md, the two standard tokens under review. Both files now carry only criterion-shaped summary prose. The author's answered checklists survive in each token's ended commit, 3dcc0969a4252f5aa6ff27005f147363374d4204 and adb8b8457afd5b3fa76620f643a8c1dc89b752cb. This is the data loss already recorded on wk-7887984486, not the author's doing. Restore each set of tables verbatim from git show, keeping the criterion-shaped sections, which carry the lint and placement results the tables do not.

## done when

- doc/work/wk-526ac833fb.md and doc/work/wk-c93aac62be.md each carry the step 1, step 2 and step 3 tables byte-identical to their ended commit: git show <ended>:<file>
- the criterion-shaped evidence sections are still present in both files: se find --regex '^## evidence: criterion' --path doc/work/**
- lint reports no new finding for either file: .bin/se.exe lint

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Two files, three criteria, all decided by reading. | 2 files |
| [x] | every done-when line is decidable, and names the command where one decides it | All three name a command and all three were run: git show plus diff, se_find, .bin/se.exe lint. | 3 run |
| [x] | the basics it stands on exist, or are minted first | Both ended commits 3dcc0969 and adb8b845 exist and git show reads each file out of them. | git show ok |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | rule 14 applied: the premise was checked before acting, so nothing was written over good data. | rule 14 |
| [ ] | one test was written first and seen red for the reason expected | NOT MET. No test written: this is a data restore and its check is a file comparison, not a test. | none |
| [ ] | the same test was seen green after the change, and named | NOT MET. No test, and no change to make one green. | none |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | NOT MET. Nothing changed: the premise was false, so the diff is empty. | 4568c4d4 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Criterion 1 as worded would delete the step 3 verdict. Said in the drop reason. | criterion 1 |

## evidence: the premise

Nothing was lost from either file, so there is nothing to restore. Both carry all three step tables and their criterion sections. Against the ended commits both working files are LARGER, 12945 vs 7855 and 13549 vs 8029 bytes. Diffed by git show, step 1 and step 2 are byte-identical. The only differences are the close itself and step 3, which is ANSWERED here where the commit holds five blank rows. So criterion 1, byte-identical to the ended commit, cannot be met without DELETING the step 3 verdict. Criterion 2 is met. Criterion 3 is met: .bin/se.exe lint exits 0 with 33 finding lines, all against doc/guidance/methods/retro.md and none against either file. Caution: git diff against those commits calls both files deleted, which is a false signal, because both are untracked in git. Compare with git show.

Submitted dropped and refused: blocked on wk-7887984486, which was open and in another actor's hands.

