---
form: find_prior_art
by: agent
signed_off: 2026-08-11T17:09:04.853Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

The claim design space sweeps the written art: git-native lock patterns, Gerrit's ref namespaces, git notes, the lease-branch pattern, and the fleet-coordination write-ups already in the option corpus from i1's sweep.

## applies

yes — the claim mechanism is a general distributed-coordination problem with decades of written art; skipping the sweep would re-invent a lock

## options

- opt-claim-file-per-iteration
- opt-claim-as-ref-cas
- opt-claim-as-git-note
- opt-seeds-ride-their-stub-branch
- opt-serialised-merge-queue

## literature

- git's own push semantics: atomic ref updates and non-fast-forward rejection - the primitive every option leans on
- Gerrit's refs namespaces (refs/changes) - the written account of coordinating many writers over one remote via refs
- git notes and their merge strategies - metadata attached to commits, with the collision behavior documented
- the lease-branch pattern in CI fleets - a branch push as a distributed lock, first push wins
- assumption-based coordination write-ups already in the corpus from i1's sweep (the multi-agent workspace guide behind opt-serialised-merge-queue)

## shipped

- every git forge runs branch-per-change - the stub-branch announcement is the observed norm, not an invention
- git-lfs ships a lock API whose shape (path, owner, time, force unlock) is exactly the claim's field list - observed in its CLI
- Gerrit runs refs coordination at scale in production - and its UI invisibility outside its own tooling is equally observed

## dry_wells

- a coordinator or lock SERVICE: excluded by the binding context list, not searched - the remote is the serializer by decision
- claim signing and ACLs: deliberately unsearched - the threat model is silence, never malice (owner ruling)
- crdt and operational-transform literature: looked at and set aside - claims are exclusive by design, and convergence machinery answers a question nobody asked

## follow_up

The chart composes the space: claim storage against seed visibility, with the excluded coordinator recorded as the deliberate dry well.

## anything_else

