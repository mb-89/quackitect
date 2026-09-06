---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a merge reverts commits
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-berlioz
claimed_at: "2026-09-06T07:43:12Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 0d2bde185ef33f7c864e93a356198ec2cb519f9a
---

## detail

A MERGE RUN IN THE SHARED WORKING TREE SILENTLY REVERTS WORK ALREADY ON THE BRANCH.

Measured on doc/work/wk-963dbf6898.md.

Commit 6b93bad3 trimmed that token and answered its checklists. Merge fa7cde25 has 6b93bad3 as one parent and e3614b17 as the other, and e3614b17 does not touch the file at all. So the merge had one change and no rival, and should have taken 6b93bad3 whole.

Instead its content is the common base plus two half-filled evidence rows, which is neither parent. That is a mid-edit copy out of the shared tree, which wk-c69f2dabc7 measures as behind.

WHAT RUNS IT. Not the engine and not the wake. The session-start hook merges only with the ff-only flag, which cannot make a merge commit. The merges come from hand-written helpers in the scratchpad, where berg-commit.sh and berg-push.sh run git merge over the shared tree before pushing.

WHAT IT COST. The receipts naming pullverb.go and shellsubmits_test.go, and the trim. The draft it restored ran to 233 words against a bound of 200, and a note over a bound cannot be saved. So the engine could not write the token to release a dead hold, and every worker who pulled was asked to rule on it.

Restored by acfbd35d. The strand is wk-7a498f6a2b. Any such merge can revert any landed commit, unannounced.

THE SEVENTEEN. 0f9c1863, bfaeef85, e2bbf15b, 59cbb9a7, fa7cde25, d9decf27, a9b56f4d, 3991d022, b3105cfb, 222621d1, 5a301b5c, 42a14fca, 4cb8b89d, 94e56337, d9725a5e, e5218cc0, ecb7857b.

## proposed action

Stop agents merging in the shared tree at all. Pushing already has a door that is safe, the cherry-pick onto a fresh worktree in cherrypush.sh, and it never touches the shared checkout. Say so where agents are told how to push, so no helper has a reason to run git merge there.

## done when

- the guidance an agent reads before pushing names the cherry-pick door and forbids a merge in the shared tree, decided by reading that guidance
- no helper in the scratchpad runs git merge over the shared tree, decided by a search for that command there
- the branch is walked for other commits whose content matches neither parent, and what is found is named here

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | Landed work stays landed. | — |
| [x] | what breaks if it is never done, and not only that it stays undone | Seventeen of a hundred and fifty-nine merges differ from both parents, over engine source and guidance. | the audit |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Merging leaves the shared tree, and one push door remains. | cherrypush.sh |
| [x] | every done-when line is decidable, and names the command where one decides it | Three lines, two read and one walked. | the audit |
| [x] | the change is small enough to review whole, or it is split first | Small. The seventeen need their own token. | — |
| [x] | the basics it stands on exist, or are minted first | Four are the append-only archive, so seventeen is an upper bound. | — |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

