---
minted_in: i2
id: exp-claim-verb-race
type: "[[experiment]]"
statement: Does the claim verb's whole mechanism work — first push wins, the loser sees the holder, an offline claim reconciles, and a force release records — before the M7 build stands on it?
probes:
  - raid-asm-remote-serializes-claims
timebox: three hours; spent under one
form: script
faked: the network and the real forge's receive layer — the pushes were issued sequentially, so the proven property is the rejection semantics on a taken ref, which is order-independent; the origin half against the real forge stays owed at M7
fallback: preassign partitioning holds the fleet while the lock is redesigned — the null line as the degraded mode, per the standing ADR
verdict: holds
measured: 2026-08-11 — 9 of 9 checks pass in 2.9 s; the loser rejects with fetch-first and re-fetch shows the holder; the offline claim rebases and lands (add-only files never conflict); the force release is one more commit and the history keeps who held what; a fresh pull reads all three claims
folds_to: "raid-asm-remote-serializes-claims carries the dated local-half measurement extended to the whole verb; nothing upstream moves — the winner and its ADR stand as decided"
promote: "none — WITHDRAWN 2026-08-16 by i11. It promoted the claim verb's mechanism (record then announce, rebase-and-retry on rejection, release as a second commit) into chunk core-process. i34 deleted the claim system whole, so there is no verb left to promote it into. The 9-of-9 measurement stands and is not retracted; only the promotion is."
chunk: "none — core-process belonged to a drawing that shipped, and the mechanism it would have entered no longer exists"
source_refs:
  - rank-unknowns, the seeded pick of 2026-08-11
  - the owner's sanction of the same day — build the verb early, race it locally, promote on green
---

## Setup

A temp lab: one bare origin, a seeded claims branch, two configured
clones. The claim verb as two acts — record locally, announce by push.
The script is the record's own throwaway at spike/claim-verb-race.ts.

## Result

2026-08-11. 9 of 9 checks pass in 2.9 seconds:

- The race: exactly one of two pushes lands; the loser rejects
  fetch-first, re-fetches, and reads the winner's name off the claim.
- Offline: a claim recorded without the remote is rejected while behind,
  rebases clean (add-only), and lands — nothing lost, nothing forked.
- The force release: one more commit carrying who and why; the file's
  history keeps both the claim and the release.
- The ledger: a fresh pull reads every claim.

The limit is named in `faked`: sequential pushes prove the rejection
semantics, never the forge's concurrent receive behavior. That half is
the M7 race test, as the register entry schedules.
