---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-dec-claim-rides-the-claims-branch
type: "[[raid]]"
kind: decision
statement: A claim is one small add-only file on a dedicated claims branch, and the remote's push acceptance is the lock — visible on any git surface, no machinery of ours in the loop.
owner: the driving agent
trigger: the M7 origin-half race measurement falsifies raid-asm-remote-serializes-claims, or a forge policy breaks add-only push semantics on the claims branch
status: decided
impact: If this proves wrong, the claim lane is redesigned while the fleet falls back to preassign partitioning; the visible-ledger promise and the offline claim path both rest on this shape.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-claim-is-one-pushed-file
  - req-claim-race-first-push-wins
  - req-claim-wears-its-age
  - req-offline-claim-reconciles
  - req-force-release-recorded
  - "the gate-candidates bless and the declared winner cand-claims-branch, 2026-08-11"
---

## The choice

The claims-branch shape won the evaluated set: claiming writes
claims/<iteration>.md (machine id, UTC time) on the claims branch and
pushes in one act. First push wins. Offline, the claim records locally
and announces when the remote returns. Release is a person's force
commit recording who forced and why.

## Rejected options

- [[cand-refs-cas]] — the ref-transaction shape. Same lock, less
  material, but refs outside refs/heads are invisible on the forge and
  the release deletes the history a ledger promises to keep.
- [[cand-preassign]] — the null option. No lock because no race, but
  every rebalance needs the person online, and the vision — agents claim
  work themselves — is the demand it fails by design. It stays on the
  record as the FALLBACK if the serialization assumption falsifies.

## Consequences

- Every machine fetches one extra branch, and the claims history grows
  forever as small text files.
- The claim's lifecycle is readable on any git surface with no tooling
  of ours — the owner watches claims move on the forge.
- The M7 build measures the origin half of the push race before the
  claim lane ships (the probe on raid-asm-remote-serializes-claims).
- The force release stays a deliberate act, never an everyday control.
