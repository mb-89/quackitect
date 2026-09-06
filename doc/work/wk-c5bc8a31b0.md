---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: clone lags archived tokens
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
# true when this waits for a person rather than an agent
needs_human: true
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T16:40:35Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - fb425564bd8fc188a9d66ed0f425232bb908706b
---

## detail

Every pull on this box ends with the same three lines. wk-6741a3e30a is passed over because origin/v4 has archived it and this clone is behind, and the notice asks for doc/work to be brought into step.

MEASURED, AND THE NOTICE IS WRONG. This clone is not behind on that note. doc/work/wk-6741a3e30a.md is here, at our HEAD, and on origin/v4. One archive row names it here and one names it on origin. Bringing doc/work into step changes nothing.

WHAT IS ACTUALLY WRONG. The row says disposition done. The note says status open and carries no evidence. Both checklists are untouched and every line is unticked. A token was archived as done that nobody worked, and both halves of that are on the branch.

WHY IT WAS NOT DELETED. The write gate refused a delete of a file nothing had read, and it was right. Read whole, the note carries a real unworked ask about two hold shapes the lint reads as claims. Deleting it throws that away on the strength of a row that looks wrong.

WHAT IT COSTS MEANWHILE. The notice repeats on every pull for every hand. A queue that ends every answer with an instruction nobody can act on is one an agent learns to skip.

## proposed action

A person says which is the truth for wk-6741a3e30a: the archive row saying done, or the unworked note saying open.

If the row stands, the note is dropped. Its ask is real and unworked, so it is minted again as a token of its own.

If the note stands, the row is the defect and the archive wants correcting.

Either way the notice is wrong to blame a lag. Where the note stands on the fetched branch as it stands here, the answer says the two disagree.

## done when

- a person has said which is the truth for wk-6741a3e30a, and the token records the answer
- se_pull no longer names wk-6741a3e30a as passed over, and the passed-over paragraph is gone from its answer
- the notice stops blaming a lag it can rule out. Where the note stands on the fetched branch as it stands here, the answer says the two disagree

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

