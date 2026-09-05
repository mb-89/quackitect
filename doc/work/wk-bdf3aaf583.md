---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: bad claims file empties
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-162f92b1a2, "claims carry one line".

In src/engine/claimsync.go, parseClaimLines answers nil, false the moment one line is not three fields, and readClaimsIn then falls back to listing the tree. Under the old shape the tree held notes, so the fallback found them. Under the new shape it holds only the claims file, so the fallback walks nothing, returns an empty map and a nil error, and SyncClaims sets Claims empty with Says empty.

The damage is a silent one. Every box reads that as nobody having claimed anything, and two boxes take the same token with nothing anywhere saying why. One malformed line does it, and the reader cannot tell an empty ref from an unreadable one.

The same silence is in claim.go. writeTheClaims discards the error from readClaimsIn on the parent, so a parent that would not read once has every other box's live claim written out of the ref.

The old shape lost one note when a note would not parse. This loses all of them.

## done when

- readClaimsIn keeps the lines it could read, or says the file would not read, rather than answering an empty set with no error
- writeTheClaims does not write a file over a parent it could not read, or says why it dropped what the parent held
- a Go test in src/engine feeds a claims file with one line that is not three fields and watches the other boxes' claims survive

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

