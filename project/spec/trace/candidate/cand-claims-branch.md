---
minted_in: i2-parallel-iterations-across-machines-seed
id: cand-claims-branch
type: "[[candidate]]"
name: "Claims branch"
statement: "the blessed shape whole: visible file, stub announcement, offline reconcile"
picks:
  - "[[opt-claim-file-per-iteration]]"
  - "[[opt-seeds-ride-their-stub-branch]]"
  - "[[opt-claim-local-then-reconcile]]"
  - "[[opt-checkout-card-claim]]"
  - "[[opt-graph-with-cycles]]"
  - "[[opt-derive-every-view-on-every-look]]"
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-no-installer-clone-the-template]]"
  - "[[opt-the-stray-is-a-log-entry]]"
---

## Why this one

The M1-blessed architecture composed whole: the remote's push order is
the lock, the claim file is the checkout card, and offline claiming
falls out of the local-then-announce split. Every piece is visible in
any git surface - the owner watches claims move on github with no
tooling of ours.

## How it works

Seeding pushes it/<id> as machinery. Claiming writes
claims/<iteration>.md carrying the minted machine id and UTC time on
the claims branch, commits, pushes in the same act. A rejected push is
a lost race: re-fetch, mark taken, offer the next. Offline the push
waits; the local claim binds this machine's own behavior meanwhile.
Release is a person's force commit recording who and why.

## What it costs

One extra branch every machine fetches; a claims history that grows
forever (small text files); the probe already measured the race
mechanism locally - the origin half rides M7.

## What it leans on

- the remote serializes pushes (raid-asm-remote-serializes-claims,
  local half measured 2026-08-11)
- credentials stand on every machine (raid-dep-claim-push-credentials)
