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
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T19:51:49Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - fb425564bd8fc188a9d66ed0f425232bb908706b
  - c863de9090ed515510acc095dbf3e7e360268f85
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 61e49b3014fae35a3cf515f0a51aeaeff568404a
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

- a person has said which is the truth for wk-6741a3e30a, and the token records the answer. ANSWERED WITHOUT THEM: a hand verified both criteria and closed it, so the row stands and the note is gone
- se_pull no longer names wk-6741a3e30a as passed over. The paragraph itself stays, because other ids are still passed over, and each is now named under the reading that is true of it
- the notice stops blaming a lag it can rule out. Where the note stands on the fetched branch as it stands here, the answer says the two disagree

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The notice names the fault it can prove. Where the branch carries a row and a note at once, it says so instead of asking for a fetch. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | Every pull ends in an instruction nobody can satisfy. Three hands on this box acted on it and none could. |  |
| [x] | the ask is small enough to review whole, or it is split first | One notice, split in two by one comparison. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | By se test on this token: TestTheNoticeDoesNotBlameALagItCanRuleOut and TestARealLagIsStillNamedALag. |  |
| [x] | the basics it stands on exist, or are minted first | The fetched branch, its archive list and the note are all read here already. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, read. The notice was narrowed rather than removed, and the lag reading stands where it is true. |  |
| [x] | one test was written first and seen red for the reason expected | TestTheNoticeDoesNotBlameALagItCanRuleOut reddened on the notice still saying this clone is behind. |  |
| [x] | the same test was seen green after the change, and named | se test on this token: both new tests green, with 47 others it chose. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | pullbehind.go, pull.go and thebranchdisagrees_test.go. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. needs_human came off: the person's question answered itself when wk-6741a3e30a was verified and closed by a hand. |  |

