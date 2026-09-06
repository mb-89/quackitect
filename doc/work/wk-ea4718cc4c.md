---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Cloud boxes publish nothing
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
# true when this waits for a person rather than an agent
needs_human: true
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b5ff43e70a6427056eca2680caed0a9d76412bb1
---

## detail

A cloud box writes refs/heads and no other ref namespace. Measured 2026-09-06, one commit object, one session, minutes apart: refs/heads created twice, refs/se 403, refs/notes 403, refs/tags 403, refs/tags/archive 403, and a delete of a branch it had just created 403. So claim.go's push of refs/se/claims and archive.go's push of refs/tags/archive/<id> both fail on every cloud box, every time. claim.go puts the failure in p.Says as prose and carries on, so the box takes a claim, believes it published, and no other box sees it. Two cloud boxes can hold one token and neither knows. claimsync.go treats a failed fetch as never fatal, which is right for a blip and wrong for a box that structurally cannot: offline is temporary, this is permanent, and the code cannot tell them apart.

## proposed action

Move the claim relay onto refs/heads/se-queue, the one namespace a cloud box can write. The mechanism is unchanged: a commit built with a bare index, pushed, the working tree never touched. Only the ref name moves.

## approach

Written by main on 2026-09-06, while working wk-8797959d3c, which does not name this token. It is also STALE: the red team found claim.go already publishes on refs/heads/se/claims, so the move this describes has shipped. Do not build from it.

The owner's design, 2026-09-06. Nothing is cut until they give the go.

The split is by path rather than by branch. doc/work goes straight to trunk, always. src goes on a worker's own branch and lands after review. Two things at two speeds, and no second branch is built.

The claim relay keeps its mechanism and changes its target. A commit is built with a bare index, as claim.go does now, and pushed to trunk instead of refs/se/claims. The working tree is never touched.

refs/heads is the one namespace a cloud box can write. That was measured rather than assumed, so trunk is not a preference here.

The archive stays one file. That is the owner's ruling, twice. Every push merges anyway, so an archive conflict is part of a merge already happening. A union merge driver on doc/work/archive.jsonl resolves it without a person, because both sides' lines belong.

## done when

- A claim taken on a cloud box publishes, and the push's exit status is zero.
- A claim taken on one box reaches another, and a test drives two boxes through one remote.
- No push in the claim path names a ref outside refs/heads, and a check over the source says so.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

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

