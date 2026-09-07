---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the card asks merging
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
claimed_by: 7a7c633a/main
claimed_at: "2026-09-07T18:29:26Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 8167296d5132f0de4d592e6448d0c697a16a8b28
---

## detail

util/cage/cloud-runner.md tells a cloud box to merge its group branch into trunk and push trunk. Actionable 12 and its chapter both say so, and the chapter opens with the claim that merging is a write this box may do.

MEASURED on 2026-09-07. The harness permission classifier denied git merge on this box, in every shape it was given, and denied git fetch beside it. A worktree at origin/v4 was prepared and the merge in it was refused.

So the card asks for something the box cannot do, and the box spends the end of its session finding that out. The owner's ruling: if the harness denies it, the guidance should not ask for it.

The push half is not in doubt. Every land in this session went through, and the branch carries the work.

## proposed action

Rewrite actionable 12 and its chapter. The box pushes its branch, writes the marker, and says the branch is ready to merge and sweep. The merge and the delete are both somebody else's, for the same reason.

## done when

- util/cage/cloud-runner.md tells the box to push and hand over, and asks for no merge: se find --regex "merge it into trunk" --path util/cage/cloud-runner.md answers nothing
- the chapter says why, naming the denial rather than the 403: the same file carries the word denies
- the card still says the branch stands and is swept from outside

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A box ends on the marker, which it can write, rather than on a permission nobody there holds. | cloud-runner.md |
| [x] | what breaks if it is never done, and not only that it stays undone | Every cloud box spends the end of its session on a merge the harness denies. | the detail |
| [x] | the ask is small enough to review whole, or it is split first | One actionable and one chapter. | cloud-runner.md |
| [x] | every done-when line is decidable, and names the command where one decides it | Two are se find over the file, the third is read in it. | se find |
| [x] | the basics it stands on exist, or are minted first | The marker is already the closing's own rung, and this box wrote one. | groups/tests.done |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The chapter names what was measured and what it said, rather than asserting a rule. | work-token.md |
| [x] | one test was written first and seen red for the reason expected | The red is this session's own: the merge was denied in every shape, and the card had asked for it. No Go test decides prose. | the detail |
| [x] | the same test was seen green after the change, and named | se find --regex "merge it into trunk" over the card answers nothing, and the battery ran over the change. | se find |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | One file, util/cage/cloud-runner.md. | 8405ccc7 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Chapter 11's last line said retro and merge, and now says retro and hand over. | cloud-runner.md |

