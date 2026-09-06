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
# true when this waits for a person rather than an agent
needs_human: true
claimed_by: f5927132/main
claimed_at: "2026-09-06T10:43:35Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b5ff43e70a6427056eca2680caed0a9d76412bb1
---

## detail

A cloud box writes refs/heads and no other ref namespace. Measured 2026-09-06, one commit object, one session, minutes apart: refs/heads created twice, refs/se 403, refs/notes 403, refs/tags 403, refs/tags/archive 403, and a delete of a branch it had just created 403. So claim.go's push of refs/se/claims and archive.go's push of refs/tags/archive/<id> both fail on every cloud box, every time. claim.go puts the failure in p.Says as prose and carries on, so the box takes a claim, believes it published, and no other box sees it. Two cloud boxes can hold one token and neither knows. claimsync.go treats a failed fetch as never fatal, which is right for a blip and wrong for a box that structurally cannot: offline is temporary, this is permanent, and the code cannot tell them apart.

## proposed action

Move the claim relay onto refs/heads/se-queue, the one namespace a cloud box can write. The mechanism is unchanged: a commit built with a bare index, pushed, the working tree never touched. Only the ref name moves.

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

## approach

The owner has decisions open here, so nothing is cut until they land.

What the branch carries: state only, not whole notes. That is the owner's ruling on 2026-09-06. A row is id, status, holder, claimed_by and claimed_at. The notes stay in doc/work on the code branch, where a person reads them in an editor.

What that costs: a token minted elsewhere is a row here before its note is. It cannot be handed out until the code merge brings the note. The two defects that hurt are both state, so both are still fixed.

The claim relay keeps its mechanism and changes its ref.

A commit is built with a bare index and pushed, exactly as claim.go does now. The working tree is never touched and a conflict on disk stays impossible. Only refs/se/claims becomes a branch under refs/heads.

refs/heads is the one namespace a cloud box can write. That was measured rather than assumed, and it is what makes the relay work at all here.

