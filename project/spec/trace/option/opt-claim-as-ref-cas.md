---
minted_in: i2
id: opt-claim-as-ref-cas
type: "[[option]]"
statement: the claim is a git ref under refs/claims/, taken by an atomic compare-and-swap push of the ref itself
cluster: cluster-the-record-life
question: what serializes a claim
found_by: prior-art
source: "Gerrit's refs/changes namespace; git update-ref atomicity; the git-lfs lock API's shape"
---

## Mechanism

Claiming pushes refs/claims/<iteration> pointing at the claimant's
identity commit. The ref either lands or rejects - the same atomicity
as a branch push with no file at all. Release deletes the ref.

WHAT IT COSTS HERE: refs outside refs/heads are INVISIBLE in normal
git UIs and clone by default only with configuration - the owner
watching the panel or github sees nothing. The claim's history also
vanishes on release unless mirrored elsewhere, which forks the truth
the ledger promises to keep single.
