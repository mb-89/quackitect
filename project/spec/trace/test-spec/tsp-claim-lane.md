---
minted_in: i2
id: tsp-claim-lane
type: "[[test-spec]]"
statement: A seeded iteration reaches the remote, the pool opens itself on the first claim, and a claim is one atomic pushed file that races first-push-wins, wears its age, reconciles offline, and releases only by a recorded force — verified by test over the claim lane.
method: "test"
verifies:
  - "req-seed-lands-on-remote"
  - "req-pool-opens-on-first-claim"
  - "req-absent-ledger-is-not-offline"
  - "req-claim-is-one-pushed-file"
  - "req-claim-race-first-push-wins"
  - "req-claim-wears-its-age"
  - "req-offline-claim-reconciles"
  - "req-force-release-recorded"
files:
  - "tests/claims.test.ts"
---

## Scope

The claim lane end to end: the pool's own opening, the seed push, the
claim file, the race, the listing, the offline path and the force
release. The lane's privacy and
push-scope constraints are [[tsp-claim-guardrails]]. The origin's own
serialization is the register assumption raid-asm-remote-serializes-claims,
probed by the race step here.

## Approach

Integration level, against a throwaway bare origin per case — no real
remote, no shared fixture. State-based over the claim lifecycle
(unclaimed, claimed, abandoned, released), with the race as the one
genuinely concurrent case: the spike's measured pass
(claim-verb-race, 9 of 9) promotes into the race step. Risk decides
depth: the race row is fatal and gets the deepest cases; the listing
rows get one honest check each.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- a product whose claim ledger does not exist yet has it brought into
  being by the first entry, with no person's act — checked with no remote
  at all, and again against a bare origin that answers and holds no
  ledger
- a remote that answers while carrying no ledger is ONLINE: the first
  claim announces in the same act, and a peer cloning that origin reads
  it
- a seeded stub reaches the origin in the seeding act, and a second
  clone lists it after fetch
- a claim lands as ONE add-only file naming the machine id and the UTC
  time, on the claims branch, pushed in the same act — the work tree
  never rides the push
- two clients pushing one claim name: exactly one accepted, the other
  rejected non-fast-forward; the loser re-fetches, marks the iteration
  taken, and offers the next unclaimed one
- the claimable listing shows claim state, claiming machine id and
  claim age for every iteration
- with the origin unreachable the claim lands locally without blocking
  and pushes at the next opportunity; a conflict at that push surfaces
  to the person, never resolves silently
- a force release refuses without who and why, records both when given,
  and appears on no everyday surface
