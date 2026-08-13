---
minted_in: i2-parallel-iterations-across-machines-seed
id: cand-refs-cas
type: "[[candidate]]"
name: "Refs CAS"
statement: "the purist shape: the ref is the claim, no file at all"
picks:
  - "[[opt-claim-as-ref-cas]]"
  - "[[opt-seeds-ride-their-stub-branch]]"
  - "[[opt-claim-local-then-reconcile]]"
  - "[[opt-graph-with-cycles]]"
  - "[[opt-derive-every-view-on-every-look]]"
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-no-installer-clone-the-template]]"
  - "[[opt-the-stray-is-a-log-entry]]"
---

## Why this one

The purist shape: a claim needs no file at all - the ref IS the claim,
and git's ref transaction is the same atomicity with less material. It
is drawn to make the claims-branch candidate defend its extra branch.

## How it works

Claiming pushes refs/claims/<iteration> at an identity commit; the ref
lands or rejects - the ref transaction is the same first-push-wins lock
the claims branch gets from push acceptance. A rejected push is a lost
race: re-fetch the claims refs, see the holder, pick the next stub.
Offline the record-then-announce split applies unchanged: the ref is
created locally and the push waits for the remote. Release deletes the
ref.

## What it costs

Invisibility - refs outside refs/heads do not show on github, do not
clone by default, and need configuration on every machine. The claim's
history vanishes on release unless mirrored, which forks the truth the
ledger promises to keep single. The owner's watching surface goes dark
exactly where the parallel work happens.

## What it leans on

- every machine's git config fetching the custom refspec - one more
  thing the installer must place and drift can silently drop
- the remote accepting pushes under refs/claims/* - a forge may
  restrict non-branch refs, and nobody here has measured ours
- delete rights on refs for release, plus a mirror if the claim
  history must survive it - without one, release erases who held what
