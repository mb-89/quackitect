---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: "delta is the token's"
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-fir
claimed_at: "2026-09-05T15:57:02Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5b93841727d1773def309a5500a270fc1ddad3c9
  - c151dd4489d7eb8800cb5d4e8c20994389164234
  - cb86dd20b5346c819977497ee4435e9bdbd08564
  - 6475aba72b235a6b9ad36ceebacdbb945795d55d
  - c1f60b09855f8d988e5789aa043cdae92f7b119c
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 044ab9e809e7a1129acd76ba4fc2187543a44aed
  - df7de813f9536c8ca98f89fab284d4e08db27c17
  - 61381684afdea32b8edea7b2f1195d4b4e90515f
  - 2bf82a22d4fb1345d7b96e567fe2ce093a8a8a7c
---

## detail

se_test reads a token's delta as the tree against the snapshot taken when the token was taken up.
Where several agents work one tree, that delta is every hand's uncommitted work rather than the holder's change.

The smallest case: a token wrote three files under src/processes, and its delta came back with 57 entries.
The whole battery was ruled, and the reason named util/checks/scripts-are-lf.mjs, a file that token never wrote.
A whole ruling is meant to say this change is wide enough to need everything.
Here it says another hand's is.

Naming a test outright is the escape, because a named test runs whether or not the delta reaches it.
An agent that does not know that gets no answer from the default path.

A worktree per hand answers the same cause from the other side, and it is out of scope here.
The tree stays shared.

## proposed action

Narrow the delta to the files this token wrote, and leave the whole diff where the engine cannot prove the writes.

## done when

- se test --on an id whose applies wrote three files answers three changes, and names no path that token did not write
- with another hand editing util/checks/scripts-are-lf.mjs, the answer for a token that never wrote it is whole false
- a token with no apply on record answers the whole diff, and why_whole names the empty record
- a Go test in src/engine drives the three cases over one tree holding two tokens' writes

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

The engine already records what a token wrote. Every apply journals an entry under the private undo folder carrying the token it was made on and the files it touched.

So the delta is read as it is today, against the snapshot, and then narrowed to the paths that record names for this token.

Where the record names nothing for the token, the whole diff stands and the answer says why. A write the engine cannot prove is a write it will not silently drop.

One function answers both halves: the paths this token wrote, and whether the record held any. Nothing else in the lane changes, so the choosing and the running read the same delta they always did.

The cost, stated: a write made by a shell command rather than an apply is in no journal, so it leaves the delta. Naming a test outright still runs it.

## approach

The delta stays the diff, and choose sees only the changes whose path this token wrote.
The undo journal under .se/undo carries one record per apply, with the token in On, the actor in By and the paths in Files.
deltaSince in src/engine/tests.go keeps reading the diff, and the narrowing sits between it and choose.

Two limits decide the fallback.
A command run under a token can write a file that no apply records.
A retro drains .se/undo into a report folder, so the record does not outlive one.
Where a token has no apply on record, the delta stays the whole diff, and why_whole says so.

wholeTriggers reads the narrowed list, so a whole ruling is earned by the holder's own change.

