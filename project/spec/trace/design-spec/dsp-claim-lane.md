---
minted_in: i2
id: dsp-claim-lane
type: "[[design-spec]]"
statement: claiming as record-then-announce over the claims branch — one add-only file per iteration, fetch-and-retry on a lost race, release as a second recorded commit
realizes:
  - "el-claim-ledger"
  - "if-claim-ledger-to-record-store"
files:
  - "project/deliverable/engine/claims.ts"
  - "project/deliverable/engine/gitlane.ts"
  - "project/deliverable/engine/tools.ts"
---

## Responsibility

The claim lifecycle as measured by the spike: record the claim locally
(claims/<iteration>.md with the minted machine id and UTC time), announce
by push in the same act, and treat the remote's push acceptance as the
lock. A rejected push is a lost race: re-fetch, show the holder, offer
the next unclaimed stub. Offline, the record lands without blocking and
the announce waits for the next opportunity; a conflict there surfaces
to the person. Release is a second commit recording who forced and why.

Not this spec's concern: the claimable listing's rendering (the mirror's
specs carry the surface) and the dependency gating inside the record
store (dsp-record-lifecycle carries the entry).

## Interface

The record store opens a record only over a standing claim — the
if-claim-ledger-to-record-store contract. The lane exposes the claim
verb; the machine id comes from the local mint (eight hex, stored
outside git).

## Behavior and constraints

- Add-only claim files: two claims never edit one file, so the branch
  merges without conflict. A lost race is a fetch and a retry. It is never
  a rebase, which SE-C-002 refuses outright.
- The work tree never rides a claim push; the push carries machinery
  artifacts only (the seed stub and the claim file are the two
  sanctioned exceptions to the never-push law).
- No hostname and no personal datum in any pushed artifact.

## Rationale

The winner cand-claims-branch, decided at declare-winner and recorded as
raid-dec-claim-rides-the-claims-branch. The mechanism is pre-verified by
exp-claim-verb-race (9 of 9 local checks); the origin's concurrent half
stays owed to the M7 race test per raid-asm-remote-serializes-claims.
