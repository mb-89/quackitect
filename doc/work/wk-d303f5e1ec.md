---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the claims change uncommitted
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

A finding on wk-162f92b1a2, "claims carry one line".

The token is done and owed only a verdict, but none of its change is in git. git log --oneline -- src/engine/claim.go src/engine/claimsync.go names four commits, the newest of them an earlier token's, and every hunk of this one is an uncommitted worktree change: claim.go, claimsync.go and claimverb.go modified, claimsfile_test.go untracked, claim_test.go and claimgate_test.go modified.

The damage is two-fold. git diff began..ended, which the verdict step is written against, shows none of it, so the review record points at nothing a later reader can fetch. And when the token closes the engine archives the note into a tag and deletes the file, leaving the code alone in a working tree six other hands are editing, where a reset or a stray checkout takes it with nothing to restore it from.

The tests are green and the change reads well. It just is not anywhere yet.

## done when

- src/engine/claim.go, claimsync.go, claimverb.go, claim_test.go, claimgate_test.go and claimsfile_test.go are committed on v4 and pushed, with a message naming wk-162f92b1a2
- git log --oneline -- src/engine/claimsync.go names a commit carrying the one claims file

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

