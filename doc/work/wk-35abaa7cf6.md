---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: findings carry no bucket
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T17:41:38Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 05a59446d61db4ed6d4d38b61fa046a66a8c0860
---

## detail

Fourteen tokens were minted on this box while the queue was narrowed to one bucket, and not one of them carries a bucket. So the queue cannot offer any of them, and the work found inside a bucket has fallen out of it.

MEASURED in September 2026. The filter reads bucket:claims. se ask over doc/work answers fourteen open tokens minted this session with a null bucket: the reviewers' findings, the workers' findings, and this session's own. The queue answered three workable at the same moment.

WHY EVERY HAND MISSED IT. se_work takes title, detail, process, tracked, criteria and six more arguments, and not bucket. So a bucket is a hand edit of YAML front matter after the mint, which is the one thing the engine exists to stop, and no hand does it unprompted.

THE RULE ALREADY SAYS SO. backlog.md rule 5 says a bug found while working a bucket is filed into that bucket. It landed this session, and the session's own output does not follow it.

## proposed action

Write bucket: claims into the front matter of the fourteen, because claims is the bucket each was found in.

Nothing else on them changes. Two of them, wk-62cafe066b and wk-1b756abdce, are already answered by 79c8799, and the hand the queue gives them to will find that and close them on the evidence. That is the right way round, because a token closed by the hand that reads it carries a reading, and one closed from here carries an assertion.

The mint taking a bucket is the prevention, and it is a token of its own.

## done when

- se ask over doc/work answers no open token minted this session with a null bucket
- the queue offers more than the three it offered before: se_pull hands out a token that carried no bucket until now
- each of the fourteen is otherwise unchanged: git diff over them names only the two bucket lines per file

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

