---
minted_in: front-desk-2026-08-13
id: req-absent-ledger-is-not-offline
type: "[[requirement]]"
statement: If the remote answers and holds no claim ledger, then the engine shall announce the claim in the same act.
kind: functional
verify_method: test
breaks_if_removed: A missing ledger reads as an unreachable remote. The first claim then records locally and never announces. No peer can see it.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration extension 3b
  - req-offline-claim-reconciles
  - "the owner's ruling 2026-08-13, after a second machine worked i8 with no claim recorded"
priority: must
---

## Detail

- Two conditions look alike from inside a single call, and only one is
  offline.
  - The remote does not answer. That is offline, and
    `req-offline-claim-reconciles` governs it.
  - The remote answers and holds no ledger yet. That is online, and this
    row governs it.
- The boundary belongs in the spec because the two conditions are told
  apart by a deliberate probe, not by the obvious call. Asking the remote
  for a branch that does not exist fails, and that failure says nothing
  about reachability.
- A claim taken online and announced later is a claim no peer can see
  during the window that matters. The lock is the push, so a claim that
  did not push is not a lock.
