---
form: claim-pool
by: agent
signed_off: 2026-08-13T12:13:31.740Z
authors: agent
files:
---

# Evidence form / claim-pool

## current_situation

A cloud agent claimed iteration 8 and the claim never appeared. The claims branch did not exist on the remote, and nothing created it, so every claim silently failed.

## built

claims.ts, two changes.

- `claimEntry` no longer returns early when the branch is absent. It falls through to `claimIteration`, which mints the branch from an EMPTY TREE, so the pool opens itself on the first claim anybody makes.
- `fetchClaims` tells two different failures apart. `git fetch origin claims` failing can mean the branch does not exist OR the remote is unreachable, and those want opposite behaviour. A follow-up `ls-remote --heads origin` answers which: it succeeds when the remote is fine and the branch is merely absent.

WHY IT MATTERS BEYOND THIS REPO. This project seeds others. A fresh product would have had the same silent failure on its first claim, forever, with no error to follow.

Cases: tests/claims.test.ts — a `virgin()` helper stands a bare origin with no claims branch, and two cases cover the pool opening and the offline distinction.

## follow_up

Nothing owed. The push acceptance remains the lock, which is what makes the ledger safe across machines.

## anything_else

