---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: v4 engine cannot build
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-relay-trial
claimed_at: "2026-09-05T16:08:03Z"
---

## detail

From the verdict on wk-4759d90994.

Commit df31079a ("claims ride a branch on the remote side") landed on origin/v4 carrying a tree that is behind its own parent 5a83c225. It moved the remote side of a claim to refs/heads/se/claims, which is what the token asked for, but its tree also dropped work that 5a83c225 already held in the two files it rewrote:

- src/engine/claim.go lost claimsFile and nextClaimsFile, and src/engine/claimsync.go lost readClaimsIn and parseClaimLines. src/engine/claimsfile_test.go is still on origin/v4 and still calls all four, at lines 51, 52, 54, 67, 89 and 106. So the src/engine test package on origin/v4 does not compile, and no test in it can run.
- The same rewrite dropped the context parameter from gitIn, realGit, Publish, writeTheClaims, SyncClaims and WatchForClaims. realGit now builds its timeout on context.Background(), so a caller that ends early no longer ends the git call it is waiting on.
- The claims ref goes back to carrying the whole note of every token ever claimed, which is what nextClaimsFile was written to stop.

The branch move itself is right and its three tests pass. What is wanted is that move re-applied on top of origin/v4's claim.go and claimsync.go rather than in place of them: keep claimsBranch, theRemoteClaims as a list and fetchTheRemoteClaims, and keep the claims file, the ctx parameters and the four deleted functions.

## proposed action

Re-apply the branch move onto origin/v4's own claim.go and claimsync.go. Take 5a83c225's copies of both files as the base, then put back only what df31079a added: the claimsBranch const and its comment, theRemoteClaims returning a list of two refspecs, fetchTheRemoteClaims, the two push refspecs naming claimsBranch, the three Says strings, and the fetch call sites. Every restored function keeps its ctx parameter, so fetchTheRemoteClaims takes one too. Then go build and go vet over src/engine.

## done when

- src/engine builds and vets on origin/v4, decided by: go build -C src/engine ./... and go vet -C src/engine ./... answer nothing
- claimsFile, nextClaimsFile, readClaimsIn and parseClaimLines are defined again and src/engine/claimsfile_test.go passes, decided by: go test -C src/engine -run 'ClaimsFile' ./... answers ok
- gitIn, realGit, Publish, writeTheClaims, SyncClaims and WatchForClaims take a context again, decided by: se find --regex 'func (gitIn|realGit|Publish|writeTheClaims|SyncClaims|WatchForClaims)\(' shows ctx on each
- the branch move still holds, decided by: go test -C src/engine -run 'ClaimsRideABranch|ClaimReachesTheBareBranch|OldClaimsRefIsStillRead' ./... answers ok

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

