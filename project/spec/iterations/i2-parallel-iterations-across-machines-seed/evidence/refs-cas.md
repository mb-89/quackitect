---
form: refs-cas
by: agent
signed_off: 2026-08-11T18:44:48.252Z
authors: agent
files:
---

# Evidence form / refs-cas

## current_situation

The refs-cas line composes the purist shape; its note carries the seams, the costs and what it leans on, written at minting and deepened here.

## built

The composition stands in cand-refs-cas, three sections per the item card. HOW IT WORKS - the seams: claiming pushes refs/claims/<iteration> at an identity commit, and the ref transaction is the same first-push-wins lock the claims branch gets from push acceptance; a rejected push is a lost race handled by re-fetch and re-pick; offline the record-then-announce split applies unchanged, the ref created locally and the push waiting; release deletes the ref. WHAT IT COSTS - invisibility: refs outside refs/heads do not show on the forge, do not clone by default, and need a refspec placed on every machine; the claim history vanishes on release unless mirrored, which forks the single-ledger promise. WHAT IT LEANS ON - every machine's git config fetching the custom refspec; the remote accepting pushes under refs/claims/*, which nobody here has measured; delete rights on refs for release, plus a mirror if the history must survive it. The line is drawn to make the claims-branch candidate defend its extra branch - the invisibility cost is the standing case against this one.

## follow_up

The preassign composer is the last owed leg; the cut and the scoring follow.

## anything_else

